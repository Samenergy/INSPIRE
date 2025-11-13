#!/bin/bash
# SSL Certificate Setup Script for INSPIRE Backend

set -e

echo "🔐 Setting up SSL certificates for api.inspire.software..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ssl
mkdir -p certbot_www

# Set proper permissions
chmod 755 certbot_www
chmod 755 ssl

# Restart nginx to pick up new volume mounts
echo "🔄 Restarting nginx container..."
docker compose restart nginx || docker-compose restart nginx

# Wait a moment for nginx to start
sleep 2

# Check if nginx is running
if docker compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start. Check logs: docker compose logs nginx"
    exit 1
fi

# Check if port 80 is accessible
echo "🌐 Checking if port 80 is accessible..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/.well-known/acme-challenge/test 2>/dev/null | grep -q "404\|403"; then
    echo "✅ Port 80 is accessible"
else
    echo "⚠️  Port 80 might not be accessible. Ensure firewall allows port 80."
fi

echo ""
echo "📋 Next steps:"
echo "1. Ensure DNS record 'api.inspire.software' points to $(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
echo "   Check with: nslookup api.inspire.software"
echo ""
echo "2. Run certbot to obtain SSL certificates:"
echo ""
echo "docker run -it --rm \\"
echo "  -v \$(pwd)/ssl:/etc/letsencrypt \\"
echo "  -v \$(pwd)/certbot_www:/var/www/certbot \\"
echo "  certbot/certbot certonly --webroot \\"
echo "  --webroot-path=/var/www/certbot \\"
echo "  -d api.inspire.software \\"
echo "  --non-interactive --agree-tos -m leonkwizera.pl@gmail.com"
echo ""
echo "3. After certificates are obtained, run this script to enable HTTPS:"
echo "   ./enable-https.sh"
echo ""
echo "   OR manually:"
echo "   - Edit nginx.conf: uncomment the HTTPS server block (lines 50-83)"
echo "   - Change line 28 in nginx.conf from 'proxy_pass http://app;' to 'return 301 https://\$host\$request_uri;'"
echo "   - Restart nginx: docker compose restart nginx"
echo ""

