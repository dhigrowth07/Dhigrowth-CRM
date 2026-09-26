import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage, sendWhatsAppInteractiveButtons, sendInstagramMessage, sendMessengerMessage } from './metaService.js';
import { generateAIResponse } from './aiService.js';
import { getTenantByPhoneNumberId } from './tenantMetaManager.js';
import { isManualMode } from './manualAgentStore.js';

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

          const phoneNumberId =
            change.metadata?.phone_number_id ||
            process.env.META_WHATSAPP_PHONE_NUMBER_ID ||
            '1272943605907701';
          const matchedTenant = getTenantByPhoneNumberId(phoneNumberId);
          const tenantWorkspaceId = matchedTenant?.workspaceId || DEFAULT_WORKSPACE_ID;
          const tenantAccessToken =
            matchedTenant?.accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;

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

            // Process message in Supabase & reply
            await processIncomingChatMessage({
              channelType: 'whatsapp',
              senderIdentifier: `+${senderPhone}`,
              customerName,
              messageText,
              externalMessageId: message.id,
              channelId: 'd0000000-0000-0000-0000-000000000001',
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
  const effectiveWorkspaceId = isValidUuid(workspaceId) ? workspaceId : DEFAULT_WORKSPACE_ID;
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
    const isManualByStore = isManualMode({ phone: senderIdentifier, conversationId });
    const isManualByConvStatus = existingConv && (existingConv.status === 'human_agent' || existingConv.status === 'manual' || existingConv.status === 'agent');

    if (isManualByStore || isManualByConvStatus) {
      console.log(`👤 [WebhookHandler] Conversation ${conversationId} / Contact ${senderIdentifier} is assigned to Manual Agent (store=${isManualByStore}, status=${existingConv?.status}). AI auto-reply is COMPLETELY DISABLED.`);
      return;
    }

    // 4. Inbound Greeting Auto-Trigger: If client says 'hi', 'hello', etc., dispatch interactive buttons greeting!
    const cleanMsg = (messageText || '').toLowerCase().trim();
    const isGreeting = ['hi', 'hello', 'hey', 'start', 'menu', 'hlo', 'hai', 'hola'].includes(cleanMsg) || cleanMsg === 'hi!' || cleanMsg === 'hello!';

    if (channelType === 'whatsapp' && isGreeting && phoneNumberId && accessToken) {
      console.log(`🚀 [WebhookHandler] Inbound greeting "${messageText}" received from ${customerName}. Dispatching interactive greeting / approved template...`);
      let dispatchedWamid = null;
      const welcomeContent = "Hello sri! 👋 Welcome to DhiGrowth IT Services.\n\nAre you looking to scale your business with custom App Development, AI Auto-Pilot Bots, or WhatsApp CRM Automation?\n\nTap below to connect with our team! 🚀\n\n[Buttons: Yes, I'm interested | Tell me more]";
      const cleanPhone = (recipientPhone || senderIdentifier).replace(/[^0-9]/g, '');

      try {
        // Priority 1: Interactive Button Message (Session message - 0 cost, instant delivery, not rate-limited by marketing frequency caps)
        const interactiveRes = await sendWhatsAppInteractiveButtons({
          phoneNumberId,
          accessToken,
          recipientPhone: cleanPhone,
          headerText: 'DhiGrowth IT Services',
          bodyText: "Hello Sri! 👋 Welcome to DhiGrowth IT Services.\n\nAre you looking to scale your business with custom App Development, AI Auto-Pilot Bots, or WhatsApp CRM Automation?\n\nTap below to connect with our team! 🚀",
          footerText: 'Tap an option to respond:',
          buttons: [
            { id: 'btn_yes', title: "Yes, I'm interested" },
            { id: 'btn_more', title: 'Tell me more' },
          ],
        });

        if (interactiveRes?.messages?.[0]?.id) {
          dispatchedWamid = interactiveRes.messages[0].id;
          console.log(`✅ [WebhookHandler] Interactive greeting delivered to ${cleanPhone} (Meta WAMID: ${dispatchedWamid})`);
        }
      } catch (iErr) {
        console.warn('[WebhookHandler] Interactive button note:', iErr.message);
      }

      // Priority 2: Fallback to approved template "hi" if interactive button fails
      if (!dispatchedWamid) {
        try {
          const tplRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'template',
              template: {
                name: 'hi',
                language: { code: 'en' },
              },
            }),
          });

          const tplData = await tplRes.json();
          if (tplRes.ok && tplData.messages?.[0]?.id) {
            dispatchedWamid = tplData.messages[0].id;
            console.log(`✅ [WebhookHandler] Fallback "hi" template delivered to ${cleanPhone} (Meta WAMID: ${dispatchedWamid})`);
          } else {
            console.warn('[WebhookHandler] Meta template note:', tplData?.error?.message);
          }
        } catch (tErr) {
          console.warn('[WebhookHandler] Error sending fallback template on hi:', tErr.message);
        }
      }

      if (dispatchedWamid) {
        await supabase.from('messages').insert([
          {
            workspace_id: effectiveWorkspaceId,
            conversation_id: conversationId,
            channel_id: channelId,
            direction: 'outbound',
            ai_generated: true,
            type: 'text',
            content: welcomeContent,
            status: 'sent',
            external_message_id: dispatchedWamid,
          },
        ]);

        await supabase
          .from('conversations')
          .update({
            last_message_text: welcomeContent,
            last_message_at: new Date().toISOString(),
            unread_count: 0,
          })
          .eq('id', conversationId);

        console.log(`✨ Inbound greeting response completed! (Meta WAMID: ${dispatchedWamid})\n`);
        return;
      }
    }

    // Button quick-reply: "Yes, I'm interested" / "btn_yes" / "yes"
    const isYesClick = cleanMsg.includes("yes, i'm interested") || cleanMsg.includes("yes, interested") || cleanMsg === 'btn_yes' || cleanMsg === 'yes';
    if (isYesClick) {
      const respText = "Awesome! 🚀 We're thrilled to connect. What type of project are you looking to build?\n\n1️⃣ Mobile App or Web Platform\n2️⃣ WhatsApp AI Auto-Pilot & CRM\n3️⃣ Custom Software / Workflow Automation\n\nReply with your preference and our solutions team will assist you!";
      let outWamid = null;
      if (sendReply) {
        try {
          const res = await sendReply(respText);
          outWamid = res?.messages?.[0]?.id || null;
          console.log(`✅ [WebhookHandler] Dispatched "Yes" reply to WhatsApp (WAMID: ${outWamid})`);
        } catch (err) {
          console.warn('[WebhookHandler] sendReply error on yes button:', err.message);
        }
      }
      await supabase.from('messages').insert([{
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: 'text',
        content: respText,
        status: outWamid ? 'sent' : 'failed',
        external_message_id: outWamid,
      }]);
      await supabase.from('conversations').update({ last_message_text: respText, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
      return;
    }

    // Button quick-reply: "Tell me more" / "btn_more" / "tell me"
    const isMoreClick = cleanMsg.includes("tell me more") || cleanMsg.includes("tell me") || cleanMsg === 'btn_more' || cleanMsg === 'more';
    if (isMoreClick) {
      const respText = "At DhiGrowth IT Services, we help businesses grow with powerful technology:\n\n💻 Custom Apps & High-Converting Websites\n🤖 Meta-Approved WhatsApp Cloud API Automation\n📈 Omnichannel CRM & AI Sales Concierges\n\n👉 Learn more at: https://dhigrowth.com\n\nHow can we help your business today?";
      let outWamid = null;
      if (sendReply) {
        try {
          const res = await sendReply(respText);
          outWamid = res?.messages?.[0]?.id || null;
          console.log(`✅ [WebhookHandler] Dispatched "Tell me more" reply to WhatsApp (WAMID: ${outWamid})`);
        } catch (err) {
          console.warn('[WebhookHandler] sendReply error on tell me more:', err.message);
        }
      }
      await supabase.from('messages').insert([{
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: 'text',
        content: respText,
        status: outWamid ? 'sent' : 'failed',
        external_message_id: outWamid,
      }]);
      await supabase.from('conversations').update({ last_message_text: respText, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
      return;
    }

    // Option 1: Mobile App or Web Platform
    const isOption1 = cleanMsg === '1' || cleanMsg === '1️⃣' || cleanMsg.includes('mobile app') || cleanMsg === 'app';
    if (isOption1) {
      const respText = "Awesome choice! 📱 We engineer high-performance iOS, Android, and Web applications built for scalability with Flutter, React Native, and robust cloud APIs.\n\nCould you tell us what type of app you have in mind (e.g., E-commerce, Booking, On-Demand, or SaaS) and any key features you need?";
      let outWamid = null;
      if (sendReply) {
        try {
          const res = await sendReply(respText);
          outWamid = res?.messages?.[0]?.id || null;
          console.log(`✅ [WebhookHandler] Dispatched Option 1 reply to WhatsApp (WAMID: ${outWamid})`);
        } catch (err) {
          console.warn('[WebhookHandler] sendReply error on option 1:', err.message);
        }
      }
      await supabase.from('messages').insert([{
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: 'text',
        content: respText,
        status: outWamid ? 'sent' : 'failed',
        external_message_id: outWamid,
      }]);
      await supabase.from('conversations').update({ last_message_text: respText, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
      return;
    }

    // Option 2: WhatsApp AI Auto-Pilot & CRM
    const isOption2 = cleanMsg === '2' || cleanMsg === '2️⃣' || cleanMsg.includes('whatsapp crm') || cleanMsg.includes('crm') || cleanMsg.includes('auto-pilot');
    if (isOption2) {
      const respText = "Supercharge your business with WhatsApp Automation! 💬🤖\n\nWe provide:\n• Official Meta WhatsApp Cloud API setup\n• AI Sales Concierges (24/7 auto-pilot replies)\n• Automated Broadcast Campaigns & Lead Funnels\n• Multi-Agent Team Inbox\n\nHow many incoming leads or customer inquiries do you manage each day?";
      let outWamid = null;
      if (sendReply) {
        try {
          const res = await sendReply(respText);
          outWamid = res?.messages?.[0]?.id || null;
          console.log(`✅ [WebhookHandler] Dispatched Option 2 reply to WhatsApp (WAMID: ${outWamid})`);
        } catch (err) {
          console.warn('[WebhookHandler] sendReply error on option 2:', err.message);
        }
      }
      await supabase.from('messages').insert([{
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: 'text',
        content: respText,
        status: outWamid ? 'sent' : 'failed',
        external_message_id: outWamid,
      }]);
      await supabase.from('conversations').update({ last_message_text: respText, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
      return;
    }

    // Option 3: Custom Software / Workflow Automation
    const isOption3 = cleanMsg === '3' || cleanMsg === '3️⃣' || cleanMsg.includes('custom software') || cleanMsg.includes('workflow') || cleanMsg.includes('automation');
    if (isOption3) {
      const respText = "Fantastic! 💻 We build enterprise-grade custom software, tailored web portals, and workflow automations to save your team hours every day.\n\nCould you describe the main operational bottleneck or workflow you are looking to automate?";
      let outWamid = null;
      if (sendReply) {
        try {
          const res = await sendReply(respText);
          outWamid = res?.messages?.[0]?.id || null;
          console.log(`✅ [WebhookHandler] Dispatched Option 3 reply to WhatsApp (WAMID: ${outWamid})`);
        } catch (err) {
          console.warn('[WebhookHandler] sendReply error on option 3:', err.message);
        }
      }
      await supabase.from('messages').insert([{
        workspace_id: effectiveWorkspaceId,
        conversation_id: conversationId,
        channel_id: channelId,
        direction: 'outbound',
        ai_generated: true,
        type: 'text',
        content: respText,
        status: outWamid ? 'sent' : 'failed',
        external_message_id: outWamid,
      }]);
      await supabase.from('conversations').update({ last_message_text: respText, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
      return;
    }

    // 5. Generate AI Concierge Response for all other words and questions
    console.log(`🤖 Dhigrowth AI Concierge is generating response for: "${messageText}" with history context...`);
    const aiResult = await generateAIResponse({
      customerName,
      customerMessage: messageText,
      channelType,
      conversationHistory,
    });

    const aiResponseText = typeof aiResult === 'object' && aiResult.reply ? aiResult.reply : String(aiResult);
    const aiImageUrl = typeof aiResult === 'object' && aiResult.imageUrl ? aiResult.imageUrl : null;

    console.log(`💬 AI Reply: "${aiResponseText.slice(0, 80)}..." ${aiImageUrl ? `(Image: ${aiImageUrl})` : ''}`);

    // 5. Dispatch reply via Meta Graph API
    let aiWamid = null;
    if (sendReply) {
      try {
        const sendResult = await sendReply(aiResponseText, aiImageUrl);
        aiWamid = sendResult?.messages?.[0]?.id || null;
        console.log(`📤 Outbound reply dispatched via Meta ${channelType.toUpperCase()} API. (WAMID: ${aiWamid})`);
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
