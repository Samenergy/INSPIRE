"""Configuration management for the company data scraping service."""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = ConfigDict(
        extra="ignore",
        env_file=".env",
        case_sensitive=False
    )
    
    # Application
    app_name: str = Field(default="Company Data Scraping Service", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Database
    database_url: str = Field(default="mongodb://localhost:27017/company_data", env="DATABASE_URL")
    mysql_url: str = Field(default="mysql+pymysql://root:password@localhost:3306/capstone", env="MYSQL_URL")
    
    # API Keys
    apify_api_key: Optional[str] = Field(default=None, env="APIFY_API_KEY")
    serpapi_key: Optional[str] = Field(default=None, env="SERPAPI_KEY")
    linkedin_cookie: Optional[str] = Field(default=None, env="LINKEDIN_COOKIE")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")
    
    # Scraping Configuration
    max_concurrent_scrapes: int = Field(default=5, env="MAX_CONCURRENT_SCRAPES")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    retry_attempts: int = Field(default=3, env="RETRY_ATTEMPTS")
    retry_delay: int = Field(default=1, env="RETRY_DELAY")
    
    # Data Processing
    max_articles_per_company: int = Field(default=50, env="MAX_ARTICLES_PER_COMPANY")
    data_cleanup_days: int = Field(default=30, env="DATA_CLEANUP_DAYS")


# Global settings instance
settings = Settings()
