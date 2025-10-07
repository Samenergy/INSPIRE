# Project Structure

This document describes the organized structure of the Company Data Scraping and Classification Service.

## Directory Organization

```
Cappp/
├── app/                          # Main FastAPI application
│   ├── routers/                  # API route handlers
│   │   ├── comprehensive.py      # Google/SerpAPI scraping endpoints
│   │   ├── apify.py             # LinkedIn scraping endpoints
│   │   └── advanced_classification.py  # Article classification endpoints
│   ├── services/                 # Business logic services
│   │   ├── advanced_model_service.py      # ML classification service
│   │   ├── enhanced_summarization_model.py # Summarization model
│   │   ├── summarization_service.py       # Summarization service
│   │   ├── comprehensive_scrape_service.py # Scraping orchestration
│   │   ├── csv_export_service.py          # CSV export utilities
│   │   └── company_service_simplified.py  # Company CRUD operations
│   ├── scrapers/                 # Scraping implementations
│   │   ├── base.py              # Base scraper interface
│   │   ├── serpapi_scraper.py   # Google/SerpAPI scraper
│   │   └── apify_scraper.py     # LinkedIn scraper
│   ├── utils/                    # Utility modules
│   │   ├── rate_limiter.py      # Rate limiting
│   │   └── retry.py             # Retry logic
│   ├── models.py                 # Pydantic data models
│   ├── database_mysql.py         # MySQL database connection
│   ├── config.py                 # Application configuration
│   ├── middleware.py             # FastAPI middleware
│   └── main.py                   # Application entry point
│
├── ml_models/                    # Machine Learning Models
│   ├── classification/           # Article classification models
│   │   └── best_model/          # Production classification model
│   │       ├── best_classifier.pkl        # Trained Logistic Regression model
│   │       ├── scaler.pkl                 # Feature scaler
│   │       ├── model_config.json          # Model configuration & metrics
│   │       ├── sentence_model_info.json   # Sentence transformer info
│   │       └── complete_analysis_results.csv  # Training results
│   ├── summarization/            # Summarization models
│   │   └── summarization_model.pkl  # Text summarization model
│   ├── evaluation_results.json   # Classification evaluation metrics
│   └── summarization_evaluation_results.json  # Summarization metrics
│
├── notebooks/                    # Jupyter Notebooks
│   ├── ML_Model_Notebook.ipynb  # Transformer-Based Classification (2 experiments)
│   └── SummarizationModel_Analysis.ipynb  # Summarization model development
│
├── scripts/                      # Utility scripts
│   ├── training/                 # Model training scripts
│   │   ├── train_simple_classifier.py
│   │   ├── train_transformer_weak_supervision.py
│   │   ├── train_contrastive_relevance.py
│   │   ├── train_self_training.py
│   │   ├── train_all_approaches.py
│   │   ├── train_working_approaches.py
│   │   ├── train_summarization_simple.py
│   │   └── label_relevance.py
│   ├── inference/                # Model inference & comparison
│   │   ├── inference_simple_model.py
│   │   ├── inference_trained_model.py
│   │   ├── compare_models.py
│   │   ├── compare_summarization_models.py
│   │   └── example_workflow.py
│   ├── database/                 # Database setup scripts
│   │   └── init_mysql.sql
│   └── install_playwright.sh     # Playwright installation
│
├── documentation/                # Project documentation
│   ├── Classification_Model_README.md  # Classification model details
│   ├── TRAINING_GUIDE.md              # Model training guide
│   ├── TRAINING_SUCCESS_SUMMARY.md    # Training results summary
│   ├── SUMMARIZATION_IMPROVEMENTS.md  # Summarization improvements
│   ├── SUMMARIZATION_IMPROVEMENTS_SUMMARY.md
│   ├── FIXED_ISSUES.md                # Bug fixes log
│   ├── NOTEBOOK_EXPERIMENTS_ADDED.md  # Notebook experiments
│   └── NOTEBOOK_FIXED.md              # Notebook fixes
│
├── exports/                      # CSV exports from scraping operations
│   ├── README.md                 # Exports folder documentation
│   ├── mtn_news_articles_*.csv
│   ├── mtn_website_updates_*.csv
│   └── classification_results_*.csv
│
├── logs/                         # Application logs
│   └── errors.log
│
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker container configuration
├── docker-compose.yml            # Docker Compose configuration
├── nginx.conf                    # Nginx configuration
├── setup_mysql.sql               # MySQL setup script
└── config.env.example            # Example environment configuration

```

