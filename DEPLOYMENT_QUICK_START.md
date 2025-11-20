# 🚀 Quick Deployment Guide

## ⚠️ CRITICAL: .env File Update Required!

The `.env` file is NOT in git (it's in `.gitignore`), so you **MUST update it manually on the server**.

---

## 📋 Deployment Steps

### **LOCAL MACHINE (Your Computer)**

```bash
cd /Users/samenergy/Desktop/Cappp

# 1. Stage all changes
git add .

# 2. Commit
git commit -m "feat: Migrate to Phi-3.5 Mini via llama.cpp"

# 3. Push to remote
git push origin main
```

---

### **SERVER (Hetzner - SSH into it)**

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Navigate to project
cd /path/to/your/project

# 3. Pull latest code
git pull origin main

# 4. ⚠️ CRITICAL STEP: Update .env file
cd Backend

# Option A: Use helper script (EASIER)
chmod +x update-env-on-server.sh
./update-env-on-server.sh

# Option B: Manual edit
nano .env
# Add these variables (see below)

# 5. Download Phi-3.5 Mini model (3.8GB - required!)
mkdir -p models && cd models
wget https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q8_0.gguf

# Wait for download (may take 5-10 minutes)
# Verify: ls -lh Phi-3.5-mini-instruct-Q8_0.gguf  (should show ~3.8G)

cd ..

# 6. Stop services
docker-compose down

# 7. Rebuild with new dependencies
docker-compose build --no-cache

# 8. Start services
docker-compose up -d

# 9. Verify deployment
docker-compose logs -f app
# Look for: "✅ Phi-3.5 Mini model loaded successfully"
```

---

## 🔧 Required .env Variables to ADD (on server)

Add these to your server's `Backend/.env` file:

```env
# LLM Configuration (llama.cpp with Phi-3.5 Mini)
LLM_MODEL_PATH=/app/models/Phi-3.5-mini-instruct-Q8_0.gguf
LLM_N_CTX=4096
LLM_N_THREADS=8

# RAG Hyperparameters
RAG_TEMPERATURE=0.3
RAG_TOP_K=5
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=100

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Scraping Performance
MAX_CONCURRENT_SCRAPES=5
REQUEST_TIMEOUT=30
RETRY_ATTEMPTS=3
RETRY_DELAY=1

# Data Management
MAX_ARTICLES_PER_COMPANY=50
DATA_CLEANUP_DAYS=30
```

**For Docker, also ensure these are set correctly:**
```env
DB_HOST=mysql
REDIS_URL=redis://redis:6379/0
MILVUS_HOST=milvus
```

**You can comment out or remove:**
```env
# OLLAMA_BASE_URL=http://ollama:11434  # DEPRECATED
# OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M  # DEPRECATED
```

---

## ✅ Verification

After deployment, check:

```bash
# 1. Check health endpoint
curl http://localhost:8000/api/v1/rag/health

# 2. Check RAG info (should show Phi-3.5 Mini)
curl http://localhost:8000/api/v1/rag/info

# 3. Check logs for errors
docker-compose logs app | grep -i error
docker-compose logs celery_worker | grep -i error
```

---

**Full detailed guide:** See `DEPLOYMENT_GUIDE.md`
