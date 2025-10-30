
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Optional, List
import pandas as pd
from loguru import logger
import json

from app.services.company_intelligence_service import CompanyIntelligenceService
from app.services.company_profile_aggregator import CompanyProfileAggregator
from app.services.advanced_data_processor import AdvancedDataProcessor
from app.services.comprehensive_scrape_service import ComprehensiveScrapeService
from app.models import APIResponse

router = APIRouter()

intelligence_service = None
profile_aggregator = None

def get_intelligence_service():
    global intelligence_service
    if intelligence_service is None:
        intelligence_service = CompanyIntelligenceService()
    return intelligence_service

def get_profile_aggregator():
    global profile_aggregator
    if profile_aggregator is None:
        profile_aggregator = CompanyProfileAggregator(
            intelligence_service=get_intelligence_service()
        )
    return profile_aggregator

@router.post(
    "/extract-from-csv",
    summary="Extract Intelligence from CSV Articles",
    description="""
    Extract company intelligence (descriptions, strengths, weaknesses, opportunities)
    from articles in a CSV file.

    **CSV Format Requirements:**
    - Required columns: `title`, `content`
    - Optional columns: `id`, `url`, `source`, `published_date`

    **Extraction Categories:**
    - **Description**: What the company does
    - **Strengths**: Competitive advantages, strong points
    - **Weaknesses**: Challenges, limitations
    - **Opportunities**: Growth potential, expansion possibilities
    """,
    response_description="Intelligence extracted successfully"
)
async def extract_intelligence_from_csv(
    file: UploadFile = File(..., description="CSV file containing articles"),
):
    try:
        logger.info(f"Received intelligence extraction request for file: {file.filename}")

        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")

        content = await file.read()

        logger.info("Processing CSV file...")
        data_processor = AdvancedDataProcessor()
        try:
            df = data_processor.process_csv(content)
            logger.info(f"CSV processed successfully: {len(df)} articles found")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        logger.info("Initializing intelligence extraction service...")
        service = get_intelligence_service()

        logger.info(f"Extracting intelligence from {len(df)} articles...")
        results_df = service.extract_from_dataframe(df)

        results = results_df.to_dict('records')

        summary = {
            'total_articles': len(results),
            'descriptions_found': sum(1 for r in results if r['description']),
            'total_strengths': sum(r['strengths_count'] for r in results),
            'total_weaknesses': sum(r['weaknesses_count'] for r in results),
            'total_opportunities': sum(r['opportunities_count'] for r in results),
            'avg_strengths_per_article': sum(r['strengths_count'] for r in results) / len(results),
            'avg_weaknesses_per_article': sum(r['weaknesses_count'] for r in results) / len(results),
            'avg_opportunities_per_article': sum(r['opportunities_count'] for r in results) / len(results)
        }

        logger.info("Intelligence extraction completed successfully")

        return APIResponse(
            success=True,
            message=f"Successfully extracted intelligence from {len(results)} articles",
            data={
                'results': results,
                'summary': summary,
                'file_info': {
                    'filename': file.filename,
                    'articles_processed': len(results)
                }
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Intelligence extraction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Intelligence extraction failed: {str(e)}"
        )

@router.post(
    "/company-profile",
    summary="Generate Comprehensive Company Profile",
    description="""
    Generate a comprehensive company profile by aggregating intelligence from multiple articles.

    **This endpoint:**
    1. Extracts intelligence from each article
    2. Deduplicates similar items
    3. Ranks by importance
    4. Creates a consolidated company profile

    **CSV Format Requirements:**
    - Required columns: `title`, `content`
    - All articles should be about the SAME company

    **Output:**
    - Single comprehensive description
    - Top 10 strengths (deduplicated and ranked)
    - Top 8 weaknesses (deduplicated and ranked)
    - Top 8 opportunities (deduplicated and ranked)
    """,
    response_description="Company profile generated successfully"
)
async def generate_company_profile(
    file: UploadFile = File(..., description="CSV file containing articles about the company"),
    company_name: str = Form(..., description="Name of the company")
):
    try:
        logger.info(f"Received company profile request for: {company_name}")

        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")

        content = await file.read()

        logger.info("Processing CSV file...")
        data_processor = AdvancedDataProcessor()
        try:
            df = data_processor.process_csv(content)
            logger.info(f"CSV processed successfully: {len(df)} articles found")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        articles = []
        for _, row in df.iterrows():
            articles.append({
                'title': row.get('title', ''),
                'content': row.get('content', '')
            })

        logger.info("Initializing company profile aggregator...")
        aggregator = get_profile_aggregator()

        logger.info(f"Generating comprehensive profile for {company_name}...")
        profile = aggregator.aggregate_profile(articles, company_name)

        profile_text = aggregator.format_profile_as_text(profile)

        logger.info("Company profile generated successfully")

        return APIResponse(
            success=True,
            message=f"Successfully generated company profile for {company_name}",
            data={
                'profile': profile,
                'formatted_text': profile_text,
                'file_info': {
                    'filename': file.filename,
                    'articles_analyzed': len(articles)
                }
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Company profile generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Company profile generation failed: {str(e)}"
        )

@router.post(
    "/scrape-and-profile",
    summary="Scrape Company Data and Generate Profile",
    description="""
    Comprehensive workflow: Scrape company data and generate intelligence profile.

    **This endpoint:**
    1. Scrapes articles about the company (using SerpAPI)
    2. Extracts intelligence from each article
    3. Aggregates into comprehensive company profile

    **Requirements:**
    - SERPAPI_API_KEY must be configured
    """,
    response_description="Company data scraped and profile generated"
)
async def scrape_and_generate_profile(
    company_name: str = Form(..., description="Name of the company"),
    location: str = Form(..., description="Company location/country"),
    max_articles: int = Form(20, description="Maximum number of articles to analyze")
):
    try:
        logger.info(f"Received scrape-and-profile request for: {company_name} ({location})")

        logger.info("Step 1: Scraping company data...")
        scrape_service = ComprehensiveScrapeService()

        try:
            scrape_result = await scrape_service.scrape_company_comprehensive(
                name=company_name,
                location=location
            )
            articles_data = scrape_result.news_articles[:max_articles]

            if not articles_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No articles found for {company_name}. Company may not exist or no news available."
                )

            logger.info(f"Found {len(articles_data)} articles")

        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Scraping failed: {str(e)}. Check if SERPAPI_API_KEY is configured."
            )

        articles = []
        for article in articles_data:
            articles.append({
                'title': article.title if hasattr(article, 'title') else str(article.get('title', '')),
                'content': article.content if hasattr(article, 'content') else str(article.get('content', ''))
            })

        logger.info("Step 2: Generating company profile...")
        aggregator = get_profile_aggregator()
        profile = aggregator.aggregate_profile(articles, company_name)
        profile_text = aggregator.format_profile_as_text(profile)

        logger.info("Scrape and profile generation completed successfully")

        return APIResponse(
            success=True,
            message=f"Successfully scraped and generated profile for {company_name}",
            data={
                'company_name': company_name,
                'location': location,
                'profile': profile,
                'formatted_text': profile_text,
                'articles_found': len(articles_data),
                'articles_analyzed': len(articles)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scrape and profile generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Operation failed: {str(e)}"
        )

@router.get(
    "/model-info",
    summary="Get Intelligence Extraction Model Information",
    description="Get information about the intelligence extraction model and methodology",
    response_description="Model information retrieved successfully"
)
async def get_model_info():
    try:
        logger.info("Fetching intelligence extraction model information...")

        service = get_intelligence_service()

        model_info = service.get_model_info()

        model_info['endpoints'] = {
            'extract_from_csv': '/api/v1/intelligence/extract-from-csv',
            'company_profile': '/api/v1/intelligence/company-profile',
            'scrape_and_profile': '/api/v1/intelligence/scrape-and-profile',
            'model_info': '/api/v1/intelligence/model-info'
        }

        model_info['capstone_defense'] = {
            'question': 'What did you do to improve the pre-trained model?',
            'answer': [
                'Designed custom weak supervision framework requiring no manual labeling',
                'Engineered 100+ domain-specific prototypes and keywords for African fintech/MSME context',
                'Developed hybrid scoring algorithm combining semantic similarity with keyword boosting',
                'Created multi-category confidence scoring system',
                'Built aggregation pipeline for multi-document intelligence synthesis',
                'Implemented semantic deduplication using embedding similarity',
                'Designed importance ranking algorithm based on frequency and confidence'
            ],
            'pre_trained_usage': 'SentenceTransformer for embeddings only',
            'your_contributions': 'All extraction logic, aggregation, and intelligence synthesis'
        }

        return APIResponse(
            success=True,
            message="Model information retrieved successfully",
            data=model_info
        )

    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )

