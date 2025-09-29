# Company Data Scraping Service

A comprehensive backend service built with FastAPI for collecting, processing, and analyzing company-related data from multiple sources including news, website updates, and business registry information.

## Features

- **Multi-source Data Collection**: Integrates with Apify, SerpAPI, Playwright, and BeautifulSoup
- **RESTful API**: Clean REST endpoints for company management and data scraping
- **Data Processing**: Advanced normalization, cleaning, and deduplication
- **Rate Limiting**: Built-in rate limiting for external API calls
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Database Integration**: MongoDB support with MySQL compatibility
- **Real-time Insights**: Generate company insights and analytics
- **Modular Architecture**: Easy to extend with new data sources

## Quick Start

### Prerequisites

- Python 3.8+
- MongoDB (or MySQL)
- Redis (for caching and rate limiting)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Cappp
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers (optional):
```bash
playwright install
```

4. Set up environment variables:
```bash
cp config.env.example .env
# Edit .env with your configuration
```

5. Run the application:
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the service is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/company_data
MYSQL_URL=mysql+pymysql://user:password@localhost:3306/company_data

# API Keys
APIFY_API_KEY=your_apify_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Application Settings
APP_NAME=Company Data Scraping Service
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Scraping Configuration
MAX_CONCURRENT_SCRAPES=5
REQUEST_TIMEOUT=30
RETRY_ATTEMPTS=3
RETRY_DELAY=1

# Data Processing
MAX_ARTICLES_PER_COMPANY=50
DATA_CLEANUP_DAYS=30
```

## API Endpoints

### Companies

- `POST /api/v1/companies/` - Create a new company
- `GET /api/v1/companies/` - List companies with filtering
- `GET /api/v1/companies/{company_id}` - Get company details
- `PUT /api/v1/companies/{company_id}` - Update company
- `DELETE /api/v1/companies/{company_id}` - Delete company

### Scraping

- `POST /api/v1/scrapes/` - Trigger a scrape job
- `GET /api/v1/scrapes/jobs/{job_id}` - Get scrape job status
- `GET /api/v1/scrapes/jobs/` - List scrape jobs
- `POST /api/v1/scrapes/jobs/{job_id}/retry` - Retry failed job
- `DELETE /api/v1/scrapes/jobs/{job_id}` - Cancel job

### Insights

- `GET /api/v1/insights/{company_id}` - Get company insights
- `POST /api/v1/insights/{company_id}/generate` - Generate fresh insights
- `GET /api/v1/insights/{company_id}/news` - Get company news
- `GET /api/v1/insights/{company_id}/website-updates` - Get website updates
- `GET /api/v1/insights/{company_id}/business-registry` - Get business registry
- `GET /api/v1/insights/{company_id}/analytics` - Get analytics

### LinkedIn (Social Media Insights)

- `GET /api/v1/linkedin/insights/{company_id}` - Get comprehensive LinkedIn insights
- `GET /api/v1/linkedin/posts/{company_id}` - Get LinkedIn posts
- `GET /api/v1/linkedin/engagement/{company_id}` - Get engagement metrics
- `GET /api/v1/linkedin/content-analysis/{company_id}` - Get content analysis
- `GET /api/v1/linkedin/trending-topics/{company_id}` - Get trending topics
- `GET /api/v1/linkedin/competitor-analysis/{company_id}` - Get competitor analysis

## Usage Examples

### 1. Add a Company

```bash
curl -X POST "http://localhost:8000/api/v1/companies/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "location": "San Francisco, CA",
    "website": "https://acme.com",
    "industry": "Technology"
  }'
```

### 2. Trigger Data Scraping

```bash
curl -X POST "http://localhost:8000/api/v1/scrapes/" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company_id_here",
    "data_sources": ["apify", "serpapi", "playwright"],
    "force_refresh": false
  }'
```

### 3. Get Company Insights

```bash
curl "http://localhost:8000/api/v1/insights/{company_id}"
```

### 4. Get LinkedIn Insights

```bash
curl "http://localhost:8000/api/v1/linkedin/insights/{company_id}"
```

### 5. Get LinkedIn Engagement Metrics

```bash
curl "http://localhost:8000/api/v1/linkedin/engagement/{company_id}"
```

## Data Sources

### Apify
- **LinkedIn Posts Scraping** (Primary focus)
- LinkedIn company page scraping
- Web scraping
- Business registry data

### SerpAPI
- Google Search results
- Business information
- News search results

### Playwright
- Dynamic web content
- JavaScript-heavy sites
- Real browser automation

### BeautifulSoup
- Static web content
- News aggregators
- Website parsing

## Data Processing

The service includes advanced data processing capabilities:

- **Text Cleaning**: Remove HTML entities, normalize whitespace
- **Deduplication**: Remove duplicate articles and updates
- **Relevance Scoring**: Calculate relevance scores for articles
- **Keyword Extraction**: Extract key topics and keywords
- **Sentiment Analysis**: Basic sentiment scoring for news
- **Date Normalization**: Standardize date formats

## Architecture

```
app/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── models.py              # Pydantic models
├── database.py            # MongoDB connection
├── database_mysql.py      # MySQL connection
├── database_hybrid.py     # Hybrid database management
├── middleware.py          # FastAPI middleware
├── logging_config.py      # Logging setup
├── routers/               # API endpoints
│   ├── companies.py
│   ├── scrapes.py
│   └── insights.py
├── services/              # Business logic
│   ├── company_service.py
│   ├── scrape_service.py
│   ├── data_processor.py
│   └── insights_service.py
├── scrapers/              # Data collection
│   ├── base.py
│   ├── factory.py
│   ├── apify_scraper.py
│   ├── serpapi_scraper.py
│   ├── playwright_scraper.py
│   └── beautifulsoup_scraper.py
└── utils/                 # Utilities
    ├── rate_limiter.py
    └── retry.py
```

## Development

### Adding New Data Sources

1. Create a new scraper class inheriting from `BaseScraper`
2. Implement the `scrape_company` method
3. Register the scraper in `ScraperFactory`
4. Add the data source to the `DataSource` enum

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
isort app/
flake8 app/
```

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Considerations

- Set up proper logging
- Configure rate limiting
- Use environment variables for secrets
- Set up monitoring and alerting
- Configure database backups
- Use a reverse proxy (nginx)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
