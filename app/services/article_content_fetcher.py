"""Article Content Fetcher Service.

Fetches full article content from URLs to improve intelligence extraction quality.
"""

import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from loguru import logger
import re


class ArticleContentFetcher:
    """Fetches full article content from URLs."""
    
    def __init__(self, timeout: int = 10, max_concurrent: int = 5):
        """
        Initialize the content fetcher.
        
        Args:
            timeout: Request timeout in seconds
            max_concurrent: Maximum concurrent requests
        """
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.session = None
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout),
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
        return self.session
    
    def _extract_article_text(self, html: str) -> str:
        """
        Extract main article text from HTML.
        
        YOUR CONTRIBUTION: Custom text extraction logic with quality filtering
        """
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Remove script, style, nav, header, footer, ads, sidebars
            for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
                tag.decompose()
            
            # Remove common ad/sidebar classes
            for class_name in ['ad', 'advertisement', 'sidebar', 'related', 'comments']:
                for element in soup.find_all(class_=re.compile(class_name, re.I)):
                    element.decompose()
            
            # Try to find article content in common tags
            article_text = None
            
            # Try article tag first
            article = soup.find('article')
            if article:
                article_text = article.get_text(separator=' ', strip=True)
            
            # Try main content areas
            if not article_text:
                for selector in ['main', 'div[class*="content"]', 'div[class*="article"]', 'div[class*="story"]']:
                    element = soup.select_one(selector)
                    if element:
                        article_text = element.get_text(separator=' ', strip=True)
                        break
            
            # Fallback to body
            if not article_text:
                body = soup.find('body')
                if body:
                    article_text = body.get_text(separator=' ', strip=True)
            
            # Clean up the text
            if article_text:
                # Remove extra whitespace
                article_text = re.sub(r'\s+', ' ', article_text)
                article_text = article_text.strip()
                
                # Check if this is likely a help page or non-article content
                article_lower = article_text.lower()
                help_indicators = [
                    'help center', 'customer support', 'contact us',
                    'frequently asked questions', 'faq', 'terms of service',
                    'privacy policy', 'cookie policy'
                ]
                
                # If it's clearly a help/policy page, return empty
                help_count = sum(1 for indicator in help_indicators if indicator in article_lower[:500])
                if help_count >= 2:
                    logger.debug("Detected help/policy page, skipping")
                    return ""
                
                # Limit to reasonable length (first 5000 chars)
                if len(article_text) > 5000:
                    article_text = article_text[:5000] + "..."
            
            return article_text or ""
            
        except Exception as e:
            logger.warning(f"Error extracting text from HTML: {e}")
            return ""
    
    async def fetch_article_content(self, article: Dict[str, str]) -> Dict[str, str]:
        """
        Fetch full content for a single article.
        
        Args:
            article: Dict with 'title', 'content', 'url'
            
        Returns:
            Article with enhanced content
        """
        async with self.semaphore:
            url = article.get('url', '')
            
            # If no URL, return as-is
            if not url or not url.startswith('http'):
                return article
            
            # Skip certain domains that block scraping
            skip_domains = ['youtube.com', 'twitter.com', 'x.com', 'facebook.com']
            if any(domain in url.lower() for domain in skip_domains):
                return article
            
            try:
                session = await self._get_session()
                
                async with session.get(url, allow_redirects=True) as response:
                    if response.status == 200:
                        html = await response.text()
                        full_text = self._extract_article_text(html)
                        
                        # Only use fetched content if it's substantial
                        if len(full_text) > len(article.get('content', '')):
                            article['content'] = full_text
                            article['content_fetched'] = True
                            logger.debug(f"✅ Fetched full content from {url[:50]}...")
                        else:
                            article['content_fetched'] = False
                    else:
                        logger.debug(f"Failed to fetch {url}: HTTP {response.status}")
                        article['content_fetched'] = False
                        
            except asyncio.TimeoutError:
                logger.debug(f"Timeout fetching {url}")
                article['content_fetched'] = False
            except Exception as e:
                logger.debug(f"Error fetching {url}: {e}")
                article['content_fetched'] = False
            
            return article
    
    async def fetch_multiple_articles(self, articles: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Fetch full content for multiple articles concurrently.
        
        Args:
            articles: List of article dicts
            
        Returns:
            Articles with enhanced content
        """
        if not articles:
            return []
        
        logger.info(f"Fetching full content for {len(articles)} articles...")
        
        # Fetch all articles concurrently
        tasks = [self.fetch_article_content(article) for article in articles]
        enhanced_articles = await asyncio.gather(*tasks, return_exceptions=False)
        
        # Count successful fetches
        success_count = sum(1 for a in enhanced_articles if a.get('content_fetched', False))
        logger.info(f"✅ Successfully fetched full content for {success_count}/{len(articles)} articles")
        
        return enhanced_articles
    
    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()


