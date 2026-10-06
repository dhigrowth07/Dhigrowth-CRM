import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_FILE = path.resolve(__dirname, '../../../data/walletStore.json');

let walletStore = {
  profiles: {},
};

const DEFAULT_USERS = ['sri', 'admin', 'default'];

export function initWalletStore() {
  try {
    if (fs.existsSync(WALLET_FILE)) {
      const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf-8'));
      walletStore = { profiles: data.profiles || {} };
    } else {
      walletStore = { profiles: {} };
    }

    DEFAULT_USERS.forEach((usr) => {
      if (!walletStore.profiles[usr]) {
        walletStore.profiles[usr] = {
          userId: usr,
          workspaceId: 'b0000000-0000-0000-0000-000000000001',
          balanceUsd: 5.0,
          transactions: [
            {
              id: `tx_init_${usr}`,
              type: 'LAUNCH_CREDIT',
              amountUsd: 5.0,
              balanceAfterUsd: 5.0,
              description: 'Promotional $5.00 launch credit applied to profile',
              referenceId: 'promo_launch_2026',
              provider: 'system',
              createdAt: '2026-09-03T00:00:00.000Z',
            },
          ],
        };
      }
    });

    saveWalletStoreToDisk();
    console.log(`💳 [WalletService] Initialized wallet store with ${Object.keys(walletStore.profiles).length} user profiles`);
  } catch (err) {
    console.warn('[WalletService] Init error:', err.message);
  }
}

// Auto-initialize on load
initWalletStore();

function saveWalletStoreToDisk() {
  try {
    const parentDir = path.dirname(WALLET_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[WalletService] Save error:', err.message);
  }
}

/**
 * Get or initialize wallet for an individual user profile
 */
export function getUserWallet(userKey = 'sri') {
  const cleanKey = String(userKey).toLowerCase().trim() || 'sri';
  if (!walletStore.profiles[cleanKey]) {
    walletStore.profiles[cleanKey] = {
      userId: cleanKey,
      workspaceId: 'b0000000-0000-0000-0000-000000000001',
      balanceUsd: 5.0,
      transactions: [
        {
          id: `tx_init_${cleanKey}`,
          type: 'LAUNCH_CREDIT',
          amountUsd: 5.0,
          balanceAfterUsd: 5.0,
          description: 'Promotional $5.00 launch credit applied to profile',
          referenceId: 'promo_launch_2026',
          provider: 'system',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    saveWalletStoreToDisk();
  }
  return walletStore.profiles[cleanKey];
}

/**
 * Create a Razorpay Order for AI Credits Recharge
 */
export async function createRazorpayOrder({
  amountUsd = 10,
  amountInr = 850,
  userKey = 'sri',
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
}) {
  const keyId = env.RAZORPAY_KEY_ID || 'rzp_test_TcdoZxzN0dIYoP';
  const keySecret = env.RAZORPAY_KEY_SECRET || '6wEKCUJ0UXAZm6ESRTaIY4R0';
  const receiptId = `rcpt_${Date.now()}_${userKey}`;

  const amountPaise = Math.round((parseFloat(amountInr) || 850) * 100);

  if (keyId && keySecret && !keyId.includes('placeholder')) {
    try {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            userKey,
            workspaceId,
            amountUsd: String(amountUsd),
            purpose: 'AI Credits Recharge',
          },
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        return {
          success: true,
          keyId,
          orderId: orderData.id,
          amountInr,
          amountUsd,
          amountPaise,
          currency: 'INR',
          receiptId,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[WalletService] Razorpay API note:', errJson);
      }
    } catch (err) {
      console.warn('[WalletService] Razorpay live order error, fallback to test mode:', err.message);
    }
  }

  return {
    success: true,
    isTest: true,
    keyId: keyId || 'rzp_test_TcdoZxzN0dIYoP',
    orderId: `order_test_${Date.now()}`,
    amountInr,
    amountUsd,
    amountPaise,
    currency: 'INR',
    receiptId,
  };
}

/**
 * Record a successful Razorpay payment and credit the individual user profile
 */
export async function recordWalletRecharge({
  userKey = 'sri',
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  amountUsd = 10,
  amountInr = 850,
  paymentId = `pay_rzp_${Date.now()}`,
  orderId = `order_${Date.now()}`,
  provider = 'razorpay',
  method = 'UPI / NetBanking',
}) {
  const profile = getUserWallet(userKey);
  const creditNum = parseFloat(amountUsd) || 10;
  const newBalance = +(profile.balanceUsd + creditNum).toFixed(2);

  profile.balanceUsd = newBalance;
  profile.updatedAt = new Date().toISOString();

  const txRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'TOP_UP',
    amountUsd: creditNum,
    amountInr: parseFloat(amountInr) || Math.round(creditNum * 85),
    balanceAfterUsd: newBalance,
    description: `Recharged $${creditNum.toFixed(2)} AI Credits via Razorpay (${method})`,
    paymentId,
    orderId,
    provider,
    createdAt: new Date().toISOString(),
  };

  profile.transactions.unshift(txRecord);
  saveWalletStoreToDisk();

  console.log(`💰 [WalletService] Credited $${creditNum.toFixed(2)} to profile "${userKey}". New balance: $${newBalance.toFixed(2)}`);

  if (supabase) {
    try {
      const targetWs = workspaceId || profile.workspaceId;
      if (targetWs) {
        const { data: existing } = await supabase
          .from('wallet_accounts')
          .select('id, balance_usd')
          .eq('workspace_id', targetWs)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('wallet_accounts')
            .update({ balance_usd: newBalance, updated_at: new Date().toISOString() })
            .eq('workspace_id', targetWs);
        } else {
          await supabase
            .from('wallet_accounts')
            .insert([{ workspace_id: targetWs, balance_usd: newBalance }]);
        }

        await supabase.from('wallet_transactions').insert([
          {
            workspace_id: targetWs,
            type: 'credit',
            amount_usd: creditNum,
            balance_after_usd: newBalance,
            description: `AI Credits Recharge via Razorpay (${paymentId})`,
            reference_id: paymentId,
          },
        ]);
      }
    } catch (dbErr) {
      console.warn('[WalletService] Supabase sync note:', dbErr.message);
    }
  }

  return {
    success: true,
    userKey,
    workspaceId: profile.workspaceId,
    balanceUsd: newBalance,
    transaction: txRecord,
    message: `Successfully recharged $${creditNum.toFixed(2)} AI Credits for ${userKey}!`,
  };
}

export default {
  initWalletStore,
  getUserWallet,
  createRazorpayOrder,
  recordWalletRecharge,
};
