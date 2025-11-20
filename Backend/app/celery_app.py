"""
Celery Application Configuration
Handles background task processing with Redis broker
"""

from celery import Celery
from app.config import settings
import os
import redis
from loguru import logger

# Get Redis URL with fallback to localhost for local development
def get_redis_url():
    """Get Redis URL with fallback to localhost for local development"""
    redis_url = settings.redis_url
    
    # If URL contains 'redis:' hostname (Docker), try localhost first for local dev
    if 'redis://redis:' in redis_url or 'redis://redis/' in redis_url:
        localhost_url = redis_url.replace('redis://redis:', 'redis://localhost:').replace('redis://redis/', 'redis://localhost/')
        try:
            # Try localhost first for local development
            client = redis.from_url(localhost_url, decode_responses=True, socket_connect_timeout=2)
            client.ping()
            logger.info(f"Celery connected to Redis at {localhost_url} (localhost fallback)")
            return localhost_url
        except Exception as e:
            logger.warning(f"Redis localhost connection failed: {e}, trying original URL")
    
    try:
        # Test connection to configured URL
        client = redis.from_url(redis_url, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        logger.info(f"Celery connected to Redis at {redis_url}")
        return redis_url
    except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as e:
        logger.error(f"Redis connection failed: {e}")
        # Try localhost as last resort
        if 'localhost' not in redis_url:
            localhost_url = redis_url.replace('redis://redis:', 'redis://localhost:').replace('redis://redis/', 'redis://localhost/')
            try:
                client = redis.from_url(localhost_url, decode_responses=True, socket_connect_timeout=2)
                client.ping()
                logger.info(f"Celery connected to Redis at {localhost_url} (fallback)")
                return localhost_url
            except Exception as e2:
                logger.error(f"Redis localhost fallback also failed: {e2}")
        # Return original URL anyway - Celery will handle the error
        return redis_url

# Create Celery app with Redis URL (with fallback)
redis_url = get_redis_url()
celery_app = Celery(
    "inspire",
    broker=redis_url,
    backend=redis_url,
    include=["app.tasks.unified_analysis_task"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=1800,  # 30 minutes max per task
    task_soft_time_limit=1500,  # 25 minutes soft limit
    worker_prefetch_multiplier=1,  # Process one task at a time to avoid memory issues
    worker_max_tasks_per_child=5,  # Restart worker after 5 tasks to prevent memory leaks (not used with threads pool)
    task_acks_late=True,  # Acknowledge tasks after completion
    task_reject_on_worker_lost=True,  # Reject tasks if worker dies
    result_expires=3600,  # Results expire after 1 hour
    task_max_retries=3,  # Max 3 retries to prevent infinite loops
    task_default_retry_delay=60,  # Wait 60 seconds between retries
    # Use threads pool instead of fork pool to avoid SIGSEGV with llama.cpp
    # llama.cpp doesn't handle fork() well - causes segmentation faults
    worker_pool='threads',  # Required for llama.cpp compatibility
)

# Set CPU-only mode for PyTorch to avoid SIGSEGV crashes
os.environ.setdefault("TORCH_DEVICE", "cpu")
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

logger = celery_app.log.get_default_logger()

