import { Router } from 'express';
import {
  verifyWebhook,
  receiveWebhook,
  simulateInboundMessage,
} from '../controllers/webhook.controller.js';

const router = Router();

/**
 * Webhook Routes
 * Handles Meta WhatsApp Cloud API handshakes, real-time status/message webhooks,
 * and local sandbox inbound simulation.
 */

// 1. Meta Webhook Verification Handshake
router.get('/webhook', verifyWebhook);
router.get('/api/webhook', verifyWebhook);

// 2. Meta Inbound Message & Delivery Status Webhook Receiver
router.post('/webhook', receiveWebhook);
router.post('/api/webhook', receiveWebhook);

// 3. Local/Sandbox Inbound Message Simulator
router.post('/api/simulate-inbound', simulateInboundMessage);

export default router;
