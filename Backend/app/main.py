from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import subprocess
import requests
import time
import socket

from app.config import settings
from app.routers import comprehensive, apify, advanced_classification, summarization, unified_analysis, inspire_database, auth, outreach
try:
    from app.routers import rag_analysis
    RAG_AVAILABLE = True
except Exception as e:
    RAG_AVAILABLE = False
    print(f"⚠️  RAG analysis unavailable: {e}")
from app.middleware import setup_middleware
from app.logging_config import setup_logging

def is_port_open(host: str, port: int) -> bool:
    """Check if a port is open"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    try:
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def start_ollama():
    """Start Ollama service if not running"""
    print("🔍 Checking Ollama status...")
    
    # Check if Ollama is running
    if is_port_open('localhost', 11434):
        print("✅ Ollama is already running on port 11434")
        return True
    
    print("🚀 Starting Ollama service...")
    try:
        # Start Ollama in background
        subprocess.Popen(
            ['ollama', 'serve'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        
        # Wait for Ollama to start (max 10 seconds)
        for i in range(10):
            time.sleep(1)
            if is_port_open('localhost', 11434):
                print("✅ Ollama started successfully on port 11434")
                
                # Check if llama3.1 model is available
                try:
                    response = requests.get('http://localhost:11434/api/tags', timeout=5)
                    if response.status_code == 200:
                        models = response.json().get('models', [])
                        llama_models = [m for m in models if 'llama3.1' in str(m.get('name', '')).lower()]
                        if llama_models:
                            print(f"✅ Llama 3.1 model is available: {llama_models[0]['name']}")
                        else:
                            print("⚠️  Llama 3.1 model not found. Run: ollama pull llama3.1")
                except Exception as e:
                    print(f"⚠️  Could not verify Llama models: {e}")
                
                return True
        
        print("⚠️  Ollama started but not responding on port 11434")
        return False
        
    except FileNotFoundError:
        print("❌ Ollama not installed. Install with: curl -fsSL https://ollama.com/install.sh | sh")
        return False
    except Exception as e:
        print(f"❌ Failed to start Ollama: {e}")
        return False

def start_milvus():
    """Start Milvus service via Docker if not running"""
    print("🔍 Checking Milvus status...")
    
    # Check if Milvus is running
    if is_port_open('localhost', 19530):
        print("✅ Milvus is already running on port 19530")
        return True
    
    print("🚀 Starting Milvus service via Docker...")
    try:
        # Check if Docker is running
        result = subprocess.run(
            ['docker', 'info'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=5
        )
        
        if result.returncode != 0:
            print("❌ Docker is not running. Please start Docker Desktop.")
            print("   Milvus unavailable - RAG will use in-memory storage")
            return False
        
        # Try to start milvus-standalone container
        result = subprocess.run(
            ['docker', 'start', 'milvus-standalone'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            # Wait for Milvus to start (max 10 seconds)
            for i in range(10):
                time.sleep(1)
                if is_port_open('localhost', 19530):
                    print("✅ Milvus started successfully on port 19530")
                    return True
            
            print("⚠️  Milvus container started but not responding on port 19530")
            return False
        else:
            # Container doesn't exist, try docker-compose
            print("   Trying docker-compose...")
            result = subprocess.run(
                ['docker-compose', 'up', '-d', 'milvus-standalone'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                # Wait for Milvus to start
                for i in range(15):
                    time.sleep(1)
                    if is_port_open('localhost', 19530):
                        print("✅ Milvus started successfully on port 19530")
                        return True
                
                print("⚠️  Milvus started but not responding on port 19530")
                return False
            else:
                print("⚠️  Milvus not configured. RAG will use in-memory storage")
                return False
        
    except FileNotFoundError:
        print("❌ Docker not installed or not in PATH")
        print("   Milvus unavailable - RAG will use in-memory storage")
        return False
    except Exception as e:
        print(f"⚠️  Could not start Milvus: {e}")
        print("   RAG will use in-memory storage")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("\n" + "="*60)
    print("🚀 INSPIRE Backend Server Starting...")
    print("="*60 + "\n")
    
    setup_logging()
    
    # Initialize database (create database and tables if they don't exist)
    try:
        from app.database_init import initialize_database
        print("📦 Initializing database...")
        if initialize_database():
            print("✅ Database initialized successfully")
        else:
            print("⚠️  Database initialization failed - check logs")
    except Exception as e:
        print(f"⚠️  Database initialization error: {e}")
        print("   Continuing startup - database may need manual initialization")
    
    # Start Ollama (required for RAG and LLM analysis)
    start_ollama()
    
    # Start Milvus (optional for RAG - has in-memory fallback)
    start_milvus()
    
    print("\n" + "="*60)
    print("✅ Server Startup Complete")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown
    print("\n" + "="*60)
    print("🛑 Server Shutting Down...")
    print("="*60 + "\n")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligent Network System for Partnerships, Insights, Research & Expansion for MSMEs in Rwanda",
    lifespan=lifespan
)

origins = [
    "https://inspire.software",
    "https://www.inspire.software",
    "https://inspire-eight-rho.vercel.app",
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
app.include_router(unified_analysis.router, prefix="/api/v1/unified", tags=["Unified Analysis 🚀"])

if RAG_AVAILABLE:
    app.include_router(rag_analysis.router, prefix="/api/v1/rag", tags=["RAG Analysis 🔥"])
    print("✅ RAG analysis endpoint available at /api/v1/rag/analyze")
else:
    print("⚠️  RAG analysis endpoint unavailable")

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

    if RAG_AVAILABLE:
        endpoints["rag_analysis"] = {
            "analyze": "/api/v1/rag/analyze",
            "info": "/api/v1/rag/info",
            "health": "/api/v1/rag/health",
            "description": "🔥 RAG-based analysis (Retrieval-Augmented Generation)"
        }

    return {
        "message": "I.N.S.P.I.R.E - Intelligent Network System for Partnerships, Insights, Research & Expansion",
        "version": settings.app_version,
        "description": "AI-powered B2B intelligence platform for MSMEs",
        "endpoints": endpoints,
        "features": [
            "Article Classification (95.2% accuracy)",
            "Text Summarization",
            "Multi-source Data Scraping",
            "RAG-based Analysis (10 Categories with Vector Retrieval)",
            "Unified Analysis Pipeline (Scrape + Classify + RAG)"
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
