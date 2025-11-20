"""
Unified Analysis Router - Refactored for Celery Background Processing
Uses Redis-based progress tracking and Celery tasks
"""

from fastapi import APIRouter, HTTPException, Form
from typing import Optional, Dict, Any
from app.models import APIResponse
from app.config import settings
from loguru import logger
from uuid import uuid4
import redis
import json
from datetime import datetime

from app.tasks.unified_analysis_task import run_unified_analysis

router = APIRouter()

# Redis connection for progress tracking with fallback
def get_redis_client():
    """Get Redis client with fallback to localhost for local development"""
    try:
        # Try the configured URL first
        client = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=2)
        # Test connection
        client.ping()
        return client
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as e:
        logger.warning(f"Redis connection failed with {settings.redis_url}, trying localhost fallback: {e}")
        try:
            # Fallback to localhost for local development
            fallback_url = settings.redis_url.replace('redis://redis:', 'redis://localhost:')
            client = redis.from_url(fallback_url, decode_responses=True, socket_connect_timeout=2)
            client.ping()
            logger.info(f"Connected to Redis at {fallback_url}")
            return client
        except Exception as e2:
            logger.error(f"Redis connection failed completely: {e2}")
            # Return None - we'll handle this in the endpoints
            return None

redis_client = get_redis_client()


