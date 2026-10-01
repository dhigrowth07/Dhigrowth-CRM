import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage, sendWhatsAppInteractiveButtons, sendWhatsAppTypingIndicator, sendInstagramMessage, sendMessengerMessage } from './metaService.js';
import { generateAIResponse } from './aiService.js';
import { getTenantByPhoneNumberId } from './tenantMetaManager.js';
import { isManualMode } from './manualAgentStore.js';
import { sendLeadToGoogleSheets } from './googleSheetsService.js';
import {
  getQualificationSession,
  updateQualificationSession,
  clearQualificationSession,
} from './leadQualificationStore.js';
import { scheduleFollowUps } from './followUpService.js';
import { getWorkspaceTemplates } from './templateService.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getSupabase = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ttjtlqsfwaksyqrrutvv.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anRscXNmd2Frc3lxcnJ1dHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDM1ODIsImV4cCI6MjEwNDY3OTU4Mn0.FtIIhGCFzaQ5zjkjmHj1qABZ-kucDiArWHAgrg1i01Y';
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
};

const DEFAULT_WORKSPACE_ID = process.env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001';

export const handleMetaVerification = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Webhook Verification] Path: ${req.path} | Mode: ${mode} | Token: "${token}"`);

  if (mode === 'subscribe' && challenge) {
    console.log('✅ [Webhook Verification] Meta Webhook verified successfully! Challenge returned.');
    return res.status(200).send(challenge);
  }

  if (!mode && !token) {
    return res.status(200).send('Dhigrowth CRM Webhook Gateway Online');
  }

  return res.status(403).send('Verification failed');
};

/**
 * Handle Inbound Webhooks from WhatsApp, Instagram, and Messenger (POST /webhook)
 */
export const handleInboundWebhook = async (req, res) => {
  const body = req.body;

  // Immediately acknowledge receipt with 200 OK as required by Meta within 20s
  res.status(200).send('EVENT_RECEIVED');

  if (!body || !body.object) {
    return;
  }

  try {
    // 1. WhatsApp Cloud API Message Processing
    if (body.object === 'whatsapp_business_account') {
      const entries = Array.isArray(body.entry) ? body.entry : [body.entry].filter(Boolean);

      for (const entry of entries) {
        const changes = Array.isArray(entry.changes) ? entry.changes : [entry.changes].filter(Boolean);

        for (const changeItem of changes) {
          const change = changeItem?.value;
          if (!change) continue;

          // Status updates (sent/delivered/read receipts)
          if (change.statuses && (!change.messages || change.messages.length === 0)) {
            await handleMessageStatusUpdates(change.statuses);
            continue;
          }

          const rawDisplayPhone = String(change.metadata?.display_phone_number || '').replace(/[^0-9]/g, '');
          const rawWabaId = String(entry.id || '').trim();
          const phoneNumberId =
            change.metadata?.phone_number_id ||
            process.env.META_WHATSAPP_PHONE_NUMBER_ID ||
            '1272943605907701';

          let matchedTenant = getTenantByPhoneNumberId(phoneNumberId);
          const isSitarcIncoming =
            phoneNumberId === '1399911839867541' ||
            rawDisplayPhone.includes('9487580473') ||
            rawWabaId === '1395172716062686' ||
            matchedTenant?.username === 'sitarc';

          const tenantWorkspaceId = isSitarcIncoming
            ? 'b0000000-0000-0000-0000-000000000002'
            : (matchedTenant?.workspaceId || DEFAULT_WORKSPACE_ID);
          const tenantAccessToken = isSitarcIncoming
            ? (matchedTenant?.accessToken || 'EAATZCRGaYrzABSlTfQO5YOV9tU1CSCGK0P7jnbgDcTVtVaf4okjyqLEJDQ0NVjD5hdSxCVmZAb1kxsnn8xB2AK8omZBORZCHDAirZCfkCI0seV4hEoogEZAXANuQA86bwSFafNsuHerfxmTUTZCtHvBGIZCsICLd8zf4QiXGoLTTWrT1Abt4YxTg0JJoOEP1dAZDZD')
            : (matchedTenant?.accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN);

          const messages = Array.isArray(change.messages) ? change.messages : [];

          for (const message of messages) {
            const contactInfo =
              (change.contacts || []).find((c) => c.wa_id === message.from) || change.contacts?.[0];
            const senderPhone = message.from; // e.g. "919791471277"
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

            console.log(
              `\n📥 [Inbound WhatsApp] From: ${customerName} (+${senderPhone}) | Phone ID: ${phoneNumberId} | Workspace: ${tenantWorkspaceId}`
            );
            console.log(`💬 Message: "${messageText}"`);

            const tenantChannelId =
              tenantWorkspaceId === 'b0000000-0000-0000-0000-000000000002' || matchedTenant?.username === 'sitarc'
                ? 'd0000000-0000-0000-0000-000000000005'
                : 'd0000000-0000-0000-0000-000000000001';

            // Process message in Supabase & reply
            await processIncomingChatMessage({
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
          }
        }
      }
    }

    // 2. Instagram Direct Messages
    else if (body.object === 'instagram') {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      if (messaging && messaging.message) {
        const senderId = messaging.sender.id;
        const messageText = messaging.message.text || '[Media Attachment]';

        console.log(`\n📥 [Inbound Instagram] From: IG_User_${senderId}`);
        console.log(`💬 Message: "${messageText}"`);

        await processIncomingChatMessage({
          channelType: 'instagram',
          senderIdentifier: `@ig_${senderId}`,
          customerName: `Instagram User`,
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
      }
    }

    // 3. Facebook Messenger
    else if (body.object === 'page') {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      if (messaging && messaging.message) {
        const senderId = messaging.sender.id;
        const messageText = messaging.message.text || '[Media Attachment]';

        console.log(`\n📥 [Inbound Messenger] From: Messenger_User_${senderId}`);
        console.log(`💬 Message: "${messageText}"`);

        await processIncomingChatMessage({
          channelType: 'messenger',
          senderIdentifier: `fb_${senderId}`,
          customerName: `Facebook User`,
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
      }
    }
  } catch (err) {
    console.error('Error handling webhook event:', err);
  }
};

/**
 * Shared Core: Store Contact -> Conversation -> Inbound Message -> Trigger AI -> Store Outbound Reply
 */
async function processIncomingChatMessage({
  channelType,
  senderIdentifier,
  customerName,
  messageText,
  externalMessageId,
  channelId,
  workspaceId = DEFAULT_WORKSPACE_ID,
  phoneNumberId,
  accessToken,
  recipientPhone,
  sendReply,
}) {
  const isValidUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  // If Si'Tarc workspace, phone ID, or tenant name, route to standard Si'Tarc workspace
  const isSitarcTarget =
    resolvedWsId === 'b0000000-0000-0000-0000-000000000002' ||
    resolvedWsId === 'b1a0f6303e25-c325-3844-871b-c6fb9aedb713' ||
    phoneNumberId === '1399911839867541' ||
    String(resolvedWsId || '').toLowerCase().includes('sitarc');

  if (isSitarcTarget) {
    resolvedWsId = 'b0000000-0000-0000-0000-000000000002';
  }
  const effectiveWorkspaceId = isValidUuid(resolvedWsId) ? resolvedWsId : DEFAULT_WORKSPACE_ID;
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[WebhookHandler] Supabase not connected. Skipping database write.');
    return;
  }

  try {
    // 1. Find or create Contact
    let contactId;
    let existingContact = null;
    const cleanDigits = senderIdentifier.replace(/[^0-9]/g, '').slice(-10);

    if (cleanDigits.length >= 7) {
      const { data: contactsList } = await supabase
        .from('contacts')
        .select('id, full_name, phone_number')
        .eq('workspace_id', effectiveWorkspaceId)
        .ilike('phone_number', `%${cleanDigits}%`)
        .limit(1);
      existingContact = contactsList?.[0] || null;
    } else {
      const trimmed = senderIdentifier.trim();
      const { data: contactsList } = await supabase
        .from('contacts')
        .select('id, full_name, phone_number')
        .eq('workspace_id', effectiveWorkspaceId)
        .or(`phone_number.eq.${trimmed},phone_number.ilike.%${trimmed.replace(/^@/, '')}%`)
        .limit(1);
      existingContact = contactsList?.[0] || null;
    }

    if (existingContact) {
      contactId = existingContact.id;
    } else {
      const { data: newContact, error: cErr } = await supabase
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
        .select()
        .single();

      if (cErr) {
        console.error('Error creating contact:', cErr);
        return;
      }
      contactId = newContact.id;
      console.log(`👤 Created new lead: ${customerName} (${contactId}) in workspace ${effectiveWorkspaceId}`);
    }

    // 2. Find or create Conversation
    let conversationId;
    const { data: convsList } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('workspace_id', effectiveWorkspaceId)
      .eq('contact_id', contactId)
      .eq('channel_type', channelType)
      .limit(1);

    const existingConv = convsList?.[0] || null;

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv, error: cvErr } = await supabase
        .from('conversations')
        .insert([
          {
            workspace_id: effectiveWorkspaceId,
            contact_id: contactId,
            channel_id: channelId,
            channel_type: channelType,
            status: 'bot_active',
            unread_count: 1,
            last_message_text: messageText,
            last_message_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (cvErr) {
        console.error('Error creating conversation:', cvErr);
        return;
      }
      conversationId = newConv.id;
    }

    // 3. Record Inbound Message in Supabase
    const { error: msgErr } = await supabase.from('messages').insert([
      {
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'inbound',
        ai_generated: false,
        type: 'text',
        content: messageText,
        status: 'read',
        external_message_id: externalMessageId,
      },
    ]);

    if (msgErr) {
      console.error('Error inserting inbound message:', msgErr);
    } else {
      console.log('✅ Inbound message recorded in Supabase.');
    }

    // Update conversation last_message_text and last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message_text: messageText,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // 3.5 Fetch recent conversation history for rich multi-turn context
    let conversationHistory = [];
    try {
      const { data: pastMsgs } = await supabase
        .from('messages')
        .select('direction, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (pastMsgs && pastMsgs.length > 0) {
        conversationHistory = pastMsgs
          .reverse()
          .map((m) => ({
            role: m.direction === 'inbound' ? 'user' : 'assistant',
            content: m.content,
          }));
      }
    } catch (histErr) {
      console.warn('[WebhookHandler] Could not load message history:', histErr.message);
    }

    // 3.9 Check if conversation or contact phone is in Human / Manual Agent mode
    let isManual = false;
    if (existingConv && (existingConv.status === 'human_agent' || existingConv.status === 'manual' || existingConv.status === 'agent')) {
      isManual = true;
    } else if (existingConv && (existingConv.status === 'bot_active' || existingConv.status === 'ai')) {
      isManual = false;
    } else {
      isManual = isManualMode({ phone: senderIdentifier, conversationId });
    }

    if (isManual) {
      console.log(`👤 [WebhookHandler] Conversation ${conversationId} / Contact ${senderIdentifier} is assigned to Manual Agent (status=${existingConv?.status}). AI auto-reply is COMPLETELY DISABLED.`);
      return;
    }

    // 3.95 Send Official WhatsApp Typing Animation Indicator to Customer's Phone
    if (channelType === 'whatsapp' && externalMessageId && phoneNumberId && accessToken) {
      sendWhatsAppTypingIndicator({
        phoneNumberId,
        accessToken,
        messageId: externalMessageId,
      }).catch((tErr) => console.warn('[TypingIndicator] Note:', tErr.message));
    }

    // 3.96 Schedule 2-minute and 3-hour follow-up messages to maintain WhatsApp 24-hr session window
    if (channelType === 'whatsapp') {
      scheduleFollowUps({
        recipientPhone: recipientPhone || senderIdentifier,
        customerName,
        conversationId,
        channelId,
        workspaceId: effectiveWorkspaceId,
        phoneNumberId,
        accessToken,
      });
    }

    // 4. Inbound Lead Qualification & Requirements Collection Flow
    // Collects: 1. Service in DhiGrowth, 2. Customer Name, 3. Phone Number, 4. Project Purpose -> Pushes to Google Sheets
    const qualificationHandled = await handleLeadQualificationFlow({
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
      sendReply,
      supabase,
      contactId,
    });

    if (qualificationHandled) {
      console.log(`✨ [WebhookHandler] Lead qualification turn handled for ${senderIdentifier}\n`);
      return;
    }

    // 5. Generate AI Concierge Response for all other words and questions
    console.log(`🤖 Dhigrowth / Si'Tarc AI Concierge is generating response for: "${messageText}" with history context...`);
    const aiResult = await generateAIResponse({
      customerName,
      customerMessage: messageText,
      channelType,
      conversationHistory,
      workspaceId: effectiveWorkspaceId,
    });

    const aiResponseText = typeof aiResult === 'object' && aiResult.reply ? aiResult.reply : String(aiResult);
    const aiImageUrl = typeof aiResult === 'object' && aiResult.imageUrl ? aiResult.imageUrl : null;

    console.log(`💬 AI Reply: "${aiResponseText.slice(0, 80)}..." ${aiImageUrl ? `(Image: ${aiImageUrl})` : ''}`);

    // 5. Dispatch reply via Meta Graph API
    let aiWamid = null;
    if (sendReply) {
      try {
        // Allow customer to see "typing..." animation on WhatsApp for ~1.2s before the message arrives
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const aiButtons = (typeof aiResult === 'object' && Array.isArray(aiResult.buttons)) ? aiResult.buttons : null;

        const isSitarcMsg =
          effectiveWorkspaceId === 'b0000000-0000-0000-0000-000000000002' ||
          phoneNumberId === '1399911839867541' ||
          String(effectiveWorkspaceId || '').toLowerCase().includes('sitarc');

        if (channelType === 'whatsapp' && aiButtons && aiButtons.length > 0 && phoneNumberId && accessToken) {
          try {
            const btnRes = await sendWhatsAppInteractiveButtons({
              phoneNumberId,
              accessToken,
              recipientPhone: recipientPhone || senderIdentifier,
              headerText: isSitarcMsg ? "Si'Tarc Testing Laboratory" : 'DhiGrowth IT Services',
              imageUrl: aiImageUrl,
              bodyText: aiResponseText,
              buttons: aiButtons,
            });
            aiWamid = btnRes?.messages?.[0]?.id || null;
            console.log(`📤 Outbound interactive reply with buttons dispatched via Meta. (WAMID: ${aiWamid})`);
          } catch (btnErr) {
            console.warn('[WebhookHandler] Interactive button send fallback to standard send:', btnErr.message);
            const sendResult = await sendReply(aiResponseText, aiImageUrl);
            aiWamid = sendResult?.messages?.[0]?.id || null;
          }
        } else {
          const sendResult = await sendReply(aiResponseText, aiImageUrl);
          aiWamid = sendResult?.messages?.[0]?.id || null;
          console.log(`📤 Outbound reply dispatched via Meta ${channelType.toUpperCase()} API. (WAMID: ${aiWamid})`);
        }
      } catch (err) {
        console.warn(`[WebhookHandler] Could not dispatch live outbound reply with media:`, err.message);
        if (aiImageUrl) {
          try {
            console.log('Retrying with plain-text fallback...');
            const fallbackRes = await sendReply(aiResponseText, null);
            aiWamid = fallbackRes?.messages?.[0]?.id || null;
            console.log(`📤 Plain-text fallback dispatched via Meta (WAMID: ${aiWamid})`);
          } catch (fbErr) {
            console.error(`[WebhookHandler] Text fallback also failed:`, fbErr.message);
          }
        }
      }
    }

    // 6. Record AI Outbound Message in Supabase
    await supabase.from('messages').insert([
      {
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: aiImageUrl ? 'image' : 'text',
        content: aiResponseText,
        media_url: aiImageUrl || null,
        status: aiWamid ? 'sent' : 'failed',
        external_message_id: aiWamid,
      },
    ]);

    // 7. Update Conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message_text: aiResponseText,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      })
      .eq('id', conversationId);

    console.log('✨ Live Dashboard updated via Supabase Realtime!\n');
  } catch (error) {
    console.error('Error in processIncomingChatMessage:', error);
  }
}

