from datetime import datetime, date
from typing import List, Optional, Dict, Any, Generic, TypeVar, Union
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl

class DataSource(str, Enum):
    APIFY = "apify"
    SERPAPI = "serpapi"

T = TypeVar('T')

class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = Field(None, max_length=2083)
    industry: Optional[str] = None
    description: Optional[str] = None

class Company(BaseModel):
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
    id: int
    company_id: int
    url: str = Field(..., min_length=1, max_length=1000)
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    change_type: Optional[str] = Field(None, max_length=100)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = Field(default_factory=dict)

class BusinessRegistry(BaseModel):
    id: int
    company_id: int
    registration_number: Optional[str] = Field(None, max_length=255)
    registration_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=100)
    jurisdiction: Optional[str] = Field(None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = Field(default_factory=dict)

class ComprehensiveScrapeRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    location: str = Field(..., min_length=1, max_length=255, description="Company location")
    website: Optional[str] = Field(None, max_length=2083, description="Company website (optional)")
    industry: Optional[str] = None
    description: Optional[str] = None

class ComprehensiveScrapeResult(BaseModel):
    company: Company
    serpapi_data: Dict[str, Any] = Field(default_factory=dict)
    linkedin_data: Dict[str, Any] = Field(default_factory=dict)
    news_articles: List[NewsArticle] = Field(default_factory=list)
    website_updates: List[WebsiteUpdate] = Field(default_factory=list)
    business_registry: List[BusinessRegistry] = Field(default_factory=list)
    linkedin_posts: List[Dict[str, Any]] = Field(default_factory=list)
    scraping_metadata: Dict[str, Any] = Field(default_factory=dict)

class ScrapeJob(BaseModel):
    id: int
    company_id: int
    status: str = "pending"
    scraper_type: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    job_metadata: Dict[str, Any] = Field(default_factory=dict)

class CompanyInsights(BaseModel):
    id: int
    company_id: int
    total_articles: int = 0
    total_website_updates: int = 0
    total_business_registry_entries: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    insights_data: Dict[str, Any] = Field(default_factory=dict)
    raw_data: Dict[str, Any] = Field(default_factory=dict)

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: Optional[T] = None
    error: Optional[str] = None

class ArticleClassificationRequest(BaseModel):
    company_name: str = Field(..., description="Name of the company")
    company_objectives: str = Field(..., description="Company objectives and goals")
    csv_filename: str = Field(..., description="Name of the CSV file in exports/ to process (required)")

class ArticleClassificationResult(BaseModel):
    total_articles: int
    relevant_articles: int
    irrelevant_articles: int
    relevance_score: float
    filtered_csv_path: str
    classification_details: List[Dict[str, Any]]

class ArticleClassificationResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ArticleClassificationResult] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# INSPIRE Database Models
class AnalysisType(str, Enum):
    COMPREHENSIVE = "comprehensive"
    HYBRID = "hybrid"
    INTELLIGENCE = "intelligence"
    SUMMARIZATION = "summarization"

class ArticleClassification(str, Enum):
    NEWS = "news"
    UPDATE = "update"
    ANNOUNCEMENT = "announcement"
    FINANCIAL = "financial"
    PARTNERSHIP = "partnership"
    PRODUCT = "product"
    OTHER = "other"

class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# SME Models
class SMECreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="SME name")
    sector: str = Field(..., min_length=1, max_length=100, description="Business sector")
    objective: Optional[str] = Field(None, description="Business objectives and goals")
    contact_email: str = Field(..., description="Contact email address")

class SME(BaseModel):
    sme_id: int
    name: str
    sector: str
    objective: Optional[str] = None
    contact_email: str
    password_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Company Models (Updated for INSPIRE)
class CompanyCreateINSPIRE(BaseModel):
    sme_id: Optional[int] = Field(None, description="SME ID that owns this company")
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    location: Optional[str] = Field(None, max_length=255, description="Company location")
    description: Optional[str] = Field(None, description="Company description")
    industry: Optional[str] = Field(None, max_length=100, description="Industry sector")
    website: Optional[str] = Field(None, max_length=255, description="Company website")

class CompanyINSPIRE(BaseModel):
    company_id: int
    sme_id: Optional[int] = None
    name: str
    location: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    company_info: Optional[str] = None  # RAG-extracted 5-sentence company description (JSON string)
    strengths: Optional[str] = None  # RAG-extracted competitive advantages (JSON string)
    opportunities: Optional[str] = None  # RAG-extracted growth areas (JSON string)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Recommendation Models
class RecommendationCreate(BaseModel):
    sme_id: int = Field(..., description="SME ID")
    company_id: int = Field(..., description="Company ID")
    recommendation_text: str = Field(..., description="Recommendation text")
    confidence_score: float = Field(0.0, ge=0.0, le=1.0, description="Confidence score (0-1)")
    date_generated: Optional[date] = Field(None, description="Date generated")

class Recommendation(BaseModel):
    rec_id: int
    sme_id: int
    company_id: int
    recommendation_text: str
    confidence_score: float
    date_generated: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RecommendationWithDetails(BaseModel):
    rec_id: int
    sme_id: int
    company_id: int
    recommendation_text: str
    confidence_score: float
    date_generated: date
    sme_name: Optional[str] = None
    sme_sector: Optional[str] = None
    company_name: Optional[str] = None
    company_industry: Optional[str] = None

