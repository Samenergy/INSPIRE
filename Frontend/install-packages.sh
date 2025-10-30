#!/bin/bash

# Determine which package manager to use
if [ -f "yarn.lock" ]; then
  PACKAGE_MANAGER="yarn"
elif [ -f "package-lock.json" ]; then
  PACKAGE_MANAGER="npm"
else
  # Default to npm if no lock file is found
  PACKAGE_MANAGER="npm"
fi

echo "Using package manager: $PACKAGE_MANAGER"

# Install required packages
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
  echo "Installing packages with yarn..."
  yarn add framer-motion lucide-react
else
  echo "Installing packages with npm..."
  npm install framer-motion lucide-react
fi

# Check if installation was successful
if [ $? -eq 0 ]; then
  echo "✅ Packages installed successfully!"
  echo "The application will now use animated Lucide icons."
else
  echo "❌ Package installation failed."
  echo "The application will use non-animated fallback icons."
  echo "You can try installing the packages manually:"
  echo "npm install framer-motion lucide-react"
  echo "or"
  echo "yarn add framer-motion lucide-react"
fi

echo ""
echo "Note: You may need to restart your development server for changes to take effect."