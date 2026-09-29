#!/bin/bash
# ==============================================================================
# 1-Click Code Update & Fast Deployment Script for AWS EC2
# Run as: ./deploy.sh
# ==============================================================================

set -e

echo "🚀 [1/4] Pulling latest changes from git..."
git pull origin main

echo "📦 [2/4] Installing dependencies..."
npm install

echo "⚡ [3/4] Rebuilding frontend bundle..."
npm run build --workspace=frontend

echo "🔄 [4/4] Reloading PM2 server instance..."
pm2 reload ecosystem.config.cjs --env production

echo ""
echo "✅ Successfully deployed latest updates! Server is live."
pm2 status wappilot-server
