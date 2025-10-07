# Company Data Scraping & Classification Service

A comprehensive FastAPI-based service for scraping company data from multiple sources and classifying articles using advanced machine learning models.

## 🚀 Features

### Data Scraping
- **Google/SerpAPI Integration**: Search and collect company news, information, and LinkedIn URLs
- **LinkedIn Scraping**: Automated LinkedIn post and update collection via Apify
- **Multi-Source Aggregation**: Unified data collection from various sources
- **CSV Export**: Automatic export of all scraped data with timestamps

### Machine Learning Classification
- **Transformer-Based Classification**: Uses SentenceTransformer embeddings (all-MiniLM-L6-v2)
- **High Accuracy**: 95.2% accuracy, F1-Score 0.951
- **Three-Category Classification**:
  - Directly Relevant
  - Indirectly Useful
  - Not Relevant
- **Hybrid Classification Logic**: Combines ML predictions with weak supervision
- **Custom Company Objectives**: Classify articles based on specific business needs

### Text Summarization
- **Enhanced Extractive Summarization**: TF-IDF-based sentence ranking
- **Named Entity Recognition**: Prioritizes important entities
- **Domain-Specific Keywords**: Optimized for business content
- **Numerical Data Prioritization**: Highlights key metrics and statistics

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
- MySQL 8.0+
- Docker (optional)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Cappp
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Playwright** (for web scraping)
```bash
bash scripts/install_playwright.sh
playwright install
```

4. **Configure environment**
```bash
cp config.env.example .env
# Edit .env with your API keys and database credentials
```

5. **Setup database**
```bash
mysql -u root -p < setup_mysql.sql
```

## 🚀 Quick Start

### Running the API

**Development Mode:**
```bash
python app/main.py
```

**Docker Mode:**
```bash
docker-compose up --build
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### First API Call

```bash
# Scrape company data
curl -X POST "http://localhost:8000/api/v1/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Microsoft",
    "location": "United States"
  }'
```

## 📡 API Endpoints

### 1. Comprehensive Scraping
**Endpoint**: `POST /api/v1/scrape`

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

### 2. LinkedIn Scraping
**Endpoint**: `POST /api/v1/apify/scrape`

Scrapes LinkedIn posts and updates.

```json
{
  "linkedin_url": "https://www.linkedin.com/company/microsoft/posts/"
}
```

### 3. Article Classification
**Endpoint**: `POST /api/v1/advanced/classify-upload`

Classifies articles based on company objectives.

```bash
curl -X POST "http://localhost:8000/api/v1/advanced/classify-upload" \
  -F "file=@articles.csv" \
  -F "company_objective=We provide fintech solutions..."
```

### 4. Model Information
**Endpoint**: `GET /api/v1/advanced/model-info`

Returns information about the classification model.

### 5. Health Check
**Endpoint**: `GET /health`

Check service and database health.

## 📁 Project Structure

```
Cappp/
├── app/                    # FastAPI application
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── scrapers/          # Scraping implementations
│   └── utils/             # Utilities
├── ml_models/             # Trained ML models
│   ├── classification/    # Classification models
│   └── summarization/     # Summarization models
├── notebooks/             # Jupyter notebooks
├── scripts/               # Training & utility scripts
│   ├── training/         # Model training
│   ├── inference/        # Model inference
│   └── database/         # Database scripts
├── documentation/         # Project documentation
└── exports/              # CSV exports

```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure.

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

### Experiments Conducted

The project includes 2 main classification experiments (see `notebooks/ML_Model_Notebook.ipynb`):

1. **Random Forest Classifier**
   - Accuracy: 85.5%
   - F1-Score: 0.810

2. **Logistic Regression** ⭐ (Selected)
   - Accuracy: 95.2%
   - F1-Score: 0.951

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

### Training New Models

```bash
# Train classification model
python scripts/training/train_simple_classifier.py

# Train with different approaches
python scripts/training/train_all_approaches.py

# Train summarization model
python scripts/training/train_summarization_simple.py
```

### Running Inference

```bash
# Test classification model
python scripts/inference/inference_trained_model.py

# Compare models
python scripts/inference/compare_models.py
```

### Running Notebooks

```bash
jupyter notebook notebooks/
```

## 📚 Documentation

Detailed documentation is available in the `documentation/` folder:

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**: Complete project structure
- **[TRAINING_GUIDE.md](documentation/TRAINING_GUIDE.md)**: Model training guide
- **[Classification_Model_README.md](documentation/Classification_Model_README.md)**: Classification model details
- **[SUMMARIZATION_IMPROVEMENTS.md](documentation/SUMMARIZATION_IMPROVEMENTS.md)**: Summarization enhancements

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

## 📝 License

[Add your license information here]

## 🙏 Acknowledgments

- **SentenceTransformers**: For the all-MiniLM-L6-v2 embedding model
- **FastAPI**: For the excellent web framework
- **SerpAPI**: For Google search data
- **Apify**: For LinkedIn scraping capabilities

## 📧 Contact

[Add your contact information here]

---

**Note**: This project uses weak supervision for training classification models without requiring manually labeled data. The approach achieves high accuracy by using semantic similarity to company objectives combined with keyword-based boosting and penalty systems.
