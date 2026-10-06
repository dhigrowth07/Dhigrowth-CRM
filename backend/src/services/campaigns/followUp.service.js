import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';
import { sendWhatsAppMessage, sendWhatsAppTypingIndicator } from '../meta/metaClient.js';
import { isManualMode } from '../crm/manualAgent.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_FILE = path.resolve(__dirname, '../../../data/followUpStore.json');

// Timing configurations
// Step 1: 2 minutes after customer's last message
export const DELAY_STEP_1_MS = 2 * 60 * 1000; // 2 minutes

// Step 2: 3 hours after customer's message (keeps conversation alive in 24-hr window)
export const DELAY_STEP_2_MS = 3 * 60 * 60 * 1000; // 3 hours

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
    const parentDir = path.dirname(STORE_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    const obj = Object.fromEntries(followUpStates);
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[FollowUpService] Failed writing followUpStore.json:', e.message);
  }
};

/**
 * Message templates for the 24-hour window follow-ups
 */
export const getFollowUpMessage = (step, customerName = 'there', isSitarc = false) => {
  const name = customerName.replace(/\(\+?[0-9]+\)/g, '').trim() || 'there';

  if (isSitarc) {
    if (step === 1) {
      return `Hi ${name}! 👋 Just checking in from *Si'Tarc Testing & Calibration Laboratory*, Coimbatore 🔬\n\nDo you have any questions regarding sample testing, instrument calibration, or test report requirements? Our laboratory engineers are ready to assist you! 📞 0422-2560473`;
    }

    return `Hello ${name}! 👋 Following up from *Si'Tarc Laboratory* 🔬\n\nOur technical testing team is available to assist with Pump, Motor, Electrical, Chemical, or Mechanical testing and on-site calibration. Reply anytime or visit www.sitarc.com for assistance! 🌟`;
  }

  if (step === 1) {
    return `Hi ${name}! 👋 Just checking in to see if you had any questions about our services or would like to share your requirements. Let us know and our team will be delighted to assist! 🚀`;
  }

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
  businessPhone = '',
  messageId = null,
}) {
  if (!recipientPhone) return;

  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  cancelExistingTimers(cleanPhone);

  const inboundTimestamp = Date.now();
  const isSitarc =
    workspaceId === 'b0000000-0000-0000-0000-000000000002' ||
    phoneNumberId === '1399911839867541' ||
    String(businessPhone || '').includes('9487580473') ||
    String(workspaceId || '').toLowerCase().includes('sitarc');
  const resolvedWsId = isSitarc ? 'b0000000-0000-0000-0000-000000000002' : workspaceId;

  const record = {
    cleanPhone,
    recipientPhone,
    customerName: customerName || (isSitarc ? 'Valued Client' : 'Valued Customer'),
    conversationId,
    channelId,
    workspaceId: resolvedWsId,
    phoneNumberId: isSitarc ? '1399911839867541' : (phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701'),
    accessToken: accessToken || env.META_WHATSAPP_ACCESS_TOKEN,
    businessPhone: isSitarc ? '9487580473' : businessPhone,
    lastMessageId: messageId || null,
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

  const timerStep1 = setTimeout(async () => {
    await executeFollowUpStep(cleanPhone, 1, inboundTimestamp);
  }, DELAY_STEP_1_MS);

  const timerStep2 = setTimeout(async () => {
    await executeFollowUpStep(cleanPhone, 2, inboundTimestamp);
  }, DELAY_STEP_2_MS);

  activeTimers.set(cleanPhone, { timerStep1, timerStep2, inboundTimestamp });
}

// Alias for checklist compatibility
export const scheduleInboundFollowUps = scheduleFollowUps;

/**
 * Cancel scheduled follow-up timers for a contact
 */
export function cancelScheduledFollowUps(recipientPhone) {
  if (!recipientPhone) return { success: false, message: 'Phone is required' };
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return { success: false, message: 'Invalid phone number' };

  cancelExistingTimers(cleanPhone);

  const record = followUpStates.get(cleanPhone);
  if (record) {
    record.step1Status = record.step1Status === 'pending' ? 'cancelled' : record.step1Status;
    record.step2Status = record.step2Status === 'pending' ? 'cancelled' : record.step2Status;
    followUpStates.set(cleanPhone, record);
    persistStore();
  }

  return { success: true, message: `Cancelled scheduled follow-ups for +${cleanPhone}` };
}

/**
 * Executes a follow-up step if conditions are met:
 * 1. Customer has not sent another inbound message since this schedule was created
 * 2. Manual agent mode is not active
 * 3. 24-hour window has not elapsed
 */
async function executeFollowUpStep(cleanPhone, step, scheduledForInboundTimestamp, isForceTest = false) {
  let record = followUpStates.get(cleanPhone);
  if (!record && isForceTest) {
    record = {
      cleanPhone,
      recipientPhone: cleanPhone,
      customerName: 'Sri',
      phoneNumberId: env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701',
      accessToken: env.META_WHATSAPP_ACCESS_TOKEN,
      workspaceId: 'b0000000-0000-0000-0000-000000000001',
      channelId: 'd0000000-0000-0000-0000-000000000001',
      conversationId: '02ac37bb-e41a-4858-923a-281ac8ae341c',
    };
  }
  if (!record) return;

  if (!isForceTest) {
    if (record.lastInboundAt > scheduledForInboundTimestamp) {
      console.log(`⏩ [FollowUpService] Step ${step} skipped for +${cleanPhone}: Customer is already actively chatting.`);
      return;
    }

    if (isManualMode({ phone: cleanPhone, conversationId: record.conversationId })) {
      console.log(`👤 [FollowUpService] Step ${step} skipped for +${cleanPhone}: Manual Agent mode is active.`);
      return;
    }

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
  }

  let isSitarc =
    record.workspaceId === 'b0000000-0000-0000-0000-000000000002' ||
    record.phoneNumberId === '1399911839867541' ||
    record.channelId === 'd0000000-0000-0000-0000-000000000005' ||
    String(record.businessPhone || '').includes('9487580473') ||
    String(record.workspaceId || '').toLowerCase().includes('sitarc');

  if (supabase && record.conversationId && !isSitarc) {
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('workspace_id, channel_id')
        .eq('id', record.conversationId)
        .maybeSingle();
      if (conv?.workspace_id === 'b0000000-0000-0000-0000-000000000002' || conv?.channel_id === 'd0000000-0000-0000-0000-000000000005') {
        isSitarc = true;
        record.workspaceId = 'b0000000-0000-0000-0000-000000000002';
        record.phoneNumberId = '1399911839867541';
        record.businessPhone = '9487580473';
      }
    } catch {}
  }

  let messageText = getFollowUpMessage(step, record.customerName, isSitarc);

  if (isSitarc && messageText.toLowerCase().includes('dhigrowth')) {
    messageText = getFollowUpMessage(step, record.customerName, true);
  }

  console.log(`\n📤 [FollowUpService] Triggering Step ${step} follow-up to ${record.customerName} (+${cleanPhone}) to keep 24-hr window active...`);
  console.log(`💬 Message: "${messageText}"`);

  if (record.phoneNumberId && record.accessToken) {
    try {
      await sendWhatsAppTypingIndicator({
        phoneNumberId: record.phoneNumberId,
        accessToken: record.accessToken,
        messageId: record.lastMessageId,
      });
    } catch {}
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

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
    phoneNumberId: env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701',
    accessToken: env.META_WHATSAPP_ACCESS_TOKEN,
    workspaceId: 'b0000000-0000-0000-0000-000000000001',
    channelId: 'd0000000-0000-0000-0000-000000000001',
  };

  followUpStates.set(cleanPhone, record);
  await executeFollowUpStep(cleanPhone, step, Date.now() + 1000, true);
  return { success: true, message: `Step ${step} follow-up triggered for +${cleanPhone}` };
}

export default {
  DELAY_STEP_1_MS,
  DELAY_STEP_2_MS,
  getFollowUpMessage,
  scheduleFollowUps,
  scheduleInboundFollowUps,
  cancelScheduledFollowUps,
  getFollowUpStatus,
  triggerTestFollowUp,
};
