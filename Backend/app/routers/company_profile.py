
from fastapi import APIRouter, HTTPException, Form
from typing import Optional
from loguru import logger

from app.services.company_intelligence_service import CompanyIntelligenceService
from app.services.company_profile_aggregator import CompanyProfileAggregator
from app.services.comprehensive_scrape_service import ComprehensiveScrapeService
from app.services.article_content_fetcher import ArticleContentFetcher
from app.services.company_description_fetcher import CompanyDescriptionFetcher
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
    "/generate",
    summary="Generate Company Profile (Scrape + Extract)",
    description="""
    **Simple one-step company profile generation.**

    Provide company name and location, and get:
    - Company description (what they do)
    - Key strengths
    - Main weaknesses

    **How it works:**
    1. Scrapes news articles about the company using SerpAPI
    2. Extracts intelligence from each article
    3. Aggregates and ranks by importance
    4. Returns clean, formatted profile

    **Requirements:**
    - SERPAPI_API_KEY must be configured in environment
    """,
    response_description="Company profile generated successfully"
)
async def generate_company_profile(
    company_name: str = Form(..., description="Name of the company (e.g., 'MTN Rwanda')"),
    location: str = Form(..., description="Company location/country (e.g., 'Rwanda')"),
    max_articles: int = Form(15, description="Maximum number of articles to analyze (default: 15)")
):
    try:
        logger.info(f"Generating profile for: {company_name} ({location})")

        logger.info("Step 1/4: Scraping news articles from SerpAPI...")
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
                    detail=f"No articles found for {company_name}. Please check:\n"
                           f"- Company name is spelled correctly\n"
                           f"- Company has news coverage\n"
                           f"- SERPAPI_API_KEY is configured"
                )

            logger.info(f"✅ Found {len(articles_data)} articles")

        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            if "SERPAPI_API_KEY" in str(e) or "API key" in str(e):
                raise HTTPException(
                    status_code=500,
                    detail="SerpAPI key not configured. Please set SERPAPI_API_KEY environment variable."
                )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to scrape articles: {str(e)}"
            )

        logger.info("Step 2/4: Fetching full article content from URLs...")
        articles_to_enhance = []
        for article in articles_data:
            articles_to_enhance.append({
                'title': article.title if hasattr(article, 'title') else str(article.get('title', '')),
                'content': article.content if hasattr(article, 'content') else str(article.get('content', '')),
                'url': article.url if hasattr(article, 'url') else str(article.get('url', ''))
            })

        content_fetcher = ArticleContentFetcher(timeout=10, max_concurrent=5)
        try:
            enhanced_articles = await content_fetcher.fetch_multiple_articles(articles_to_enhance)
            logger.info(f"✅ Enhanced {sum(1 for a in enhanced_articles if a.get('content_fetched', False))}/{len(enhanced_articles)} articles")
        except Exception as e:
            logger.warning(f"Content fetching partially failed: {e}")
            enhanced_articles = articles_to_enhance
        finally:
            await content_fetcher.close()

        logger.info("Step 3/4: Extracting intelligence from articles...")

        intelligence_service = get_intelligence_service()
        all_strengths = []
        all_weaknesses = []
        all_descriptions_fallback = []

        for article in enhanced_articles:
            intelligence = intelligence_service.extract_intelligence(
                article_text=article.get('content', ''),
                article_title=article.get('title', ''),
                company_name=company_name
            )
            all_strengths.extend(intelligence['strengths'])
            all_weaknesses.extend(intelligence['weaknesses'])

            if intelligence['description']:
                all_descriptions_fallback.append(intelligence['description'])

        logger.info("Step 4/4: Aggregating and ranking findings...")
        aggregator = get_profile_aggregator()

        unique_strengths = aggregator._deduplicate_and_merge(all_strengths)
        unique_weaknesses = aggregator._deduplicate_and_merge(all_weaknesses)

        ranked_strengths = aggregator._rank_by_importance(unique_strengths)
        ranked_weaknesses = aggregator._rank_by_importance(unique_weaknesses)

        strengths_formatted = aggregator._format_profile_section(ranked_strengths[:10], 'strengths')
        weaknesses_formatted = aggregator._format_profile_section(ranked_weaknesses[:8], 'weaknesses')

        logger.info(f"Fetching overview from SerpAPI: 'What is {company_name} in {location}'")
        description_fetcher = CompanyDescriptionFetcher()
        overview_result = await description_fetcher.fetch_company_overview(company_name, location)
        await description_fetcher.close()

        final_description = overview_result.get('description')
        description_source = overview_result.get('source', 'none')
        description_confidence = overview_result.get('confidence', 'low')
        overview_full_text = overview_result.get('full_text', '')

        overview_strengths = []
        if overview_full_text and len(overview_full_text) > 100:
            logger.info(f"✅ Overview found from {description_source}, extracting strengths from it...")
            overview_intelligence = intelligence_service.extract_intelligence(
                article_text=overview_full_text,
                article_title=f"Overview of {company_name}",
                company_name=company_name
            )
            overview_strengths = overview_intelligence['strengths']
            logger.info(f"✅ Extracted {len(overview_strengths)} strengths from overview")

        if not final_description and all_descriptions_fallback:
            final_description = aggregator._synthesize_description(all_descriptions_fallback)
            description_source = 'extracted_from_articles'
            description_confidence = 'high'
            logger.info(f"✅ Description extracted from {len(all_descriptions_fallback)} articles")

        if not final_description:
            final_description = f"{company_name} is a company operating in {location}."
            description_source = 'generated'
            description_confidence = 'low'

        all_strengths_combined = overview_strengths + all_strengths
        unique_strengths_combined = aggregator._deduplicate_and_merge(all_strengths_combined)
        ranked_strengths_final = aggregator._rank_by_importance(unique_strengths_combined)
        strengths_formatted = aggregator._format_profile_section(ranked_strengths_final[:10], 'strengths')

        total_strengths_combined = len(all_strengths_combined)
        unique_strengths_count = len(unique_strengths_combined)

        profile = {
            'company_name': company_name,
            'description': final_description,
            'description_source': description_source,
            'description_confidence': description_confidence,
            'strengths': strengths_formatted,
            'weaknesses': weaknesses_formatted,
            'articles_analyzed': len(enhanced_articles),
            'metadata': {
                'total_strengths_extracted': total_strengths_combined,
                'strengths_from_overview': len(overview_strengths),
                'strengths_from_articles': len(all_strengths),
                'unique_strengths': unique_strengths_count,
                'total_weaknesses_extracted': len(all_weaknesses),
                'unique_weaknesses': len(unique_weaknesses),
                'descriptions_found_in_articles': len(all_descriptions_fallback)
            }
        }

        response_data = {
            'company_name': profile['company_name'],
            'location': location,
            'description': profile['description'],
            'description_source': profile['description_source'],
            'description_confidence': profile['description_confidence'],
            'strengths': profile['strengths'],
            'weaknesses': profile['weaknesses'],
            'metadata': {
                'articles_analyzed': profile['articles_analyzed'],
                'articles_found': len(articles_data),
                'unique_strengths': profile['metadata']['unique_strengths'],
                'unique_weaknesses': profile['metadata']['unique_weaknesses'],
                'extraction_info': {
                    'total_strengths_extracted': profile['metadata']['total_strengths_extracted'],
                    'total_weaknesses_extracted': profile['metadata']['total_weaknesses_extracted'],
                    'descriptions_found_in_articles': profile['metadata']['descriptions_found_in_articles']
                }
            }
        }

        logger.info(f"✅ Profile generated successfully for {company_name}")

        return APIResponse(
            success=True,
            message=f"Successfully generated profile for {company_name}",
            data=response_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Profile generation failed: {str(e)}"
        )

