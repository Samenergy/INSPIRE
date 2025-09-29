#!/bin/bash

# Install Playwright browsers and dependencies
echo "Installing Playwright browsers and dependencies..."

# Install system dependencies
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2

# Install Playwright browsers
playwright install --with-deps

echo "Playwright installation complete!"
