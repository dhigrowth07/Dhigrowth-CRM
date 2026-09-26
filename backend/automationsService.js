import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const AUTOMATIONS_FILE = path.resolve(__dirname, 'automationsStore.json');

// Supabase Cloud Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

let isCloudAutomationsTableAvailable = false;

const DEFAULT_STARTER_AUTOMATIONS = [
  {
    id: 'auto_welcome_greeting',
    name: 'WhatsApp AI Welcome & Service Menu',
    description: 'Instantly send interactive button card & service menu on first customer message',
    trigger: 'First Inbound Message',
    triggerCondition: 'First message from new contact or 24h inactive',
    action: 'Dispatch Interactive Greeting',
    actionDetails: 'Send button card with App Dev, CRM, and AI Solutions',
    status: 'Active',
    runs: 142,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_app_inquiry',
    name: 'Mobile & Web App Funnel',
    description: 'Auto-respond with portfolio deck when customer asks about apps or websites',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "app", "website", "ios", "android", "1"',
    action: 'Send Portfolio & Tech Deck',
    actionDetails: 'Send Flutter & React Native portfolio with consultation link',
    status: 'Active',
    runs: 89,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_crm_funnel',
    name: 'WhatsApp CRM & Auto-Pilot Funnel',
    description: 'Explain WhatsApp API features and pricing when requested',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "crm", "auto-pilot", "whatsapp api", "2"',
    action: 'Send WhatsApp CRM Overview',
    actionDetails: 'Send Cloud API features, lead funnels, and pricing plans',
    status: 'Active',
    runs: 64,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_agent_handoff',
    name: 'High-Intent Human Agent Handoff',
    description: 'Assign to live human agent when user asks for quote, call, or urgent help',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "quote", "call", "urgent", "human", "talk"',
    action: 'Assign to Agent & Pause AI',
    actionDetails: 'Move to Manual Agent mode and notify team inbox',
    status: 'Active',
    runs: 31,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
];

let store = {
  workspaces: {},
};

export async function initAutomationsStore() {
  // 1. Initialize from local disk
  try {
    if (fs.existsSync(AUTOMATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTOMATIONS_FILE, 'utf-8'));
      store = { workspaces: data.workspaces || {} };
      console.log(`⚡ [AutomationsService] Loaded automations from disk for ${Object.keys(store.workspaces).length} workspaces`);
    } else {
      store.workspaces['b0000000-0000-0000-0000-000000000001'] = [...DEFAULT_STARTER_AUTOMATIONS];
      saveAutomationsToDisk();
      console.log('⚡ [AutomationsService] Seeded starter automations store to disk');
    }
  } catch (err) {
    console.warn('[AutomationsService] Disk Init error:', err.message);
    store.workspaces['b0000000-0000-0000-0000-000000000001'] = [...DEFAULT_STARTER_AUTOMATIONS];
  }

  // 2. Check Supabase Cloud table availability
  if (supabase) {
    try {
      const { data, error } = await supabase.from('automations').select('id').limit(1);
      if (!error) {
        isCloudAutomationsTableAvailable = true;
        console.log('☁️ [AutomationsService] Connected to Supabase Cloud automations table');
      } else {
        console.log('ℹ️ [AutomationsService] Supabase automations table not yet created. Using local JSON store. (Run backend/database/migrations/01_automations_and_drips.sql to activate in cloud)');
      }
    } catch (err) {
      console.log('ℹ️ [AutomationsService] Supabase check notice:', err.message);
    }
  }
}

function saveAutomationsToDisk() {
  try {
    fs.writeFileSync(AUTOMATIONS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AutomationsService] Save error:', err.message);
  }
}

function normalizeAutomationRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    trigger: row.trigger,
    triggerCondition: row.trigger_condition || row.triggerCondition,
    action: row.action,
    actionDetails: row.action_details || row.actionDetails,
    status: row.status,
    runs: row.runs || 0,
    createdAt: row.created_at || row.createdAt,
    lastRunAt: row.last_run_at || row.lastRunAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export async function getWorkspaceAutomations(workspaceId = 'b0000000-0000-0000-0000-000000000001') {
  // If Supabase cloud table is online, read from cloud
  if (isCloudAutomationsTableAvailable && supabase) {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized = data.map(normalizeAutomationRow);
        // Sync local cache
        store.workspaces[workspaceId] = normalized;
        saveAutomationsToDisk();
        return normalized;
      }
    } catch (err) {
      console.warn('Could not read automations from cloud Supabase, falling back to disk:', err.message);
    }
  }

  // Fallback to local memory & disk
  if (!store.workspaces[workspaceId] || store.workspaces[workspaceId].length === 0) {
    store.workspaces[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_STARTER_AUTOMATIONS));
    saveAutomationsToDisk();
  }
  return store.workspaces[workspaceId];
}

