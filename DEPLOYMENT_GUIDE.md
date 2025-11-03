# INSPIRE Deployment Guide

## Resource Requirements Summary

**Minimum Production Setup:**
- **RAM**: 16-32GB (recommended: 32GB)
- **CPU**: 8-16 vCPU (recommended: 16+)
- **Storage**: 50GB+ (for models, database, logs)
- **Network**: Stable connection for LLM API calls

## Component Resource Breakdown

| Component | RAM Usage | Notes |
|-----------|-----------|-------|
| Ollama + LLM Model | 4-8GB | llama3.1:latest is ~4.5GB |
| Backend (FastAPI + ML) | 2-4GB | Sentence transformers, classification models |
| Milvus Vector DB | 2-4GB | Can use in-memory fallback (not persistent) |
| MySQL Database | 1-2GB | Scales with data |
| Redis | 256MB-1GB | Caching and queues |
| Frontend | Static | Can deploy to CDN (free) |
| **Total Minimum** | **~10-18GB** | **Recommended: 32GB** |

## Deployment Options

### Option 1: Pro Plan ($20/month) ⭐ RECOMMENDED

**Platform**: Railway, Render, Fly.io (any with 32GB RAM)

**Setup:**
1. Single service runs all components:
   - Backend FastAPI
   - MySQL database
   - Redis
   - Milvus (via Docker)
   - Ollama (via Docker or installed)
   - Frontend (static files served by Nginx)

**Advantages:**
- Simple single-deployment setup
- All services in one environment
- Easier networking between services
- Single point of management

**Configuration:**
```yaml
# All services in one docker-compose.yml
services:
  app:        # FastAPI backend
  mysql:      # Database
  redis:      # Cache
  milvus:     # Vector database
  ollama:     # LLM service
  nginx:      # Frontend + reverse proxy
```

---

### Option 2: Hybrid Approach ($15-25/month)

**Split across multiple services:**

**Service 1: Backend ($5-10/month)**
- FastAPI backend
- MySQL database
- Redis cache

**Service 2: AI/ML Services ($10-15/month)**
- Ollama with LLM models
- Milvus (or use in-memory fallback)

**Service 3: Frontend (FREE)**
- Deploy to Vercel/Netlify/CDN
- Static React build

**Advantages:**
- Can scale components independently
- Better resource isolation
- Frontend free on CDN

**Disadvantages:**
- More complex networking
- Higher latency between services
- More management overhead

---

### Option 3: Cost-Optimized ($10-15/month)

**Replace resource-heavy components:**

**Replace Ollama with External LLM API:**
- Use OpenAI API, Anthropic Claude, or similar
- No need to run Ollama locally
- Pay-per-use pricing

**Use Milvus In-Memory Fallback:**
- No persistent Milvus instance needed
- Sacrifice persistence for lower cost

**Backend Service ($5-10/month):**
- FastAPI backend
- MySQL database
- Redis cache
- ML models (sentence-transformers)

**Frontend (FREE):**
- Deploy to Vercel/Netlify

**Advantages:**
- Lower monthly cost
- Scalable LLM usage
- Simple deployment

**Disadvantages:**
- LLM API costs can add up
- No offline LLM capability
- Milvus not persistent

---

## Recommended Platforms

### 1. Railway (Recommended for simplicity)
- **Pro Plan**: $20/month
- **RAM**: 32GB
- **Features**: Easy Docker deployments, built-in databases
- **Best for**: Option 1 (all-in-one)

### 2. Render
- **Standard Plan**: $25/month
- **RAM**: Up to 32GB
- **Features**: Auto-deploy from Git, managed databases
- **Best for**: Option 1 or 2

### 3. Fly.io
- **Pro**: Pay-as-you-go, ~$20-30/month
- **RAM**: Up to 64GB
- **Features**: Global deployment, edge computing
- **Best for**: Option 2 (multi-region)

### 4. DigitalOcean App Platform
- **Pro**: $25/month
- **RAM**: Configurable
- **Features**: Managed databases, easy scaling
- **Best for**: Option 1

---

## Step-by-Step Deployment (Pro Plan)

### Prerequisites
- Git repository pushed to GitHub
- Account on deployment platform (Railway/Render/Fly.io)

### 1. Prepare Environment Variables

Create `.env` file:
```bash
# Database
MYSQL_URL=mysql+pymysql://user:pass@mysql:3306/dbname
REDIS_URL=redis://redis:6379/0

# Milvus
MILVUS_HOST=milvus
MILVUS_PORT=19530

# Ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:latest

# Secrets
SERPAPI_API_KEY=your_key_here
JWT_SECRET_KEY=your_secret_here

# Frontend
VITE_API_URL=https://your-backend-url.com
```

