"""
Celery Task for Unified Analysis Pipeline
Handles: scraping → classification → embeddings → RAG analysis → DB storage
Models are initialized INSIDE the task to avoid memory leaks and PyTorch crashes
"""

import os
import json
import pandas as pd
from typing import Optional, Dict, Any
from datetime import datetime, date
from loguru import logger

# Force CPU-only mode for PyTorch to avoid SIGSEGV crashes
os.environ["TORCH_DEVICE"] = "cpu"
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
# Disable MPS (Metal Performance Shaders) on macOS
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

from app.celery_app import celery_app
from app.scrapers.serpapi_scraper import SerpApiScraper
from app.models import Company
from app.services.advanced_model_service import AdvancedModelService
from app.services.rag_analysis_service import RAGAnalysisService
from app.database_mysql_inspire import inspire_db
from app.config import settings
import redis

# Redis connection for progress tracking with fallback
def get_redis_client():
    """Get Redis client with fallback to localhost for local development"""
    try:
        # Try the configured URL first
        client = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=2)
        # Test connection
        client.ping()
        return client
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as e:
        logger.warning(f"Redis connection failed with {settings.redis_url}, trying localhost fallback: {e}")
        try:
            # Fallback to localhost for local development
            fallback_url = settings.redis_url.replace('redis://redis:', 'redis://localhost:')
            client = redis.from_url(fallback_url, decode_responses=True, socket_connect_timeout=2)
            client.ping()
            logger.info(f"Connected to Redis at {fallback_url}")
            return client
        except Exception as e2:
            logger.error(f"Redis connection failed completely: {e2}")
            # Return None - we'll handle this in the task
            return None

redis_client = get_redis_client()


