#!/bin/bash
set -e

PROJECT_DIR="/var/www/AI-Mental-Health-Companion"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

cd "$PROJECT_DIR" || exit 1

OLD_REV="$(git rev-parse HEAD)"
git pull --ff-only origin main
NEW_REV="$(git rev-parse HEAD)"

if [ "$OLD_REV" = "$NEW_REV" ]; then
  echo "No changes found."
  exit 0
fi

CHANGED_FILES="$(git diff --name-only "$OLD_REV" "$NEW_REV")"

if echo "$CHANGED_FILES" | grep -q "^backend/"; then
  cd "$BACKEND_DIR"
  if echo "$CHANGED_FILES" | grep -q "^backend/package.json"; then
    npm install
  fi
  npx prisma generate
  npx prisma db push
  pm2 restart mindmate-backend
fi

if echo "$CHANGED_FILES" | grep -q "^frontend/"; then
  cd "$FRONTEND_DIR"
  if echo "$CHANGED_FILES" | grep -q "^frontend/package.json"; then
    npm install
  fi
  rm -rf dist
  npm run build
  sudo systemctl reload nginx
fi

echo "Update complete."
