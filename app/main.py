"""Main FastAPI application for company data scraping service."""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.database_mysql import init_mysql_database
from app.routers import comprehensive, apify, advanced_classification, summarization
from app.middleware import setup_middleware
from app.logging_config import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    setup_logging()
    await init_mysql_database()
    yield
    # Shutdown
    pass


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A comprehensive backend service for company data scraping and aggregation",
    lifespan=lifespan
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(comprehensive.router, prefix="/api/v1", tags=["Google-scraping"])
app.include_router(apify.router, prefix="/api/v1/apify", tags=["Linkedin-scraping"])
app.include_router(advanced_classification.router, prefix="/api/v1/advanced", tags=["Article Classification based on MSMEs objectives"])
app.include_router(summarization.router, prefix="/api/v1/summarization", tags=["Article Summarization"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Company Data Scraping Service",
        "version": settings.app_version,
        "description": "Unified scraping service using SerpAPI and Apify",
        "endpoints": {
            "comprehensive_scrape": "/api/v1/scrape",
            "comprehensive_status": "/api/v1/status",
            "apify_scrape": "/api/v1/apify/scrape",
            "classify_upload": "/api/v1/advanced/classify-upload",
            "model_info": "/api/v1/advanced/model-info",
            "summarize_upload": "/api/v1/summarization/summarize-upload",
            "summarize_text": "/api/v1/summarization/summarize-text",
            "classify_and_summarize": "/api/v1/summarization/classify-and-summarize",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        from app.database_mysql import get_mysql_engine
        from sqlalchemy import text
        engine = await get_mysql_engine()
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "mysql_connected",
            "version": settings.app_version
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
