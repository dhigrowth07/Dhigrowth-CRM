/**
 * Meta Graph API Service for WhatsApp Cloud API, Instagram DM & Messenger
 */

const META_GRAPH_VERSION = 'v20.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Send an outbound WhatsApp text message via Meta WhatsApp Cloud API
 */
export const sendWhatsAppMessage = async ({
  phoneNumberId,
  accessToken,
  recipientPhone,
  text,
  imageUrl,
}) => {
  const token = accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[MetaService] WhatsApp API credentials missing. Running in simulation mode.');
    return {
      simulated: true,
      recipient: recipientPhone,
      text,
      imageUrl,
      timestamp: new Date().toISOString(),
    };
  }

  // Sanitize phone number (strip + and spaces)
  let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

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

  const response = await fetch(`${GRAPH_BASE_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[MetaService] WhatsApp send error:', data);
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }

  return data;
};

/**
 * Send an outbound WhatsApp interactive message with quick-reply buttons (e.g. "Yes, I'm interested")
 */
export const sendWhatsAppInteractiveButtons = async ({
  phoneNumberId,
  accessToken,
  recipientPhone,
  headerText = 'DhiGrowth IT Services',
  bodyText,
  footerText = 'Tap an option to respond:',
  buttons = [
    { id: 'btn_yes', title: "Yes, I'm interested" },
    { id: 'btn_more', title: 'Tell me more' },
  ],
}) => {
  const token = accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[MetaService] WhatsApp API credentials missing. Running in simulation mode.');
    return {
      simulated: true,
      recipient: recipientPhone,
      bodyText,
      buttons,
      timestamp: new Date().toISOString(),
    };
  }

  let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: headerText ? { type: 'text', text: headerText } : undefined,
      body: { text: bodyText },
      footer: footerText ? { text: footerText } : undefined,
      action: {
        buttons: (buttons || []).slice(0, 3).map((btn, idx) => ({
          type: 'reply',
          reply: {
            id: btn.id || `btn_${idx}_${Date.now()}`,
            title: String(btn.title || btn.text || 'Yes').slice(0, 20),
          },
        })),
      },
    },
  };

  const response = await fetch(`${GRAPH_BASE_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[MetaService] WhatsApp interactive button send error:', data);
    throw new Error(data.error?.message || 'Failed to send WhatsApp interactive message');
  }

  return data;
};

/**
 * Send an outbound Instagram Direct Message
 */
export const sendInstagramMessage = async ({
  accessToken,
  recipientId,
  text,
  imageUrl,
}) => {
  const token = accessToken || process.env.META_INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.warn('[MetaService] Instagram API credentials missing. Running in simulation mode.');
    return { simulated: true, recipient: recipientId, text };
  }

  const accountId = process.env.META_INSTAGRAM_ACCOUNT_ID || '17841470738727338';
  const endpointUrl = `https://graph.instagram.com/v20.0/${accountId}/messages`;
  const cleanRecipient = String(recipientId || '').replace(/^@/, '').replace(/^ig_/, '');

  const payload = (imageUrl && !text)
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[MetaService] Instagram send error:', data);
    throw new Error(data.error?.message || 'Failed to send Instagram message');
  }

  return data;
};

/**
 * Send an outbound Facebook Messenger message
 */
export const sendMessengerMessage = async ({
  accessToken,
  recipientId,
  text,
}) => {
  const token = accessToken || process.env.META_MESSENGER_ACCESS_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN;

  if (!token) {
    console.warn('[MetaService] Messenger API credentials missing. Running in simulation mode.');
    return { simulated: true, recipient: recipientId, text };
  }

  const response = await fetch(`${GRAPH_BASE_URL}/me/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[MetaService] Messenger send error:', data);
    throw new Error(data.error?.message || 'Failed to send Messenger message');
  }

  return data;
};
