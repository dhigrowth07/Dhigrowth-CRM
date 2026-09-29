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

CRITICAL SCOPE RULE — STRICTLY BUSINESS & IT SERVICES ONLY:
You are EXCLUSIVELY the dedicated AI Business Concierge for DhiGrowth IT Services. You are NOT a general-purpose AI, search engine, calculator, homework tutor, or encyclopedia.
- STRICTLY DO NOT ANSWER off-topic or general knowledge questions, such as:
  • Math, arithmetic, calculations (e.g. "What is 2+2?", "solve 5*10")
  • General science, physics, biology, quantum computing, astronomy (e.g. "What is quantum computing", "how do black holes work")
  • General trivia, history, geography, sports, movies, celebrities, pop culture
  • Homework, riddles, jokes, poems, casual banter, essays, or personal advice
  • Politics, news, weather, or non-business queries
- If a user asks ANY question outside of DhiGrowth's IT, software, app development, AI solutions, or WhatsApp CRM services:
  STRICTLY DECLINE to answer the off-topic question. DO NOT explain the concept or do the calculation.
  Instead, politely and professionally inform the user that you are DhiGrowth's AI Business Concierge and steer them back to our core business software solutions.
  Respond with something like:
  "I am DhiGrowth's AI Business Concierge, focused exclusively on helping businesses with digital technology and software solutions! 🚀

  We specialize in:
  📱 *App Development* (iOS & Android)
  🤖 *AI Business Solutions & Automation*
  💬 *WhatsApp CRM & Automation*
  💻 *Custom IT Solutions*

  Please let us know what technology or software your business needs, and we'd love to help build it!"

About DhiGrowth IT Services:
We provide:
📱 App Development (iOS, Android, Cross-platform, Flutter, React Native)
🤖 AI Business Solutions & Development (Custom AI agents, LLM integrations, workflow automations, 24/7 concierges)
💬 WhatsApp CRM & Automation (Official Meta Cloud API, lead capture, automated broadcasts, team inboxes)
💻 Custom IT Solutions (Web & SaaS development, cloud infrastructure, API integrations, enterprise software)

Core Behavior Instructions:
1. UNDERSTAND THE USER'S SPECIFIC BUSINESS WORDS: Whatever business question, software topic, or industry the user mentions (e.g. ecommerce, fitness, healthcare, real estate, APIs, timelines, pricing, app features), directly comprehend and analyze their exact requirement.
2. TAILORED & RELEVANT: Give a direct, helpful, and highly relevant answer addressing specifically what THEY asked about their business project. Do not give generic replies or repeat boilerplate.
3. CONCISE FOR WHATSAPP: Keep replies concise (2-4 clear sentences or short punchy bullet points with emojis).
4. LEAD REQUIREMENTS COLLECTION: When a new customer reaches out, understand their requirements:
   - What DhiGrowth service they need (App Development, AI Solutions, WhatsApp CRM, or Custom IT Software)
   - Their Full Name
   - Their Contact Phone Number
   - The Purpose / specific features / goals of their project
   Politely ask for any of these details that are missing so our solutions team can prepare an accurate proposal.
