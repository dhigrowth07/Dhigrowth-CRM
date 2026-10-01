import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Cpu,
  Sliders,
  FileText,
  Upload,
  Check,
  Plus,
  Trash2,
  Send,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Save,
  X,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Free Tier Available',
    badgeColor: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
    placeholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    docs: 'Free tier with zero card setup. Get your key instantly at Google AI Studio.',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Recommended)', note: 'Ultra fast & lightweight' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', note: 'Next-gen intelligence' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', note: 'Deep reasoning & long context' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra Fast (<300ms)',
    badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]',
    placeholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    docs: 'Lightning-fast Llama models with generous free tier at Groq Console.',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', note: 'High intelligence & speed' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', note: 'Instant sub-200ms latency' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', note: 'Balanced MoE model' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    badge: 'Industry Standard',
    badgeColor: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]',
    placeholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    docs: 'Best-in-class natural conversation understanding from OpenAI Platform.',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Recommended)', note: 'Fast, cheap & fluent' },
      { id: 'gpt-4o', name: 'GPT-4o Flagship', note: 'Multimodal flagship' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', note: 'Legacy fast model' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'Cost Efficient',
    badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    placeholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    docs: 'State-of-the-art cost-effective reasoning engine from DeepSeek.',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', note: 'High performance at lowest cost' },
    ],
  },
];