## Key Components

### API Endpoints

The application provides three main API routers:

1. **Comprehensive Scraping** (`/api/v1/scrape`)
   - Uses SerpAPI to scrape Google search results
   - Collects company information and news articles
   - Exports data to CSV files

2. **LinkedIn Scraping** (`/api/v1/apify/scrape`)
   - Uses Apify to scrape LinkedIn posts
   - Requires LinkedIn URL input
   - Exports posts and updates to CSV

3. **Advanced Classification** (`/api/v1/advanced/classify-upload`)
   - Classifies articles using ML models
   - Uses Transformer-based embeddings
   - Provides relevance scores and confidence metrics

### Machine Learning Models

#### Classification Model
- **Type**: Logistic Regression with SentenceTransformer embeddings
- **Embeddings**: all-MiniLM-L6-v2 (384 dimensions)
- **Performance**: F1-Score 0.951, Accuracy 95.2%
- **Categories**: 
  - Directly Relevant
  - Indirectly Useful
  - Not Relevant
- **Features**:
  - Weak supervision using semantic similarity
  - Enhanced keyword boosting
  - Hybrid classification logic
  - Penalty system for off-topic content

#### Summarization Model
- **Type**: Enhanced extractive summarization
- **Features**:
  - Sentence ranking with TF-IDF
  - Named entity recognition
  - Numerical data prioritization
  - Domain-specific keywords

### Notebooks

1. **ML_Model_Notebook.ipynb**
   - Transformer-Based Relevance Classification
   - 2 experiments: Random Forest & Logistic Regression
   - Weak supervision methodology
   - Model saving and evaluation

2. **SummarizationModel_Analysis.ipynb**
   - Summarization model development
   - Performance comparison
   - Enhancement iterations

### Scripts

Organized into three categories:

1. **Training**: Scripts for training ML models
2. **Inference**: Scripts for running predictions and comparisons
3. **Database**: Database initialization and setup

## Getting Started

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright (for web scraping)
bash scripts/install_playwright.sh

# Setup MySQL database
mysql -u root -p < setup_mysql.sql
```

### Running the API

```bash
# Development mode
python app/main.py

# Production mode with Docker
docker-compose up --build
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Model Usage

### Classification Service

```python
from app.services.advanced_model_service import AdvancedModelService
import pandas as pd

# Initialize service
service = AdvancedModelService()

# Prepare data
df = pd.read_csv('articles.csv')

# Classify articles
results = service.classify_articles(
    df=df,
    company_objective="Your company objective here",
    use_custom_objective=True
)
```

### Summarization Service

```python
from app.services.summarization_service import SummarizationService

# Initialize service
service = SummarizationService()

# Generate summary
summary = service.summarize_article(
    title="Article title",
    content="Article content here",
    max_sentences=3
)
```

## Environment Configuration

Copy `config.env.example` to `.env` and configure:

```bash
# API Keys
SERPAPI_API_KEY=your_serpapi_key
APIFY_API_KEY=your_apify_key

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=company_scraping

# Application
DEBUG=true
LOG_LEVEL=INFO
```

## Documentation

For detailed documentation, see the `documentation/` folder:

- **Training Guide**: How to train new models
- **API Guide**: How to use the API endpoints
- **Model Details**: Technical details about the models
- **Improvements**: Log of enhancements and fixes

## Exports

All scraping and classification results are automatically exported to the `exports/` folder with timestamped filenames.

## Logs

Application logs are stored in `logs/` directory with automatic rotation.

## License

[Add your license information here]
