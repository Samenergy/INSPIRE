"""MySQL database configuration and connection management."""

import asyncio
from typing import Optional
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime, Integer, Text, JSON, Float
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.config import settings
from app.models import Company, NewsArticle, WebsiteUpdate, BusinessRegistry, ScrapeJob, CompanyInsights
from loguru import logger

# Create base class for SQLAlchemy models
Base = declarative_base()

# Global engine and session maker
engine = None
async_session_maker = None


class MySQLCompany(Base):
    """MySQL model for companies."""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    website = Column(String(500), nullable=True)
    industry = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_scraped = Column(DateTime, nullable=True)
    scrape_count = Column(Integer, default=0, nullable=False)


class MySQLNewsArticle(Base):
    """MySQL model for news articles."""
    __tablename__ = "news_articles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False, index=True)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    url = Column(String(1000), nullable=False)
    source = Column(String(255), nullable=False)
    published_date = Column(DateTime, nullable=True, index=True)
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    data_source = Column(String(50), nullable=False)
    raw_data = Column(JSON, nullable=True)


class MySQLWebsiteUpdate(Base):
    """MySQL model for website updates."""
    __tablename__ = "website_updates"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False, index=True)
    url = Column(String(1000), nullable=False)
    title = Column(String(500), nullable=True)
    meta_description = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=False, index=True)
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    data_source = Column(String(50), nullable=False)
    raw_data = Column(JSON, nullable=True)


class MySQLBusinessRegistry(Base):
    """MySQL model for business registry."""
    __tablename__ = "business_registry"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False, index=True)
    registration_number = Column(String(100), nullable=True, index=True)
    registration_date = Column(DateTime, nullable=True)
    legal_status = Column(String(100), nullable=True)
    business_type = Column(String(100), nullable=True)
    registered_address = Column(Text, nullable=True)
    officers = Column(JSON, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_source = Column(String(50), nullable=False)
    raw_data = Column(JSON, nullable=True)


class MySQLScrapeJob(Base):
    """MySQL model for scrape jobs."""
    __tablename__ = "scrape_jobs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False, index=True)
    data_sources = Column(JSON, nullable=False)
    status = Column(String(20), nullable=False, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class MySQLCompanyInsights(Base):
    """MySQL model for company insights."""
    __tablename__ = "company_insights"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, nullable=False, unique=True, index=True)
    news_count = Column(Integer, default=0, nullable=False)
    website_updates_count = Column(Integer, default=0, nullable=False)
    business_registry_count = Column(Integer, default=0, nullable=False)
    sentiment_score = Column(Float, nullable=True)
    key_topics = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


async def get_mysql_engine():
    """Get MySQL async engine."""
    global engine
    if engine is None:
        if not settings.mysql_url:
            raise ValueError("MySQL URL not configured")
        
        # Convert synchronous URL to async
        mysql_url = settings.mysql_url.replace("mysql+pymysql://", "mysql+aiomysql://").replace("mysql://", "mysql+aiomysql://")
        
        engine = create_async_engine(
            mysql_url,
            echo=settings.debug,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=10,
            max_overflow=20
        )
        
        logger.info("MySQL engine created successfully")
    
    return engine


async def get_mysql_session() -> AsyncSession:
    """Get MySQL async session."""
    global async_session_maker
    
    if async_session_maker is None:
        engine = await get_mysql_engine()
        async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    
    return async_session_maker()


async def init_mysql_database():
    """Initialize MySQL database with tables."""
    try:
        engine = await get_mysql_engine()
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("MySQL database initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize MySQL database: {e}")
        raise


async def close_mysql_database():
    """Close MySQL database connections."""
    global engine
    if engine:
        await engine.dispose()
        logger.info("MySQL database connections closed")


# Helper functions for converting between MongoDB models and MySQL models
def mongo_company_to_mysql(company: Company) -> MySQLCompany:
    """Convert MongoDB company model to MySQL model."""
    return MySQLCompany(
        id=int(str(company.id)) if company.id else None,
        name=company.name,
        location=company.location,
        website=str(company.website) if company.website else None,
        industry=company.industry,
        description=company.description,
        created_at=company.created_at,
        updated_at=company.updated_at,
        last_scraped=company.last_scraped,
        scrape_count=company.scrape_count
    )


def mysql_company_to_mongo(mysql_company: MySQLCompany) -> Company:
    """Convert MySQL company model to MongoDB model."""
    from bson import ObjectId
    
    return Company(
        id=ObjectId(str(mysql_company.id).zfill(24)),  # Convert to ObjectId format
        name=mysql_company.name,
        location=mysql_company.location,
        website=mysql_company.website,
        industry=mysql_company.industry,
        description=mysql_company.description,
        created_at=mysql_company.created_at,
        updated_at=mysql_company.updated_at,
        last_scraped=mysql_company.last_scraped,
        scrape_count=mysql_company.scrape_count
    )


def mongo_news_to_mysql(news: NewsArticle) -> MySQLNewsArticle:
    """Convert MongoDB news model to MySQL model."""
    return MySQLNewsArticle(
        id=int(str(news.id)) if news.id else None,
        company_id=int(str(news.company_id)),
        title=news.title,
        content=news.content,
        url=str(news.url),
        source=news.source,
        published_date=news.published_date,
        scraped_at=news.scraped_at,
        data_source=news.data_source.value,
        raw_data=news.raw_data
    )


def mysql_news_to_mongo(mysql_news: MySQLNewsArticle) -> NewsArticle:
    """Convert MySQL news model to MongoDB model."""
    from bson import ObjectId
    from app.models import DataSource
    
    return NewsArticle(
        id=ObjectId(str(mysql_news.id).zfill(24)),
        company_id=ObjectId(str(mysql_news.company_id).zfill(24)),
        title=mysql_news.title,
        content=mysql_news.content,
        url=mysql_news.url,
        source=mysql_news.source,
        published_date=mysql_news.published_date,
        scraped_at=mysql_news.scraped_at,
        data_source=DataSource(mysql_news.data_source),
        raw_data=mysql_news.raw_data or {}
    )

