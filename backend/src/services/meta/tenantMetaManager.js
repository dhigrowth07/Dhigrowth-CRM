import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data store location in isolated data/ directory
const TENANT_META_FILE = path.resolve(__dirname, '../../../data/metaConfigs.json');

// Memory cache for active tenant meta configurations
let tenantConfigs = {
  tenants: {},
  phoneToTenant: {},
};

/**
 * Initialize and load tenant configurations from disk
 */
export function initTenantMetaStore() {
  try {
    if (fs.existsSync(TENANT_META_FILE)) {
      const data = JSON.parse(fs.readFileSync(TENANT_META_FILE, 'utf-8'));
      tenantConfigs = {
        tenants: data.tenants || {},
        phoneToTenant: data.phoneToTenant || {},
      };
      console.log(`🔄 [TenantMetaManager] Loaded ${Object.keys(tenantConfigs.tenants).length} tenant Meta configurations from data store`);
      return;
    }

    // Default bootstrap with environment configuration if store is empty
    if (env.META_WHATSAPP_PHONE_NUMBER_ID && env.META_WHATSAPP_ACCESS_TOKEN) {
      const defaultOwner = 'sri';
      tenantConfigs.tenants[defaultOwner] = {
        phoneNumberId: env.META_WHATSAPP_PHONE_NUMBER_ID,
        accessToken: env.META_WHATSAPP_ACCESS_TOKEN,
        wabaId: env.META_WHATSAPP_WABA_ID,
        verifyToken: env.META_WHATSAPP_VERIFY_TOKEN,
        updatedBy: defaultOwner,
        updatedAt: new Date().toISOString(),
      };
      tenantConfigs.phoneToTenant[env.META_WHATSAPP_PHONE_NUMBER_ID] = defaultOwner;
      saveToDisk();
      console.log(`🔄 [TenantMetaManager] Bootstrapped default Meta configuration from environment`);
    }
  } catch (err) {
    console.error('[TenantMetaManager] Init error:', err.message);
  }
}

function saveToDisk() {
  try {
    fs.writeFileSync(TENANT_META_FILE, JSON.stringify(tenantConfigs, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TenantMetaManager] Error writing metaConfigs.json:', err.message);
  }
}

/**
 * Get Meta credentials for a specific tenant or workspace
 */
export function getTenantMetaConfig({ workspaceId, userId, username, slug } = {}) {
  // Refresh cache if file changed
  if (fs.existsSync(TENANT_META_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(TENANT_META_FILE, 'utf-8'));
      if (data.tenants) tenantConfigs.tenants = data.tenants;
      if (data.phoneToTenant) tenantConfigs.phoneToTenant = data.phoneToTenant;
    } catch {}
  }

  const keys = [
    workspaceId,
    userId,
    username ? username.toLowerCase() : null,
    slug ? slug.toLowerCase() : null,
  ].filter(Boolean);

  for (const key of keys) {
    if (tenantConfigs.tenants[key]) {
      const config = tenantConfigs.tenants[key];
      return {
        phoneNumberId: config.phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID,
        wabaId: config.wabaId || env.META_WHATSAPP_WABA_ID,
        accessToken: config.accessToken || env.META_WHATSAPP_ACCESS_TOKEN,
        verifyToken: config.verifyToken || env.META_WHATSAPP_VERIFY_TOKEN,
        updatedBy: config.updatedBy || key,
        updatedAt: config.updatedAt,
        isConfigured: Boolean(config.phoneNumberId && config.accessToken),
      };
    }
  }

  // Fallback to environment credentials if configured
  if (env.META_WHATSAPP_PHONE_NUMBER_ID && env.META_WHATSAPP_ACCESS_TOKEN) {
    return {
      phoneNumberId: env.META_WHATSAPP_PHONE_NUMBER_ID,
      wabaId: env.META_WHATSAPP_WABA_ID,
      accessToken: env.META_WHATSAPP_ACCESS_TOKEN,
      verifyToken: env.META_WHATSAPP_VERIFY_TOKEN,
      updatedBy: 'system_env',
      updatedAt: null,
      isConfigured: true,
    };
  }

  return {
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    verifyToken: env.META_WHATSAPP_VERIFY_TOKEN || 'dhigrowth_webhook_secret_2026',
    updatedBy: '',
    updatedAt: null,
    isConfigured: false,
  };
}

/**
 * Save Meta credentials for a specific tenant / workspace
 */
