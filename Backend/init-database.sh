#!/bin/bash
# Database Initialization Script for INSPIRE Backend
# This script initializes the MySQL database and creates all required tables

set -e

echo "🚀 Initializing INSPIRE Database..."
echo ""

# Check if running in Docker or locally
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo "📦 Running inside Docker container"
    cd /app
    python -m app.database_init
else
    echo "💻 Running locally"
    cd "$(dirname "$0")"
    python -m app.database_init
fi

echo ""
echo "✅ Database initialization complete!"

