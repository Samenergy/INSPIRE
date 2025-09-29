"""Middleware configuration for the FastAPI application."""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
import uuid

from app.config import settings
from loguru import logger


# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


def setup_middleware(app: FastAPI):
    """Setup all middleware for the FastAPI application."""
    
    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted host middleware
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
        )
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all incoming requests."""
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Add request ID to headers
        request.state.request_id = request_id
        
        logger.info(
            f"Request {request_id}: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            logger.info(
                f"Request {request_id} completed in {process_time:.3f}s "
                f"with status {response.status_code}"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Request {request_id} failed after {process_time:.3f}s: {str(e)}"
            )
            raise
    
    # Error handling middleware
    @app.middleware("http")
    async def handle_errors(request: Request, call_next):
        """Handle errors and return appropriate responses."""
        try:
            return await call_next(request)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unhandled error in request {getattr(request.state, 'request_id', 'unknown')}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
