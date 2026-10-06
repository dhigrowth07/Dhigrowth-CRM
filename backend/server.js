import app from './src/app.js';
import { env } from './src/config/env.js';

import { initTenantMetaStore } from './src/services/meta/tenantMetaManager.js';
import { initWalletStore } from './src/services/billing/wallet.service.js';
import { initTemplateStore } from './src/services/campaigns/template.service.js';
import { initBroadcastStore } from './src/services/campaigns/broadcast.service.js';
import { initAutomationsStore } from './src/services/campaigns/automations.service.js';
import { initDripStore } from './src/services/campaigns/drip.service.js';

/**
 * Main Server Entry Point
 * Initializes persistent stores, launches Express HTTP listener,
 * and maintains Keep-Alive heartbeat for cloud deployments.
 */

// 1. Initialize self-healing persistent data stores
try {
  initTenantMetaStore();
  initWalletStore();
  initTemplateStore();
  initBroadcastStore();
  initAutomationsStore();
  initDripStore();
  console.log('📦 [Server] All JSON data stores initialized successfully');
} catch (err) {
  console.error('⚠️ [Server] Notice during data store initialization:', err.message);
}

// 2. Configure listening port
const PORT = process.env.PORT || env.PORT || 4000;

// 3. Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`🚀 Dhigrowth CRM Modular Backend running on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🔐 Verify Token: "${env.META_WHATSAPP_VERIFY_TOKEN || 'dhigrowth_webhook_secret_2026'}"`);
  console.log(`⚡ Health Check: http://localhost:${PORT}/health`);
  console.log(`================================================================\n`);

  // Automatic Keep-Alive ping to prevent cloud container sleeping (Render / Railway)
  const RENDER_APP_URL = env.VITE_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || env.BACKEND_URL;
  if (RENDER_APP_URL) {
    const cleanUrl = RENDER_APP_URL.replace(/\/+$/, '');
    setInterval(async () => {
      try {
        await fetch(`${cleanUrl}/health`);
        console.log(`⏰ [KeepAlive] Heartbeat ping sent to ${cleanUrl}/health`);
      } catch (err) {
        console.warn('⏰ [KeepAlive] Ping note:', err.message);
      }
    }, 8 * 60 * 1000); // Ping every 8 minutes
  }
});

// 4. Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🛑 [Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ [Server] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 [Server] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ [Server] HTTP server closed.');
    process.exit(0);
  });
});

export default server;
