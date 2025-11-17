#!/bin/bash
# Check Ollama service status and connectivity

cd ~/INSPIRE/Backend

echo "=========================================="
echo "🔍 Ollama Service Diagnostic"
echo "=========================================="
echo ""

# 1. Check Ollama container status
echo "=== 1. Ollama Container Status ==="
docker-compose ps ollama
echo ""

# 2. Check Ollama logs
echo "=== 2. Recent Ollama Logs (Last 30 lines) ==="
docker-compose logs --tail=30 ollama
echo ""

# 3. Test connectivity from app container
echo "=== 3. Testing Ollama Connectivity from App Container ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import requests
import os

ollama_url = os.getenv('OLLAMA_BASE_URL', 'http://ollama:11434')
print(f"Testing Ollama at: {ollama_url}")

try:
    # Test basic connectivity
    response = requests.get(f"{ollama_url}/api/tags", timeout=5)
    if response.status_code == 200:
        print("✅ Ollama is responding")
        data = response.json()
        models = data.get('models', [])
        print(f"   Models available: {len(models)}")
        for model in models[:3]:
            print(f"   - {model.get('name', 'unknown')}")
    else:
        print(f"❌ Ollama returned status {response.status_code}")
except requests.exceptions.Timeout:
    print("❌ Connection timeout (Ollama not responding)")
except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
PYTHON_SCRIPT
echo ""

# 4. Test a simple generation request
echo "=== 4. Testing Simple Generation Request ==="
docker-compose exec -T app python3 << 'PYTHON_SCRIPT'
import requests
import os
import time

ollama_url = os.getenv('OLLAMA_BASE_URL', 'http://ollama:11434')
print(f"Testing generation at: {ollama_url}/api/generate")

payload = {
    "model": "llama3.1:latest",
    "prompt": "Say hello in one word.",
    "stream": False,
    "options": {
        "temperature": 0.7,
        "num_predict": 10
    }
}

try:
    start_time = time.time()
    response = requests.post(
        f"{ollama_url}/api/generate",
        json=payload,
        timeout=30
    )
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        result = response.json()
        generated = result.get('response', '')
        print(f"✅ Generation successful (took {elapsed:.2f}s)")
        print(f"   Response: {generated[:100]}")
    else:
        print(f"❌ Generation failed with status {response.status_code}")
        print(f"   Response: {response.text[:200]}")
except requests.exceptions.Timeout:
    print(f"❌ Generation timeout after 30s (Ollama is too slow)")
except Exception as e:
    print(f"❌ Error: {e}")
PYTHON_SCRIPT
echo ""

# 5. Check Ollama resource usage
echo "=== 5. Ollama Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" backend_ollama_1 2>/dev/null || echo "Cannot get stats (container may not be running)"
echo ""

# 6. Check if model is loaded
echo "=== 6. Checking if Model is Loaded ==="
docker-compose exec -T ollama ollama list 2>/dev/null || echo "Cannot check models"
echo ""

echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""
echo "If Ollama is timing out:"
echo "  1. Check if Ollama container is running: docker-compose ps ollama"
echo "  2. Check Ollama logs: docker-compose logs ollama"
echo "  3. Restart Ollama: docker-compose restart ollama"
echo "  4. Check if model is loaded: docker-compose exec ollama ollama list"
echo "  5. Increase timeout in outreach_service.py if needed"
echo ""

