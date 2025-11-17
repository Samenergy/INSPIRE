#!/bin/bash
# Fix MySQL user and password

cd ~/INSPIRE/Backend

echo "=== Fixing MySQL User ==="

# Connect to MySQL as root and create/fix the app_user
docker-compose exec -T mysql mysql -uroot -ppassword << EOF
-- Create user if it doesn't exist, or update password if it does
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
ALTER USER 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON inspire.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
SELECT 'MySQL user fixed successfully' AS status;
EOF

if [ $? -eq 0 ]; then
    echo "✅ MySQL user fixed"
    
    # Test connection
    echo ""
    echo "=== Testing MySQL Connection ==="
    docker-compose exec -T app python3 -c "
from sqlalchemy import create_engine
import os
try:
    mysql_url = os.getenv('MYSQL_URL', 'mysql+pymysql://app_user:app_password@mysql:3306/inspire')
    engine = create_engine(mysql_url, connect_args={'connect_timeout': 5})
    conn = engine.connect()
    conn.close()
    print('✅ MySQL: Connected successfully')
except Exception as e:
    print(f'❌ MySQL: {e}')
" 2>&1
else
    echo "❌ Failed to fix MySQL user"
    echo "Trying alternative method..."
    
    # Alternative: Recreate MySQL container with correct password
    echo "Stopping MySQL..."
    docker-compose stop mysql
    sleep 2
    
    # Remove the volume to start fresh (WARNING: This will delete data!)
    read -p "This will delete MySQL data. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose rm -f mysql
        docker volume rm backend_mysql_data 2>/dev/null || true
        docker-compose up -d mysql
        echo "Waiting for MySQL to start..."
        sleep 15
        echo "✅ MySQL recreated with correct password"
    else
        echo "Skipping MySQL recreation. Please fix manually."
    fi
fi

