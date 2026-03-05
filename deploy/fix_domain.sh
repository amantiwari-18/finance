#!/bin/bash
set -e

DOMAIN="ppsjfinance.duckdns.org"

echo "=== [1] Update Nginx config for finance ==="
cat > /tmp/finance-nginx.conf << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINXEOF

sudo cp /tmp/finance-nginx.conf /etc/nginx/sites-available/finance
sudo nginx -t && sudo systemctl reload nginx
echo "  Nginx updated for ${DOMAIN}"

echo "=== [2] Update frontend .env.local ==="
echo "NEXT_PUBLIC_API_URL=https://${DOMAIN}" > /home/ubuntu/finance/frontend-next/.env.local
cat /home/ubuntu/finance/frontend-next/.env.local

echo "=== [3] Rebuild frontend ==="
cd /home/ubuntu/finance/frontend-next
npm run build 2>&1

echo "=== [4] Restart PM2 ==="
pm2 restart finance-frontend
echo "  Frontend restarted."

echo "=== [5] Get SSL certificate ==="
sudo certbot --nginx -d ${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email admin@nrce-diagnostics.org \
    --redirect 2>&1 || echo "  Certbot failed - check manually"

echo "=== [6] Verify ==="
echo "Nginx sites:"
ls /etc/nginx/sites-enabled/
echo ""
echo "Finance backend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/)"
echo "Finance frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/)"
echo "Ecom frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"

echo ""
echo "=== DONE! ==="
echo "  ppsecom.duckdns.org     -> ecom (3000/8000)"
echo "  ppsjfinance.duckdns.org -> finance (3001/8001)"
