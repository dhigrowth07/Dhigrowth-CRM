import { env } from '../config/env.js';
import {
  getWorkspaceCampaigns,
  sendCampaignMessages,
  createBroadcastCampaign,
  executeBroadcast,
  updateCampaign,
  deleteCampaign,
  cancelScheduledCampaign,
  sendTestBroadcast,
  sendDirectTemplateMessage,
} from '../services/campaigns/broadcast.service.js';

/**
 * GET /api/campaigns and GET /api/broadcasts
 * Retrieve all broadcast campaigns for a workspace
 */
export function getCampaigns(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const campaigns = getWorkspaceCampaigns(workspaceId);
    return res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (err) {
    console.error('[CampaignsController] Error getting campaigns:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/campaigns/send and POST /api/broadcasts/send-messages
 * Launch immediate campaign broadcast to recipient audience
 */
export async function sendCampaign(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const payload = {
      workspaceId,
      ...req.body,
    };

    const result = await sendCampaignMessages(payload);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[CampaignsController] Error sending campaign:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/send-template-message
 * Direct First-Time Meta Template Dispatch to unlock 24-hour window
 */
export async function sendTemplateMessage(req, res) {
  try {
    const {
      recipientPhone,
      phone,
      templateName = 'hi',
      contactName = 'Valued Client',
      conversationId,
      workspaceId = req.headers['x-workspace-id'] || env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',
      company = 'DhiGrowth IT Services',
    } = req.body || {};

    const targetPhone = recipientPhone || phone;
    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'recipientPhone is required' });
    }

    const result = await sendDirectTemplateMessage({
      workspaceId,
      recipientPhone: targetPhone,
      templateName,
      contactName,
      company,
      conversationId,
    });

    return res.status(200).json({
      success: result.success,
      deliveredToWhatsApp: result.success,
      messageId: result.messageId,
      templateName: result.templateUsed,
      status: result.status,
      error: result.error,
    });
  } catch (err) {
    console.error('[CampaignsController] Error sending template message:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/broadcasts/create
 * Create a draft or scheduled broadcast campaign
 */
export async function createCampaign(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const campaign = await createBroadcastCampaign({
      workspaceId,
      ...req.body,
    });

    return res.status(200).json({ success: true, campaign });
  } catch (err) {
    console.error('[CampaignsController] Error creating campaign:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/broadcasts/:id/send-now
 * Execute a drafted campaign immediately
 */
export async function executeCampaignNow(req, res) {
  try {
    const campaignId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const campaign = await executeBroadcast(workspaceId, campaignId);
    return res.status(200).json({ success: true, campaign });
  } catch (err) {
    console.error('[CampaignsController] Error executing broadcast:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/broadcasts/:id
 * Update campaign details or schedule
 */
export function updateCampaignById(req, res) {
  try {
    const campaignId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const updated = updateCampaign(workspaceId, campaignId, req.body || {});
    return res.status(200).json({ success: true, campaign: updated });
  } catch (err) {
    console.error('[CampaignsController] Error updating campaign:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/broadcasts/:id
 * Delete a campaign record
 */
export function deleteCampaignById(req, res) {
  try {
    const campaignId = req.params.id;
    const workspaceId =
      req.query?.workspaceId ||
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = deleteCampaign(workspaceId, campaignId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[CampaignsController] Error deleting campaign:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/broadcasts/:id/cancel
 * Cancel a scheduled broadcast
 */
export function cancelCampaignById(req, res) {
  try {
    const campaignId = req.params.id;
    const workspaceId =
      req.body?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = cancelScheduledCampaign(workspaceId, campaignId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[CampaignsController] Error cancelling campaign:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/broadcasts/test-send
 * Send single test message of a campaign to admin
 */
export async function sendTestBroadcastMessage(req, res) {
  try {
    const result = await sendTestBroadcast(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error('[CampaignsController] Error sending test broadcast:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const getBroadcasts = getCampaigns;
export const createBroadcast = createCampaign;
export const sendBroadcast = sendCampaign;
export const sendTemplateMessageDirect = sendTemplateMessage;

export default {
  getCampaigns,
  getBroadcasts,
  sendCampaign,
  sendBroadcast,
  sendTemplateMessage,
  createCampaign,
  createBroadcast,
  executeCampaignNow,
  updateCampaignById,
  deleteCampaignById,
  cancelCampaignById,
  sendTestBroadcastMessage,
};
