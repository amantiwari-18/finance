#!/bin/bash
set -e

echo "=== [Step 1] Creating PostgreSQL database ==="
sudo -u postgres psql -c "CREATE DATABASE finance_tracker;" 2>/dev/null || echo "  Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO postgres;" 2>/dev/null || true
echo "  Database ready."

echo "=== [Step 2] Creating systemd service for finance backend ==="
cat > /tmp/finance-backend.service << 'SERVICEEOF'
[Unit]
Description=Finance App Backend (FastAPI)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/finance/backend
Environment="PATH=/home/ubuntu/finance/backend/venv/bin"
ExecStart=/home/ubuntu/finance/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=finance-backend

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo cp /tmp/finance-backend.service /etc/systemd/system/finance-backend.service
sudo systemctl daemon-reload
sudo systemctl enable finance-backend
sudo systemctl restart finance-backend
echo "  Backend started."
sleep 2
sudo systemctl status finance-backend --no-pager | tail -5

echo "=== [Step 3] Creating Nginx config ==="
cat > /tmp/finance-nginx.conf << 'NGINXEOF'
server {
    listen 80;
    server_name ppsfinance.duckdns.org;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINXEOF

sudo cp /tmp/finance-nginx.conf /etc/nginx/sites-available/finance
sudo ln -sf /etc/nginx/sites-available/finance /etc/nginx/sites-enabled/finance
sudo nginx -t
sudo systemctl reload nginx
echo "  Nginx configured and reloaded."

echo "=== [Step 4] Creating auto-deploy script ==="
cat > /home/ubuntu/auto_deploy_finance.sh << 'SCRIPTEOF'
#!/bin/bash
PROJECT_NAME="finance"
PROJECT_DIR="/home/ubuntu/${PROJECT_NAME}"
LOG_FILE="/home/ubuntu/auto_deploy_finance.log"
FRONTEND_DIR="${PROJECT_DIR}/frontend-next"
BACKEND_DIR="${PROJECT_DIR}/backend"
MAX_LOG_SIZE=5242880

if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "========== Auto-deploy check started =========="

if [ ! -d "$PROJECT_DIR" ]; then
    log "ERROR: Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
git fetch origin master >> "$LOG_FILE" 2>&1

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/master 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "No new commits. Local: ${LOCAL:0:8}. Skipping."
    log "========== Check complete =========="
    exit 0
fi

log "New commits! Local: ${LOCAL:0:8} -> Remote: ${REMOTE:0:8}"
log "Starting deployment..."

git pull origin master >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: git pull failed!"
    exit 1
fi

log "Updating backend deps..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install -r requirements.txt --quiet >> "$LOG_FILE" 2>&1
deactivate

log "Restarting backend..."
sudo systemctl restart finance-backend >> "$LOG_FILE" 2>&1
log "Backend status: $(systemctl is-active finance-backend)"

log "Building frontend..."
cd "$FRONTEND_DIR"
npm install --silent >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: Frontend build failed!"
    exit 1
fi

log "Restarting PM2..."
pm2 restart finance-frontend >> "$LOG_FILE" 2>&1
log "PM2 status: $(pm2 show finance-frontend 2>/dev/null | grep status | head -1)"

log "Deployment complete! New: ${REMOTE:0:8}"
log "========== Auto-deploy finished =========="
SCRIPTEOF
chmod +x /home/ubuntu/auto_deploy_finance.sh
echo "  Auto-deploy script created."

echo "=== [Step 5] Creating systemd service for auto-deploy ==="
cat > /tmp/auto-deploy-finance.service << 'SVCEOF'
[Unit]
Description=Finance App Auto Deploy
After=network.target

[Service]
Type=oneshot
User=ubuntu
ExecStart=/bin/bash /home/ubuntu/auto_deploy_finance.sh
StandardOutput=journal
StandardError=journal
SVCEOF

cat > /tmp/auto-deploy-finance.timer << 'TIMEREOF'
[Unit]
Description=Run Finance Auto Deploy every 2 minutes
After=network.target

[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
Unit=auto-deploy-finance.service

[Install]
WantedBy=timers.target
TIMEREOF

sudo cp /tmp/auto-deploy-finance.service /etc/systemd/system/auto-deploy-finance.service
sudo cp /tmp/auto-deploy-finance.timer /etc/systemd/system/auto-deploy-finance.timer
sudo systemctl daemon-reload
sudo systemctl enable auto-deploy-finance.timer
sudo systemctl start auto-deploy-finance.timer
echo "  Auto-deploy timer created and started."

echo "=== [Step 6] Creating manual update script ==="
cat > /home/ubuntu/finance/update.sh << 'UPDATEEOF'
#!/bin/bash
set -e
PROJECT_DIR="/home/ubuntu/finance"
FRONTEND_DIR="${PROJECT_DIR}/frontend-next"
BACKEND_DIR="${PROJECT_DIR}/backend"

echo "=== Finance App Manual Update ==="
echo "Started at: $(date)"

echo "[1/4] Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin master

echo "[2/4] Updating backend deps..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
sudo systemctl restart finance-backend
echo "  Backend service: $(systemctl is-active finance-backend)"

echo "[3/4] Building frontend..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build

echo "[4/4] Restarting PM2..."
pm2 restart finance-frontend
echo "  PM2 finance-frontend: $(pm2 show finance-frontend 2>/dev/null | grep status | head -1)"

echo "=== Update Complete! $(date) ==="
UPDATEEOF
chmod +x /home/ubuntu/finance/update.sh
echo "  Manual update script created."

echo ""
echo "============================================="
echo " EC2 Setup Complete for Finance App!"
echo "============================================="
echo " Backend: port 8001 (systemd: finance-backend)"
echo " Nginx: configured for ppsfinance.duckdns.org"
echo " Auto-deploy: timer active (every 2 min)"
echo "============================================="
