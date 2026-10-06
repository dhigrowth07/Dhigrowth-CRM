import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { META_BASE_URL } from '../config/meta.constants.js';
import {
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  getCapturedLeads,
  sendLeadToGoogleSheets,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
} from '../services/crm/googleSheets.service.js';
import { getMetaWhatsAppInsights } from '../services/meta/metaInsights.service.js';
import {
  getMetaOAuthConfig,
  handleEmbeddedSignupCallback,
  disconnectMetaChannel,
} from '../services/meta/metaOAuth.service.js';
import {
  getTenantMetaConfig,
  saveTenantMetaConfig,
} from '../services/meta/tenantMetaManager.js';

/**
 * Integrations Controller
 * Manages Google Sheets CRM lead synchronization, Meta WhatsApp Graph API Insights,
 * multi-tenant WhatsApp credentials, and Meta Embedded Signup OAuth workflows.
 */

// ==========================================
// 1. Google Sheets Integration Handlers
// ==========================================

/**
 * GET /api/google-sheets/config & GET /api/integrations/google-sheets
 * Retrieve current Google Sheets sync configuration and Apps Script template
 */
export function getGoogleSheetsConfigController(req, res) {
  try {
    const config = getGoogleSheetsConfig();
    return res.status(200).json({
      success: true,
      config,
      scriptTemplate: GOOGLE_APPS_SCRIPT_TEMPLATE,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error getting Google Sheets config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/google-sheets/config & POST /api/integrations/google-sheets
 * Save or update Google Sheets sync webhook URL, target spreadsheet URL, and sync status
 */
export function saveGoogleSheetsConfigController(req, res) {
  try {
    const { webhookUrl, sheetUrl, enabled, sheetName } = req.body || {};
    const updated = saveGoogleSheetsConfig({
      webhookUrl: typeof webhookUrl === 'string' ? webhookUrl.trim() : undefined,
      sheetUrl: typeof sheetUrl === 'string' ? sheetUrl.trim() : undefined,
      enabled: enabled !== undefined ? Boolean(enabled) : undefined,
      sheetName: sheetName || undefined,
    });
    return res.status(200).json({
      success: true,
      config: updated,
      message: 'Google Sheets integration settings saved',
    });
  } catch (err) {
    console.error('[IntegrationsController] Error saving Google Sheets config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/google-sheets/leads & GET /api/leads/captured
 * Retrieve local audit log of leads captured and synced with Google Sheets
 */
export function getCapturedLeadsController(req, res) {
  try {
    const leads = getCapturedLeads();
    return res.status(200).json({
      success: true,
      leads,
      total: leads.length,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error getting captured leads:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/google-sheets/sync & POST /api/integrations/google-sheets/test
 * Test sync connection with Google Sheets webhook using sample or provided customer lead
 */
export async function syncLeadToGoogleSheetsController(req, res) {
  try {
    const testLead = {
      name: req.body?.name || 'Sri (Test Customer)',
      phone: req.body?.phone || '+91 97914 71277',
      service: req.body?.service || 'App Development & AI Automation',
      purpose: req.body?.purpose || 'Testing Google Sheets integration from Wappilot',
      channel: req.body?.channel || 'Wappilot Dashboard (Test)',
      workspaceId: req.body?.workspaceId || req.headers['x-workspace-id'] || env.DEFAULT_WORKSPACE_ID,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };
    const result = await sendLeadToGoogleSheets(testLead);
    return res.status(200).json({
      success: result.success,
      lead: result.lead,
      error: result.error,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error testing Google Sheets sync:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export const testGoogleSheetsSyncController = syncLeadToGoogleSheetsController;

/**
 * POST /api/integrations/google-sheets/record-lead
 * Record an inbound customer lead and forward directly to Google Sheets spreadsheet
 */
export async function recordGoogleSheetsLeadController(req, res) {
  try {
    const { name, phone, service, purpose, channel = 'WhatsApp', workspaceId } = req.body || {};
    const result = await sendLeadToGoogleSheets({
      name: name || 'Valued Customer',
      phone: phone || '',
      service: service || 'DhiGrowth IT Services',
      purpose: purpose || 'Customer requirement inquiry',
      channel,
      workspaceId: workspaceId || req.headers['x-workspace-id'] || env.DEFAULT_WORKSPACE_ID,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
    return res.status(200).json({
      success: result.success,
      lead: result.lead,
      error: result.error,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error recording lead to Google Sheets:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 2. Meta WhatsApp Insights Handlers
// ==========================================

/**
 * GET /api/meta-insights
 * Fetch official Meta WhatsApp Business Account phone health, quality rating, and messaging limits
 */
export async function getMetaInsightsController(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';
    const username = req.query.username || req.headers['x-username'] || 'sri';
    const timeRange = req.query.timeRange || '30d';

    const insights = await getMetaWhatsAppInsights({ workspaceId, username, timeRange });
    return res.status(200).json(insights);
  } catch (err) {
    console.error('[IntegrationsController] Error getting Meta insights:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 3. Meta Credentials Manager Handlers
// ==========================================

/**
 * GET /api/meta-config
 * Retrieve active or tenant-specific WhatsApp Cloud API credentials
 */
export function getMetaConfigController(req, res) {
  try {
    const { workspaceId, userId, username, slug } = req.query || {};
    const config = getTenantMetaConfig({ workspaceId, userId, username, slug });
    return res.status(200).json(config);
  } catch (err) {
    console.error('[IntegrationsController] Error getting Meta config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/meta-config
 * Save tenant Meta WhatsApp credentials (Phone Number ID, Access Token, WABA ID, Verify Token)
 */
export async function saveMetaConfigController(req, res) {
  try {
    const {
      phoneNumberId,
      accessToken,
      wabaId,
      verifyToken,
      workspaceId,
      userId,
      username,
      slug,
      updatedBy = 'User',
    } = req.body || {};

    let supabaseClient = supabase;
    if (!supabaseClient) {
      const supabaseUrl = env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const { createClient } = await import('@supabase/supabase-js');
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      }
    }

    const saved = await saveTenantMetaConfig({
      workspaceId,
      userId: userId || username || slug || updatedBy,
      username: username || updatedBy,
      slug,
      phoneNumberId,
      accessToken,
      wabaId,
      verifyToken,
      updatedBy,
      supabaseClient,
    });

    return res.status(200).json({
      success: true,
      message: `Meta WhatsApp credentials updated for "${updatedBy}"!`,
      config: saved,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error saving Meta config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/meta-config/test
 * Verify connection to Meta Graph API using configured or supplied credentials
 */
export async function testMetaConfigController(req, res) {
  try {
    let {
      phoneNumberId,
      accessToken,
      workspaceId,
      userId,
      username,
      slug,
    } = req.body || {};

    if (!phoneNumberId || !accessToken) {
      const userConfig = getTenantMetaConfig({ workspaceId, userId, username, slug });
      phoneNumberId = phoneNumberId || userConfig.phoneNumberId;
      accessToken = accessToken || userConfig.accessToken;
    }

    phoneNumberId = phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID;
    accessToken = accessToken || env.META_WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Phone Number ID and Meta Access Token are required to test connection.',
      });
    }

    const testUrl = `${META_BASE_URL}/${phoneNumberId}?access_token=${accessToken}`;
    const metaRes = await fetch(testUrl);
    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      return res.status(400).json({
        success: false,
        error: metaData.error?.message || 'Meta API returned an error',
        details: metaData,
      });
    }

    return res.status(200).json({
      success: true,
      data: metaData,
      message: `Connected successfully to Meta WhatsApp! Verified Name/Number: ${metaData.verified_name || metaData.display_phone_number || metaData.id}`,
    });
  } catch (err) {
    console.error('[IntegrationsController] Error testing Meta config connection:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ==========================================
// 4. Meta Embedded Signup OAuth Handlers
// ==========================================

/**
 * GET /api/meta/oauth/config
 * Retrieve Meta App ID and configuration for frontend Embedded Signup popup
 */
export function getMetaOAuthConfigController(req, res) {
  try {
    const config = getMetaOAuthConfig();
    return res.status(200).json({ success: true, config });
  } catch (err) {
    console.error('[IntegrationsController] Error getting Meta OAuth config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/meta/embedded-signup & POST /api/meta/embedded-signup/callback
 * Handle Meta OAuth code exchange, register permanent token, and subscribe webhook
 */
export async function handleEmbeddedSignupController(req, res) {
  try {
    const result = await handleEmbeddedSignupCallback(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error('[IntegrationsController] Error handling Meta embedded signup:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/meta/disconnect
 * Disconnect and unlink Meta WhatsApp channel from workspace
 */
export async function disconnectMetaChannelController(req, res) {
  try {
    const result = await disconnectMetaChannel(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error('[IntegrationsController] Error disconnecting Meta channel:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default {
  getGoogleSheetsConfigController,
  saveGoogleSheetsConfigController,
  getCapturedLeadsController,
  syncLeadToGoogleSheetsController,
  testGoogleSheetsSyncController,
  recordGoogleSheetsLeadController,
  getMetaInsightsController,
  getMetaConfigController,
  saveMetaConfigController,
  testMetaConfigController,
  getMetaOAuthConfigController,
  handleEmbeddedSignupController,
  disconnectMetaChannelController,
};
