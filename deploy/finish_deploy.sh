#!/bin/bash
# Fix DB auth and finish remaining deployment steps
set -e

DB_PASS="financeDB2024secure"
PROJECT_DIR="/home/ubuntu/finance"
FRONTEND_DIR="$PROJECT_DIR/frontend-next"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "=== [Fix 1] Set postgres password ==="
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASS';"
echo "  Password set."

echo "=== [Fix 2] Update backend .env with correct DB password ==="
cat > "$BACKEND_DIR/.env" << ENVEOF
DATABASE_URL=postgresql://postgres:${DB_PASS}@localhost:5432/finance_tracker
SECRET_KEY=finance_super_secret_key_pps_2024_abc123xyz_openssl_rand
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
echo "  .env updated."

echo "=== [Fix 3] Restart backend service ==="
sudo systemctl restart finance-backend
sleep 3
echo "  Backend status: $(systemctl is-active finance-backend)"
sudo journalctl -u finance-backend --no-pager -n 10

echo "=== [Step 4] Create frontend .env.local ==="
cat > "$FRONTEND_DIR/.env.local" << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://ppsfinance.duckdns.org/api
ENVEOF
echo "  Frontend .env.local created."

echo "=== [Step 5] Build Next.js frontend ==="
cd "$FRONTEND_DIR"
npm install 2>&1
echo "  Dependencies installed."
npm run build 2>&1
echo "  Build complete."

echo "=== [Step 6] Start frontend with PM2 on port 3001 ==="
export PORT=3001
pm2 delete finance-frontend 2>/dev/null || true
pm2 start npm --name "finance-frontend" -- start -- --port 3001
pm2 save
echo "  PM2 finance-frontend started."
sleep 3
pm2 show finance-frontend | grep -E 'status|port|pid'

echo "=== [Step 7] Get SSL certificate ==="
sudo certbot --nginx -d ppsfinance.duckdns.org \
    --non-interactive \
    --agree-tos \
    --email admin@nrce-diagnostics.org \
    --redirect 2>&1 || echo "  Certbot failed - may need manual retry"

echo "=== [Step 8] Verify all services ==="
echo ""
echo "--- Port bindings ---"
ss -tlnp | grep -E '3000|3001|8000|8001|80|443'
echo ""
echo "--- finance-backend service ---"
systemctl is-active finance-backend
echo "--- auto-deploy-finance timer ---"
systemctl is-active auto-deploy-finance.timer
echo "--- ecom-backend (should be untouched) ---"
systemctl is-active ecom-backend
echo "--- nginx ---"
systemctl is-active nginx

echo ""
echo "============================================="
echo " DEPLOYMENT COMPLETE!"
echo "============================================="
echo " New Finance App:  https://ppsfinance.duckdns.org"
echo " Existing Ecom:    https://ppsecom.duckdns.org"
echo "============================================="