/**
 * Conversational Lead Qualification:
 * Greets customer -> Asks for DhiGrowth service -> Asks for Name -> Asks for Purpose -> Syncs to Google Sheets & CRM
 */
async function handleLeadQualificationFlow({
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
  sendReply,
  supabase,
  contactId,
}) {
  const cleanMsg = (messageText || '').trim();
  const lowerMsg = cleanMsg.toLowerCase();
  const session = getQualificationSession(senderIdentifier);

  const cleanPhone = (recipientPhone || senderIdentifier).replace(/[^0-9]/g, '');

  // Helper to dispatch outbound reply and record in Supabase
  const dispatchBotReply = async (replyText) => {
    let outWamid = null;
    // Allow customer to see "typing..." animation on WhatsApp for ~1.2s before the message arrives
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (sendReply) {
      try {
        const res = await sendReply(replyText);
        outWamid = res?.messages?.[0]?.id || null;
      } catch (err) {
        console.warn('[LeadQualification] sendReply error:', err.message);
      }
    }
    if (supabase) {
      try {
        await supabase.from('messages').insert([{
          workspace_id: effectiveWorkspaceId,
          conversation_id: conversationId,
          channel_id: channelId,
          direction: 'outbound',
          ai_generated: true,
          type: 'text',
          content: replyText,
          status: outWamid ? 'sent' : 'failed',
          external_message_id: outWamid,
        }]);
        await supabase.from('conversations').update({
          last_message_text: replyText,
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        }).eq('id', conversationId);
      } catch (dbErr) {
        console.warn('[LeadQualification] DB record note:', dbErr.message);
      }
    }
    return outWamid;
  };

  // Helper to detect conversational questions, informational queries, or support requests
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
      'human', 'agent', 'person', 'stop', 'dont reply', "don't reply", 'understand'
    ];
    return inquiryKeywords.some((kw) => lower.includes(kw));
  };

  const isSitarcTenant =
    effectiveWorkspaceId === 'b0000000-0000-0000-0000-000000000002' ||
    phoneNumberId === '1399911839867541' ||
    String(effectiveWorkspaceId || '').toLowerCase().includes('sitarc');

  // 1. Reset / restart commands
  if (['reset', 'restart', 'start over', 'menu'].includes(lowerMsg)) {
    clearQualificationSession(senderIdentifier);
  }

  const isGreetingOnly = ['hi', 'hello', 'hey', 'start', 'hlo', 'hai', 'hola', 'hi!'].includes(lowerMsg);
  const isYesClick = lowerMsg.includes("yes, i'm interested") || lowerMsg.includes("yes, interested") || lowerMsg.includes("yes im interested") || lowerMsg.includes("im interested") || lowerMsg === 'btn_yes' || lowerMsg === 'yes';
  const isTellMore = lowerMsg.includes("tell me more") || lowerMsg.includes("tell more") || lowerMsg === 'btn_more';
  const isUserAskingQuestion = isQuestionOrInquiry(cleanMsg);

  // If the user's message is an informational question or inquiry (e.g. "About sitarc", "Tell about your services"),
  // DO NOT intercept it with qualification form steps — allow the AI Concierge to reply intelligently!
  if (isUserAskingQuestion && !isYesClick) {
    console.log(`🧠 [LeadQualification] Message "${cleanMsg}" detected as conversational question/inquiry. Passing to AI Concierge.`);
    return false;
  }

  // Check dynamic templates configured in the Templates page
  let matchedTemplate = null;
  try {
    const wsTemplates = getWorkspaceTemplates(isSitarcTenant ? 'b0000000-0000-0000-0000-000000000002' : effectiveWorkspaceId);
    if (Array.isArray(wsTemplates)) {
      matchedTemplate = wsTemplates.find((t) => {
        if (!t.footer_text) return false;
        const triggers = t.footer_text.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
        return triggers.some((tr) => lowerMsg === tr || lowerMsg.includes(tr));
      });
      if (!matchedTemplate && isGreetingOnly) {
        if (isSitarcTenant) {
          matchedTemplate = wsTemplates.find(
            (t) => t.name === 'si_tarc_testing_inquiry' || t.name === 'sitarc_testing_inquiry' || (t.footer_text && t.footer_text.includes('sitarc'))
          ) || SITARC_PRESET_TEMPLATES[0];
        } else {
          matchedTemplate = wsTemplates.find(
            (t) => t.name === 'ai_it_discovery' || t.name === 'hi' || (t.footer_text && t.footer_text.includes('hi'))
          ) || wsTemplates[0];
        }
      }
    }
  } catch (tErr) {
    console.warn('[LeadQualification] Template lookup note:', tErr.message);
  }

  // 2. Initial inquiry / greeting: start qualification session or send triggered template
  if (!session || session.step === 'COMPLETED' || matchedTemplate) {
    if ((isGreetingOnly && !isUserAskingQuestion) || isYesClick || isTellMore || matchedTemplate) {
      const knownName = customerName && !customerName.startsWith('Customer') && !customerName.startsWith('Instagram') ? customerName : null;
      updateQualificationSession(senderIdentifier, {
        step: 'AWAITING_SERVICE',
        channel: channelType,
        phone: cleanPhone ? `+${cleanPhone}` : senderIdentifier,
        name: knownName,
      });

      // Prepare dynamic template content
      let welcomeMsg = matchedTemplate?.body_text;
      if (isSitarcTenant) {
        if (!welcomeMsg || welcomeMsg.toLowerCase().includes('dhigrowth')) {
          welcomeMsg = `Hello 👋 Welcome to *Si'Tarc Testing & Calibration Laboratory*, Coimbatore 🔬\n\nHow can our accredited laboratory assist you today?\n\n1️⃣ *Pump & Motor Testing* (IS standards, BEE Star Rating)\n2️⃣ *Calibration Services* (NABL / ISO 17025 Accredited)\n3️⃣ *Mechanical, Electrical & Chemical Testing*\n4️⃣ *Water & Food Testing*\n\nReply with 1, 2, 3, 4 or tap below to connect with our technical engineers!`;
        }
      } else if (!welcomeMsg) {
        welcomeMsg = `Hello! 👋 Welcome to *DhiGrowth IT Services*.\n\nHow can our AI Business Concierge help you today? 🤖\n\nWe help businesses with:\n📱 *App Development*\n🤖 *AI Business Solutions & Development*\n💬 *WhatsApp CRM & Automation*\n💻 *Custom IT Solutions*\n\nTell us what your business needs, and let's build something powerful together! 🚀`;
      }

      if (knownName) {
        welcomeMsg = welcomeMsg.replace(/\{\{name\}\}/gi, knownName);
      } else {
        welcomeMsg = welcomeMsg.replace(/\{\{name\}\}/gi, 'there');
      }

      const imageUrl = isSitarcTenant
        ? 'https://www.sitarc.com/images/logo.png'
        : ((matchedTemplate?.header_type === 'IMAGE' && matchedTemplate?.header_content) ||
          (matchedTemplate?.header_content && matchedTemplate.header_content.startsWith('http') ? matchedTemplate.header_content : 'https://www.dhigrowth.com/logo.png'));

      let templateButtons = [];
      if (isSitarcTenant) {
        templateButtons = [
          { id: 'btn_quote', title: 'Request Test Quote' },
          { id: 'btn_engineer', title: 'Connect Engineer' },
        ];
      } else if (Array.isArray(matchedTemplate?.buttons) && matchedTemplate.buttons.length > 0) {
        templateButtons = matchedTemplate.buttons.slice(0, 3).map((b, idx) => ({
          id: b.id || `btn_${idx + 1}`,
          title: String(b.text || b.title || 'Select').slice(0, 20),
        }));
      } else {
        templateButtons = [
          { id: 'btn_yes', title: 'Yes im interested' },
          { id: 'btn_more', title: 'Tell more' },
        ];
      }

      // Try sending interactive button message first on WhatsApp
      if (channelType === 'whatsapp' && phoneNumberId && accessToken && templateButtons.length > 0) {
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
            console.log(`✅ [LeadQualification] Delivered interactive template "${matchedTemplate?.name || 'welcome'}" with buttons to ${cleanPhone}`);
            if (supabase) {
              try {
                await supabase.from('messages').insert([{
                  workspace_id: effectiveWorkspaceId,
                  conversation_id: conversationId,
                  channel_id: channelId,
                  direction: 'outbound',
                  ai_generated: true,
                  type: 'text',
                  content: welcomeMsg,
                  media_url: imageUrl,
                  status: 'sent',
                  external_message_id: wamid,
                }]);
                await supabase.from('conversations').update({
                  last_message_text: welcomeMsg,
                  last_message_at: new Date().toISOString(),
                  unread_count: 0,
                }).eq('id', conversationId);
              } catch (dbErr) {
                console.warn('[LeadQualification] DB record note:', dbErr.message);
              }
            }
            return true;
          }
        } catch (iErr) {
          console.warn('[LeadQualification] Interactive buttons fallback:', iErr.message);
        }
      }

      // Plain text fallback
      await dispatchBotReply(welcomeMsg);
      return true;
    }
  }

  // 3. Multi-turn step handling
  if (session) {
    // STEP 1: Awaiting Service
    if (session.step === 'AWAITING_SERVICE') {
      const isAffirmation = isYesClick || isTellMore || lowerMsg === 'btn_quote' || lowerMsg === 'btn_engineer' || lowerMsg === 'request test quote' || lowerMsg === 'connect engineer' || lowerMsg.includes('connect') || lowerMsg.includes('quote');
      if (isAffirmation) {
        const knownName = session.name || (customerName && !customerName.startsWith('Customer') && !customerName.startsWith('Instagram') ? customerName : (isSitarcTenant ? 'Valued Client' : 'Valued Customer'));
        const finalPhone = cleanPhone ? `+${cleanPhone}` : senderIdentifier;

        // Auto-stream confirmation to Google Sheets right away
        sendLeadToGoogleSheets({
          name: knownName,
          phone: finalPhone,
          service: isSitarcTenant ? "Si'Tarc Laboratory Testing & Calibration" : 'DhiGrowth Services (App Dev / AI Auto-Pilot / WhatsApp CRM)',
          purpose: `Customer confirmed interest: "${cleanMsg}"`,
          channel: channelType === 'whatsapp' ? 'WhatsApp' : 'Instagram',
          workspaceId: effectiveWorkspaceId,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }).catch((err) => console.warn('[Webhook AutoSync Sheets Error]:', err.message));

        const reply = isSitarcTenant
          ? `Awesome, thank you for confirming, *${knownName}*! 🔬\n\nWe've noted your interest and automatically recorded your details for our laboratory technical team.\n\nWhich service from Si'Tarc Laboratory do you require?\n\n1️⃣ *Pump & Motor Testing* (IS 8472, IS 9079, IS 9283, IS 14220, BEE Star Rating)\n2️⃣ *Calibration Services* (Electro-Technical, Thermal, Mechanical, Pressure)\n3️⃣ *Electrical, Chemical & Mechanical Testing* (Metals, polymers, cables, raw materials)\n4️⃣ *Water, Food & Environmental Testing* (Drinking water, effluent, food products)\n\n👉 *Reply with 1, 2, 3, or 4 (or describe what you need tested):*`
          : `Awesome, thank you for confirming, *${knownName}*! 🎉\n\nWe've noted your interest and automatically recorded your details for our development team.\n\nWhich service from DhiGrowth would you like to build or automate?\n\n1️⃣ *Mobile App or Web Platform*\n2️⃣ *AI Business Solutions & Auto-Pilot Bots*\n3️⃣ *WhatsApp CRM & Automation*\n4️⃣ *Custom IT Software*\n\n👉 *Reply with 1, 2, 3, or 4 (or describe what you need):*`;
        await dispatchBotReply(reply);
        return true;
      }

      let selectedService = null;
      if (isSitarcTenant) {
        if (lowerMsg === '1' || lowerMsg === '1️⃣' || /^(pump|motor|monobloc|submersible|openwell)$/i.test(lowerMsg) || (lowerMsg.includes('pump') || lowerMsg.includes('motor'))) {
          selectedService = 'Pump & Motor Testing (IS / BEE Standards)';
        } else if (lowerMsg === '2' || lowerMsg === '2️⃣' || /^(calib|calibration|gauge|dimension|thermal|pressure)$/i.test(lowerMsg) || lowerMsg.includes('calib') || lowerMsg.includes('gauge')) {
          selectedService = 'Calibration Services (NABL / ISO 17025 Accredited)';
        } else if (lowerMsg === '3' || lowerMsg === '3️⃣' || /^(electrical|chemical|mechanical|material|tensile|metal)$/i.test(lowerMsg) || lowerMsg.includes('chemical') || lowerMsg.includes('electrical') || lowerMsg.includes('mechanical')) {
          selectedService = 'Electrical, Chemical & Mechanical Testing';
        } else if (lowerMsg === '4' || lowerMsg === '4️⃣' || /^(water|food|effluent|ro\s+water|drinking)$/i.test(lowerMsg) || lowerMsg.includes('water') || lowerMsg.includes('food')) {
          selectedService = 'Water & Food Testing';
        }
      } else {
        if (lowerMsg === '1' || lowerMsg === '1️⃣' || /^(mobile\s+app|app\s+development|flutter|react\s+native|ios|android)$/i.test(lowerMsg) || (lowerMsg.includes('app') && !lowerMsg.includes('about') && !lowerMsg.includes('what'))) {
          selectedService = 'Mobile App & Web Development';
        } else if (lowerMsg === '2' || lowerMsg === '2️⃣' || /^(ai|ai\s+solutions|ai\s+bot|auto-pilot|custom\s+ai|agent)$/i.test(lowerMsg) || (lowerMsg.includes('ai') && !lowerMsg.includes('about') && !lowerMsg.includes('what'))) {
          selectedService = 'AI Business Solutions & Auto-Pilot Bots';
        } else if (lowerMsg === '3' || lowerMsg === '3️⃣' || /^(whatsapp|whatsapp\s+crm|marketing\s+automation)$/i.test(lowerMsg) || (lowerMsg.includes('whatsapp') && !lowerMsg.includes('about') && !lowerMsg.includes('what'))) {
          selectedService = 'WhatsApp CRM & Marketing Automation';
        } else if (lowerMsg === '4' || lowerMsg === '4️⃣' || /^(custom\s+software|enterprise|custom\s+it)$/i.test(lowerMsg) || (lowerMsg.includes('software') && !lowerMsg.includes('about') && !lowerMsg.includes('what'))) {
          selectedService = 'Custom IT Software & Enterprise Systems';
        }
      }

      // If user did not pick a valid numbered service or recognized service keyword,
      // DO NOT blindly capture the message as a service! Allow the AI to answer.
      if (!selectedService) {
        return false;
      }

      if (selectedService) {
        const knownName = session.name || (customerName && !customerName.startsWith('Customer') && !customerName.startsWith('Instagram') ? customerName : null);

        if (knownName) {
          updateQualificationSession(senderIdentifier, {
            step: 'AWAITING_PURPOSE',
            service: selectedService,
            name: knownName,
          });
          const askPurposeMsg = isSitarcTenant
            ? `Great choice! 🔬 We've noted your requirement for *${selectedService}*.\n\nCould you please describe your *sample or testing requirements*?\n(e.g., Equipment rating/range, number of samples, IS standard, or calibration needs)`
            : `Great choice! 🚀 We've noted your interest in *${selectedService}*.\n\nCould you please describe the *purpose or key requirements* of your project?\n(e.g., Target audience, features you need, timeline, or current challenges)`;
          await dispatchBotReply(askPurposeMsg);
        } else {
          updateQualificationSession(senderIdentifier, {
            step: 'AWAITING_NAME',
            service: selectedService,
          });
          const askNameMsg = isSitarcTenant
            ? `Great choice! 🔬 We've noted your requirement for *${selectedService}*.\n\nMay I know your *Full Name* please?`
            : `Great choice! 🚀 We've noted your interest in *${selectedService}*.\n\nMay I know your *Full Name* please?`;
          await dispatchBotReply(askNameMsg);
        }
        return true;
      }
    }

    // STEP 2: Awaiting Customer Name
    else if (session.step === 'AWAITING_NAME') {
      // If customer asks a question or sends a sentence longer than 6 words, do not treat as a name
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

      const askPurposeMsg = isSitarcTenant
        ? `Nice to meet you, *${validName}*! 🔬\n\nCould you please describe your *sample or testing requirements*?\n(e.g., Equipment rating, number of samples, IS standard, or calibration needs)`
        : `Nice to meet you, *${validName}*! 😊\n\nCould you please describe the *purpose or key requirements* of your project?\n(e.g., What features do you need, your business type, or goals?)`;
      await dispatchBotReply(askPurposeMsg);
      return true;
    }

    // STEP 3: Awaiting Purpose / Requirements
    else if (session.step === 'AWAITING_PURPOSE') {
      // If customer is asking an informational question (e.g. "Tell about your services"), do not treat it as project purpose!
      if (isUserAskingQuestion) {
        return false;
      }

      const purpose = cleanMsg;
      const finalName = session.name || customerName || (isSitarcTenant ? 'Valued Client' : 'Valued Customer');
      const defaultService = isSitarcTenant ? "Si'Tarc Testing & Calibration" : 'DhiGrowth IT Services';
      const finalService = session.service || defaultService;
      const finalPhone = cleanPhone ? `+${cleanPhone}` : (recipientPhone || senderIdentifier || '');

      const leadData = {
        name: finalName,
        phone: finalPhone,
        service: finalService,
        purpose: purpose,
        channel: channelType === 'whatsapp' ? 'WhatsApp' : channelType === 'instagram' ? 'Instagram' : 'Website',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        workspaceId: effectiveWorkspaceId,
      };

      console.log(`\n🎉 [LeadQualification] Lead requirements collected! Syncing to Google Sheets...`, leadData);

      // 1. Post to Google Sheets
      const sheetResult = await sendLeadToGoogleSheets(leadData);

      // 2. Update Supabase CRM contact with Name, Lead Stage, Tags, and Purpose Notes
      if (supabase && contactId) {
        try {
          await supabase.from('contacts').update({
            full_name: finalName,
            lead_stage: 'Qualified',
            lead_score: 90,
            notes: `Service Needed: ${finalService}\nPurpose / Requirements: ${purpose}\nGoogle Sheets Status: ${sheetResult.success ? 'Synced' : 'Pending'}\nCaptured: ${leadData.timestamp}`,
            tags: [finalService, 'Google Sheets', 'Hot Lead'],
          }).eq('id', contactId);
          console.log(`✅ [LeadQualification] Updated Supabase contact ${contactId} with qualified requirements.`);
        } catch (supErr) {
          console.warn('[LeadQualification] Supabase contact update note:', supErr.message);
        }
      }

      // 3. Mark completed and clear qualification session
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
 * Handle delivery & read receipts from Meta
 */
async function handleMessageStatusUpdates(statuses) {
  const supabase = getSupabase();
  if (!supabase || !statuses) return;
  for (const st of statuses) {
    const status = st.status; // 'delivered', 'read', 'failed'
    const externalId = st.id;
    let errorCode = null;
    let errorMessage = null;
    if (st.errors && st.errors.length > 0) {
      console.warn(`⚠️ [Meta Status] Message ${externalId} FAILED with error:`, JSON.stringify(st.errors));
      errorCode = st.errors[0]?.code ? String(st.errors[0].code) : null;
      errorMessage = st.errors[0]?.message || st.errors[0]?.title || JSON.stringify(st.errors[0]);
    }
    if (externalId && status) {
      console.log(`📬 [Meta Status Update] ${externalId} -> ${status}${errorCode ? ` (Error ${errorCode}: ${errorMessage})` : ''}`);
      const updateData = { status };
      if (errorCode) updateData.error_code = errorCode;
      if (errorMessage) updateData.error_message = errorMessage;
      await supabase
        .from('messages')
        .update(updateData)
        .eq('external_message_id', externalId);
    }
  }
}
