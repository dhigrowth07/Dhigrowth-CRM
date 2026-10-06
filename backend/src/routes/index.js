import { Router } from 'express';
import { env } from '../config/env.js';
import { upload, saveBase64Media } from '../middlewares/upload.middleware.js';

import webhookRoutes from './webhook.routes.js';
import messagesRoutes from './messages.routes.js';
import campaignsRoutes from './campaigns.routes.js';
import templatesRoutes from './templates.routes.js';
import automationsRoutes from './automations.routes.js';
import aiRoutes from './ai.routes.js';
import billingRoutes from './billing.routes.js';
import invoicesRoutes from './invoices.routes.js';
import authRoutes from './auth.routes.js';
import integrationsRoutes from './integrations.routes.js';

const router = Router();

/**
 * Master Router
 * Aggregates all modular route domains, system health diagnostics,
 * and media file upload handling.
 */

// ==========================================
// 1. Health Diagnostics
// ==========================================
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'online',
    service: 'Dhigrowth CRM Omnichannel Webhook Gateway',
    version: '2.0.0',
    gitCommit: process.env.RENDER_GIT_COMMIT || 'local',
    gitBranch: process.env.RENDER_GIT_BRANCH || 'main',
    timestamp: new Date().toISOString(),
    channels: ['whatsapp', 'instagram', 'messenger', 'line'],
    supabaseConnected: Boolean(env.VITE_SUPABASE_URL || env.SUPABASE_URL),
    verifyTokenConfigured: Boolean(env.META_WHATSAPP_VERIFY_TOKEN),
  });
});

// ==========================================
// 2. Media Upload Endpoints
// ==========================================

// Base64 Media Upload (Template image/header creator)
router.post('/api/upload/image', (req, res) => {
  try {
    const { data, filename } = req.body || {};
    if (!data) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const saved = saveBase64Media({ data, filename });
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const fullUrl = `${protocol}://${host}${saved.relativeUrl}`;

    console.log(`📸 [Upload API] Image saved: ${saved.filename} (${(saved.sizeBytes / 1024).toFixed(1)} KB) -> ${fullUrl}`);

    return res.status(200).json({
      success: true,
      url: fullUrl,
      relativeUrl: saved.relativeUrl,
      filename: saved.filename,
    });
  } catch (err) {
    console.error('[Upload API] Error saving image:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Multipart Form-Data Media Upload (File attachments, PDFs, audio, video)
router.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    console.log(`📎 [Upload API] File uploaded: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB) -> ${fullUrl}`);

    return res.status(200).json({
      success: true,
      url: fullUrl,
      relativeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('[Upload API] Error uploading file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Domain Route Modules Assembly
// ==========================================
router.use(webhookRoutes);
router.use(messagesRoutes);
router.use(campaignsRoutes);
router.use(templatesRoutes);
router.use(automationsRoutes);
router.use(aiRoutes);
router.use(billingRoutes);
router.use(invoicesRoutes);
router.use(authRoutes);
router.use(integrationsRoutes);

export default router;