export async function saveTenantMetaConfig({
  workspaceId,
  userId,
  username,
  slug,
  phoneNumberId,
  accessToken,
  wabaId,
  verifyToken,
  updatedBy,
  supabaseClient = supabase,
}) {
  const cleanPhone = phoneNumberId ? String(phoneNumberId).trim() : '';
  const cleanToken = accessToken ? String(accessToken).trim() : '';
  const cleanWaba = wabaId ? String(wabaId).trim() : '';
  const cleanVerify = verifyToken ? String(verifyToken).trim() : env.META_WHATSAPP_VERIFY_TOKEN;
  const ownerName = updatedBy || username || slug || userId || 'User';

  const entry = {
    phoneNumberId: cleanPhone,
    accessToken: cleanToken,
    wabaId: cleanWaba,
    verifyToken: cleanVerify,
    workspaceId: workspaceId || '',
    updatedBy: ownerName,
    updatedAt: new Date().toISOString(),
  };

  const keysToSave = [
    workspaceId,
    userId,
    username ? username.toLowerCase() : null,
    slug ? slug.toLowerCase() : null,
  ].filter(Boolean);

  if (keysToSave.length === 0) {
    keysToSave.push(ownerName.toLowerCase());
  }

  for (const key of keysToSave) {
    tenantConfigs.tenants[key] = entry;
  }

  if (cleanPhone) {
    tenantConfigs.phoneToTenant[cleanPhone] = {
      workspaceId: workspaceId || '',
      username: username || ownerName,
      accessToken: cleanToken,
    };
  }

  saveToDisk();
  console.log(`✅ [TenantMetaManager] Saved Meta credentials for "${ownerName}" (Phone ID: ${cleanPhone || 'none'})`);

  // Sync to Supabase channels table if workspaceId is provided
  if (supabaseClient && workspaceId) {
    try {
      const { data: existing } = await supabaseClient
        .from('channels')
        .select('id, settings')
        .eq('workspace_id', workspaceId)
        .eq('type', 'whatsapp')
        .maybeSingle();

      const newSettings = {
        ...(existing?.settings || {}),
        phone_number_id: cleanPhone,
        access_token: cleanToken,
        waba_id: cleanWaba,
        verify_token: cleanVerify,
        updated_at: entry.updatedAt,
      };

      if (existing) {
        await supabaseClient
          .from('channels')
          .update({ settings: newSettings, status: cleanPhone && cleanToken ? 'connected' : 'disconnected' })
          .eq('id', existing.id);
      } else {
        await supabaseClient
          .from('channels')
          .insert([
            {
              workspace_id: workspaceId,
              type: 'whatsapp',
              name: `${ownerName} WhatsApp Cloud`,
              status: cleanPhone && cleanToken ? 'connected' : 'disconnected',
              settings: newSettings,
            },
          ]);
      }
      console.log(`☁️ [TenantMetaManager] Synced credentials to Supabase channels for workspace: ${workspaceId}`);
    } catch (err) {
      console.warn('[TenantMetaManager] Notice updating Supabase channel:', err.message);
    }
  }

  return {
    phoneNumberId: cleanPhone,
    wabaId: cleanWaba,
    accessToken: cleanToken ? `${cleanToken.slice(0, 10)}...${cleanToken.slice(-6)}` : '',
    verifyToken: cleanVerify,
    updatedBy: ownerName,
    updatedAt: entry.updatedAt,
    isConfigured: Boolean(cleanPhone && cleanToken),
  };
}

/**
 * Reverse lookup: Find tenant / workspace owning a given Phone Number ID (used by inbound webhooks)
 */
export function getTenantByPhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) return null;
  const clean = String(phoneNumberId).trim();
  const directMatch = tenantConfigs.phoneToTenant[clean];
  if (directMatch) {
    if (typeof directMatch === 'string') {
      return tenantConfigs.tenants[directMatch] || null;
    }
    return directMatch;
  }

  for (const tenantKey of Object.keys(tenantConfigs.tenants)) {
    const t = tenantConfigs.tenants[tenantKey];
    if (t.phoneNumberId && String(t.phoneNumberId).trim() === clean) {
      return t;
    }
  }

  return null;
}

/**
 * Remove tenant credentials
 */
export function removeTenantMeta(identifier) {
  if (!identifier) return;
  const key = String(identifier).toLowerCase();
  delete tenantConfigs.tenants[key];
  delete tenantConfigs.tenants[identifier];
  saveToDisk();
}

export const registerTenantMeta = saveTenantMetaConfig;

// Initialize on module load
initTenantMetaStore();

export default {
  initTenantMetaStore,
  getTenantMetaConfig,
  saveTenantMetaConfig,
  registerTenantMeta,
  getTenantByPhoneNumberId,
  removeTenantMeta,
};
