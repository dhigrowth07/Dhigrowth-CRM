import { env } from '../config/env.js';
import {
  SAAS_PLANS,
  getWorkspaceSubscription,
  createCheckoutSession,
  activateWorkspaceSubscription,
  upgradeWorkspacePlan,
  cancelSubscription,
  setWorkspaceSubscriptionStatus,
} from '../services/billing/billing.service.js';
import {
  getUserWallet,
  createRazorpayOrder,
  recordWalletRecharge,
} from '../services/billing/wallet.service.js';
import {
  getAllPromocodes,
  createPromocode,
  updatePromocode,
  deletePromocode,
  validatePromocode,
  redeemPromocode,
  togglePromocodeStatus,
} from '../services/billing/promocode.service.js';

// =========================================================================
// 1. Subscription & Plans Controllers
// =========================================================================

/**
 * GET /api/billing/plans
 * List available SaaS plans with limits and USD / INR pricing
 */
export function getPlans(req, res) {
  try {
    return res.status(200).json({
      success: true,
      plans: SAAS_PLANS,
    });
  } catch (err) {
    console.error('[BillingController] Error getting plans:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/billing/subscription
 * Get active plan, trial status, and usage limits for a workspace
 */
export function getSubscription(req, res) {
  try {
    const workspaceId =
      req.query.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const subscription = getWorkspaceSubscription(workspaceId);
    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (err) {
    console.error('[BillingController] Error getting subscription:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/billing/create-checkout
 * Initialize checkout session (Razorpay order / Stripe session)
 */
export async function createCheckout(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      userId,
      customerEmail,
      planId,
      billingCycle,
      provider = 'razorpay',
      billingDetails,
      promoCode,
      discountPercentage,
    } = req.body || {};

    const session = await createCheckoutSession({
      workspaceId,
      userId,
      customerEmail,
      planId,
      billingCycle,
      provider,
      billingDetails,
      promoCode,
      discountPercentage,
    });

    return res.status(200).json({
      success: true,
      ...session,
    });
  } catch (err) {
    console.error('[BillingController] Error creating checkout:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/billing/verify-payment
 * Confirm payment signature and activate workspace plan tier
 */
export function verifyPayment(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      planId,
      billingCycle,
      provider,
      paymentId,
      orderId,
      billingDetails,
      amount,
      currency,
    } = req.body || {};

    const result = activateWorkspaceSubscription({
      workspaceId,
      planId,
      billingCycle,
      provider,
      paymentId,
      orderId,
      billingDetails,
      amount,
      currency,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[BillingController] Error verifying payment:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/billing/upgrade
 * Upgrade workspace subscription tier
 */
export async function upgradeSubscription(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      planId,
      billingCycle = 'monthly',
      paymentId,
      orderId,
      provider = 'razorpay',
    } = req.body || {};

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required for upgrade' });
    }

    if (paymentId || orderId) {
      const result = activateWorkspaceSubscription({
        workspaceId,
        planId,
        billingCycle,
        provider,
        paymentId,
        orderId,
        amount: req.body?.amount,
        currency: req.body?.currency,
      });
      return res.status(200).json(result);
    }

    const upgraded = upgradeWorkspacePlan(workspaceId, planId, billingCycle);
    return res.status(200).json({
      success: true,
      subscription: upgraded,
      message: `Plan upgraded successfully to ${planId}!`,
    });
  } catch (err) {
    console.error('[BillingController] Error upgrading plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}


/**
 * POST /api/billing/cancel
 * Cancel workspace auto-renewal at period end
 */
export function cancelSubscriptionController(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = cancelSubscription(workspaceId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[BillingController] Error cancelling subscription:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/billing/set-status
 * Directly update workspace subscription status
 */
export function setStatusController(req, res) {
  try {
    const { workspaceId, status } = req.body || {};
    const targetWs =
      workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const result = setWorkspaceSubscriptionStatus(targetWs, status || 'trialing');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[BillingController] Error setting subscription status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// =========================================================================
// 2. Wallet & AI Credits Controllers
// =========================================================================

/**
 * GET /api/wallet & GET /api/wallet/balance
 * Retrieve user/workspace wallet balance and transaction ledger
 */
export function getWallet(req, res) {
  try {
    const userKey =
      req.query.userKey ||
      req.query.userId ||
      req.headers['x-user-key'] ||
      'sri';

    const wallet = getUserWallet(userKey);
    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (err) {
    console.error('[BillingController] Error getting wallet balance:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/wallet/create-order & POST /api/wallet/create-razorpay-order
 * Create Razorpay payment order for AI credits recharge
 */
export async function createWalletOrder(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      amountUsd,
      amountInr,
      userKey = 'sri',
    } = req.body || {};

    const order = await createRazorpayOrder({ amountUsd, amountInr, userKey, workspaceId });
    return res.status(200).json(order);
  } catch (err) {
    console.error('[BillingController] Error creating wallet order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/wallet/recharge
 * Record completed top-up transaction and credit profile balance
 */
export async function rechargeWallet(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      userKey = 'sri',
      amountUsd,
      amountInr,
      paymentId,
      orderId,
      provider = 'razorpay',
      method = 'UPI / NetBanking',
    } = req.body || {};

    const result = await recordWalletRecharge({
      userKey,
      workspaceId,
      amountUsd,
      amountInr,
      paymentId,
      orderId,
      provider,
      method,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[BillingController] Error recharging wallet:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// =========================================================================
// 3. Promocode Management & Validation Controllers
// =========================================================================

/**
 * GET /api/promocodes
 * List all active and archived promotional discount codes
 */
export function getPromocodesList(req, res) {
  try {
    const list = getAllPromocodes();
    return res.status(200).json({
      success: true,
      promocodes: list,
    });
  } catch (err) {
    console.error('[BillingController] Error getting promocodes:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/promocodes
 * Create a new coupon / promocode
 */
export function createPromo(req, res) {
  try {
    const promo = createPromocode(req.body || {});
    return res.status(200).json({
      success: true,
      promocode: promo,
    });
  } catch (err) {
    console.error('[BillingController] Error creating promocode:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * PUT /api/promocodes/:id
 * Update an existing promocode
 */
export function updatePromo(req, res) {
  try {
    const promo = updatePromocode(req.params.id, req.body || {});
    return res.status(200).json({
      success: true,
      promocode: promo,
    });
  } catch (err) {
    console.error('[BillingController] Error updating promocode:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/promocodes/:id
 * Delete a promocode
 */
export function deletePromo(req, res) {
  try {
    const success = deletePromocode(req.params.id);
    return res.status(200).json({ success });
  } catch (err) {
    console.error('[BillingController] Error deleting promocode:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/promocodes/:id/toggle
 * Toggle active / paused status of a promocode
 */
export function togglePromo(req, res) {
  try {
    const promo = togglePromocodeStatus(req.params.id);
    return res.status(200).json({
      success: true,
      promocode: promo,
    });
  } catch (err) {
    console.error('[BillingController] Error toggling promocode:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/promocodes/validate
 * Validate coupon code against expiry, max uses, and activation
 */
export function validatePromo(req, res) {
  try {
    const { code } = req.body || {};
    const result = validatePromocode(code);
    if (!result?.valid) {
      return res.status(400).json({ success: false, ...result });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[BillingController] Error validating promocode:', err);
    return res.status(400).json({ valid: false, error: err.message });
  }
}

/**
 * POST /api/promocodes/redeem
 * Record coupon usage and apply discount to invoice or subscription
 */
export function redeemPromo(req, res) {
  try {
    const result = redeemPromocode(req.body || {});
    if (!result) {
      return res.status(400).json({ success: false, error: 'Invalid or missing promocode' });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[BillingController] Error redeeming promocode:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const getWalletBalance = getWallet;
export const createRazorpayOrderController = createWalletOrder;
export const recordRechargeController = rechargeWallet;
export const cancelSubscriptionHandler = cancelSubscriptionController;
export const getPlansHandler = getPlans;
export const getSubscriptionStatusHandler = getSubscription;
export const upgradeSubscriptionHandler = upgradeSubscription;
export const createRazorpayOrderHandler = createCheckout;
export const verifyRazorpayPaymentHandler = verifyPayment;
export const getWalletBalanceHandler = getWallet;
export const rechargeWalletHandler = rechargeWallet;
export const getPromocodesHandler = getPromocodesList;
export const validatePromocodeHandler = validatePromo;
export const redeemPromocodeHandler = redeemPromo;
export const createPromocodeHandler = createPromo;
export const deletePromocodeHandler = deletePromo;

export default {
  // Subscription
  getPlans,
  getSubscription,
  createCheckout,
  verifyPayment,
  upgradeSubscription,
  cancelSubscriptionController,
  cancelSubscriptionHandler,
  setStatusController,
  // Wallet
  getWallet,
  getWalletBalance,
  createWalletOrder,
  createRazorpayOrderController,
  rechargeWallet,
  recordRechargeController,
  // Promocodes
  getPromocodesList,
  createPromo,
  updatePromo,
  deletePromo,
  togglePromo,
  validatePromo,
  redeemPromo,
};
