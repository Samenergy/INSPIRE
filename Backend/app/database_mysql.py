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

Base = declarative_base()

engine = None
async_session_maker = None

class MySQLCompany(Base):
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
    global engine
    if engine is None:
        if not settings.mysql_url:
            raise ValueError("MySQL URL not configured")

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
    try:
        engine = await get_mysql_engine()

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("MySQL database initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize MySQL database: {e}")
        raise

async def close_mysql_database():
    global engine
    if engine:
        await engine.dispose()
        logger.info("MySQL database connections closed")

