from fastapi import APIRouter, HTTPException, Form
from typing import Optional, Dict, Any
from app.models import APIResponse
from app.scrapers.serpapi_scraper import SerpApiScraper
from app.models import Company
from app.services.advanced_model_service import AdvancedModelService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.services.rag_analysis_service import RAGAnalysisService
from app.database_mysql_inspire import inspire_db
from app.config import settings
from loguru import logger
import pandas as pd
import io
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# In-memory progress tracker for long-running analyses.
# Keys are job IDs supplied by the client; values contain progress metadata.
analysis_progress: Dict[str, Dict[str, Any]] = {}


def update_analysis_progress(
    job_id: Optional[str],
    percent: float,
    message: str,
    status: str = "running",
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Update the current progress for a running unified analysis.
    """
    if not job_id:
        return

    safe_percent = max(0.0, min(100.0, float(percent)))
    progress_payload: Dict[str, Any] = {
        "job_id": job_id,
        "percent": safe_percent,
        "message": message,
        "status": status,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }

    if extra:
        progress_payload.update(extra)

    analysis_progress[job_id] = progress_payload


def finalize_analysis_progress(job_id: Optional[str], status: str, message: str) -> None:
    """
    Mark an analysis job as completed or failed and optionally clean up later.
    """
    if not job_id:
        return

    update_analysis_progress(
        job_id=job_id,
        percent=100.0,
        status=status,
        message=message,
    )

@router.post(
    "/unified-analysis",
    summary="Unified Company Analysis (Scrape + Classify + RAG Analysis)",
    description="""
    **Complete one-endpoint solution for company analysis with RAG (Retrieval-Augmented Generation).**
    
    This endpoint orchestrates a complete analysis pipeline:
    
    **1. Google Scraping** (No LinkedIn)
    - Scrapes company news and articles using SerpAPI/Google
    - Retrieves up to 100 articles about the company
    
    **2. Article Classification Based on SME Objectives**
    - Classifies articles into: Directly Relevant, Indirectly Useful, Not Relevant
    - Uses your SME objectives to determine relevance
    - Stores classified articles in the database
    
    **3. RAG Analysis (10 Categories)**
    - Analyzes the company using RAG (Retrieval-Augmented Generation)
    - Extracts 10 intelligence categories:
      1. Latest Updates
      2. Challenges
      3. Decision Makers
      4. Market Position
      5. Future Plans
      6. Action Plan (SME engagement steps)
      7. Solution (SME offerings for their needs)
      8. Company Info (5-sentence description)
      9. Strengths (competitive advantages)
      10. Opportunities (growth areas)
    - Uses semantic retrieval + Llama 3.1 for extraction
    - Stores results in the database
    
    **Step-by-step process:**
    1. Scrape company data from Google (SerpAPI)
    2. Classify articles based on your SME objectives
    3. Store classified articles in the `article` table
    4. Run RAG analysis (10 categories with vector retrieval)
    5. Store analysis results in the `analysis` table
    
    **Important:**
    - Only uses Google/SerpAPI (no LinkedIn scraping)
    - Classification happens BEFORE analysis
    - RAG provides actionable, SME-personalized insights
    - Both articles and analysis are stored in database
    - Uses `sme_id` to link everything to your SME
    """,
    response_description="Unified analysis with RAG completed successfully"
)
async def unified_company_analysis(
    company_name: str = Form(..., description="Name of the company to analyze"),
    company_location: str = Form(..., description="Location of the company"),
    sme_id: int = Form(..., description="Your SME ID"),
    sme_objective: str = Form(..., description="Your SME's objectives and capabilities"),
    max_articles: int = Form(100, description="Maximum number of articles to scrape (default: 100)"),
    company_id: Optional[int] = Form(None, description="Optional: Existing company ID to use (if not provided, will search by name)"),
    job_id: Optional[str] = Form(None, description="Optional: Client-supplied job identifier for progress tracking"),
):
    """
    Unified endpoint that:
    1. Scrapes company data from Google (SerpAPI)
    2. Classifies articles based on SME objectives
    3. Stores classified articles in database
    4. Performs comprehensive LLM analysis
    5. Stores analysis results in database
    """
    try:
        job_identifier = job_id or f"{sme_id}-{company_name}-{uuid4().hex}"
        update_analysis_progress(
            job_identifier,
            10.0,
            "Initializing unified analysis pipeline...",
            extra={"stage": "initializing"},
        )
        logger.info(f"🚀 Starting unified analysis for: {company_name}")
        
        # ============================================
        # STEP 1: Google Scraping (NO LinkedIn)
        # ============================================
        logger.info("📰 Step 1/3: Scraping company data from Google...")
        update_analysis_progress(
            job_identifier,
            20.0,
            "Scraping company articles...",
            extra={"stage": "scraping"},
        )
        
        try:
            # Check if SerpAPI key is configured
            from app.config import settings
            if not settings.serpapi_key:
                raise HTTPException(
                    status_code=500,
                    detail="SerpAPI key is not configured. Please add SERPAPI_API_KEY to your .env file. Get a free key at https://serpapi.com/"
                )
            
            # Create a company object for scraping
            from datetime import datetime as dt
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
                created_at=dt.utcnow(),
                updated_at=dt.utcnow()
            )
            
            # Use SerpAPI scraper directly
            serpapi_scraper = SerpApiScraper()
            scrape_result = await serpapi_scraper.scrape_company(company_obj)
            
            # Get all scraped articles (up to max_articles)
            articles_data = scrape_result.news_articles[:max_articles]
            logger.info(f"📊 Retrieved {len(articles_data)} articles (max allowed: {max_articles})")
            update_analysis_progress(
                job_identifier,
                30.0,
                f"Scraped {len(articles_data)} articles.",
                extra={"stage": "scraping", "articles_found": len(articles_data)},
            )
            
            if not articles_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No articles found for {company_name}. Please check if the company name and location are correct."
                )
            
            logger.info(f"✅ Found {len(articles_data)} articles from Google")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to scrape articles: {str(e)}"
            )
        
        # ============================================
        # STEP 2: Classify Articles Based on SME Objectives
        # ============================================
        logger.info("🔍 Step 2/3: Classifying articles based on SME objectives...")
        update_analysis_progress(
            job_identifier,
            40.0,
            "Classifying articles against SME objectives...",
            extra={"stage": "classification"},
        )
        
        # Convert articles to DataFrame for classification
        articles_list = []
        for article in articles_data:
            # Access attributes from NewsArticle model
            articles_list.append({
                'title': article.title,
                'content': article.content if article.content else '',
                'url': article.url,
                'source': article.source,
                'published_date': article.published_date.isoformat() if article.published_date else None
            })
        
        df = pd.DataFrame(articles_list)
        
        # Initialize classification model
        model_service = AdvancedModelService()
        
        # Classify articles based on SME objectives
        classification_results = model_service.classify_articles(
            df=df,
            company_objective=sme_objective,
            use_custom_objective=True
        )
        
        # Get the classified DataFrame from classification results if available
        if 'results' in classification_results:
            # Recreate df from classification results
            df_classified = pd.DataFrame(classification_results['results'])
            # Add url and source from original df
            if 'url' in df.columns and 'source' in df.columns:
                df_classified['url'] = df['url'].values
                df_classified['source'] = df['source'].values
        else:
            df_classified = df
        
        logger.info(f"✅ Classified {len(df_classified)} articles")
        update_analysis_progress(
            job_identifier,
            50.0,
            f"Classified {len(df_classified)} articles.",
            extra={"stage": "classification", "articles_classified": len(df_classified)},
        )
        
        # Check if prediction_label exists in df_classified
        if 'prediction_label' in df_classified.columns:
            logger.info(f"   - Directly Relevant: {len(df_classified[df_classified['prediction_label'] == 'Directly Relevant'])}")
            logger.info(f"   - Indirectly Useful: {len(df_classified[df_classified['prediction_label'] == 'Indirectly Useful'])}")
            logger.info(f"   - Not Relevant: {len(df_classified[df_classified['prediction_label'] == 'Not Relevant'])}")
        else:
            logger.warning("⚠️  'prediction_label' column not found in DataFrame")
            logger.info(f"   Available columns: {df_classified.columns.tolist()}")
        
        # ============================================
        # STEP 3: Store Classified Articles in Database
        # ============================================
        logger.info("💾 Step 3/3: Storing classified articles in database...")
        update_analysis_progress(
            job_identifier,
            60.0,
            "Storing classified articles to database...",
            extra={"stage": "storage"},
        )
        
        # First, get or create company
        # If company_id is provided, use it directly (e.g., from frontend after creating company)
        if company_id:
            company = await inspire_db.get_company(company_id)
            if not company:
                raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")
            # Verify it belongs to the correct SME
            if company.get('sme_id') and company['sme_id'] != sme_id:
                raise HTTPException(status_code=403, detail="Company does not belong to this SME")
            logger.info(f"📝 Using provided company ID: {company_name} (ID: {company_id})")
        else:
            # Search by name, filtered by sme_id to avoid finding other SMEs' companies
            company = await inspire_db.get_company_by_name(company_name, sme_id=sme_id)
            
            if not company:
                # Create company with sme_id
                company_id = await inspire_db.create_company(
                    name=company_name,
                    location=company_location,
                    sme_id=sme_id
                )
                logger.info(f"📝 Created new company record: {company_name} (ID: {company_id})")
            else:
                company_id = company['company_id']
                # Update company with sme_id if not set
                if not company.get('sme_id'):
                    await inspire_db.update_company(company_id, sme_id=sme_id)
                logger.info(f"📝 Found existing company: {company_name} (ID: {company_id})")
        
        # Store classified articles
        total_classified_articles = len(df_classified)
        articles_stored = 0
        for idx, row in df_classified.iterrows():
            try:
                # Get prediction label with fallback
                prediction_label = row.get('prediction_label', 'Not Relevant')
                
                # Get values with fallbacks for optional fields
                title = row.get('title', 'Untitled')
                content = row.get('content', 'No content available')
                url = row.get('url', f'https://example.com/article/{idx}')
                source = row.get('source', 'Unknown')
                
                # Use prediction_label directly (database expects: 'Directly Relevant', 'Indirectly Useful', 'Not Relevant')
                db_classification = prediction_label if prediction_label in ['Directly Relevant', 'Indirectly Useful', 'Not Relevant'] else 'Not Relevant'
                
                # Note: sentiment column doesn't exist in current database, so we skip it
                article_id = await inspire_db.create_article(
                    company_id=company_id,
                    title=title,
                    url=url or 'https://example.com/article',
                    content=content or '',
                    source=source or 'Unknown',
                    published_date=None,
                    relevance_score=row.get('confidence_score', 0.0),
                    classification=db_classification
                )
                articles_stored += 1
            except Exception as e:
                logger.warning(f"Failed to store article: {e}")
        
        logger.info(f"✅ Stored {articles_stored} articles in database")
        update_analysis_progress(
            job_identifier,
            70.0,
            f"Stored {articles_stored} articles in database.",
            extra={
                "stage": "storage",
                "articles_stored": articles_stored,
                "articles_total": total_classified_articles,
            },
        )
        
        # ============================================
        # STEP 4: RAG Analysis (10 Categories)
        # ============================================
        logger.info("🤖 Step 4/4: Running RAG analysis (10 categories)...")
        update_analysis_progress(
            job_identifier,
            80.0,
            "Running RAG analysis (10 categories)...",
            extra={"stage": "rag_analysis"},
        )
        
        # Convert DataFrame to list of dicts for RAG analysis
        articles_for_analysis = []
        for _, row in df_classified.iterrows():
            articles_for_analysis.append({
                'title': row['title'],
                'content': row['content']
            })
        
        # Initialize RAG service
        logger.info("📦 Initializing RAG service...")
        rag_service = RAGAnalysisService(
            milvus_host=settings.milvus_host,
            milvus_port=settings.milvus_port,
            ollama_host=settings.ollama_base_url,
            llm_model=settings.ollama_model
        )
        
        # Run RAG analysis (comprehensive extraction of 10 categories)
        logger.info(f"🔬 Analyzing {len(articles_for_analysis)} articles with RAG...")
        rag_results = rag_service.analyze_comprehensive(
            articles=articles_for_analysis,
            company_name=company_name,
            sme_objective=sme_objective
        )
        
        # Extract the analysis results
        analysis_results = rag_results['analysis']
        rag_metadata = rag_results['metadata']
        
        logger.info("✅ RAG analysis completed")
        logger.info(f"   Items extracted: {rag_metadata['total_items_extracted']}")
        logger.info(f"   Average confidence: {rag_metadata['average_confidence']:.2%}")
        logger.info(f"   Duration: {rag_metadata['duration_seconds']:.1f}s")
        update_analysis_progress(
            job_identifier,
            90.0,
            "RAG analysis complete. Preparing results...",
            extra={
                "stage": "rag_analysis",
                "items_extracted": rag_metadata['total_items_extracted'],
                "average_confidence": rag_metadata['average_confidence'],
            },
        )
        
        # ============================================
        # STEP 5: Store RAG Analysis in Database
        # ============================================
        logger.info("💾 Storing RAG analysis results in database...")
        
        # Format RAG results for database storage
        import json
        
        # Convert RAG category results to strings for database storage
        def format_category_for_db(category_result):
            """Format a RAG category result for database storage"""
            if not category_result or 'data' not in category_result:
                return ''
            return json.dumps(category_result['data'], indent=2)
        
        # STEP 5A: Save Company Info, Strengths, Opportunities in COMPANY table
        try:
            logger.info("💾 Saving Company Info, Strengths, Opportunities to company table...")
            
            # Extract the three categories for company table
            company_info_data = analysis_results.get('company_info', {})
            strengths_data = analysis_results.get('strengths', {})
            opportunities_data = analysis_results.get('opportunities', {})
            
            # Ensure we have dictionaries, not lists
            if isinstance(company_info_data, list):
                company_info_data = {'data': company_info_data, 'error': 'Unexpected list format'}
            elif not isinstance(company_info_data, dict):
                company_info_data = {}
                
            if isinstance(strengths_data, list):
                strengths_data = {'data': strengths_data, 'error': 'Unexpected list format'}
            elif not isinstance(strengths_data, dict):
                strengths_data = {}
                
            if isinstance(opportunities_data, list):
                opportunities_data = {'data': opportunities_data, 'error': 'Unexpected list format'}
            elif not isinstance(opportunities_data, dict):
                opportunities_data = {}
            
            # Format for storage
            company_info_str = format_category_for_db(company_info_data)
            strengths_str = format_category_for_db(strengths_data)
            opportunities_str = format_category_for_db(opportunities_data)
            
            # Also extract industry from company_info if available
            industry = None
            if company_info_data and isinstance(company_info_data, dict) and 'data' in company_info_data:
                data = company_info_data['data']
                if isinstance(data, dict):
                    industry = data.get('industry')
            
            # Update company record with RAG-extracted intelligence
            await inspire_db.update_company(
                company_id=company_id,
                company_info=company_info_str,
                strengths=strengths_str,
                opportunities=opportunities_str,
                industry=industry if industry else None
            )
            
            logger.info(f"✅ Saved Company Info, Strengths, Opportunities to company table (ID: {company_id})")
            
        except Exception as e:
            logger.error(f"Failed to save company intelligence: {e}")
            # Continue anyway
        
        # STEP 5B: Save remaining 7 categories in ANALYSIS table
        try:
            from datetime import date
            
            analysis_id = await inspire_db.create_analysis(
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
            )
            
            logger.info(f"✅ Stored RAG analysis in analysis table (ID: {analysis_id})")
            
        except Exception as e:
            logger.error(f"Failed to store analysis: {e}")
            # Continue anyway, analysis is already complete
        
        # ============================================
        # Organize Articles by Classification
        # ============================================
        directly_relevant_articles = []
        indirectly_useful_articles = []
        not_relevant_articles = []
        
        for idx, row in df_classified.iterrows():
            article_data = {
                'title': row.get('title', 'Untitled'),
                'url': row.get('url', ''),
                'source': row.get('source', 'Unknown'),
                'published_date': row.get('published_date', None)
            }
            
            prediction_label = row.get('prediction_label', 'Not Relevant')
            
            if prediction_label == 'Directly Relevant':
                directly_relevant_articles.append(article_data)
            elif prediction_label == 'Indirectly Useful':
                indirectly_useful_articles.append(article_data)
            else:
                not_relevant_articles.append(article_data)
        
        # ============================================
        # Return Results with All Articles
        # ============================================
        # Convert all articles to list format
        all_articles = []
        for idx, row in df_classified.iterrows():
            all_articles.append({
                'title': row.get('title', 'Untitled'),
                'content': row.get('content', ''),
                'url': row.get('url', ''),
                'source': row.get('source', 'Unknown'),
                'published_date': row.get('published_date', None),
                'classification': row.get('prediction_label', 'Not Relevant'),
                'confidence_score': row.get('confidence_score', 0.0)
            })
        
        results = {
            'company_name': company_name,
            'company_id': company_id,
            'sme_id': sme_id,
            'articles_scraped': len(df_classified),
            'articles_classified': {
                'directly_relevant': len(df_classified[df_classified['prediction_label'] == 'Directly Relevant']) if 'prediction_label' in df_classified.columns else 0,
                'indirectly_useful': len(df_classified[df_classified['prediction_label'] == 'Indirectly Useful']) if 'prediction_label' in df_classified.columns else 0,
                'not_relevant': len(df_classified[df_classified['prediction_label'] == 'Not Relevant']) if 'prediction_label' in df_classified.columns else 0
            },
            'articles_by_classification': {
                'directly_relevant': directly_relevant_articles,
                'indirectly_useful': indirectly_useful_articles,
                'not_relevant': not_relevant_articles
            },
            'all_articles': all_articles,
            'articles_stored': articles_stored,
            'rag_analysis': {
                '1_latest_updates': analysis_results.get('latest_updates', {}),
                '2_challenges': analysis_results.get('challenges', {}),
                '3_decision_makers': analysis_results.get('decision_makers', {}),
                '4_market_position': analysis_results.get('market_position', {}),
                '5_future_plans': analysis_results.get('future_plans', {}),
                '6_action_plan': analysis_results.get('action_plan', {}),
                '7_solution': analysis_results.get('solution', {}),
                '8_company_info': analysis_results.get('company_info', {}),
                '9_strengths': analysis_results.get('strengths', {}),
                '10_opportunities': analysis_results.get('opportunities', {})
            },
            'classification_summary': classification_results.get('classification_summary', {}),
            'rag_metadata': {
                'total_items_extracted': rag_metadata['total_items_extracted'],
                'average_confidence': rag_metadata['average_confidence'],
                'duration_seconds': rag_metadata['duration_seconds'],
                'articles_processed': rag_metadata['articles_processed'],
                'chunks_created': rag_metadata['chunks_created'],
                'vector_storage': rag_metadata['vector_storage'],
                'hyperparameters': rag_metadata['hyperparameters']
            },
            'metadata': {
                'sme_objective': sme_objective,
                'scraping_method': 'Google/SerpAPI only (no LinkedIn)',
                'classification_method': 'ML-based with SME objectives',
                'analysis_method': 'RAG (Retrieval-Augmented Generation) with 10 categories',
                'total_articles_analyzed': len(articles_for_analysis),
                'llm_model': settings.ollama_model,
                'embedding_model': 'all-MiniLM-L6-v2'
            },
            'job_id': job_identifier
        }
        
        logger.info("✅ Unified analysis with RAG completed successfully!")
        finalize_analysis_progress(
            job_identifier,
            "completed",
            f"Analysis completed for {company_name}.",
        )
        
        return APIResponse(
            success=True,
            message=f"Successfully completed unified analysis with RAG for {company_name} - 10 categories extracted",
            data=results
        )
        
    except HTTPException as http_exc:
        finalize_analysis_progress(
            locals().get("job_identifier", job_id),
            "failed",
            str(http_exc.detail) if hasattr(http_exc, "detail") else "Analysis failed.",
        )
        raise
    except Exception as e:
        logger.error(f"Unified analysis failed: {e}")
        finalize_analysis_progress(
            locals().get("job_identifier", job_id),
            "failed",
            f"Unified analysis failed: {str(e)}",
        )
        raise HTTPException(
            status_code=500,
            detail=f"Unified analysis failed: {str(e)}"
        )


@router.get(
    "/unified-analysis/progress/{job_id}",
    summary="Get progress for a running unified analysis job",
    description="Return the latest percentage completion and status message for the specified analysis job."
)
async def get_unified_analysis_progress(job_id: str):
    progress = analysis_progress.get(job_id)
    if not progress:
        return APIResponse(
            success=False,
            message="Progress not found for the provided job_id. It may have expired or never existed.",
            data={"job_id": job_id},
        )

    return APIResponse(
        success=True,
        message="Progress retrieved successfully.",
        data=progress,
    )


@router.get(
    "/info",
    summary="Get Unified Analysis Service Information",
    description="Get information about the unified analysis service with RAG"
)
async def unified_analysis_info():
    """Get information about the unified analysis service"""
    return {
        "service": "Unified Company Analysis with RAG",
        "description": "Complete one-endpoint solution for company analysis using Retrieval-Augmented Generation",
        "steps": [
            "1. Scrape company data from Google (SerpAPI)",
            "2. Classify articles based on SME objectives (ML-based)",
            "3. Store classified articles in database",
            "4. Run RAG analysis - 10 intelligence categories",
            "5. Store RAG analysis results in database"
        ],
        "rag_categories": [
            "1. Latest Updates - Product launches, financial results, partnerships",
            "2. Challenges - Competitive pressures, operational difficulties",
            "3. Decision Makers - Executives, leaders, management",
            "4. Market Position - Competitors, market share, advantages",
            "5. Future Plans - Expansion, investments, strategic initiatives",
            "6. Action Plan - 3 specific steps for SME to engage",
            "7. Solution - 3 relevant SME solutions for company needs",
            "8. Company Info - 5-sentence company description",
            "9. Strengths - Key competitive advantages",
            "10. Opportunities - Potential growth areas"
        ],
        "features": [
            "Google scraping only (no LinkedIn)",
            "ML-based article classification",
            "RAG-based intelligence extraction (10 categories)",
            "Semantic retrieval with vector embeddings",
            "LLM generation (Llama 3.1)",
            "SME-personalized insights (Action Plan & Solution)",
            "Automatic database storage",
            "Returns all articles with classifications"
        ],
        "technology": {
            "scraping": "SerpAPI",
            "classification": "SentenceTransformer + Custom Model",
            "rag_embeddings": "all-MiniLM-L6-v2 (384-dim)",
            "vector_storage": "Milvus (with in-memory fallback)",
            "llm": "Llama 3.1 via Ollama",
            "retrieval": "Cosine similarity (top-5)"
        },
        "endpoint": "/api/v1/unified/unified-analysis",
        "method": "POST",
        "response_includes": [
            "All scraped articles (with content)",
            "Article classifications (Directly Relevant, Indirectly Useful, Not Relevant)",
            "10 RAG analysis categories with structured JSON",
            "Confidence scores per category",
            "RAG metadata (chunks, embeddings, performance)"
        ]
    }

