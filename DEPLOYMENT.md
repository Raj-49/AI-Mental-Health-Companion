# Deployment Scripts

Quick deployment scripts for the AI Mental Health Companion application on DigitalOcean.

## Available Scripts

### 1. `deploy-all.sh` - Deploy Everything (Recommended)
Deploys both backend and frontend in one command.

```bash
ssh root@167.71.192.229
cd /var/www/AI-Mental-Health-Companion
chmod +x deploy-all.sh
./deploy-all.sh
```

### 2. `deploy-backend.sh` - Backend Only
Deploy only backend changes (API, controllers, services, database).

```bash
ssh root@167.71.192.229
cd /var/www/AI-Mental-Health-Companion
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### 3. `deploy-frontend.sh` - Frontend Only
Deploy only frontend changes (UI, components, pages).

```bash
ssh root@167.71.192.229
cd /var/www/AI-Mental-Health-Companion
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## Deployment Workflow

### From Your Local Machine:

1. **Make your changes** to the code
2. **Test locally** (optional but recommended)
3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

### On the Server:

4. **SSH into server:**
   ```bash
   ssh root@167.71.192.229
   ```

5. **Run deployment script:**
   ```bash
   cd /var/www/AI-Mental-Health-Companion
   ./deploy-all.sh
   ```

6. **Clear browser cache:**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Or open in Incognito/Private mode

## What Each Script Does

### deploy-all.sh
- Discards local changes
- Pulls latest code from GitHub
- Runs backend deployment
- Runs frontend deployment

### deploy-backend.sh
- Pulls latest code
- Installs npm packages
- Runs Prisma migrations
- Restarts PM2 process
- Shows service status and logs

### deploy-frontend.sh
- Pulls latest code
- Installs npm packages
- Verifies markdown packages
- Rebuilds React app
- Reloads Nginx server

## URLs

- **Frontend:** https://mindmate.rajpatel.fun
- **Backend API:** https://mindmate.api.rajpatel.fun
- **Server IP:** 167.71.192.229

## Troubleshooting

### Script not found
```bash
chmod +x deploy-all.sh deploy-backend.sh deploy-frontend.sh
```

### Merge conflicts
```bash
git checkout -- .
git pull origin main
```

### Changes not appearing
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache completely
3. Open in Incognito/Private mode

### Backend not restarting
```bash
pm2 restart mindmate-backend
pm2 logs mindmate-backend
```

### Frontend build errors
```bash
cd /var/www/AI-Mental-Health-Companion/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Quick Reference

```bash
# Full deployment (recommended)
./deploy-all.sh

# Backend only
./deploy-backend.sh

# Frontend only
./deploy-frontend.sh

# Check backend status
pm2 status
pm2 logs mindmate-backend

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
