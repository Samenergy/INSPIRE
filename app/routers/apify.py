"""Apify-specific router for LinkedIn scraping."""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.models import CompanyCreate, APIResponse


class SimpleLinkedInRequest(BaseModel):
    """Simple request model for LinkedIn scraping with just URL."""
    linkedin_url: str
from app.services.company_service_simplified import CompanyService
from app.scrapers.apify_scraper import ApifyScraper
from app.database_mysql import get_mysql_session
from loguru import logger

router = APIRouter()




@router.post(
    "/scrape",
    summary="Simple LinkedIn Scraping",
    description="""
    Simple endpoint for LinkedIn scraping that only requires a LinkedIn URL.
    
    This endpoint:
    1. Uses the configured LinkedIn cookie automatically
    2. Scrapes the provided LinkedIn URL
    3. Exports data to CSV files
    4. Returns scraped data
    
    Perfect for quick LinkedIn scraping with minimal input.
    """,
    response_description="LinkedIn data scraped successfully"
)
async def simple_linkedin_scrape(request: SimpleLinkedInRequest):
    """
    Simple LinkedIn scraping with just a URL.
    
    **Request Body:**
    - **linkedin_url**: LinkedIn URL to scrape (required)
    
    **Returns:**
    - LinkedIn posts and data
    - CSV export information
    - Scraping metadata
    """
    try:
        logger.info(f"Starting simple LinkedIn scraping for URL: {request.linkedin_url}")
        
        # Extract company name from URL if possible
        company_name = "LinkedIn Company"
        if "/company/" in request.linkedin_url:
            try:
                # Extract company name from URL like /company/microsoft/posts/
                url_parts = request.linkedin_url.split("/company/")[1].split("/")[0]
                company_name = url_parts.replace("-", " ").title()
            except:
                company_name = "LinkedIn Company"
        
        # Create company data
        company_data = CompanyCreate(
            name=company_name,
            location="Unknown",  # Required field
            website=None,
            industry=None,
            description=None
        )
        
        # Get database session
        session = await get_mysql_session()
        try:
            # Create or get company
            company_service = CompanyService()
            company = await company_service.create_company(session, company_data)
            logger.info(f"Company created/retrieved with ID: {company.id}")
        finally:
            await session.close()
        
        # Initialize Apify scraper
        apify_scraper = ApifyScraper()
        
        # Scrape LinkedIn data using the provided URL
        scrape_result = await apify_scraper.scrape_company(company, [request.linkedin_url])
        
        # Export to CSV
        from app.services.csv_export_service import CSVExportService
        csv_service = CSVExportService()
        
        exported_files = {}
        try:
            if scrape_result.news_articles:
                news_file = csv_service.export_news_articles(scrape_result.news_articles, company.name)
                if news_file:
                    exported_files['linkedin_posts'] = news_file
            
            if scrape_result.website_updates:
                website_file = csv_service.export_website_updates(scrape_result.website_updates, company.name)
                if website_file:
                    exported_files['website_updates'] = website_file
            
            logger.info(f"CSV files exported: {list(exported_files.keys())}")
        except Exception as e:
            logger.error(f"Failed to export CSV files: {e}")
        
        # Close scraper session
        await apify_scraper.close()
        
        # Prepare response data
        response_data = {
            "company": {
                "id": company.id,
                "name": company.name,
                "location": company.location,
                "website": company.website,
                "industry": company.industry,
                "description": company.description
            },
            "linkedin_data": {
                "posts_count": len(scrape_result.news_articles),
                "website_updates_count": len(scrape_result.website_updates),
                "scraped_url": request.linkedin_url,
                "posts": [
                    {
                        "title": article.title,
                        "url": article.url,
                        "source": article.source,
                        "content": article.content,
                        "published_date": article.published_date.isoformat() if article.published_date else None,
                        "created_at": article.created_at.isoformat()
                    }
                    for article in scrape_result.news_articles
                ],
                "website_updates": [
                    {
                        "url": update.url,
                        "title": update.title,
                        "content": update.content,
                        "detected_at": update.detected_at.isoformat() if update.detected_at else None
                    }
                    for update in scrape_result.website_updates
                ]
            },
            "scraping_metadata": {
                **scrape_result.metadata,
                "csv_files_exported": exported_files,
                "scraped_url": request.linkedin_url
            }
        }
        
        logger.info(f"Simple LinkedIn scraping completed for {request.linkedin_url}")
        
        return APIResponse(
            success=True,
            message=f"LinkedIn data scraped successfully from {request.linkedin_url}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Simple LinkedIn scraping failed for {request.linkedin_url}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"LinkedIn scraping failed: {str(e)}"
        )






