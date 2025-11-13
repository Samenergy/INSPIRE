# HTTPS Setup - Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Setup Script

```bash
cd Backend
chmod +x setup-ssl.sh
./setup-ssl.sh
```

Choose option:
- **Option 1**: Let's Encrypt (Free, Production) - Recommended
- **Option 2**: Self-Signed (Development/Testing)

### Step 2: Start Services

```bash
docker-compose up -d
```

### Step 3: Verify

```bash
# Test HTTPS
curl -k https://46.62.228.201/health

# Or in browser
https://46.62.228.201
```

## 📋 What Changed

### Files Updated:
- ✅ `nginx.conf` - Added HTTPS server block with SSL
- ✅ `docker-compose.yml` - Added SSL certificate volumes
- ✅ `Frontend/src/services/apiConfig.ts` - Auto-detects HTTPS

### New Files:
- ✅ `setup-ssl.sh` - Automated SSL setup script
- ✅ `renew-ssl.sh` - Auto-renewal script
- ✅ `SSL_SETUP_GUIDE.md` - Detailed documentation

## 🔧 Configuration

### SSL Certificate Location
```
Backend/ssl/
├── cert.pem  (Certificate)
└── key.pem   (Private Key)
```

### Ports
- **80** - HTTP (redirects to HTTPS)
- **443** - HTTPS (SSL/TLS)

### Environment Variables
Set in frontend `.env`:
```bash
VITE_API_BASE_URL=https://your-domain.com
```

## 🔄 Auto-Renewal (Let's Encrypt)

Add to crontab:
```bash
0 0 * * * cd /path/to/Backend && ./renew-ssl.sh
```

## 📚 Full Documentation

See [SSL_SETUP_GUIDE.md](./SSL_SETUP_GUIDE.md) for detailed instructions.

## ⚠️ Troubleshooting

**Certificate errors?**
```bash
# Check certificates exist
ls -la Backend/ssl/

# Check nginx logs
docker-compose logs nginx
```

**Port already in use?**
```bash
# Check what's using port 443
sudo lsof -i :443
```

## ✅ Verification Checklist

- [ ] SSL certificates in `Backend/ssl/`
- [ ] `docker-compose up -d` started successfully
- [ ] HTTPS accessible: `https://your-domain/health`
- [ ] HTTP redirects to HTTPS
- [ ] Frontend can connect to backend via HTTPS



