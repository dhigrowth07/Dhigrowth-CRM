import { Router } from 'express';
import {
  getPlansHandler,
  getSubscriptionStatusHandler,
  cancelSubscriptionHandler,
  upgradeSubscriptionHandler,
  createRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
  getWalletBalanceHandler,
  rechargeWalletHandler,
  getPromocodesHandler,
  validatePromocodeHandler,
  redeemPromocodeHandler,
  createPromocodeHandler,
  deletePromocodeHandler,
} from '../controllers/billing.controller.js';

const router = Router();

/**
 * Billing, Razorpay, Wallet & Promocodes Routes
 * Handles SaaS tier subscriptions (Trial, Starter, Pro, Enterprise, Unlimited, Lifetime),
 * Razorpay orders and webhook signature verification, wallet recharges, and promocode redemption.
 */

// 1. SaaS Plans & Subscription Lifecycle
router.get('/api/billing/plans', getPlansHandler);
router.get('/api/billing/status', getSubscriptionStatusHandler);
router.post('/api/billing/cancel', cancelSubscriptionHandler);
router.post('/api/billing/upgrade', upgradeSubscriptionHandler);

// 2. Razorpay Orders & Payment Signature Verification
router.post('/api/billing/create-order', createRazorpayOrderHandler);
router.post('/api/billing/verify-payment', verifyRazorpayPaymentHandler);

// 3. Prepaid Message Wallet & Top-ups
router.get('/api/wallet', getWalletBalanceHandler);
router.get('/api/wallet/balance', getWalletBalanceHandler);
router.post('/api/wallet/recharge', rechargeWalletHandler);

// 4. Promocodes & Discount Engine
router.get('/api/promocodes', getPromocodesHandler);
router.post('/api/promocodes/validate', validatePromocodeHandler);
router.post('/api/promocodes/redeem', redeemPromocodeHandler);
router.post('/api/promocodes', createPromocodeHandler);
router.delete('/api/promocodes/:id', deletePromocodeHandler);

export default router;
