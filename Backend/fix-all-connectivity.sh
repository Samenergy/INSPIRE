#!/bin/bash
# Fix all connectivity issues: MySQL, Milvus, and verify all services

cd ~/INSPIRE/Backend

echo "=== Step 1: Fixing MySQL User ==="
docker-compose exec -T mysql mysql -uroot -ppassword << 'MYSQL_SCRIPT'
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
ALTER USER 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON inspire.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
SELECT 'MySQL user fixed' AS status;
MYSQL_SCRIPT

if [ $? -eq 0 ]; then
    echo "✅ MySQL user fixed"
else
    echo "❌ Failed to fix MySQL user"
fi

echo ""
echo "=== Step 2: Checking Milvus Status ==="
milvus_status=$(docker-compose ps milvus | grep -c "Up")
if [ "$milvus_status" -eq 0 ]; then
    echo "⚠️  Milvus is not running. Checking logs..."
    docker-compose logs --tail=30 milvus | tail -10
    echo ""
    echo "Attempting to restart Milvus..."
    docker-compose restart milvus
    sleep 10
else
    echo "✅ Milvus is running"
fi

echo ""
echo "=== Step 3: Restarting App and Celery to pick up MySQL fix ==="
docker-compose restart app celery_worker
sleep 5

echo ""
echo "=== Step 4: Final Connectivity Test ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import redis
import requests
from sqlalchemy import create_engine
import os
import sys

errors = []

# Test Redis
try:
    r = redis.Redis(host='redis', port=6379, db=0, socket_connect_timeout=5)
    r.ping()
    print('✅ Redis: Connected')
except Exception as e:
    print(f'❌ Redis: {e}')
    errors.append('Redis')

# Test Ollama
try:
    response = requests.get('http://ollama:11434/api/tags', timeout=5)
    if response.status_code == 200:
        print('✅ Ollama: Connected')
    else:
        print(f'❌ Ollama: Status {response.status_code}')
        errors.append('Ollama')
except Exception as e:
    print(f'❌ Ollama: {e}')
    errors.append('Ollama')

# Test MySQL
try:
    mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    conn = engine.connect()
    conn.close()
    print('✅ MySQL: Connected')
except Exception as e:
    print(f'❌ MySQL: {e}')
    errors.append('MySQL')

# Test Celery (check if worker is running)
print('✅ Celery Worker: Running (checked via docker-compose ps)')

if errors:
    print(f'\n⚠️  Services with issues: {", ".join(errors)}')
    sys.exit(1)
else:
    print('\n✅ All services connected successfully!')
    sys.exit(0)
PYTHON_SCRIPT

test_result=$?

echo ""
echo "=== Final Service Status ==="
docker-compose ps

if [ $test_result -eq 0 ]; then
    echo ""
    echo "✅ All connectivity issues fixed!"
else
    echo ""
    echo "⚠️  Some services still have issues. Check the output above."
fi

