
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime

from app.models import CompanyCreate, ComprehensiveScrapeResult, NewsArticle, WebsiteUpdate, BusinessRegistry
from app.services.company_service_simplified import CompanyService
from app.services.csv_export_service import CSVExportService
from app.scrapers.serpapi_scraper import SerpApiScraper
from app.database_mysql import get_mysql_session
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

class ComprehensiveScrapeService:

    def __init__(self):
        self.company_service = CompanyService()
        self.serpapi_scraper = SerpApiScraper()
        self.csv_export_service = CSVExportService()

    async def scrape_company_comprehensive(
        self,
        name: str,
        location: str,
        website: Optional[str] = None,
        industry: Optional[str] = None,
        description: Optional[str] = None
    ) -> ComprehensiveScrapeResult:
        scraping_metadata = {
            "started_at": datetime.utcnow().isoformat(),
            "workflow": "comprehensive_scrape",
            "sources_used": ["serpapi"]
        }

        try:
            logger.info(f"Creating/getting company: {name} in {location}")
            company_data = CompanyCreate(
                name=name,
                location=location,
                website=website,
                industry=industry,
                description=description
            )

            session = await get_mysql_session()
            try:
                company = await self.company_service.create_company(session, company_data)
                logger.info(f"Company created/retrieved with ID: {company.id}")
            finally:
                await session.close()

            logger.info(f"Starting SerpAPI scraping for {company.name}")
            serpapi_data = await self._scrape_with_serpapi(company)

            linkedin_url = self._extract_linkedin_url(serpapi_data)

            linkedin_data = {}
            linkedin_posts = []
            logger.info(f"Apify scraping temporarily disabled - focusing on SerpAPI functionality")

            logger.info(f"Exporting scraped data to CSV files for {company.name}")
            try:
                news_articles = serpapi_data.get("news_articles", [])
                website_updates = serpapi_data.get("website_updates", [])
                business_registry = serpapi_data.get("business_registry", [])

                logger.info(f"Data to export - News: {len(news_articles)}, Website: {len(website_updates)}, Registry: {len(business_registry)}")

                if news_articles:
                    logger.info(f"First article type: {type(news_articles[0])}")
                    logger.info(f"First article: {news_articles[0]}")

                exported_files = self.csv_export_service.export_comprehensive_data(
                    company_name=company.name,
                    news_articles=news_articles,
                    website_updates=website_updates,
                    business_registry=business_registry
                )
                logger.info(f"CSV files exported: {list(exported_files.keys())}")
            except Exception as e:
                logger.error(f"Failed to export CSV files for {company.name}: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                exported_files = {}

            result = ComprehensiveScrapeResult(
                company=company,
                serpapi_data=serpapi_data,
                linkedin_data=linkedin_data,
                news_articles=serpapi_data.get("news_articles", []),
                website_updates=serpapi_data.get("website_updates", []),
                business_registry=serpapi_data.get("business_registry", []),
                linkedin_posts=linkedin_posts,
                scraping_metadata={
                    **scraping_metadata,
                    "completed_at": datetime.utcnow().isoformat(),
                    "linkedin_url_found": linkedin_url is not None,
                    "linkedin_url": linkedin_url,
                    "total_news_articles": len(serpapi_data.get("news_articles", [])),
                    "total_linkedin_posts": len(linkedin_posts),
                    "csv_files_exported": exported_files
                }
            )

            logger.info(f"Comprehensive scraping completed for {company.name}")
            return result

        except Exception as e:
            logger.error(f"Comprehensive scraping failed for {name}: {e}")
            scraping_metadata.update({
                "error": str(e),
                "failed_at": datetime.utcnow().isoformat()
            })
            raise

    async def _scrape_with_serpapi(self, company) -> Dict[str, Any]:
        try:
            serpapi_result = await self.serpapi_scraper.scrape_company(company)

            serpapi_data = {
                "company_info": self._extract_company_info_from_serpapi(serpapi_result),
                "news_articles": serpapi_result.news_articles,
                "website_updates": serpapi_result.website_updates,
                "business_registry": serpapi_result.business_registry,
                "linkedin_search_results": self._extract_linkedin_search_results(serpapi_result),
                "raw_serpapi_data": serpapi_result.metadata
            }

            logger.info(f"SerpAPI scraping completed for {company.name}: "
                       f"{len(serpapi_result.news_articles)} news articles found")

            return serpapi_data

        except Exception as e:
            logger.error(f"SerpAPI scraping failed for {company.name}: {e}")
            return {
                "error": str(e),
                "news_articles": [],
                "website_updates": [],
                "business_registry": []
            }

    def _extract_linkedin_url(self, serpapi_data: Dict[str, Any]) -> Optional[str]:
        try:
            company_info = serpapi_data.get("company_info", {})
            if company_info.get("linkedin_url"):
                return company_info["linkedin_url"]

            linkedin_results = serpapi_data.get("linkedin_search_results", [])
            if linkedin_results:
                first_result = linkedin_results[0]
                if first_result.get("url") and "linkedin.com" in first_result["url"]:
                    return first_result["url"]

            return None

        except Exception as e:
            logger.warning(f"Failed to extract LinkedIn URL: {e}")
            return None

    def _extract_company_info_from_serpapi(self, serpapi_result) -> Dict[str, Any]:
        return {
            "name": serpapi_result.metadata.get("company_name"),
            "description": serpapi_result.metadata.get("description"),
            "industry": serpapi_result.metadata.get("industry"),
            "linkedin_url": serpapi_result.metadata.get("linkedin_url")
        }

    def _extract_linkedin_search_results(self, serpapi_result) -> List[Dict[str, Any]]:
        return []
