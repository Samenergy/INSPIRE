#!/bin/bash
# Debug Nginx crash issues

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔍 Nginx Crash Debug"
echo "=========================================="
echo ""

# 1. Check Nginx status
echo "=== 1. Nginx Container Status ==="
docker-compose ps nginx
echo ""

# 2. Check recent Nginx logs for errors
echo "=== 2. Recent Nginx Logs (Last 50 lines) ==="
docker-compose logs --tail=50 nginx
echo ""

# 3. Check Nginx configuration syntax
echo "=== 3. Nginx Configuration Test ==="
docker-compose exec -T nginx nginx -t 2>&1 || echo "Cannot test config (container may be down)"
echo ""

# 4. Check if SSL certificates exist
echo "=== 4. SSL Certificate Check ==="
if [ -d "./ssl/live" ]; then
    echo "SSL directory exists:"
    ls -la ./ssl/live/ 2>&1 | head -10
else
    echo "⚠️  SSL directory not found at ./ssl/live"
fi
echo ""

# 5. Check if frontend files are mounted correctly
echo "=== 5. Frontend Files Check ==="
if [ -d "../Frontend/dist" ]; then
    echo "✅ Frontend dist exists on host"
    echo "   Files: $(find ../Frontend/dist -type f | wc -l)"
    
    # Try to check from inside container (if it's running)
    echo ""
    echo "Checking from inside container:"
    docker-compose exec -T nginx ls -la /usr/share/nginx/html/ 2>&1 | head -10 || echo "Cannot check (container not running)"
else
    echo "❌ Frontend dist directory not found!"
fi
echo ""

# 6. Check port bindings
echo "=== 6. Port Status ==="
netstat -tlnp 2>/dev/null | grep -E ':(80|443)' || ss -tlnp 2>/dev/null | grep -E ':(80|443)' || echo "Cannot check ports"
echo ""

# 7. Check docker-compose nginx service config
echo "=== 7. Nginx Service Configuration ==="
docker-compose config | grep -A 20 "nginx:" | head -25
echo ""

echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo "Look for errors in the logs above, especially:"
echo "  - Configuration syntax errors"
echo "  - Missing SSL certificates"
echo "  - Port conflicts"
echo "  - Missing volume mounts"
echo ""

