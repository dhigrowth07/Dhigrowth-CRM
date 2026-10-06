import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate paths for .env: backend/.env -> root .env
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../../.env'),
];

let loadedPath = null;
for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedPath = envPath;
    break;
  }
}

if (!loadedPath) {
  dotenv.config();
} else {
  console.log(`🔐 [Config/Env] Loaded environment via dotenv from: ${path.basename(path.dirname(loadedPath))}/${path.basename(loadedPath)}`);
}

export const env = {
  // Server
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BACKEND_URL: process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Supabase Database & Auth
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DEFAULT_WORKSPACE_ID: process.env.VITE_DEFAULT_WORKSPACE_ID || process.env.DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',

  // Meta WhatsApp Cloud API
  META_WHATSAPP_PHONE_NUMBER_ID: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
  META_WHATSAPP_WABA_ID: process.env.META_WHATSAPP_WABA_ID || '',
  META_WHATSAPP_ACCESS_TOKEN: process.env.META_WHATSAPP_ACCESS_TOKEN || '',
  META_WHATSAPP_VERIFY_TOKEN: process.env.META_WHATSAPP_VERIFY_TOKEN || 'dhigrowth_webhook_secret_2026',

  // Meta App & OAuth Embedded Signup
  META_APP_ID: process.env.META_APP_ID || process.env.VITE_META_APP_ID || '1611291237194962',
  META_APP_SECRET: process.env.META_APP_SECRET || '',
  META_CONFIG_ID: process.env.META_CONFIG_ID || process.env.VITE_META_CONFIG_ID || '',

  // Meta Omnichannel (Instagram & Messenger)
  META_INSTAGRAM_ACCESS_TOKEN: process.env.META_INSTAGRAM_ACCESS_TOKEN || '',
  META_INSTAGRAM_ACCOUNT_ID: process.env.META_INSTAGRAM_ACCOUNT_ID || '17841470738727338',
  META_MESSENGER_ACCESS_TOKEN: process.env.META_MESSENGER_ACCESS_TOKEN || '',

  // Multi-LLM AI Providers
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',

  // Razorpay Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TcdoZxzN0dIYoP',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '6wEKCUJ0UXAZm6ESRTaIY4R0',

  // Integrations
  GOOGLE_SHEETS_WEBHOOK_URL: process.env.GOOGLE_SHEETS_WEBHOOK_URL || '',
};

export default env;
