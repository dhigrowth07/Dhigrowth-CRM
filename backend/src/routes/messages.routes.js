import { Router } from 'express';
import {
  sendMessage,
  setConversationAgentMode,
  getConversationAgentModes,
} from '../controllers/messages.controller.js';

const router = Router();

/**
 * Messages & Conversation Agent Mode Routes
 * Handles outbound WhatsApp messages (text, media, interactive), error 131047 fallback,
 * and per-conversation AI vs Human agent mode state.
 */

// 1. Direct Outbound WhatsApp Messaging (with 24h Template Auto-Fallback)
router.post('/api/send-message', sendMessage);

// 2. Conversation Agent Mode (AI vs Human agent toggle)
router.post('/api/conversations/set-agent-mode', setConversationAgentMode);
router.get('/api/conversations/agent-modes', getConversationAgentModes);

export default router;
