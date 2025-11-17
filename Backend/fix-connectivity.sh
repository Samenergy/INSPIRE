#!/bin/bash
# Fix connectivity issues between Docker services

cd ~/INSPIRE/Backend

echo "=== Checking Service Status ==="
docker-compose ps

echo ""
echo "=== Starting All Required Services ==="
# Start all services in the correct order
docker-compose up -d mysql redis etcd minio
sleep 5
docker-compose up -d milvus
sleep 10
docker-compose up -d ollama
sleep 15
docker-compose up -d celery_worker
sleep 5
docker-compose up -d app

echo ""
echo "=== Waiting for Services to be Ready ==="
sleep 10

echo ""
echo "=== Testing Connectivity ==="

# Test Redis
echo -n "Testing Redis... "
docker-compose exec -T app python3 -c "
import redis
try:
    r = redis.Redis(host='redis', port=6379, db=0, socket_connect_timeout=5)
    r.ping()
    print('✅ Redis: Connected')
except Exception as e:
    print(f'❌ Redis: {e}')
" 2>&1

# Test Ollama
echo -n "Testing Ollama... "
docker-compose exec -T app python3 -c "
import requests
try:
    response = requests.get('http://ollama:11434/api/tags', timeout=10)
    if response.status_code == 200:
        print('✅ Ollama: Connected')
    else:
        print(f'❌ Ollama: Status {response.status_code}')
except Exception as e:
    print(f'❌ Ollama: {e}')
" 2>&1

# Test Milvus
echo -n "Testing Milvus... "
docker-compose exec -T app python3 -c "
from pymilvus import connections
try:
    connections.connect(host='milvus', port='19530', timeout=5)
    print('✅ Milvus: Connected')
except Exception as e:
    print(f'❌ Milvus: {e}')
" 2>&1 || echo "⚠️  Milvus: pymilvus not available (this is OK, RAG will use in-memory)"

# Test Celery
echo -n "Checking Celery Worker... "
if docker-compose ps celery_worker | grep -q "Up"; then
    echo "✅ Celery Worker: Running"
else
    echo "❌ Celery Worker: Not running"
fi

# Test MySQL
echo -n "Testing MySQL... "
docker-compose exec -T app python3 -c "
from sqlalchemy import create_engine
import os
try:
    mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    conn = engine.connect()
    conn.close()
    print('✅ MySQL: Connected')
except Exception as e:
    print(f'❌ MySQL: {e}')
" 2>&1

echo ""
echo "=== Service Status After Fix ==="
docker-compose ps

echo ""
echo "=== Checking Logs for Errors ==="
echo "Recent errors from services:"
docker-compose logs --tail=5 redis 2>&1 | grep -i error || echo "Redis: No errors"
docker-compose logs --tail=5 ollama 2>&1 | grep -i error || echo "Ollama: No errors"
docker-compose logs --tail=5 celery_worker 2>&1 | grep -i error || echo "Celery: No errors"

echo ""
echo "=== Done ==="

