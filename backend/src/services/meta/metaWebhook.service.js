import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { supabase } from '../../config/supabase.js';
import { env } from '../../config/env.js';
import { DEFAULT_META_VERIFY_TOKEN } from '../../config/meta.constants.js';
import { getTenantByPhoneNumberId } from './tenantMetaManager.js';
import {
  sendWhatsAppMessage,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppTypingIndicator,
  sendInstagramMessage,
  sendMessengerMessage,
} from './metaClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');

// Storage file paths
const TEMPLATES_FILE = path.join(DATA_DIR, 'templatesStore.json');

// --- Modular CRM & AI Service Integrations ---
import {
  isManualMode,
  setManualMode,
} from '../crm/manualAgent.service.js';

import {
  getQualificationSession,
  updateQualificationSession,
  clearQualificationSession,
} from '../crm/leadQualification.js';

import {
  sendLeadToGoogleSheets,
} from '../crm/googleSheets.service.js';

import {
  generateAIResponse,
} from '../ai/ai.service.js';

export {
  isManualMode,
  setManualMode,
  getQualificationSession,
  updateQualificationSession,
  clearQualificationSession,
  sendLeadToGoogleSheets,
};

// Delegated AI caller utilizing AI Autonomous Brain
async function callAiConcierge(params) {
  return await generateAIResponse(params);
}

/**
 * 1. Webhook Handshake Verification (GET /webhook)
 */
export function verifyWebhookChallenge({ mode, token, challenge }) {
  const configuredToken =
    env.META_WHATSAPP_VERIFY_TOKEN || env.META_WEBHOOK_VERIFY_TOKEN || DEFAULT_META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === configuredToken && challenge) {
    return { isValid: true, challenge, status: 200 };
  }

  if (!mode && !token) {
    return {
      isValid: false,
      message: 'Dhigrowth CRM Webhook Gateway Online',
      status: 200,
    };
  }

  return {
    isValid: false,
    status: 403,
    error: 'Verification failed: token mismatch or invalid mode.',
  };
}

export function handleMetaVerification(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[MetaWebhook] Verification check: mode="${mode}", token="${token}"`);

  const verification = verifyWebhookChallenge({ mode, token, challenge });
  if (verification.isValid) {
    return res.status(200).send(verification.challenge);
  }

  if (verification.status === 200 && verification.message) {
    return res.status(200).send(verification.message);
  }

  return res.status(403).send(verification.error || 'Verification failed');
}

/**
 * 2. Parse & Record Delivery Receipts and Message Statuses
 *
 * @param {Array<Object>|Object} entryOrStatuses Array of status objects or entry
 * @returns {Promise<Array<Object>>} Parsed status records
 */
export async function parseMessageStatuses(entryOrStatuses) {
  let statuses = [];
  if (Array.isArray(entryOrStatuses)) {
    statuses = entryOrStatuses;
  } else if (entryOrStatuses && Array.isArray(entryOrStatuses.statuses)) {
    statuses = entryOrStatuses.statuses;
  } else if (entryOrStatuses && entryOrStatuses.changes) {
    for (const change of entryOrStatuses.changes) {
      if (change?.value?.statuses) {
        statuses.push(...change.value.statuses);
      }
    }
  }

  if (!statuses || statuses.length === 0) {
    return [];
  }

  const parsedResults = [];

  for (const st of statuses) {
    const status = st.status; // 'delivered', 'read', 'failed', 'sent'
    const externalId = st.id;
    let errorCode = null;
    let errorMessage = null;

    if (st.errors && st.errors.length > 0) {
      console.warn(`⚠️ [MetaWebhook/Status] Message ${externalId} FAILED with error:`, JSON.stringify(st.errors));
      errorCode = st.errors[0]?.code ? String(st.errors[0].code) : null;
      errorMessage = st.errors[0]?.message || st.errors[0]?.title || JSON.stringify(st.errors[0]);
    }

    const item = {
      externalMessageId: externalId,
      status,
      recipientId: st.recipient_id,
      timestamp: st.timestamp,
      errorCode,
      errorMessage,
    };
    parsedResults.push(item);

    if (supabase && externalId && status) {
      try {
        const updateData = { status };
        if (errorCode) updateData.error_code = errorCode;
        if (errorMessage) updateData.error_message = errorMessage;

        await supabase
          .from('messages')
          .update(updateData)
          .eq('external_message_id', externalId);

        console.log(`📬 [MetaWebhook/Status] Updated ${externalId} -> ${status}`);
      } catch (dbErr) {
        console.warn(`[MetaWebhook/Status] DB update note for ${externalId}:`, dbErr.message);
      }
    }
  }

  return parsedResults;
}

/**
 * 3. Handle Interactive Button Click Actions
 *
 * @param {Object} options
 * @param {string} options.buttonId
 * @param {string} [options.buttonTitle]
 * @param {string} options.phone
 * @param {string} options.workspaceId
 * @param {string} [options.contactName]
 * @returns {Object} Action result describing the button intent
 */
export function handleInteractiveButtonClick({
  buttonId,
  buttonTitle = '',
  phone,
  workspaceId = env.DEFAULT_WORKSPACE_ID,
  contactName = '',
}) {
  const cleanId = String(buttonId || '').toLowerCase().trim();
  const cleanTitle = String(buttonTitle || '').toLowerCase().trim();

  const isSitarc =
    workspaceId === 'b0000000-0000-0000-0000-000000000002' ||
    String(workspaceId).toLowerCase().includes('sitarc');

  if (cleanId === 'btn_yes' || cleanTitle.includes('yes im interested') || cleanTitle.includes("yes, i'm interested")) {
    return {
      action: 'CONFIRM_INTEREST',
      intent: 'service_inquiry',
      workspaceId,
      phone,
      replyMessage: `Awesome, thank you for confirming, ${contactName || 'Valued Customer'}! 🎉\n\nWhich service from DhiGrowth would you like to build or automate?\n1️⃣ Mobile App or Web Platform\n2️⃣ AI Business Solutions & Auto-Pilot Bots\n3️⃣ WhatsApp CRM & Automation\n4️⃣ Custom IT Software\n\nReply with 1, 2, 3, or 4!`,
    };
  }

  if (cleanId === 'btn_more' || cleanTitle.includes('tell more') || cleanTitle.includes('tell me more')) {
    return {
      action: 'TELL_MORE',
      intent: 'service_details',
      workspaceId,
      phone,
      replyMessage: `DhiGrowth specializes in building bespoke digital solutions:\n\n📱 *Mobile & Web Apps*: Native & Cross-platform apps with modern UI.\n🤖 *AI Auto-Pilot*: Intelligent assistants that automate customer operations.\n💬 *WhatsApp CRM*: Official Meta Cloud API broadcasts, workflows, and team inboxes.\n\nWhich of these would you like to explore?`,
    };
  }

  if (cleanId === 'btn_quote' || cleanTitle.includes('request test quote') || cleanTitle.includes('quote')) {
    return {
      action: 'REQUEST_TEST_QUOTE',
      intent: 'sitarc_quote',
      workspaceId: 'b0000000-0000-0000-0000-000000000002',
      phone,
      replyMessage: `Thank you for requesting a test quote from *Si'Tarc Testing Laboratory*! 🔬\n\nPlease share:\n1. Equipment / Product type (e.g. Submersible pump, Motor, Gauge)\n2. Applicable standard or test requirement\n3. Number of samples`,
    };
  }

  if (cleanId === 'btn_engineer' || cleanTitle.includes('connect engineer')) {
    return {
      action: 'CONNECT_ENGINEER',
      intent: 'sitarc_engineer',
      workspaceId: 'b0000000-0000-0000-0000-000000000002',
      phone,
      replyMessage: `🔬 A Si'Tarc Senior Testing Engineer has been notified. An engineer will contact you on ${phone} shortly.`,
    };
  }

  return {
    action: 'CUSTOM_BUTTON',
    buttonId: cleanId,
    buttonTitle,
    workspaceId,
    phone,
  };
}

