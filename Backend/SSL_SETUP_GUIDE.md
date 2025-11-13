# SSL/HTTPS Setup Guide for INSPIRE Backend

This guide will help you set up HTTPS for your INSPIRE backend using SSL certificates.

## Prerequisites

- Docker and Docker Compose installed
- Domain name pointing to your server (for Let's Encrypt)
- Ports 80 and 443 open in firewall
- Root/sudo access on the server

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd Backend
chmod +x setup-ssl.sh
./setup-ssl.sh
```

The script will guide you through:
1. Let's Encrypt (free, automated)
2. Self-signed (development/testing)
3. Existing certificates

### Option 2: Manual Setup

#### Step 1: Create SSL Directory

```bash
mkdir -p Backend/ssl
```

#### Step 2: Obtain SSL Certificates

**Option A: Let's Encrypt (Production)**

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem Backend/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem Backend/ssl/key.pem
sudo chown $USER:$USER Backend/ssl/*.pem
```

**Option B: Self-Signed (Development)**

```bash
cd Backend/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout key.pem \
    -out cert.pem \
    -subj "/C=US/ST=State/L=City/O=INSPIRE/CN=46.62.228.201"
```

**Option C: Commercial Certificate**

Place your certificate files in `Backend/ssl/`:
- `cert.pem` - Certificate file
- `key.pem` - Private key file

#### Step 3: Set Permissions

```bash
chmod 600 Backend/ssl/key.pem
chmod 644 Backend/ssl/cert.pem
```

#### Step 4: Start Services

```bash
cd Backend
docker-compose up -d
```

## Configuration Files

### nginx.conf

The nginx configuration has been updated to:
- Listen on port 443 (HTTPS)
- Redirect HTTP (port 80) to HTTPS
- Use SSL certificates from `/etc/nginx/ssl/`
- Include security headers (HSTS, X-Frame-Options, etc.)

### docker-compose.yml

Updated to:
- Mount SSL certificates: `./ssl:/etc/nginx/ssl:ro`
- Mount Let's Encrypt volumes for auto-renewal
- Expose ports 80 and 443

## Testing

### Test HTTPS Connection

```bash
# Test with curl (ignore self-signed warning)
curl -k https://46.62.228.201:8000/health

# Test with proper certificate validation
curl https://your-domain.com/health
```

### Test in Browser

1. Navigate to `https://your-domain.com`
2. Check for padlock icon in address bar
3. Verify no mixed content warnings

## Auto-Renewal (Let's Encrypt)

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

### Add to Crontab

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at midnight)
0 0 * * * cd /path/to/Backend && ./renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

Or use the provided script:

```bash
chmod +x Backend/renew-ssl.sh
# Add to crontab
0 0 * * * /path/to/Backend/renew-ssl.sh
```

## Troubleshooting

### Certificate Not Found

**Error:** `SSL_CTX_use_certificate_file failed`

**Solution:**
1. Verify certificates exist: `ls -la Backend/ssl/`
2. Check file names: `cert.pem` and `key.pem`
3. Verify permissions: `chmod 644 cert.pem` and `chmod 600 key.pem`

### Nginx Won't Start

**Error:** `nginx: [emerg] SSL_CTX_use_certificate_file`

**Solution:**
1. Check nginx logs: `docker-compose logs nginx`
2. Verify certificate format: `openssl x509 -in ssl/cert.pem -text -noout`
3. Check key matches certificate: `openssl x509 -noout -modulus -in ssl/cert.pem | openssl md5` and `openssl rsa -noout -modulus -in ssl/key.pem | openssl md5`

### Mixed Content Errors

**Error:** Frontend shows mixed content warnings

**Solution:**
1. Ensure all API calls use HTTPS
2. Check frontend `apiConfig.ts` uses HTTPS
3. Verify backend is accessible via HTTPS

### Let's Encrypt Challenge Fails

**Error:** `Failed to obtain certificate`

**Solution:**
1. Ensure domain points to server IP
2. Verify ports 80 and 443 are open
3. Check firewall rules
4. Ensure nginx is stopped during certificate generation

## Security Best Practices

1. **Use Strong Ciphers:** Already configured in nginx.conf
2. **Enable HSTS:** Already configured (Strict-Transport-Security)
3. **Regular Renewal:** Set up auto-renewal for Let's Encrypt
4. **Monitor Expiry:** Check certificate expiry: `openssl x509 -in ssl/cert.pem -noout -dates`
5. **Keep Certificates Secure:** Never commit private keys to git

## Frontend Configuration

After setting up HTTPS, update frontend:

1. The frontend `apiConfig.ts` automatically detects HTTPS
2. For production, set environment variable:
   ```bash
   VITE_API_BASE_URL=https://your-domain.com
   ```

## Verification Checklist

- [ ] SSL certificates in `Backend/ssl/` directory
- [ ] Certificates have correct permissions
- [ ] nginx.conf updated with HTTPS configuration
- [ ] docker-compose.yml updated with SSL volumes
- [ ] Ports 80 and 443 open in firewall
- [ ] Domain points to server IP
- [ ] HTTPS accessible: `https://your-domain.com/health`
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured (if using Let's Encrypt)

## Support

For issues or questions:
1. Check nginx logs: `docker-compose logs nginx`
2. Check certificate validity: `openssl x509 -in ssl/cert.pem -text -noout`
3. Test SSL configuration: `openssl s_client -connect your-domain.com:443`



