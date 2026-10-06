import { env } from '../../../config/env.js';

/**
 * OpenAI Provider Adapter
 * Chat completions integration with gpt-4o-mini and gpt-3.5-turbo models.
 */

export const OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';
export const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Call OpenAI API
 *
 * @param {Object} options
 * @param {string} [options.apiKey] - OpenAI API Key
 * @param {string} [options.model] - Target OpenAI model (gpt-4o-mini, gpt-3.5-turbo, etc.)
 * @param {string} options.systemPrompt - System instructions
 * @param {string} options.userMessage - Latest customer query
 * @param {Array<{role: string, content: string}>} [options.conversationHistory] - Multi-turn history
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.maxTokens=600]
 * @returns {Promise<{reply: string, latencyMs: number, provider: string, model: string}>}
 */
export async function callOpenAI({
  apiKey = env.OPENAI_API_KEY,
  model = OPENAI_DEFAULT_MODEL,
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.7,
  maxTokens = 600,
}) {
  const effKey = apiKey || env.OPENAI_API_KEY;
  if (!effKey) {
    throw new Error('OpenAI API key is missing. Please configure OPENAI_API_KEY.');
  }

  const startTime = Date.now();
  const targetModel = model || OPENAI_DEFAULT_MODEL;

  const chatMessages = [];
  if (systemPrompt) {
    chatMessages.push({ role: 'system', content: systemPrompt });
  }

  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      if (!msg.content) continue;
      chatMessages.push({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content,
      });
    }
  }

  const lastMsg = chatMessages[chatMessages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    chatMessages.push({ role: 'user', content: userMessage });
  }

  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${effKey}`,
    },
    body: JSON.stringify({
      model: targetModel,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI API error (HTTP ${res.status})`);
  }

  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('OpenAI returned an empty response.');
  }

  return {
    reply: reply.trim(),
    latencyMs: Date.now() - startTime,
    provider: 'openai',
    model: targetModel,
  };
}

/**
 * Test OpenAI API connection
 */
export async function testOpenAIConnection({ apiKey = env.OPENAI_API_KEY, model = OPENAI_DEFAULT_MODEL } = {}) {
  return await callOpenAI({
    apiKey,
    model,
    systemPrompt: 'You are an AI diagnostic assistant. Keep your response under 10 words.',
    userMessage: 'Respond with "OpenAI is connected and ready."',
    maxTokens: 50,
  });
}

export default {
  callOpenAI,
  testOpenAIConnection,
  OPENAI_DEFAULT_MODEL,
  OPENAI_ENDPOINT,
};
