import { env } from './env.js';

export const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export const razorpayConfig = {
  keyId: env.RAZORPAY_KEY_ID,
  keySecret: env.RAZORPAY_KEY_SECRET,
  apiBase: RAZORPAY_API_BASE,
  isConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && !env.RAZORPAY_KEY_ID.includes('placeholder')),
};

export const getRazorpayAuthHeader = () => {
  if (!razorpayConfig.keyId || !razorpayConfig.keySecret) return null;
  return `Basic ${Buffer.from(`${razorpayConfig.keyId}:${razorpayConfig.keySecret}`).toString('base64')}`;
};

export default razorpayConfig;
