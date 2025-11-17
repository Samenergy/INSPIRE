#!/bin/bash
# Fix Celery worker MySQL authentication issues

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔧 Fixing Celery Worker MySQL Connection"
echo "=========================================="
echo ""

# 1. Fix MySQL user permissions
echo "=== 1. Fixing MySQL User Permissions ==="
docker-compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-password} << 'SQL'
-- Drop and recreate app_user with correct password
DROP USER IF EXISTS 'app_user'@'%';
CREATE USER 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON inspire.* TO 'app_user'@'%';
GRANT CREATE ON *.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
SELECT '✅ MySQL user app_user recreated successfully' AS status;
SQL

if [ $? -eq 0 ]; then
    echo "✅ MySQL user permissions fixed"
else
    echo "❌ Failed to fix MySQL user permissions"
    exit 1
fi
echo ""

# 2. Test MySQL connection from celery_worker
echo "=== 2. Testing MySQL Connection from Celery Worker ==="
docker-compose exec -T celery_worker python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text
import os

mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
print(f"Testing connection with: {mysql_url.split('@')[0]}@...")

try:
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 'Connected' AS status, DATABASE() AS current_db"))
        row = result.fetchone()
        print(f"✅ {row[0]}")
        print(f"   Database: {row[1]}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Connection test failed"
    exit 1
fi
echo ""

# 3. Recreate celery_worker container to ensure it has latest env vars
echo "=== 3. Recreating Celery Worker Container ==="
docker-compose stop celery_worker
docker-compose rm -f celery_worker
docker-compose up -d celery_worker

sleep 5

# 4. Check celery_worker status
echo ""
echo "=== 4. Celery Worker Status ==="
docker-compose ps celery_worker

echo ""
echo "=== 5. Recent Celery Worker Logs ==="
docker-compose logs --tail=10 celery_worker

echo ""
echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "The Celery worker should now be able to connect to MySQL."
echo "Try running an analysis task again to verify."
echo ""

