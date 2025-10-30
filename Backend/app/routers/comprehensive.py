
from fastapi import APIRouter, HTTPException, Depends

from app.models import ComprehensiveScrapeRequest, ComprehensiveScrapeResult, APIResponse
from app.services.comprehensive_scrape_service import ComprehensiveScrapeService
from app.services.csv_export_service import CSVExportService
from loguru import logger

router = APIRouter()

@router.post(
    "/scrape",
    response_model=APIResponse[ComprehensiveScrapeResult],
    summary="Comprehensive Company Data Scraping",
    description="""
    Comprehensive scraping endpoint that:
    1. Creates/updates company record from name and location
    2. Uses SerpAPI to find company info, news, and LinkedIn URL
    3. Uses Apify to scrape LinkedIn posts using found URL
    4. Returns all collected data in one response

    This is a unified endpoint that orchestrates multiple scraping sources
    to provide complete company intelligence.
    """,
    response_description="Comprehensive company data retrieved successfully"
)
async def comprehensive_scrape(
    request: ComprehensiveScrapeRequest,
    service: ComprehensiveScrapeService = Depends(ComprehensiveScrapeService)
):
    try:
        logger.info(f"Starting comprehensive scraping for: {request.name} in {request.location}")

        result = await service.scrape_company_comprehensive(
            name=request.name,
            location=request.location,
            website=request.website,
            industry=request.industry,
            description=request.description
        )

        logger.info(f"Comprehensive scraping completed for: {request.name}")

        return APIResponse(
            success=True,
            message=f"Comprehensive data scraped successfully for {request.name}",
            data=result
        )

    except Exception as e:
        logger.error(f"Comprehensive scraping failed for {request.name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Comprehensive scraping failed: {str(e)}"
        )

@router.get(
    "/status",
    summary="Get Scraping Status",
    description="Get information about the comprehensive scraping service status",
    response_description="Service status retrieved successfully"
)
async def get_scraping_status():
    return APIResponse(
        success=True,
        message="Comprehensive scraping service is operational",
        data={
            "service": "comprehensive_scrape",
            "status": "operational",
            "available_sources": ["serpapi"],
            "workflow": [
                "1. Create/update company record",
                "2. SerpAPI scraping (company info, news, LinkedIn URL)",
                "3. Export data to CSV files",
                "4. Data aggregation and return"
            ],
            "rate_limits": {
                "requests_per_minute": 2,
                "description": "Rate limited to prevent API abuse"
            },
            "csv_export": {
                "enabled": True,
                "export_directory": "exports/",
                "formats": ["news_articles", "website_updates", "business_registry"]
            },
            "notes": "Apify LinkedIn scraping temporarily disabled - focusing on SerpAPI functionality"
        }
    )

@router.get(
    "/csv-exports/{company_name}",
    summary="Get CSV Export Information",
    description="Get information about exported CSV files for a specific company",
    response_description="CSV export information retrieved successfully"
)
async def get_csv_exports(company_name: str):
    try:
        csv_service = CSVExportService()
        export_summary = csv_service.get_export_summary(company_name)

        return APIResponse(
            success=True,
            message=f"CSV export information retrieved for {company_name}",
            data=export_summary
        )

    except Exception as e:
        logger.error(f"Failed to get CSV export information for {company_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get CSV export information: {str(e)}"
        )