### 2. Update Docker Compose

Add Ollama and Milvus to `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: ./Backend
    ports:
      - "8000:8000"
    depends_on:
      - mysql
      - redis
      - milvus
      - ollama
    environment:
      - MYSQL_URL=mysql+pymysql://user:pass@mysql:3306/dbname
      - REDIS_URL=redis://redis:6379/0
      - MILVUS_HOST=milvus
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=company_data
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  milvus:
    image: milvusdb/milvus:latest
    ports:
      - "19530:19530"
    volumes:
      - milvus_data:/var/lib/milvus
    environment:
      - ETCD_ENDPOINTS=etcd:2379
      - MINIO_ADDRESS=minio:9000
    depends_on:
      - etcd
      - minio

  etcd:
    image: quay.io/coreos/etcd:v3.5.5
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
    volumes:
      - etcd_data:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd

  minio:
    image: minio/minio:latest
    environment:
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    volumes:
      - minio_data:/data
    command: minio server /data --console-address ":9001"

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # Pull model on first start
    command: ollama serve

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./Frontend/build:/usr/share/nginx/html
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  milvus_data:
  etcd_data:
  minio_data:
  ollama_data:
```

### 3. Build and Deploy

**Railway:**
1. Connect GitHub repository
2. Create new project
3. Add all services from docker-compose.yml
4. Set environment variables
5. Deploy

**Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Use Docker Compose option
4. Set environment variables
5. Deploy

### 4. Initialize Ollama Model

After deployment, pull the LLM model:
```bash
# SSH into container or use exec
docker exec -it <ollama-container> ollama pull llama3.1:latest
```

Or add to startup script:
```bash
#!/bin/bash
ollama serve &
sleep 5
ollama pull llama3.1:latest
```

---

## Alternative: External LLM API (Cost-Optimized)

If you want to reduce costs, replace Ollama with an external API:

### Update Backend Code

In `Backend/app/services/rag_analysis_service.py` or create new service:

```python
# Replace Ollama calls with OpenAI/Anthropic
import openai  # or anthropic

# Instead of:
# response = requests.post(f"{ollama_url}/api/generate", ...)

# Use:
response = openai.ChatCompletion.create(
    model="gpt-4o-mini",  # cheaper option
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    temperature=0.3
)
```

**Benefits:**
- No need for Ollama service (~4GB RAM saved)
- Pay-per-use (often cheaper for low usage)
- Always up-to-date models
- Better reliability

**Cost Estimate:**
- OpenAI GPT-4o-mini: ~$0.15 per 1M tokens
- Typical analysis: 50-200k tokens = $0.01-0.03 per company
- 100 companies/month = $1-3 in LLM costs

---

## Monitoring & Scaling

### Resource Monitoring

Set up alerts for:
- RAM usage > 80%
- CPU usage > 70%
- Disk space < 20%
- API response time > 5s

### Scaling Recommendations

**Start Small:**
- 16GB RAM, 8 vCPU
- Monitor actual usage
- Scale up if needed

**Scale Up When:**
- RAM consistently > 75%
- CPU consistently > 60%
- Response times slowing down
- Multiple concurrent analyses

**Scale Down:**
- Low traffic periods
- Use external LLM API (no Ollama needed)
- Use Milvus in-memory fallback

---

## Estimated Monthly Costs

| Option | Platform Cost | LLM API (if external) | Total |
|-------|--------------|----------------------|-------|
| Pro Plan (All-in-one) | $20 | $0 (Ollama included) | **$20** |
| Hybrid | $15-25 | $0 (Ollama included) | **$15-25** |
| Cost-Optimized | $10 | $1-5 (API calls) | **$11-15** |

**Note:** LLM API costs depend on usage volume.

---

## Final Recommendation

**For Production:**
- ✅ Use **Pro Plan ($20/month)** on Railway or Render
- ✅ All services in one environment
- ✅ 32GB RAM is comfortable for full stack
- ✅ Easy to manage and scale

**For Development/Testing:**
- ✅ Start with **Cost-Optimized ($10-15/month)**
- ✅ Use external LLM API
- ✅ Scale up to Pro Plan when needed

**Bottom Line:**
The $5 plan (8GB RAM) is **insufficient** for this stack. You need at least **$10-15/month** minimum, with **$20/month** recommended for production.


