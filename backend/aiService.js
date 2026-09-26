import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AI_CONFIG_FILE = path.resolve(__dirname, 'aiConfig.json');

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getSupabase = () => {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ttjtlqsfwaksyqrrutvv.supabase.co';
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anRscXNmd2Frc3lxcnJ1dHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDM1ODIsImV4cCI6MjEwNDY3OTU4Mn0.FtIIhGCFzaQ5zjkjmHj1qABZ-kucDiArWHAgrg1i01Y';
  if (!url || !key) return null;
  return createClient(url, key);
};

const DEFAULT_WORKSPACE_ID = process.env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001';

export const DEFAULT_SYSTEM_PROMPT = `You are DhiGrowth AI Business Concierge, the official intelligent assistant for DhiGrowth IT Services on WhatsApp.

About DhiGrowth IT Services:
We provide:
📱 App Development (iOS, Android, Cross-platform, Flutter, React Native)
🤖 AI Business Solutions & Development (Custom AI agents, LLM integrations, workflow automations, 24/7 concierges)
💬 WhatsApp CRM & Automation (Official Meta Cloud API, lead capture, automated broadcasts, team inboxes)
💻 Custom IT Solutions (Web & SaaS development, cloud infrastructure, API integrations, enterprise software)

Core Behavior Instructions:
1. UNDERSTAND THE USER'S SPECIFIC WORDS: Whatever question, topic, or industry the user mentions (e.g. ecommerce, fitness, healthcare, real estate, APIs, timelines, pricing, technologies), directly comprehend and analyze their exact question.
2. TAILORED & RELEVANT: Give a direct, helpful, and highly relevant answer addressing specifically what THEY asked. Do not give generic replies or repeat boilerplate.
3. CONCISE FOR WHATSAPP: Keep replies concise (2-4 clear sentences or short punchy bullet points with emojis).
4. NEXT STEPS: Invite them to share details about their vision or offer to book a quick consultation call.
5. MULTI-LINGUAL: If the user writes in Hindi, Tamil, Hinglish, or any other language, understand and reply naturally in that same language.
6. CONVERSATION CONTEXT & AFFIRMATIONS: If the user says "Yes", "Ok", "Sure", "I am interested", or agrees with our previous suggestion/question, understand the context of the prior messages. Warmly acknowledge their confirmation, ask them for the next detail needed, or offer available meeting/demo slots.`;

const DHIGROWTH_WELCOME = {
  reply: `Hello! 👋 Welcome to **DhiGrowth IT Services**.\n\nHow can our AI Business Concierge help you today? 🤖\n\nWe help businesses with:\n📱 **App Development**\n🤖 **AI Business Solutions & Development**\n💬 **WhatsApp CRM & Automation**\n💻 **Custom IT Solutions**\n\nTell us what your business needs, and let's build something powerful together! 🚀`,
  imageUrl: 'https://www.dhigrowth.com/logo.png',
  toString: function () {
    return this.reply;
  },
};

let cachedRemoteConfig = null;

// Dynamically fetch AI configuration from Supabase channels settings (shared between local and Render)
export const loadRemoteAiConfig = async () => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase
        .from('channels')
        .select('settings')
        .eq('type', 'whatsapp')
        .maybeSingle();
      if (data?.settings?.ai_config) {
        cachedRemoteConfig = data.settings.ai_config;
        return cachedRemoteConfig;
      }
    }
  } catch (err) {
    console.warn('[AIService] Note fetching Supabase AI settings:', err.message);
  }
  return null;
};

// Initial background load
loadRemoteAiConfig().catch(() => {});

