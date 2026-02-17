#!/bin/bash
set -e

PROJECT_DIR="/var/www/AI-Mental-Health-Companion"
REPO_URL="https://github.com/Raj-49/AI-Mental-Health-Companion.git"
FRONTEND_DOMAIN="mindmate.rajpatel.app"
BACKEND_DOMAIN="mindmate.api.rajpatel.app"

if [ "$(id -u)" -eq 0 ]; then
  echo "ERROR: Run as a normal user (not root)."
  exit 1
fi

sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx ufw curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

sudo mkdir -p /var/www
if [ ! -d "$PROJECT_DIR" ]; then
  sudo git clone "$REPO_URL" "$PROJECT_DIR"
  sudo chown -R "$USER:$USER" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

echo "Checking .env files..."
if [ ! -f backend/.env ]; then
  echo "ERROR: backend/.env not found. Create it before running this script."
  exit 1
fi
if [ ! -f frontend/.env ]; then
  echo "ERROR: frontend/.env not found. Create it before running this script."
  exit 1
fi
if grep -q "localhost" backend/.env; then
  echo "ERROR: backend/.env contains localhost. Use production domains only."
  exit 1
fi
if grep -q "localhost" frontend/.env; then
  echo "ERROR: frontend/.env contains localhost. Use production domains only."
  exit 1
fi

cd backend
npm install
npx prisma generate
npx prisma db push
pm2 start src/server.js --name mindmate-backend --max-memory-restart 400M
pm2 save
pm2 startup

cd ../frontend
npm install
npm run build

sudo tee /etc/nginx/sites-available/mindmate-frontend > /dev/null <<EOF
server {
  listen 80;
  server_name ${FRONTEND_DOMAIN};
  root /var/www/AI-Mental-Health-Companion/frontend/dist;
  index index.html;
  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

sudo tee /etc/nginx/sites-available/mindmate-backend > /dev/null <<EOF
server {
  listen 80;
  server_name ${BACKEND_DOMAIN};
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 60s;
  }
}
EOF

sudo ln -s /etc/nginx/sites-available/mindmate-frontend /etc/nginx/sites-enabled/ || true
sudo ln -s /etc/nginx/sites-available/mindmate-backend /etc/nginx/sites-enabled/ || true
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw --force enable

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ${FRONTEND_DOMAIN} -d ${BACKEND_DOMAIN}

echo ""
echo "Deployment complete."
echo "Frontend: https://${FRONTEND_DOMAIN}"
echo "Backend:  https://${BACKEND_DOMAIN}"
echo "Hard refresh browser (Ctrl+Shift+R) after deploy."
