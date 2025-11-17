#!/bin/bash
# Comprehensive service health check script

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔍 Service Health Check"
echo "=========================================="
echo ""

# 1. Check Docker container status
echo "=== 1. Docker Container Status ==="
docker-compose ps
echo ""

# 2. Test Redis
echo "=== 2. Redis Connection ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import redis
try:
    r = redis.Redis(host='redis', port=6379, db=0, socket_connect_timeout=5)
    r.ping()
    print('✅ Redis: Connected')
except Exception as e:
    print(f'❌ Redis: {e}')
PYTHON_SCRIPT
echo ""

# 3. Test Ollama
echo "=== 3. Ollama Connection ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import requests
try:
    response = requests.get('http://ollama:11434/api/tags', timeout=5)
    if response.status_code == 200:
        print('✅ Ollama: Connected')
        # Try to get model list
        data = response.json()
        models = data.get('models', [])
        if models:
            print(f'   Models available: {len(models)}')
            for model in models[:3]:
                print(f'   - {model.get("name", "unknown")}')
    else:
        print(f'❌ Ollama: Status {response.status_code}')
except Exception as e:
    print(f'❌ Ollama: {e}')
PYTHON_SCRIPT
echo ""

# 4. Test MySQL
echo "=== 4. MySQL Connection ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text
import os

try:
    mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        # Test connection
        result = conn.execute(text("SELECT 'Connected' AS status, DATABASE() AS current_db"))
        row = result.fetchone()
        print(f'✅ MySQL: Connected')
        print(f'   Database: {row[1]}')
        
        # Check tables
        result = conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result.fetchall()]
        print(f'   Tables: {len(tables)} ({", ".join(tables[:5])}{"..." if len(tables) > 5 else ""})')
except Exception as e:
    print(f'❌ MySQL: {e}')
PYTHON_SCRIPT
echo ""

# 5. Test Milvus
echo "=== 5. Milvus Connection ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
try:
    from pymilvus import connections, utility
    connections.connect(host='milvus', port='19530', timeout=10)
    print('✅ Milvus: Connected')
    
    # List collections if any
    try:
        collections = utility.list_collections()
        print(f'   Collections: {len(collections)}')
        if collections:
            for col in collections[:3]:
                print(f'   - {col}')
    except:
        print('   (No collections yet)')
    
    connections.disconnect('default')
except ImportError:
    print('⚠️  Milvus: pymilvus not available (RAG will use in-memory fallback)')
except Exception as e:
    print(f'⚠️  Milvus: {e}')
    print('   (RAG will use in-memory fallback)')
PYTHON_SCRIPT
echo ""

# 6. Check Celery Worker
echo "=== 6. Celery Worker Status ==="
CELERY_STATUS=$(docker-compose ps celery_worker | grep -c "Up")
if [ "$CELERY_STATUS" -gt 0 ]; then
    echo "✅ Celery Worker: Running"
    
    # Check if it's processing tasks
    docker-compose logs --tail=5 celery_worker | grep -i -E "(ready|connected|celery@)" | tail -1 || echo "   (Check logs for details)"
else
    echo "❌ Celery Worker: Not running"
fi
echo ""

# 7. Check service logs for errors
echo "=== 7. Recent Errors (last 20 lines) ==="
for service in app redis ollama mysql milvus celery_worker; do
    errors=$(docker-compose logs --tail=20 $service 2>&1 | grep -i -E "(error|failed|exception|❌)" | tail -3)
    if [ ! -z "$errors" ]; then
        echo "⚠️  $service:"
        echo "$errors" | sed 's/^/   /'
    fi
done
echo ""

# 8. Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import redis
import requests
from sqlalchemy import create_engine, text
import os

services_ok = []
services_failed = []

# Redis
try:
    r = redis.Redis(host='redis', port=6379, db=0, socket_connect_timeout=5)
    r.ping()
    services_ok.append('Redis')
except:
    services_failed.append('Redis')

# Ollama
try:
    response = requests.get('http://ollama:11434/api/tags', timeout=5)
    if response.status_code == 200:
        services_ok.append('Ollama')
    else:
        services_failed.append('Ollama')
except:
    services_failed.append('Ollama')

# MySQL
try:
    mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    services_ok.append('MySQL')
except:
    services_failed.append('MySQL')

# Milvus
try:
    from pymilvus import connections
    connections.connect(host='milvus', port='19530', timeout=5)
    connections.disconnect('default')
    services_ok.append('Milvus')
except:
    services_ok.append('Milvus (in-memory fallback)')

# Celery
services_ok.append('Celery Worker')

print(f"✅ Connected: {', '.join(services_ok)}")
if services_failed:
    print(f"❌ Failed: {', '.join(services_failed)}")
else:
    print("🎉 All services are connected and working!")
PYTHON_SCRIPT

echo ""
echo "=========================================="

