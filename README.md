# I.N.S.P.I.R.E. 🚀

### Intelligent Network System for Partnerships, Insights, Research & Expansion  

**AI-powered B2B Intelligence Platform for MSMEs in Rwanda**

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**I.N.S.P.I.R.E.** is an enterprise-grade AI-powered B2B intelligence platform designed to help Micro, Small & Medium Enterprises (MSMEs) in Rwanda discover strategic partnership opportunities, analyze market trends, and make data-driven business decisions.

The platform integrates multiple data sources, advanced AI/ML models, and an intuitive web-based dashboard to deliver actionable intelligence tailored for the Rwandan MSME ecosystem.

### What I.N.S.P.I.R.E. Does

1. **Scrapes** company data from multiple sources (Google/SerpAPI)
2. **Classifies** articles based on SME objectives (95.2% accuracy)
3. **Analyzes** companies using RAG (Retrieval-Augmented Generation)
4. **Generates** personalized outreach campaigns
5. **Visualizes** insights through comprehensive dashboards

---

## ✨ Key Features

### 🤖 AI/ML Capabilities

- **Article Classification** (95.2% accuracy)
  - ML-based classification using SentenceTransformer
  - Categorizes articles as: Directly Relevant, Indirectly Useful, Not Relevant
  - Personalized based on SME objectives

- **RAG Analysis** (10 Intelligence Categories)
  - Latest Updates (product launches, financial results, partnerships)
  - Challenges (competitive pressures, operational difficulties)
  - Decision Makers (executives, leaders with roles)
  - Market Position (competitors, market share, advantages)
  - Future Plans (expansion, investments, strategic initiatives)
  - Action Plan (3 specific steps for SME engagement)
  - Solution (3 relevant SME solutions for company needs)
  - Company Info (5-sentence company description)
  - Strengths (key competitive advantages)
  - Opportunities (potential growth areas)

### 📊 Data Management

- **Comprehensive Company Profiles**
  - Multi-source data aggregation
  - RAG-extracted intelligence fields
  - Industry classification and location tracking

- **Article Management**
  - Automated scraping from Google/SerpAPI
  - Content classification and relevance scoring
  - Sentiment analysis

- **Analysis Storage**
  - Structured JSON storage for RAG results
  - Historical analysis tracking
  - Confidence scores per category

### 📧 Outreach Campaigns

- **Automated Campaign Generation**
  - Email, Call, and Meeting templates
  - Personalized based on company analysis
  - SME objective-driven content

- **Campaign Management**
  - Draft, Scheduled, Sent, Completed statuses
  - Campaign history and tracking
  - Company-specific campaign organization

### 📈 Dashboard & Analytics

- **Real-time Statistics**
  - Total companies, articles, analyses, campaigns
  - Companies by status (completed, loading, pending, failed)
  - Articles by classification
  - Campaigns by type and status
  - Industry distribution

- **Data Visualization**
  - Interactive charts (Bar, Doughnut, Line)
  - Recent activity feed
  - Performance metrics

### 🔐 Security & Authentication

- **JWT-based Authentication**
  - Secure signup and login
  - Token-based API access
  - Protected routes

- **SME Management**
  - Profile management
  - Sector and objective tracking
  - Multi-tenant data isolation

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   React Frontend│◄───────►│  FastAPI Backend│
│   (Port 3000)   │  HTTP   │   (Port 8000)   │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼─────┐
            │    MySQL     │  │    Redis    │  │   Celery   │
            │  (Port 3306) │  │ (Port 6379) │  │   Workers  │
            └──────────────┘  └─────────────┘  └────────────┘
                                     │
                            ┌────────┴────────┐
                            │                 │
                    ┌───────▼──────┐  ┌───────▼──────┐
                    │    Milvus    │  │    Ollama    │
                    │ (Port 19530) │  │ (Port 11434) │
                    └──────────────┘  └──────────────┘