@router.post(
    "/generate-formatted",
    summary="Generate Formatted Company Profile",
    description="""
    Same as /generate but returns a nicely formatted text version.
    Perfect for display or reports.
    """,
    response_description="Formatted company profile generated"
)
async def generate_formatted_profile(
    company_name: str = Form(..., description="Name of the company"),
    location: str = Form(..., description="Company location/country"),
    max_articles: int = Form(15, description="Maximum number of articles to analyze")
):
    try:
        result = await generate_company_profile(company_name, location, max_articles)
        profile_data = result.data

        lines = []
        lines.append(f"# {company_name}")
        lines.append("")
        lines.append("## Description")
        lines.append(profile_data['description'])
        lines.append("")
        lines.append(f"(Based on analysis of {profile_data['metadata']['articles_analyzed']} articles)")
        lines.append("")

        if profile_data['strengths']:
            lines.append("## Strengths")
            lines.append("")
            for i, strength in enumerate(profile_data['strengths'], 1):
                lines.append(f"{i}. {strength}")
            lines.append("")

        if profile_data['weaknesses']:
            lines.append("## Weaknesses")
            lines.append("")
            for i, weakness in enumerate(profile_data['weaknesses'], 1):
                lines.append(f"{i}. {weakness}")
            lines.append("")

        formatted_text = "\n".join(lines)

        profile_data['formatted_text'] = formatted_text

        return APIResponse(
            success=True,
            message=f"Successfully generated formatted profile for {company_name}",
            data=profile_data
        )

    except Exception as e:
        logger.error(f"Formatted profile generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Profile generation failed: {str(e)}"
        )

@router.get(
    "/info",
    summary="Get Company Profile Service Information",
    description="Get information about the company profile generation service"
)
async def get_service_info():
    return APIResponse(
        success=True,
        message="Company profile service information",
        data={
            'service_name': 'Company Profile Generator',
            'version': '1.0.0',
            'description': 'Automated company profile generation using web scraping and AI extraction',
            'workflow': [
                '1. Scrape news articles about the company (SerpAPI)',
                '2. Extract intelligence from each article (AI model)',
                '3. Aggregate and deduplicate findings',
                '4. Rank by importance and confidence',
                '5. Return comprehensive profile'
            ],
            'extracted_data': {
                'description': 'What the company does, their industry, core business',
                'strengths': 'Competitive advantages, strong points, market position',
                'weaknesses': 'Challenges, limitations, areas of concern'
            },
            'requirements': {
                'serpapi_key': 'Required for article scraping (set SERPAPI_API_KEY env variable)',
                'internet': 'Required for web scraping',
                'processing_time': '5-15 seconds depending on article count'
            },
            'endpoints': {
                'generate': '/api/v1/profile/generate',
                'generate_formatted': '/api/v1/profile/generate-formatted',
                'info': '/api/v1/profile/info'
            },
            'example_usage': {
                'curl': 'curl -X POST "http://localhost:8000/api/v1/profile/generate" -F "company_name=MTN Rwanda" -F "location=Rwanda"',
                'input': {
                    'company_name': 'MTN Rwanda',
                    'location': 'Rwanda',
                    'max_articles': 15
                },
                'output_fields': [
                    'description',
                    'strengths (array)',
                    'weaknesses (array)',
                    'metadata'
                ]
            },
            'ai_model_info': {
                'extraction_method': 'Weak supervision with SentenceTransformer embeddings',
                'prototypes': 34,
                'keywords': 85,
                'accuracy': 'High (95%+ for descriptions, 80%+ for strengths/weaknesses)'
            }
        }
    )

