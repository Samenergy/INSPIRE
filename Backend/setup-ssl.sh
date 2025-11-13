#!/bin/bash

# SSL Certificate Setup Script for INSPIRE Backend
# This script helps set up SSL certificates for HTTPS

set -e

SSL_DIR="./ssl"
DOMAIN="${1:-46.62.228.201}"
EMAIL="${2:-admin@inspire.software}"

echo "🔐 SSL Certificate Setup for INSPIRE Backend"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please do not run this script as root"
   exit 1
fi

# Create SSL directory
mkdir -p "$SSL_DIR"

echo "📋 Options for SSL Certificate Setup:"
echo ""
echo "1. Let's Encrypt (Free, Automated) - Recommended"
echo "2. Self-Signed Certificate (Development/Testing)"
echo "3. Use Existing Certificates"
echo "4. Exit"
echo ""
read -p "Select option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔒 Setting up Let's Encrypt Certificate..."
        echo ""
        
        # Check if certbot is installed
        if ! command -v certbot &> /dev/null; then
            echo "📦 Installing certbot..."
            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                sudo apt-get update
                sudo apt-get install -y certbot
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                brew install certbot
            else
                echo "❌ Please install certbot manually"
                exit 1
            fi
        fi
        
        # Check if domain is accessible
        echo "⚠️  IMPORTANT: Make sure your domain $DOMAIN points to this server's IP"
        echo "⚠️  Ports 80 and 443 must be open in your firewall"
        read -p "Press Enter to continue..."
        
        # Create certbot directories
        mkdir -p certbot/www
        mkdir -p certbot/conf
        
        # Stop nginx temporarily for certificate generation
        echo "🛑 Stopping nginx container..."
        docker-compose stop nginx || true
        
        # Generate certificate
        echo "📝 Generating Let's Encrypt certificate..."
        sudo certbot certonly \
            --standalone \
            --preferred-challenges http \
            -d "$DOMAIN" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --cert-path ./certbot/conf \
            --key-path ./certbot/conf
        
        # Copy certificates to ssl directory
        echo "📋 Copying certificates..."
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"
        sudo chown $USER:$USER "$SSL_DIR"/*.pem
        
        echo "✅ Let's Encrypt certificate installed!"
        echo ""
        echo "📝 To auto-renew, add this to crontab:"
        echo "   0 0 * * * certbot renew --quiet && docker-compose restart nginx"
        ;;
        
    2)
        echo ""
        echo "🔒 Generating Self-Signed Certificate..."
        echo "⚠️  WARNING: Self-signed certificates will show security warnings in browsers"
        echo ""
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_DIR/key.pem" \
            -out "$SSL_DIR/cert.pem" \
            -subj "/C=US/ST=State/L=City/O=INSPIRE/CN=$DOMAIN"
        
        echo "✅ Self-signed certificate generated!"
        echo "   Certificate: $SSL_DIR/cert.pem"
        echo "   Private Key: $SSL_DIR/key.pem"
        ;;
        
    3)
        echo ""
        echo "📁 Using Existing Certificates"
        echo ""
        read -p "Enter path to certificate file (.pem or .crt): " cert_path
        read -p "Enter path to private key file (.key or .pem): " key_path
        
        if [ ! -f "$cert_path" ] || [ ! -f "$key_path" ]; then
            echo "❌ Certificate files not found!"
            exit 1
        fi
        
        cp "$cert_path" "$SSL_DIR/cert.pem"
        cp "$key_path" "$SSL_DIR/key.pem"
        
        echo "✅ Certificates copied to $SSL_DIR/"
        ;;
        
    4)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

# Set proper permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo ""
echo "✅ SSL setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review nginx.conf configuration"
echo "   2. Start services: docker-compose up -d"
echo "   3. Test HTTPS: curl -k https://$DOMAIN/health"
echo ""



