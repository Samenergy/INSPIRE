# INSPIRE Student Deployment Guide

## 🎓 Best Option for Students: Hybrid + Student Credits

### Recommended Approach: Option 3 (Cost-Optimized) + Student Credits

**Total Cost: $0-5/month** (using student credits)

---

## Step-by-Step Student Deployment

### Part 1: Frontend (FREE) ✅

**Deploy to Netlify or Vercel** (both available in GitHub Student Pack)

1. **Build your React app:**
```bash
cd Frontend
npm run build
```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `Frontend/build`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`
   - Deploy!

3. **OR Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Set root directory: `Frontend`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com`
   - Deploy!

---

### Part 2: Backend (Use Student Credits)

#### Option A: DigitalOcean (Recommended for Students) ⭐

**GitHub Student Pack includes $200 credit** (lasts ~4-6 months)

1. **Create Droplet:**
   - Go to [DigitalOcean](https://m.do.co/c/your-referral) (get credit from GitHub Student Pack)
   - Create Droplet: **16GB RAM, 4 vCPU** (~$96/month, but FREE with student credit)
   - Choose Ubuntu 22.04
   - Add SSH key

2. **Install Docker:**
```bash
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin
```

3. **Clone and Deploy:**
```bash
git clone https://github.com/yourusername/Cappp.git
cd Cappp/Backend

# Create .env file
nano .env
```

Add to `.env`:
```bash
MYSQL_URL=mysql+pymysql://root:your_password@mysql:3306/inspire
REDIS_URL=redis://redis:6379/0
MILVUS_HOST=milvus
MILVUS_PORT=19530
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:latest
SERPAPI_API_KEY=your_serpapi_key
JWT_SECRET_KEY=your_jwt_secret_key
```

4. **Update docker-compose.yml** (use optimized version below)

5. **Deploy:**
```bash
docker compose up -d
```

---

#### Option B: AWS Free Tier + Student Credits

**GitHub Student Pack includes AWS credits**

1. **Use AWS EC2:**
   - Go to [AWS Educate](https://aws.amazon.com/education/awseducate/) or use student credits
   - Launch EC2 instance: **t3.xlarge** (16GB RAM, 4 vCPU)
   - Choose Ubuntu 22.04
   - Follow same Docker setup as DigitalOcean

---

#### Option C: Azure for Students (FREE credits)

**GitHub Student Pack includes Azure credits**

1. **Create VM:**
   - Go to [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
   - Create VM: **Standard_B4ms** (16GB RAM, 4 vCPU)
   - Choose Ubuntu 22.04
   - Follow same Docker setup

---

### Part 3: Optimize for Student Budget

**Use External LLM API instead of Ollama** (Saves 4-8GB RAM)

Instead of running Ollama, use OpenAI or Anthropic API:

1. **Sign up for OpenAI API** (GitHub Student Pack may include credits)
   - Or use Anthropic (Claude API)
   - Or use HuggingFace Inference API (free tier)

2. **Update Backend Code:**

Replace Ollama calls in `Backend/app/services/rag_analysis_service.py`:

```python
# Instead of Ollama
import openai

# In _generate_llm_response method:
response = openai.ChatCompletion.create(
    model="gpt-4o-mini",  # Cheaper option
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    temperature=0.3,
    max_tokens=1000
)
```

3. **Benefits:**
   - Save 4-8GB RAM (no Ollama container needed)
   - Can use cheaper VM (8GB RAM instead of 16GB)
   - Pay-per-use pricing
   - Better reliability

---

## Optimized docker-compose.yml for Students

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - mysql
      - redis
    environment:
      - MYSQL_URL=mysql+pymysql://root:password@mysql:3306/inspire
      - REDIS_URL=redis://redis:6379/0
      - MILVUS_HOST=localhost
      - MILVUS_PORT=19530
      # Remove Ollama, use external API
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=inspire
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Optional: Milvus (use in-memory if needed to save resources)
  # milvus:
  #   image: milvusdb/milvus:latest
  #   ports:
  #     - "19530:19530"
  #   volumes:
  #     - milvus_data:/var/lib/milvus
  #   depends_on:
  #     - etcd
  #     - minio

volumes:
  mysql_data:
  redis_data:
```

**Note:** The RAG service has an in-memory fallback for Milvus, so you can skip Milvus if RAM is tight!

---

## Complete Student Setup Checklist

### ✅ Phase 1: Frontend (5 minutes)
- [ ] Build React app: `cd Frontend && npm run build`
- [ ] Deploy to Netlify/Vercel (connect GitHub repo)
- [ ] Set `VITE_API_URL` environment variable

### ✅ Phase 2: Backend (30 minutes)
- [ ] Get student credits (DigitalOcean/AWS/Azure)
- [ ] Create VM/Droplet (16GB RAM if using Ollama, 8GB if using external LLM)
- [ ] Install Docker & Docker Compose
- [ ] Clone repository
- [ ] Create `.env` file with all variables
- [ ] Update docker-compose.yml
- [ ] Deploy: `docker compose up -d`

### ✅ Phase 3: Configure (10 minutes)
- [ ] Set up OpenAI/Anthropic API key
- [ ] Update backend to use external LLM (optional, saves RAM)
- [ ] Test API endpoints
- [ ] Update frontend API URL
- [ ] Test full application

---

## Cost Breakdown for Students

| Component | Without Student Credits | With Student Credits |
|-----------|-------------------------|---------------------|
| **Frontend** (Netlify/Vercel) | FREE | FREE |
| **Backend VM** (16GB RAM) | $96/month | **FREE** (student credits) |
| **Backend VM** (8GB RAM, optimized) | $48/month | **FREE** (student credits) |
| **MySQL** | Included | Included |
| **Redis** | Included | Included |
| **Ollama** | Included | Included |
| **External LLM API** | $1-5/month | $1-5/month |
| **Total** | **$96-101/month** | **$1-5/month** |

**Student credits typically last 4-6 months!**

---

## Recommendations by Student Pack Offer

### 🥇 Best: DigitalOcean + Netlify
- **DigitalOcean**: $200 credit (GitHub Student Pack)
- **Netlify**: Free tier (GitHub Student Pack)
- **Total**: FREE for 4-6 months

### 🥈 Good: AWS + Vercel
- **AWS**: Credits (GitHub Student Pack)
- **Vercel**: Free tier
- **Total**: FREE for limited time

### 🥉 Budget: Azure + Netlify
- **Azure**: Student credits
- **Netlify**: Free tier
- **Total**: FREE for limited time

---

## Quick Start Commands

### 1. On your local machine:
```bash
# Build frontend
cd Frontend
npm run build

# Push to GitHub (if not already done)
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. On your server (DigitalOcean/AWS/Azure):
```bash
# SSH into server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Clone repo
git clone https://github.com/yourusername/Cappp.git
cd Cappp/Backend

# Create .env
nano .env  # Add all environment variables

# Deploy
docker compose up -d

# Check logs
docker compose logs -f app
```

---

## Troubleshooting

### Out of Memory?
- Use external LLM API instead of Ollama (saves 4-8GB)
- Use Milvus in-memory fallback (saves 2-4GB)
- Downgrade to 8GB RAM VM

### Database Connection Issues?
- Check MySQL container: `docker compose ps`
- Check logs: `docker compose logs mysql`
- Verify `.env` MYSQL_URL format

### Frontend Can't Connect to Backend?
- Check CORS settings in `Backend/app/main.py`
- Verify `VITE_API_URL` in Netlify/Vercel environment variables
- Test backend URL: `curl https://your-backend-url.com/health`

---

## Next Steps

1. **Choose your platform** (DigitalOcean recommended)
2. **Deploy frontend** to Netlify (5 minutes)
3. **Deploy backend** to VM (30 minutes)
4. **Test and iterate!**

**Questions?** Check the main `DEPLOYMENT_GUIDE.md` for more details.

