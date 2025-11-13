# 🚀 Production Next Steps - INSPIRE Backend

## ✅ Completed
- [x] SSL certificates obtained from Let's Encrypt
- [x] HTTPS configured in nginx
- [x] HTTP to HTTPS redirect enabled
- [x] Domain added to allowed hosts
- [x] Backend accessible at `https://api.inspire.software`

---

## 📋 Immediate Next Steps

### 1. Set Up Automatic Certificate Renewal ⚠️ IMPORTANT

Your SSL certificate expires on **2026-02-11**. Set up automatic renewal:

```bash
cd ~/INSPIRE/Backend

# Create a renewal script
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
cd ~/INSPIRE/Backend

# Renew certificates
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot_www:/var/www/certbot \
  certbot/certbot renew --webroot \
  --webroot-path=/var/www/certbot

# Reload nginx to pick up new certificates
docker compose restart nginx
EOF

chmod +x renew-ssl.sh

# Test the renewal script
./renew-ssl.sh

# Add to crontab (runs twice daily, Let's Encrypt recommends checking frequently)
(crontab -l 2>/dev/null; echo "0 0,12 * * * /root/INSPIRE/Backend/renew-ssl.sh >> /var/log/certbot-renewal.log 2>&1") | crontab -

# Verify crontab
crontab -l
```

### 2. Test All API Endpoints

```bash
# Test root endpoint
curl -k https://api.inspire.software/

# Test health endpoint (in browser)
# https://api.inspire.software/health

# Test API docs
# https://api.inspire.software/docs

# Test other endpoints
curl -k https://api.inspire.software/api/inspire/health
curl -k https://api.inspire.software/api/auth/health
```

### 3. Update Frontend Configuration

Update your frontend to use HTTPS:

**File: `Frontend/.env.production` or `Frontend/src/config.ts`**

```typescript
// Change from:
const API_BASE_URL = 'http://api.inspire.software'

// To:
const API_BASE_URL = 'https://api.inspire.software'
```

**Or use environment variable:**
```bash
# In Frontend/.env.production
VITE_API_BASE_URL=https://api.inspire.software
```

### 4. Remove Version Warning from docker-compose.yml

```bash
cd ~/INSPIRE/Backend

# Edit docker-compose.yml and remove the first line:
# version: '3.8'
```

### 5. Set Up Monitoring (Optional but Recommended)

**Option A: Simple Health Check Script**
```bash
cat > health-check.sh << 'EOF'
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.inspire.software/health)
if [ "$STATUS" != "200" ]; then
    echo "ALERT: API returned status $STATUS"
    # Add notification here (email, Slack, etc.)
fi
EOF

chmod +x health-check.sh

# Add to crontab (check every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/INSPIRE/Backend/health-check.sh") | crontab -
```

**Option B: Use Uptime Monitoring Service**
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

### 6. Security Hardening (Recommended)

**A. Firewall Configuration**
```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (for Let's Encrypt)
ufw allow 443/tcp   # HTTPS
ufw enable
```

**B. Update nginx Security Headers** (Already done ✅)
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

**C. Regular Updates**
```bash
# Update system packages regularly
apt update && apt upgrade -y

# Rebuild Docker images when dependencies change
cd ~/INSPIRE/Backend
git pull
docker compose build
docker compose up -d
```

### 7. Backup Strategy

**A. Database Backups**
```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec -T mysql mysqldump -u app_user -papp_password inspire > $BACKUP_DIR/inspire_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "inspire_*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/INSPIRE/Backend/backup-db.sh") | crontab -
```

**B. SSL Certificates Backup**
```bash
# Backup SSL certificates (they're already in ~/INSPIRE/Backend/ssl)
# Consider copying to a secure location
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ssl/
```

### 8. Documentation

**Update your deployment documentation:**
- Document the SSL certificate renewal process
- Document backup procedures
- Document how to update the application
- Document monitoring setup

### 9. Performance Optimization (Optional)

**A. Enable Gzip Compression in nginx**
Already configured in nginx.conf ✅

**B. Set Up Redis Caching** (Already configured ✅)

**C. Monitor Resource Usage**
```bash
# Check container resource usage
docker stats

# Check disk usage
df -h
docker system df
```

### 10. Frontend Deployment

If you haven't deployed the frontend yet:

1. Build the frontend:
```bash
cd ~/INSPIRE/Frontend
npm run build
```

2. Update nginx to serve frontend:
```bash
# The frontend is already configured in docker-compose.yml
# Volume: ../Frontend/dist:/usr/share/nginx/html:ro
```

3. Add frontend server block to nginx.conf if needed

---

## 🔍 Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] HTTPS accessible: `https://api.inspire.software`
- [ ] HTTP redirects to HTTPS: `http://api.inspire.software` → redirects
- [ ] API docs accessible: `https://api.inspire.software/docs`
- [ ] Health endpoint works: `https://api.inspire.software/health`
- [ ] SSL certificate valid (check browser padlock)
- [ ] Certificate renewal script created and tested
- [ ] Crontab configured for automatic renewal
- [ ] Frontend updated to use HTTPS
- [ ] Database backups configured
- [ ] Monitoring set up (optional)

---

## 📞 Support & Maintenance

### Common Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f nginx

# Restart services
docker compose restart app
docker compose restart nginx

# Rebuild and restart
docker compose build app
docker compose up -d app

# Check certificate expiration
docker run --rm -v $(pwd)/ssl:/etc/letsencrypt certbot/certbot certificates

# Renew certificates manually
./renew-ssl.sh
```

### Troubleshooting

**Issue: Certificate renewal fails**
- Check nginx is running
- Check port 80 is accessible
- Check DNS is still pointing correctly
- Check certbot logs: `docker run --rm -v $(pwd)/ssl:/etc/letsencrypt certbot/certbot certificates`

**Issue: API not accessible**
- Check nginx: `docker compose logs nginx`
- Check app: `docker compose logs app`
- Check firewall: `ufw status`
- Test locally: `curl http://localhost:8000/health`

---

## 🎉 You're All Set!

Your INSPIRE backend is now:
- ✅ Secured with HTTPS
- ✅ Accessible at `https://api.inspire.software`
- ✅ Ready for production use

Next: Deploy your frontend and start using your platform!

