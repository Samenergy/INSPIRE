"""
Partner Finder Router
AI-powered partner discovery endpoint
"""

from fastapi import APIRouter, HTTPException, Depends, Form
from typing import Optional
import logging
import asyncio
from datetime import datetime, timedelta

from app.services.partner_finder_service import PartnerFinderService
from app.routers.auth import get_current_sme
from app.models import INSPIREResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/partners", tags=["Partner Finder"])

def get_partner_finder_service():
    """Get or create partner finder service instance"""
    return PartnerFinderService()

partner_finder_service = get_partner_finder_service()

# Request deduplication: track active requests per SME
_active_requests: dict[int, datetime] = {}
_request_lock = asyncio.Lock()


@router.post("/auto-find")
async def auto_find_partners(
    location: Optional[str] = Form(None, description="Location to search in (defaults to Rwanda)"),
    current_sme: dict = Depends(get_current_sme)
):
    """
    Automatically find potential partners for the current SME using AI-powered search.
    
    This endpoint:
    1. Uses LLM to generate optimized Google Local search queries from SME business description
    2. Searches Google Local via SerpAPI using those queries
    3. Uses LLM to extract and filter the most relevant partners
    4. Saves selected partners to the company table
    
    Returns:
        List of found and saved partners
    """
    try:
        sme_id = current_sme.get('sme_id')
        sme_objective = current_sme.get('objective', '')
        
        logger.info(f"Received auto-find request for SME {sme_id}, objective length: {len(sme_objective) if sme_objective else 0}")
        
        if not sme_id:
            raise HTTPException(
                status_code=400,
                detail="SME ID not found in authentication token"
            )
        
        # Ensure sme_id is an integer
        try:
            sme_id = int(sme_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid SME ID: {sme_id}"
            )
        
        # Request deduplication: Check FIRST, before any other processing
        # Use lock to ensure atomic check-and-set
        async with _request_lock:
            if sme_id in _active_requests:
                last_request = _active_requests[sme_id]
                time_since = datetime.now() - last_request
                if time_since < timedelta(seconds=60):  # Increased to 60 seconds
                    wait_time = int(60 - time_since.total_seconds())
                    logger.warning(f"Duplicate request blocked for SME {sme_id} (last request {time_since.total_seconds():.1f}s ago, wait {wait_time}s)")
                    raise HTTPException(
                        status_code=429,
                        detail=f"A partner search is already in progress or was recently completed. Please wait {wait_time} seconds before trying again."
                    )
            # Register this request BEFORE starting work (while lock is held)
            _active_requests[sme_id] = datetime.now()
            logger.info(f"Registered partner finder request for SME {sme_id} at {datetime.now()}")
        
        if not sme_objective:
            # Clean up registration if validation fails
            async with _request_lock:
                _active_requests.pop(sme_id, None)
            raise HTTPException(
                status_code=400,
                detail="SME objective/business description is required. Please update your profile with your business objectives."
            )
        
        # Check if SerpAPI key is configured
        if not partner_finder_service.serpapi_key:
            # Clean up registration if validation fails
            async with _request_lock:
                _active_requests.pop(sme_id, None)
            logger.error("SERPAPI_API_KEY is not configured")
            raise HTTPException(
                status_code=500,
                detail="SERPAPI_API_KEY is not configured. Please configure it in environment variables."
            )
        
        # Check if OpenAI key is configured
        if not partner_finder_service.openai_api_key:
            # Clean up registration if validation fails
            async with _request_lock:
                _active_requests.pop(sme_id, None)
            logger.error("OPENAI_API_KEY is not configured")
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY is not configured. Please add it to your .env file."
            )
        
        try:
            logger.info(f"Starting auto-find partners for SME {sme_id} (using OpenAI)")
            
            # Find partners (service will handle LLM loading and availability checks)
            # auto_analyze=True automatically triggers analysis for each saved company
            result = await partner_finder_service.auto_find_partners(
                sme_id=sme_id,
                sme_objective=sme_objective,
                location=location,
                auto_analyze=True  # Automatically analyze each saved company
            )
            
            logger.info(f"Successfully found partners for SME {sme_id}: {result.get('partners_saved', 0)} saved")
            
            return INSPIREResponse(
                success=True,
                message=f"Found {result['partners_found']} potential partners, saved {result['partners_saved']} to your company list",
                data=result
            )
        except Exception as service_error:
            logger.error(f"Error in partner_finder_service.auto_find_partners: {service_error}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
        finally:
            # Remove from active requests
            async with _request_lock:
                _active_requests.pop(sme_id, None)
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Value error in auto_find_partners: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in auto_find_partners: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find partners: {str(e)}"
        )

