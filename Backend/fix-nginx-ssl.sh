#!/bin/bash
# Fix Nginx SSL certificate issues

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔧 Nginx SSL Certificate Fix"
echo "=========================================="
echo ""

# 1. Check if SSL certificates exist
echo "=== 1. Checking SSL Certificates ==="

# Check for api.inspire.software certificates
API_CERT_PATH="./ssl/live/api.inspire.software/fullchain.pem"
API_KEY_PATH="./ssl/live/api.inspire.software/privkey.pem"

# Check for inspire.software certificates
FRONTEND_CERT_PATH="./ssl/live/inspire.software/fullchain.pem"
FRONTEND_KEY_PATH="./ssl/live/inspire.software/privkey.pem"

if [ -f "$API_CERT_PATH" ] && [ -f "$API_KEY_PATH" ]; then
    echo "✅ API certificates exist (api.inspire.software)"
else
    echo "❌ API certificates missing:"
    echo "   Certificate: $API_CERT_PATH"
    echo "   Key: $API_KEY_PATH"
fi

if [ -f "$FRONTEND_CERT_PATH" ] && [ -f "$FRONTEND_KEY_PATH" ]; then
    echo "✅ Frontend certificates exist (inspire.software)"
else
    echo "❌ Frontend certificates missing:"
    echo "   Certificate: $FRONTEND_CERT_PATH"
    echo "   Key: $FRONTEND_KEY_PATH"
fi
echo ""

# 2. Check Nginx logs for specific errors
echo "=== 2. Checking Nginx Error Logs ==="
docker-compose logs --tail=30 nginx 2>&1 | grep -i -E "(ssl|certificate|error|failed)" | head -10
echo ""

# 3. Test Nginx configuration
echo "=== 3. Testing Nginx Configuration ==="
# Stop nginx first to test config
docker-compose stop nginx 2>/dev/null

# Try to test config by running nginx in test mode
docker-compose run --rm --no-deps nginx nginx -t 2>&1
CONFIG_TEST_RESULT=$?

if [ $CONFIG_TEST_RESULT -ne 0 ]; then
    echo ""
    echo "❌ Nginx configuration has errors!"
    echo ""
    echo "Options:"
    echo "1. If certificates are missing, we can create a temporary config without SSL"
    echo "2. Or obtain certificates using Certbot"
    echo ""
    read -p "Create temporary HTTP-only config? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating temporary HTTP-only nginx config..."
        # Backup original config
        cp nginx.conf nginx.conf.backup
        
        # Create a simplified HTTP-only config
        cat > nginx.conf << 'NGINX_HTTP_ONLY'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    upstream app {
        server app:8000;
    }

    # HTTP server - Backend API (api.inspire.software)
    server {
        listen 80;
        server_name api.inspire.software;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_buffering off;
            
            proxy_connect_timeout 600s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;
            send_timeout 600s;
        }

        location /health {
            proxy_pass http://app;
            access_log off;
        }
    }

    # HTTP server - Frontend (inspire.software and www.inspire.software)
    server {
        listen 80;
        server_name www.inspire.software inspire.software;

        # Serve frontend static files
        root /usr/share/nginx/html;
        index index.html;

        # Serve static files
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_buffering off;
            
            proxy_connect_timeout 600s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;
            send_timeout 600s;
        }
    }
}
NGINX_HTTP_ONLY
        
        echo "✅ Created HTTP-only nginx config"
        echo "   Original config backed up to: nginx.conf.backup"
    fi
else
    echo "✅ Nginx configuration is valid"
fi
echo ""

# 4. Start Nginx
echo "=== 4. Starting Nginx ==="
docker-compose up -d nginx

sleep 3

# 5. Check Nginx status
echo ""
echo "=== 5. Nginx Status ==="
docker-compose ps nginx

echo ""
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""
echo "If Nginx is still restarting, check logs with:"
echo "  docker-compose logs nginx"
echo ""
echo "To restore original config:"
echo "  cp nginx.conf.backup nginx.conf"
echo "  docker-compose restart nginx"
echo ""