@router.post(
    "/unified-analysis",
    summary="Unified Company Analysis (Scrape + Classify + RAG Analysis) - Background Execution",
    description="""
    **Complete one-endpoint solution for company analysis with RAG (Retrieval-Augmented Generation).**
    
    **IMPORTANT: This endpoint returns immediately and runs the analysis in the background using Celery.**
    Use the `/unified-analysis/progress/{task_id}` endpoint to track progress.
    
    This endpoint orchestrates a complete analysis pipeline:
    
    **1. Google Scraping** (No LinkedIn)
    - Scrapes company news and articles using SerpAPI/Google
    - Retrieves up to 100 articles about the company
    
    **2. Article Classification Based on SME Objectives**
    - Classifies articles into: Directly Relevant, Indirectly Useful, Not Relevant
    - Uses your SME objectives to determine relevance
    - Stores classified articles in the database
    
    **3. RAG Analysis (10 Categories)**
    - Analyzes the company using RAG (Retrieval-Augmented Generation)
    - Extracts 10 intelligence categories:
      1. Latest Updates
      2. Challenges
      3. Decision Makers
      4. Market Position
      5. Future Plans
      6. Action Plan (SME engagement steps)
      7. Solution (SME offerings for their needs)
      8. Company Info (5-sentence description)
      9. Strengths (competitive advantages)
      10. Opportunities (growth areas)
    - Uses semantic retrieval + Llama 3.1 for extraction
    - Stores results in the database
    
    **Step-by-step process:**
    1. Scrape company data from Google (SerpAPI)
    2. Classify articles based on your SME objectives
    3. Store classified articles in the `article` table
    4. Run RAG analysis (10 categories with vector retrieval)
    5. Store analysis results in the `analysis` table
    
    **Important:**
    - Only uses Google/SerpAPI (no LinkedIn scraping)
    - Classification happens BEFORE analysis
    - RAG provides actionable, SME-personalized insights
    - Both articles and analysis are stored in database
    - Uses `sme_id` to link everything to your SME
    - Runs in background via Celery - poll `/unified-analysis/progress/{task_id}` for status
    """,
    response_description="Analysis started in background. Use task_id to track progress."
)
async def unified_company_analysis(
    company_name: str = Form(..., description="Name of the company to analyze"),
    company_location: str = Form(..., description="Location of the company"),
    sme_id: int = Form(..., description="Your SME ID"),
    sme_objective: str = Form(..., description="Your SME's objectives and capabilities"),
    max_articles: int = Form(100, description="Maximum number of articles to scrape (default: 100)"),
    company_id: Optional[int] = Form(None, description="Optional: Existing company ID to use (if not provided, will search by name)"),
    job_id: Optional[str] = Form(None, description="Optional: Client-supplied job identifier for progress tracking"),
):
    """
    Unified endpoint that starts analysis in the background using Celery and returns immediately.
    The analysis runs asynchronously in a Celery worker and progress can be tracked via the progress endpoint.
    """
    # Generate or use provided job identifier
    job_identifier = job_id or f"{sme_id}-{company_name}-{uuid4().hex[:8]}"
    
    # Validate basic inputs
    if not company_name or not company_location:
                raise HTTPException(
            status_code=400,
            detail="company_name and company_location are required"
        )
    
    # Start the analysis as a Celery task
    logger.info(f"🚀 Queuing unified analysis for: {company_name} (job_id: {job_identifier})")
    
    # Initialize progress in Redis (with error handling)
    initial_progress = {
        "job_id": job_identifier,
        "task_id": None,  # Will be set when task starts
        "percent": 0.0,
        "message": "Analysis queued. Starting background processing...",
        "status": "pending",
        "step_name": "queued",
        "percent_complete": 0.0,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    
    if redis_client:
        try:
            redis_key = f"analysis_progress:{job_identifier}"
            redis_client.setex(
                redis_key,
                3600,
                json.dumps(initial_progress)
            )
            # Verify it was stored
            stored = redis_client.get(redis_key)
            if stored:
                logger.info(f"✅ Initial progress stored in Redis: {redis_key}")
            else:
                logger.error(f"❌ Failed to verify progress storage in Redis: {redis_key}")
        except Exception as e:
            logger.error(f"❌ Failed to store initial progress in Redis: {e}")
            logger.exception(e)
    else:
        logger.error("❌ Redis not available - progress tracking will not work!")
    
    # Queue the Celery task
    try:
        task = run_unified_analysis.delay(
            company_name=company_name,
            company_location=company_location,
            sme_id=sme_id,
            sme_objective=sme_objective,
            max_articles=max_articles,
            company_id=company_id,
            job_identifier=job_identifier,
        )
        
        # Update progress with actual Celery task ID
        initial_progress["task_id"] = task.id
        initial_progress["status"] = "running"
        initial_progress["message"] = "Analysis started. Processing in background..."
        
        if redis_client:
            try:
                redis_key = f"analysis_progress:{job_identifier}"
                redis_client.setex(
                    redis_key,
                    3600,
                    json.dumps(initial_progress)
                )
                # Verify it was stored
                stored = redis_client.get(redis_key)
                if stored:
                    logger.info(f"✅ Updated progress stored in Redis: {redis_key} (task_id: {task.id})")
                else:
                    logger.error(f"❌ Failed to verify progress update in Redis: {redis_key}")
            except Exception as e:
                logger.error(f"❌ Failed to update progress in Redis: {e}")
                logger.exception(e)
        
        logger.info(f"✅ Task queued: {task.id} (job_id: {job_identifier})")
        
    except Exception as e:
        logger.error(f"Failed to queue task: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start analysis: {str(e)}"
        )
    
    # Return immediately with job_id for tracking
    return APIResponse(
        success=True,
        message=f"Unified analysis started in background for {company_name}. Use the task_id to track progress.",
        data={
            "job_id": job_identifier,
            "task_id": task.id,
            "company_name": company_name,
            "status": "pending",
            "progress_endpoint": f"/api/v1/unified/unified-analysis/progress/{job_identifier}",
            "result_endpoint": f"/api/v1/unified/unified-analysis/result/{job_identifier}",
            "message": "Analysis is running in the background. Poll the progress endpoint to track status."
        }
        )


@router.get(
    "/unified-analysis/progress/{job_id}",
    summary="Get progress for a running unified analysis job",
    description="""
    Return the latest progress information for the specified analysis job.
    
    Status values:
    - `pending`: Task is queued but not yet started
    - `running`: Task is currently executing
    - `completed`: Task completed successfully
    - `failed`: Task failed with an error
    
    Progress includes:
    - `percent_complete`: 0-100
    - `step_name`: Current stage (scraping, classification, rag_analysis, etc.)
    - `message`: Human-readable status message
    - `updated_at`: Last update timestamp
    """
)
async def get_unified_analysis_progress(job_id: str):
    """Get progress for a running analysis job from Redis"""
    try:
        if not redis_client:
            return APIResponse(
                success=False,
                message="Redis is not available. Please ensure Redis is running.",
                data={"job_id": job_id, "status": "redis_unavailable"},
            )
        
        redis_key = f"analysis_progress:{job_id}"
        progress_json = redis_client.get(redis_key)
        if not progress_json:
            # Log all keys matching the pattern for debugging
            try:
                all_keys = redis_client.keys("analysis_progress:*")
                logger.warning(f"Progress not found for {redis_key}. Available keys: {all_keys[:10]}")  # Show first 10 keys
            except:
                pass
            return APIResponse(
                success=False,
                message="Progress not found for the provided job_id. It may have expired (1 hour TTL) or never existed.",
                data={"job_id": job_id, "status": "not_found"},
            )
        
        progress = json.loads(progress_json)
        return APIResponse(
            success=True,
            message="Progress retrieved successfully.",
            data=progress,
        )
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Redis connection error retrieving progress for {job_id}: {e}")
        return APIResponse(
            success=False,
            message="Redis connection error. Please ensure Redis is running.",
            data={"job_id": job_id, "status": "redis_error"},
        )
    except Exception as e:
        logger.error(f"Error retrieving progress for {job_id}: {e}")
        return APIResponse(
            success=False,
            message=f"Error retrieving progress: {str(e)}",
            data={"job_id": job_id},
        )


@router.get(
    "/unified-analysis/result/{job_id}",
    summary="Get final result for a completed unified analysis job",
    description="""
    Retrieve the final result data for a completed analysis job.
    Only available after the task status is 'completed'.
    Results expire after 1 hour.
    """
)
async def get_unified_analysis_result(job_id: str):
    """Get final result for a completed analysis job from Redis"""
    try:
        if not redis_client:
            return APIResponse(
                success=False,
                message="Redis is not available. Please ensure Redis is running.",
                data={"job_id": job_id, "status": "redis_unavailable"},
            )
        
        result_json = redis_client.get(f"analysis_result:{job_id}")
        if not result_json:
            # Check if task is still running
            progress_json = redis_client.get(f"analysis_progress:{job_id}")
            if progress_json:
                progress = json.loads(progress_json)
                if progress.get("status") in ["pending", "running"]:
                    return APIResponse(
                        success=False,
                        message="Analysis is still in progress. Use the progress endpoint to track status.",
                        data={"job_id": job_id, "status": progress.get("status")},
                    )
            
            return APIResponse(
                success=False,
                message="Result not found. The analysis may not be completed yet, or the result has expired (1 hour TTL).",
                data={"job_id": job_id},
            )

        result = json.loads(result_json)
        return APIResponse(
            success=True,
            message="Result retrieved successfully.",
            data=result,
        )
    except Exception as e:
        logger.error(f"Error retrieving result for {job_id}: {e}")
        return APIResponse(
            success=False,
            message=f"Error retrieving result: {str(e)}",
            data={"job_id": job_id},
    )


@router.get(
    "/info",
    summary="Get Unified Analysis Service Information",
    description="Get information about the unified analysis service with RAG"
)
async def unified_analysis_info():
    """Get information about the unified analysis service"""
    return {
        "service": "Unified Company Analysis with RAG",
        "description": "Complete one-endpoint solution for company analysis using Retrieval-Augmented Generation",
        "architecture": "Celery + Redis for background processing",
        "steps": [
            "1. Scrape company data from Google (SerpAPI)",
            "2. Classify articles based on SME objectives (ML-based)",
            "3. Store classified articles in database",
            "4. Run RAG analysis - 10 intelligence categories",
            "5. Store RAG analysis results in database"
        ],
        "rag_categories": [
            "1. Latest Updates - Product launches, financial results, partnerships",
            "2. Challenges - Competitive pressures, operational difficulties",
            "3. Decision Makers - Executives, leaders, management",
            "4. Market Position - Competitors, market share, advantages",
            "5. Future Plans - Expansion, investments, strategic initiatives",
            "6. Action Plan - 3 specific steps for SME to engage",
            "7. Solution - 3 relevant SME solutions for company needs",
            "8. Company Info - 5-sentence company description",
            "9. Strengths - Key competitive advantages",
            "10. Opportunities - Potential growth areas"
        ],
        "features": [
            "Google scraping only (no LinkedIn)",
            "ML-based article classification",
            "RAG-based intelligence extraction (10 categories)",
            "Semantic retrieval with vector embeddings",
            "LLM generation (Llama 3.1)",
            "SME-personalized insights (Action Plan & Solution)",
            "Automatic database storage",
            "Background processing with Celery",
            "Redis-based progress tracking",
            "CPU-only mode to prevent PyTorch crashes"
        ],
        "technology": {
            "scraping": "SerpAPI",
            "classification": "SentenceTransformer + Custom Model",
            "rag_embeddings": "all-MiniLM-L6-v2 (384-dim)",
            "vector_storage": "Milvus (with in-memory fallback)",
            "llm": "Phi-3.5 Mini 3.8B via llama.cpp",
            "retrieval": "Cosine similarity (top-5)",
            "background_processing": "Celery",
            "progress_tracking": "Redis",
            "pytorch_mode": "CPU-only (prevents SIGSEGV crashes)"
        },
        "endpoints": {
            "start_analysis": "/api/v1/unified/unified-analysis",
            "check_progress": "/api/v1/unified/unified-analysis/progress/{job_id}",
            "get_result": "/api/v1/unified/unified-analysis/result/{job_id}"
        },
        "response_includes": [
            "All scraped articles (with content)",
            "Article classifications (Directly Relevant, Indirectly Useful, Not Relevant)",
            "10 RAG analysis categories with structured JSON",
            "Confidence scores per category",
            "RAG metadata (chunks, embeddings, performance)"
        ]
    }
