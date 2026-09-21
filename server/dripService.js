import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DRIP_FILE = path.resolve(__dirname, 'dripStore.json');

// Supabase Cloud Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

let isCloudDripTableAvailable = false;

const DEFAULT_STARTER_DRIPS = [
  {
    id: 'drip_hot_fasttrack',
    name: 'Hot Lead Fast-Track Nurture',
    category: 'lead_stage',
    trigger: 'Hot',
    delay: '1 day(s)',
    status: 'Active',
    enrolled: 124,
    delivered: 120,
    steps: [
      { step: 1, delay: 'Instant', action: 'Send Product Deck & Client Case Studies' },
      { step: 2, delay: 'After 1 Day', action: 'Offer 1-on-1 Consultation Call Link' },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_cart_recovery',
    name: 'Abandoned Cart 24-Hour Recovery',
    category: 'cart_recovery',
    trigger: 'Interested',
    delay: '2 day(s)',
    status: 'Active',
    enrolled: 86,
    delivered: 82,
    steps: [
      { step: 1, delay: 'After 1 Hour', action: 'Send 10% Discount Promo Code (LAUNCH10)' },
      { step: 2, delay: 'After 24 Hours', action: 'Send Direct WhatsApp Checkout Link' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_post_purchase',
    name: 'Post-Purchase VIP Loyalty Sequence',
    category: 'post_purchase',
    trigger: 'Converted',
    delay: '7 day(s)',
    status: 'Active',
    enrolled: 210,
    delivered: 204,
    steps: [
      { step: 1, delay: 'Day 3', action: 'Product Setup & Onboarding Guide' },
      { step: 2, delay: 'Day 7', action: 'Google Review Request & Feedback Survey' },
      { step: 3, delay: 'Day 14', action: '₹500 Referral Bonus Invitation' },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_cold_reactivation',
    name: 'Cold Lead Re-engagement Winback',
    category: 'lead_stage',
    trigger: 'Cold',
    delay: '15 day(s)',
    status: 'Active',
    enrolled: 95,
    delivered: 91,
    steps: [
      { step: 1, delay: 'Day 15', action: 'Share Major New Feature & AI Enhancements' },
      { step: 2, delay: 'Day 30', action: 'Exclusive Reactivation 20% Voucher' },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

let store = {
  workspaces: {},
};

export async function initDripStore() {
  // 1. Check local disk store
  try {
    if (fs.existsSync(DRIP_FILE)) {
      const data = JSON.parse(fs.readFileSync(DRIP_FILE, 'utf-8'));
      store = { workspaces: data.workspaces || {} };
      console.log(`💧 [DripService] Loaded drip campaigns from disk for ${Object.keys(store.workspaces).length} workspaces`);
    } else {
      store.workspaces['b0000000-0000-0000-0000-000000000001'] = [...DEFAULT_STARTER_DRIPS];
      saveDripToDisk();
      console.log('💧 [DripService] Seeded starter drip campaigns store to disk');
    }
  } catch (err) {
    console.warn('[DripService] Disk Init error:', err.message);
    store.workspaces['b0000000-0000-0000-0000-000000000001'] = [...DEFAULT_STARTER_DRIPS];
  }

  // 2. Check Supabase Cloud table availability
  if (supabase) {
    try {
      const { data, error } = await supabase.from('drip_campaigns').select('id').limit(1);
      if (!error) {
        isCloudDripTableAvailable = true;
        console.log('☁️ [DripService] Connected to Supabase Cloud drip_campaigns table');
      } else {
        console.log('ℹ️ [DripService] Supabase drip_campaigns table not yet created. Using local JSON store. (Run database/migrations/01_automations_and_drips.sql to activate in cloud)');
      }
    } catch (err) {
      console.log('ℹ️ [DripService] Supabase check notice:', err.message);
    }
  }
}

function saveDripToDisk() {
  try {
    fs.writeFileSync(DRIP_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DripService] Save error:', err.message);
  }
}

function normalizeDripRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    trigger: row.trigger_stage || row.trigger,
    delay: row.delay,
    status: row.status,
    enrolled: row.enrolled || 0,
    delivered: row.delivered || 0,
    steps: Array.isArray(row.steps) ? row.steps : [],
    createdAt: row.created_at || row.createdAt,
    lastTriggerAt: row.last_trigger_at || row.lastTriggerAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export async function getWorkspaceDrips(workspaceId = 'b0000000-0000-0000-0000-000000000001') {
  // If Supabase cloud table is online, read from cloud
  if (isCloudDripTableAvailable && supabase) {
    try {
      const { data, error } = await supabase
        .from('drip_campaigns')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const normalized = data.map(normalizeDripRow);
        // Sync local cache
        store.workspaces[workspaceId] = normalized;
        saveDripToDisk();
        return normalized;
      }
    } catch (err) {
      console.warn('Could not read drips from cloud Supabase, falling back to disk:', err.message);
    }
  }

  // Fallback to local memory & disk
  if (!store.workspaces[workspaceId] || store.workspaces[workspaceId].length === 0) {
    store.workspaces[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_STARTER_DRIPS));
    saveDripToDisk();
  }
  return store.workspaces[workspaceId];
}

export async function createDripCampaign({
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  name,
  category = 'lead_stage',
  trigger = 'Hot',
  delay = '1 day(s)',
  steps = [],
}) {
  const newDrip = {
    id: `drip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name?.trim() || 'New Drip Campaign',
    category,
    trigger,
    delay: delay || '1 day(s)',
    status: 'Active',
    enrolled: 0,
    delivered: 0,
    steps: steps.length > 0 ? steps : [
      { step: 1, delay: 'Instant', action: 'Send Introduction & Welcome Greeting' },
      { step: 2, delay: delay, action: 'Follow-up with Demo Booking Link' },
    ],
    createdAt: new Date().toISOString(),
    lastTriggerAt: null,
  };

  // 1. Try writing to Supabase Cloud
  if (isCloudDripTableAvailable && supabase) {
    try {
      const { error } = await supabase.from('drip_campaigns').insert([
        {
          id: newDrip.id,
          workspace_id: workspaceId,
          name: newDrip.name,
          category: newDrip.category,
          trigger_stage: newDrip.trigger,
          delay: newDrip.delay,
          status: newDrip.status,
          enrolled: newDrip.enrolled,
          delivered: newDrip.delivered,
          steps: newDrip.steps,
          created_at: newDrip.createdAt,
        },
      ]);
      if (!error) {
        console.log(`☁️ [DripService] Saved drip sequence "${newDrip.name}" to Supabase Cloud`);
      }
    } catch (err) {
      console.warn('Supabase cloud write note:', err.message);
    }
  }

  // 2. Write to local cache & disk
  if (!store.workspaces[workspaceId]) {
    store.workspaces[workspaceId] = [];
  }
  store.workspaces[workspaceId].unshift(newDrip);
  saveDripToDisk();

  return newDrip;
}

export async function updateDripCampaign(workspaceId, dripId, updates = {}) {
  // 1. Update in Supabase Cloud
  if (isCloudDripTableAvailable && supabase) {
    try {
      const dbUpdates = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.trigger) dbUpdates.trigger_stage = updates.trigger;
      if (updates.delay) dbUpdates.delay = updates.delay;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.steps) dbUpdates.steps = updates.steps;
      if (updates.enrolled !== undefined) dbUpdates.enrolled = updates.enrolled;
      if (updates.delivered !== undefined) dbUpdates.delivered = updates.delivered;
      if (updates.lastTriggerAt) dbUpdates.last_trigger_at = updates.lastTriggerAt;

      await supabase
        .from('drip_campaigns')
        .update(dbUpdates)
        .eq('id', dripId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('Supabase update drip note:', err.message);
    }
  }

  // 2. Update local store
  const list = store.workspaces[workspaceId] || [];
  const idx = list.findIndex((d) => d.id === dripId);
  if (idx === -1) {
    throw new Error(`Drip campaign ${dripId} not found`);
  }

  const updated = {
    ...list[idx],
    ...updates,
    id: list[idx].id,
    createdAt: list[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = updated;
  saveDripToDisk();
  return updated;
}

export async function deleteDripCampaign(workspaceId, dripId) {
  // 1. Delete in Supabase Cloud
  if (isCloudDripTableAvailable && supabase) {
    try {
      await supabase
        .from('drip_campaigns')
        .delete()
        .eq('id', dripId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('Supabase delete drip note:', err.message);
    }
  }

  // 2. Delete in local store
  const list = store.workspaces[workspaceId] || [];
  const beforeLen = list.length;
  store.workspaces[workspaceId] = list.filter((d) => d.id !== dripId);

  if (store.workspaces[workspaceId].length === beforeLen) {
    throw new Error(`Drip campaign ${dripId} not found`);
  }

  saveDripToDisk();
  return { success: true, deletedId: dripId };
}

export async function toggleDripStatus(workspaceId, dripId) {
  const list = store.workspaces[workspaceId] || [];
  const drip = list.find((d) => d.id === dripId);
  if (!drip) {
    throw new Error(`Drip campaign ${dripId} not found`);
  }

  const nextStatus = drip.status === 'Active' ? 'Paused' : 'Active';
  return updateDripCampaign(workspaceId, dripId, { status: nextStatus });
}

export async function testTriggerDrip(workspaceId, dripId) {
  const list = store.workspaces[workspaceId] || [];
  const drip = list.find((d) => d.id === dripId);
  if (!drip) {
    throw new Error(`Drip campaign ${dripId} not found`);
  }

  const newEnrolled = (drip.enrolled || 0) + 1;
  const newDelivered = (drip.delivered || 0) + 1;
  const now = new Date().toISOString();

  const updated = await updateDripCampaign(workspaceId, dripId, {
    enrolled: newEnrolled,
    delivered: newDelivered,
    lastTriggerAt: now,
  });

  return {
    success: true,
    drip: updated,
    message: `Drip sequence "${updated.name}" triggered! Contact enrolled into Step 1.`,
  };
}
