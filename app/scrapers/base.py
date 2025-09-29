"""Base scraper class for all data sources."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass

from app.models import Company, DataSource, NewsArticle, WebsiteUpdate, BusinessRegistry


@dataclass
class ScrapeResult:
    """Result from a scraping operation."""
    news_articles: List[NewsArticle]
    website_updates: List[WebsiteUpdate]
    business_registry: List[BusinessRegistry]
    metadata: Dict[str, Any]


class BaseScraper(ABC):
    """Abstract base class for all scrapers."""
    
    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        self.rate_limit_delay = 1.0  # seconds between requests
    
    @abstractmethod
    async def scrape_company(self, company: Company) -> ScrapeResult:
        """
        Scrape data for a company.
        
        Args:
            company: Company to scrape data for
            
        Returns:
            ScrapeResult containing all collected data
        """
        pass
    
    def _create_news_article(
        self,
        company_id: str,
        title: str,
        url: str,
        source: str,
        content: Optional[str] = None,
        published_date: Optional[datetime] = None,
        raw_data: Optional[Dict[str, Any]] = None
    ) -> NewsArticle:
        """Create a news article object."""
        return NewsArticle(
            id=0,  # Will be set by database
            company_id=int(company_id),
            title=title,
            content=content,
            url=url,
            source=source,
            published_date=published_date,
            data_source=self.data_source,
            raw_data=raw_data or {}
        )
    
    def _create_website_update(
        self,
        company_id: str,
        url: str,
        content_hash: str,
        title: Optional[str] = None,
        meta_description: Optional[str] = None,
        raw_data: Optional[Dict[str, Any]] = None
    ) -> WebsiteUpdate:
        """Create a website update object."""
        return WebsiteUpdate(
            id=0,  # Will be set by database
            company_id=int(company_id),
            url=url,
            title=title,
            meta_description=meta_description,
            content_hash=content_hash,
            data_source=self.data_source,
            raw_data=raw_data or {}
        )
    
    def _create_business_registry(
        self,
        company_id: str,
        registration_number: Optional[str] = None,
        registration_date: Optional[datetime] = None,
        legal_status: Optional[str] = None,
        business_type: Optional[str] = None,
        registered_address: Optional[str] = None,
        officers: Optional[List[Dict[str, Any]]] = None,
        raw_data: Optional[Dict[str, Any]] = None
    ) -> BusinessRegistry:
        """Create a business registry object."""
        return BusinessRegistry(
            id=0,  # Will be set by database
            company_id=int(company_id),
            registration_number=registration_number,
            registration_date=registration_date,
            legal_status=legal_status,
            business_type=business_type,
            registered_address=registered_address,
            officers=officers or [],
            data_source=self.data_source,
            raw_data=raw_data or {}
        )
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = " ".join(text.split())
        
        # Remove common HTML entities
        html_entities = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#39;": "'",
            "&nbsp;": " "
        }
        
        for entity, replacement in html_entities.items():
            text = text.replace(entity, replacement)
        
        return text.strip()
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc
        except:
            return ""
    
    def _generate_content_hash(self, content: str) -> str:
        """Generate hash for content to detect changes."""
        import hashlib
        return hashlib.md5(content.encode('utf-8')).hexdigest()
