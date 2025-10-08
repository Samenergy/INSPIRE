# I.N.S.P.I.R.E
## Intelligent Network System for Partnerships, Insights, Research & Expansion for MSMEs in Rwanda

[![GitHub Repository](https://img.shields.io/badge/GitHub-INSPIRE-blue?style=flat&logo=github)](https://github.com/Samenergy/INSPIRE.git)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat&logo=python)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive B2B intelligence platform powered by AI, specifically designed to empower Rwandan MSMEs (Micro, Small & Medium Enterprises) with actionable market intelligence and partnership opportunities.

## 🎯 Project Vision

This project addresses a critical challenge faced by Rwandan MSMEs: **fragmented information** around national and global markets, **ineffective partnership finding**, and **lack of accessible, actionable intelligence**. 

By providing real-time business intelligence, NLP-based article classification and summarization, the platform enables small businesses to:
- 🔍 **Discover Potential Partners**: Identify companies aligned with their objectives
- 📈 **Spot Market Trends**: Track emerging opportunities in their industry
- 💡 **Make Data-Driven Decisions**: Access curated, relevant information
- 🚀 **Scale Sustainably**: Build strategic partnerships for growth

**Ultimate Goal**: Bridge the gap between Rwanda's strong innovation inputs and low innovation outputs by empowering MSMEs to scale, build strategic partnerships, and contribute meaningfully to the local economy.

## 🤖 AI-Powered Solution

The platform leverages two advanced machine learning models:

### 1. **Article Classification Model** (95.2% Accuracy)
- Automatically categorizes business news and articles into three relevance levels
- Uses transformer-based semantic understanding
- Trained with weak supervision (no manual labeling required)

### 2. **Text Summarization Model** (85-90% Information Retention)
- Condenses lengthy articles into actionable 3-sentence summaries
- Preserves key facts, entities, and numerical data
- Enables rapid information processing for busy entrepreneurs

---

## 📊 Repository

**GitHub**: [https://github.com/Samenergy/INSPIRE.git](https://github.com/Samenergy/INSPIRE.git)

## 🚀 Features

### 🔍 Data Scraping
- **Google/SerpAPI Integration**: Search and collect company news, information, and LinkedIn URLs
- **LinkedIn Scraping**: Automated LinkedIn post and update collection via Apify
- **Multi-Source Aggregation**: Unified data collection from various sources
- **CSV Export**: Automatic export of all scraped data with timestamps
- **Real-time Updates**: Track company activities and news

### 🤖 Machine Learning Classification
- **Transformer-Based Classification**: Uses SentenceTransformer embeddings (all-MiniLM-L6-v2)
- **High Accuracy**: 95.2% accuracy, F1-Score 0.951
- **MSME-Focused**: Classify articles based on MSME partnership objectives
- **Three-Category Classification**:
  - **Directly Relevant**: Articles directly supporting MSME objectives
  - **Indirectly Useful**: Articles related to broader MSME ecosystem
  - **Not Relevant**: Off-topic articles
- **Hybrid Classification Logic**: Combines ML predictions with weak supervision
- **Custom Objectives**: Adapt to specific business partnership criteria
- **Confidence Scores**: Probability scores for each classification

### 📝 Text Summarization
- **Enhanced Extractive Summarization**: TF-IDF-based sentence ranking
- **Named Entity Recognition**: Prioritizes important entities (companies, people, locations)
- **Domain-Specific Keywords**: Optimized for business and MSME content
- **Numerical Data Prioritization**: Highlights key metrics and statistics
- **Multi-Domain Support**: General, Business, Technology, Finance
- **Customizable Length**: Adjustable summary sentence count
- **Combined Workflow**: Classify and summarize in one request

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Model Information](#model-information)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Documentation](#documentation)

## 🔧 Installation

### Prerequisites
- Python 3.9+
- Docker (optional, for containerized deployment)

**Note**: MySQL database is optional - the application works without it for classification and summarization endpoints.

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Samenergy/INSPIRE.git
cd INSPIRE
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment (Optional)**
```bash
cp config.env.example .env
# Edit .env with your API keys if using scraping features
```

**Required API Keys** (only if using scraping endpoints):
- `SERPAPI_API_KEY` - For Google/News scraping
- `APIFY_API_KEY` - For LinkedIn scraping

**Note**: Classification and Summarization work without API keys or database!

## 🚀 Quick Start

### Running the API

**Option 1: Python directly**
```bash
python app/main.py
```

**Option 2: Using uvicorn**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Option 3: Docker (includes MySQL)**
```bash
docker-compose up --build
```

**Option 4: With custom port**
```bash
PORT=8080 python app/main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Quick Test - Classify Articles (No Setup Required!)

The classification and summarization endpoints work immediately without any database or API key setup:

```bash
# 1. Create a test CSV file with articles
echo "title,content
Fintech startup raises funding,A new fintech company in Rwanda secured funding for digital payments
Agriculture news,New farming techniques introduced in rural areas" > test_articles.csv

# 2. Classify the articles
curl -X POST "http://localhost:8000/api/v1/advanced/classify-upload" \
  -F "file=@test_articles.csv" \
  -F "company_objective=We provide digital payment solutions for MSMEs in Africa"

# 3. Summarize an article
curl -X POST "http://localhost:8000/api/v1/summarization/summarize-text" \
  -F "title=Fintech Growth in Rwanda" \
  -F "content=The fintech sector in Rwanda is experiencing rapid growth with new startups emerging. Digital payment solutions are becoming more accessible to small businesses. Mobile money adoption has increased by 40% in the past year." \
  -F "max_sentences=3"
```

## 📡 API Endpoints

### Scraping Endpoints

#### 1. Comprehensive Company Scraping
**`POST /api/v1/scrape`**

Scrapes company data from Google/SerpAPI.

```json
{
  "name": "Company Name",
  "location": "Country/Region",
  "website": "https://company.com",
  "industry": "Technology",
  "description": "Company description"
}
```

#### 2. LinkedIn Scraping
**`POST /api/v1/apify/scrape`**

Scrapes LinkedIn posts and updates.

```json
{
  "linkedin_url": "https://www.linkedin.com/company/microsoft/posts/"
}
```

#### 3. Scraping Status
**`GET /api/v1/status`**

Get comprehensive scraping service status.

### Classification Endpoints

#### 4. Classify Articles from CSV
**`POST /api/v1/advanced/classify-upload`**

Classifies articles based on MSME objectives.

```bash
curl -X POST "http://localhost:8000/api/v1/advanced/classify-upload" \
  -F "file=@articles.csv" \
  -F "company_objective=We provide fintech solutions for MSMEs..."
```

#### 5. Classify Single Article
**`POST /api/v1/advanced/classify-text`**

Classify a single article by providing title and content directly.

```bash
curl -X POST "http://localhost:8000/api/v1/advanced/classify-text" \
  -F "title=Article Title" \
  -F "content=Article content here..." \
  -F "company_objective=Your MSME objective"
```

#### 6. Classification Model Info
**`GET /api/v1/advanced/model-info`**

Returns information about the classification model (F1-Score: 0.951).

### Summarization Endpoints

#### 7. Summarize Articles from CSV
**`POST /api/v1/summarization/summarize-upload`**

Generate summaries for all articles in a CSV file.

```bash
curl -X POST "http://localhost:8000/api/v1/summarization/summarize-upload" \
  -F "file=@articles.csv" \
  -F "max_sentences=3" \
  -F "domain=business"
```

#### 8. Summarize Single Article
**`POST /api/v1/summarization/summarize-text`**

Summarize a single article directly.

```bash
curl -X POST "http://localhost:8000/api/v1/summarization/summarize-text" \
  -F "title=Article Title" \
  -F "content=Long article content here..." \
  -F "max_sentences=3"
```

#### 9. Classify & Summarize (Combined)
**`POST /api/v1/summarization/classify-and-summarize`**

One-stop endpoint: classify articles and automatically summarize relevant ones.

```bash
curl -X POST "http://localhost:8000/api/v1/summarization/classify-and-summarize" \
  -F "file=@articles.csv" \
  -F "company_objective=We support MSME digital transformation..." \
  -F "max_sentences=3"
```

#### 10. Summarization Service Info
**`GET /api/v1/summarization/summarization-info`**

Get information about summarization capabilities and domains.

### System Endpoints

#### 11. API Information
**`GET /`**

Get API overview and available endpoints.

#### 12. Health Check
**`GET /health`**

Check service and database health status.

## 📁 Project Structure

```
Cappp/
├── app/                          # FastAPI Application
│   ├── routers/                  # API Route Handlers
│   │   ├── comprehensive.py      # Google/SerpAPI scraping endpoints
│   │   ├── apify.py             # LinkedIn scraping endpoints
│   │   ├── advanced_classification.py  # Article classification endpoints
│   │   └── summarization.py     # Article summarization endpoints
│   ├── services/                 # Business Logic Services
│   │   ├── advanced_model_service.py      # ML classification service
│   │   ├── advanced_data_processor.py     # Data processing utilities
│   │   ├── enhanced_summarization_model.py # Enhanced summarization
│   │   ├── summarization_service.py       # Summarization service
│   │   ├── summarization_model.py         # Base summarization model
│   │   ├── comprehensive_scrape_service.py # Scraping orchestration
│   │   ├── csv_export_service.py          # CSV export utilities
│   │   └── company_service_simplified.py  # Company CRUD operations
│   ├── scrapers/                 # Scraping Implementations
│   │   ├── base.py              # Base scraper interface
│   │   ├── serpapi_scraper.py   # Google/SerpAPI scraper
│   │   └── apify_scraper.py     # LinkedIn scraper
│   ├── utils/                    # Utility Modules
│   │   ├── rate_limiter.py      # Rate limiting
│   │   └── retry.py             # Retry logic
│   ├── models.py                 # Pydantic data models
│   ├── database_mysql.py         # MySQL database connection
│   ├── config.py                 # Application configuration
│   ├── middleware.py             # FastAPI middleware
│   └── main.py                   # Application entry point
│
├── ml_models/                    # Machine Learning Models
│   ├── classification/           # Article Classification Models
│   │   └── best_model/          # Production classification model
│   │       ├── best_classifier.pkl        # Trained Logistic Regression
│   │       ├── scaler.pkl                 # Feature scaler
│   │       ├── model_config.json          # Model configuration
│   │       ├── sentence_model_info.json   # Sentence transformer info
│   │       └── complete_analysis_results.csv
│   ├── summarization/            # Text Summarization Models
│   │   └── summarization_model.pkl  # Summarization model
│   ├── evaluation_results.json   # Classification evaluation metrics
│   └── summarization_evaluation_results.json
│
├── exports/                      # CSV Exports (Generated)
│   └── README.md                # Exports documentation
│
├── logs/                         # Application Logs
│   └── errors.log               # Error logs
│
├── Dockerfile                    # Docker container configuration
├── docker-compose.yml            # Docker Compose configuration
├── nginx.conf                    # Nginx configuration
├── requirements.txt              # Python dependencies
├── setup_mysql.sql               # MySQL setup script
└── config.env.example            # Example environment configuration

```

## 🤖 Model Information

### Classification Model

- **Architecture**: Logistic Regression with SentenceTransformer embeddings
- **Embeddings**: all-MiniLM-L6-v2 (384 dimensions)
- **Training**: Weak supervision using semantic similarity
- **Performance**:
  - Accuracy: 95.2%
  - Precision: 0.951
  - Recall: 0.952
  - F1-Score: 0.951

**Features**:
- Semantic similarity to company objectives
- Enhanced keyword boosting system
- Penalty mechanism for off-topic content
- Hybrid classification combining ML + weak supervision

### Model Training & Experiments

The classification model was trained using weak supervision with 2 main experiments:

1. **Random Forest Classifier**
   - Accuracy: 85.5%
   - Precision: 0.877
   - Recall: 0.855
   - F1-Score: 0.810

2. **Logistic Regression** ⭐ (Production Model)
   - Accuracy: 95.2%
   - Precision: 0.951
   - Recall: 0.952
   - F1-Score: 0.951
   - **Selected for production use**

## ⚙️ Configuration

### Environment Variables

```bash
# API Keys
SERPAPI_API_KEY=your_serpapi_api_key
APIFY_API_KEY=your_apify_api_key

# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=company_scraping

# Application Settings
DEBUG=true
LOG_LEVEL=INFO
APP_VERSION=1.0.0
```

## 💡 Usage Examples

### Python Client

```python
import requests
import pandas as pd

# 1. Scrape company data
response = requests.post(
    "http://localhost:8000/api/v1/scrape",
    json={
        "name": "Microsoft",
        "location": "United States"
    }
)
data = response.json()

# 2. Classify articles
df = pd.read_csv("articles.csv")
files = {'file': open('articles.csv', 'rb')}
data = {
    'company_objective': 'We provide digital payment solutions in Africa'
}
response = requests.post(
    "http://localhost:8000/api/v1/advanced/classify-upload",
    files=files,
    data=data
)
results = response.json()

# 3. Get classification results
for article in results['data']['results']:
    print(f"Title: {article['title']}")
    print(f"Classification: {article['prediction_label']}")
    print(f"Confidence: {article['confidence_score']:.3f}")
    print("-" * 50)
```

### Using the Model Service Directly

```python
from app.services.advanced_model_service import AdvancedModelService
import pandas as pd

# Initialize service
service = AdvancedModelService()

# Load articles
df = pd.read_csv('articles.csv')

# Classify
results = service.classify_articles(
    df=df,
    company_objective="We provide mobile wallet services in Africa",
    use_custom_objective=True
)

# View summary
print(results['summary'])

# View individual results
for result in results['results']:
    print(f"{result['prediction_label']}: {result['title']}")
```

## 🔬 Development

### Working with ML Models

The trained models are stored in `ml_models/` directory:

```bash
# Classification model location
ml_models/classification/best_model/
  ├── best_classifier.pkl           # Logistic Regression model
  ├── scaler.pkl                    # Feature scaler
  ├── model_config.json             # Model configuration
  └── sentence_model_info.json      # Embedding model info

# Summarization model location
ml_models/summarization/
  └── summarization_model.pkl       # Summarization model
```

### Using Models Programmatically

```python
# Load classification model
from app.services.advanced_model_service import AdvancedModelService
model_service = AdvancedModelService()
print(f"Model loaded: {model_service.is_model_loaded()}")

# Load summarization model
from app.services.summarization_service import SummarizationService
summ_service = SummarizationService()
summary = summ_service.summarize_article(content="...", title="...")
```

## 📚 Documentation

### API Documentation

Once the server is running, comprehensive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs - Interactive API documentation
- **ReDoc**: http://localhost:8000/redoc - Alternative documentation view

### Quick Reference

**Key Features:**
- 🔍 **Scraping**: Multi-source company data collection
- 🤖 **Classification**: ML-based article relevance classification (F1: 0.951)
- 📝 **Summarization**: Enhanced extractive summarization
- 📊 **Export**: CSV export for all operations

## 🧪 Testing

```bash
# Test model loading
python -c "from app.services.advanced_model_service import AdvancedModelService; \
           service = AdvancedModelService(); \
           print('✓ Model loaded:', service.is_model_loaded())"

# Test API health
curl http://localhost:8000/health
```

## 📊 Model Performance

### Classification Results

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 0.855 | 0.877 | 0.855 | 0.810 |
| **Logistic Regression** | **0.952** | **0.951** | **0.952** | **0.951** |

### Classification Categories Distribution

- **Directly Relevant**: Articles that directly support company objectives
- **Indirectly Useful**: Articles related to the broader ecosystem
- **Not Relevant**: Articles with no meaningful connection

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Model Performance Summary

### Classification Model
| Metric | Value |
|--------|-------|
| Model Type | Logistic Regression + SentenceTransformer |
| Embeddings | all-MiniLM-L6-v2 (384 dims) |
| Accuracy | 95.2% |
| Precision | 0.951 |
| Recall | 0.952 |
| F1-Score | 0.951 |
| Training Method | Weak Supervision |

### Summarization Model
| Feature | Description |
|---------|-------------|
| Type | Enhanced Extractive Summarization |
| Technique | TF-IDF + Named Entity Recognition |
| Domains | General, Business, Technology, Finance |
| Default Length | 3 sentences |

## 🌍 Impact on Rwandan MSMEs

### Problem Statement
Rwandan MSMEs face significant barriers to growth:
- **Information Fragmentation**: Business intelligence scattered across multiple sources
- **Partnership Inefficiency**: Difficulty finding aligned business partners
- **Limited Market Insights**: Lack of accessible, curated market intelligence
- **Innovation Output Gap**: Strong inputs but low commercialization

### Our Solution
I.N.S.P.I.R.E provides:
- ✅ **Centralized Intelligence Hub**: Aggregated business news from multiple sources
- ✅ **Smart Partnership Matching**: AI-driven identification of potential partners
- ✅ **Actionable Summaries**: Quick insights without information overload
- ✅ **Real-Time Market Monitoring**: Stay updated on industry trends
- ✅ **Scalable Platform**: Designed to grow with Rwanda's MSME ecosystem

### Expected Outcomes
- 📈 Increased MSME partnership formation
- 💼 Better-informed business decisions
- 🌐 Enhanced access to regional and global markets
- 🇷🇼 Contribution to Rwanda's economic development goals

---

## 📂 Project Repository

**GitHub**: [https://github.com/Samenergy/INSPIRE.git](https://github.com/Samenergy/INSPIRE.git)

```bash
# Clone the repository
git clone https://github.com/Samenergy/INSPIRE.git
cd INSPIRE
```

---

## 📝 License

[Add your license information here]

## 🙏 Acknowledgments

- **SentenceTransformers**: For the all-MiniLM-L6-v2 embedding model
- **FastAPI**: For the excellent web framework
- **SerpAPI**: For Google search data
- **Apify**: For LinkedIn scraping capabilities
- **Rwanda Innovation Fund**: For supporting MSME innovation
- **MSME Community**: For feedback and validation

## 📧 Contact

**Project Lead**: Samuel Energy  
**GitHub**: [@Samenergy](https://github.com/Samenergy)  
**Repository**: [INSPIRE](https://github.com/Samenergy/INSPIRE.git)  
**API Documentation**: http://localhost:8000/docs

---

## 🇷🇼 Built for Rwanda, Scalable for Africa

**I.N.S.P.I.R.E** - Empowering MSMEs through Intelligent Business Intelligence

**Technology Stack**: Python 3.9+ • FastAPI • MySQL • Docker • SentenceTransformers • scikit-learn

**Key Innovation**: Uses weak supervision for training classification models without requiring manually labeled data, achieving 95.2% accuracy through semantic similarity to MSME objectives combined with keyword-based boosting and penalty systems.

**Two AI Models**:
1. **Classification Model**: Categorizes articles by relevance (Directly Relevant, Indirectly Useful, Not Relevant)
2. **Summarization Model**: Generates concise 3-sentence summaries preserving key business intelligence

---

*Bridging the gap between innovation inputs and economic outputs in Rwanda* 🇷🇼
