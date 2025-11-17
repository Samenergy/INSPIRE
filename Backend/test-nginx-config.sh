#!/bin/bash
# Test and restart Nginx with fixed configuration

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔧 Testing and Restarting Nginx"
echo "=========================================="
echo ""

# Stop nginx first
echo "=== 1. Stopping Nginx ==="
docker-compose stop nginx
echo ""

# Test configuration
echo "=== 2. Testing Nginx Configuration ==="
docker-compose run --rm --no-deps nginx nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration is valid!"
    echo ""
    
    # Start nginx
    echo "=== 3. Starting Nginx ==="
    docker-compose up -d nginx
    
    sleep 3
    
    # Check status
    echo ""
    echo "=== 4. Nginx Status ==="
    docker-compose ps nginx
    
    echo ""
    echo "=========================================="
    echo "✅ Nginx should now be running!"
    echo "=========================================="
else
    echo "❌ Configuration test failed!"
    echo "   Please check the error above"
    exit 1
fi