export async function createAutomation({
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  name,
  description,
  trigger = 'Keyword Match',
  triggerCondition = '',
  action = 'Send WhatsApp Catalog',
  actionDetails = '',
}) {
  const newAuto = {
    id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name?.trim() || 'New Automation Rule',
    description: description?.trim() || 'Automatically triggered workflow',
    trigger,
    triggerCondition: triggerCondition || 'Always active',
    action,
    actionDetails: actionDetails || 'Execute default action',
    status: 'Active',
    runs: 0,
    createdAt: new Date().toISOString(),
    lastRunAt: null,
  };

  // 1. Try writing to Supabase Cloud
  if (isCloudAutomationsTableAvailable && supabase) {
    try {
      const { error } = await supabase.from('automations').insert([
        {
          id: newAuto.id,
          workspace_id: workspaceId,
          name: newAuto.name,
          description: newAuto.description,
          trigger: newAuto.trigger,
          trigger_condition: newAuto.triggerCondition,
          action: newAuto.action,
          action_details: newAuto.actionDetails,
          status: newAuto.status,
          runs: newAuto.runs,
          created_at: newAuto.createdAt,
        },
      ]);
      if (!error) {
        console.log(`☁️ [AutomationsService] Saved automation "${newAuto.name}" to Supabase Cloud`);
      }
    } catch (err) {
      console.warn('Supabase cloud write note:', err.message);
    }
  }

  // 2. Write to local store
  if (!store.workspaces[workspaceId]) {
    store.workspaces[workspaceId] = [];
  }
  store.workspaces[workspaceId].unshift(newAuto);
  saveAutomationsToDisk();

  return newAuto;
}

export async function updateAutomation(workspaceId, automationId, updates = {}) {
  // 1. Update in Supabase Cloud
  if (isCloudAutomationsTableAvailable && supabase) {
    try {
      const dbUpdates = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.trigger) dbUpdates.trigger = updates.trigger;
      if (updates.triggerCondition) dbUpdates.trigger_condition = updates.triggerCondition;
      if (updates.action) dbUpdates.action = updates.action;
      if (updates.actionDetails) dbUpdates.action_details = updates.actionDetails;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.runs !== undefined) dbUpdates.runs = updates.runs;
      if (updates.lastRunAt) dbUpdates.last_run_at = updates.lastRunAt;

      await supabase
        .from('automations')
        .update(dbUpdates)
        .eq('id', automationId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('Supabase update automation note:', err.message);
    }
  }

  // 2. Update local store
  const list = store.workspaces[workspaceId] || [];
  const idx = list.findIndex((a) => a.id === automationId);
  if (idx === -1) {
    throw new Error(`Automation ${automationId} not found`);
  }

  const updated = {
    ...list[idx],
    ...updates,
    id: list[idx].id,
    createdAt: list[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = updated;
  saveAutomationsToDisk();
  return updated;
}

export async function deleteAutomation(workspaceId, automationId) {
  // 1. Delete in Supabase Cloud
  if (isCloudAutomationsTableAvailable && supabase) {
    try {
      await supabase
        .from('automations')
        .delete()
        .eq('id', automationId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('Supabase delete automation note:', err.message);
    }
  }

  // 2. Delete in local store
  const list = store.workspaces[workspaceId] || [];
  const beforeLen = list.length;
  store.workspaces[workspaceId] = list.filter((a) => a.id !== automationId);

  if (store.workspaces[workspaceId].length === beforeLen) {
    throw new Error(`Automation ${automationId} not found`);
  }

  saveAutomationsToDisk();
  return { success: true, deletedId: automationId };
}

export async function toggleAutomationStatus(workspaceId, automationId) {
  const list = store.workspaces[workspaceId] || [];
  const auto = list.find((a) => a.id === automationId);
  if (!auto) {
    throw new Error(`Automation ${automationId} not found`);
  }

  const nextStatus = auto.status === 'Active' ? 'Paused' : 'Active';
  return updateAutomation(workspaceId, automationId, { status: nextStatus });
}

export async function testTriggerAutomation(workspaceId, automationId) {
  const list = store.workspaces[workspaceId] || [];
  const auto = list.find((a) => a.id === automationId);
  if (!auto) {
    throw new Error(`Automation ${automationId} not found`);
  }

  const newRuns = (auto.runs || 0) + 1;
  const now = new Date().toISOString();

  const updated = await updateAutomation(workspaceId, automationId, {
    runs: newRuns,
    lastRunAt: now,
  });

  return {
    success: true,
    automation: updated,
    message: `Trigger executed: "${updated.name}" ran successfully!`,
  };
}
