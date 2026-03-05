#!/bin/bash
# =============================================================
# Finance App - Manual Update Script
# Run from: /home/ubuntu/finance/update.sh
# Usage: bash /home/ubuntu/finance/update.sh
# =============================================================

set -e
PROJECT_DIR="/home/ubuntu/finance"
FRONTEND_DIR="${PROJECT_DIR}/frontend-next"
BACKEND_DIR="${PROJECT_DIR}/backend"

echo "=== Finance App Manual Update ==="
echo "Started at: $(date)"

# Pull latest code
echo "[1/4] Pulling latest code from GitHub..."
cd "$PROJECT_DIR"
git pull origin master

# Backend
echo "[2/4] Updating backend dependencies..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "      Restarting backend service..."
sudo systemctl restart finance-backend
echo "      Backend status: $(systemctl is-active finance-backend)"

# Frontend  
echo "[3/4] Installing frontend dependencies & rebuilding..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "[4/4] Restarting PM2 frontend..."
pm2 restart finance-frontend

echo ""
echo "=== Update Complete! ==="
echo "Frontend (PM2): $(pm2 show finance-frontend | grep status | head -1)"
echo "Backend (systemd): $(systemctl is-active finance-backend)"
echo "Completed at: $(date)"
