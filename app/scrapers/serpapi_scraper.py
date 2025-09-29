"""SerpAPI scraper for collecting company data."""

import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.scrapers.base import BaseScraper, ScrapeResult
from app.models import Company, DataSource, NewsArticle, WebsiteUpdate, BusinessRegistry
from app.config import settings
from loguru import logger


class SerpApiScraper(BaseScraper):
    """Scraper for SerpAPI platform."""
    
    def __init__(self):
        super().__init__(DataSource.SERPAPI)
        self.api_key = settings.serpapi_key
        self.base_url = "https://serpapi.com/search"
        self.session = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=settings.request_timeout)
            )
        return self.session
    
    async def scrape_company(self, company: Company) -> ScrapeResult:
        """Scrape company data using SerpAPI."""
        news_articles = []
        website_updates = []
        business_registry = []
        
        # Check if API key is configured
        if not self.api_key:
            logger.warning(f"SerpAPI key not configured, returning empty results for {company.name}")
            return ScrapeResult(
                news_articles=news_articles,
                website_updates=website_updates,
                business_registry=business_registry,
                metadata={"scraper": "serpapi", "timestamp": datetime.utcnow().isoformat(), "error": "API key not configured"}
            )
        
        try:
            # Scrape news articles
            news_articles = await self._scrape_news(company)
            
            # Scrape website information
            website_updates = await self._scrape_website_info(company)
            
            logger.info(f"SerpAPI scraping completed for {company.name}: "
                       f"{len(news_articles)} news, {len(website_updates)} website updates")
            
            return ScrapeResult(
                news_articles=news_articles,
                website_updates=website_updates,
                business_registry=business_registry,
                metadata={"scraper": "serpapi", "timestamp": datetime.utcnow().isoformat()}
            )
            
        except Exception as e:
            logger.error(f"SerpAPI scraping failed for {company.name}: {e}")
            raise
    
    async def _scrape_news(self, company: Company) -> List[NewsArticle]:
        """Scrape news articles using Google News via SerpAPI."""
        articles = []
        
        try:
            session = await self._get_session()
            
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f"{company.name} {company.location}",
                "tbm": "nws",  # Google News
                "num": 20,
                "gl": "us",  # Country
                "hl": "en"   # Language
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    news_results = data.get("news_results", [])
                    
                    logger.info(f"SerpAPI returned {len(news_results)} news results for {company.name}")
                    
                    for item in news_results:
                        try:
                            article = self._create_news_article(
                                company_id=str(company.id),
                                title=item.get("title", ""),
                                url=item.get("link", ""),
                                source=item.get("source", "Google News"),
                                content=item.get("snippet", ""),
                                published_date=self._parse_date(item.get("date")),
                                raw_data=item
                            )
                            articles.append(article)
                        except Exception as e:
                            logger.warning(f"Failed to process news article: {e}")
                else:
                    logger.error(f"SerpAPI news request failed: {response.status}")
                    response_text = await response.text()
                    logger.error(f"Response body: {response_text}")
                    
        except Exception as e:
            logger.error(f"Failed to scrape news for {company.name}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
        
        return articles
    
    async def _scrape_website_info(self, company: Company) -> List[WebsiteUpdate]:
        """Scrape website information using Google search via SerpAPI."""
        updates = []
        
        try:
            if not company.website:
                # Try to find the company website
                website_url = await self._find_company_website(company)
                if not website_url:
                    return updates
            else:
                website_url = str(company.website)
            
            session = await self._get_session()
            
            # Get organic results for the company
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f'"{company.name}" {company.location} site:{self._extract_domain(website_url)}',
                "num": 10
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    organic_results = data.get("organic_results", [])
                    
                    for result in organic_results:
                        try:
                            content = result.get("snippet", "")
                            update = self._create_website_update(
                                company_id=str(company.id),
                                url=result.get("link", ""),
                                content_hash=self._generate_content_hash(content),
                                title=result.get("title", ""),
                                meta_description=content,
                                raw_data=result
                            )
                            updates.append(update)
                        except Exception as e:
                            logger.warning(f"Failed to process website update: {e}")
                else:
                    logger.error(f"SerpAPI website search failed: {response.status}")
                    
        except Exception as e:
            logger.error(f"Failed to scrape website info for {company.name}: {e}")
        
        return updates
    
    async def _find_company_website(self, company: Company) -> Optional[str]:
        """Find company website using Google search."""
        try:
            session = await self._get_session()
            
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f'"{company.name}" {company.location} official website',
                "num": 5
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    organic_results = data.get("organic_results", [])
                    
                    # Look for official website links
                    for result in organic_results:
                        link = result.get("link", "")
                        title = result.get("title", "").lower()
                        
                        # Check if it looks like an official website
                        if any(keyword in title for keyword in ["official", "home", "about"]):
                            return link
                    
                    # Return first result if no official website found
                    if organic_results:
                        return organic_results[0].get("link")
                        
        except Exception as e:
            logger.error(f"Failed to find website for {company.name}: {e}")
        
        return None
    
    async def _scrape_business_info(self, company: Company) -> List[BusinessRegistry]:
        """Scrape business information using Google search."""
        registry_info = []
        
        try:
            session = await self._get_session()
            
            # Search for business registry information
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f'"{company.name}" {company.location} business registry registration',
                "num": 10
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    organic_results = data.get("organic_results", [])
                    
                    # Look for business registry results
                    for result in organic_results:
                        link = result.get("link", "")
                        snippet = result.get("snippet", "")
                        
                        # Check if it's from a business registry
                        if any(keyword in link.lower() for keyword in ["business.gov", "companies", "registry"]):
                            try:
                                registry = self._create_business_registry(
                                    company_id=str(company.id),
                                    raw_data=result
                                )
                                registry_info.append(registry)
                            except Exception as e:
                                logger.warning(f"Failed to process business registry info: {e}")
                        
        except Exception as e:
            logger.error(f"Failed to scrape business info for {company.name}: {e}")
        
        return registry_info
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse date string to datetime object."""
        if not date_str:
            return None
        
        try:
            # Try common date formats
            formats = [
                "%Y-%m-%dT%H:%M:%S.%fZ",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d"
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            # Try relative date parsing
            if "hour" in date_str or "day" in date_str or "week" in date_str:
                import dateparser
                parsed = dateparser.parse(date_str)
                if parsed:
                    return parsed
            
            # Default to current time if parsing fails
            return datetime.utcnow()
            
        except Exception as e:
            logger.warning(f"Failed to parse date '{date_str}': {e}")
            return datetime.utcnow()
    
    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()
