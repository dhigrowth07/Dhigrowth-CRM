import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { getTenantMetaConfig } from '../services/meta/tenantMetaManager.js';
import { sendInstagramMessage, sendMessengerMessage } from '../services/meta/metaClient.js';
import {
  setManualMode,
  isManualMode,
  getAllManualModes,
} from '../services/crm/manualAgent.service.js';

/**
 * POST /api/send-message and POST /api/send-manual-message
 * Manual Outbound Message Dispatch with 24-hour window (Error 131047) auto-fallback
 */
export async function sendMessage(req, res) {
  try {
    const {
      recipientPhone,
      phone,
      to,
      text,
      message,
      conversationId = 'c1000000-0000-0000-0000-000000000001',
      channelId = 'd0000000-0000-0000-0000-000000000001',
      channelType = 'whatsapp',
      phoneNumberId,
      accessToken,
      workspaceId,
      userId,
      username,
      slug,
    } = req.body || {};

    const targetPhone = recipientPhone || phone || to;
    const messageContent = text || message;

    if (!targetPhone || !messageContent) {
      return res.status(400).json({
        success: false,
        error: 'recipientPhone and text are required',
      });
    }

    console.log(`\n📤 [MessagesController] Outbound send -> Recipient: ${targetPhone} | Channel: ${channelType} | Ws: ${workspaceId || 'default'}`);
    console.log(`💬 Content: "${messageContent}"`);

    let metaResult = null;
    const cleanPhone = String(targetPhone).replace(/[^0-9]/g, '');
    const normalizedChannel = (channelType || 'whatsapp').toLowerCase();

    if (normalizedChannel === 'whatsapp' || normalizedChannel === 'sms') {
      let sendPhoneId = (phoneNumberId || '').trim();
      let sendToken = (accessToken || '').trim();

      if (!sendPhoneId || !sendToken) {
        const tenantConfig = getTenantMetaConfig({ workspaceId, userId, username, slug });
        sendPhoneId = sendPhoneId || (tenantConfig?.phoneNumberId || '').trim();
        sendToken = sendToken || (tenantConfig?.accessToken || '').trim();
      }

      sendPhoneId = sendPhoneId || env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701';
      sendToken = sendToken || env.META_WHATSAPP_ACCESS_TOKEN;

      if (sendPhoneId && sendToken) {
        const response = await fetch(
          `https://graph.facebook.com/v20.0/${sendPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sendToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'text',
              text: { preview_url: false, body: messageContent },
            }),
          }
        );

        metaResult = await response.json();

        if (!response.ok) {
          console.warn('[MessagesController] Meta WhatsApp API note:', metaResult?.error?.message);

          // 24-hour window closed (Error 131047): automatically dispatch approved template hello_world to re-open window
          if (metaResult?.error?.code === 131047) {
            console.log(`🔄 [MessagesController] 24h window closed for ${cleanPhone}. Dispatching approved "hello_world" template...`);
            try {
              const hwRes = await fetch(
                `https://graph.facebook.com/v20.0/${sendPhoneId}/messages`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${sendToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanPhone,
                    type: 'template',
                    template: {
                      name: 'hello_world',
                      language: { code: 'en_US' },
                    },
                  }),
                }
              );
              const hwData = await hwRes.json();
              if (hwRes.ok && hwData?.messages?.[0]?.id) {
                metaResult = hwData;
                console.log('✅ [MessagesController] Approved template "hello_world" delivered to', cleanPhone, 'WAMID:', hwData.messages[0].id);
              }
            } catch (hwErr) {
              console.warn('[MessagesController] hello_world template dispatch note:', hwErr.message);
            }
          }
        } else {
          console.log(`✅ [MessagesController] Dispatched to WhatsApp Phone: ${cleanPhone} | Meta ID:`, metaResult.messages?.[0]?.id);
        }
      } else {
        console.warn(`[MessagesController] Meta WhatsApp not configured for workspace (${workspaceId || userId}). Running in simulated mode.`);
        metaResult = { simulated: true, to: cleanPhone };
      }
    } else if (normalizedChannel === 'instagram') {
      let sendToken = accessToken;
      if (!sendToken) {
        const tenantConfig = getTenantMetaConfig({ workspaceId, userId, username, slug });
        sendToken = tenantConfig?.accessToken;
      }
      sendToken = sendToken || env.META_INSTAGRAM_ACCESS_TOKEN || env.META_WHATSAPP_ACCESS_TOKEN;

      const recipientId = (targetPhone || '').replace(/^@/, '').replace(/^ig_/, '');
      if (sendToken && recipientId) {
        try {
          metaResult = await sendInstagramMessage({
            accessToken: sendToken,
            recipientId,
            text: messageContent,
          });
          console.log(`✅ [MessagesController] Dispatched to Instagram user: ${recipientId}`, metaResult);
        } catch (igErr) {
          console.warn('[MessagesController] Instagram send notice:', igErr.message);
          metaResult = { simulated: true, note: igErr.message };
        }
      } else {
        metaResult = { simulated: true, recipient: recipientId };
      }
    } else if (normalizedChannel === 'messenger') {
      let sendToken = accessToken;
      if (!sendToken) {
        const tenantConfig = getTenantMetaConfig({ workspaceId, userId, username, slug });
        sendToken = tenantConfig?.accessToken;
      }
      sendToken = sendToken || env.META_WHATSAPP_ACCESS_TOKEN;
      const recipientId = (targetPhone || '').replace(/^@/, '');

      if (sendToken && recipientId) {
        try {
          metaResult = await sendMessengerMessage({
            accessToken: sendToken,
            recipientId,
            text: messageContent,
          });
        } catch (mErr) {
          metaResult = { simulated: true, note: mErr.message };
        }
      }
    }

    // Best-effort Supabase conversation and message logging
    if (supabase) {
      try {
        const effectiveWorkspaceId = workspaceId || env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001';
        let validConversationId = conversationId;

        if (validConversationId) {
          const { data: convCheck } = await supabase.from('conversations').select('id').eq('id', validConversationId).maybeSingle();
          if (!convCheck) {
            const { data: byContact } = await supabase.from('conversations').select('id').eq('contact_id', validConversationId).maybeSingle();
            validConversationId = byContact?.id || null;
          }
        }

        if (validConversationId) {
          await supabase.from('messages').insert([
            {
              workspace_id: effectiveWorkspaceId,
              conversation_id: validConversationId,
              direction: 'outbound',
              ai_generated: false,
              status: metaResult?.messages?.[0]?.id ? 'sent' : 'delivered',
              external_message_id: metaResult?.messages?.[0]?.id || null,
            },
          ]);

          await supabase
            .from('conversations')
            .update({
              last_message_text: messageContent,
              last_message_at: new Date().toISOString(),
            })
            .eq('id', validConversationId);
        }
      } catch (dbErr) {
        // Non-blocking
      }
    }

    if (metaResult?.error && !metaResult.messages) {
      return res.status(400).json({
        success: false,
        deliveredToWhatsApp: false,
        error: metaResult.error.message,
        errorDetails: {
          message: metaResult.error.message,
          code: metaResult.error.code,
          details: metaResult.error.error_data?.details || metaResult.error.message,
        },
      });
    }

    return res.status(200).json({
      success: true,
      metaResult,
      deliveredToWhatsApp: Boolean(metaResult?.messages?.[0]?.id),
      errorDetails: null,
    });
  } catch (err) {
    console.error('[MessagesController] Outbound send error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error dispatching outbound message',
    });
  }
}