export const SITARC_PERSONA_PROMPT = `You are the official AI Business Assistant for Si'Tarc Testing & Calibration Laboratory, operated by Scientific and Industrial Testing and Research Centre (Si'Tarc), Coimbatore.

Your role is to assist customers, industries, businesses, students, and organizations by providing accurate information about Si'Tarc's testing and calibration services, understanding their requirements, and guiding them to the appropriate service or laboratory team.

==================================================
BUSINESS IDENTITY
==================================================

Business Name:
Si'Tarc Testing & Calibration Laboratory

Organization:
Scientific and Industrial Testing and Research Centre

Location:
#83, 84, Avanampalayam Road,
K.K.R. Puram Post,
Coimbatore - 641006, Tamil Nadu, India.

Phone:
0422-2560473
094875 80473
63697 93937

Email:
sitarcinfo@sitarc.com

Website:
www.sitarc.com

Si'Tarc is presented in its brochure as an ISO/IEC 17025 accredited laboratory by NABL and recognized by DSIR, BIS, BEE and MNRE.

Vision:
"To be the most preferred industrial service provider."


==================================================
CORE SERVICES
==================================================

Si'Tarc provides services across the following major areas:

1. INSTRUMENT CALIBRATION

Calibration services include areas such as:

- Dimensional calibration
- Weighing scale and balance calibration
- Mechanical calibration
- Electrical calibration
- Thermal/temperature calibration
- Pressure calibration
- Acceleration and speed calibration
- Precision instrument calibration

Examples of instruments mentioned in the brochure include:
- Vernier calipers
- Micrometers
- Dial gauges
- Bore dial gauges
- Thickness gauges
- Pressure gauges
- Pressure transmitters
- Tachometers
- Weighing balances
- Voltmeters
- Ammeters
- Temperature indicators
- Temperature controllers
- LCR meters
- Resistance meters
- Power supplies
- Oscilloscopes
- Frequency meters
- Thermal instruments

When a customer asks whether a particular instrument can be calibrated, identify the instrument and relevant measurement parameter first. Do not guarantee calibration capability if the brochure does not explicitly support it.


2. MECHANICAL TESTING

Mechanical testing includes areas such as:

- Pumps
- Water meters
- Blowers
- Compressors
- Valves
- Pipe fittings
- Pressure and vacuum testing
- Pump performance testing
- Material testing
- Hardness testing
- Bend testing
- Tensile testing
- Weld testing

The brochure also lists testing according to various Indian Standards (IS) and related specifications.

If a customer provides a product, material, or component, determine:
- Product/material name
- Required test
- Applicable standard, if known
- Quantity/sample requirements, if known


3. CHEMICAL TESTING

Chemical testing includes:

- Spark analysis
- Wet analysis
- Metal and alloy analysis
- Steel and cast iron testing
- Copper alloys
- Aluminium alloys
- Zinc and other alloys
- Building materials
- Ores and minerals
- Soil and related materials
- Sulphur analysis
- Carbon analysis
- Raw material analysis

The brochure references standards including IS, ASTM, BS and other specifications.

Never invent a chemical test, standard, detection limit, turnaround time, or price.


4. ELECTRICAL TESTING

Electrical testing services include:

- AC electric motor testing
- DC motor testing
- Small universal motors
- Electrical appliances
- Electrical cables
- Control devices
- Pumpsets
- VFD motor testing
- Solar photovoltaic pumpsets
- Electrical material testing
- Environmental testing
- Salt mist testing
- Vibration testing
- Ingress protection testing
- Appliance safety testing

The brochure also describes electrical motor testing facilities and testing according to various Indian and international standards.


5. WATER TESTING

Water testing services include:

- Drinking water
- Well water
- RO water
- Industrial effluent water
- Packaged drinking water
- Borewell water
- Dialysis water
- Swimming pool water
- Poultry using water
- Water for construction purposes
- Water for agricultural purposes

Water testing is performed according to applicable standards and specification guidelines mentioned by Si'Tarc.


6. FOOD TESTING

Food testing covers products such as:

- Rice
- Raw cow milk
- Curd
- Chips
- Bathing soap
- Toilet soap
- Milk and milk products
- Poultry products
- Flour
- Vinegar
- Jam
- Fruit jelly
- Salt
- Spices
- Honey
- Edible oils
- Fertilizers
- Coconut products
- Moringa products
- Other food products

The brochure mentions microbiological testing, including testing for pathogens and non-pathogens, along with analytical facilities such as:

- Atomic Absorption Spectrophotometer
- Gas Chromatography (GC)
- Gas Chromatography-Mass Spectrometry (GCMS)
- High Performance Liquid Chromatography (HPLC)
- Spectrophotometry


==================================================
CUSTOMER CONVERSATION STYLE
==================================================

Be:

- Professional
- Friendly
- Clear
- Helpful
- Concise
- Industry-oriented
- Suitable for WhatsApp conversations

Use simple English unless the customer asks for another language.

Do not use excessive technical terminology unless the customer is asking about technical specifications.

Use emojis sparingly and professionally.

Example:

"Hello 👋 Welcome to Si'Tarc Testing & Calibration Laboratory.

How can we help you today?

🔧 Instrument Calibration
⚙️ Mechanical Testing
⚡ Electrical Testing
🧪 Chemical Testing
💧 Water Testing
🍚 Food Testing
📞 Contact Our Team"


==================================================
LEAD QUALIFICATION
==================================================

When a customer shows interest in a service, collect relevant information naturally.

For calibration requests, ask:

1. Instrument name
2. Make/model, if available
3. Measurement range, if known
4. Quantity
5. Calibration requirement
6. In-house or onsite requirement, if relevant
7. Customer/company name
8. Contact number/email if required

For testing requests, ask:

1. Product/material/sample name
2. Type of test required
3. Applicable standard, if known
4. Sample quantity
5. Number of samples
6. Customer/company name
7. Contact details

Do not ask all questions at once unless necessary. Collect information conversationally.


==================================================
SERVICE RECOMMENDATION LOGIC
==================================================

If the customer describes a requirement:

- Identify the likely laboratory/service category.
- Explain the relevant service.
- Ask for the missing technical details.
- If the exact requirement cannot be confirmed from the available information, say that the laboratory team should verify it.
- Offer to connect the customer with the appropriate team.

Example:

Customer:
"I need to test a steel component."

Response:
"Sure. Si'Tarc provides mechanical and chemical testing for metallic materials. Could you tell me the type of steel component and the test you require, such as hardness, tensile, bend, chemical composition, or another test?"


==================================================
PRICING
==================================================

Never invent or estimate prices.

If the customer asks for pricing:

"Pricing depends on the instrument/product, test or calibration requirement, quantity, applicable standard, and other technical details. Please share your requirement and our team can provide the appropriate quotation."


==================================================
TURNAROUND TIME
==================================================

Never invent turnaround times.

If the customer asks:

"Turnaround time depends on the specific test/calibration and sample or instrument requirements. Our laboratory team can confirm the applicable timeline after reviewing your requirement."


==================================================
ACCREDITATION & STANDARDS
==================================================

Use only accreditation, recognition, and standards information supported by the official business material.

The brochure identifies Si'Tarc as:

- ISO/IEC 17025 accredited by NABL
- Recognized by DSIR
- Recognized by BIS
- Recognized by BEE
- Recognized by MNRE

When discussing a specific test or standard, do not claim that the laboratory is accredited for that specific scope unless the available official information confirms it.

If uncertain, say:

"Our team can confirm whether this specific test falls within the applicable accredited scope."


==================================================
QUOTATION / ENQUIRY HANDLING
==================================================

If the customer wants a quotation, collect the minimum necessary information and then guide them to the laboratory team.

Example:

"Sure. I can help prepare your enquiry. Please share:

• Product/instrument name
• Required test/calibration
• Quantity
• Company name
• Your contact number/email

Our team can then review the requirement and provide the appropriate quotation."


==================================================
HANDOFF TO HUMAN TEAM
==================================================

Transfer or direct the customer to the Si'Tarc team when:

- They request a quotation
- They need a customized testing procedure
- They ask about a test not clearly covered
- They need technical interpretation
- They ask about sample preparation
- They need urgent testing
- They have a complaint
- They need certification/documentation details
- They ask for a specific accreditation scope
- The AI does not have enough verified information

Use:

"I'll connect you with our laboratory team so they can confirm the technical details."


==================================================
IMPORTANT RULES
==================================================

1. Never fabricate information.
2. Never invent prices.
3. Never invent turnaround times.
4. Never claim a test is NABL-accredited unless the applicable scope is verified.
5. Never invent standards or certifications.
6. Never guarantee test results.
7. Never provide a technical conclusion when laboratory verification is required.
8. Never claim that a service is available if it is not supported by the available business information.
9. If information is unavailable, clearly say that the laboratory team needs to confirm it.
10. Keep customer information confidential.
11. Do not request unnecessary personal information.
12. Always remain professional and respectful.
13. Do not argue with customers.
14. If the customer is unsure what service they need, help identify the likely category through simple questions.
15. For urgent or technical requests, prioritize human-team handoff.


==================================================
PRIMARY OBJECTIVE
==================================================

Your primary objective is to:

1. Welcome customers.
2. Understand their testing or calibration requirement.
3. Identify the relevant Si'Tarc service.
4. Collect useful enquiry details.
5. Answer questions using verified business information.
6. Avoid unsupported claims.
7. Convert qualified enquiries into quotation/contact requests.
8. Connect customers with the appropriate Si'Tarc laboratory team when human or technical verification is required.

You are a business assistant, not a laboratory engineer. When technical confirmation is required, clearly defer to the Si'Tarc laboratory team.`;

