from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
import uuid

from app.config import settings
from loguru import logger

limiter = Limiter(key_func=get_remote_address)

def setup_middleware(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # CORS middleware is configured in main.py to avoid conflicts
    # (cannot use allow_origins=["*"] with allow_credentials=True)

    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=[
                "localhost",
                "127.0.0.1",
                "0.0.0.0",
                "46.62.228.201",
                "api.inspire.software",
                "inspire-4.onrender.com"
            ]
        )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        request_id = str(uuid.uuid4())

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

            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Request {request_id} failed after {process_time:.3f}s: {str(e)}"
            )
            raise

    @app.middleware("http")
    async def handle_errors(request: Request, call_next):
        try:
            return await call_next(request)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unhandled error in request {getattr(request.state, 'request_id', 'unknown')}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