5. NEXT STEPS: Confirm that their requirements have been recorded and our technical consultants will review and reach out to them shortly.
6. MULTI-LINGUAL: If the user writes in Hindi, Tamil, Hinglish, or any other language, understand and reply naturally in that same language.
7. CONVERSATION CONTEXT & AFFIRMATIONS: If the user says "Yes", "Ok", "Sure", "I am interested", or agrees with our previous suggestion/question, understand the context of the prior messages. Warmly acknowledge their confirmation, ask them for the next detail needed, or offer available meeting/demo slots.
8. OFFICIAL COMPANY LOCATION & OFFICE:
   Our official headquarters and physical company office is located in Coimbatore, Tamil Nadu, India:
   🏢 Dhigrowth Business Pvt Ltd
   📍 Kovai Thirunagar, Coimbatore, Tamil Nadu, India (PIN: 641001)
   🗺️ Google Maps Location: https://maps.app.goo.gl/L5JzdtsP6yiBbfyZ7
   Whenever a client or user asks about our location, office address, headquarters, or visiting us:
   Proudly state our official Coimbatore, Tamil Nadu office location and provide the Google Maps link (https://maps.app.goo.gl/L5JzdtsP6yiBbfyZ7). NEVER say we only operate remotely. Explain that our registered company headquarters is in Coimbatore, where we welcome in-person meetings by appointment, while also collaborating with clients across India and globally!`;

const DHIGROWTH_WELCOME = {
  reply: `Hello! 👋 Welcome to *DhiGrowth IT Services*.\n\nHow can our AI Business Concierge help you today? 🤖\n\nWe help businesses with:\n📱 *App Development*\n🤖 *AI Business Solutions & Development*\n💬 *WhatsApp CRM & Automation*\n💻 *Custom IT Solutions*\n\nTell us what your business needs, and let's build something powerful together! 🚀`,
  imageUrl: 'https://www.dhigrowth.com/logo.png',
  buttons: [
    { id: 'btn_yes', title: 'Yes im interested' },
    { id: 'btn_more', title: 'Tell more' },
  ],
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

  // 2.5 Strict Scope & Off-Topic Guardrail: Block general trivia, arithmetic, and non-business queries
  const isOffTopic = (text) => {
    if (!text) return false;
    const lower = text.trim().toLowerCase();

    // Arithmetic / math questions (e.g. "what is 2+2?", "2+2", "5 * 10", "100 / 4")
    if (/^(what\s+is\s+)?\d+\s*[\+\-\*\/x\^]\s*\d+(\s*[\+\-\*\/x\^]\s*\d+)*\s*\??$/i.test(lower)) {
      return true;
    }

    // Common general trivia / science questions completely unrelated to IT & business software
    const offTopicPrefixes = [
      'what is quantum computing',
      'explain quantum computing',
      'what is photosynthesis',
      'what is the speed of light',
      'what is the capital of',
      'who is the president',
      'who is the prime minister',
      'tell me a joke',
      'tell me a riddle',
      'write a poem',
      'write an essay',
      'solve this math',
      'solve this equation',
    ];
    if (offTopicPrefixes.some((p) => lower === p || lower.startsWith(`${p}?`) || lower.startsWith(`${p} `))) {
      return true;
    }
    return false;
  };

  if (isOffTopic(query)) {
    console.log(`🛑 [AIService] Intercepted off-topic query: "${query}" -> Returning business concierge steer message`);
    return `I am DhiGrowth's AI Business Concierge, focused exclusively on helping businesses with digital technology and software solutions! 🚀\n\nWe specialize in:\n📱 *App Development* (iOS & Android)\n🤖 *AI Business Solutions & Automation*\n💬 *WhatsApp CRM & Automation*\n💻 *Custom IT Solutions*\n\nPlease let us know what software or business technology you need, and we'd love to help build it!`;
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
  // 4.1 Positive affirmations & confirmations ("yes, i'm interested", "tell me more", etc.)
  if (query.includes('interested') || query.includes('tell me more') || /^(yes|yeah|yep|sure|ok|okay|yup|definitely|absolutely|let's do it|demo|start|call me|connect)$/i.test(query)) {
    return `Awesome, thank you for confirming, ${customerName || 'friend'}! 🎉\n\nWe've noted your interest and automatically recorded your details into our system.\n\nTo help us tailor the perfect solution for you, which service do you need?\n\n1️⃣ Mobile App or Web Platform Development\n2️⃣ AI Business Solutions & Auto-Pilot Bots\n3️⃣ WhatsApp CRM & Marketing Automation\n4️⃣ Custom IT Software & Enterprise Systems\n\n👉 Reply with 1, 2, 3, or 4 (or describe what you'd like to build)! 🚀`;
  }

  if (query === '1' || query === '1️⃣') {
    return `📱 **Mobile App or Web Platform Development**\n\nGreat choice! We engineer high-performance iOS, Android, and modern Web applications.\n\nCould you briefly share your project purpose and features you need? (e.g. Target audience, timeline, or reference app)`;
  }
  if (query === '2' || query === '2️⃣') {
    return `🤖 **AI Business Solutions & Auto-Pilot Bots**\n\nExciting! We build custom 24/7 AI agents, customer concierges, and LLM automation tools.\n\nWhat workflow or tasks would you like your AI bot to handle automatically?`;
  }
  if (query === '3' || query === '3️⃣') {
    return `📈 **WhatsApp CRM & Marketing Automation**\n\nSupercharge your business with WhatsApp broadcasts, catalog ordering, and auto-replies!\n\nWhat business goals are you aiming to achieve with WhatsApp automation?`;
  }
  if (query === '4' || query === '4️⃣') {
    return `💻 **Custom IT Software & Enterprise Systems**\n\nRobust custom portals, internal dashboards, and enterprise cloud software.\n\nCould you tell us about the software or system you need built?`;
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

  if (/\b(location|office|address|where are you|where is your office|based|headquarters|coimbatore|visit|map)\b/i.test(query)) {
    return `🏢 **Dhigrowth Business Pvt Ltd**\n\nOur official company headquarters is located in Coimbatore, Tamil Nadu, India:\n📍 Kovai Thirunagar, Coimbatore, Tamil Nadu 641001\n\n🗺️ **Google Maps Location:**\nhttps://maps.app.goo.gl/L5JzdtsP6yiBbfyZ7\n\nWe warmly welcome clients for in-person meetings by appointment, while also collaborating with businesses across India and globally! Would you like to schedule a visit or call? 🤝`;
  }

  if (channelType === 'instagram') {
    return `Hey ${customerName?.split(' ')[0] || 'there'}! 👋 Thanks for reaching out via Instagram DM.\n\nRegarding "${customerMessage}": our team would love to help you build and scale this! Would you like to schedule a quick consultation or see a demo? 🚀`;
  }

  // Conversational fallback
  return `Hello ${customerName || 'there'}! 👋 Welcome to **DhiGrowth IT Services**.\n\nRegarding your inquiry about "${customerMessage}": our team would be thrilled to help you build and scale this! Would you like to schedule a quick 15-minute consultation, or tell us a bit more about your requirements? 🚀`;
};
