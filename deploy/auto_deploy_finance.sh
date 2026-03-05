#!/bin/bash
# =============================================================
# Finance App - Auto Deploy Script
# Runs every 2 minutes via systemd timer
# Logs to: /home/ubuntu/auto_deploy_finance.log
# =============================================================

PROJECT_NAME="finance"
PROJECT_DIR="/home/ubuntu/${PROJECT_NAME}"
LOG_FILE="/home/ubuntu/auto_deploy_finance.log"
FRONTEND_DIR="${PROJECT_DIR}/frontend-next"
BACKEND_DIR="${PROJECT_DIR}/backend"
MAX_LOG_SIZE=5242880  # 5MB

# Rotate log if too big
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "========== Auto-deploy check started =========="

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log "ERROR: Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Fetch latest from remote
git fetch origin master >> "$LOG_FILE" 2>&1

# Compare local vs remote HEAD
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/master 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "No new commits. Local and remote are in sync (${LOCAL:0:8})."
    log "========== Check complete =========="
    exit 0
fi

log "New commits detected! Local: ${LOCAL:0:8} → Remote: ${REMOTE:0:8}"
log "Starting deployment..."

# --- Pull latest code ---
log "Pulling latest code..."
git pull origin master >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: git pull failed!"
    exit 1
fi

# --- Backend: install dependencies & restart service ---
log "Updating backend dependencies..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install -r requirements.txt >> "$LOG_FILE" 2>&1
deactivate

log "Restarting backend service..."
sudo systemctl restart finance-backend >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: Backend service failed to restart!"
else
    log "Backend service restarted successfully."
fi

# --- Frontend: install dependencies, rebuild, restart PM2 ---
log "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install >> "$LOG_FILE" 2>&1

log "Rebuilding frontend..."
npm run build >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: Frontend build failed!"
    exit 1
fi

log "Restarting PM2 process..."
pm2 restart finance-frontend >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: PM2 restart failed!"
else
    log "PM2 restarted successfully."
fi

log "Deployment complete! New version: ${REMOTE:0:8}"
log "========== Auto-deploy finished =========="
