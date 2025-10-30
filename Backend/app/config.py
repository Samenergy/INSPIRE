import os
from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict

# Try to find .env file in multiple locations
env_file = None
for possible_path in [
    Path(__file__).parent.parent / ".env",  # Backend/.env
    Path(".env"),                            # Current directory
    Path("../Backend/.env"),                 # Parent/Backend/.env
]:
    if possible_path.exists():
        env_file = str(possible_path)
        break

class Settings(BaseSettings):
    model_config = ConfigDict(
        extra="ignore",
        env_file=env_file if env_file else ".env",
        case_sensitive=False,
        env_file_encoding='utf-8',
        env_parse_none_str='None'
    )

    app_name: str = Field(default="Company Data Scraping Service", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    mysql_url: str = Field(default="mysql+pymysql://root:password@localhost:3306/inspire", env="MYSQL_URL")
    
    # INSPIRE Database Configuration
    db_name: str = Field(default="inspire", env="DB_NAME")
    db_user: str = Field(default="root", env="DB_USER")
    db_password: str = Field(default="password", env="DB_PASSWORD")
    db_host: str = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=3306, env="DB_PORT")
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")

    apify_api_key: Optional[str] = Field(default=None, env="APIFY_API_KEY")
    apify_api_token: Optional[str] = Field(default=None, env="APIFY_API_TOKEN")
    serpapi_api_key: Optional[str] = Field(default=None, env="SERPAPI_API_KEY")
    linkedin_cookie: Optional[str] = Field(default=None, env="LINKEDIN_COOKIE")
    
    @property
    def serpapi_key(self) -> Optional[str]:
        """Alias for serpapi_api_key for backward compatibility"""
        return self.serpapi_api_key

    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")

    max_concurrent_scrapes: int = Field(default=5, env="MAX_CONCURRENT_SCRAPES")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    retry_attempts: int = Field(default=3, env="RETRY_ATTEMPTS")
    retry_delay: int = Field(default=1, env="RETRY_DELAY")

    max_articles_per_company: int = Field(default=50, env="MAX_ARTICLES_PER_COMPANY")
    data_cleanup_days: int = Field(default=30, env="DATA_CLEANUP_DAYS")

settings = Settings()
