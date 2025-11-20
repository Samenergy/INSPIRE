#!/bin/bash
# Script to update .env file on server with required variables for Phi-3.5 Mini migration
# Run this on your Hetzner server after pulling the latest code

ENV_FILE=".env"
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Updating .env file for Phi-3.5 Mini migration..."

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✅ Backed up existing .env to $BACKUP_FILE"
fi

# Check if required variables exist, if not add them
add_if_missing() {
    local var_name=$1
    local var_value=$2
    local comment=$3
    
    if ! grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
        echo "" >> "$ENV_FILE"
        if [ ! -z "$comment" ]; then
            echo "# $comment" >> "$ENV_FILE"
        fi
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
        echo "✅ Added ${var_name}=${var_value}"
    else
        echo "ℹ️  ${var_name} already exists"
    fi
}

# Add required LLM configuration variables
echo "" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
echo "# LLM Configuration (llama.cpp with Phi-3.5 Mini) - ADDED BY SCRIPT" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
add_if_missing "LLM_MODEL_PATH" "/app/models/Phi-3.5-mini-instruct-Q8_0.gguf" ""
add_if_missing "LLM_N_CTX" "4096" ""
add_if_missing "LLM_N_THREADS" "8" ""

# Add RAG hyperparameters
echo "" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
echo "# RAG Hyperparameters - ADDED BY SCRIPT" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
add_if_missing "RAG_TEMPERATURE" "0.3" ""
add_if_missing "RAG_TOP_K" "5" ""
add_if_missing "RAG_CHUNK_SIZE" "500" ""
add_if_missing "RAG_CHUNK_OVERLAP" "100" ""

# Add rate limiting
echo "" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
echo "# Rate Limiting Configuration - ADDED BY SCRIPT" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
add_if_missing "RATE_LIMIT_REQUESTS" "100" ""
add_if_missing "RATE_LIMIT_WINDOW" "3600" ""

# Add scraping performance
echo "" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
echo "# Scraping Performance Configuration - ADDED BY SCRIPT" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
add_if_missing "MAX_CONCURRENT_SCRAPES" "5" ""
add_if_missing "REQUEST_TIMEOUT" "30" ""
add_if_missing "RETRY_ATTEMPTS" "3" ""
add_if_missing "RETRY_DELAY" "1" ""

# Add data management
echo "" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
echo "# Data Management Configuration - ADDED BY SCRIPT" >> "$ENV_FILE"
echo "# =============================================================================" >> "$ENV_FILE"
add_if_missing "MAX_ARTICLES_PER_COMPANY" "50" ""
add_if_missing "DATA_CLEANUP_DAYS" "30" ""

echo ""
echo "✅ .env file updated!"
echo "📋 Review the file to ensure Docker service names are correct:"
echo "   - DB_HOST should be 'mysql' (for Docker) or 'localhost' (for local)"
echo "   - REDIS_URL should be 'redis://redis:6379/0' (for Docker) or 'redis://localhost:6379/0' (for local)"
echo "   - MILVUS_HOST should be 'milvus' (for Docker) or 'localhost' (for local)"
echo ""
echo "🔍 To verify, run: cat .env | grep -E '(LLM_|RAG_|RATE_LIMIT|MAX_CONCURRENT)'"