const DEFAULT_PERSONA_PROMPT = `You are DhiGrowth AI Business Concierge, the official intelligent assistant for DhiGrowth IT Services on WhatsApp.

About DhiGrowth IT Services:
We provide:
📱 App Development (iOS, Android, Cross-platform, Flutter, React Native)
🤖 AI Business Solutions & Development (Custom AI agents, LLM integrations, workflow automations, 24/7 concierges)
💬 WhatsApp CRM & Automation (Official Meta Cloud API, lead capture, automated broadcasts, team inboxes)
💻 Custom IT Solutions (Web & SaaS development, cloud infrastructure, API integrations, enterprise software)

Core Behavior Instructions:
1. UNDERSTAND THE USER'S SPECIFIC BUSINESS WORDS: Comprehend and analyze their exact requirement.
2. TAILORED & RELEVANT: Give direct, helpful answers addressing specifically what they asked.
3. CONCISE FOR WHATSAPP: Keep replies concise (2-4 clear sentences or short punchy bullet points with emojis).
4. LEAD REQUIREMENTS COLLECTION: Inquire about services needed, full name, phone number, and preferred meeting date/time.
5. LOCATION: Registered headquarters in Coimbatore, Tamil Nadu, India.`;

const PERSONA_PRESETS = [
  {
    id: 'sitarc_lab',
    label: "🔬 Si'Tarc Testing & Calibration Lab",
    prompt: SITARC_PERSONA_PROMPT,
  },
  {
    id: 'it_services',
    label: 'IT & Software Concierge',
    prompt: DEFAULT_PERSONA_PROMPT,
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce & Retail',
    prompt: `You are the friendly WhatsApp Sales Assistant for our retail store.\nHelp customers browse our product catalog, verify sizing/colors, confirm Cash on Delivery (COD) orders, and provide real-time shipment updates.\nKeep messages warm, helpful, and concise with relevant emojis.`,
  },
  {
    id: 'appointments',
    label: 'Appointments & Consultations',
    prompt: `You are the executive appointment coordinator for our business.\nAnswer prospective client questions, collect project requirements, and assist them in scheduling a consultation call or live demo.\nAlways collect their Name, Phone number, and preferred date/time slot.`,
  },
  {
    id: 'support',
    label: '24/7 Customer Support',
    prompt: `You are the 24/7 Customer Support AI for our business.\nAssist users with account inquiries, order tracking, troubleshooting, and answers to common questions.\nIf a question requires human attention, reassure the user and offer to escalate to an agent.`,
  },
];

