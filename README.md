### I.N.S.P.I.R.E. 

### Intelligent Network System for Partnerships, Insights, Research & Expansion  

**AI‑powered B2B intelligence platform for MSMEs in Rwanda**  

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents 

- **Project Overview / Vue d’ensemble du projet**
- **Key Features / Fonctionnalités clés**
- **System Architecture / Architecture du système**
- **Technology Stack / Pile technologique**
- **URLs & Environments / URLs et environnements**
- **Installation & Dependencies / Installation & dépendances**
- **How to Run the Project / Comment exécuter le projet**
- **Configuration / Configuration**
- **Usage & Main Flows / Utilisation & principaux parcours**
- **API Overview & Important URLs / Vue d’ensemble de l’API & URLs importantes**
- **Project Structure / Structure du projet**
- **Development & Testing / Développement & tests**
- **Deployment / Déploiement**

---

## Project Overview 

I.N.S.P.I.R.E. is an AI‑powered B2B intelligence platform that helps Rwandan Micro, Small & Medium Enterprises (MSMEs) discover strategic partners, analyze markets, and make data‑driven decisions through automated web scraping, ML classification, RAG analysis, and guided outreach.  

- **Data → Intelligence → Action**  
  - Scrape company news and web data, classify relevance, extract structured intelligence, then generate outreach campaigns.  

Main capabilities :

1. **Scraping** company data from Google / SerpAPI and other sources  
2. **Classifying** articles by SME objectives (≈95.2% accuracy)  
3. **RAG analysis** across 10 business‑intelligence categories  
4. **Outreach generation** (email / call / meeting scripts)  
5. **Dashboards** for monitoring companies, articles, analyses and campaigns  
6. **Partner Finder** to suggest high‑potential partners based on profiles and objectives

---

## Key Features 

### AI & ML

- **Article classification (≈95.2% accuracy)** using SentenceTransformers and scikit‑learn  
  - Directly Relevant / Indirectly Useful / Not Relevant  

- **RAG‑based company intelligence (10 categories)**  
  - Latest updates, challenges, decision makers, market position, future plans, action plan, solutions, company info, strengths, opportunities  

### Data & Knowledge Management

- Unified company profiles with multi‑source data, intelligence fields, industry and location  

- Article store with classification, relevance scoring and sentiment  

### 📧 Outreach & Partner Finder

-  Automated **campaign generation** (email / call / meeting) tailored to SME objectives  

- **Partner Finder** to recommend potential partners for a given SME or company (backend router `/api/v1/partners/...`)  

### 📈 Dashboard & Analytics

- Realtime stats on companies, articles, analyses, campaigns, industries, and statuses  

### 🔐 Security & Authentication

-  JWT‑based auth, protected API routes, SME profile & objectives  

---

## 🏗️ System Architecture / Architecture du système

**High‑level view / Vue d’ensemble :**

```text
React Frontend (Vite, Port 5173/3000)  ───────►  FastAPI Backend (Port 8000)
                                                    │
                                                    │ Celery (background)
                                                    ▼
MySQL (3306)   Redis (6379)   Milvus (19530)   Local LLM (Phi‑3.5 via llama.cpp)
```

- Frontend calls FastAPI, which orchestrates scraping, ML classification, RAG, storage and campaign generation.  

Docker Compose (`Backend/docker-compose.yml`) can start: backend app, Celery worker, MySQL, Redis, Milvus+etcd+MinIO and Nginx reverse proxy.

---

## Technology Stack 

### Backend

| **Tech** | **Role / Rôle** |
|---------|------------------|
| **Python 3.11** | Core language / Langage principal |
| **FastAPI** | API & web backend |
| **Celery** | Background tasks / Tâches asynchrones |
| **MySQL 8** | Main relational DB / Base relationnelle principale |
| **Redis 7** | Cache & task queue / Cache et file de tâches |
| **Milvus** | Vector store for RAG / Base de vecteurs pour RAG |
| **llama-cpp-python (Phi‑3.5 GGUF)** | Local LLM inference / Inférence LLM locale |
| **SentenceTransformers, scikit‑learn** | Embeddings & ML models |
| **Playwright, BeautifulSoup, SerpAPI** | Scraping & search |

