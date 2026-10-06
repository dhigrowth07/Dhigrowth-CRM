import { env } from '../../config/env.js';
import {
  META_BASE_URL,
  getMetaMessagesUrl,
} from '../../config/meta.constants.js';
import { sanitizePhoneNumber } from '../../utils/phoneSanitizer.js';

/**
 * Meta Graph API HTTP Client for WhatsApp Cloud API, Instagram DM & Messenger
 */

/**
 * Send an outbound WhatsApp text or media message via Meta WhatsApp Cloud API
 *
 * @param {Object} options
 * @param {string} [options.phoneNumberId] - Meta Phone Number ID
 * @param {string} [options.accessToken] - Meta System User Access Token
 * @param {string} options.recipientPhone - Customer's phone number
 * @param {string} [options.text] - Message text body
 * @param {string} [options.imageUrl] - Optional media attachment URL
 * @returns {Promise<Object>} Meta API response data
 */
export async function sendWhatsAppMessage({
  phoneNumberId,
  accessToken,
  recipientPhone,
  text,
  imageUrl,
}) {
  const token = accessToken || env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[MetaClient] WhatsApp API credentials missing. Running in simulation mode.');
    return {
      simulated: true,
      recipient: recipientPhone,
      text,
      imageUrl,
      timestamp: new Date().toISOString(),
    };
  }

  const cleanPhone = sanitizePhoneNumber(recipientPhone);

  const payload = imageUrl
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'image',
        image: {
          link: imageUrl,
          caption: text || '',
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      };

  const response = await fetch(getMetaMessagesUrl(phoneId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[MetaClient] WhatsApp send error:', data);
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }

  return data;
}

/**
 * Send official WhatsApp typing indicator to customer's phone
 * Displays animated "typing..." status in customer's WhatsApp chat
 *
 * @param {Object} options
 * @param {string} [options.phoneNumberId]
 * @param {string} [options.accessToken]
 * @param {string} options.messageId - Inbound WhatsApp message ID being responded to
 * @returns {Promise<Object>}
 */
export async function sendWhatsAppTypingIndicator({
  phoneNumberId,
  accessToken,
  messageId,
}) {
  const token = accessToken || env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId || !messageId) {
    return { simulated: true };
  }

  try {
    const response = await fetch(getMetaMessagesUrl(phoneId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
        typing_indicator: {
          type: 'text',
        },
      }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[MetaClient/Typing] Indicator note:', err.message);
    return { error: err.message };
  }
}

/**
 * Send an outbound WhatsApp interactive message with quick-reply buttons (e.g. "Yes, I'm interested")
 *
 * @param {Object} options
 * @param {string} [options.phoneNumberId]
 * @param {string} [options.accessToken]
 * @param {string} options.recipientPhone
 * @param {string} [options.headerText='DhiGrowth IT Services']
 * @param {string} [options.imageUrl=null]
 * @param {string} options.bodyText
 * @param {string} [options.footerText='Tap an option to respond:']
 * @param {Array<{id: string, title: string}>} [options.buttons]
 * @returns {Promise<Object>}
 */
export async function sendWhatsAppInteractiveButtons({
  phoneNumberId,
  accessToken,
  recipientPhone,
  headerText = 'DhiGrowth IT Services',
  imageUrl = null,
  bodyText,
  footerText = 'Tap an option to respond:',
  buttons = [
    { id: 'btn_yes', title: "Yes, I'm interested" },
    { id: 'btn_more', title: 'Tell me more' },
  ],
}) {
  const token = accessToken || env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[MetaClient] WhatsApp credentials missing. Running in simulation mode.');
    return {
      simulated: true,
      recipient: recipientPhone,
      bodyText,
      buttons,
      imageUrl,
      timestamp: new Date().toISOString(),
    };
  }

  const cleanPhone = sanitizePhoneNumber(recipientPhone);

  const headerObj = imageUrl
    ? { type: 'image', image: { link: imageUrl } }
    : headerText
    ? { type: 'text', text: headerText }
    : undefined;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: headerObj,
      body: { text: bodyText },
      footer: footerText ? { text: footerText } : undefined,
      action: {
        buttons: (buttons || []).slice(0, 3).map((btn, idx) => ({
          type: 'reply',
          reply: {
            id: btn.id || `btn_${idx}_${Date.now()}`,
            title: String(btn.title || btn.text || 'Select').slice(0, 20),
          },
        })),
      },
    },
  };

  const response = await fetch(getMetaMessagesUrl(phoneId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[MetaClient] Interactive button send error:', data);
    throw new Error(data.error?.message || 'Failed to send WhatsApp interactive buttons');
  }

  return data;
}

/**
 * Send an outbound Instagram Direct Message
 *
 * @param {Object} options
 * @param {string} [options.accessToken]
 * @param {string} options.recipientId
 * @param {string} [options.text]
 * @param {string} [options.imageUrl]
 * @returns {Promise<Object>}
 */
export async function sendInstagramMessage({
  accessToken,
  recipientId,
  text,
  imageUrl,
}) {
  const token = accessToken || env.META_INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.warn('[MetaClient] Instagram API token missing. Running in simulation mode.');
    return { simulated: true, recipient: recipientId, text };
  }

  const accountId = env.META_INSTAGRAM_ACCOUNT_ID || '17841470738727338';
  const endpointUrl = `https://graph.instagram.com/v20.0/${accountId}/messages`;
  const cleanRecipient = String(recipientId || '').replace(/^@/, '').replace(/^ig_/, '');

  const payload = imageUrl && !text
    ? {
        recipient: { id: cleanRecipient },
        message: {
          attachment: {
            type: 'image',
            payload: { url: imageUrl, is_reusable: true },
          },
        },
      }
    : {
        recipient: { id: cleanRecipient },
        message: { text: text || '' },
      };

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[MetaClient] Instagram send error:', data);
    throw new Error(data.error?.message || 'Failed to send Instagram message');
  }

  return data;
}

/**
 * Send an outbound Facebook Messenger message
 *
 * @param {Object} options
 * @param {string} [options.accessToken]
 * @param {string} options.recipientId
 * @param {string} options.text
 * @returns {Promise<Object>}
 */
export async function sendMessengerMessage({
  accessToken,
  recipientId,
  text,
}) {
  const token = accessToken || env.META_MESSENGER_ACCESS_TOKEN || env.META_WHATSAPP_ACCESS_TOKEN;

  if (!token) {
    console.warn('[MetaClient] Messenger API token missing. Running in simulation mode.');
    return { simulated: true, recipient: recipientId, text };
  }

  const response = await fetch(`${META_BASE_URL}/me/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[MetaClient] Messenger send error:', data);
    throw new Error(data.error?.message || 'Failed to send Messenger message');
  }

  return data;
}

export default {
  sendWhatsAppMessage,
  sendWhatsAppTypingIndicator,
  sendWhatsAppInteractiveButtons,
  sendInstagramMessage,
  sendMessengerMessage,
};
