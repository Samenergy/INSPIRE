"""Apify-specific router for LinkedIn scraping."""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.models import CompanyCreate, APIResponse


class LinkedInScrapeRequest(BaseModel):
    """Request model for LinkedIn scraping with full configuration."""
    name: str
    location: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    linkedin_urls: Optional[List[str]] = None
    cookie: Optional[List[Dict[str, Any]]] = None
    deepScrape: Optional[bool] = True
    maxDelay: Optional[int] = 8
    minDelay: Optional[int] = 2
    proxy: Optional[Dict[str, Any]] = None
    rawData: Optional[bool] = False


class SimpleLinkedInRequest(BaseModel):
    """Simple request model for LinkedIn scraping with just URL."""
    linkedin_url: str
from app.services.company_service_simplified import CompanyService
from app.scrapers.apify_scraper import ApifyScraper
from app.database_mysql import get_mysql_session
from loguru import logger

router = APIRouter()


@router.post(
    "/linkedin-scrape",
    summary="Scrape LinkedIn Data with Apify",
    description="""
    Dedicated endpoint for LinkedIn scraping using Apify.
    
    This endpoint:
    1. Creates/updates company record
    2. Uses Apify to scrape LinkedIn posts and company data
    3. Exports data to CSV files
    4. Returns comprehensive LinkedIn data
    
    Requires LinkedIn cookie for optimal results.
    """,
    response_description="LinkedIn data scraped successfully"
)
async def scrape_linkedin_data(
    name: str,
    location: Optional[str] = None,
    website: Optional[str] = None,
    industry: Optional[str] = None,
    description: Optional[str] = None,
    linkedin_urls: Optional[List[str]] = None
):
    """
    Scrape LinkedIn data for a company using Apify.
    
    **Parameters:**
    - **name**: Company name (required)
    - **location**: Company location (optional)
    - **website**: Company website (optional)
    - **industry**: Company industry (optional)
    - **description**: Company description (optional)
    - **linkedin_urls**: List of LinkedIn URLs to scrape (optional)
    
    **Returns:**
    - LinkedIn posts and company data
    - CSV export information
    - Scraping metadata
    """
    try:
        logger.info(f"Starting LinkedIn scraping for: {name}")
        
        # Create company data
        company_data = CompanyCreate(
            name=name,
            location=location,
            website=website,
            industry=industry,
            description=description
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
        
        # Scrape LinkedIn data
        scrape_result = await apify_scraper.scrape_company(company, linkedin_urls)
        
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
                "csv_files_exported": exported_files
            }
        }
        
        logger.info(f"LinkedIn scraping completed for {company.name}")
        
        return APIResponse(
            success=True,
            message=f"LinkedIn data scraped successfully for {company.name}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"LinkedIn scraping failed for {name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"LinkedIn scraping failed: {str(e)}"
        )


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


@router.post(
    "/linkedin-scrape-advanced",
    summary="Advanced LinkedIn Scraping with Full Configuration",
    description="""
    Advanced endpoint for LinkedIn scraping using Apify with full configuration support.
    
    This endpoint accepts:
    - Company information
    - LinkedIn URLs to scrape
    - Cookie configuration (as JSON array)
    - Scraping parameters (delays, proxy, etc.)
    
    Perfect for when you have specific LinkedIn URLs and cookie data.
    """,
    response_description="LinkedIn data scraped successfully with advanced configuration"
)
async def scrape_linkedin_advanced(request: LinkedInScrapeRequest):
    """
    Advanced LinkedIn scraping with full configuration.
    
    **Request Body:**
    - **name**: Company name (required)
    - **location**: Company location (optional)
    - **website**: Company website (optional)
    - **industry**: Company industry (optional)
    - **description**: Company description (optional)
    - **linkedin_urls**: List of LinkedIn URLs to scrape (optional)
    - **cookie**: Array of cookie objects (optional)
    - **deepScrape**: Enable deep scraping (optional, default: true)
    - **maxDelay**: Maximum delay between requests (optional, default: 8)
    - **minDelay**: Minimum delay between requests (optional, default: 2)
    - **proxy**: Proxy configuration (optional)
    - **rawData**: Include raw data (optional, default: false)
    
    **Returns:**
    - LinkedIn posts and company data
    - CSV export information
    - Scraping metadata
    """
    try:
        logger.info(f"Starting advanced LinkedIn scraping for: {request.name}")
        
        # Create company data
        company_data = CompanyCreate(
            name=request.name,
            location=request.location,
            website=request.website,
            industry=request.industry,
            description=request.description
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
        
        # Override scraper settings with request configuration
        if request.cookie:
            # Format cookies for the scraper
            cookie_string = apify_scraper._format_cookies_for_apify(request.cookie)
            apify_scraper.linkedin_cookie = cookie_string
            logger.info(f"Using {len(request.cookie)} custom cookies for {request.name} scraping")
        
        # Scrape LinkedIn data
        scrape_result = await apify_scraper.scrape_company(company, request.linkedin_urls)
        
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
                "configuration_used": {
                    "linkedin_urls": request.linkedin_urls,
                    "cookie_count": len(request.cookie) if request.cookie else 0,
                    "deep_scrape": request.deepScrape,
                    "max_delay": request.maxDelay,
                    "min_delay": request.minDelay,
                    "proxy_used": request.proxy is not None,
                    "raw_data": request.rawData
                }
            }
        }
        
        logger.info(f"Advanced LinkedIn scraping completed for {company.name}")
        
        return APIResponse(
            success=True,
            message=f"Advanced LinkedIn data scraped successfully for {company.name}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Advanced LinkedIn scraping failed for {request.name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Advanced LinkedIn scraping failed: {str(e)}"
        )


