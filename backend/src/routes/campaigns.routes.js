import { Router } from 'express';
import {
  getCampaigns,
  sendCampaign,
  sendTemplateMessageDirect,
} from '../controllers/campaigns.controller.js';

const router = Router();

/**
 * Campaigns & Broadcast Routes
 * Handles campaign history listing, bulk batch broadcasting to contact segments,
 * and direct one-click WhatsApp approved template dispatch.
 */

// 1. Campaign History & Analytics
router.get('/api/campaigns', getCampaigns);

// 2. Broadcast / Campaign Message Dispatch (Supports both standard and legacy broadcast routes)
router.post('/api/campaigns/send', sendCampaign);
router.post('/api/broadcasts/send-messages', sendCampaign);

// 3. Direct Template Message Sending (Single contact template dispatch)
router.post('/api/send-template-message', sendTemplateMessageDirect);

export default router;
