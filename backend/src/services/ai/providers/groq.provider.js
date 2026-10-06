import { env } from '../../../config/env.js';

/**
 * Groq Llama AI Provider Adapter
 * Ultra-fast LLM inference using Groq's LPU inference engine and Llama models.
 */

export const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Call Groq Cloud API
 *
 * @param {Object} options
 * @param {string} [options.apiKey] - Groq API Key
 * @param {string} [options.model] - Target Groq model
 * @param {string} options.systemPrompt - System instructions
 * @param {string} options.userMessage - Latest customer query
 * @param {Array<{role: string, content: string}>} [options.conversationHistory] - Multi-turn history
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.maxTokens=600]
 * @returns {Promise<{reply: string, latencyMs: number, provider: string, model: string}>}
 */
export async function callGroq({
  apiKey = env.GROQ_API_KEY,
  model = GROQ_DEFAULT_MODEL,
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.7,
  maxTokens = 600,
}) {
  const effKey = apiKey || env.GROQ_API_KEY;
  if (!effKey) {
    throw new Error('Groq API key is missing. Please configure GROQ_API_KEY.');
  }

  const startTime = Date.now();
  const targetModel = model || GROQ_DEFAULT_MODEL;

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

  const res = await fetch(GROQ_ENDPOINT, {
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
    throw new Error(data.error?.message || `Groq API error (HTTP ${res.status})`);
  }

  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('Groq returned an empty response.');
  }

  return {
    reply: reply.trim(),
    latencyMs: Date.now() - startTime,
    provider: 'groq',
    model: targetModel,
  };
}

/**
 * Test Groq API connection
 */
export async function testGroqConnection({ apiKey = env.GROQ_API_KEY, model = GROQ_DEFAULT_MODEL } = {}) {
  return await callGroq({
    apiKey,
    model,
    systemPrompt: 'You are an AI diagnostic assistant. Keep your response under 10 words.',
    userMessage: 'Respond with "Groq is connected and ready."',
    maxTokens: 50,
  });
}

export default {
  callGroq,
  testGroqConnection,
  GROQ_DEFAULT_MODEL,
  GROQ_ENDPOINT,
};
