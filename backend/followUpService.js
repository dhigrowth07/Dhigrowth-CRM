import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendWhatsAppMessage, sendWhatsAppTypingIndicator } from './metaService.js';
import { isManualMode } from './manualAgentStore.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const STORE_FILE = path.resolve(__dirname, 'followUpStore.json');

// Timing configurations
// Step 1: 2 minutes after customer's last message
export const DELAY_STEP_1_MS = 2 * 60 * 1000; // 2 minutes

// Step 2: 3 hours after customer's message (keeps conversation alive in 24-hr window)
export const DELAY_STEP_2_MS = 3 * 60 * 60 * 1000; // 3 hours

const getSupabase = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ttjtlqsfwaksyqrrutvv.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anRscXNmd2Frc3lxcnJ1dHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDM1ODIsImV4cCI6MjEwNDY3OTU4Mn0.FtIIhGCFzaQ5zjkjmHj1qABZ-kucDiArWHAgrg1i01Y';
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
};

// In-memory active timeouts: Map<string, { timerStep1, timerStep2 }>
const activeTimers = new Map();

// In-memory contact state: Map<string, ContactFollowUpState>
let followUpStates = new Map();

// Load persistent state from disk
try {
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      followUpStates = new Map(Object.entries(parsed));
    }
  }
} catch (e) {
  console.warn('[FollowUpService] Could not read followUpStore.json:', e.message);
}

const persistStore = () => {
  try {
    const obj = Object.fromEntries(followUpStates);
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[FollowUpService] Failed writing followUpStore.json:', e.message);
  }
};

/**
 * Message templates for the 24-hour window follow-ups
 */
export const getFollowUpMessage = (step, customerName = 'there') => {
  const name = customerName.replace(/\(\+?[0-9]+\)/g, '').trim() || 'there';

  if (step === 1) {
    // 2-minute follow up
    return `Hi ${name}! 👋 Just checking in to see if you had any questions about our services or would like to share your requirements. Let us know and our team will be delighted to assist! 🚀`;
  }

  // 3-hour follow up (stay in 24-hour Meta window)
  return `Hello ${name}! 👋 Just following up on your earlier inquiry with DhiGrowth. Our solutions specialists are available to share our portfolio, live client case studies, or prepare a custom quote for you. Reply anytime to continue! 🌟`;
};

/**
 * Schedules the 2-minute and 3-hour follow-up messages for a customer
 * Called whenever an inbound WhatsApp message arrives.
 */
export function scheduleFollowUps({
  recipientPhone,
  customerName,
  conversationId,
  channelId,
  workspaceId,
  phoneNumberId,
  accessToken,
}) {
  if (!recipientPhone) return;

  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  // 1. Cancel any existing timers for this contact so we don't duplicate
  cancelExistingTimers(cleanPhone);

  const inboundTimestamp = Date.now();

  const record = {
    cleanPhone,
    recipientPhone,
    customerName: customerName || 'Valued Client',
    conversationId,
    channelId,
    workspaceId,
    phoneNumberId: phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701',
    accessToken: accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN,
    lastInboundAt: inboundTimestamp,
    step1ScheduledAt: inboundTimestamp + DELAY_STEP_1_MS,
    step2ScheduledAt: inboundTimestamp + DELAY_STEP_2_MS,
    step1Status: 'pending',
    step2Status: 'pending',
    step1SentAt: null,
    step2SentAt: null,
  };

  followUpStates.set(cleanPhone, record);
  persistStore();

  console.log(`\n⏳ [FollowUpService] Registered 24-hr window follow-ups for ${record.customerName} (+${cleanPhone}):`);
  console.log(`   ⏱️ Step 1: in 2 minutes (at ${new Date(record.step1ScheduledAt).toLocaleTimeString()})`);
  console.log(`   🕒 Step 2: in 3 hours (at ${new Date(record.step2ScheduledAt).toLocaleTimeString()})\n`);

  // 2. Schedule Step 1 (2 minutes)
  const timerStep1 = setTimeout(async () => {
    await executeFollowUpStep(cleanPhone, 1, inboundTimestamp);
  }, DELAY_STEP_1_MS);

  // 3. Schedule Step 2 (3 hours)
  const timerStep2 = setTimeout(async () => {
    await executeFollowUpStep(cleanPhone, 2, inboundTimestamp);
  }, DELAY_STEP_2_MS);

  activeTimers.set(cleanPhone, { timerStep1, timerStep2, inboundTimestamp });
}

/**
 * Executes a follow-up step if conditions are met:
 * 1. Customer has not sent another inbound message since this schedule was created
 * 2. Manual agent mode is not active
 * 3. 24-hour window has not elapsed
 */