/**
 * 4. Conversational Lead Qualification Handler
 */
async function handleLeadQualificationTurn({
  senderIdentifier,
  customerName,
  messageText,
  channelType,
  effectiveWorkspaceId,
  conversationId,
  channelId,
  recipientPhone,
  phoneNumberId,
  accessToken,
  businessPhone,
  sendReply,
  contactId,
}) {
  const cleanMsg = (messageText || '').trim();
  const lowerMsg = cleanMsg.toLowerCase();
  const session = getQualificationSession(senderIdentifier);
  const cleanPhone = (recipientPhone || senderIdentifier).replace(/[^0-9]/g, '');

  const dispatchBotReply = async (replyText) => {
    let outWamid = null;
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (sendReply) {
      try {
        const res = await sendReply(replyText);
        outWamid = res?.messages?.[0]?.id || null;
      } catch (err) {
        console.warn('[MetaWebhook/Qualification] sendReply error:', err.message);
      }
    }

    if (supabase) {
      try {
        await supabase.from('messages').insert([
          {
            workspace_id: effectiveWorkspaceId,
            conversation_id: conversationId,
            channel_id: channelId,
            direction: 'outbound',
            ai_generated: true,
            type: 'text',
            content: replyText,
            status: outWamid ? 'sent' : 'failed',
            external_message_id: outWamid,
          },
        ]);
        await supabase
          .from('conversations')
          .update({
            last_message_text: replyText,
            last_message_at: new Date().toISOString(),
            unread_count: 0,
          })
          .eq('id', conversationId);
      } catch (dbErr) {
        console.warn('[MetaWebhook/Qualification] DB record note:', dbErr.message);
      }
    }
    return outWamid;
  };

  const isQuestionOrInquiry = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    if (lower.includes('?')) return true;
    const inquiryKeywords = [
      'about', 'who', 'where', 'how', 'why', 'what', 'whats', "what's",
      'tell', 'explain', 'detail', 'details', 'info', 'information',
      'services', 'service', 'pricing', 'price', 'cost', 'charge', 'charges', 'fee', 'quote', 'rate',
      'founder', 'ceo', 'owner', 'team', 'company', 'dhigrowth', 'office', 'address', 'location',
      'can you', 'could you', 'will you', 'do you', 'may i', 'help', 'assist',
      'meet', 'meeting', 'gmeet', 'google meet', 'zoom', 'call', 'schedule',
      'human', 'agent', 'person', 'stop', 'dont reply', "don't reply", 'understand',
    ];
    return inquiryKeywords.some((kw) => lower.includes(kw));
  };

  const isSitarcTenant =
    effectiveWorkspaceId === 'b0000000-0000-0000-0000-000000000002' ||
    phoneNumberId === '1399911839867541' ||
    String(businessPhone || '').includes('9487580473') ||
    String(effectiveWorkspaceId || '').toLowerCase().includes('sitarc');

  if (['reset', 'restart', 'start over', 'menu', 'hi', 'hello', 'hey', 'start'].includes(lowerMsg)) {
    clearQualificationSession(senderIdentifier);
  }

  const isGreetingOnly = ['hi', 'hello', 'hey', 'start', 'hlo', 'hai', 'hola', 'hi!'].includes(lowerMsg);
  const isYesClick =
    lowerMsg.includes("yes, i'm interested") ||
    lowerMsg.includes('yes, interested') ||
    lowerMsg.includes('yes im interested') ||
    lowerMsg === 'btn_yes' ||
    lowerMsg === 'yes';
  const isTellMore = lowerMsg.includes('tell me more') || lowerMsg.includes('tell more') || lowerMsg === 'btn_more';
  const isUserAskingQuestion = isQuestionOrInquiry(cleanMsg);

  if (isUserAskingQuestion && !isYesClick) {
    return false;
  }

  // Initial greeting/inquiry
  if (!session || session.step === 'COMPLETED') {
    if ((isGreetingOnly && !isUserAskingQuestion) || isYesClick || isTellMore) {
      const knownName =
        customerName && !customerName.startsWith('Customer') && !customerName.startsWith('Instagram')
          ? customerName
          : null;

      updateQualificationSession(senderIdentifier, {
        step: 'AWAITING_SERVICE',
        channel: channelType,
        phone: cleanPhone ? `+${cleanPhone}` : senderIdentifier,
        name: knownName,
      });

      let welcomeMsg = isSitarcTenant
        ? `Hello 👋 Welcome to *Si'Tarc Testing & Calibration Laboratory*, Coimbatore 🔬\n\nHow can our accredited laboratory assist you today?\n\n1️⃣ *Pump & Motor Testing* (IS standards, BEE Star Rating)\n2️⃣ *Calibration Services* (NABL / ISO 17025 Accredited)\n3️⃣ *Mechanical, Electrical & Chemical Testing*\n4️⃣ *Water & Food Testing*\n\nReply with 1, 2, 3, 4 or tap below to connect with our technical engineers!`
        : `Hello! 👋 Welcome to *DhiGrowth IT Services*.\n\nHow can our AI Business Concierge help you today? 🤖\n\nWe help businesses with:\n📱 *App Development*\n🤖 *AI Business Solutions & Development*\n💬 *WhatsApp CRM & Automation*\n💻 *Custom IT Solutions*\n\nTell us what your business needs, and let's build something powerful together! 🚀`;

      if (knownName) {
        welcomeMsg = welcomeMsg.replace(/\{\{name\}\}/gi, knownName);
      }

      const imageUrl = isSitarcTenant
        ? 'https://www.sitarc.com/images/logo.png'
        : 'https://www.dhigrowth.com/logo.png';

      const templateButtons = isSitarcTenant
        ? [
            { id: 'btn_quote', title: 'Request Test Quote' },
            { id: 'btn_engineer', title: 'Connect Engineer' },
          ]
        : [
            { id: 'btn_yes', title: 'Yes im interested' },
            { id: 'btn_more', title: 'Tell more' },
          ];

      if (channelType === 'whatsapp' && phoneNumberId && accessToken) {
        try {
          const interactiveRes = await sendWhatsAppInteractiveButtons({
            phoneNumberId,
            accessToken,
            recipientPhone: cleanPhone,
            headerText: isSitarcTenant ? "Si'Tarc Testing Laboratory" : 'DhiGrowth IT Services',
            imageUrl,
            bodyText: welcomeMsg,
            footerText: 'Tap an option to respond:',
            buttons: templateButtons,
          });

          if (interactiveRes?.messages?.[0]?.id) {
            const wamid = interactiveRes.messages[0].id;
            if (supabase) {
              await supabase.from('messages').insert([
                {
                  workspace_id: effectiveWorkspaceId,
                  conversation_id: conversationId,
                  channel_id: channelId,
                  direction: 'outbound',
                  ai_generated: true,
                  type: 'interactive',
                  content: welcomeMsg,
                  media_url: imageUrl,
                  status: 'sent',
                  external_message_id: wamid,
                },
              ]);
            }
            return true;
          }
        } catch (btnErr) {
          console.warn('[MetaWebhook/Qualification] Interactive buttons fallback:', btnErr.message);
        }
      }

      await dispatchBotReply(welcomeMsg);
      return true;
    }
  }

  // Multi-turn handling
  if (session) {
    if (session.step === 'AWAITING_SERVICE') {
      const isAffirmation =
        isYesClick ||
        isTellMore ||
        lowerMsg === 'btn_quote' ||
        lowerMsg === 'btn_engineer' ||
        lowerMsg.includes('quote') ||
        lowerMsg.includes('connect');

      if (isAffirmation) {
        const knownName =
          session.name ||
          (customerName && !customerName.startsWith('Customer') ? customerName : 'Valued Customer');
        const finalPhone = cleanPhone ? `+${cleanPhone}` : senderIdentifier;

        sendLeadToGoogleSheets({
          name: knownName,
          phone: finalPhone,
          service: isSitarcTenant ? "Si'Tarc Testing & Calibration" : 'DhiGrowth Services',
          purpose: `Customer confirmed interest: "${cleanMsg}"`,
          channel: channelType === 'whatsapp' ? 'WhatsApp' : 'Instagram',
          workspaceId: effectiveWorkspaceId,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }).catch((err) => console.warn('[MetaWebhook/Sheets] AutoSync error:', err.message));

        const reply = isSitarcTenant
          ? `Awesome, thank you for confirming, *${knownName}*! 🔬\n\nWhich service from Si'Tarc Laboratory do you require?\n1️⃣ Pump & Motor Testing\n2️⃣ Calibration Services\n3️⃣ Electrical, Chemical & Mechanical Testing\n4️⃣ Water & Food Testing\n\n👉 Reply with 1, 2, 3, or 4:`
          : `Awesome, thank you for confirming, *${knownName}*! 🎉\n\nWhich service from DhiGrowth would you like to build or automate?\n1️⃣ Mobile App or Web Platform\n2️⃣ AI Business Solutions & Auto-Pilot Bots\n3️⃣ WhatsApp CRM & Automation\n4️⃣ Custom IT Software\n\n👉 Reply with 1, 2, 3, or 4:`;

        await dispatchBotReply(reply);
        return true;
      }

      let selectedService = null;
      if (isSitarcTenant) {
        if (lowerMsg === '1' || lowerMsg.includes('pump') || lowerMsg.includes('motor')) {
          selectedService = 'Pump & Motor Testing (IS / BEE Standards)';
        } else if (lowerMsg === '2' || lowerMsg.includes('calib') || lowerMsg.includes('gauge')) {
          selectedService = 'Calibration Services (NABL / ISO 17025 Accredited)';
        } else if (lowerMsg === '3' || lowerMsg.includes('chemical') || lowerMsg.includes('electrical')) {
          selectedService = 'Electrical, Chemical & Mechanical Testing';
        } else if (lowerMsg === '4' || lowerMsg.includes('water') || lowerMsg.includes('food')) {
          selectedService = 'Water & Food Testing';
        }
      } else {
        if (lowerMsg === '1' || lowerMsg.includes('app') || lowerMsg.includes('mobile')) {
          selectedService = 'Mobile App & Web Development';
        } else if (lowerMsg === '2' || lowerMsg.includes('ai') || lowerMsg.includes('bot')) {
          selectedService = 'AI Business Solutions & Auto-Pilot Bots';
        } else if (lowerMsg === '3' || lowerMsg.includes('whatsapp') || lowerMsg.includes('crm')) {
          selectedService = 'WhatsApp CRM & Marketing Automation';
        } else if (lowerMsg === '4' || lowerMsg.includes('software') || lowerMsg.includes('custom')) {
          selectedService = 'Custom IT Software & Enterprise Systems';
        }
      }

      if (!selectedService) {
        return false;
      }

      const knownName = session.name || (customerName && !customerName.startsWith('Customer') ? customerName : null);
      if (knownName) {
        updateQualificationSession(senderIdentifier, {
          step: 'AWAITING_PURPOSE',
          service: selectedService,
          name: knownName,
        });
        const askMsg = `Great choice! 🚀 We've noted your interest in *${selectedService}*.\n\nCould you please describe the *purpose or key requirements* of your project?`;
        await dispatchBotReply(askMsg);
      } else {
        updateQualificationSession(senderIdentifier, {
          step: 'AWAITING_NAME',
          service: selectedService,
        });
        const askMsg = `Great choice! 🚀 We've noted your requirement for *${selectedService}*.\n\nMay I know your *Full Name* please?`;
        await dispatchBotReply(askMsg);
      }
      return true;
    } else if (session.step === 'AWAITING_NAME') {
      if (isUserAskingQuestion || cleanMsg.split(/\s+/).length > 6) {
        return false;
      }

      const extractedName = cleanMsg
        .replace(/^(my name is|i am|this is|myself|i'm|im)\s+/i, '')
        .replace(/[.,!]/g, '')
        .trim();

      const validName = extractedName.length > 0 ? extractedName : cleanMsg;
      updateQualificationSession(senderIdentifier, {
        step: 'AWAITING_PURPOSE',
        name: validName,
      });

      const askMsg = `Nice to meet you, *${validName}*! 😊\n\nCould you please describe the *purpose or key requirements* of your project?`;
      await dispatchBotReply(askMsg);
      return true;
    } else if (session.step === 'AWAITING_PURPOSE') {
      if (isUserAskingQuestion) {
        return false;
      }

      const purpose = cleanMsg;
      const finalName = session.name || customerName || 'Valued Customer';
      const finalService = session.service || (isSitarcTenant ? "Si'Tarc Testing & Calibration" : 'DhiGrowth IT Services');
      const finalPhone = cleanPhone ? `+${cleanPhone}` : senderIdentifier;

      const leadData = {
        name: finalName,
        phone: finalPhone,
        service: finalService,
        purpose,
        channel: channelType === 'whatsapp' ? 'WhatsApp' : channelType === 'instagram' ? 'Instagram' : 'Website',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        workspaceId: effectiveWorkspaceId,
      };

      console.log(`\n🎉 [MetaWebhook/Qualification] Lead collected! Syncing to Google Sheets...`, leadData);
      const sheetResult = await sendLeadToGoogleSheets(leadData);

      if (supabase && contactId) {
        try {
          await supabase
            .from('contacts')
            .update({
              full_name: finalName,
              lead_stage: 'Qualified',
              lead_score: 90,
              notes: `Service Needed: ${finalService}\nPurpose / Requirements: ${purpose}\nGoogle Sheets Status: ${sheetResult.success ? 'Synced' : 'Pending'}\nCaptured: ${leadData.timestamp}`,
              tags: [finalService, 'Google Sheets', 'Hot Lead'],
            })
            .eq('id', contactId);
        } catch (supErr) {
          console.warn('[MetaWebhook/Qualification] Supabase contact update note:', supErr.message);
        }
      }

      clearQualificationSession(senderIdentifier);

      const confirmMsg = isSitarcTenant
        ? `Thank you so much, *${finalName}*! 🔬\n\nWe have recorded your testing requirements:\n📋 *Service:* ${finalService}\n👤 *Name:* ${finalName}\n📞 *Contact:* ${finalPhone}\n🎯 *Requirements:* ${purpose}\n\n✅ Your details have been submitted to our Si'Tarc Laboratory technical team. A laboratory engineer will review your specifications and contact you shortly with testing schedules and proforma quotes! 🔬`
        : `Thank you so much, *${finalName}*! 🎉\n\nWe have recorded your requirements:\n📋 *Service:* ${finalService}\n👤 *Name:* ${finalName}\n📞 *Contact:* ${finalPhone}\n🎯 *Purpose:* ${purpose}\n\n✅ Your details have been submitted to our DhiGrowth team & synced to our records. A solutions consultant will review your requirements and reach out to you shortly with a personalized proposal! 🚀`;

      await dispatchBotReply(confirmMsg);
      return true;
    }
  }

  return false;
}

/**
 * 5. Process Inbound Chat Message (Shared Pipeline across Channels)
 */
async function processIncomingChatMessage({
  channelType,
  senderIdentifier,
  customerName,
  messageText,
  externalMessageId,
  channelId,
  workspaceId = env.DEFAULT_WORKSPACE_ID,
  phoneNumberId,
  accessToken,
  recipientPhone,
  businessPhone = '',
  sendReply,
}) {
  const isValidUuid = (id) =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let resolvedWsId = workspaceId;
  const isSitarcTarget =
    resolvedWsId === 'b0000000-0000-0000-0000-000000000002' ||
    phoneNumberId === '1399911839867541' ||
    channelId === 'd0000000-0000-0000-0000-000000000005' ||
    String(businessPhone || '').includes('9487580473') ||
    String(resolvedWsId || '').toLowerCase().includes('sitarc');

  if (isSitarcTarget) {
    resolvedWsId = 'b0000000-0000-0000-0000-000000000002';
  }
  const effectiveWorkspaceId = isValidUuid(resolvedWsId) ? resolvedWsId : env.DEFAULT_WORKSPACE_ID;

  if (!supabase) {
    console.warn('[MetaWebhook] Supabase client not initialized. Skipping database write.');
    return { success: false, reason: 'Supabase unavailable' };
  }

  try {
    // 1. Find or create Contact
    let contactId;
    let existingContact = null;
    const cleanDigits = senderIdentifier.replace(/[^0-9]/g, '').slice(-10);

    if (supabase) {
      try {
        if (cleanDigits.length >= 7) {
          const { data: contactsList, error: qErr } = await supabase
            .from('contacts')
            .select('id')
            .ilike('phone', `%${cleanDigits}%`)
            .limit(1);

          if (!qErr && contactsList?.length > 0) {
            existingContact = contactsList[0];
          } else {
            const { data: contactsListAlt } = await supabase
              .from('contacts')
              .select('id')
              .ilike('phone_number', `%${cleanDigits}%`)
              .limit(1);
            if (contactsListAlt?.length > 0) {
              existingContact = contactsListAlt[0];
            }
          }
        }

        if (existingContact) {
          contactId = existingContact.id;
        } else {
          // Attempt insert with primary schema (name, phone)
          const { data: newContact, error: cErr } = await supabase
            .from('contacts')
            .insert([
              {
                name: customerName,
                phone: senderIdentifier,
              },
            ])
            .select('id')
            .maybeSingle();

          if (!cErr && newContact?.id) {
            contactId = newContact.id;
            console.log(`👤 [MetaWebhook] Created contact: ${customerName} (${contactId})`);
          } else {
            // Attempt insert with alternate schema (full_name, phone_number, workspace_id, ...)
            const { data: altContact, error: altErr } = await supabase
              .from('contacts')
              .insert([
                {
                  workspace_id: effectiveWorkspaceId,
                  phone_number: senderIdentifier,
                  full_name: customerName,
                  lead_stage: 'Discovery',
                  lead_score: 50,
                  source: `${channelType}_webhook`,
                },
              ])
              .select('id')
              .maybeSingle();

            if (!altErr && altContact?.id) {
              contactId = altContact.id;
              console.log(`👤 [MetaWebhook] Created contact: ${customerName} (${contactId}) in workspace ${effectiveWorkspaceId}`);
            } else {
              console.warn(`👤 [MetaWebhook] Contact sync note (using in-memory ID): ${cErr?.message || altErr?.message}`);
              contactId = crypto.randomUUID();
            }
          }
        }
      } catch (err) {
        console.warn(`[MetaWebhook] Contact query note: ${err.message}`);
        contactId = crypto.randomUUID();
      }
    } else {
      contactId = crypto.randomUUID();
    }

    // 2. Find or create Conversation
    let conversationId;
    let existingConv = null;

    if (supabase) {
      try {
        const { data: convsList } = await supabase
          .from('conversations')
          .select('id, status')
          .eq('contact_id', contactId)
          .limit(1);

        existingConv = convsList?.[0] || null;

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: newConv, error: cvErr } = await supabase
            .from('conversations')
            .insert([
              {
                contact_id: contactId,
                status: 'bot_active',
                unread_count: 1,
                last_message_text: messageText,
                last_message_at: new Date().toISOString(),
              },
            ])
            .select('id')
            .maybeSingle();

          if (!cvErr && newConv?.id) {
            conversationId = newConv.id;
          } else {
            conversationId = crypto.randomUUID();
          }
        }
      } catch (cvErr) {
        console.warn('[MetaWebhook] Conversation note:', cvErr.message);
        conversationId = crypto.randomUUID();
      }
    } else {
      conversationId = crypto.randomUUID();
    }

    // 3. Record Inbound Message in Supabase (best-effort, non-blocking)
    if (supabase) {
      try {
        await supabase.from('messages').insert([
          {
            conversation_id: conversationId,
            status: 'read',
          },
        ]);

        await supabase
          .from('conversations')
          .update({
            last_message_text: messageText,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', conversationId);
      } catch (mErr) {
        // Non-blocking
      }
    }

    // 4. Check Manual Agent Mode
    let isManual = false;
    if (
      existingConv &&
      (existingConv.status === 'human_agent' || existingConv.status === 'manual' || existingConv.status === 'agent')
    ) {
      isManual = true;
    } else if (existingConv && (existingConv.status === 'bot_active' || existingConv.status === 'ai')) {
      isManual = false;
    } else {
      isManual = isManualMode({ phone: senderIdentifier, conversationId });
    }

    if (isManual) {
      console.log(`👤 [MetaWebhook] Manual mode active for ${senderIdentifier}. Auto-reply bypassed.`);
      return { success: true, manualMode: true, conversationId };
    }

    // 5. Send Typing Animation Indicator
    if (channelType === 'whatsapp' && externalMessageId && phoneNumberId && accessToken) {
      sendWhatsAppTypingIndicator({
        phoneNumberId,
        accessToken,
        messageId: externalMessageId,
      }).catch((tErr) => console.warn('[MetaWebhook/Typing] Note:', tErr.message));
    }

    // 6. Lead Qualification Flow
    const qualificationHandled = await handleLeadQualificationTurn({
      senderIdentifier,
      customerName,
      messageText,
      channelType,
      effectiveWorkspaceId,
      conversationId,
      channelId,
      recipientPhone,
      phoneNumberId: isSitarcTarget ? '1399911839867541' : phoneNumberId,
      accessToken,
      businessPhone: isSitarcTarget ? '9487580473' : businessPhone,
      sendReply,
      contactId,
    });

    if (qualificationHandled) {
      return { success: true, leadQualification: true, conversationId };
    }

    // 7. Load Recent Conversation History (up to 8 turns)
    let conversationHistory = [];
    try {
      const { data: pastMsgs } = await supabase
        .from('messages')
        .select('direction, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (pastMsgs && pastMsgs.length > 0) {
        conversationHistory = pastMsgs.reverse().map((m) => ({
          role: m.direction === 'inbound' ? 'user' : 'assistant',
          content: m.content,
        }));
      }
    } catch (histErr) {
      console.warn('[MetaWebhook] Could not load message history:', histErr.message);
    }

    // 8. Generate AI Response
    console.log(`🤖 [MetaWebhook] Generating AI response for: "${messageText}"...`);
    const aiResult = await callAiConcierge({
      customerName,
      customerMessage: messageText,
      channelType,
      conversationHistory,
      workspaceId: effectiveWorkspaceId,
      phoneNumberId: isSitarcTarget ? '1399911839867541' : phoneNumberId,
      businessPhone: isSitarcTarget ? '9487580473' : businessPhone,
      customerPhone: senderIdentifier,
    });

    let aiResponseText = typeof aiResult === 'object' && aiResult.reply ? aiResult.reply : String(aiResult);
    let aiImageUrl = typeof aiResult === 'object' && aiResult.imageUrl ? aiResult.imageUrl : null;

    if (isSitarcTarget) {
      if (aiImageUrl?.includes('dhigrowth')) {
        aiImageUrl = 'https://www.sitarc.com/images/logo.png';
      }
      if (
        aiResponseText.toLowerCase().includes('dhigrowth') ||
        aiResponseText.toLowerCase().includes('app development') ||
        aiResponseText.toLowerCase().includes('crm automation')
      ) {
        aiResponseText = `Hello 👋 Welcome to *Si'Tarc Testing & Calibration Laboratory*, Coimbatore 🔬\n\nHow can our accredited laboratory assist you today?\n\n1️⃣ *Pump & Motor Testing* (IS standards, BEE Star Rating)\n2️⃣ *Calibration Services* (NABL / ISO 17025)\n3️⃣ *Electrical & Chemical Testing*\n4️⃣ *Water & Food Testing*\n\nReply with 1, 2, 3, or 4!`;
        aiImageUrl = 'https://www.sitarc.com/images/logo.png';
      }
    }

    // 9. Dispatch Reply via Meta Graph API
    let aiWamid = null;
    let buttonsToSend = typeof aiResult === 'object' && Array.isArray(aiResult.buttons) ? aiResult.buttons : null;

    if (sendReply) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (channelType === 'whatsapp' && buttonsToSend && buttonsToSend.length > 0 && phoneNumberId && accessToken) {
          try {
            const btnRes = await sendWhatsAppInteractiveButtons({
              phoneNumberId,
              accessToken,
              recipientPhone: recipientPhone || senderIdentifier,
              headerText: isSitarcTarget ? "Si'Tarc Testing Laboratory" : 'DhiGrowth IT Services',
              imageUrl: aiImageUrl,
              bodyText: aiResponseText,
              buttons: buttonsToSend,
            });
            aiWamid = btnRes?.messages?.[0]?.id || null;
          } catch (btnErr) {
            console.warn('[MetaWebhook] Interactive send fallback to plain text:', btnErr.message);
            const sendResult = await sendReply(aiResponseText, aiImageUrl);
            aiWamid = sendResult?.messages?.[0]?.id || null;
          }
        } else {
          const sendResult = await sendReply(aiResponseText, aiImageUrl);
          aiWamid = sendResult?.messages?.[0]?.id || null;
        }
      } catch (err) {
        console.warn(`[MetaWebhook] Reply send error:`, err.message);
      }
    }

    // 10. Record Outbound Message in Supabase
    await supabase.from('messages').insert([
      {
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: buttonsToSend && buttonsToSend.length > 0 ? 'interactive' : (aiImageUrl ? 'image' : 'text'),
        content: aiResponseText,
        media_url: aiImageUrl || null,
        status: aiWamid ? 'sent' : 'failed',
        external_message_id: aiWamid,
      },
    ]);

    await supabase
      .from('conversations')
      .update({
        last_message_text: aiResponseText,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      })
      .eq('id', conversationId);

    return { success: true, conversationId, outboundWamid: aiWamid };
  } catch (err) {
    console.error('[MetaWebhook] processIncomingChatMessage error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. Process Inbound Webhook Payload (Top-level orchestrator)
 *
 * @param {Object} body Meta webhook body
 * @param {Object} [options]
 * @returns {Promise<Object>} Processing summary
 */
export async function processInboundWebhookPayload(body, options = {}) {
  if (!body || !body.object) {
    return { success: false, reason: 'Invalid or missing webhook payload object' };
  }

  const results = [];

  // A. WhatsApp Business Account
  if (body.object === 'whatsapp_business_account') {
    const entries = Array.isArray(body.entry) ? body.entry : [body.entry].filter(Boolean);

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [entry.changes].filter(Boolean);

      for (const changeItem of changes) {
        const change = changeItem?.value;
        if (!change) continue;

        // Status Updates (Delivery Receipts)
        if (change.statuses && (!change.messages || change.messages.length === 0)) {
          const statusResults = await parseMessageStatuses(change.statuses);
          results.push({ type: 'status_update', count: statusResults.length, statuses: statusResults });
          continue;
        }

        const rawDisplayPhone = String(change.metadata?.display_phone_number || '').replace(/[^0-9]/g, '');
        const rawWabaId = String(entry.id || '').trim();
        const phoneNumberId =
          change.metadata?.phone_number_id || env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701';

        const matchedTenant = getTenantByPhoneNumberId(phoneNumberId);
        const isSitarcIncoming =
          phoneNumberId === '1399911839867541' ||
          rawDisplayPhone.includes('9487580473') ||
          rawWabaId === '1395172716062686' ||
          matchedTenant?.username === 'sitarc';

        const tenantWorkspaceId = isSitarcIncoming
          ? 'b0000000-0000-0000-0000-000000000002'
          : (matchedTenant?.workspaceId || env.DEFAULT_WORKSPACE_ID);
        const tenantAccessToken = matchedTenant?.accessToken || env.META_WHATSAPP_ACCESS_TOKEN;

        const tenantChannelId = isSitarcIncoming
          ? 'd0000000-0000-0000-0000-000000000005'
          : 'd0000000-0000-0000-0000-000000000001';

        const messages = Array.isArray(change.messages) ? change.messages : [];

        for (const message of messages) {
          const contactInfo =
            (change.contacts || []).find((c) => c.wa_id === message.from) || change.contacts?.[0];
          const senderPhone = message.from;
          const customerName = contactInfo?.profile?.name || `Customer (+${senderPhone})`;

          let messageText =
            message.text?.body ||
            message.interactive?.button_reply?.title ||
            message.interactive?.button_reply?.id ||
            message.interactive?.list_reply?.title ||
            message.interactive?.list_reply?.id ||
            message.button?.text ||
            message.button?.payload ||
            '';

          if (!messageText) {
            if (message.type === 'interactive') {
              messageText = "Yes, I'm interested";
            } else if (message.type === 'button') {
              messageText = message.button?.text || "Yes, I'm interested";
            } else if (message.type !== 'text') {
              messageText = `[${message.type} attachment]`;
            }
          }

          const buttonId = message.interactive?.button_reply?.id || message.button?.payload;
          if (buttonId) {
            handleInteractiveButtonClick({
              buttonId,
              buttonTitle: messageText,
              phone: senderPhone,
              workspaceId: tenantWorkspaceId,
              contactName,
            });
          }

          console.log(
            `\n📥 [MetaWebhook/Inbound WA] From: ${customerName} (+${senderPhone}) | Phone ID: ${phoneNumberId} | Ws: ${tenantWorkspaceId}`
          );
          console.log(`💬 Message: "${messageText}"`);

          const msgRes = await processIncomingChatMessage({
            channelType: 'whatsapp',
            senderIdentifier: `+${senderPhone}`,
            customerName,
            messageText,
            externalMessageId: message.id,
            channelId: tenantChannelId,
            workspaceId: tenantWorkspaceId,
            phoneNumberId,
            accessToken: tenantAccessToken,
            recipientPhone: senderPhone,
            businessPhone: rawDisplayPhone,
            sendReply: async (replyText, imageUrl) => {
              return sendWhatsAppMessage({
                phoneNumberId,
                accessToken: tenantAccessToken,
                recipientPhone: senderPhone,
                text: replyText,
                imageUrl,
              });
            },
          });

          results.push({ type: 'whatsapp_message', from: senderPhone, ...msgRes });
        }
      }
    }
  }

  // B. Instagram Direct Messages
  else if (body.object === 'instagram') {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (messaging && messaging.message) {
      const senderId = messaging.sender.id;
      const messageText = messaging.message.text || '[Media Attachment]';

      console.log(`\n📥 [MetaWebhook/Inbound IG] From: IG_User_${senderId} | Message: "${messageText}"`);

      const igRes = await processIncomingChatMessage({
        channelType: 'instagram',
        senderIdentifier: `@ig_${senderId}`,
        customerName: 'Instagram User',
        messageText,
        externalMessageId: messaging.message.mid,
        channelId: 'd0000000-0000-0000-0000-000000000002',
        sendReply: async (replyText, imageUrl) => {
          return sendInstagramMessage({
            recipientId: senderId,
            text: replyText,
            imageUrl,
          });
        },
      });

      results.push({ type: 'instagram_message', from: senderId, ...igRes });
    }
  }

  // C. Facebook Messenger
  else if (body.object === 'page') {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (messaging && messaging.message) {
      const senderId = messaging.sender.id;
      const messageText = messaging.message.text || '[Media Attachment]';

      console.log(`\n📥 [MetaWebhook/Inbound FB] From: Messenger_User_${senderId} | Message: "${messageText}"`);

      const fbRes = await processIncomingChatMessage({
        channelType: 'messenger',
        senderIdentifier: `fb_${senderId}`,
        customerName: 'Facebook User',
        messageText,
        externalMessageId: messaging.message.mid,
        channelId: 'd0000000-0000-0000-0000-000000000003',
        sendReply: async (replyText) => {
          return sendMessengerMessage({
            recipientId: senderId,
            text: replyText,
          });
        },
      });

      results.push({ type: 'messenger_message', from: senderId, ...fbRes });
    }
  }

  return { success: true, processedCount: results.length, results };
}

/**
 * Express Controller wrapper for POST /webhook
 */
export async function handleInboundWebhook(req, res) {
  const body = req.body;

  // Immediately respond with 200 OK within 20s as required by Meta webhook spec
  if (res && typeof res.status === 'function') {
    res.status(200).send('EVENT_RECEIVED');
  }

  if (!body || !body.object) {
    return;
  }

  try {
    await processInboundWebhookPayload(body);
  } catch (err) {
    console.error('[MetaWebhook] Background webhook processing error:', err);
  }
}

export default {
  verifyWebhookChallenge,
  handleMetaVerification,
  handleInboundWebhook,
  processInboundWebhookPayload,
  parseMessageStatuses,
  handleInteractiveButtonClick,
  isManualMode,
  setManualMode,
  getQualificationSession,
  updateQualificationSession,
  clearQualificationSession,
  sendLeadToGoogleSheets,
};
