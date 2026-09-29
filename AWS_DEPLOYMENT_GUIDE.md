# ☁️ AWS Production Deployment Guide for WAP PILOT

This repository is fully configured for deployment on Amazon Web Services (AWS). Follow the recommended approach below based on your architecture preferences.

---

## 🏆 Recommended: AWS EC2 (Ubuntu 22.04 / 24.04 LTS)

**Why EC2?**
- Perfect for persistent JSON files (`tenants.json`, `metaConfigs.json`, `campaignsStore.json`, `subscriptions.json`).
- Handles long-lived connections, background intervals, and instant Meta Webhooks without cold starts.
- Includes automatic PM2 process monitoring and Free SSL via Certbot.

### Step 1: Launch an EC2 Instance
1. Log into your **AWS Management Console** → **EC2** → **Launch Instance**.
2. **Name**: `wappilot-prod`
3. **OS Image**: **Ubuntu Server 22.04 LTS** or **24.04 LTS** (64-bit x86).
4. **Instance Type**: `t3.small` or `t3.medium` (or `t2.small` for minimum 2GB RAM to support Node builds).
5. **Key Pair**: Select or create an SSH key pair (`.pem`).
6. **Network / Security Group**:
   - Check **Allow SSH traffic** (Port 22)
   - Check **Allow HTTP traffic from the internet** (Port 80)
   - Check **Allow HTTPS traffic from the internet** (Port 443)
7. Click **Launch Instance**.

### Step 2: Connect and Provision the Server
1. Connect via SSH from your terminal:
   ```bash
   ssh -i your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
   ```

2. Clone your repository:
   ```bash
   git clone <YOUR-GITHUB-REPO-URL> wappilot
   cd wappilot
   ```

3. Configure your production environment variables:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *(Fill in your Meta WhatsApp access token, phone ID, WABA ID, Supabase URL, Gemini API key, Razorpay keys, etc.)*

4. Run the automated provisioning script:
   ```bash
   chmod +x setup-ec2.sh deploy.sh
   sudo ./setup-ec2.sh
   ```

### Step 3: Link Your Domain & Enable Free SSL (HTTPS)
1. Point your domain DNS **A Record** (e.g., `api.yourdomain.com` or `app.yourdomain.com`) to your **EC2 Elastic IP / Public IP**.
2. Update `/etc/nginx/sites-available/wappilot` with your actual domain name:
   ```bash
   sudo nano /etc/nginx/sites-available/wappilot
   # Replace your-domain.com with your actual domain
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. Issue free Let's Encrypt SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### Step 4: Verify Live Service & Webhook
- **Health Check**: `https://yourdomain.com/health`
- **WhatsApp Webhook URL**: `https://yourdomain.com/webhook`
- **Verify Token**: `dhigrowth_webhook_secret_2026` (or the value set in your `.env`)

---

## ⚡ Option 2: AWS App Runner (Serverless Container)

AWS App Runner builds and deploys directly from your GitHub repository using [`apprunner.yaml`](./apprunner.yaml) or your container image.

1. In AWS Console, search for **AWS App Runner** → **Create service**.
2. **Source**: Select **Source code repository** (connect your GitHub repo) or **Container registry** (ECR).
3. **Branch**: `main`
4. **Configuration file**: Select **Use a configuration file** (it automatically detects [`apprunner.yaml`](./apprunner.yaml)).
5. Under **Environment variables**, add all keys from your `.env`.
6. Click **Create & Deploy**.

---

## 🐳 Option 3: Docker Compose on EC2 / ECS

If you prefer running via Docker on any AWS Linux VM:

```bash
# 1. Build and run container in background
docker compose up -d --build

# 2. View container logs
docker compose logs -f

# 3. Check health
curl http://localhost/health
```

---

## 🔄 Daily Deployment & Updates

Whenever you push new code to GitHub, simply SSH into your server and run:
```bash
./deploy.sh
```
This automatically pulls the latest commit, updates npm packages, rebuilds the frontend, and reloads PM2 with zero downtime.