async function executeFollowUpStep(cleanPhone, step, scheduledForInboundTimestamp) {
  const record = followUpStates.get(cleanPhone);
  if (!record) return;

  // Condition 1: Check if a newer inbound message arrived after this schedule
  if (record.lastInboundAt > scheduledForInboundTimestamp) {
    console.log(`⏩ [FollowUpService] Step ${step} skipped for +${cleanPhone}: Customer is already actively chatting.`);
    return;
  }

  // Condition 2: Check if manual agent is active for this contact/conversation
  if (isManualMode({ phone: cleanPhone, conversationId: record.conversationId })) {
    console.log(`👤 [FollowUpService] Step ${step} skipped for +${cleanPhone}: Manual Agent mode is active.`);
    return;
  }

  const supabase = getSupabase();

  // Condition 3: Double check Supabase messages table for any newer inbound message in this conversation
  if (supabase && record.conversationId) {
    try {
      const scheduledIso = new Date(scheduledForInboundTimestamp).toISOString();
      const { data: newerInbounds } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', record.conversationId)
        .eq('direction', 'inbound')
        .gt('created_at', scheduledIso)
        .limit(1);

      if (newerInbounds && newerInbounds.length > 0) {
        console.log(`⏩ [FollowUpService] Step ${step} skipped for +${cleanPhone}: Customer replied in Supabase.`);
        return;
      }
    } catch (dbErr) {
      console.warn('[FollowUpService] Error checking Supabase inbound messages:', dbErr.message);
    }
  }

  const messageText = getFollowUpMessage(step, record.customerName);

  console.log(`\n📤 [FollowUpService] Triggering Step ${step} follow-up to ${record.customerName} (+${cleanPhone}) to keep 24-hr window active...`);
  console.log(`💬 Message: "${messageText}"`);

  // 1. Send Typing indicator to customer's WhatsApp
  if (record.phoneNumberId && record.accessToken) {
    try {
      await sendWhatsAppTypingIndicator({
        phoneNumberId: record.phoneNumberId,
        accessToken: record.accessToken,
        // typing indicator can be sent with phone
      });
    } catch {
      // ignore typing error
    }
  }

  // Wait 1.2s for typing animation
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // 2. Send WhatsApp message via Meta Cloud API
  let sentWamid = null;
  try {
    const res = await sendWhatsAppMessage({
      phoneNumberId: record.phoneNumberId,
      accessToken: record.accessToken,
      recipientPhone: cleanPhone,
      text: messageText,
    });
    sentWamid = res?.messages?.[0]?.id || null;
    console.log(`✅ [FollowUpService] Step ${step} follow-up delivered! WAMID: ${sentWamid}`);
  } catch (sendErr) {
    console.error(`❌ [FollowUpService] Failed to deliver Step ${step} follow-up:`, sendErr.message);
  }

  // 3. Record outbound message in Supabase
  if (supabase && record.conversationId) {
    try {
      await supabase.from('messages').insert([
        {
          workspace_id: record.workspaceId,
          conversation_id: record.conversationId,
          channel_id: record.channelId,
          direction: 'outbound',
          ai_generated: true,
          type: 'text',
          content: messageText,
          status: sentWamid ? 'sent' : 'failed',
          external_message_id: sentWamid,
        },
      ]);

      await supabase
        .from('conversations')
        .update({
          last_message_text: messageText,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', record.conversationId);

      console.log(`✅ [FollowUpService] Step ${step} recorded in Supabase conversation ${record.conversationId}`);
    } catch (saveErr) {
      console.warn('[FollowUpService] Error saving follow-up message to Supabase:', saveErr.message);
    }
  }

  // 4. Update state
  if (step === 1) {
    record.step1Status = sentWamid ? 'sent' : 'failed';
    record.step1SentAt = new Date().toISOString();
  } else {
    record.step2Status = sentWamid ? 'sent' : 'failed';
    record.step2SentAt = new Date().toISOString();
  }

  followUpStates.set(cleanPhone, record);
  persistStore();
}

/**
 * Cancel existing timers for a contact
 */
function cancelExistingTimers(cleanPhone) {
  const existing = activeTimers.get(cleanPhone);
  if (existing) {
    if (existing.timerStep1) clearTimeout(existing.timerStep1);
    if (existing.timerStep2) clearTimeout(existing.timerStep2);
    activeTimers.delete(cleanPhone);
  }
}

/**
 * Returns active follow-up state for all or a single contact
 */
export function getFollowUpStatus(phone) {
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return followUpStates.get(cleanPhone) || null;
  }
  return Array.from(followUpStates.values());
}

/**
 * Trigger immediate test follow-up for a phone number (step 1 or step 2)
 */
export async function triggerTestFollowUp(phone, step = 1) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const record = followUpStates.get(cleanPhone) || {
    cleanPhone,
    recipientPhone: phone,
    customerName: 'Test Contact',
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701',
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN,
    workspaceId: 'b0000000-0000-0000-0000-000000000001',
    channelId: 'd0000000-0000-0000-0000-000000000001',
  };

  await executeFollowUpStep(cleanPhone, step, Date.now() + 1000);
  return { success: true, message: `Step ${step} follow-up triggered for +${cleanPhone}` };
}