# Analysis Models
class AnalysisCreate(BaseModel):
    company_id: int = Field(..., description="Company ID")
    latest_updates: Optional[str] = Field(None, description="Latest company updates")
    challenges: Optional[str] = Field(None, description="Company challenges")
    decision_makers: Optional[str] = Field(None, description="Key decision makers")
    market_position: Optional[str] = Field(None, description="Market position")
    future_plans: Optional[str] = Field(None, description="Future plans")
    action_plan: Optional[str] = Field(None, description="Recommended action plan")
    solutions: Optional[str] = Field(None, description="Proposed solutions")
    analysis_type: AnalysisType = Field(AnalysisType.COMPREHENSIVE, description="Analysis type")
    confidence_score: float = Field(0.0, ge=0.0, le=1.0, description="Confidence score (0-1)")
    date_analyzed: Optional[date] = Field(None, description="Date analyzed")

class Analysis(BaseModel):
    analysis_id: int
    company_id: int
    latest_updates: Optional[str] = None
    challenges: Optional[str] = None
    decision_makers: Optional[str] = None
    market_position: Optional[str] = None
    future_plans: Optional[str] = None
    action_plan: Optional[str] = None
    solutions: Optional[str] = None
    analysis_type: AnalysisType
    confidence_score: float
    date_analyzed: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class AnalysisWithDetails(BaseModel):
    analysis_id: int
    company_id: int
    latest_updates: Optional[str] = None
    challenges: Optional[str] = None
    decision_makers: Optional[str] = None
    market_position: Optional[str] = None
    future_plans: Optional[str] = None
    action_plan: Optional[str] = None
    solutions: Optional[str] = None
    analysis_type: AnalysisType
    confidence_score: float
    date_analyzed: date
    company_name: Optional[str] = None

# Article Models (Updated for INSPIRE)
class ArticleCreateINSPIRE(BaseModel):
    company_id: int = Field(..., description="Company ID")
    title: str = Field(..., min_length=1, max_length=255, description="Article title")
    url: str = Field(..., min_length=1, max_length=255, description="Article URL")
    content: Optional[str] = Field(None, description="Article content")
    source: Optional[str] = Field(None, max_length=100, description="Article source")
    published_date: Optional[date] = Field(None, description="Published date")
    relevance_score: float = Field(0.0, ge=0.0, le=1.0, description="Relevance score (0-1)")
    classification: ArticleClassification = Field(ArticleClassification.NEWS, description="Article classification")
    sentiment: Sentiment = Field(Sentiment.NEUTRAL, description="Article sentiment")

class ArticleINSPIRE(BaseModel):
    article_id: int
    company_id: int
    title: str
    url: str
    content: Optional[str] = None
    source: Optional[str] = None
    published_date: Optional[date] = None
    relevance_score: float
    classification: ArticleClassification
    sentiment: Sentiment
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ArticleWithDetails(BaseModel):
    article_id: int
    company_id: int
    title: str
    url: str
    content: Optional[str] = None
    source: Optional[str] = None
    published_date: Optional[date] = None
    relevance_score: float
    classification: ArticleClassification
    sentiment: Sentiment
    company_name: Optional[str] = None

# Dashboard Models
class DashboardStats(BaseModel):
    total_smes: int
    total_companies: int
    total_recommendations: int
    total_analyses: int
    total_articles: int

class RecentActivity(BaseModel):
    type: str
    id: int
    content: str
    date: Optional[date] = None
    source: str
    
    model_config = {
        "from_attributes": True,
    }

# Authentication Models
class SMESignupBasic(BaseModel):
    """Basic SME signup with name, email, and password only"""
    name: str = Field(..., min_length=1, max_length=255, description="SME name")
    contact_email: str = Field(..., description="Contact email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")

class SMESignupComplete(BaseModel):
    """Complete SME signup with all information"""
    name: str = Field(..., min_length=1, max_length=255, description="SME name")
    sector: str = Field(..., min_length=1, max_length=100, description="Business sector")
    objective: Optional[str] = Field(None, description="Business objectives and goals")
    contact_email: str = Field(..., description="Contact email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")

class SMEUpdate(BaseModel):
    """SME profile update for sector and objective"""
    sector: Optional[str] = Field(None, min_length=1, max_length=100, description="Business sector")
    objective: Optional[str] = Field(None, description="Business objectives and goals")

class SMESignup(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="SME name")
    sector: str = Field(..., min_length=1, max_length=100, description="Business sector")
    objective: Optional[str] = Field(None, description="Business objectives and goals")
    contact_email: str = Field(..., description="Contact email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")

class SMELogin(BaseModel):
    contact_email: str = Field(..., description="Contact email address")
    password: str = Field(..., description="Password")

class SMEAuthResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TokenData(BaseModel):
    sme_id: Optional[int] = None
    email: Optional[str] = None

    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Outreach/Campaign Models
class OutreachType(str, Enum):
    EMAIL = "email"
    CALL = "call"
    MEETING = "meeting"

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"

class OutreachRequest(BaseModel):
    company_id: int = Field(..., description="Company ID to generate outreach for")
    outreach_type: OutreachType = Field(..., description="Type of outreach to generate")

class Campaign(BaseModel):
    campaign_id: int
    sme_id: int
    company_id: int
    outreach_type: OutreachType
    title: str
    content: str
    status: CampaignStatus = CampaignStatus.DRAFT
    generated_at: datetime
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    company_name: Optional[str] = Field(None, description="Name of the company")

class CampaignCreate(BaseModel):
    company_id: int
    outreach_type: OutreachType
    title: str
    content: str
    status: CampaignStatus = CampaignStatus.DRAFT

class OutreachResponse(BaseModel):
    campaign_id: int
    outreach_type: OutreachType
    title: str
    content: str
    company_name: str
    generated_at: datetime

# API Response Models
class INSPIREResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: Optional[T] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
