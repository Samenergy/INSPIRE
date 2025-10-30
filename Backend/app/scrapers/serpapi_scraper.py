
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.scrapers.base import BaseScraper, ScrapeResult
from app.models import Company, DataSource, NewsArticle, WebsiteUpdate, BusinessRegistry
from app.config import settings
from loguru import logger

class SerpApiScraper(BaseScraper):

    def __init__(self):
        super().__init__(DataSource.SERPAPI)
        self.api_key = settings.serpapi_key
        self.base_url = "https://serpapi.com/search"
        self.session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=settings.request_timeout)
            )
        return self.session

    async def scrape_company(self, company: Company) -> ScrapeResult:
        news_articles = []
        website_updates = []
        business_registry = []

        if not self.api_key:
            logger.warning(f"SerpAPI key not configured, returning empty results for {company.name}")
            return ScrapeResult(
                news_articles=news_articles,
                website_updates=website_updates,
                business_registry=business_registry,
                metadata={"scraper": "serpapi", "timestamp": datetime.utcnow().isoformat(), "error": "API key not configured"}
            )

        try:
            news_articles = await self._scrape_news(company)

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
        articles = []

        try:
            session = await self._get_session()

            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f"{company.name} {company.location}",
                "tbm": "nws",
                "num": 100,  # Request up to 100 results to get more articles
                "gl": "us",
                "hl": "en"
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
        updates = []

        try:
            session = await self._get_session()

            search_queries = [
                f'"{company.name}" {company.location} official website',
                f'"{company.name}" {company.location} linkedin',
                f'"{company.name}" {company.location} social media',
                f'"{company.name}" {company.location} facebook twitter instagram'
            ]

            for query in search_queries:
                try:
                    params = {
                        "api_key": self.api_key,
                        "engine": "google",
                        "q": query,
                        "num": 10
                    }

                    async with session.get(self.base_url, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            organic_results = data.get("organic_results", [])

                            for result in organic_results:
                                try:
                                    url = result.get("link", "")
                                    title = result.get("title", "")
                                    content = result.get("snippet", "")

                                    if any(update.url == url for update in updates):
                                        continue

                                    if self._is_essential_website(url, title, company.name):
                                        update = self._create_website_update(
                                            company_id=str(company.id),
                                            url=url,
                                            content_hash=self._generate_content_hash(content),
                                            title=title,
                                            meta_description=content,
                                            raw_data=result
                                        )
                                        updates.append(update)

                                except Exception as e:
                                    logger.warning(f"Failed to process website update: {e}")
                        else:
                            logger.error(f"SerpAPI search failed for query '{query}': {response.status}")

                except Exception as e:
                    logger.warning(f"Failed to search for query '{query}': {e}")
                    continue

            linkedin_found = any("linkedin.com" in update.url for update in updates)
            if not linkedin_found:
                await self._search_linkedin_specifically(company, updates, session)

        except Exception as e:
            logger.error(f"Failed to scrape website info for {company.name}: {e}")

        return updates

    def _is_essential_website(self, url: str, title: str, company_name: str) -> bool:
        url_lower = url.lower()
        title_lower = title.lower()
        company_lower = company_name.lower()

        if any(pattern in url_lower for pattern in [
            "/posts/", "/status/", "/photos/", "/activity-", "/in/", "/p/"
        ]):
            return False

        if "/in/" in url_lower and "linkedin.com" in url_lower:
            return False

        if any(pattern in url_lower for pattern in [
            "instagram.com/p/", "facebook.com/photos/", "twitter.com/status/", "x.com/status/"
        ]):
            return False

        if any(pattern in url_lower for pattern in [
            f"{company_lower.replace(' ', '')}.com",
            f"{company_lower.replace(' ', '')}.co.",
            f"{company_lower.replace(' ', '')}.org"
        ]):
            return True

        if "linkedin.com/company/" in url_lower and "/posts/" not in url_lower:
            return True

        if any(pattern in url_lower for pattern in [
            f"facebook.com/{company_lower.replace(' ', '')}",
            f"instagram.com/{company_lower.replace(' ', '')}",
            f"twitter.com/{company_lower.replace(' ', '')}",
            f"x.com/{company_lower.replace(' ', '')}"
        ]) and "/posts/" not in url_lower and "/status/" not in url_lower and "/photos/" not in url_lower:
            return True

        if "wikipedia.org" in url_lower and company_lower.replace(' ', '-') in url_lower:
            return True

        if any(keyword in title_lower for keyword in [
            "official", "home", "about", "company", "corporate"
        ]) and company_lower in title_lower:
            return True

        return False

    async def _search_linkedin_specifically(self, company: Company, updates: List[WebsiteUpdate], session) -> None:
        try:
            linkedin_queries = [
                f'"{company.name}" site:linkedin.com/company',
                f'"{company.name}" {company.location} site:linkedin.com/company',
                f'"{company.name}" linkedin company page',
                f'"{company.name}" {company.location} linkedin company'
            ]

            for query in linkedin_queries:
                try:
                    params = {
                        "api_key": self.api_key,
                        "engine": "google",
                        "q": query,
                        "num": 5
                    }

                    async with session.get(self.base_url, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            organic_results = data.get("organic_results", [])

                            for result in organic_results:
                                url = result.get("link", "")
                                title = result.get("title", "")

                                if "linkedin.com/company" in url and self._is_essential_website(url, title, company.name):
                                    if not any(update.url == url for update in updates):
                                        try:
                                            content = result.get("snippet", "")

                                            update = self._create_website_update(
                                                company_id=str(company.id),
                                                url=url,
                                                content_hash=self._generate_content_hash(content),
                                                title=title,
                                                meta_description=content,
                                                raw_data=result
                                            )
                                            updates.append(update)
                                            logger.info(f"Found LinkedIn URL for {company.name}: {url}")
                                            return

                                        except Exception as e:
                                            logger.warning(f"Failed to process LinkedIn URL: {e}")

                except Exception as e:
                    logger.warning(f"Failed to search LinkedIn with query '{query}': {e}")
                    continue

        except Exception as e:
            logger.warning(f"Failed to search for LinkedIn specifically: {e}")

    async def _find_company_website(self, company: Company) -> Optional[str]:
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

                    for result in organic_results:
                        link = result.get("link", "")
                        title = result.get("title", "").lower()

                        if any(keyword in title for keyword in ["official", "home", "about"]):
                            return link

                    if organic_results:
                        return organic_results[0].get("link")

        except Exception as e:
            logger.error(f"Failed to find website for {company.name}: {e}")

        return None

    async def _scrape_business_info(self, company: Company) -> List[BusinessRegistry]:
        registry_info = []

        try:
            session = await self._get_session()

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

                    for result in organic_results:
                        link = result.get("link", "")
                        snippet = result.get("snippet", "")

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
        if not date_str:
            return None

        try:
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

            if "hour" in date_str or "day" in date_str or "week" in date_str:
                import dateparser
                parsed = dateparser.parse(date_str)
                if parsed:
                    return parsed

            return datetime.utcnow()

        except Exception as e:
            logger.warning(f"Failed to parse date '{date_str}': {e}")
            return datetime.utcnow()

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
