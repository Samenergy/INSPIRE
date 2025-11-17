#!/bin/bash
# Restart app service to pick up new timeout settings

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔄 Restarting App Service"
echo "=========================================="
echo ""

echo "=== Restarting app service ==="
docker-compose restart app

sleep 3

echo ""
echo "=== Checking app status ==="
docker-compose ps app

echo ""
echo "=== Recent app logs ==="
docker-compose logs --tail=10 app

echo ""
echo "=========================================="
echo "✅ App service restarted!"
echo "=========================================="
echo ""
echo "The app now uses a 300s (5 minute) timeout for Ollama requests."
echo "This should fix the timeout issues with outreach generation."
echo ""

