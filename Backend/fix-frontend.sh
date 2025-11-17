#!/bin/bash
# Frontend crash diagnostic and fix script

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔍 Frontend Crash Diagnostic"
echo "=========================================="
echo ""

# 1. Check Nginx container status
echo "=== 1. Nginx Container Status ==="
docker-compose ps nginx
echo ""

# 2. Check Nginx logs for errors
echo "=== 2. Recent Nginx Errors ==="
docker-compose logs --tail=50 nginx | grep -i -E "(error|failed|crash|emerg|alert|crit)" || echo "No critical errors found in recent logs"
echo ""

# 3. Check if frontend dist directory exists
echo "=== 3. Frontend Build Files ==="
if [ -d "../Frontend/dist" ]; then
    echo "✅ Frontend dist directory exists"
    file_count=$(find ../Frontend/dist -type f | wc -l)
    echo "   Files in dist: $file_count"
    
    if [ -f "../Frontend/dist/index.html" ]; then
        echo "   ✅ index.html exists"
    else
        echo "   ❌ index.html MISSING!"
    fi
else
    echo "❌ Frontend dist directory does not exist!"
    echo "   Need to rebuild frontend"
fi
echo ""

# 4. Check Nginx configuration
echo "=== 4. Nginx Configuration Check ==="
if docker-compose exec -T nginx nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
fi
echo ""

# 5. Check if frontend files are accessible from nginx container
echo "=== 5. Frontend Files in Nginx Container ==="
docker-compose exec -T nginx ls -la /usr/share/nginx/html/ 2>&1 | head -10
echo ""

# 6. Check recent app logs for frontend-related errors
echo "=== 6. Recent App Logs (Frontend Related) ==="
docker-compose logs --tail=30 app | grep -i -E "(frontend|static|404|500)" || echo "No frontend-related errors in app logs"
echo ""

# 7. Summary and fix suggestions
echo "=========================================="
echo "📊 Summary & Fix Suggestions"
echo "=========================================="

NGINX_STATUS=$(docker-compose ps nginx | grep -c "Up")
DIST_EXISTS=$(test -d "../Frontend/dist" && echo "yes" || echo "no")
INDEX_EXISTS=$(test -f "../Frontend/dist/index.html" && echo "yes" || echo "no")

if [ "$NGINX_STATUS" -eq 0 ]; then
    echo "❌ Nginx is not running"
    echo "   Fix: docker-compose up -d nginx"
elif [ "$DIST_EXISTS" = "no" ] || [ "$INDEX_EXISTS" = "no" ]; then
    echo "❌ Frontend build files are missing"
    echo "   Fix: cd ~/INSPIRE/Frontend && npm run build"
    echo "   Then: docker-compose restart nginx"
else
    echo "✅ Basic checks passed"
    echo "   If frontend still not working, try:"
    echo "   - docker-compose restart nginx"
    echo "   - Check browser console for errors"
    echo "   - Verify SSL certificates are valid"
fi

echo ""
echo "=========================================="

