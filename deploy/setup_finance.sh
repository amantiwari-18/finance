#!/bin/bash
# =============================================================
# Finance App - Full EC2 Setup Script
# Run as: bash /tmp/setup_finance.sh
# =============================================================

set -e
PROJECT_NAME="finance"
REPO_URL="git@github.com:amantiwari-18/finance.git"
DOMAIN="ppsfinance.duckdns.org"
FRONTEND_PORT=3001
BACKEND_PORT=8001
DB_NAME="finance_tracker"
DB_USER="postgres"

echo "=============================================="
echo " Finance App Deployment Starting..."
echo "=============================================="

# ---- 1. Clone Repository ----
echo "[1/8] Cloning repository..."
cd /home/ubuntu
if [ -d "/home/ubuntu/${PROJECT_NAME}" ]; then
    echo "  Directory exists, pulling latest..."
    cd /home/ubuntu/${PROJECT_NAME}
    git pull origin master
else
    git clone ${REPO_URL} /home/ubuntu/${PROJECT_NAME}
    cd /home/ubuntu/${PROJECT_NAME}
fi

# ---- 2. Setup Backend ----
echo "[2/8] Setting up Python backend..."
cd /home/ubuntu/${PROJECT_NAME}/backend

# Create virtualenv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create production .env
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_tracker
SECRET_KEY=finance_super_secret_key_change_in_prod_2024_abc123xyz
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=5256000
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=465
SMTP_USER=AKIAYK4KMZ36HDTXRGML
SMTP_PASSWORD=BCmHWHPbW3AnBDeVHZxos2gqArnUVW5l+/+/GO2q/qkn
SMTP_FROM=noreply@nrce-diagnostics.org
SMTP_ENABLED=true
SMTP_TLS=false
SMTP_USE_SSL=true
SCHEDULER_ENABLED=true
DAILY_SUMMARY_TIME=21:00
DAILY_BUDGET_CHECK_TIME=08:00
RECURRING_CHECK_TIME=06:00
ENVEOF

deactivate
echo "  Backend setup complete."

# ---- 3. Create PostgreSQL Database ----
echo "[3/8] Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || echo "  Database already exists."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null || true
echo "  Database ready."

# ---- 4. Setup Frontend ----
echo "[4/8] Setting up Next.js frontend..."
cd /home/ubuntu/${PROJECT_NAME}/frontend-next

# Create production .env.local
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://ppsfinance.duckdns.org/api
ENVEOF

# Install Node dependencies and build
npm install
npm run build
echo "  Frontend built."

# ---- 5. Create systemd service for backend ----
echo "[5/8] Creating systemd service for backend..."
sudo tee /etc/systemd/system/finance-backend.service > /dev/null << 'SERVICEEOF'
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

sudo systemctl daemon-reload
sudo systemctl enable finance-backend
sudo systemctl restart finance-backend
echo "  Backend service started."

# ---- 6. Setup PM2 for frontend ----
echo "[6/8] Setting up PM2 for frontend..."
cd /home/ubuntu/${PROJECT_NAME}/frontend-next

# Start with PM2
pm2 delete finance-frontend 2>/dev/null || true
pm2 start npm --name "finance-frontend" -- start -- --port ${FRONTEND_PORT}
pm2 save
echo "  Frontend PM2 started."

# ---- 7. Configure Nginx ----
echo "[7/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/finance > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name ppsfinance.duckdns.org;

    # Redirect HTTP to HTTPS (Certbot will update this)
    location / {
        proxy_pass http://localhost:3001;
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

    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINXEOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/finance /etc/nginx/sites-enabled/finance
sudo nginx -t
sudo systemctl reload nginx
echo "  Nginx configured."

# ---- 8. Get SSL certificate ----
echo "[8/8] Getting SSL certificate with Certbot..."
sudo certbot --nginx -d ppsfinance.duckdns.org --non-interactive --agree-tos --email admin@nrce-diagnostics.org --redirect 2>/dev/null || echo "  Certbot may need manual intervention or domain not yet propagated."
echo "  SSL setup attempted."

echo "=============================================="
echo " Finance App Setup Complete!"
echo "=============================================="
echo " Frontend:  http://localhost:3001"
echo " Backend:   http://localhost:8001"
echo " Domain:    https://ppsfinance.duckdns.org"
echo "=============================================="