def update_progress(task_id: str, percent: float, message: str, status: str = "running", extra: Optional[Dict[str, Any]] = None):
    """Update progress in Redis"""
    if not redis_client:
        logger.warning(f"[{task_id}] Redis not available - skipping progress update")
        return
    
    safe_percent = max(0.0, min(100.0, float(percent)))
    progress_data = {
        "job_id": task_id,
        "task_id": task_id,
        "percent": safe_percent,
        "message": message,
        "status": status,
        "step_name": extra.get("stage", "unknown") if extra else "unknown",
        "percent_complete": safe_percent,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    
    if extra:
        progress_data.update(extra)
    
    # Store in Redis with 1 hour expiration
    try:
        redis_client.setex(
            f"analysis_progress:{task_id}",
            3600,
            json.dumps(progress_data)
        )
        logger.info(f"[{task_id}] Progress: {safe_percent:.1f}% - {message}")
    except Exception as e:
        logger.warning(f"[{task_id}] Failed to update progress in Redis: {e}")


def finalize_progress(task_id: str, status: str, message: str):
    """Finalize progress (completed or failed)"""
    update_progress(
        task_id,
        100.0 if status == "completed" else 0.0,
        message,
        status=status
    )


@celery_app.task(bind=True, name="app.tasks.unified_analysis_task.run_unified_analysis", max_retries=2, autoretry_for=(Exception,), retry_backoff=True, retry_backoff_max=60, retry_jitter=True)
def run_unified_analysis(
    self,
    company_name: str,
    company_location: str,
    sme_id: int,
    sme_objective: str,
    max_articles: int,
    company_id: Optional[int],
    job_identifier: str,
) -> Dict[str, Any]:
    """
    Celery task that runs the complete unified analysis pipeline.
    
    This task:
    1. Initializes models INSIDE the task (not globally) to avoid memory leaks
    2. Uses CPU-only mode for PyTorch to prevent SIGSEGV crashes
    3. Handles: scraping → classification → embeddings → RAG analysis → DB storage
    4. Updates progress in Redis throughout execution
    """
    task_id = self.request.id
    
    try:
        logger.info(f"🚀 Starting unified analysis task {task_id} for: {company_name}")
        update_progress(
            job_identifier,
            5.0,
            "Initializing unified analysis pipeline...",
            status="running",
            extra={"stage": "initializing"}
        )
        
        # ============================================
        # STEP 1: Google Scraping (NO LinkedIn)
        # ============================================
        logger.info(f"[{task_id}] 📰 Step 1/4: Scraping company data from Google...")
        update_progress(
            job_identifier,
            10.0,
            "Scraping company articles...",
            status="running",
            extra={"stage": "scraping"}
        )
        
        try:
            # Check if SerpAPI key is configured
            if not settings.serpapi_key:
                finalize_progress(
                    job_identifier,
                    "failed",
                    "SerpAPI key is not configured. Please add SERPAPI_API_KEY to your .env file."
                )
                return {"status": "failed", "error": "SerpAPI key not configured"}
            
            # Create a company object for scraping
            company_obj = Company(
                id=0,
                name=company_name,
                location=company_location,
                website=None,
                industry=None,
                description=None,
                linkedin_url=None,
                last_scraped=None,
                scrape_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Use SerpAPI scraper directly
            serpapi_scraper = SerpApiScraper()
            try:
                # Note: scrape_company is async, but Celery tasks are sync
                # We need to run it in an event loop
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                scrape_result = loop.run_until_complete(serpapi_scraper.scrape_company(company_obj))
                loop.close()
            finally:
                # Ensure session is closed
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(serpapi_scraper.close())
                    loop.close()
                except:
                    pass
            
            # Get all scraped articles (up to max_articles)
            articles_data = scrape_result.news_articles[:max_articles]
            logger.info(f"[{task_id}] 📊 Retrieved {len(articles_data)} articles (max allowed: {max_articles})")
            update_progress(
                job_identifier,
                25.0,
                f"Scraped {len(articles_data)} articles.",
                status="running",
                extra={"stage": "scraping", "articles_found": len(articles_data)},
            )
            
            if not articles_data:
                finalize_progress(
                    job_identifier,
                    "failed",
                    f"No articles found for {company_name}. Please check if the company name and location are correct."
                )
                return {"status": "failed", "error": "No articles found"}
            
            logger.info(f"[{task_id}] ✅ Found {len(articles_data)} articles from Google")
            
        except Exception as e:
            logger.error(f"[{task_id}] Scraping failed: {e}")
            finalize_progress(
                job_identifier,
                "failed",
                f"Failed to scrape articles: {str(e)}"
            )
            return {"status": "failed", "error": str(e)}
        
        # ============================================
        # STEP 2: Classify Articles Based on SME Objectives
        # ============================================
        logger.info(f"[{task_id}] 🔍 Step 2/4: Classifying articles based on SME objectives...")
        update_progress(
            job_identifier,
            35.0,
            "Classifying articles against SME objectives...",
            status="running",
            extra={"stage": "classification"}
        )
        
        try:
            # Convert articles to DataFrame for classification
            articles_list = []
            for article in articles_data:
                articles_list.append({
                    'title': article.title,
                    'content': article.content if article.content else '',
                    'url': article.url,
                    'source': article.source,
                    'published_date': article.published_date.isoformat() if article.published_date else None
                })
            
            df = pd.DataFrame(articles_list)
            
            # Initialize classification model INSIDE the task (not globally)
            logger.info(f"[{task_id}] 📦 Initializing classification model (CPU-only)...")
            
            # Force CPU device BEFORE initializing any models
            import torch
            torch.set_default_device('cpu')
            # Disable MPS explicitly
            if hasattr(torch.backends, 'mps'):
                torch.backends.mps.is_available = lambda: False
            if hasattr(torch, 'mps'):
                torch.mps.is_available = lambda: False
            
            # Set environment variables again (in case they weren't picked up)
            os.environ["TORCH_DEVICE"] = "cpu"
            os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
            os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"
            
            model_service = AdvancedModelService()
            
            # Classify articles based on SME objectives
            classification_results = model_service.classify_articles(
                df=df,
                company_objective=sme_objective,
                use_custom_objective=True
            )
            
            # Get the classified DataFrame from classification results if available
            if 'results' in classification_results:
                df_classified = pd.DataFrame(classification_results['results'])
                if 'url' in df.columns and 'source' in df.columns:
                    df_classified['url'] = df['url'].values
                    df_classified['source'] = df['source'].values
            else:
                df_classified = df
            
            logger.info(f"[{task_id}] ✅ Classified {len(df_classified)} articles")
            update_progress(
                job_identifier,
                50.0,
                f"Classified {len(df_classified)} articles.",
                status="running",
                extra={"stage": "classification", "articles_classified": len(df_classified)},
            )
            
            # Clean up model service to free memory
            del model_service
            
        except Exception as e:
            logger.error(f"[{task_id}] Classification failed: {e}")
            finalize_progress(
                job_identifier,
                "failed",
                f"Failed to classify articles: {str(e)}"
            )
            return {"status": "failed", "error": str(e)}
        
        # ============================================
        # STEP 3: Store Classified Articles in Database
        # ============================================
        logger.info(f"[{task_id}] 💾 Step 3/4: Storing classified articles in database...")
        update_progress(
            job_identifier,
            55.0,
            "Storing classified articles to database...",
            status="running",
            extra={"stage": "storage"}
        )
        
        try:
            # Get or create company (using async database calls in sync context)
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            if company_id:
                company = loop.run_until_complete(inspire_db.get_company(company_id))
                if not company:
                    finalize_progress(
                        job_identifier,
                        "failed",
                        f"Company with ID {company_id} not found"
                    )
                    loop.close()
                    return {"status": "failed", "error": "Company not found"}
                if company.get('sme_id') and company['sme_id'] != sme_id:
                    finalize_progress(
                        job_identifier,
                        "failed",
                        "Company does not belong to this SME"
                    )
                    loop.close()
                    return {"status": "failed", "error": "Access denied"}
                logger.info(f"[{task_id}] 📝 Using provided company ID: {company_name} (ID: {company_id})")
            else:
                company = loop.run_until_complete(inspire_db.get_company_by_name(company_name, sme_id=sme_id))
                if not company:
                    company_id = loop.run_until_complete(inspire_db.create_company(
                        name=company_name,
                        location=company_location,
                        sme_id=sme_id
                    ))
                    logger.info(f"[{task_id}] 📝 Created new company record: {company_name} (ID: {company_id})")
                else:
                    company_id = company['company_id']
                    if not company.get('sme_id'):
                        loop.run_until_complete(inspire_db.update_company(company_id, sme_id=sme_id))
                    logger.info(f"[{task_id}] 📝 Found existing company: {company_name} (ID: {company_id})")
            
            # Store classified articles
            total_classified_articles = len(df_classified)
            articles_stored = 0
            for idx, row in df_classified.iterrows():
                try:
                    prediction_label = row.get('prediction_label', 'Not Relevant')
                    title = row.get('title', 'Untitled')
                    content = row.get('content', 'No content available')
                    url = row.get('url', f'https://example.com/article/{idx}')
                    source = row.get('source', 'Unknown')
                    
                    db_classification = prediction_label if prediction_label in ['Directly Relevant', 'Indirectly Useful', 'Not Relevant'] else 'Not Relevant'
                    
                    article_id = loop.run_until_complete(inspire_db.create_article(
                        company_id=company_id,
                        title=title,
                        url=url or 'https://example.com/article',
                        content=content or '',
                        source=source or 'Unknown',
                        published_date=None,
                        relevance_score=row.get('confidence_score', 0.0),
                        classification=db_classification
                    ))
                    articles_stored += 1
                except Exception as e:
                    logger.warning(f"[{task_id}] Failed to store article: {e}")
            
            loop.close()
            
            logger.info(f"[{task_id}] ✅ Stored {articles_stored} articles in database")
            update_progress(
                job_identifier,
                70.0,
                f"Stored {articles_stored} articles in database.",
                status="running",
                extra={
                    "stage": "storage",
                    "articles_stored": articles_stored,
                    "articles_total": total_classified_articles,
                },
            )
            
        except Exception as e:
            logger.error(f"[{task_id}] Database storage failed: {e}")
            finalize_progress(
                job_identifier,
                "failed",
                f"Failed to store articles: {str(e)}"
            )
            return {"status": "failed", "error": str(e)}
        
        # ============================================
        # STEP 4: RAG Analysis (10 Categories)
        # ============================================
        logger.info(f"[{task_id}] 🤖 Step 4/4: Running RAG analysis (10 categories)...")
        update_progress(
            job_identifier,
            75.0,
            "Running RAG analysis (10 categories)...",
            status="running",
            extra={"stage": "rag_analysis"}
        )
        
        try:
            # Convert DataFrame to list of dicts for RAG analysis
            articles_for_analysis = []
            for _, row in df_classified.iterrows():
                articles_for_analysis.append({
                    'title': row['title'],
                    'content': row['content']
                })
            
            # Initialize RAG service INSIDE the task (not globally) with CPU-only mode
            logger.info(f"[{task_id}] 📦 Initializing RAG service (CPU-only, models loaded in task)...")
            
            # Force CPU device for SentenceTransformer (ensure it's set)
            import torch
            torch.set_default_device('cpu')
            # Disable MPS explicitly
            if hasattr(torch.backends, 'mps'):
                torch.backends.mps.is_available = lambda: False
            if hasattr(torch, 'mps'):
                torch.mps.is_available = lambda: False
            
            rag_service = RAGAnalysisService(
                milvus_host=settings.milvus_host,
                milvus_port=settings.milvus_port,
                ollama_host=settings.ollama_base_url,
                llm_model=settings.ollama_model
            )
            
            # Define progress callback for RAG analysis (75% to 90% = 15% range, 10 categories = 1.5% each)
            def rag_progress_callback(category_name: str, category_num: int, total_categories: int):
                """Progress callback for RAG category extraction"""
                # Progress ranges from 75% (start) to 90% (end)
                # Each category adds 1.5% progress
                base_progress = 75.0
                progress_per_category = 15.0 / total_categories
                current_progress = base_progress + (category_num * progress_per_category)
                
                update_progress(
                    job_identifier,
                    current_progress,
                    f"Extracting {category_name} ({category_num}/{total_categories})...",
                    status="running",
                    extra={
                        "stage": "rag_analysis",
                        "category_name": category_name,
                        "category_num": category_num,
                        "total_categories": total_categories,
                    },
                )
            
            # Run RAG analysis (comprehensive extraction of 10 categories)
            logger.info(f"[{task_id}] 🔬 Analyzing {len(articles_for_analysis)} articles with RAG...")
            update_progress(
                job_identifier,
                75.0,
                "Starting RAG analysis (10 categories)...",
                status="running",
                extra={"stage": "rag_analysis", "category_num": 0, "total_categories": 10},
            )
            
            try:
                rag_results = rag_service.analyze_comprehensive(
                    articles=articles_for_analysis,
                    company_name=company_name,
                    sme_objective=sme_objective,
                    progress_callback=rag_progress_callback
                )
                
                # Extract the analysis results
                analysis_results = rag_results['analysis']
                rag_metadata = rag_results['metadata']
            except Exception as rag_exc:
                # If RAG analysis fails due to Milvus or other issues, try to handle it gracefully
                error_msg = str(rag_exc)
                error_type = type(rag_exc).__name__
                error_repr = repr(rag_exc)
                
                logger.error(f"[{task_id}] RAG analysis exception ({error_type}): {rag_exc}")
                logger.error(f"[{task_id}] Error message: {error_msg}")
                logger.error(f"[{task_id}] Error repr: {error_repr}")
                
                # Check if it's a Milvus error - check multiple ways to be sure
                is_milvus_error = (
                    "Milvus" in error_msg or 
                    "Milvus" in error_repr or
                    "collection" in error_msg.lower() or 
                    "MilvusException" in error_type or
                    "MilvusException" in error_repr or
                    "can't find collection" in error_msg.lower()
                )
                
                if is_milvus_error:
                    logger.warning(f"[{task_id}] ⚠️ Milvus error detected. Attempting to disable Milvus and retry with in-memory storage...")
                    
                    # Try to disable Milvus and retry once with in-memory storage
                    try:
                        rag_service.milvus_available = False
                        rag_service.collection = None
                        # Also clear any vector cache that might reference Milvus
                        if hasattr(rag_service, 'vector_cache'):
                            # Clear any Milvus-related cache entries
                            for key in list(rag_service.vector_cache.keys()):
                                entry = rag_service.vector_cache.get(key)
                                if entry and entry.get('vector_storage') == 'milvus':
                                    del rag_service.vector_cache[key]
                        
                        logger.info(f"[{task_id}] Retrying RAG analysis with Milvus disabled (in-memory only)...")
                        
                        rag_results = rag_service.analyze_comprehensive(
                            articles=articles_for_analysis,
                            company_name=company_name,
                            sme_objective=sme_objective,
                            progress_callback=rag_progress_callback
                        )
                        
                        # Extract the analysis results
                        analysis_results = rag_results['analysis']
                        rag_metadata = rag_results['metadata']
                        logger.info(f"[{task_id}] ✅ RAG analysis succeeded with in-memory storage after Milvus failure")
                    except Exception as retry_exc:
                        # If retry also fails, re-raise the original exception
                        logger.error(f"[{task_id}] ❌ RAG analysis retry with in-memory storage also failed: {retry_exc}")
                        raise rag_exc  # Re-raise the original exception
                else:
                    # For non-Milvus errors, just re-raise
                    logger.warning(f"[{task_id}] Non-Milvus error detected, re-raising: {error_type}")
                    raise
            
            logger.info(f"[{task_id}] ✅ RAG analysis completed")
            logger.info(f"[{task_id}]    Items extracted: {rag_metadata['total_items_extracted']}")
            logger.info(f"[{task_id}]    Average confidence: {rag_metadata['average_confidence']:.2%}")
            logger.info(f"[{task_id}]    Duration: {rag_metadata['duration_seconds']:.1f}s")
            
            update_progress(
                job_identifier,
                90.0,
                "RAG analysis complete. Preparing results...",
                status="running",
                extra={
                    "stage": "rag_analysis",
                    "items_extracted": rag_metadata['total_items_extracted'],
                    "average_confidence": rag_metadata['average_confidence'],
                },
            )
            
            # Clean up RAG service to free memory
            del rag_service
            
        except Exception as e:
            logger.error(f"[{task_id}] RAG analysis failed: {e}")
            finalize_progress(
                job_identifier,
                "failed",
                f"RAG analysis failed: {str(e)}"
            )
            return {"status": "failed", "error": str(e)}
        
        # ============================================
        # STEP 5: Store RAG Analysis in Database
        # ============================================
        logger.info(f"[{task_id}] 💾 Storing RAG analysis results in database...")
        update_progress(
            job_identifier,
            95.0,
            "Storing RAG analysis results...",
            status="running",
            extra={"stage": "finalizing"}
        )
        
        try:
            # Format RAG results for database storage
            def format_category_for_db(category_result):
                """Format a RAG category result for database storage, truncating if too large"""
                if not category_result or 'data' not in category_result:
                    return ''
                max_bytes = 50 * 1024  # 50KB per field
                json_str = json.dumps(category_result['data'], indent=2)
                
                encoded = json_str.encode('utf-8')
                if len(encoded) > max_bytes:
                    truncated = encoded[:max_bytes]
                    while truncated and truncated[-1] & 0x80 and not (truncated[-1] & 0x40):
                        truncated = truncated[:-1]
                    json_str = truncated.decode('utf-8', errors='ignore')
                    open_braces = json_str.count('{') - json_str.count('}')
                    if open_braces > 0:
                        json_str += '\n' + '  ' * (open_braces - 1) + '}' * open_braces
                    logger.warning(f"[{task_id}] Truncated category data from {len(encoded)} to {len(truncated)} bytes")
                
                return json_str
            
            # Use async database calls
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # STEP 5A: Save Company Info, Strengths, Opportunities in COMPANY table
            try:
                logger.info(f"[{task_id}] 💾 Saving Company Info, Strengths, Opportunities to company table...")
                
                company_info_data = analysis_results.get('company_info', {})
                strengths_data = analysis_results.get('strengths', {})
                opportunities_data = analysis_results.get('opportunities', {})
                
                if isinstance(company_info_data, list):
                    company_info_data = {'data': company_info_data}
                elif not isinstance(company_info_data, dict):
                    company_info_data = {}
                    
                if isinstance(strengths_data, list):
                    strengths_data = {'data': strengths_data}
                elif not isinstance(strengths_data, dict):
                    strengths_data = {}
                    
                if isinstance(opportunities_data, list):
                    opportunities_data = {'data': opportunities_data}
                elif not isinstance(opportunities_data, dict):
                    opportunities_data = {}
                
                company_info_str = format_category_for_db(company_info_data)
                strengths_str = format_category_for_db(strengths_data)
                opportunities_str = format_category_for_db(opportunities_data)
                
                industry = None
                if company_info_data and isinstance(company_info_data, dict) and 'data' in company_info_data:
                    data = company_info_data['data']
                    if isinstance(data, dict):
                        industry = data.get('industry')
                
                loop.run_until_complete(inspire_db.update_company(
                    company_id=company_id,
                    company_info=company_info_str,
                    strengths=strengths_str,
                    opportunities=opportunities_str,
                    industry=industry if industry else None
                ))
                
                logger.info(f"[{task_id}] ✅ Saved Company Info, Strengths, Opportunities to company table")
                
            except Exception as e:
                logger.error(f"[{task_id}] Failed to save company intelligence: {e}")
            
            # STEP 5B: Save remaining 7 categories in ANALYSIS table
            try:
                analysis_id = loop.run_until_complete(inspire_db.create_analysis(
                    company_id=company_id,
                    latest_updates=format_category_for_db(analysis_results.get('latest_updates')),
                    challenges=format_category_for_db(analysis_results.get('challenges')),
                    decision_makers=format_category_for_db(analysis_results.get('decision_makers')),
                    market_position=format_category_for_db(analysis_results.get('market_position')),
                    future_plans=format_category_for_db(analysis_results.get('future_plans')),
                    action_plan=format_category_for_db(analysis_results.get('action_plan')),
                    solutions=format_category_for_db(analysis_results.get('solution')),
                    analysis_type='RAG',
                    date_analyzed=date.today(),
                    status='COMPLETED'
                ))
                
                logger.info(f"[{task_id}] ✅ Stored RAG analysis in analysis table (ID: {analysis_id})")
                
            except Exception as e:
                logger.error(f"[{task_id}] Failed to store analysis: {e}")
            
            loop.close()
            
        except Exception as e:
            logger.error(f"[{task_id}] Database storage failed: {e}")
            # Continue anyway, analysis is complete
        
        logger.info(f"[{task_id}] ✅ Unified analysis with RAG completed successfully!")
        finalize_progress(
            job_identifier,
            "completed",
            f"Analysis completed for {company_name}.",
        )
        
        # Store final result in Redis
        result_data = {
            "status": "completed",
            "company_id": company_id,
            "company_name": company_name,
            "articles_found": len(articles_data),
            "articles_stored": articles_stored,
            "rag_metadata": rag_metadata
        }
        
        if redis_client:
            try:
                redis_client.setex(
                    f"analysis_result:{job_identifier}",
                    3600,
                    json.dumps(result_data)
                )
            except Exception as e:
                logger.warning(f"[{task_id}] Failed to store result in Redis: {e}")
        
        return result_data
        
    except Exception as e:
        logger.error(f"[{task_id}] Unified analysis failed: {e}")
        finalize_progress(
            job_identifier,
            "failed",
            f"Unified analysis failed: {str(e)}",
        )
        return {"status": "failed", "error": str(e)}

