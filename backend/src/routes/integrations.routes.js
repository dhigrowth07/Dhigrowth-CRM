import { Router } from 'express';
import {
  getGoogleSheetsConfigController,
  saveGoogleSheetsConfigController,
  getCapturedLeadsController,
  syncLeadToGoogleSheetsController,
  recordGoogleSheetsLeadController,
  getMetaInsightsController,
  getMetaConfigController,
  saveMetaConfigController,
  testMetaConfigController,
  getMetaOAuthConfigController,
  handleEmbeddedSignupController,
  disconnectMetaChannelController,
} from '../controllers/integrations.controller.js';

const router = Router();

/**
 * Integrations Routes
 * Handles Google Sheets CRM lead synchronization, Meta WhatsApp Graph API Insights,
 * multi-tenant WhatsApp credentials manager, and Meta Embedded Signup OAuth workflows.
 */

// 1. Google Sheets Configuration & Script Template
router.get('/api/google-sheets/config', getGoogleSheetsConfigController);
router.get('/api/integrations/google-sheets', getGoogleSheetsConfigController);
router.post('/api/google-sheets/config', saveGoogleSheetsConfigController);
router.post('/api/integrations/google-sheets', saveGoogleSheetsConfigController);

// 2. Google Sheets Leads & Sync
router.get('/api/google-sheets/leads', getCapturedLeadsController);
router.get('/api/leads/captured', getCapturedLeadsController);
router.post('/api/google-sheets/sync', syncLeadToGoogleSheetsController);
router.post('/api/integrations/google-sheets/test', syncLeadToGoogleSheetsController);
router.post('/api/integrations/google-sheets/record-lead', recordGoogleSheetsLeadController);

// 3. Meta WhatsApp Business Account Official Insights
router.get('/api/meta-insights', getMetaInsightsController);

// 4. Meta Credentials Manager (Per-tenant / workspace isolated)
router.get('/api/meta-config', getMetaConfigController);
router.post('/api/meta-config', saveMetaConfigController);
router.post('/api/meta-config/test', testMetaConfigController);

// 5. Meta Embedded Signup & OAuth Onboarding
router.get('/api/meta/oauth/config', getMetaOAuthConfigController);
router.post('/api/meta/embedded-signup', handleEmbeddedSignupController);
router.post('/api/meta/embedded-signup/callback', handleEmbeddedSignupController);
router.post('/api/meta/disconnect', disconnectMetaChannelController);

export default router;
