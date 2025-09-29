"""Database configuration and connection management."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
from app.config import settings
from app.models import Company, NewsArticle, WebsiteUpdate, BusinessRegistry, ScrapeJob, CompanyInsights
import logging

logger = logging.getLogger(__name__)

# Global database client
client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    global database
    if database is None:
        await connect_to_database()
    return database


async def connect_to_database():
    """Connect to MongoDB database."""
    global client, database
    
    try:
        client = AsyncIOMotorClient(settings.database_url)
        # Extract database name from URL or use default
        db_name = settings.database_url.split('/')[-1] if '/' in settings.database_url else 'company_data'
        database = client.get_database(db_name)
        
        # Test connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_database():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("Disconnected from MongoDB")


async def init_database():
    """Initialize database with indexes and collections."""
    try:
        db = await get_database()
        
        # Create indexes for better performance
        await create_indexes(db)
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def create_indexes(db: AsyncIOMotorDatabase):
    """Create database indexes."""
    
    # Companies collection indexes
    await db.companies.create_index("name", unique=True)
    await db.companies.create_index("location")
    await db.companies.create_index("created_at")
    
    # News articles indexes
    await db.news_articles.create_index("company_id")
    await db.news_articles.create_index("published_date")
    await db.news_articles.create_index("scraped_at")
    await db.news_articles.create_index([("company_id", 1), ("published_date", -1)])
    
    # Website updates indexes
    await db.website_updates.create_index("company_id")
    await db.website_updates.create_index("scraped_at")
    await db.website_updates.create_index("content_hash")
    
    # Business registry indexes
    await db.business_registry.create_index("company_id")
    await db.business_registry.create_index("registration_number")
    
    # Scrape jobs indexes
    await db.scrape_jobs.create_index("company_id")
    await db.scrape_jobs.create_index("status")
    await db.scrape_jobs.create_index("created_at")
    
    # Company insights indexes
    await db.company_insights.create_index("company_id")
    await db.company_insights.create_index("generated_at")


# Database collection getters
async def get_companies_collection():
    """Get companies collection."""
    db = await get_database()
    return db.companies


async def get_news_collection():
    """Get news articles collection."""
    db = await get_database()
    return db.news_articles


async def get_website_updates_collection():
    """Get website updates collection."""
    db = await get_database()
    return db.website_updates


async def get_business_registry_collection():
    """Get business registry collection."""
    db = await get_database()
    return db.business_registry


async def get_scrape_jobs_collection():
    """Get scrape jobs collection."""
    db = await get_database()
    return db.scrape_jobs


async def get_company_insights_collection():
    """Get company insights collection."""
    db = await get_database()
    return db.company_insights
