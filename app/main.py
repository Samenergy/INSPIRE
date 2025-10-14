"""Main FastAPI application for company data scraping service."""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
# from app.database_mysql import init_mysql_database  # DB connection disabled
from app.routers import comprehensive, apify, advanced_classification, summarization, intelligence_extraction, company_profile
from app.middleware import setup_middleware
from app.logging_config import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    setup_logging()
    # await init_mysql_database()  # DB connection disabled
    yield
    # Shutdown
    pass


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered B2B intelligence platform for MSMEs with article classification, summarization, and company profile generation",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "https://inspire-4.onrender.com",  # Production domain
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",  # Common frontend dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(comprehensive.router, prefix="/api/v1", tags=["Google-scraping"])
app.include_router(apify.router, prefix="/api/v1/apify", tags=["Linkedin-scraping"])
app.include_router(advanced_classification.router, prefix="/api/v1/advanced", tags=["Article Classification based on MSMEs objectives"])
app.include_router(summarization.router, prefix="/api/v1/summarization", tags=["Article Summarization"])
app.include_router(intelligence_extraction.router, prefix="/api/v1/intelligence", tags=["Company Intelligence Extraction"])
app.include_router(company_profile.router, prefix="/api/v1/profile", tags=["Company Profile Generator ⭐"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "I.N.S.P.I.R.E - Intelligent Network System for Partnerships, Insights, Research & Expansion",
        "version": settings.app_version,
        "description": "AI-powered B2B intelligence platform for MSMEs",
        "endpoints": {
            "scraping": {
                "comprehensive_scrape": "/api/v1/scrape",
                "comprehensive_status": "/api/v1/status",
                "apify_scrape": "/api/v1/apify/scrape"
            },
            "classification": {
                "classify_upload": "/api/v1/advanced/classify-upload",
                "classify_text": "/api/v1/advanced/classify-text",
                "model_info": "/api/v1/advanced/model-info"
            },
            "summarization": {
                "summarize_upload": "/api/v1/summarization/summarize-upload",
                "summarize_text": "/api/v1/summarization/summarize-text",
                "classify_and_summarize": "/api/v1/summarization/classify-and-summarize"
            },
            "intelligence": {
                "extract_from_csv": "/api/v1/intelligence/extract-from-csv",
                "company_profile": "/api/v1/intelligence/company-profile",
                "scrape_and_profile": "/api/v1/intelligence/scrape-and-profile",
                "model_info": "/api/v1/intelligence/model-info"
            },
            "profile_generator": {
                "generate": "/api/v1/profile/generate",
                "generate_formatted": "/api/v1/profile/generate-formatted",
                "info": "/api/v1/profile/info"
            },
            "system": {
                "docs": "/docs",
                "health": "/health"
            }
        },
        "features": [
            "Article Classification (95.2% accuracy)",
            "Text Summarization",
            "Company Intelligence Extraction",
            "Comprehensive Company Profiles",
            "Multi-source Data Scraping"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "disabled",
        "version": settings.app_version,
        "message": "API is running without database connection"
    }


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
