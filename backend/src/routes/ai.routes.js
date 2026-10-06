import { Router } from 'express';
import {
  getAIConfig,
  updateAIConfig,
  testAIConnection,
  translateTextHandler,
  generateAIResponseHandler,
} from '../controllers/ai.controller.js';

const router = Router();

/**
 * AI Engine & Translation Routes
 * Handles multi-tenant AI provider configuration (Gemini, Groq, OpenAI), sandbox connection tests,
 * Google Translate proxy with dual mirrors, and dynamic AI customer consultation response generation.
 */

// 1. AI Provider Configuration (Per-Tenant / Workspace Isolated)
router.get('/api/ai-config', getAIConfig);
router.post('/api/ai-config', updateAIConfig);

// 2. Sandbox Connection & Failover Test
router.post('/api/ai-test', testAIConnection);

// 3. Multi-Lingual Translation Proxy
router.post('/api/translate', translateTextHandler);

// 4. Dynamic Inbound AI Response Engine & Lead Auto-Sync
router.post('/api/ai/respond', generateAIResponseHandler);

export default router;