```

### Data Flow

1. **User Action** → Frontend sends request to FastAPI
2. **API Processing** → FastAPI validates and routes request
3. **Background Task** → Celery worker processes long-running tasks
4. **Data Storage** → MySQL stores structured data
5. **Vector Search** → Milvus stores embeddings for RAG
6. **LLM Processing** → Ollama generates AI responses
7. **Progress Tracking** → Redis stores task progress
8. **Response** → Results returned to frontend

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Core language |
| **FastAPI** | 0.104.1 | Web framework |
| **Celery** | 5.3.4 | Background task processing |
| **SQLAlchemy** | 2.0.23 | ORM |
| **MySQL** | 8.0 | Primary database |
| **Redis** | 7 | Caching & task queue |
| **Milvus** | Latest | Vector database |
| **Ollama** | Latest | LLM inference (Llama 3.1) |
| **SentenceTransformer** | 2.2.2 | Embeddings |
| **scikit-learn** | 1.3.2 | ML models |
| **Playwright** | 1.40.0 | Web scraping |
| **SerpAPI** | - | Google search API |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI framework |
| **TypeScript** | 5.3.2 | Type safety |
| **Vite** | 7.2.2 | Build tool |
| **Material-UI** | 5.14.18 | Component library |
| **Chart.js** | 4.4.0 | Data visualization |
| **React Router** | 6.20.0 | Navigation |
| **Tailwind CSS** | 3.3.5 | Styling |
| **Framer Motion** | 12.6.3 | Animations |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **MySQL** >= 8.0
- **Redis** >= 7.0
- **Docker** & **Docker Compose** (optional, for containerized deployment)
- **Ollama** (for LLM inference)

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/INSPIRE.git
cd INSPIRE

# Start all services
cd Backend
docker-compose up -d

# Wait for services to initialize (30-60 seconds)
# Backend will be available at http://localhost:8000
# Frontend will be available at http://localhost:80 (via Nginx)
```

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Create .env file (see Configuration section)
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -m app.database_init

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will be available at http://localhost:3000
```

#### Celery Worker Setup

```bash
# In Backend directory with virtual environment activated
celery -A app.celery_app worker --loglevel=info --concurrency=1
```

#### Ollama Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull Llama 3.1 model (in another terminal)
ollama pull llama3.1:8b-instruct-q4_K_M
```

#### Milvus Setup (Optional)

```bash
# Using Docker
docker run -d --name milvus-standalone \
  -p 19530:19530 \
  -p 9091:9091 \
  milvusdb/milvus:latest

# Or use docker-compose (included in Backend/docker-compose.yml)
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# Application
APP_NAME=Inspire
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO

# Database
DB_NAME=inspire
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
MYSQL_URL=mysql+pymysql://root:your_password@localhost:3306/inspire

# Redis
REDIS_URL=redis://localhost:6379/0

# API Keys
SERPAPI_API_KEY=your_serpapi_key
APIFY_API_KEY=your_apify_key  # Optional
APIFY_API_TOKEN=your_apify_token  # Optional
LINKEDIN_COOKIE=your_linkedin_cookie  # Optional

# Milvus (Vector Database)
MILVUS_HOST=localhost
MILVUS_PORT=19530

# Ollama (LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M

# RAG Hyperparameters
RAG_TEMPERATURE=0.3
RAG_TOP_K=5
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=100

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
MAX_CONCURRENT_SCRAPES=5
```

### Frontend Configuration

The frontend API base URL is configured in:
- `Frontend/src/services/authService.ts` (default: `http://127.0.0.1:8000`)

For local development, update to:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## 📖 Usage Guide

### 1. User Registration & Login

1. Navigate to the signup page
2. Enter your SME details (name, email, password)
3. Complete your profile (sector, objectives)
4. You'll be automatically logged in

### 2. Adding a Company

1. Go to **Companies** page
2. Click **Add Company**
3. Enter company name and location
4. Click **Analyze** to start the unified analysis pipeline

### 3. Running Unified Analysis

The unified analysis pipeline:
1. **Scrapes** company data from Google (SerpAPI)
2. **Classifies** articles based on your SME objectives
3. **Runs RAG analysis** to extract 10 intelligence categories
4. **Stores** everything in the database

**Progress Tracking:**
- Analysis runs in the background (Celery task)
- Track progress via the progress endpoint
- Results appear automatically when complete

