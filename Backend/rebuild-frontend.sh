#!/bin/bash
# Quick frontend rebuild script

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔧 Frontend Rebuild Script"
echo "=========================================="
echo ""

# Check if we're on the server
if [ ! -d "../Frontend" ]; then
    echo "❌ Frontend directory not found at ../Frontend"
    echo "   Please run this from ~/INSPIRE/Backend"
    exit 1
fi

# Step 1: Rebuild frontend
echo "=== Step 1: Rebuilding Frontend ==="
cd ../Frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build completed"
echo ""

# Step 2: Verify build output
echo "=== Step 2: Verifying Build Output ==="
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
    file_count=$(find dist -type f | wc -l)
    echo "   Total files: $file_count"
else
    echo "❌ index.html not found after build!"
    exit 1
fi
echo ""

# Step 3: Restart Nginx
echo "=== Step 3: Restarting Nginx ==="
cd ../Backend
docker-compose restart nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx restarted successfully"
else
    echo "❌ Failed to restart Nginx"
    exit 1
fi
echo ""

# Step 4: Verify Nginx is running
echo "=== Step 4: Verifying Nginx Status ==="
sleep 2
docker-compose ps nginx

echo ""
echo "=========================================="
echo "✅ Frontend rebuild complete!"
echo "=========================================="
echo ""
echo "Test the frontend at:"
echo "  - https://inspire.software"
echo "  - https://www.inspire.software"
echo ""