/**
 * POST /api/conversations/set-agent-mode
 * Toggle AI Auto-Pilot vs Manual Human Agent Mode
 */
export async function setAgentMode(req, res) {
  try {
    const { phone, conversationId, isAiEnabled, mode, workspaceId } = req.body || {};

    let isManual;
    if (typeof isAiEnabled === 'boolean') {
      isManual = !isAiEnabled;
    } else if (mode) {
      isManual = mode === 'manual' || mode === 'human' || mode === 'human_agent';
    } else {
      isManual = false;
    }

    // 1. Update in-memory / file-backed store
    setManualMode({ phone, conversationId, isManual });

    // 2. Best-effort status sync with Supabase
    if (supabase) {
      try {
        const newStatus = isManual ? 'human_agent' : 'bot_active';
        if (conversationId) {
          await supabase.from('conversations').update({ status: newStatus }).eq('id', conversationId);
        }
        if (phone) {
          const cleanDigits = String(phone).replace(/[^0-9]/g, '').slice(-10);
          if (cleanDigits.length >= 7) {
            const { data: contacts } = await supabase.from('contacts').select('id').ilike('phone', `%${cleanDigits}%`);
            if (contacts && contacts.length > 0) {
              const contactIds = contacts.map((c) => c.id);
              await supabase.from('conversations').update({ status: newStatus }).in('contact_id', contactIds);
            }
          }
        }
      } catch (dbErr) {
        console.warn('[MessagesController] Supabase status sync note:', dbErr.message);
      }
    }

    console.log(`👤 [MessagesController] Mode updated -> ${isManual ? 'MANUAL' : 'AI_AUTO_PILOT'} for Phone: "${phone || '-'}" Conv: "${conversationId || '-'}"`);

    return res.status(200).json({
      success: true,
      isAiEnabled: !isManual,
      mode: isManual ? 'manual' : 'ai',
      phone,
      conversationId,
    });
  } catch (err) {
    console.error('[MessagesController] Error updating agent mode:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/conversations/agent-modes and GET /api/conversations/agent-mode
 * Query active agent modes
 */
export function getAgentModes(req, res) {
  try {
    const { phone, conversationId } = req.query || {};

    if (phone || conversationId) {
      const isManual = isManualMode({ phone, conversationId });
      return res.status(200).json({
        phone,
        conversationId,
        mode: isManual ? 'manual' : 'ai',
        isAiEnabled: !isManual,
      });
    }

    const allModes = getAllManualModes();
    return res.status(200).json({
      success: true,
      modes: allModes,
    });
  } catch (err) {
    console.error('[MessagesController] Error retrieving agent modes:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Aliases for parity
export const sendManualMessage = sendMessage;
export const getAgentMode = getAgentModes;
export const setConversationAgentMode = setAgentMode;
export const getConversationAgentModes = getAgentModes;

export default {
  sendMessage,
  sendManualMessage,
  setAgentMode,
  getAgentModes,
  getAgentMode,
};
