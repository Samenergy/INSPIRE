# Deployment Guide - Phi-3.5 Mini Migration

## 📋 Summary of Changes Today

### Backend Changes:
1. ✅ Migrated from Ollama (Llama 3.1 8B) to llama.cpp (Phi-3.5 Mini 3.8B Q8_0)
2. ✅ Created new `LLMService` for direct inference
3. ✅ Updated RAG analysis service to use Phi-3.5 Mini
4. ✅ Updated outreach service with improved prompts (no "SME" references, collaboration focus)
5. ✅ Optimized RAG performance (reduced max_tokens, improved parameters)
6. ✅ Fixed Celery worker pool to use `threads` instead of `fork` (SIGSEGV fix)
7. ✅ Updated `docker-compose.yml` to remove Ollama, add model volume
8. ✅ Updated `requirements.txt` with `llama-cpp-python`
9. ✅ Updated Vite config for frontend timeout issues

### Frontend Changes:
1. ✅ Fixed Vite timeout configuration
2. ✅ Updated `@vitejs/plugin-react-swc` to v4.0.0 for Vite 7 compatibility

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Prepare Git Commit (Local Machine)**

```bash
# 1. Navigate to project root
cd /Users/samenergy/Desktop/Cappp

# 2. Add .gitignore entry for model file (too large for git - 3.8GB)
echo "Backend/models/*.gguf" >> .gitignore

# 3. Stage all changes (except model file)
git add Backend/app/
git add Backend/docker-compose.yml
git add Backend/requirements.txt
git add Backend/nginx.conf
git add Frontend/
git add .gitignore
git add README.md

# 4. Remove deleted scripts (cleanup)
git add -u Backend/*.sh

# 5. Check what will be committed
git status

# 6. Commit changes
git commit -m "feat: Migrate from Ollama to llama.cpp with Phi-3.5 Mini

- Replace Ollama HTTP calls with direct llama.cpp inference
- Add LLMService for thread-safe model management
- Update RAG analysis to use Phi-3.5 Mini 3.8B Q8_0
- Optimize RAG performance (max_tokens: 1000->800, improved parameters)
- Update outreach prompts: collaboration-focused, remove SME references
- Fix Celery worker pool: use threads instead of fork (SIGSEGV fix)
- Remove Ollama from docker-compose.yml
- Update requirements.txt with llama-cpp-python
- Fix frontend Vite timeout and dependency issues
- Clean up obsolete scripts"

# 7. Push to remote repository
git push origin main
```

---

### **STEP 2: On Your Hetzner Server (SSH into server)**

```bash
# 1. SSH into your Hetzner server
ssh user@your-hetzner-server-ip

# 2. Navigate to your project directory
cd /path/to/your/project

# 3. Pull latest changes
git pull origin main

# 4. Navigate to Backend directory
cd Backend
```

---

### **STEP 3: Download Phi-3.5 Mini Model (On Server)**

```bash
# Create models directory if it doesn't exist
mkdir -p models

# Download Phi-3.5 Mini Q8_0 GGUF model (3.8GB)
# Option 1: Using wget (from HuggingFace)
cd models
wget https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q8_0.gguf

# Option 2: Using curl (alternative)
# curl -L -o Phi-3.5-mini-instruct-Q8_0.gguf https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q8_0.gguf

# Verify download
ls -lh Phi-3.5-mini-instruct-Q8_0.gguf
# Should show ~3.8GB file

cd ..
```

---

### **STEP 4: Update Backend Dependencies (On Server)**

```bash
# If using Docker (recommended):
# Just rebuild the image - it will install llama-cpp-python from requirements.txt

# If running locally (without Docker):
cd Backend
source venv/bin/activate  # Activate your virtual environment
pip install -r requirements.txt

# Specifically install llama-cpp-python with CPU optimizations:
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
```

---

### **STEP 5: Update .env File (On Server)**