### Frontend

| **Tech** | **Role / Rôle** |
|---------|------------------|
| **React 18 + TypeScript** | SPA dashboard |
| **Vite** | Dev/build tool |
| **MUI, Tailwind CSS, Framer Motion** | UI, design, animations |
| **React Router** | Client routing |
| **Chart.js + react-chartjs-2** | Analytics visualizations |

Dependencies are defined in `Backend/requirements.txt` and `Frontend/package.json`.

---

## URLs & Environments

### Local development 

- **Backend API (FastAPI)**  
  - Base: `http://localhost:8000`  
  - Docs (Swagger): `http://localhost:8000/docs`  
  - ReDoc: `http://localhost:8000/redoc`  
- **Frontend (Vite)**  
  - `http://localhost:5173` (default Vite) or `http://localhost:3000` depending on config  

### Production (as configured) 

From `nginx.conf` and CORS:

- **Frontend Web App**: `https://inspire.software` (and `https://www.inspire.software`)  
- **Backend API**: `https://api.inspire.software/doc`  
- **API under frontend domain**: `https://inspire.software/api/...`

>  When running via Docker Compose in production, Nginx exposes port **80/443** and proxies to the backend on port **8000**.  

---

## 📦 Installation & Dependencies 

### 1. Global prerequisites / Prérequis globaux

- Install:  
  - Node.js ≥ 18  
  - Python ≥ 3.10  
  - MySQL ≥ 8, Redis ≥ 7  
  - Docker & Docker Compose (optional but recommended)  
  - C compiler / build tools (for `llama-cpp-python` if needed)  


### 2. Backend dependencies / Dépendances backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

This installs FastAPI, Celery, database clients, ML/RAG libraries and `llama-cpp-python`.

### 3. Frontend dependencies 

```bash
cd Frontend
npm install
```

This installs React, MUI, Tailwind, Chart.js, Vite and tooling.

---

## How to Run the Project

### Option A – Docker Compose (recommended) 

**EN: Start everything (backend, worker, DBs, Nginx) from `Backend/`:**  
**FR : Démarrer l’ensemble (backend, worker, BDD, Nginx) depuis `Backend/` :**

```bash
cd Backend
docker-compose up -d
```

- Backend API: `http://localhost:8000` (direct) or via Nginx `http://localhost` / `https://api.inspire.software`  
- Frontend (built `dist/`): served by Nginx on `http://localhost` / `https://inspire.software`

### Option B – Manual local run 

#### 1. Start databases & services 

- **MySQL** on `localhost:3306` with DB `inspire`  
- **Redis** on `localhost:6379`  
- (Optional) **Milvus** on `localhost:19530` (or let backend start Docker Milvus automatically if Docker is running).

#### 2. Backend API (FastAPI)

```bash
cd Backend
source venv/bin/activate

# Initialize database tables
python -m app.database_init

# Run API server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 3. Celery worker

```bash
cd Backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info --concurrency=1
```

#### 4. Frontend (Vite dev server)

```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Configuration 

### Backend `.env`

Create `Backend/.env` (values can be adapted to your environment):

```env
APP_NAME=Inspire
APP_VERSION=1.0.0
DEBUG=True
LOG_LEVEL=INFO

DB_NAME=inspire
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
MYSQL_URL=mysql+pymysql://root:your_password@localhost:3306/inspire

REDIS_URL=redis://localhost:6379/0

SERPAPI_API_KEY=your_serpapi_key
APIFY_API_KEY=your_apify_key
APIFY_API_TOKEN=your_apify_token
LINKEDIN_COOKIE=your_linkedin_cookie

MILVUS_HOST=localhost
MILVUS_PORT=19530

LLM_MODEL_PATH=models/Phi-3.5-mini-instruct-Q8_0.gguf
LLM_N_CTX=4096
LLM_N_THREADS=8

RAG_TEMPERATURE=0.3
RAG_TOP_K=5
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=100

RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
MAX_CONCURRENT_SCRAPES=5
```

> **EN:** By default, `app.config.Settings` will auto‑detect `.env` in `Backend/`.  

### Frontend API base URL 

