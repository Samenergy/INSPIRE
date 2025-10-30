from fastapi import APIRouter, HTTPException, Form
from typing import Optional
from app.models import APIResponse
from app.scrapers.serpapi_scraper import SerpApiScraper
from app.models import Company
from app.services.advanced_model_service import AdvancedModelService
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.routers.comprehensive_analysis import get_llm_service
from app.database_mysql_inspire import inspire_db
from loguru import logger
import pandas as pd
import io

router = APIRouter()

@router.post(
    "/unified-analysis",
    summary="Unified Company Analysis (Scrape + Classify + Analyze)",
    description="""
    **Complete one-endpoint solution for company analysis.**
    
    This endpoint orchestrates a complete analysis pipeline:
    
    **1. Google Scraping** (No LinkedIn)
    - Scrapes company news and articles using SerpAPI/Google
    - Retrieves up to 100 articles about the company
    
    **2. Article Classification Based on SME Objectives**
    - Classifies articles into: Directly Relevant, Indirectly Useful, Not Relevant
    - Uses your SME objectives to determine relevance
    - Stores classified articles in the database
    
    **3. Comprehensive Analysis (7 Questions with LLM)**
    - Analyzes the company using all 7 comprehensive questions
    - Uses LLM for intelligent analysis
    - Stores results in the database
    
    **Step-by-step process:**
    1. Scrape company data from Google (SerpAPI)
    2. Classify articles based on your SME objectives
    3. Store classified articles in the `article` table
    4. Run comprehensive LLM analysis (7 questions)
    5. Store analysis results in the `analysis` table
    
    **Important:**
    - Only uses Google/SerpAPI (no LinkedIn scraping)
    - Classification happens BEFORE analysis
    - Both articles and analysis are stored in database
    - Uses `sme_id` to link everything to your SME
    """,
    response_description="Unified analysis completed successfully"
)
async def unified_company_analysis(
    company_name: str = Form(..., description="Name of the company to analyze"),
    company_location: str = Form(..., description="Location of the company"),
    sme_id: int = Form(..., description="Your SME ID"),
    sme_objective: str = Form(..., description="Your SME's objectives and capabilities"),
    max_articles: int = Form(100, description="Maximum number of articles to scrape (default: 100)")
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
        logger.info(f"🚀 Starting unified analysis for: {company_name}")
        
        # ============================================
        # STEP 1: Google Scraping (NO LinkedIn)
        # ============================================
        logger.info("📰 Step 1/3: Scraping company data from Google...")
        
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
        
        # First, get or create company
        company = await inspire_db.get_company_by_name(company_name)
        company_id = None
        
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
        
        # ============================================
        # STEP 4: Comprehensive LLM Analysis
        # ============================================
        logger.info("🤖 Step 4/4: Running comprehensive LLM analysis...")
        
        # Convert DataFrame to list of dicts for LLM analysis
        articles_for_analysis = []
        for _, row in df_classified.iterrows():
            articles_for_analysis.append({
                'title': row['title'],
                'content': row['content']
            })
        
        # Initialize LLM service
        llm_svc = get_llm_service('auto')
        
        # Run comprehensive analysis
        analysis_results = await llm_svc.analyze_comprehensive(
            articles=articles_for_analysis,
            company_name=company_name,
            sme_objective=sme_objective
        )
        
        logger.info("✅ Comprehensive analysis completed")
        
        # ============================================
        # STEP 5: Store Analysis in Database
        # ============================================
        logger.info("💾 Storing analysis results in database...")
        
        try:
            from datetime import date
            
            analysis_id = await inspire_db.create_analysis(
                company_id=company_id,
                latest_updates=analysis_results.get('1_latest_updates', ''),
                challenges=analysis_results.get('2_challenges', ''),
                decision_makers=analysis_results.get('3_decision_makers', ''),
                market_position=analysis_results.get('4_market_position', ''),
                future_plans=analysis_results.get('5_future_plans', ''),
                action_plan=analysis_results.get('6_action_plan', ''),
                solutions=analysis_results.get('7_solutions', ''),
                analysis_type='COMPREHENSIVE',
                date_analyzed=date.today(),
                status='COMPLETED'
            )
            
            logger.info(f"✅ Stored analysis in database (ID: {analysis_id})")
            
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
        # Return Results
        # ============================================
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
            'articles': {
                'directly_relevant': directly_relevant_articles,
                'indirectly_useful': indirectly_useful_articles,
                'not_relevant': not_relevant_articles
            },
            'articles_stored': articles_stored,
            'analysis': analysis_results,
            'classification_summary': classification_results.get('classification_summary', {}),
            'metadata': {
                'sme_objective': sme_objective,
                'scraping_method': 'Google/SerpAPI only (no LinkedIn)',
                'classification_method': 'ML-based with SME objectives',
                'analysis_method': 'LLM-based comprehensive analysis',
                'total_articles_analyzed': len(articles_for_analysis)
            }
        }
        
        logger.info("✅ Unified analysis completed successfully!")
        
        return APIResponse(
            success=True,
            message=f"Successfully completed unified analysis for {company_name}",
            data=results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unified analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Unified analysis failed: {str(e)}"
        )

@router.get(
    "/info",
    summary="Get Unified Analysis Service Information",
    description="Get information about the unified analysis service"
)
async def unified_analysis_info():
    """Get information about the unified analysis service"""
    return {
        "service": "Unified Company Analysis",
        "description": "Complete one-endpoint solution for company analysis",
        "steps": [
            "1. Scrape company data from Google (SerpAPI)",
            "2. Classify articles based on SME objectives",
            "3. Store classified articles in database",
            "4. Run comprehensive LLM analysis (7 questions)",
            "5. Store analysis results in database"
        ],
        "features": [
            "Google scraping only (no LinkedIn)",
            "ML-based article classification",
            "LLM-based comprehensive analysis",
            "Automatic database storage",
            "SME-objective-based classification"
        ],
        "endpoint": "/api/v1/unified/unified-analysis",
        "method": "POST"
    }