```bash
# Edit .env file on server
nano Backend/.env

# Make sure these variables are set (update if needed):
# LLM_MODEL_PATH=models/Phi-3.5-mini-instruct-Q8_0.gguf
# LLM_N_CTX=4096
# LLM_N_THREADS=8

# Also ensure Docker environment matches (if using Docker):
# DB_HOST=mysql (not localhost for Docker)
# REDIS_URL=redis://redis:6379/0
# MILVUS_HOST=milvus
```

---

### **STEP 6: Stop Old Services (On Server)**

```bash
# If using Docker Compose:
cd Backend
docker-compose down

# If running services manually:
# Stop Celery worker
pkill -f "celery.*worker"

# Stop FastAPI app
pkill -f "uvicorn.*main:app"
```

---

### **STEP 7: Rebuild and Start Services (On Server)**

```bash
# If using Docker Compose (recommended):
cd Backend

# Rebuild images with new dependencies
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Check logs to ensure everything starts correctly
docker-compose logs -f app
docker-compose logs -f celery_worker

# Verify LLM model loads correctly
docker-compose exec app python -c "from app.services.llm_service import get_llm_service; service = get_llm_service(); print('Model loaded:', service.is_available())"

# If running locally (without Docker):
# Start FastAPI
cd Backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Start Celery worker (with threads pool)
celery -A app.celery_app worker --pool=threads --loglevel=info --concurrency=4 -n unified_worker@%h &
```

---

### **STEP 8: Verify Deployment (On Server)**

```bash
# 1. Check FastAPI health
curl http://localhost:8000/api/v1/rag/health

# 2. Check RAG info (should show Phi-3.5 Mini)
curl http://localhost:8000/api/v1/rag/info

# 3. Test a simple analysis to ensure model works
# (Use your frontend or Postman to trigger an analysis)

# 4. Monitor logs for any errors
tail -f Backend/logs/app.log
```

---

### **STEP 9: Update Frontend (On Server)**

```bash
# Navigate to Frontend directory
cd Frontend

# Install/update dependencies
npm install

# Build for production
npm run build

# If using Nginx, the build folder is already served
# If needed, restart Nginx
sudo systemctl restart nginx
```

---

## 🔍 Troubleshooting

### Issue: Model file not found
```bash
# On server, verify model path
cd Backend
ls -lh models/Phi-3.5-mini-instruct-Q8_0.gguf

# If missing, download again (see STEP 3)
```

### Issue: llama-cpp-python import error
```bash
# Reinstall with CPU optimizations
pip uninstall llama-cpp-python
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu
```

### Issue: Celery SIGSEGV error
```bash
# Ensure using threads pool (check docker-compose.yml or command):
# Should have: --pool=threads
# NOT: --pool=prefork or --pool=solo
```

### Issue: Event loop closed error
```bash
# This should be fixed, but if it occurs, verify unified_analysis_task.py
# has: asyncio.set_event_loop(asyncio.new_event_loop()) at task start
```

---

## 📝 Quick Reference Commands

### Local Machine (Push Changes):
```bash
git add .
git commit -m "feat: Migrate to Phi-3.5 Mini via llama.cpp"
git push origin main
```

### Server (Deploy Changes):
```bash
git pull origin main
cd Backend
# Download model (3.8GB)
mkdir -p models && cd models
wget https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q8_0.gguf
cd ..
# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
# Verify
docker-compose logs -f app
```

---

## ✅ Pre-Deployment Checklist

- [ ] All changes committed locally
- [ ] `.gitignore` includes model files (`*.gguf`)
- [ ] Pushed to `origin/main`
- [ ] Server has SSH access
- [ ] Server has enough disk space (~4GB for model)
- [ ] Server has 32GB RAM (as specified)
- [ ] Docker installed on server (if using Docker)
- [ ] Model download URL is accessible from server

---

## 🎯 Post-Deployment Verification

1. ✅ Check `/api/v1/rag/health` returns "Phi-3.5 Mini via llama.cpp"
2. ✅ Run a test analysis and verify it completes
3. ✅ Check response time (should be ~150s for RAG analysis)
4. ✅ Verify outreach generation works without "SME" references
5. ✅ Check logs for any errors or warnings

---

**Note:** The model file (3.8GB) should NOT be committed to git. It will be downloaded directly on the server.

