#!/bin/bash
# SSL Certificate Renewal Script for INSPIRE Backend
# This script renews Let's Encrypt certificates and reloads nginx

set -e

cd "$(dirname "$0")"

echo "🔄 Renewing SSL certificates..."

# Renew certificates
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot_www:/var/www/certbot \
  certbot/certbot renew --webroot \
  --webroot-path=/var/www/certbot \
  --quiet

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ Certificates renewed successfully"
    
    # Reload nginx to pick up new certificates
    echo "🔄 Reloading nginx..."
    docker compose restart nginx
    
    echo "✅ SSL renewal complete!"
else
    echo "❌ Certificate renewal failed"
    exit 1
fi

