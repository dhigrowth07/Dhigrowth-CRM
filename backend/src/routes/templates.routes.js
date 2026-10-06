import { Router } from 'express';
import {
  getTemplatesController,
  createTemplateController,
  syncTemplatesController,
  getTemplateStatusController,
  broadcastTemplateToAllController,
} from '../controllers/templates.controller.js';

const router = Router();

/**
 * WhatsApp Message Templates Routes
 * Handles template listing, Meta Graph API sync, new template creation/submission,
 * approval status verification, and broadcasting templates to all contacts.
 */

// 1. List All Templates (Meta Graph API + local presets)
router.get('/api/templates', getTemplatesController);

// 2. Create & Submit Template for Meta Approval
router.post('/api/templates', createTemplateController);
router.post('/api/templates/create', createTemplateController);

// 3. Force Sync Templates from Meta WhatsApp Cloud API
router.post('/api/templates/sync', syncTemplatesController);

// 4. Check Individual Template Approval Status
router.get('/api/templates/:name/status', getTemplateStatusController);

// 5. Broadcast Approved Template to All Contacts
router.post('/api/templates/broadcast-all', broadcastTemplateToAllController);

export default router;