In `Frontend/src/services/*Service.ts` (e.g. `authService.ts`, `companyService.ts`, `partnerFinderService.ts`), set:

```ts
const API_BASE_URL = 'http://localhost:8000/api';
```

For production behind Nginx:

```ts
const API_BASE_URL = 'https://api.inspire.software';
// or if proxied via frontend domain:
// const API_BASE_URL = 'https://inspire.software/api';
```

---

## 📖 Usage & Main Flows 

### 1. Auth & SME profile 

- **EN:** Sign up, log in, and complete SME profile (sector, objectives).  
- **FR :** Inscription, connexion et complétion du profil MPME (secteur, objectifs).

### 2. Add & analyze a company 

- Go to **Companies / Entreprises**  
- Add company name + location  
- Launch **Unified Analysis**:
  - Scraping → Classification → RAG → Storage

### 3. View intelligence 

- Company page shows:
  - Articles, relevance, sentiment  
  - 10 RAG categories (updates, challenges, strengths, opportunities, etc.)  

### 4. Generate outreach 

- On a company, click **Generate Campaign**  
- Choose type (Email / Call / Meeting)  
- Review & save or mark as sent.

### 5. Partner Finder 

- Use **Partner Finder** (frontend modal and backend `/api/v1/partners/...`)  
- Suggests high‑potential partners for an SME based on profile, sector and objectives.

---

## API Overview & Important URLs 

### Base URLs

- **Local:** `http://localhost:8000`  
- **Production:** `https://api.inspire.software`

### Interactive docs 

- Swagger UI: `http://localhost:8000/docs`  
- ReDoc: `http://localhost:8000/redoc`

### Core endpoint groups (non‑exhaustive) 

- **Auth / Authentification**  
  - `POST /api/auth/signup`  
  - `POST /api/auth/login`  
  - `GET  /api/auth/me`  
  - `POST /api/auth/verify-token`

- **INSPIRE Database (SMEs, companies, dashboard)**  
  - `GET /api/inspire/smes`  
  - `GET /api/inspire/companies`  
  - `GET /api/inspire/dashboard/stats`

- **Unified Analysis / Analyse unifiée**  
  - `POST /api/v1/unified/unified-analysis`  

- **Outreach / Campagnes**  
  - `POST /api/outreach/generate`  
  - `GET  /api/outreach/campaigns`

- **Partner Finder**  
  - `GET /api/v1/partners/...`

All protected endpoints require:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Project Structure 

```text
Cappp/
  Backend/
    app/
      main.py              # FastAPI entrypoint
      config.py            # Settings & env handling
      routers/             # API route modules
      services/            # Business logic (RAG, outreach, partner finder, etc.)
      scrapers/            # SerpAPI / Apify / web scraping
      tasks/               # Celery tasks (unified analysis)
      utils/               # Utilities
    ml_models/             # Trained ML and RAG artifacts
    exports/               # CSV exports & evaluation artefacts
    logs/                  # Application logs
    docker-compose.yml     # Full stack (backend + services + nginx)
    nginx.conf             # Reverse proxy & SSL config

  Frontend/
    src/
      components/          # Dashboard, accounts, campaigns, partner finder, etc.
      context/             # Auth & theme context
      services/            # HTTP clients for backend API
      App.tsx, main.tsx    # React entry
    public/                # Static assets
    vite.config.ts         # Vite config
    package.json           # Frontend dependencies

  ERD.png, System Architecture.png, Sequence Diagram.png, Usecase.png
  README.md                # This file
```

---

## Development & Testing 

### Backend

```bash
cd Backend
source venv/bin/activate

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests
pytest
```

### Frontend

```bash
cd Frontend
npm run dev        # dev server
npm run lint       # linting
npm run build:check
```

---

## Deployment 

- **EN:** For production, use `docker-compose up -d` from `Backend/` and configure DNS + SSL certificates for `inspire.software` and `api.inspire.software` (Nginx already expects Let’s Encrypt paths). Scale Celery workers as needed and secure environment variables.  

---

**EN:** This README gives you a complete overview of what the project does, its features, main URLs, how to install dependencies and how to run it locally or in Docker.  



