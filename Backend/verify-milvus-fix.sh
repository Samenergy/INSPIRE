#!/bin/bash
# Verify that the Milvus error handling fix is in place

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔍 Verifying Milvus Error Handling Fix"
echo "=========================================="
echo ""

# Check if MilvusException is imported
echo "=== 1. Checking for MilvusException import ==="
if grep -q "from pymilvus.exceptions import MilvusException" app/services/rag_analysis_service.py; then
    echo "✅ MilvusException is imported"
else
    echo "❌ MilvusException is NOT imported - code may not be updated"
fi
echo ""

# Check if error handling is in _store_vectors_milvus
echo "=== 2. Checking _store_vectors_milvus error handling ==="
if grep -A 5 "def _store_vectors_milvus" app/services/rag_analysis_service.py | grep -q "try:"; then
    echo "✅ _store_vectors_milvus has try-except wrapper"
else
    echo "❌ _store_vectors_milvus missing try-except wrapper"
fi
echo ""

# Check if error handling is in analyze_comprehensive
echo "=== 3. Checking analyze_comprehensive error handling ==="
if grep -A 10 "if self.milvus_available:" app/services/rag_analysis_service.py | grep -q "except.*MilvusException"; then
    echo "✅ analyze_comprehensive has MilvusException handling"
else
    echo "⚠️  analyze_comprehensive may not have MilvusException handling"
fi
echo ""

# Check git status
echo "=== 4. Git Status ==="
git status --short app/services/rag_analysis_service.py
echo ""

# Show recent commits
echo "=== 5. Recent Commits ==="
git log --oneline -5 -- app/services/rag_analysis_service.py
echo ""

echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""
echo "If fixes are not present, run:"
echo "  git pull"
echo "  docker-compose restart celery_worker"
echo ""

