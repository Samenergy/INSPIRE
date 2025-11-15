#!/bin/bash
# Enable HTTPS after SSL certificates are obtained

set -e

echo "🔒 Enabling HTTPS in nginx configuration..."

# Check if certificates exist
if [ ! -f "ssl/live/api.inspire.software/fullchain.pem" ]; then
    echo "❌ SSL certificates not found!"
    echo "   Expected: ssl/live/api.inspire.software/fullchain.pem"
    echo "   Run certbot first to obtain certificates."
    exit 1
fi

echo "✅ SSL certificates found"

# Create backup
cp nginx.conf nginx.conf.backup
echo "📋 Backup created: nginx.conf.backup"

# Uncomment HTTPS server block
sed -i '/^    # server {/,/^    # }/s/^    # /    /' nginx.conf
sed -i '/^    #     listen 443/s/^    #     /        /' nginx.conf
sed -i '/^    #     server_name/s/^    #     /        /' nginx.conf
sed -i '/^    #     ssl_certificate/s/^    #     /        /' nginx.conf
sed -i '/^    #     ssl_protocols/s/^    #     /        /' nginx.conf
sed -i '/^    #     ssl_ciphers/s/^    #     /        /' nginx.conf
sed -i '/^    #     ssl_session_cache/s/^    #     /        /' nginx.conf
sed -i '/^    #     ssl_session_timeout/s/^    #     /        /' nginx.conf
sed -i '/^    #     add_header/s/^    #     /        /' nginx.conf
sed -i '/^    #     location \/ {/,/^    #     }/s/^    #     /            /' nginx.conf
sed -i '/^    #     location \/health/,/^    #     }/s/^    #     /            /' nginx.conf

# Actually, let's use a simpler approach - read the file and do proper replacement
python3 << 'PYTHON_SCRIPT'
import re

with open('nginx.conf', 'r') as f:
    content = f.read()

# Uncomment HTTPS server block
content = re.sub(
    r'    # server \{\n    #     listen 443 ssl http2;',
    r'    server {\n        listen 443 ssl http2;',
    content
)

# Uncomment all lines in HTTPS block
lines = content.split('\n')
in_https_block = False
result_lines = []

for line in lines:
    if 'HTTPS server - UNCOMMENT' in line or 'Uncomment the block below' in line:
        # Skip comment lines
        continue
    if 'server {' in line and '443 ssl' in content[content.find(line):content.find(line)+200]:
        in_https_block = True
        result_lines.append(line.replace('# ', '').replace('#', ''))
    elif in_https_block and line.strip().startswith('#') and ('server {' in line or '}' in line or 'location' in line or 'ssl_' in line or 'add_header' in line or 'proxy_' in line or 'listen' in line or 'server_name' in line):
        result_lines.append(line.replace('# ', '        ').replace('#     ', '        ').replace('#', ''))
        if line.strip() == '# }':
            in_https_block = False
    else:
        result_lines.append(line)

content = '\n'.join(result_lines)

# Change HTTP redirect
content = re.sub(
    r'        # Serve app directly.*?\n        location / \{\n            proxy_pass http://app;',
    r'        # Redirect to HTTPS\n        location / {\n            return 301 https://$host$request_uri;',
    content,
    flags=re.DOTALL
)

with open('nginx.conf', 'w') as f:
    f.write(content)

print("✅ HTTPS server block uncommented")
print("✅ HTTP redirect enabled")
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "⚠️  Python script failed, trying manual approach..."
    # Manual approach: use sed to uncomment
    sed -i 's/^    # server {/    server {/' nginx.conf
    sed -i '/^    #     /s/^    #     /        /' nginx.conf
    sed -i '/^    # }/s/^    # }/    }/' nginx.conf
    # Change redirect
    sed -i 's|proxy_pass http://app;|return 301 https://$host$request_uri;|' nginx.conf
    sed -i 's|# Serve app directly|# Redirect to HTTPS|' nginx.conf
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
docker compose exec nginx nginx -t 2>/dev/null || docker compose run --rm nginx nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Restarting nginx..."
    docker compose restart nginx
    echo "✅ HTTPS enabled! Your API is now available at: http://0.0.0.0:8000"
else
    echo "❌ Nginx configuration test failed!"
    echo "   Restoring backup..."
    cp nginx.conf.backup nginx.conf
    echo "   Please check the configuration manually."
    exit 1
fi