### 4. Viewing Company Intelligence

1. Navigate to **Companies** page
2. Click on a company card
3. View:
   - **Articles** (classified by relevance)
   - **Analysis** (RAG-extracted intelligence)
   - **Company Info** (5-sentence description)
   - **Strengths** (competitive advantages)
   - **Opportunities** (growth areas)

### 5. Generating Outreach Campaigns

1. Open a company profile
2. Click **Generate Campaign**
3. Select outreach type (Email, Call, Meeting)
4. Review and edit generated content
5. Save as draft or mark as sent

### 6. Dashboard Analytics

The dashboard shows:
- Total companies, articles, analyses, campaigns
- Companies by status
- Articles by classification
- Campaigns by type and status
- Recent activity feed

---

## 📚 API Documentation

### Base URL

- **Production**: `http://127.0.0.1:8000`
- **Local**: `http://localhost:8000`

### Interactive API Docs

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/verify-token
PUT  /api/auth/profile
```

#### Companies

```http
GET    /api/inspire/companies
POST   /api/inspire/companies
GET    /api/inspire/companies/{company_id}
PUT    /api/inspire/companies/{company_id}
DELETE /api/inspire/companies/{company_id}
GET    /api/inspire/companies/{company_id}/analysis
GET    /api/inspire/companies/{company_id}/articles
GET    /api/inspire/companies/{company_id}/intelligence
```

#### Unified Analysis

```http
POST /api/v1/unified/unified-analysis
GET  /api/v1/unified/unified-analysis/progress/{job_id}
GET  /api/v1/unified/unified-analysis/result/{job_id}
```

#### Outreach Campaigns

```http
POST   /api/outreach/generate
GET    /api/outreach/campaigns
GET    /api/outreach/campaigns/{campaign_id}
PUT    /api/outreach/campaigns/{campaign_id}
PUT    /api/outreach/campaigns/{campaign_id}/status
DELETE /api/outreach/campaigns/{campaign_id}
```

#### Dashboard

```http
GET /api/inspire/dashboard/stats
GET /api/inspire/dashboard/activity
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📁 Project Structure

```
Cappp/
│
├── Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py              # Configuration management
│   │   ├── models.py               # Pydantic models
│   │   ├── middleware.py          # Request middleware
│   │   ├── logging_config.py      # Logging setup
│   │   ├── celery_app.py          # Celery configuration
│   │   ├── database_init.py       # Database initialization
│   │   ├── database_mysql_inspire.py  # MySQL connection & operations
│   │   │
│   │   ├── routers/               # API route handlers
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   ├── comprehensive.py   # Scraping endpoints
│   │   │   ├── unified_analysis.py # Unified analysis pipeline
│   │   │   ├── rag_analysis.py    # RAG analysis endpoints
│   │   │   ├── inspire_database.py # Database CRUD endpoints
│   │   │   ├── outreach.py        # Campaign endpoints
│   │   │   ├── advanced_classification.py # Article classification
│   │   │   └── summarization.py   # Text summarization
│   │   │
│   │   ├── services/              # Business logic
│   │   │   ├── rag_analysis_service.py      # RAG implementation
│   │   │   ├── advanced_model_service.py    # Classification models
│   │   │   ├── comprehensive_scrape_service.py # Scraping orchestration
│   │   │   ├── outreach_service.py          # Campaign generation
│   │   │   ├── auth_service.py               # Authentication logic
│   │   │   └── ...
│   │   │
│   │   ├── scrapers/              # Web scraping modules
│   │   │   ├── serpapi_scraper.py # SerpAPI integration
│   │   │   ├── apify_scraper.py   # Apify integration
│   │   │   └── base.py            # Base scraper class
│   │   │
│   │   ├── tasks/                  # Celery background tasks
│   │   │   └── unified_analysis_task.py # Unified analysis pipeline
│   │   │
│   │   └── utils/                  # Utility functions
│   │
│   ├── ml_models/                  # Trained ML models
│   │   ├── classification/        # Classification models
│   │   └── summarization/          # Summarization models
│   │
│   ├── notebooks/                  # Jupyter notebooks
│   │   ├── ML_Model_Notebook.ipynb
│   │   └── RAG_10Categories_Complete.ipynb
│   │
│   ├── exports/                    # CSV exports
│   ├── logs/                       # Application logs
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                   # Docker image definition
│   ├── docker-compose.yml          # Docker Compose configuration
│   └── nginx.conf                  # Nginx configuration
│
├── Frontend/
│   ├── src/
│   │   ├── App.tsx                 # Main application component
│   │   ├── main.tsx                # React entry point
│   │   │
│   │   ├── components/             # React components
│   │   │   ├── auth/               # Authentication components
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   ├── accounts/           # Company management
│   │   │   ├── campaigns/          # Campaign management
│   │   │   ├── layout/             # Layout components
│   │   │   ├── notifications/      # Notification system
│   │   │   └── ui/                 # Reusable UI components
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   └── ThemeContext.tsx    # Theme management
│   │   │
│   │   ├── services/               # API service layer
│   │   │   ├── authService.ts      # Authentication API
│   │   │   ├── companyService.ts   # Company API
│   │   │   └── AnalyticsDataService.ts
│   │   │
│   │   └── utils.ts                # Utility functions
│   │
│   ├── public/                     # Static assets
│   ├── package.json                # Node.js dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── tailwind.config.js          # Tailwind CSS configuration
│
├── ERD.png                         # Entity Relationship Diagram
├── System Architecture.png         # System architecture diagram
├── Sequence Diagram.png             # Sequence diagram
├── Usecase.png                     # Use case diagram
└── README.md                        # This file
```

