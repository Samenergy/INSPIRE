# I.N.S.P.I.R.E.

**Intelligent Network System for Partnerships, Insights, Research & Expansion**

AI-powered B2B intelligence platform for MSMEs 

---

## Quick Start

```bash
# Backend
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd Frontend
npm install
npm run dev
```

**Or use Docker (recommended):**
```bash
cd Backend
docker-compose up -d
```

---

## What It Does

I.N.S.P.I.R.E. helps MSMEs discover strategic partners and make data-driven decisions through:

- **Smart Scraping** - Collect company data from Google, LinkedIn, and web sources
- **AI Classification** - 95.2% accurate article relevance classification
- **RAG Analysis** - 10-category business intelligence with vector search
- **Outreach Generation** - Automated email/call/meeting campaigns
- **Partner Finder** - AI-powered partner recommendations

---

## Tech Stack

### Backend
- **Python 3.11** + **FastAPI** - API framework
- **MySQL 8** + **Redis** - Database & caching
- **Milvus** - Vector store for RAG
- **Phi-3.5 Mini** (llama.cpp) - Local LLM
- **Celery** - Background tasks
- **SentenceTransformers** - ML models

### Frontend
- **React 18** + **TypeScript** - Modern SPA
- **Material-UI** + **Tailwind CSS** - UI framework
- **Chart.js** - Analytics visualizations
- **Vite** - Build tool

---

## Project Structure

```
Cappp/
├── Backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── models.py        # Data models
│   ├── ml_models/           # Trained ML artifacts
│   └── docker-compose.yml   # Full stack setup
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API clients
│   │   └── App.tsx          # Main app
│   └── package.json
```

---

## URLs

### Production
- **Web App**: https://inspire.software
- **API**: https://api.inspire.software

---


## Key Features

- **Authentication** - JWT-based with SME profiles
- **Dashboard** - Real-time analytics and monitoring
- **ompany Management** - Unified company profiles
- **Article Analysis** - Classification and sentiment analysis
- **Campaign Management** - Outreach campaign tracking
- **artner Finder** - AI-powered partner recommendations

---

## Docker Deployment

```bash
cd Backend
docker-compose up -d
```

Starts: Backend API, MySQL, Redis, Milvus, Celery worker, and Nginx reverse proxy.

---

## API Overview

- **Authentication**: `/api/auth/`
- **Database**: `/api/inspire/`
- **Scraping**: `/api/v1/scrape`
- **Classification**: `/api/v1/advanced/`
- **RAG Analysis**: `/api/v1/rag/`
- **Unified Analysis**: `/api/v1/unified/`
- **Outreach**: `/api/outreach/`
- **Partner Finder**: `/api/v1/partners/`

---

## AI Pipeline

**Data → Intelligence → Action**

1. **Scrape** company data from multiple sources
2. **Classify** articles by SME objectives (95.2% accuracy)
3. **Analyze** with RAG across 10 business categories
4. **Generate** personalized outreach campaigns

---

## License

MIT License - see LICENSE file for details.

---

**Built for MSMEs 🇷**  