// Read current active AI configuration (saved JSON config > Supabase remote cache > environment variables)
export const getActiveAiConfig = () => {
  let fileConfig = {};
  try {
    if (fs.existsSync(AI_CONFIG_FILE)) {
      fileConfig = JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('[AIService] Could not read aiConfig.json:', err.message);
  }

  const remote = cachedRemoteConfig || {};

  // Priority: Local JSON file > Supabase remote config > process.env
  const provider = fileConfig.provider || remote.provider || process.env.AI_PROVIDER || 'gemini';

  let apiKey = fileConfig.apiKey || remote.apiKey;
  if (!apiKey) {
    if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY;
    else if (provider === 'groq') apiKey = process.env.GROQ_API_KEY;
    else if (provider === 'deepseek') apiKey = process.env.DEEPSEEK_API_KEY;
    else apiKey = process.env.GEMINI_API_KEY;
  }

  let model = fileConfig.model || remote.model || process.env.AI_MODEL || (
    provider === 'openai' ? 'gpt-4o-mini' :
    provider === 'groq' ? 'llama-3.3-70b-versatile' :
    provider === 'deepseek' ? 'deepseek-chat' :
    'gemini-2.5-flash'
  );
  if (model === 'gemini-1.5-flash') model = 'gemini-2.5-flash';

  const systemPrompt = fileConfig.systemPrompt || remote.systemPrompt || process.env.AI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

  return {
    provider,
    apiKey: apiKey ? String(apiKey).trim() : '',
    model,
    systemPrompt,
    hasKey: Boolean(apiKey),
    maskedKey: apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : '',
    updatedAt: fileConfig.updatedAt || remote.updatedAt || null,
  };
};

export const saveActiveAiConfig = async (newConfig) => {
  const existing = getActiveAiConfig();
  const merged = {
    provider: newConfig.provider || existing.provider || 'gemini',
    apiKey: newConfig.apiKey !== undefined ? String(newConfig.apiKey).trim() : existing.apiKey,
    model: newConfig.model === 'gemini-1.5-flash' ? 'gemini-2.5-flash' : (newConfig.model || existing.model || 'gemini-2.5-flash'),
    systemPrompt: newConfig.systemPrompt || existing.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    updatedBy: newConfig.updatedBy || 'user',
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(AI_CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  // Also sync to Supabase channel settings if available
  try {
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('channels')
        .update({
          settings: {
            ai_config: {
              provider: merged.provider,
              model: merged.model,
              systemPrompt: merged.systemPrompt,
              apiKey: merged.apiKey,
              updatedAt: merged.updatedAt,
            },
          },
        })
        .eq('type', 'whatsapp');
    }
  } catch (sbErr) {
    console.warn('[AIService] Note updating Supabase channel settings:', sbErr.message);
  }

  // Update process.env in memory
  if (merged.provider === 'openai') process.env.OPENAI_API_KEY = merged.apiKey;
  else if (merged.provider === 'groq') process.env.GROQ_API_KEY = merged.apiKey;
  else if (merged.provider === 'deepseek') process.env.DEEPSEEK_API_KEY = merged.apiKey;
  else process.env.GEMINI_API_KEY = merged.apiKey;

  process.env.AI_PROVIDER = merged.provider;
  process.env.AI_MODEL = merged.model;

  console.log(`✅ [AIService] Saved live AI config: Provider=${merged.provider}, Model=${merged.model}`);
  return merged;
};

// Dispatch AI completion request to specific provider
async function callAiProvider({ provider, apiKey, model, systemPrompt, userMessage, conversationHistory = [] }) {
  const startTime = Date.now();

  if (provider === 'gemini') {
    // Google Gemini API
    const targetModel = model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

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

    // Ensure the latest user message is at the end
    const lastContent = geminiContents[geminiContents.length - 1];
    if (!lastContent || lastContent.role !== 'user' || lastContent.parts[0]?.text !== userMessage) {
      geminiContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    let res;
    let data;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: geminiContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        });

        data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          break;
        }

        // If high demand or rate limit, wait and retry once
        if (attempt < maxAttempts && (res.status === 503 || res.status === 429 || data.error?.message?.includes('high demand'))) {
          console.log(`[AIService] Gemini experiencing high demand, retrying in 1.2s (attempt ${attempt}/${maxAttempts})...`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      } catch (networkErr) {
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          throw networkErr;
        }
      }
    }

    if (!res || !res.ok) {
      throw new Error(data?.error?.message || `Gemini API error (${res?.status || 'network'})`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Gemini returned an empty response.');

    return {
      reply: reply.trim(),
      latencyMs: Date.now() - startTime,
      provider: 'gemini',
      model: targetModel,
    };
  }

  if (provider === 'openai' || provider === 'groq' || provider === 'deepseek') {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let defaultModel = 'gpt-4o-mini';

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      defaultModel = 'llama-3.3-70b-versatile';
    } else if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/chat/completions';
      defaultModel = 'deepseek-chat';
    }

    const targetModel = model || defaultModel;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((m) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      })),
    ];

    const lastMsg = chatMessages[chatMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
      chatMessages.push({ role: 'user', content: userMessage });
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `${provider.toUpperCase()} API error (${res.status})`);
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error(`${provider.toUpperCase()} returned an empty response.`);

    return {
      reply: reply.trim(),
      latencyMs: Date.now() - startTime,
      provider,
      model: targetModel,
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// Test live connection with a given key & provider
export const testAiConnection = async ({ provider, apiKey, model, testPrompt }) => {
  const active = getActiveAiConfig();
  const effProvider = provider || active.provider || 'gemini';
  const effApiKey = apiKey || active.apiKey;
  const effModel = model || active.model;
  const effPrompt = testPrompt || 'Hello! Are you online and ready to assist our WhatsApp customers?';

  if (!effApiKey) {
    throw new Error(`No API key provided for ${effProvider.toUpperCase()}. Please enter your API key.`);
  }

  return await callAiProvider({
    provider: effProvider,
    apiKey: effApiKey,
    model: effModel,
    systemPrompt: active.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    userMessage: effPrompt,
  });
};

// Main generator used by webhook handler
export const generateAIResponse = async ({
  customerName,
  customerMessage,
  channelType = 'whatsapp',
  conversationHistory = [],
}) => {
  const query = customerMessage?.trim().toLowerCase() || '';

  // 1. Check custom configured templates from Supabase
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: dbTemplates } = await supabase
        .from('templates')
        .select('*')
        .eq('workspace_id', DEFAULT_WORKSPACE_ID)
        .eq('status', 'approved');

      if (dbTemplates && dbTemplates.length > 0) {
        for (const tmpl of dbTemplates) {
          const triggers = (tmpl.footer_text || '')
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

          const isMatch = triggers.some((tr) => {
            if (query === tr) return true;
            if (query.startsWith(`${tr} `)) return true;
            if (query.endsWith(` ${tr}`)) return true;
            if (query.includes(` ${tr} `)) return true;
            return false;
          });

          if (isMatch) {
            const imageUrl = (tmpl.header_type === 'IMAGE' || tmpl.header_content) ? tmpl.header_content : null;
            console.log(`🎯 Matched Custom Template: "${tmpl.name}" for trigger in query: "${query}" (Media: ${imageUrl || 'None'})`);
            return {
              reply: tmpl.body_text,
              imageUrl,
              templateId: tmpl.id,
              templateName: tmpl.name,
              toString: () => tmpl.body_text,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AIService] Note checking DB templates:', err.message);
  }

  // 2. Initial Greeting Detection (Only trigger welcome menu on standalone greeting)
  const isGreeting = ['hi', 'hello', 'hey', 'start', 'menu', 'help', 'hi!', 'hello!', 'hey!'].includes(query) ||
    query === 'hi there' || query === 'hello there';
  if (isGreeting) {
    return DHIGROWTH_WELCOME;
  }

  // 3. Live AI Execution (Gemini / OpenAI / Groq / DeepSeek)
  if (!cachedRemoteConfig) {
    await loadRemoteAiConfig();
  }
  const activeAi = getActiveAiConfig();
  if (activeAi.hasKey) {
    try {
      let effectiveSystemPrompt = activeAi.systemPrompt || DEFAULT_SYSTEM_PROMPT;
      if (channelType === 'instagram') {
        effectiveSystemPrompt += `\n\n[Instagram Direct Messaging Rules]:\nYou are chatting with an Instagram user via Instagram Direct Messages. Keep responses conversational, modern, friendly, concise (2-3 short punchy sentences), with relevant emojis. Help users with product questions, pricing, demo bookings, or IT & AI automation services. When appropriate, offer to connect on WhatsApp or schedule a quick discovery call.`;
      }

      console.log(`🤖 Invoking Live AI (${activeAi.provider.toUpperCase()} / ${activeAi.model}) for [${channelType.toUpperCase()}]: "${customerMessage}"`);
      const result = await callAiProvider({
        provider: activeAi.provider,
        apiKey: activeAi.apiKey,
        model: activeAi.model,
        systemPrompt: effectiveSystemPrompt,
        userMessage: `Customer Name: ${customerName || 'Instagram User'}\nChannel: ${channelType}\nCustomer Message: "${customerMessage}"`,
        conversationHistory,
      });

      if (result.reply) {
        console.log(`✨ AI Response received in ${result.latencyMs}ms from ${result.provider}: "${result.reply.slice(0, 60)}..."`);
        return result.reply;
      }
    } catch (err) {
      console.warn(`[AIService] Live AI generation failed (${activeAi.provider}):`, err.message);
      console.log('Falling back to smart business rules engine...');
    }
  }

  // 4. Smart Business Rules Engine Fallback
  // 4.1 Positive affirmations & confirmations ("yes", "ok", "sure", "proceed", etc.)
  if (/^(yes|yeah|yep|sure|ok|okay|yup|definitely|absolutely|interested|tell me more|let's do it|demo|start|call me|connect)$/i.test(query)) {
    return `Awesome, thank you for confirming, ${customerName || 'friend'}! 🎉\n\nWe would love to help you get this started right away. Which service would you like to explore first (Mobile App, Custom AI Agent, WhatsApp CRM, or Web IT)?\n\nOr feel free to share your phone number/preferred time, and our specialist will give you a quick 10-minute discovery call! 🚀`;
  }

  if (/\b(whatsapp|crm|marketing|broadcast|catalog|lead|inbox)\b/i.test(query)) {
    return `💬 **WhatsApp CRM & Automation**\n\nSupercharge your sales with official Meta WhatsApp Cloud API integration, broadcast campaigns, catalog bots, and AI auto-pilot replies.\n\nReady to convert leads faster on WhatsApp? Let's connect! 📈`;
  }

  if (/\b(ai|bot|automation|agent|chatgpt|llm)\b/i.test(query)) {
    return `🤖 **AI Business Solutions & Development**\n\nFrom autonomous AI customer concierges to workflow automations and custom LLM integrations, we help you reduce costs and run operations 24/7.\n\nWould you like a demo of how AI can automate your business tasks? ✨`;
  }

  if (/\b(app|mobile|android|ios|flutter|react native)\b/i.test(query)) {
    return `📱 **DhiGrowth App Development**\n\nWe build sleek, scalable iOS & Android mobile apps tailored to your business operations and customer experience.\n\nWhat kind of app are you planning to build? Tell us your idea and let's bring it to life! 🚀`;
  }

  if (query.includes('website') || query.includes('web') || query.includes('software') || query.includes('it solution')) {
    return `💻 **Custom IT & Software Solutions**\n\nWe engineer modern web applications, cloud backends, and robust enterprise software built for speed and security.\n\nShare your project requirements, and we'll prepare a custom roadmap for you! 🛠️`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('quote') || query.includes('rate')) {
    return `💼 Our project pricing is customized based on your business scope and requirements.\n\nFeel free to share brief details of your project, and our team will provide a tailored quote and roadmap! 🤝`;
  }

  if (channelType === 'instagram') {
    return `Hey ${customerName?.split(' ')[0] || 'there'}! 👋 Thanks for reaching out via Instagram DM.\n\nRegarding "${customerMessage}": our team would love to help you build and scale this! Would you like to schedule a quick consultation or see a demo? 🚀`;
  }

  // Conversational fallback
  return `Hello ${customerName || 'there'}! 👋 Welcome to **DhiGrowth IT Services**.\n\nRegarding your inquiry about "${customerMessage}": our team would be thrilled to help you build and scale this! Would you like to schedule a quick 15-minute consultation, or tell us a bit more about your requirements? 🚀`;
};
