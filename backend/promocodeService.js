import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMOCODES_FILE = path.resolve(__dirname, 'promocodesStore.json');

const INITIAL_PROMOCODES = [
  {
    id: 'promo_sitarc_100',
    code: 'SITARC',
    discountPercentage: 100,
    expiryDate: '2026-12-31',
    maxUses: null,
    usedCount: 0,
    usedBy: [],
    isActive: true,
    description: 'Special 100% discount on DhiGrowth plans',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'promo_launch50',
    code: 'LAUNCH50',
    discountPercentage: 50,
    expiryDate: '2026-12-31',
    maxUses: 100,
    usedCount: 2,
    usedBy: [
      {
        id: 'red_001',
        username: 'sri',
        tenantName: 'Sri (Dhigrowth)',
        workspaceId: 'b0000000-0000-0000-0000-000000000001',
        planId: 'Growth',
        discountPercentage: 50,
        amountSaved: '₹1,062',
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'red_002',
        username: 'david_store',
        tenantName: 'David Miller',
        workspaceId: 'b0000000-0000-0000-0000-000000000002',
        planId: 'Pro',
        discountPercentage: 50,
        amountSaved: '₹1,959',
        redeemedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    isActive: true,
    description: 'Launch special: 50% discount across all growth & scaling plans',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'promo_growth30',
    code: 'GROWTH30',
    discountPercentage: 30,
    expiryDate: '2026-11-30',
    maxUses: 50,
    usedCount: 0,
    usedBy: [],
    isActive: true,
    description: 'Exclusive 30% discount for expanding creator & e-commerce teams',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'promo_flash80',
    code: 'FLASH80',
    discountPercentage: 80,
    expiryDate: '2026-08-15', // Past date to demonstrate Expired status
    maxUses: 10,
    usedCount: 10,
    usedBy: [
      {
        id: 'red_003',
        username: 'early_founder',
        tenantName: 'Early Founder Labs',
        workspaceId: 'b0000000-0000-0000-0000-000000000003',
        planId: 'Business',
        discountPercentage: 80,
        amountSaved: '₹4,479',
        redeemedAt: '2026-08-14T10:00:00.000Z',
      },
    ],
    isActive: true,
    description: 'Independence Day flash discount: 80% off (Limited seats)',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

let promocodesCache = null;

export function initPromocodeStore() {
  try {
    if (!fs.existsSync(PROMOCODES_FILE)) {
      fs.writeFileSync(PROMOCODES_FILE, JSON.stringify(INITIAL_PROMOCODES, null, 2), 'utf-8');
      promocodesCache = INITIAL_PROMOCODES;
      console.log('🎟️ [PromocodeService] Initialized default promocodes store.');
    } else {
      const raw = fs.readFileSync(PROMOCODES_FILE, 'utf-8');
      promocodesCache = JSON.parse(raw);
    }

    // Ensure SITARC exists and is active
    const sitarcIndex = (promocodesCache || []).findIndex((p) => p.code?.toUpperCase() === 'SITARC');
    if (sitarcIndex === -1) {
      promocodesCache.unshift({
        id: 'promo_sitarc_100',
        code: 'SITARC',
        discountPercentage: 100,
        expiryDate: '2026-12-31',
        maxUses: null,
        usedCount: 0,
        usedBy: [],
        isActive: true,
        description: 'Special 100% discount on DhiGrowth plans',
        createdAt: '2026-10-01T00:00:00.000Z',
      });
      savePromocodesToDisk();
    } else if (promocodesCache[sitarcIndex].isActive === false) {
      promocodesCache[sitarcIndex].isActive = true;
      savePromocodesToDisk();
    }
  } catch (err) {
    console.warn('[PromocodeService] Init warning:', err.message);
    promocodesCache = INITIAL_PROMOCODES;
  }
}

initPromocodeStore();

function savePromocodesToDisk() {
  try {
    fs.writeFileSync(PROMOCODES_FILE, JSON.stringify(promocodesCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PromocodeService] Failed to save promocodes:', err.message);
  }
}

/**
 * Compute the dynamic status of a promocode
 * @returns {'active' | 'expired' | 'used_up' | 'disabled'}
 */
export function computePromocodeStatus(promo) {
  if (!promo.isActive) return 'disabled';

  if (promo.expiryDate) {
    const expiryTime = new Date(`${promo.expiryDate}T23:59:59`).getTime();
    if (!isNaN(expiryTime) && Date.now() > expiryTime) {
      return 'expired';
    }
  }

  if (promo.maxUses && Number(promo.usedCount) >= Number(promo.maxUses)) {
    return 'used_up';
  }

  return 'active';
}

/**
 * Return all promocodes with computed statuses & usage flags
 */
export function getAllPromocodes() {
  if (!promocodesCache) initPromocodeStore();

  return (promocodesCache || []).map((promo) => {
    const status = computePromocodeStatus(promo);
    return {
      ...promo,
      status,
      isExpired: status === 'expired',
      isUsed: (promo.usedCount || 0) > 0,
      isUsedUp: status === 'used_up',
    };
  });
}

/**
 * Create a new promocode
 */
export function createPromocode({
  code,
  discountPercentage,
  expiryDate,
  maxUses = null,
  description = '',
  isActive = true,
}) {
  if (!code || !code.trim()) {
    throw new Error('Promo code is required');
  }

  const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanCode) {
    throw new Error('Invalid promo code format. Use uppercase letters, numbers, and dashes.');
  }

  const discount = Math.min(Math.max(Number(discountPercentage) || 0, 1), 100);
  if (discount <= 0) {
    throw new Error('Discount percentage must be between 1% and 100%');
  }

  if (!promocodesCache) initPromocodeStore();

  const existingIndex = promocodesCache.findIndex(
    (p) => (p.code || '').toUpperCase() === cleanCode
  );
  if (existingIndex >= 0) {
    throw new Error(`Promo code "${cleanCode}" already exists. Please choose a different code.`);
  }

  const newPromo = {
    id: `promo_${cleanCode.toLowerCase()}_${Date.now()}`,
    code: cleanCode,
    discountPercentage: discount,
    expiryDate: expiryDate || '2026-12-31',
    maxUses: maxUses ? Number(maxUses) : null,
    usedCount: 0,
    usedBy: [],
    isActive: Boolean(isActive),
    description: description.trim() || `Special ${discount}% discount on DhiGrowth plans`,
    createdAt: new Date().toISOString(),
  };

  promocodesCache.unshift(newPromo);
  savePromocodesToDisk();

  return {
    ...newPromo,
    status: computePromocodeStatus(newPromo),
    isExpired: false,
    isUsed: false,
  };
}

/**
 * Update an existing promocode
 */
export function updatePromocode(id, updates) {
  if (!promocodesCache) initPromocodeStore();

  const targetIndex = promocodesCache.findIndex(
    (p) => p.id === id || p.code?.toUpperCase() === String(id).toUpperCase()
  );
  if (targetIndex === -1) {
    throw new Error('Promocode not found');
  }

  const current = promocodesCache[targetIndex];
  const updated = {
    ...current,
    ...updates,
    discountPercentage: updates.discountPercentage
      ? Math.min(Math.max(Number(updates.discountPercentage), 1), 100)
      : current.discountPercentage,
  };

  promocodesCache[targetIndex] = updated;
  savePromocodesToDisk();

  return {
    ...updated,
    status: computePromocodeStatus(updated),
    isExpired: computePromocodeStatus(updated) === 'expired',
    isUsed: (updated.usedCount || 0) > 0,
  };
}

/**
 * Delete a promocode
 */
export function deletePromocode(id) {
  if (!promocodesCache) initPromocodeStore();

  const beforeLength = promocodesCache.length;
  promocodesCache = promocodesCache.filter(
    (p) => p.id !== id && p.code?.toUpperCase() !== String(id).toUpperCase()
  );

  if (promocodesCache.length !== beforeLength) {
    savePromocodesToDisk();
    return true;
  }
  return false;
}

/**
 * Validate a promocode entered by a customer at checkout
 */
export function validatePromocode(code) {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Please enter a promo code.' };
  }

  const cleanCode = code.trim().toUpperCase();
  if (!promocodesCache) initPromocodeStore();

  const promo = promocodesCache.find((p) => (p.code || '').toUpperCase() === cleanCode);
  if (!promo) {
    return { valid: false, error: `Promo code "${cleanCode}" is invalid.` };
  }

  const status = computePromocodeStatus(promo);

  if (status === 'disabled') {
    return { valid: false, error: `Promo code "${cleanCode}" is currently inactive.` };
  }

  if (status === 'expired') {
    return {
      valid: false,
      error: `Promo code "${cleanCode}" expired on ${promo.expiryDate}.`,
      isExpired: true,
    };
  }

  if (status === 'used_up') {
    return {
      valid: false,
      error: `Promo code "${cleanCode}" has reached its maximum redemption limit (${promo.maxUses} uses).`,
      isUsedUp: true,
    };
  }

  return {
    valid: true,
    id: promo.id,
    code: promo.code,
    discountPercentage: promo.discountPercentage,
    description: promo.description,
    expiryDate: promo.expiryDate,
    maxUses: promo.maxUses,
    usedCount: promo.usedCount,
  };
}

/**
 * Record a redemption of a promocode by a user
 */
export function redeemPromocode({
  code,
  username = 'user',
  tenantName = 'User Workspace',
  workspaceId = '',
  planId = 'Growth',
  amountSaved = '₹0',
}) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  if (!promocodesCache) initPromocodeStore();

  const target = promocodesCache.find((p) => (p.code || '').toUpperCase() === cleanCode);
  if (!target) return null;

  const redemptionRecord = {
    id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username,
    tenantName,
    workspaceId,
    planId,
    discountPercentage: target.discountPercentage,
    amountSaved,
    redeemedAt: new Date().toISOString(),
  };

  target.usedCount = (target.usedCount || 0) + 1;
  target.usedBy = target.usedBy || [];
  target.usedBy.unshift(redemptionRecord);

  savePromocodesToDisk();
  console.log(`🎟️ [PromocodeService] Code "${cleanCode}" redeemed by ${username} on ${planId} plan (Saved: ${amountSaved})`);

  return {
    success: true,
    promo: {
      ...target,
      status: computePromocodeStatus(target),
    },
    redemption: redemptionRecord,
  };
}
