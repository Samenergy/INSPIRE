#!/bin/bash
# Health Check Script for INSPIRE Backend
# Monitors the API health endpoint and alerts on failure

API_URL="https://api.inspire.software/health"
LOG_FILE="/var/log/inspire-health-check.log"

# Check API health
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k "$API_URL" 2>&1)

if [ "$STATUS" = "200" ]; then
    echo "$(date): ✅ API is healthy (Status: $STATUS)" >> "$LOG_FILE"
    exit 0
else
    echo "$(date): ❌ API health check failed (Status: $STATUS)" >> "$LOG_FILE"
    # Add notification here (email, Slack webhook, etc.)
    # Example: curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL -d "{\"text\":\"API health check failed: Status $STATUS\"}"
    exit 1
fi

