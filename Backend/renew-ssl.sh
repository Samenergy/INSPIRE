#!/bin/bash

# SSL Certificate Renewal Script
# Run this script via cron to auto-renew Let's Encrypt certificates

set -e

DOMAIN="${1:-46.62.228.201}"
SSL_DIR="./ssl"

echo "🔄 Renewing SSL certificate for $DOMAIN..."

# Renew certificate
certbot renew --quiet

# Copy renewed certificates
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"
    sudo chown $USER:$USER "$SSL_DIR"/*.pem
    
    # Restart nginx to load new certificates
    docker-compose restart nginx
    
    echo "✅ Certificate renewed and nginx restarted"
else
    echo "❌ Certificate renewal failed"
    exit 1
fi



