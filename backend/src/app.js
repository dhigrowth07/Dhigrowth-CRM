import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import masterRouter from './routes/index.js';
import { UPLOADS_DIR } from './middlewares/upload.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express Application Configuration
 * Configures CORS, parsers, static file delivery, API routes, and error handling.
 */
const app = express();

// Trust reverse proxy (Render, Cloudflare, Nginx)
app.set('trust proxy', 1);

// 1. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-username'],
  })
);

// 2. Request Parsers (Supports high-resolution base64 media uploads & templates up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Static Media Directory for Uploaded Files
const frontendUploads = path.resolve(__dirname, '../../frontend/public/uploads');
const effectiveUploadsDir = fs.existsSync(frontendUploads) ? frontendUploads : UPLOADS_DIR;
if (!fs.existsSync(effectiveUploadsDir)) {
  fs.mkdirSync(effectiveUploadsDir, { recursive: true });
}
app.use('/uploads', express.static(effectiveUploadsDir));

// 4. Mount Master Router (Health, Upload, and All Domain APIs)
app.use(masterRouter);

// 5. Production Static Frontend SPA Delivery (Single container / Unified deployment)
const distCandidates = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../dist'),
];
const distPath = distCandidates.find((dir) => fs.existsSync(dir));

if (distPath) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/webhook') ||
      req.path === '/health' ||
      req.path.startsWith('/pay')
    ) {
      return next();
    }
    if (req.method === 'GET') {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  // Gateway Welcome Page when frontend SPA is not built locally
  app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
  <head><title>WAP PILOT - Webhook Gateway</title></head>
  <body style="font-family:system-ui,-apple-system,sans-serif;background:#F9FAFB;color:#101828;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
    <div style="background:#fff;border:1px solid #EAECF0;border-radius:24px;padding:36px;max-width:520px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🚀</div>
      <h2 style="margin:0 0 8px 0;color:#7C3AED;">WAP PILOT Webhook Gateway is Live</h2>
      <p style="color:#475467;font-size:14px;line-height:1.5;">Your backend server and Meta WhatsApp Cloud API webhooks are running smoothly.</p>
      <div style="background:#F4F0FD;border:1px solid #E9D8FD;border-radius:12px;padding:12px;text-align:left;font-size:13px;margin:20px 0;color:#344054;">
        <div><strong>Webhook URL:</strong> <code>/webhook</code></div>
        <div style="margin-top:4px;"><strong>Health Status:</strong> <a href="/health" style="color:#7C3AED;">/health</a></div>
      </div>
      <p style="color:#667085;font-size:12px;margin:0;">To render the Web Dashboard on this domain, run:<br/><code style="background:#F2F4F7;padding:3px 6px;border-radius:6px;font-weight:bold;color:#101828;">npm run build</code> in the frontend folder.</p>
    </div>
  </body>
</html>`);
  });
}

// 6. 404 Route Not Found Handler
app.use(notFoundHandler);

// 7. Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
