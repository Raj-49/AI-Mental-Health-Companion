#!/bin/bash

echo "=== Frontend Deployment Script ==="
echo ""

# Navigate to project directory
cd /var/www/AI-Mental-Health-Companion || exit 1

# Pull latest changes
echo "1. Pulling latest changes from GitHub..."
git pull origin main

# Go to frontend directory
cd frontend || exit 1

# Install dependencies
echo ""
echo "2. Installing npm packages..."
npm install

# Check if packages are installed
echo ""
echo "3. Verifying packages are installed..."
npm list react-markdown remark-gfm rehype-raw @tailwindcss/typography

# Remove old build
echo ""
echo "4. Removing old build..."
rm -rf dist

# Build frontend
echo ""
echo "5. Building frontend..."
npm run build

# Check build output
echo ""
echo "6. Build completed. Checking dist folder..."
ls -lh dist/

# Reload Nginx
echo ""
echo "7. Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "IMPORTANT: Clear browser cache with Ctrl+Shift+R on https://mindmate.rajpatel.fun"
echo "Or open in incognito/private mode to see changes immediately"
