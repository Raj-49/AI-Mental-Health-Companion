#!/bin/bash

echo "========================================="
echo "   Full Stack Deployment Script"
echo "========================================="
echo ""

# Navigate to project directory
cd /var/www/AI-Mental-Health-Companion || exit 1

# Discard any local changes to avoid merge conflicts
echo "🔄 Discarding local changes..."
git checkout -- .

# Pull latest changes
echo ""
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Make scripts executable
chmod +x deploy-backend.sh
chmod +x deploy-frontend.sh

echo ""
echo "========================================="
echo "   BACKEND DEPLOYMENT"
echo "========================================="
./deploy-backend.sh

echo ""
echo "========================================="
echo "   FRONTEND DEPLOYMENT"
echo "========================================="
./deploy-frontend.sh

echo ""
echo "========================================="
echo "   ✅ FULL DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "🌐 Frontend: https://mindmate.rajpatel.fun"
echo "🔧 Backend:  https://mindmate.api.rajpatel.fun"
echo ""
echo "⚠️  IMPORTANT: Hard refresh browser (Ctrl+Shift+R) to see changes"
