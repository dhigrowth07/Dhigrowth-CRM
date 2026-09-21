import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TENANT_META_FILE = path.resolve(__dirname, 'metaConfigs.json');
const LEGACY_META_FILE = path.resolve(__dirname, 'metaConfig.json');

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
      console.log(`🔄 [TenantMetaManager] Loaded ${Object.keys(tenantConfigs.tenants).length} tenant Meta configurations from disk`);
      return;
    }

    // Migration from single legacy metaConfig.json if present
    if (fs.existsSync(LEGACY_META_FILE)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(LEGACY_META_FILE, 'utf-8'));
        const owner = (legacy.updatedBy || 'sri').toLowerCase();
        tenantConfigs.tenants[owner] = {
          phoneNumberId: legacy.phoneNumberId || '',
          accessToken: legacy.accessToken || '',
          wabaId: legacy.wabaId || '',
          verifyToken: legacy.verifyToken || 'dhigrowth_webhook_secret_2026',
          updatedBy: legacy.updatedBy || owner,
          updatedAt: legacy.updatedAt || new Date().toISOString(),
        };

        if (legacy.phoneNumberId) {
          tenantConfigs.phoneToTenant[legacy.phoneNumberId] = owner;
        }

        saveToDisk();
        console.log(`🔄 [TenantMetaManager] Migrated legacy metaConfig.json into tenant Meta store for "${owner}"`);
      } catch (err) {
        console.warn('[TenantMetaManager] Legacy migration note:', err.message);
      }
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
export function getTenantMetaConfig({ workspaceId, userId, username, slug }) {
  // Ensure store reflects latest disk state
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
        phoneNumberId: config.phoneNumberId || '',
        wabaId: config.wabaId || '',
        accessToken: config.accessToken || '',
        verifyToken: config.verifyToken || 'dhigrowth_webhook_secret_2026',
        updatedBy: config.updatedBy || key,
        updatedAt: config.updatedAt,
        isConfigured: Boolean(config.phoneNumberId && config.accessToken),
      };
    }
  }

  // Not configured yet for this user -> return blank fields (do not leak another user's credentials)
  return {
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    verifyToken: 'dhigrowth_webhook_secret_2026',
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
  supabaseClient,
}) {
  const cleanPhone = phoneNumberId ? String(phoneNumberId).trim() : '';
  const cleanToken = accessToken ? String(accessToken).trim() : '';
  const cleanWaba = wabaId ? String(wabaId).trim() : '';
  const cleanVerify = verifyToken ? String(verifyToken).trim() : 'dhigrowth_webhook_secret_2026';
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

  // Associate with all identifiers for this user/workspace
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
  console.log(`✅ [TenantMetaManager] Saved unique Meta credentials for "${ownerName}" (Phone ID: ${cleanPhone || 'none'})`);

  // Also persist to Supabase channels table if workspaceId is provided
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
      console.warn('[TenantMetaManager] Note updating Supabase channel:', err.message);
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

  // Linear scan across all tenants
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

// Self initialize on load
initTenantMetaStore();
