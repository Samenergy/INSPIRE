from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.routers import comprehensive, apify, advanced_classification, summarization, intelligence_extraction, company_profile, comprehensive_analysis, unified_analysis, inspire_database, auth, outreach
try:
    from app.routers import hybrid_analysis
    HYBRID_AVAILABLE = True
except Exception as e:
    HYBRID_AVAILABLE = False
    print(f"⚠️  Hybrid analysis unavailable: {e}")
from app.middleware import setup_middleware
from app.logging_config import setup_logging
from app.database_init import initialize_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    # Initialize database and create tables if they don't exist
    try:
        initialize_database()
    except Exception as e:
        print(f"⚠️  Warning: Database initialization failed: {e}")
        print("⚠️  The application will continue but database operations may fail.")
    yield
    pass

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligent Network System for Partnerships, Insights, Research & Expansion for MSMEs in Rwanda",
    lifespan=lifespan
)

origins = [
    "https://inspire-4.onrender.com",
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_middleware(app)

app.include_router(comprehensive.router, prefix="/api/v1", tags=["Google-scraping"])
app.include_router(apify.router, prefix="/api/v1/apify", tags=["Linkedin-scraping"])
app.include_router(advanced_classification.router, prefix="/api/v1/advanced", tags=["Article Classification based on MSMEs objectives"])
app.include_router(summarization.router, prefix="/api/v1/summarization", tags=["Article Summarization"])
app.include_router(intelligence_extraction.router, prefix="/api/v1/intelligence", tags=["Company Intelligence Extraction"])
app.include_router(company_profile.router, prefix="/api/v1/profile", tags=["Company Profile Generator ⭐"])
app.include_router(comprehensive_analysis.router, prefix="/api/v1/analysis", tags=["Comprehensive Analysis (7 Questions) 🎯"])
app.include_router(unified_analysis.router, prefix="/api/v1/unified", tags=["Unified Analysis 🚀"])

if HYBRID_AVAILABLE:
    app.include_router(hybrid_analysis.router, prefix="/api/v1/hybrid", tags=["Hybrid AI/ML Analysis"])
    print("✅ Hybrid analysis endpoint available at /api/v1/hybrid/analyze")
else:
    print("⚠️  Hybrid analysis endpoint unavailable (NumPy dependency conflict)")

# Include INSPIRE Database router
app.include_router(inspire_database.router, tags=["INSPIRE Database"])
print("✅ INSPIRE Database endpoints available at /api/inspire/")

# Include Authentication router
app.include_router(auth.router, tags=["Authentication"])
print("✅ Authentication endpoints available at /api/auth/")

# Include Outreach router
app.include_router(outreach.router, tags=["Outreach"])
print("✅ Outreach endpoints available at /api/outreach/")


@app.get("/")
async def root():
    endpoints = {
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
        "comprehensive_analysis": {
            "analyze": "/api/v1/analysis/analyze",
            "info": "/api/v1/analysis/info"
        },
        "unified_analysis": {
            "unified_analysis": "/api/v1/unified/unified-analysis",
            "info": "/api/v1/unified/info"
        },
        "inspire_database": {
            "smes": "/api/inspire/smes",
            "companies": "/api/inspire/companies",
            "recommendations": "/api/inspire/recommendations",
            "analyses": "/api/inspire/analyses",
            "articles": "/api/inspire/articles",
            "dashboard": "/api/inspire/dashboard",
            "health": "/api/inspire/health"
        },
        "authentication": {
            "signup": "/api/auth/signup",
            "login": "/api/auth/login",
            "me": "/api/auth/me",
            "verify_token": "/api/auth/verify-token",
            "health": "/api/auth/health"
        },
        "outreach": {
            "generate": "/api/outreach/generate",
            "campaigns": "/api/outreach/campaigns",
            "campaign_by_id": "/api/outreach/campaigns/{campaign_id}",
            "update_status": "/api/outreach/campaigns/{campaign_id}/status",
            "delete_campaign": "/api/outreach/campaigns/{campaign_id}"
        },
        "system": {
            "docs": "/docs",
            "health": "/health"
        }
    }

    if HYBRID_AVAILABLE:
        endpoints["hybrid_analysis"] = {
            "analyze": "/api/v1/hybrid/analyze",
            "info": "/api/v1/hybrid/info",
            "description": "🎓 Multi-technique AI/ML system (Capstone-grade)"
        }

    return {
        "message": "I.N.S.P.I.R.E - Intelligent Network System for Partnerships, Insights, Research & Expansion",
        "version": settings.app_version,
        "description": "AI-powered B2B intelligence platform for MSMEs",
        "endpoints": endpoints,
        "features": [
            "Article Classification (95.2% accuracy)",
            "Text Summarization",
            "Company Intelligence Extraction",
            "Comprehensive Company Profiles",
            "Multi-source Data Scraping",
            "LLM-based Comprehensive Analysis (7 Questions)"
        ]
    }

@app.get("/health")
async def health_check():
    from app.database_mysql_inspire import mysql_inspire
    
    try:
        db_connected = await mysql_inspire.test_connection()
        return {
            "status": "healthy",
            "database": "connected" if db_connected else "disconnected",
            "version": settings.app_version,
            "message": "API is running with database connection" if db_connected else "API is running without database connection"
        }
    except Exception as e:
        return {
            "status": "healthy",
            "database": "error",
            "version": settings.app_version,
            "message": f"API is running but database connection failed: {str(e)}"
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
