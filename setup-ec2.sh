#!/bin/bash
# ==============================================================================
# AWS EC2 Automated Provisioning Script for WAP PILOT (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
# Run as: chmod +x setup-ec2.sh && sudo ./setup-ec2.sh
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw build-essential

echo "📦 [2/6] Installing Node.js 20 LTS & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

echo "🔒 [3/6] Configuring Firewall (UFW)..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo "🌐 [4/6] Installing & Setting Up Nginx & Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

# Remove default site and copy wappilot config
rm -f /etc/nginx/sites-enabled/default
if [ -f "nginx.conf" ]; then
    cp nginx.conf /etc/nginx/sites-available/wappilot
    ln -sf /etc/nginx/sites-available/wappilot /etc/nginx/sites-enabled/wappilot
    nginx -t && systemctl reload nginx
fi

echo "📁 [5/6] Creating logs folder & Installing Dependencies..."
mkdir -p logs
npm install
npm run build --workspace=frontend

echo "⚙️ [6/6] Launching WAP PILOT with PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u $(whoami) --hp $HOME

echo ""
echo "================================================================================"
echo "✅ WAP PILOT is now running on your AWS EC2 instance!"
echo "   - Status:      pm2 status"
echo "   - View Logs:   pm2 logs wappilot-server"
echo "   - Restart:     pm2 restart wappilot-server"
echo "================================================================================"
echo "👉 To activate FREE SSL (HTTPS) for your domain, run:"
echo "   sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
echo "================================================================================"
