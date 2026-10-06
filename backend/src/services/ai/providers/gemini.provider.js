import { env } from '../../../config/env.js';

/**
 * Google Gemini API Provider Adapter
 * Features automatic fallback model cascade across available Google Generative AI endpoints.
 */

export const GEMINI_CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
];

/**
 * Call Google Gemini with automatic candidate model failover
 *
 * @param {Object} options
 * @param {string} [options.apiKey] - Google Gemini API Key
 * @param {string} [options.model] - Target Gemini model
 * @param {string} options.systemPrompt - System instructions / persona prompt
 * @param {string} options.userMessage - Latest customer query
 * @param {Array<{role: string, content: string}>} [options.conversationHistory] - Multi-turn chat history
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.maxOutputTokens=600]
 * @returns {Promise<{reply: string, latencyMs: number, provider: string, model: string}>}
 */
export async function callGemini({
  apiKey = env.GEMINI_API_KEY,
  model = 'gemini-1.5-flash',
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.7,
  maxOutputTokens = 600,
}) {
  const effKey = apiKey || env.GEMINI_API_KEY;
  if (!effKey) {
    throw new Error('Google Gemini API key is missing. Please configure GEMINI_API_KEY.');
  }

  const startTime = Date.now();
  const requestedModel = model || 'gemini-1.5-flash';
  const candidateModels = [...new Set([requestedModel, ...GEMINI_CANDIDATE_MODELS])];

  // Build rich multi-turn conversation contents for Gemini
  const geminiContents = [];
  if (conversationHistory && conversationHistory.length > 0) {
    for (const item of conversationHistory) {
      if (!item.content) continue;
      geminiContents.push({
        role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.content }],
      });
    }
  }

  // Ensure latest user message is at the end
  const lastContent = geminiContents[geminiContents.length - 1];
  if (!lastContent || lastContent.role !== 'user' || lastContent.parts[0]?.text !== userMessage) {
    geminiContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });
  }

  let lastError = null;

  for (const targetModel of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${effKey}`;
    try {
      const payload = {
        contents: geminiContents,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      };

      if (systemPrompt) {
        payload.system_instruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (res.ok && reply) {
        return {
          reply: reply.trim(),
          latencyMs: Date.now() - startTime,
          provider: 'gemini',
          model: targetModel,
        };
      }

      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      lastError = new Error(`Gemini (${targetModel}): ${errMsg}`);
      console.warn(`[GeminiProvider] Model ${targetModel} notice: "${errMsg}". Failing over to next candidate...`);
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiProvider] Network error with ${targetModel}: ${err.message}. Failing over...`);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to return a response.');
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection({ apiKey = env.GEMINI_API_KEY, model = 'gemini-1.5-flash' } = {}) {
  const testPrompt = 'Respond with "Gemini is connected and ready."';
  return await callGemini({
    apiKey,
    model,
    systemPrompt: 'You are an AI diagnostic assistant. Keep your answer under 10 words.',
    userMessage: testPrompt,
    maxOutputTokens: 50,
  });
}

export default {
  callGemini,
  testGeminiConnection,
  GEMINI_CANDIDATE_MODELS,
};
