"""Simplified Pydantic models for the company data scraping service."""

from datetime import datetime
from typing import List, Optional, Dict, Any, Generic, TypeVar
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class DataSource(str, Enum):
    """Enumeration of available data sources."""
    APIFY = "apify"
    SERPAPI = "serpapi"


T = TypeVar('T')


class CompanyCreate(BaseModel):
    """Model for creating a new company."""
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=2083)
    industry: Optional[str] = None
    description: Optional[str] = None


class Company(BaseModel):
    """Complete company model."""
    id: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=2083)
    industry: Optional[str] = None
    description: Optional[str] = None
    linkedin_url: Optional[str] = None
    last_scraped: Optional[datetime] = None
    scrape_count: int = 0


class NewsArticle(BaseModel):
    """Model for news articles."""
    id: int
    company_id: int
    title: str = Field(..., min_length=1, max_length=500)
    url: str = Field(..., min_length=1, max_length=1000)
    source: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    published_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = Field(default_factory=dict)


class WebsiteUpdate(BaseModel):
    """Model for website updates."""
    id: int
    company_id: int
    url: str = Field(..., min_length=1, max_length=1000)
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    change_type: Optional[str] = Field(None, max_length=100)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = Field(default_factory=dict)


class BusinessRegistry(BaseModel):
    """Model for business registry information."""
    id: int
    company_id: int
    registration_number: Optional[str] = Field(None, max_length=255)
    registration_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=100)
    jurisdiction: Optional[str] = Field(None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = Field(default_factory=dict)


class ComprehensiveScrapeRequest(BaseModel):
    """Model for comprehensive company scraping (name + location input)."""
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    location: str = Field(..., min_length=1, max_length=255, description="Company location")
    website: Optional[str] = Field(None, max_length=2083, description="Company website (optional)")
    industry: Optional[str] = None
    description: Optional[str] = None


class ComprehensiveScrapeResult(BaseModel):
    """Model for comprehensive scrape results."""
    company: Company
    serpapi_data: Dict[str, Any] = Field(default_factory=dict)
    linkedin_data: Dict[str, Any] = Field(default_factory=dict)
    news_articles: List[NewsArticle] = Field(default_factory=list)
    website_updates: List[WebsiteUpdate] = Field(default_factory=list)
    business_registry: List[BusinessRegistry] = Field(default_factory=list)
    linkedin_posts: List[Dict[str, Any]] = Field(default_factory=list)
    scraping_metadata: Dict[str, Any] = Field(default_factory=dict)


class ScrapeJob(BaseModel):
    """Model for scrape jobs."""
    id: int
    company_id: int
    status: str = "pending"
    scraper_type: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    job_metadata: Dict[str, Any] = Field(default_factory=dict)


class CompanyInsights(BaseModel):
    """Model for aggregated company insights."""
    id: int
    company_id: int
    total_articles: int = 0
    total_website_updates: int = 0
    total_business_registry_entries: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    insights_data: Dict[str, Any] = Field(default_factory=dict)
    raw_data: Dict[str, Any] = Field(default_factory=dict)


class APIResponse(BaseModel, Generic[T]):
    """Standard API response model."""
    success: bool = True
    message: str
    data: Optional[T] = None
    error: Optional[str] = None
