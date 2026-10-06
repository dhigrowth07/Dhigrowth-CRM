import { env } from '../config/env.js';
import {
  handleMetaVerification,
  handleInboundWebhook,
  processInboundWebhookPayload,
  verifyWebhookChallenge,
} from '../services/meta/metaWebhook.service.js';

/**
 * GET /webhook and GET /api/webhook
 * Meta Webhook Handshake Verification
 */
export function verifyWebhook(req, res) {
  return handleMetaVerification(req, res);
}

/**
 * POST /webhook and POST /api/webhook
 * Meta Webhook Inbound Message Receiver
 */
export async function receiveWebhook(req, res) {
  return handleInboundWebhook(req, res);
}

/**
 * POST /api/simulate-inbound and POST /api/test-inbound
 * Test Inbound Simulator Endpoint (Allows instant testing without Meta tunnel)
 */
export async function simulateInbound(req, res) {
  try {
    const {
      phone = '919791471277',
      name = 'Priya Sharma',
      message = 'Hi, can I place a COD order for the King Size Linen bedcover?',
      channel = 'whatsapp',
    } = req.body || {};

    const cleanPhone = String(phone).replace(/[^0-9]/g, '') || '919791471277';
    let simulatedPayload;

    if (channel === 'whatsapp') {
      simulatedPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '16505551111',
                    phone_number_id: env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701',
                  },
                  contacts: [{ profile: { name }, wa_id: cleanPhone }],
                  messages: [
                    {
                      from: cleanPhone,
                      id: `wamid.SIMULATED_${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      type: 'text',
                      text: { body: message },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };
    } else {
      simulatedPayload = {
        object: channel === 'instagram' ? 'instagram' : 'page',
        entry: [
          {
            id: 'TEST_ACCOUNT_ID',
            messaging: [
              {
                sender: { id: cleanPhone },
                recipient: { id: 'TEST_PAGE' },
                timestamp: Date.now(),
                message: {
                  mid: `mid.SIMULATED_${Date.now()}`,
                  text: message,
                },
              },
            ],
          },
        ],
      };
    }

    const processResult = await processInboundWebhookPayload(simulatedPayload);

    return res.status(200).json({
      success: true,
      message: 'Simulated inbound message processed successfully',
      simulatedPayload,
      result: processResult,
    });
  } catch (err) {
    console.error('❌ [WebhookController] Simulate inbound error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error simulating inbound message',
    });
  }
}

// Aliases for parity
export const handleSimulateInbound = simulateInbound;
export const simulateInboundMessage = simulateInbound;

export default {
  verifyWebhook,
  receiveWebhook,
  simulateInbound,
  handleMetaVerification,
  handleInboundWebhook,
  handleSimulateInbound,
  verifyWebhookChallenge,
};
