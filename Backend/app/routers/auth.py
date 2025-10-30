"""
Authentication Router for INSPIRE Project
Handles SME signup, login, and authentication endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from app.models import SMESignup, SMESignupBasic, SMELogin, SMEAuthResponse, SME, SMEUpdate
from app.services.auth_service import auth_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Security scheme
security = HTTPBearer()

async def get_current_sme(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated SME from token"""
    token = credentials.credentials
    sme = await auth_service.get_current_sme(token)
    if sme is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return sme

@router.post(
    "/signup",
    response_model=SMEAuthResponse,
    summary="SME Basic Signup",
    description="Register a new SME account with basic information (name, email, password)"
)
async def signup_sme_basic(sme_data: SMESignupBasic):
    """Register a new SME user with basic information"""
    try:
        result = await auth_service.signup_sme_basic(sme_data)
        
        # Remove password hash from response
        sme_data_response = result["sme"].copy()
        sme_data_response.pop("password_hash", None)
        
        return SMEAuthResponse(
            success=True,
            message="SME registered successfully",
            data={
                "sme": sme_data_response,
                "access_token": result["access_token"],
                "token_type": result["token_type"]
            }
        )
        
    except HTTPException as e:
        return SMEAuthResponse(
            success=False,
            message=e.detail,
            error=e.detail
        )
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Registration failed",
            error="Internal server error"
        )

@router.post(
    "/signup/complete",
    response_model=SMEAuthResponse,
    summary="SME Complete Signup",
    description="Register a new SME account with complete information"
)
async def signup_sme_complete(sme_data: SMESignup):
    """Register a new SME user with complete information"""
    try:
        result = await auth_service.signup_sme(sme_data)
        
        # Remove password hash from response
        sme_data_response = result["sme"].copy()
        sme_data_response.pop("password_hash", None)
        
        return SMEAuthResponse(
            success=True,
            message="SME registered successfully",
            data={
                "sme": sme_data_response,
                "access_token": result["access_token"],
                "token_type": result["token_type"]
            }
        )
        
    except HTTPException as e:
        return SMEAuthResponse(
            success=False,
            message=e.detail,
            error=e.detail
        )
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Registration failed",
            error="Internal server error"
        )

@router.post(
    "/login",
    response_model=SMEAuthResponse,
    summary="SME Login",
    description="Authenticate SME user with email and password"
)
async def login_sme(login_data: SMELogin):
    """Authenticate an SME user"""
    try:
        result = await auth_service.login_sme(login_data)
        
        # Remove password hash from response
        sme_data_response = result["sme"].copy()
        sme_data_response.pop("password_hash", None)
        
        return SMEAuthResponse(
            success=True,
            message="Login successful",
            data={
                "sme": sme_data_response,
                "access_token": result["access_token"],
                "token_type": result["token_type"]
            }
        )
        
    except HTTPException as e:
        return SMEAuthResponse(
            success=False,
            message=e.detail,
            error=e.detail
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Login failed",
            error="Internal server error"
        )

@router.get(
    "/me",
    response_model=SMEAuthResponse,
    summary="Get Current SME",
    description="Get current authenticated SME information"
)
async def get_current_sme_info(current_sme: dict = Depends(get_current_sme)):
    """Get current authenticated SME information"""
    try:
        # Remove password hash from response
        sme_data = current_sme.copy()
        sme_data.pop("password_hash", None)
        
        return SMEAuthResponse(
            success=True,
            message="SME information retrieved successfully",
            data={"sme": sme_data}
        )
        
    except Exception as e:
        logger.error(f"Get current SME error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Failed to retrieve SME information",
            error="Internal server error"
        )

@router.post(
    "/verify-token",
    response_model=SMEAuthResponse,
    summary="Verify Token",
    description="Verify if a JWT token is valid"
)
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify if a JWT token is valid"""
    try:
        token = credentials.credentials
        sme = await auth_service.get_current_sme(token)
        
        if sme:
            # Remove password hash from response
            sme_data = sme.copy()
            sme_data.pop("password_hash", None)
            
            return SMEAuthResponse(
                success=True,
                message="Token is valid",
                data={"sme": sme_data}
            )
        else:
            return SMEAuthResponse(
                success=False,
                message="Invalid token",
                error="Token verification failed"
            )
            
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Token verification failed",
            error="Internal server error"
        )

@router.put(
    "/profile",
    response_model=SMEAuthResponse,
    summary="Update SME Profile",
    description="Update SME profile with sector and objective"
)
async def update_sme_profile(
    update_data: SMEUpdate,
    current_sme: dict = Depends(get_current_sme)
):
    """Update SME profile with sector and objective"""
    try:
        sme_id = current_sme["sme_id"]
        result = await auth_service.update_sme_profile(sme_id, update_data)
        
        # Remove password hash from response
        sme_data_response = result["sme"].copy()
        sme_data_response.pop("password_hash", None)
        
        return SMEAuthResponse(
            success=True,
            message="Profile updated successfully",
            data={"sme": sme_data_response}
        )
        
    except HTTPException as e:
        return SMEAuthResponse(
            success=False,
            message=e.detail,
            error=e.detail
        )
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return SMEAuthResponse(
            success=False,
            message="Profile update failed",
            error="Internal server error"
        )

@router.get(
    "/health",
    response_model=SMEAuthResponse,
    summary="Auth Service Health",
    description="Check authentication service health"
)
async def auth_health():
    """Check authentication service health"""
    return SMEAuthResponse(
        success=True,
        message="Authentication service is healthy",
        data={"status": "healthy"}
    )
