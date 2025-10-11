"""Apify scraper for collecting company data."""

import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.scrapers.base import BaseScraper, ScrapeResult
from app.models import Company, DataSource, NewsArticle, WebsiteUpdate, BusinessRegistry
from app.config import settings
from loguru import logger


class ApifyScraper(BaseScraper):
    """Scraper for Apify platform."""
    
    def __init__(self):
        super().__init__(DataSource.APIFY)
        self.api_key = settings.apify_api_key
        self.linkedin_cookie = settings.linkedin_cookie
        self.base_url = "https://api.apify.com/v2"
        self.session = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=aiohttp.ClientTimeout(total=settings.request_timeout)
            )
        return self.session
    
    def _format_cookies_for_apify(self, cookie_data: List[Dict[str, Any]]) -> str:
        """Format cookie data for Apify input."""
        if not cookie_data:
            return ""
        
        # Convert cookie list to cookie string format
        cookie_pairs = []
        for cookie in cookie_data:
            name = cookie.get('name', '')
            value = cookie.get('value', '')
            if name and value:
                cookie_pairs.append(f"{name}={value}")
        
        return "; ".join(cookie_pairs)
    
    def _get_linkedin_urls(self, company: Company, provided_urls: List[str] = None) -> List[str]:
        """Get LinkedIn URLs for scraping."""
        urls = []
        
        # Use provided URLs if available
        if provided_urls:
            urls.extend(provided_urls)
        
        # Add company's LinkedIn URL if available
        if company.linkedin_url:
            urls.append(company.linkedin_url)
        
        # Generate URLs based on company name
        if not urls:
            company_slug = self._get_company_slug(company.name)
            urls.extend([
                f"https://www.linkedin.com/company/{company_slug}/posts/",
                f"https://www.linkedin.com/company/{company_slug}/"
            ])
        
        return urls
    
    async def scrape_company(self, company: Company, linkedin_urls: List[str] = None) -> ScrapeResult:
        """Scrape company data using Apify with LinkedIn focus."""
        news_articles = []
        website_updates = []
        business_registry = []
        
        try:
            # Get LinkedIn URLs for scraping
            linkedin_urls = self._get_linkedin_urls(company, linkedin_urls)
            logger.info(f"Scraping LinkedIn URLs for {company.name}: {linkedin_urls}")
            
            # Try Apify LinkedIn scraping first
            try:
                linkedin_posts = await self._scrape_news(company, linkedin_urls)
                news_articles.extend(linkedin_posts)
                
                # Fallback: Try LinkedIn company page if no posts found
                if not news_articles:
                    logger.info(f"No LinkedIn posts found for {company.name}, trying company page...")
                    company_posts = await self._scrape_linkedin_company_page(company, linkedin_urls)
                    news_articles.extend(company_posts)
                    
            except Exception as e:
                logger.warning(f"Apify LinkedIn scraping failed for {company.name}: {e}")
                # Try to get data from recent successful runs
                try:
                    recent_posts = await self._get_recent_successful_runs(company)
                    news_articles.extend(recent_posts)
                    logger.info(f"Retrieved {len(recent_posts)} posts from recent successful runs")
                except Exception as e2:
                    logger.warning(f"Failed to get data from recent runs: {e2}")
                    logger.info("Apify actors are not accessible - this is expected")
            
            # Scrape website updates (minimal focus)
            try:
                website_updates = await self._scrape_website(company)
            except Exception as e:
                logger.warning(f"Apify website scraping failed for {company.name}: {e}")
                logger.info("Apify web scraper is not accessible - this is expected")
            
            # Skip business registry for LinkedIn-focused scraping
            business_registry = []
            
            logger.info(f"Apify LinkedIn scraping completed for {company.name}: "
                       f"{len(news_articles)} LinkedIn posts, {len(website_updates)} website updates")
            
            return ScrapeResult(
                news_articles=news_articles,
                website_updates=website_updates,
                business_registry=business_registry,
                metadata={
                    "scraper": "apify_linkedin", 
                    "timestamp": datetime.utcnow().isoformat(),
                    "focus": "linkedin_posts",
                    "posts_scraped": len(news_articles),
                    "status": "apify_actors_unavailable",
                    "note": "Apify actors are not accessible - using fallback mode"
                }
            )
            
        except Exception as e:
            logger.error(f"Apify LinkedIn scraping failed for {company.name}: {e}")
            raise
    
    async def _scrape_news(self, company: Company, linkedin_urls: List[str] = None) -> List[NewsArticle]:
        """Scrape LinkedIn posts for the company."""
        articles = []
        
        try:
            # Use LinkedIn post scraper from Apify
            actor_id = "kfiWbq3boy3dWKbiL"
            
            # Prepare URLs for scraping
            if not linkedin_urls:
                linkedin_urls = [f"https://www.linkedin.com/company/{self._get_company_slug(company.name)}/posts/"]
            
            # Prepare input for LinkedIn post scraper
            input_data = {
                "urls": linkedin_urls,
                "maxPosts": 50,
                "proxy": {
                    "useApifyProxy": True,
                    "apifyProxyCountry": "US"
                }
            }
            
            # Add LinkedIn cookies if available
            if self.linkedin_cookie:
                try:
                    # Try to parse as JSON array of cookies
                    import json
                    cookie_data = json.loads(self.linkedin_cookie)
                    if isinstance(cookie_data, list):
                        # Use cookies as array for Apify
                        input_data["cookie"] = cookie_data
                        logger.info(f"Using {len(cookie_data)} LinkedIn cookies for {company.name} scraping")
                    else:
                        # Convert single cookie to array format
                        input_data["cookie"] = [{"name": "li_at", "value": self.linkedin_cookie, "domain": ".linkedin.com"}]
                        logger.info(f"Using LinkedIn cookie string for {company.name} scraping")
                except (json.JSONDecodeError, TypeError):
                    # Convert single cookie to array format
                    input_data["cookie"] = [{"name": "li_at", "value": self.linkedin_cookie, "domain": ".linkedin.com"}]
                    logger.info(f"Using LinkedIn cookie string for {company.name} scraping")
            else:
                logger.warning("No LinkedIn cookie provided - scraping may be limited")
                # Set a default empty cookie array to satisfy the requirement
                input_data["cookie"] = []
            
            # Ensure both required fields are present
            if "cookie" not in input_data:
                input_data["cookie"] = []
            if "proxy" not in input_data:
                input_data["proxy"] = {
                    "useApifyProxy": True,
                    "apifyProxyCountry": "US"
                }
            
            # Run the actor
            run_id = await self._run_actor(actor_id, input_data)
            if run_id:
                results = await self._get_actor_results(run_id)
                
                for item in results:
                    try:
                        # Extract post data from LinkedIn scraper result
                        if not item.get("text") and not item.get("content"):
                            continue
                            
                        # Create article from LinkedIn post
                        text_content = item.get("text") or item.get("content", "")
                        article = self._create_news_article(
                            company_id=company.id,
                            title=text_content[:200] + "..." if len(text_content) > 200 else text_content,
                            url=item.get("url", ""),
                            source="LinkedIn",
                            content=text_content,
                            published_date=self._parse_date(item.get("publishedAt") or item.get("date")),
                            raw_data={
                                "post_data": item,
                                "scraper": "apify_linkedin_post_scraper"
                            }
                        )
                        articles.append(article)
                    except Exception as e:
                        logger.warning(f"Failed to process LinkedIn post: {e}")
            else:
                logger.warning(f"Failed to run LinkedIn posts actor {actor_id} for {company.name}")
                # Try alternative approach or return empty results
                        
        except Exception as e:
            logger.error(f"Failed to scrape LinkedIn posts for {company.name}: {e}")
        
        return articles
    
    async def _get_recent_successful_runs(self, company: Company) -> List[NewsArticle]:
        """Get data from recent successful Apify runs."""
        articles = []
        
        try:
            session = await self._get_session()
            
            # Get recent runs for the LinkedIn actor
            actor_id = "kfiWbq3boy3dWKbiL"
            runs_url = f"{self.base_url}/acts/{actor_id}/runs"
            
            async with session.get(runs_url) as response:
                if response.status == 200:
                    data = await response.json()
                    runs = data.get("data", {}).get("items", [])
                    
                    # Find the most recent successful run
                    successful_runs = [run for run in runs if run.get("status") == "SUCCEEDED"]
                    
                    if successful_runs:
                        # Get the most recent successful run
                        latest_run = successful_runs[0]
                        run_id = latest_run["id"]
                        
                        # Get the dataset items from this run
                        dataset_url = f"{self.base_url}/actor-runs/{run_id}/dataset/items"
                        async with session.get(dataset_url) as dataset_response:
                            if dataset_response.status == 200:
                                posts_data = await dataset_response.json()
                                
                                for post in posts_data:
                                    try:
                                        # Create article from LinkedIn post
                                        text_content = post.get("text", "")
                                        if text_content:
                                            article = self._create_news_article(
                                                company_id=company.id,
                                                title=text_content[:200] + "..." if len(text_content) > 200 else text_content,
                                                url=post.get("url", ""),
                                                source="LinkedIn",
                                                content=text_content,
                                                published_date=self._parse_date(post.get("timeSincePosted")),
                                                raw_data={
                                                    "post_data": post,
                                                    "scraper": "apify_linkedin_recent_run"
                                                }
                                            )
                                            articles.append(article)
                                    except Exception as e:
                                        logger.warning(f"Failed to process LinkedIn post from recent run: {e}")
                                        
                        logger.info(f"Retrieved {len(articles)} posts from recent successful run {run_id}")
                    else:
                        logger.info("No successful runs found")
                        
        except Exception as e:
            logger.error(f"Failed to get data from recent successful runs: {e}")
            
        return articles
    
    async def _scrape_website(self, company: Company) -> List[WebsiteUpdate]:
        """Scrape website updates for the company."""
        updates = []
        
        try:
            if not company.website:
                return updates
            
            # Use Web Scraper from Apify
            actor_id = "apify/web-scraper"
            
            input_data = {
                "startUrls": [{"url": str(company.website)}],
                "maxRequestsPerCrawl": 10,
                "pageFunction": """
                async function pageFunction(context) {
                    const { page, request, log } = context;
                    
                    await page.waitForLoadState('networkidle');
                    
                    const title = await page.title();
                    const metaDescription = await page.$eval('meta[name="description"]', 
                        el => el.getAttribute('content')) || '';
                    
                    const content = await page.textContent('body');
                    
                    return {
                        title: title,
                        metaDescription: metaDescription,
                        content: content,
                        url: request.url
                    };
                }
                """
            }
            
            run_id = await self._run_actor(actor_id, input_data)
            if run_id:
                results = await self._get_actor_results(run_id)
                
                for item in results:
                    try:
                        content = item.get("content", "")
                        update = self._create_website_update(
                            company_id=str(company.id),
                            url=item.get("url", ""),
                            content_hash=self._generate_content_hash(content),
                            title=item.get("title", ""),
                            meta_description=item.get("metaDescription", ""),
                            raw_data=item
                        )
                        updates.append(update)
                    except Exception as e:
                        logger.warning(f"Failed to process website update: {e}")
                        
        except Exception as e:
            logger.error(f"Failed to scrape website for {company.name}: {e}")
        
        return updates
    
    async def _scrape_business_registry(self, company: Company) -> List[BusinessRegistry]:
        """Scrape business registry information."""
        registry_info = []
        
        try:
            # This would depend on specific business registry scrapers available in Apify
            # For now, we'll return empty list as business registry scraping is complex
            # and depends on specific jurisdictions and available actors
            pass
            
        except Exception as e:
            logger.error(f"Failed to scrape business registry for {company.name}: {e}")
        
        return registry_info
    
    async def _run_actor(self, actor_id: str, input_data: Dict[str, Any]) -> Optional[str]:
        """Run an Apify actor and return the run ID."""
        try:
            session = await self._get_session()
            
            url = f"{self.base_url}/acts/{actor_id}/runs"
            async with session.post(url, json=input_data) as response:
                if response.status == 201:
                    data = await response.json()
                    return data.get("data", {}).get("id")
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to run actor {actor_id}: {response.status} - {error_text}")
                    
                    # Check if it's a 404 error (actor not found)
                    if response.status == 404:
                        logger.error(f"Actor {actor_id} not found. Please check if the actor name is correct.")
                    elif response.status == 401:
                        logger.error(f"Unauthorized access to actor {actor_id}. Please check your API key.")
                    elif response.status == 403:
                        logger.error(f"Forbidden access to actor {actor_id}. Please check your permissions.")
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Error running actor {actor_id}: {e}")
            return None
    
    async def _get_actor_results(self, run_id: str) -> List[Dict[str, Any]]:
        """Get results from an Apify actor run."""
        try:
            session = await self._get_session()
            
            # Wait for the run to complete
            max_wait_time = 300  # 5 minutes
            wait_time = 0
            
            while wait_time < max_wait_time:
                url = f"{self.base_url}/actor-runs/{run_id}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        status = data.get("data", {}).get("status")
                        
                        # Log progress every 30 seconds
                        if wait_time % 30 == 0:
                            logger.info(f"Actor run {run_id} status: {status} (waited {wait_time}s)")
                        
                        if status == "SUCCEEDED":
                            # Get the results
                            results_url = f"{self.base_url}/actor-runs/{run_id}/dataset/items"
                            async with session.get(results_url) as results_response:
                                if results_response.status == 200:
                                    results = await results_response.json()
                                    logger.info(f"Successfully retrieved {len(results)} items from actor run {run_id}")
                                    return results
                                else:
                                    logger.error(f"Failed to get results: {results_response.status}")
                                    return []
                        elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
                            error_message = data.get("data", {}).get("statusMessage", "No error message")
                            logger.error(f"Actor run {run_id} failed with status: {status}, message: {error_message}")
                            return []
                        else:
                            # Still running, wait and check again
                            await asyncio.sleep(10)
                            wait_time += 10
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to check run status: {response.status} - {error_text}")
                        return []
                        
            logger.error(f"Actor run {run_id} timed out")
            return []
            
        except Exception as e:
            logger.error(f"Error getting actor results: {str(e)}")
            logger.exception(f"Full error traceback for run {run_id}:")
            return []
    
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
            
            # If none work, try dateparser
            import dateparser
            parsed = dateparser.parse(date_str)
            return parsed
            
        except Exception as e:
            logger.warning(f"Failed to parse date '{date_str}': {e}")
            return None
    
    def _get_company_slug(self, company_name: str) -> str:
        """Convert company name to LinkedIn slug format."""
        # Remove common suffixes and clean the name
        clean_name = company_name.lower()
        suffixes = [' inc', ' corp', ' corporation', ' ltd', ' limited', ' llc', ' l.l.c', ' co', ' company']
        
        for suffix in suffixes:
            if clean_name.endswith(suffix):
                clean_name = clean_name[:-len(suffix)].strip()
                break
        
        # Convert to slug format
        slug = clean_name.replace(' ', '-').replace('&', 'and')
        # Remove special characters
        import re
        slug = re.sub(r'[^\w\-]', '', slug)
        return slug
    
    def _clean_linkedin_content(self, post_data: dict) -> str:
        """Clean and format LinkedIn post content."""
        content_parts = []
        
        # Main post text
        if post_data.get('text'):
            content_parts.append(post_data['text'])
        
        # Add hashtags
        if post_data.get('hashtags'):
            hashtags = ' '.join([f"#{tag}" for tag in post_data['hashtags']])
            content_parts.append(f"Hashtags: {hashtags}")
        
        # Add mentioned companies/people
        if post_data.get('mentionedCompanies'):
            companies = ', '.join([comp.get('name', '') for comp in post_data['mentionedCompanies']])
            content_parts.append(f"Mentioned: {companies}")
        
        # Add media info
        if post_data.get('images'):
            content_parts.append(f"[{len(post_data['images'])} image(s) attached]")
        
        if post_data.get('videos'):
            content_parts.append(f"[{len(post_data['videos'])} video(s) attached]")
        
        return '\n\n'.join(content_parts)
    
    async def _scrape_linkedin_company_page(self, company: Company, linkedin_urls: List[str] = None) -> List[NewsArticle]:
        """Alternative method to scrape LinkedIn company page directly."""
        articles = []
        
        try:
            # Use LinkedIn Company Scraper
            actor_id = "kfiWbq3boy3dWKbiL"
            
            # Use provided URLs or generate default ones
            if linkedin_urls:
                company_urls = linkedin_urls
            else:
                # Try different LinkedIn URL formats
                company_urls = [
                    f"https://www.linkedin.com/company/{self._get_company_slug(company.name)}/",
                    f"https://www.linkedin.com/company/{company.name.lower().replace(' ', '-')}/"
                ]
            
            for url in company_urls:
                input_data = {
                    "urls": [url],
                    "maxPosts": 30,
                    "maxComments": 5,
                    "includePosts": True,
                    "includeComments": False,
                    "includeReactions": True,
                    "includeJobs": False,
                    "includeEvents": False,
                    "proxy": {
                        "useApifyProxy": True,
                        "apifyProxyCountry": "US"
                    }
                }
                
                # Add LinkedIn cookie if available (use correct field name 'cookie' not 'cookies')
                if self.linkedin_cookie:
                    try:
                        # Try to parse as JSON array of cookies
                        import json
                        cookie_data = json.loads(self.linkedin_cookie)
                        if isinstance(cookie_data, list):
                            input_data["cookie"] = cookie_data
                        else:
                            # Convert single cookie to array format
                            input_data["cookie"] = [{"name": "li_at", "value": self.linkedin_cookie, "domain": ".linkedin.com"}]
                    except (json.JSONDecodeError, TypeError):
                        # Convert single cookie to array format
                        input_data["cookie"] = [{"name": "li_at", "value": self.linkedin_cookie, "domain": ".linkedin.com"}]
                else:
                    # Set empty cookie array to satisfy requirement
                    input_data["cookie"] = []
                
                run_id = await self._run_actor(actor_id, input_data)
                if run_id:
                    results = await self._get_actor_results(run_id)
                    
                    for item in results:
                        try:
                            posts = item.get("posts", [])
                            for post in posts:
                                article = self._create_news_article(
                                    company_id=str(company.id),
                                    title=post.get("text", "")[:200] + "..." if len(post.get("text", "")) > 200 else post.get("text", ""),
                                    url=post.get("url", ""),
                                    source="LinkedIn",
                                    content=self._clean_linkedin_content(post),
                                    published_date=self._parse_date(post.get("publishedAt")),
                                    raw_data={
                                        "post_data": post,
                                        "company_info": item.get("companyInfo", {}),
                                        "scraper": "apify_linkedin_company"
                                    }
                                )
                                articles.append(article)
                        except Exception as e:
                            logger.warning(f"Failed to process LinkedIn company post: {e}")
                    
                    # If we got results, break out of the loop
                    if results:
                        break
                        
        except Exception as e:
            logger.error(f"Failed to scrape LinkedIn company page for {company.name}: {e}")
        
        return articles
    
    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()