export const AiStudio = () => {
  const {
    currentUser,
    aiConfig,
    setAiConfig,
    saveAiConfig,
    testAiConfig,
    isAiConfigLoading,
    knowledgeBase,
    setKnowledgeBase,
    showToast,
    credits,
    setCredits,
    rechargeAiCredits,
    setActiveTab,
  } = useApp();

  // Local form state for AI API Key & Provider
  const [provider, setProvider] = useState(aiConfig?.provider || 'gemini');
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');
  const [model, setModel] = useState(aiConfig?.model || 'gemini-1.5-flash');
  const [systemPrompt, setSystemPrompt] = useState(aiConfig?.systemPrompt || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('25');
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);
  const [savedPersonaBackup, setSavedPersonaBackup] = useState(aiConfig?.systemPrompt || '');

  const isSitarcTenant =
    currentUser?.username?.toLowerCase().includes('sitarc') ||
    currentUser?.companyName?.toLowerCase().includes('sitarc') ||
    currentUser?.name?.toLowerCase().includes('sitarc') ||
    aiConfig?.systemPrompt?.includes("Si'Tarc");

  // Sync state if aiConfig updates from server
  useEffect(() => {
    if (aiConfig) {
      if (aiConfig.provider) setProvider(aiConfig.provider);
      if (aiConfig.model) setModel(aiConfig.model);
      if (aiConfig.apiKey && !apiKey) setApiKey(aiConfig.apiKey);
      if (aiConfig.systemPrompt) {
        setSystemPrompt(aiConfig.systemPrompt);
        setSavedPersonaBackup(aiConfig.systemPrompt);
      } else if (isSitarcTenant && !systemPrompt) {
        setSystemPrompt(SITARC_PERSONA_PROMPT);
        setSavedPersonaBackup(SITARC_PERSONA_PROMPT);
      }
    } else if (isSitarcTenant && !systemPrompt) {
      setSystemPrompt(SITARC_PERSONA_PROMPT);
      setSavedPersonaBackup(SITARC_PERSONA_PROMPT);
    }
  }, [aiConfig, isSitarcTenant]);

  const currentProviderConfig = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleProviderChange = (newProviderId) => {
    setProvider(newProviderId);
    const target = PROVIDERS.find((p) => p.id === newProviderId);
    if (target && target.models?.length > 0) {
      setModel(target.models[0].id);
    }
    setTestResult(null);
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim() && !aiConfig?.hasKey) {
      showToast('Please enter an API Key to test connection.', 'error');
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await testAiConfig({
        provider,
        apiKey: apiKey.trim(),
        model,
        testPrompt: 'Hello! Are you online and ready to assist WhatsApp customers with IT services?',
      });

      if (res && res.success && res.data) {
        setTestResult({
          success: true,
          reply: res.data.reply,
          latencyMs: res.data.latencyMs,
          model: res.data.model,
          provider: res.data.provider,
        });
        showToast(`🎉 Connected to ${provider.toUpperCase()} (${res.data.latencyMs}ms)!`, 'success');
      } else {
        setTestResult({
          success: false,
          error: res?.error || 'Connection failed. Please check your API key and quota.',
        });
        showToast(res?.error || 'AI test failed', 'error');
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'Network error while testing AI API.',
      });
      showToast(err.message, 'error');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    try {
      await saveAiConfig({
        provider,
        apiKey: apiKey.trim(),
        model,
        systemPrompt,
      });
      setSavedPersonaBackup(systemPrompt);
      showToast('🎉 AI configuration updated successfully!', 'success');
    } catch (err) {
      // Error is handled in AppContext
    }
  };

  const handleSavePersona = async () => {
    setIsSavingPersona(true);
    try {
      await saveAiConfig({
        provider: provider || 'gemini',
        apiKey: (apiKey || '').trim(),
        model: model || 'gemini-1.5-flash',
        systemPrompt,
      });
      setSavedPersonaBackup(systemPrompt);
      setIsEditingPersona(false);
      showToast('🎉 Business Persona & System Instructions saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save Business Persona', 'error');
    } finally {
      setIsSavingPersona(false);
    }
  };

  const handleCancelPersonaEdit = () => {
    setSystemPrompt(savedPersonaBackup || aiConfig?.systemPrompt || '');
    setIsEditingPersona(false);
  };

  // Sandbox Live Test Messages
  const [testMessages, setTestMessages] = useState([
    {
      id: 't1',
      sender: 'user',
      text: 'Hi! What services does DhiGrowth provide and can you help with WhatsApp CRM?',
      time: '11:00 AM',
    },
    {
      id: 't2',
      sender: 'ai',
      text: 'Hello! 👋 We provide App Development, AI Business Solutions, WhatsApp CRM & Custom IT Solutions. We can deploy full Meta Cloud API automation for your business right away! 🚀',
      time: '11:00 AM',
    },
  ]);

  const [testInput, setTestInput] = useState('');
  const [isSandboxTyping, setIsSandboxTyping] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Catalog');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const handleTestSend = async (e) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: testInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentQuery = testInput;
    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput('');
    setIsSandboxTyping(true);

    try {
      // If user has entered an API key, call the live AI API directly!
      if (apiKey || aiConfig?.hasKey) {
        const res = await testAiConfig({
          provider,
          apiKey: apiKey.trim(),
          model,
          testPrompt: currentQuery,
        });

        if (res?.success && res?.data?.reply) {
          setTestMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: res.data.reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelTag: `${(provider || 'AI').toUpperCase()} · ${res.data?.latencyMs || 0}ms`,
            },
          ]);
          return;
        }
      }

      // Simulated fallback if no API key is present
      setTimeout(() => {
        let reply = `Thank you for reaching out! DhiGrowth AI Concierge is ready to help with App Development, AI Business Solutions, and WhatsApp CRM.`;
        if (currentQuery.toLowerCase().includes('price') || currentQuery.toLowerCase().includes('cost')) {
          reply = `Our project pricing is customized based on your business scope. Feel free to share brief details and we will prepare a tailored proposal! 🤝`;
        }
        setTestMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelTag: 'Local Rules Engine',
          },
        ]);
      }, 600);
    } catch (err) {
      setTestMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Error reaching ${provider}: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSandboxTyping(false);
    }
  };

  const handleAddDoc = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const doc = {
      id: `kb-${Date.now()}`,
      title: newTitle,
      category: newCat,
      tokens: '3,100 tokens',
      lastSync: 'Just now',
    };

    setKnowledgeBase((prev) => [doc, ...prev]);
    setNewTitle('');
    setIsAddingDoc(false);
    showToast(`Indexed "${newTitle}" into vector knowledge base!`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1350px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#101828] tracking-tight">
              AI Assistants & Prompt Studio
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD] font-mono">
              v2.5 Live
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Configure your AI API keys, choose models (Gemini, OpenAI, Groq), and empower 24/7 intelligent WhatsApp auto-pilot replies.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isAiConfigLoading}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-75"
        >
          {isAiConfigLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save & Activate on WhatsApp</span>
        </button>
      </div>

      {/* AI Assistant Credits & Power Status Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] p-6 text-white shadow-md shadow-purple-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20 shadow-xs">
            <Zap className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                AI Assistants Wallet Credits
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready &amp; Funded</span>
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              ${credits.toFixed(2)}
              <span className="text-xs font-medium text-white/80 ml-2">
                (~{Math.floor(credits / 0.002).toLocaleString()} AI replies remaining at ~$0.002/reply)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsRechargeModalOpen(true)}
            className="px-5 py-2.5 bg-white text-[#7C3AED] hover:bg-[#F4F0FD] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 text-[#7C3AED]" />
            <span>Recharge AI Credits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/20 backdrop-blur-md"
          >
            Manage in Wallet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: AI Provider & API Key Configuration */}
          <div className="sendiee-card p-6 space-y-5 border border-[#E9D8FD]/80 shadow-sm bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">AI Provider & API Credentials</h3>
                  <p className="text-[11px] text-[#667085]">Select your AI engine and enter your API Key to enable live replies</p>
                </div>
              </div>

              {aiConfig?.hasKey && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>LIVE CONNECTED</span>
                </span>
              )}
            </div>

            {/* Zero-Markup AI Token Notice */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FEF0C7] flex items-start gap-2.5 text-xs text-[#92400E]">
              <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-[#B45309]">Zero-Markup AI Token Policy (BYOK):</strong> Connect your own API key below. You only pay your AI provider directly at wholesale developer rates. WAPPPILOT charges <strong>$0 markup</strong> on AI tokens; you only pay WAPPPILOT a monthly platform subscription.
              </div>
            </div>

            {/* Provider Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#344054]">Select AI Engine Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PROVIDERS.map((p) => {
                  const isSelected = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderChange(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#7C3AED] bg-[#F4F0FD] text-[#101828] ring-2 ring-[#7C3AED]/20 shadow-2xs'
                          : 'border-[#EAECF0] bg-[#F9FAFB] text-[#475467] hover:border-[#D0D5DD] hover:bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#101828]">{p.name}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-2 w-fit border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                  <span>{currentProviderConfig.name} API Key</span>
                  <span className="text-red-500">*</span>
                </label>

                <a
                  href={currentProviderConfig.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Get {currentProviderConfig.name} Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={aiConfig?.maskedKey || currentProviderConfig.placeholder}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-3.5 pr-20 py-2.5 rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] transition-colors"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1.5 text-[#667085] hover:text-[#101828] rounded-lg hover:bg-[#EAECF0]/60 cursor-pointer"
                    title={showApiKey ? 'Hide key' : 'Show key'}
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#667085]">
                {currentProviderConfig.docs}
              </p>
            </div>

            {/* Model Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#344054]">Model Name</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] font-bold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                {currentProviderConfig.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.note}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Test Connection & Save */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingKey}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] text-[#344054] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#7C3AED] ${isTestingKey ? 'animate-spin' : ''}`} />
                <span>{isTestingKey ? 'Testing API...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isAiConfigLoading}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Connect Engine</span>
              </button>
            </div>

            {/* Test Result Feedback Box */}
            {testResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 animate-in fade-in ${
                  testResult.success
                    ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      <span>Connected Successfully! ({testResult.provider.toUpperCase()} · {testResult.latencyMs}ms)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                      <span>Connection Error</span>
                    </>
                  )}
                </div>

                {testResult.success ? (
                  <p className="text-[11px] text-[#15803D] bg-white/70 p-2.5 rounded-xl border border-[#BBF7D0] italic">
                    "{testResult.reply}"
                  </p>
                ) : (
                  <p className="text-[11px] text-[#B91C1C]">
                    {testResult.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Card 2: System Instructions & Persona */}
          <div className="sendiee-card p-6 space-y-4 bg-white border border-[#EAECF0] rounded-2xl shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center border border-purple-200">
                  <Sliders className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-[#101828] flex items-center gap-2 font-mono">
                    <span>Business Persona & System Instructions</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085]">
                    Injected into every live WhatsApp conversation for automated intelligence
                  </p>
                </div>
              </div>

              {/* Edit / View Toggle Button in Header */}
              <div className="flex items-center gap-2">
                {!isEditingPersona ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSavedPersonaBackup(systemPrompt);
                      setIsEditingPersona(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-[#DDD6FE] bg-[#F4F0FD] hover:bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Persona</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCancelPersonaEdit}
                      disabled={isSavingPersona}
                      className="px-3 py-1.5 rounded-xl border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePersona}
                      disabled={isSavingPersona}
                      className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPersona ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{isSavingPersona ? 'Saving...' : 'Save Persona'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Presets Quick Selector (Shown in edit mode) */}
            {isEditingPersona && (
              <div className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#667085]">
                    Quick Persona Presets
                  </span>
                  <span className="text-[10px] text-[#7C3AED]">
                    Click to load business template
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PERSONA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSystemPrompt(preset.prompt)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E9D8FD] hover:border-[#7C3AED] hover:bg-purple-50/50 text-[#344054] hover:text-[#7C3AED] font-medium transition-all cursor-pointer shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Persona Content Box: View Mode vs Edit Mode */}
            {!isEditingPersona ? (
              <div
                onClick={() => {
                  setSavedPersonaBackup(systemPrompt);
                  setIsEditingPersona(true);
                }}
                className="group relative p-4 rounded-xl border border-purple-200 bg-purple-50/20 hover:bg-purple-50/40 hover:border-purple-300 transition-all cursor-pointer font-mono text-xs text-[#101828] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap"
                title="Click anywhere to edit business instructions"
              >
                {systemPrompt ? (
                  systemPrompt
                ) : (
                  <span className="text-[#98A2B3] italic">
                    No custom persona configured yet. Click "Edit Persona" to define your business assistant tone, services, and appointment rules.
                  </span>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs border border-purple-200 px-2 py-1 rounded-md text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 shadow-2xs">
                  <Edit3 className="w-3 h-3" />
                  <span>Click to Edit</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in">
                <textarea
                  rows={8}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are DhiGrowth AI Business Concierge..."
                  autoFocus
                  className="w-full bg-white border-2 border-[#7C3AED] p-3.5 rounded-xl text-xs text-[#101828] font-mono leading-relaxed focus:outline-none ring-2 ring-[#7C3AED]/20 resize-y"
                />

                {/* Bottom Action Toolbar inside Edit Mode */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-3 text-[11px] text-[#667085] font-mono">
                    <span>
                      {(systemPrompt || '').length} characters
                    </span>
                    <span>•</span>
                    <span>
                      {(systemPrompt || '').trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      type="button"
                      onClick={() => setSystemPrompt(DEFAULT_PERSONA_PROMPT)}
                      className="text-[#7C3AED] hover:underline flex items-center gap-1 font-sans font-bold cursor-pointer ml-2"
                      title="Reset to official DhiGrowth persona"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelPersonaEdit}
                      disabled={isSavingPersona}
                      className="px-3 py-1.5 rounded-xl border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePersona}
                      disabled={isSavingPersona}
                      className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPersona ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{isSavingPersona ? 'Saving...' : 'Save Persona'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#667085]">
              Customize your tone, service highlights (App Development, AI Solutions, WhatsApp CRM), and instructions for handling price inquiries.
            </p>
          </div>

          {/* Card 3: RAG Knowledge Base */}
          <div className="sendiee-card p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase text-[#667085] flex items-center gap-2 font-mono">
                <Database className="w-4 h-4 text-[#7C3AED]" />
                <span>RAG Knowledge Base ({knowledgeBase.length} sources)</span>
              </div>
              <button
                onClick={() => setIsAddingDoc(!isAddingDoc)}
                className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source</span>
              </button>
            </div>

            {isAddingDoc && (
              <form onSubmit={handleAddDoc} className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E9D8FD] space-y-3 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Document Title (e.g. Services Pricing 2026)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border border-[#EAECF0] px-3.5 py-1.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="bg-white border border-[#EAECF0] px-3.5 py-1.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Catalog">Product & Services Catalog</option>
                    <option value="Policy FAQ">Policy & Delivery FAQ</option>
                    <option value="Pricing">Pricing Sheet</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Index Document
                </button>
              </form>
            )}

            <div className="space-y-2">
              {knowledgeBase.map((kb) => (
                <div
                  key={kb.id}
                  className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#7C3AED]" />
                    <span className="font-bold text-[#101828]">{kb.title}</span>
                    <span className="text-[10px] font-mono bg-white border border-[#EAECF0] text-[#667085] px-2 py-0.5 rounded-full">
                      {kb.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">{kb.lastSync}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sandbox Simulator (5 cols) */}
        <div className="lg:col-span-5 sendiee-card p-6 flex flex-col h-[740px] justify-between bg-white border border-[#EAECF0]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-xs font-bold uppercase text-[#101828] font-mono">
                  Interactive AI Sandbox
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                {provider.toUpperCase()} · {model.split('-')[0]}
              </span>
            </div>
            <p className="text-[11px] text-[#667085] mt-2">
              Type any customer query below to chat with your live AI model in real time.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {testMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#F9FAFB] border border-[#EAECF0] text-[#101828]'
                      : 'bg-[#F4F0FD] border border-[#E9D8FD] text-[#101828]'
                  }`}
                >
                  {m.sender === 'ai' && (
                    <div className="text-[10px] font-mono text-[#7C3AED] font-bold mb-1 flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                        <span>DhiGrowth AI</span>
                      </span>
                      {m.modelTag && (
                        <span className="text-[9px] text-[#667085] bg-white px-1.5 py-0.2 rounded border border-[#E9D8FD]">
                          {m.modelTag}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[9px] text-[#98A2B3] mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isSandboxTyping && (
              <div className="flex items-center gap-2 p-3 bg-[#F4F0FD] border border-[#E9D8FD] rounded-2xl w-fit text-xs text-[#7C3AED]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="font-semibold text-[11px]">AI is generating response...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleTestSend} className="pt-3 border-t border-[#EAECF0] flex gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. What is your app pricing?)..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={isSandboxTyping || !testInput.trim()}
              className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* AI Assistant Quick Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Zap className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Recharge AI Assistants</h3>
                <p className="text-xs text-[#667085]">Instant credits to power 24/7 autonomous replies on WhatsApp</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8FF] border border-[#E9D8FD] rounded-2xl flex items-center justify-between text-xs">
              <span className="text-[#475467]">Current Balance</span>
              <span className="font-mono font-bold text-[#7C3AED] text-sm">${credits.toFixed(2)}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Select Recharge Package</label>
                <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                  {[
                    { amt: '10', replies: '5,000 replies', popular: false },
                    { amt: '25', replies: '12,500 replies', popular: true },
                    { amt: '50', replies: '25,000 replies', popular: false },
                    { amt: '100', replies: '50,000 replies', popular: false },
                  ].map((pkg) => (
                    <button
                      key={pkg.amt}
                      type="button"
                      onClick={() => setRechargeAmt(pkg.amt)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                        rechargeAmt === pkg.amt
                          ? 'border-[#7C3AED] bg-[#F4F0FD] text-[#101828] ring-2 ring-[#7C3AED]/20 shadow-2xs'
                          : 'bg-[#F9FAFB] border-[#EAECF0] text-[#344054] hover:bg-white hover:border-[#D0D5DD]'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7C3AED] text-white uppercase font-mono shadow-2xs">
                          Popular
                        </span>
                      )}
                      <div className="font-extrabold text-sm font-mono text-[#101828]">${pkg.amt} USD</div>
                      <div className="text-[11px] text-[#667085] mt-1 font-medium">{pkg.replies}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-[#475467] bg-[#F9FAFB] p-2.5 rounded-xl border border-[#EAECF0]">
                💡 <strong>Zero Markup:</strong> ~$0.002 per message. Direct credit usage with zero recurring commitments.
              </div>

              <button
                type="button"
                onClick={() => {
                  rechargeAiCredits(rechargeAmt);
                  setIsRechargeModalOpen(false);
                }}
                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 mt-3 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Recharge ${rechargeAmt} AI Credits Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
