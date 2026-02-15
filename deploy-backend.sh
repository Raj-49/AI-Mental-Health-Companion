#!/bin/bash

echo "=== Backend Deployment Script ==="
echo ""

# Navigate to project directory
cd /var/www/AI-Mental-Health-Companion || exit 1

# Pull latest changes
echo "1. Pulling latest changes from GitHub..."
git pull origin main

# Go to backend directory
cd backend || exit 1

# Install dependencies
echo ""
echo "2. Installing npm packages..."
npm install

# Run Prisma migrations if schema changed
echo ""
echo "3. Syncing Prisma schema with database..."
npx prisma generate
npx prisma db push

# Restart PM2 process
echo ""
echo "4. Restarting backend service..."
pm2 restart mindmate-backend

# Show PM2 status
echo ""
echo "5. Backend service status:"
pm2 list

# Show recent logs
echo ""
echo "6. Recent logs (last 20 lines):"
pm2 logs mindmate-backend --lines 20 --nostream

echo ""
echo "=== Backend Deployment Complete! ==="
echo ""
echo "Backend is running at: https://mindmate.api.rajpatel.fun"
