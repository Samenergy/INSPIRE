"""Rate limiting utilities for external API calls."""

import asyncio
import time
from typing import Dict, Optional
from dataclasses import dataclass, field
from collections import defaultdict

from app.config import settings
from loguru import logger


@dataclass
class RateLimit:
    """Rate limit configuration for an API."""
    requests_per_minute: int
    requests_per_hour: int
    requests_per_day: int
    last_request_time: float = field(default_factory=time.time)
    request_times: list = field(default_factory=list)


class RateLimiter:
    """Rate limiter for managing API call frequency."""
    
    def __init__(self):
        self.rate_limits: Dict[str, RateLimit] = {}
        self._initialize_default_limits()
    
    def _initialize_default_limits(self):
        """Initialize default rate limits for known APIs."""
        self.rate_limits = {
            "apify": RateLimit(
                requests_per_minute=10,
                requests_per_hour=100,
                requests_per_day=1000
            ),
            "serpapi": RateLimit(
                requests_per_minute=20,
                requests_per_hour=200,
                requests_per_day=2000
            ),
            "default": RateLimit(
                requests_per_minute=10,
                requests_per_hour=100,
                requests_per_day=1000
            )
        }
    
    async def wait_for_rate_limit(self, api_name: str = "default") -> float:
        """
        Wait if necessary to respect rate limits.
        
        Args:
            api_name: Name of the API to check rate limits for
            
        Returns:
            Time waited in seconds
        """
        if api_name not in self.rate_limits:
            api_name = "default"
        
        rate_limit = self.rate_limits[api_name]
        current_time = time.time()
        
        # Clean old request times
        rate_limit.request_times = [
            req_time for req_time in rate_limit.request_times
            if current_time - req_time < 86400  # Keep last 24 hours
        ]
        
        # Check if we need to wait
        wait_time = 0.0
        
        # Check per-minute limit
        minute_ago = current_time - 60
        recent_requests = [t for t in rate_limit.request_times if t > minute_ago]
        
        if len(recent_requests) >= rate_limit.requests_per_minute:
            wait_time = max(wait_time, 60 - (current_time - min(recent_requests)))
        
        # Check per-hour limit
        hour_ago = current_time - 3600
        hourly_requests = [t for t in rate_limit.request_times if t > hour_ago]
        
        if len(hourly_requests) >= rate_limit.requests_per_hour:
            wait_time = max(wait_time, 3600 - (current_time - min(hourly_requests)))
        
        # Check per-day limit
        day_ago = current_time - 86400
        daily_requests = [t for t in rate_limit.request_times if t > day_ago]
        
        if len(daily_requests) >= rate_limit.requests_per_day:
            wait_time = max(wait_time, 86400 - (current_time - min(daily_requests)))
        
        # Wait if necessary
        if wait_time > 0:
            logger.info(f"Rate limiting {api_name}: waiting {wait_time:.2f} seconds")
            await asyncio.sleep(wait_time)
        
        # Record this request
        rate_limit.request_times.append(time.time())
        rate_limit.last_request_time = time.time()
        
        return wait_time
    
    def set_rate_limit(
        self,
        api_name: str,
        requests_per_minute: int,
        requests_per_hour: int,
        requests_per_day: int
    ):
        """Set custom rate limits for an API."""
        self.rate_limits[api_name] = RateLimit(
            requests_per_minute=requests_per_minute,
            requests_per_hour=requests_per_hour,
            requests_per_day=requests_per_day
        )
        logger.info(f"Set rate limits for {api_name}: {requests_per_minute}/min, {requests_per_hour}/hour, {requests_per_day}/day")
    
    def get_rate_limit_status(self, api_name: str = "default") -> Dict[str, int]:
        """Get current rate limit status for an API."""
        if api_name not in self.rate_limits:
            api_name = "default"
        
        rate_limit = self.rate_limits[api_name]
        current_time = time.time()
        
        # Clean old request times
        rate_limit.request_times = [
            req_time for req_time in rate_limit.request_times
            if current_time - req_time < 86400
        ]
        
        minute_ago = current_time - 60
        hour_ago = current_time - 3600
        day_ago = current_time - 86400
        
        recent_requests = [t for t in rate_limit.request_times if t > minute_ago]
        hourly_requests = [t for t in rate_limit.request_times if t > hour_ago]
        daily_requests = [t for t in rate_limit.request_times if t > day_ago]
        
        return {
            "requests_last_minute": len(recent_requests),
            "requests_last_hour": len(hourly_requests),
            "requests_last_day": len(daily_requests),
            "limit_per_minute": rate_limit.requests_per_minute,
            "limit_per_hour": rate_limit.requests_per_hour,
            "limit_per_day": rate_limit.requests_per_day,
            "remaining_minute": max(0, rate_limit.requests_per_minute - len(recent_requests)),
            "remaining_hour": max(0, rate_limit.requests_per_hour - len(hourly_requests)),
            "remaining_day": max(0, rate_limit.requests_per_day - len(daily_requests))
        }


# Global rate limiter instance
rate_limiter = RateLimiter()