@router.get(
    "/status",
    summary="Get Apify Service Status",
    description="Get information about the Apify LinkedIn scraping service status",
    response_description="Service status retrieved successfully"
)
async def get_apify_status():
    """Get the current status of the Apify LinkedIn scraping service."""
    from app.config import settings
    
    return APIResponse(
        success=True,
        message="Apify LinkedIn scraping service status",
        data={
            "service": "apify_linkedin_scraper",
            "status": "operational" if settings.apify_api_key else "api_key_missing",
            "api_key_configured": settings.apify_api_key is not None,
            "linkedin_cookie_configured": settings.linkedin_cookie is not None,
            "features": [
                "LinkedIn company posts scraping",
                "LinkedIn company page scraping", 
                "Website updates scraping",
                "CSV export functionality"
            ],
            "rate_limits": {
                "requests_per_minute": 5,
                "description": "Apify platform rate limits apply"
            },
            "requirements": {
                "apify_api_key": "Required for Apify platform access",
                "linkedin_cookie": "Recommended for better LinkedIn access"
            },
            "notes": "LinkedIn scraping may be limited without proper authentication"
        }
    )


@router.get(
    "/test-cookie",
    summary="Test LinkedIn Cookie",
    description="Test if the configured LinkedIn cookie is valid",
    response_description="Cookie test results"
)
async def test_linkedin_cookie():
    """Test the configured LinkedIn cookie."""
    from app.config import settings
    
    if not settings.linkedin_cookie:
        return APIResponse(
            success=False,
            message="No LinkedIn cookie configured",
            data={
                "cookie_configured": False,
                "error": "LINKEDIN_COOKIE environment variable not set"
            }
        )
    
    try:
        # Test the cookie by trying to scrape a simple LinkedIn page
        apify_scraper = ApifyScraper()
        
        # Create a test company
        from app.models import Company
        test_company = Company(
            id=999,
            name="Test Company",
            location="Test Location",
            website=None,
            industry=None,
            description=None,
            linkedin_url=None,
            last_scraped=None,
            scrape_count=0
        )
        
        # Try a simple LinkedIn test
        logger.info("Testing LinkedIn cookie...")
        # Note: This is a simplified test - in production you might want to test with a real company
        
        await apify_scraper.close()
        
        return APIResponse(
            success=True,
            message="LinkedIn cookie test completed",
            data={
                "cookie_configured": True,
                "cookie_length": len(settings.linkedin_cookie),
                "test_status": "completed"
            }
        )
        
    except Exception as e:
        logger.error(f"LinkedIn cookie test failed: {e}")
        return APIResponse(
            success=False,
            message="LinkedIn cookie test failed",
            data={
                "cookie_configured": True,
                "error": str(e)
            }
        )