---

## 🔧 Development

### Running in Development Mode

#### Backend

```bash
cd Backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd Frontend
npm run dev
```

#### Celery Worker

```bash
cd Backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info --concurrency=1
```

### Code Quality

#### Backend

```bash
# Format code
black app/

# Sort imports
isort app/

# Lint
flake8 app/

# Type checking
mypy app/
```

#### Frontend

```bash
# Lint
npm run lint

# Type check
npm run build:check
```

### Database Migrations

The database schema is managed through `database_init.py`. To update the schema:

1. Modify the table creation logic in `Backend/app/database_init.py`
2. Run the initialization script:
   ```bash
   python -m app.database_init
   ```

### Testing

```bash
# Backend tests
cd Backend
pytest

# Frontend tests
cd Frontend
npm test
```

---

## 🚢 Deployment

### Docker Deployment

The project includes a complete Docker Compose setup:

```bash
cd Backend
docker-compose up -d
```

This starts:
- FastAPI backend
- Celery worker
- MySQL database
- Redis cache
- Milvus vector database
- Ollama LLM service
- Nginx reverse proxy

### Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Use managed MySQL/PostgreSQL service
3. **Redis**: Use managed Redis service
4. **SSL/TLS**: Configure SSL certificates for HTTPS
5. **Monitoring**: Set up logging and monitoring (e.g., Sentry, DataDog)
6. **Backups**: Regular database backups
7. **Scaling**: Use multiple Celery workers for high load

### Environment-Specific Configuration

- **Development**: `DEBUG=True`, local services
- **Staging**: `DEBUG=False`, staging database
- **Production**: `DEBUG=False`, production database, SSL enabled

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow PEP 8 for Python code
- Use TypeScript for frontend code
- Write meaningful commit messages
- Add docstrings to functions and classes
- Include type hints in Python code

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **SentenceTransformer** for embeddings
- **Ollama** for LLM inference
- **FastAPI** for the excellent web framework
- **Material-UI** for the component library
- **Chart.js** for data visualization

---

## 📞 Support & Contact

- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/INSPIRE/issues)
- **Email**: support@inspire.software

---

## 🎯 Roadmap

- [ ] Enhanced LinkedIn scraping integration
- [ ] Real-time notifications via WebSockets
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Integration with CRM systems
- [ ] Advanced ML model fine-tuning
- [ ] Automated email sending
- [ ] Calendar integration for meetings

---

**Built with ❤️ for MSMEs in Rwanda**
