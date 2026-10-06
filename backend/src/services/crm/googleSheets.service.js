import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');

const CONFIG_FILE = path.join(DATA_DIR, 'googleSheetsConfig.json');
const LEADS_FILE = path.join(DATA_DIR, 'leadsCollected.json');

// Default initial config
const DEFAULT_CONFIG = {
  webhookUrl: env.GOOGLE_SHEETS_WEBHOOK_URL || '',
  sheetUrl: '',
  enabled: true,
  sheetName: 'DhiGrowth Inbound Leads',
  lastSyncedAt: null,
};

/**
 * Get Google Sheets sync configuration
 */
export const getGoogleSheetsConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (err) {
    console.warn('[GoogleSheets] Error reading config:', err.message);
  }
  return { ...DEFAULT_CONFIG };
};

/**
 * Save Google Sheets sync configuration
 */
export const saveGoogleSheetsConfig = (newConfig) => {
  try {
    const current = getGoogleSheetsConfig();
    const updated = {
      ...current,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[GoogleSheets] Error saving config:', err.message);
    throw err;
  }
};

/**
 * Get local log of leads captured
 */
export const getCapturedLeads = () => {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[GoogleSheets] Error reading leads file:', err.message);
  }
  return [];
};

/**
 * Record a captured lead into leadsCollected.json
 */
export const logCapturedLead = (lead) => {
  try {
    const leads = getCapturedLeads();
    const newEntry = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: lead.name || 'Anonymous Lead',
      phone: lead.phone || '',
      service: lead.service || 'General Inquiry',
      purpose: lead.purpose || '',
      channel: lead.channel || 'WhatsApp',
      timestamp: lead.timestamp || new Date().toISOString(),
      sheetSynced: Boolean(lead.sheetSynced),
      error: lead.error || null,
      workspaceId: lead.workspaceId || env.DEFAULT_WORKSPACE_ID,
    };
    leads.unshift(newEntry);
    // Keep max 500 records
    const trimmed = leads.slice(0, 500);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
    return newEntry;
  } catch (err) {
    console.error('[GoogleSheets] Error logging lead:', err.message);
    return lead;
  }
};

/**
 * Send customer requirements to Google Sheets via Webhook (Google Apps Script Web App)
 *
 * @param {Object} leadData
 * @param {string} [leadData.timestamp]
 * @param {string} [leadData.name]
 * @param {string} [leadData.phone]
 * @param {string} [leadData.service]
 * @param {string} [leadData.purpose]
 * @param {string} [leadData.channel]
 * @param {string} [leadData.workspaceId]
 * @returns {Promise<{success: boolean, lead: Object, error: string|null}>}
 */
export const sendLeadToGoogleSheets = async (leadData) => {
  const config = getGoogleSheetsConfig();
  const targetUrl = config.webhookUrl || env.GOOGLE_SHEETS_WEBHOOK_URL;

  const payload = {
    timestamp: leadData.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    name: leadData.name || 'Anonymous Customer',
    phone: leadData.phone || '',
    service: leadData.service || 'DhiGrowth Service Inquiry',
    purpose: leadData.purpose || 'Requirements consultation',
    channel: leadData.channel || 'WhatsApp',
    workspaceId: leadData.workspaceId || env.DEFAULT_WORKSPACE_ID,
  };

  console.log(`\n📊 [Google Sheets Sync] Forwarding lead to Google Sheets:`, payload);

  let sheetSynced = false;
  let syncError = null;

  if (targetUrl && config.enabled !== false) {
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow', // Follow Google Apps Script 302 redirect
      });

      if (response.ok) {
        console.log(`✅ [Google Sheets Sync] Successfully recorded in Google Sheet!`);
        sheetSynced = true;
        saveGoogleSheetsConfig({ lastSyncedAt: new Date().toISOString() });
      } else {
        const text = await response.text();
        syncError = `HTTP ${response.status}: ${text.slice(0, 100)}`;
        console.warn(`⚠️ [Google Sheets Sync] Google Apps Script responded with:`, syncError);
      }
    } catch (err) {
      syncError = err.message;
      console.error(`❌ [Google Sheets Sync] Failed to post to Google Sheet URL:`, err.message);
    }
  } else {
    syncError = 'Google Sheets Webhook URL not configured yet. Lead saved locally in CRM.';
    console.log(`ℹ️ [Google Sheets Sync] ${syncError}`);
  }

  // Persist locally in leadsCollected.json
  const logged = logCapturedLead({
    ...payload,
    sheetSynced,
    error: syncError,
    workspaceId: leadData.workspaceId,
  });

  return { success: sheetSynced, lead: logged, error: syncError };
};

/**
 * Ready-to-copy Google Apps Script template for user's Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Customer Name", "Phone Number", "Service Needed", "Purpose / Requirements", "Channel"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#F0FDF4").setFontColor("#15803D");
      sheet.setFrozenRows(1);
    }
    
    // Append the customer details
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name || "N/A",
      data.phone || "N/A",
      data.service || "N/A",
      data.purpose || "N/A",
      data.channel || "WhatsApp"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Lead saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default {
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  getCapturedLeads,
  logCapturedLead,
  sendLeadToGoogleSheets,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
};
