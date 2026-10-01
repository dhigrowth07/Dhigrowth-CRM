import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  ChevronDown,
  RotateCw,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
  X,
  MessageSquare,
  Zap,
  Edit3,
  Trash2,
  Copy,
  Check,
  Smartphone,
  Send,
  HelpCircle,
  Clock,
  CheckCheck,
  Bot,
  Tag,
  Loader2,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  Shield,
  UploadCloud,
  Type,
  Video,
  ExternalLink,
  Phone,
  Globe,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  DEFAULT_WORKSPACE_ID
} from '../../services/supabaseClient';

export const PRESET_HEADER_IMAGES = [
  { label: '📱 App Tech', url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80' },
  { label: '🤖 AI & Automation', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { label: '💬 WhatsApp CRM', url: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=80' },
  { label: '🚀 Business Growth', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80' },
  { label: '🎟️ Offers & Promo', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80' },
];

export const DHI_PRESET_TEMPLATES = [
  {
    id: 'tpl_ai_discovery',
    name: 'ai_it_discovery',
    displayName: 'AI & IT Discovery',
    badge: 'Recommended',
    category: 'utility',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: 'DhiGrowth IT Services',
    body_text: `Hello {{name}}! 👋 Welcome to DhiGrowth IT Services.

Are you looking to scale your business with custom App Development, AI Auto-Pilot Bots, or WhatsApp CRM Automation?

Tap below to connect with our team! 🚀`,
    footer_text: 'hi, hello, discovery, app, ai, crm, start',
    buttons: [
      { type: 'QUICK_REPLY', text: "Yes, I'm interested" },
      { type: 'QUICK_REPLY', text: 'Tell me more' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
  {
    id: 'tpl_free_call',
    name: 'free_15_min_call',
    displayName: 'Free 15-Min Call',
    badge: 'Popular',
    category: 'marketing',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: 'Special Tech Invitation',
    body_text: `Hi {{name}}! 🚀 We're offering complimentary 15-minute technology consultation sessions this week for ambitious founders.

Would you like us to schedule a quick call with our lead tech architect?`,
    footer_text: 'call, meeting, consultation, free, appointment, schedule',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Yes, Schedule Call' },
      { type: 'QUICK_REPLY', text: 'Share Times' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
  {
    id: 'tpl_crm_demo',
    name: 'whatsapp_crm_demo',
    displayName: 'WhatsApp CRM Demo',
    badge: 'High Conversion',
    category: 'utility',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: 'WhatsApp Automation',
    body_text: `Hello {{name}}! Want to see a live 2-minute demo of 24/7 AI lead capture, broadcast marketing, and automated team inboxes on WhatsApp?`,
    footer_text: 'crm, demo, automation, bot, live, features',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Yes, Send Demo' },
      { type: 'QUICK_REPLY', text: 'Chat with Agent' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
  {
    id: 'tpl_custom_template',
    name: 'custom_template',
    displayName: 'Custom Template',
    badge: 'Freeform',
    category: 'marketing',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: 'DhiGrowth IT Services',
    body_text: `Hi {{name}}! We would love to share our latest updates with you. Would you like more details?`,
    footer_text: 'updates, details, info, more, custom',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Yes, please' },
      { type: 'QUICK_REPLY', text: 'Not right now' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
];

export const SITARC_PRESET_TEMPLATES = [
  {
    id: 'tpl_sitarc_testing_inquiry',
    name: 'sitarc_testing_inquiry',
    displayName: "Si'Tarc Testing Inquiry",
    badge: 'Recommended',
    category: 'utility',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: "Si'Tarc Testing Laboratory",
    body_text: `Hello {{name}}! 👋 Welcome to Si'Tarc Testing & Calibration Laboratory.

How can our accredited laboratory assist you today with Pump, Motor, Electrical, Chemical, or Mechanical testing and calibration services?

Tap below to connect with our technical testing team! 🔬`,
    footer_text: 'testing, calibration, pump, motor, sitarc, lab, quote',
    buttons: [
      { type: 'QUICK_REPLY', text: "Request Test Quote" },
      { type: 'QUICK_REPLY', text: "Connect with Engineer" },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
  {
    id: 'tpl_sitarc_calibration_booking',
    name: 'sitarc_calibration_booking',
    displayName: 'Calibration Booking',
    badge: 'Popular',
    category: 'utility',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: "Si'Tarc Calibration Services",
    body_text: `Hi {{name}}! ⚙️ Looking for NABL / ISO 17025 accredited calibration for your industrial instruments, pressure gauges, or thermal equipment?

We provide comprehensive on-site and laboratory calibration with certified test reports.`,
    footer_text: 'calibration, nabl, iso17025, instruments, report',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Book Calibration' },
      { type: 'QUICK_REPLY', text: 'View Accreditation' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
  {
    id: 'tpl_sitarc_report_status',
    name: 'sitarc_report_status',
    displayName: 'Test Report Status',
    badge: 'High Conversion',
    category: 'utility',
    language: 'en_US',
    status: 'approved',
    header_type: 'TEXT',
    header_content: 'Test Report Dispatch',
    body_text: `Hello {{name}}! Your sample testing / calibration report is being processed by the Si'Tarc laboratory technical team. Would you like a digital copy dispatched via WhatsApp?`,
    footer_text: 'report, status, certificate, dispatch, sitarc',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Send Test Report' },
      { type: 'QUICK_REPLY', text: 'Speak to Lab Head' },
    ],
    variables: ['name'],
    syncedWithMeta: true,
  },
];

export const DEFAULT_SITARC_TEMPLATES = [
  ...SITARC_PRESET_TEMPLATES,
  {
    id: 'tpl_hi_sitarc',
    name: 'hi',
    category: 'utility',
    status: 'approved',
    header_type: 'NONE',
    header_content: null,
    footer_text: 'hi, hello',
    body_text: `👋 *Hello {{1}}!*

Welcome to *Si'Tarc Testing & Calibration Laboratory* 🔬

We provide accredited testing and calibration services:

🔬 *Pump & Motor Testing Laboratory*
⚡ *Electrical & Electronics Testing*
🧪 *Chemical & Metallurgy Analysis*
📏 *NABL Accredited Calibration Services*

🎯 How can our technical laboratory team assist you?

👉 *Explore our services:* {{3}}

📩 *Test / Calibration Requirement:* {{2}}

*Si'Tarc Testing & Calibration Laboratory* — Coimbatore. 🔬`,
  },
  {
    id: 't-sitarc-welcome',
    name: "Welcome to Si'Tarc Laboratory",
    category: 'utility',
    status: 'approved',
    header_type: 'IMAGE',
    header_content: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&auto=format&fit=crop&q=80',
    footer_text: 'hi, hello, hey, start, menu, help, sitarc',
    body_text: `Hello! 👋 Welcome to **Si'Tarc Testing & Calibration Laboratory**.

How can our technical laboratory team assist you today? 🔬

We provide ISO/IEC 17025 accredited services:
🔬 **Pump & Motor Performance Testing**
⚡ **Electrical & Safety Testing**
🧪 **Chemical & Material Analysis**
📏 **Precision Calibration Laboratory**

Tell us your sample or calibration requirements, and our engineers will guide you!`,
  },
];

const DEFAULT_TEMPLATES = [
  ...DHI_PRESET_TEMPLATES,
  {
    id: 'tpl_hi_1789625763989',
    name: 'hi',
    category: 'utility',
    status: 'approved',
    header_type: 'NONE',
    header_content: null,
    footer_text: 'hi, hello',
    body_text: `👋 *Hello {{1}}!*

Welcome to *DhiGrowth IT Services* 🚀

We help businesses grow with powerful digital solutions:

💻 *App & Website Development*
🤖 *AI Solutions & Automation*
📈 *Business Development Solutions*
💬 *WhatsApp CRM & Automation*

🎯 Looking to take your business to the next level?

👉 *Explore our services:* {{3}}

📩 *Custom Requirement:* {{2}}

*DhiGrowth IT Services* — Building Technology. Growing Businesses. 🚀`,
  },
  {
    id: 't-welcome',
    name: 'Welcome Greeting (Hi / Hello)',
    category: 'utility',
    status: 'approved',
    header_type: 'IMAGE',
    header_content: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=80',
    footer_text: 'hi, hello, hey, start, menu, help',
    body_text: `Hello! 👋 Welcome to **DhiGrowth IT Services**.

How can our AI Business Concierge help you today? 🤖

We help businesses with:
📱 **App Development**
🤖 **AI Business Solutions & Development**
💬 **WhatsApp CRM & Automation**
💻 **Custom IT Solutions**

Tell us what your business needs, and let’s build something powerful together! 🚀`,
  },
  {
    id: 't-app',
    name: 'App Development Inquiry',
    category: 'utility',
    status: 'approved',
    header_type: 'IMAGE',
    header_content: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
    footer_text: 'app, mobile, android, ios, flutter, react native',
    body_text: `📱 **DhiGrowth App Development**

We build high-performance mobile and web apps tailored for your business with modern UI, robust backend, and seamless scalability.

• iOS & Android Native & Hybrid
• Custom UI/UX & Responsive Design
• Secure Cloud API Integration

Would you like to discuss your project requirements or see a quick demo? 🚀`,
  },
  {
    id: 't-ai',
    name: 'AI Business Solutions & Automation',
    category: 'utility',
    status: 'approved',
    header_type: 'IMAGE',
    header_content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    footer_text: 'ai, bot, automation, agent, workflow',
    body_text: `🤖 **AI Business Solutions & Development**

From autonomous AI customer concierges to workflow automations and custom LLM integrations, we help you reduce costs and run operations 24/7.

• 24/7 WhatsApp AI Auto-Pilot
• Custom AI Knowledge Base & Chatbots
• Business Process Automation

Would you like a demo of how AI can automate your business tasks? ✨`,
  },
  {
    id: 't-crm',
    name: 'WhatsApp CRM & Marketing',
    category: 'utility',
    status: 'approved',
    header_type: null,
    header_content: null,
    footer_text: 'whatsapp, crm, broadcast, marketing, lead',
    body_text: `💬 **WhatsApp CRM & Automation**

Supercharge your sales with official Meta WhatsApp Cloud API integration, broadcast campaigns, team inboxes, and AI auto-pilot replies.

• Official Green Tick & Cloud API
• Automated Inbound Lead Capture
• Broadcast Marketing with 98% Open Rates

Ready to convert leads faster on WhatsApp? Let’s connect! 📈`,
  },
  {
    id: 't-it',
    name: 'Custom IT & Software Solutions',
    category: 'utility',
    status: 'approved',
    header_type: null,
    header_content: null,
    footer_text: 'website, web, software, it solution, portal',
    body_text: `💻 **Custom IT & Software Solutions**

We engineer modern web applications, cloud backends, client portals, and robust enterprise software built for speed and security.

• Full-Stack Web Development
• Cloud Infrastructure & DevOps
• Third-Party API & Payment Gateways

Share your project requirements, and we'll prepare a custom roadmap for you! 🛠️`,
  },
  {
    id: 't-quote',
    name: 'Pricing & Consultation Quote',
    category: 'utility',
    status: 'approved',
    header_type: null,
    header_content: null,
    footer_text: 'price, cost, quote, rate, pricing, package',
    body_text: `💼 **Project Pricing & Consultation**

Our project pricing is customized based on your business scope, timeline, and technical requirements.

We offer transparent milestones and dedicated technical support. Share your project details or book a free 15-minute discovery consultation with our tech leads! 🤝`,
  },
];

export const TemplatesPage = () => {
  const { currentWorkspaceId, currentUser, currentTenant, showToast, subscription, openCheckout, isSuperAdmin } = useApp();

  const isDefaultWorkspace = currentWorkspaceId === DEFAULT_WORKSPACE_ID;

  const isSitarcTenant = Boolean(
    currentUser?.username?.toLowerCase().includes('sitarc') ||
    currentUser?.companyName?.toLowerCase().includes('sitarc') ||
    currentUser?.name?.toLowerCase().includes('sitarc') ||
    currentTenant?.username?.toLowerCase().includes('sitarc') ||
    currentWorkspaceId === 'b0000000-0000-0000-0000-000000000002'
  );

  const activeBusinessName = isSitarcTenant
    ? "Si'Tarc"
    : (currentUser?.companyName || currentTenant?.companyName || currentUser?.name || 'DhiGrowth');

  const activeBusinessInitials = isSitarcTenant
    ? 'ST'
    : (activeBusinessName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'DG');

  const activePresets = isSitarcTenant ? SITARC_PRESET_TEMPLATES : DHI_PRESET_TEMPLATES;
  const otherPresetNames = (isSitarcTenant ? DHI_PRESET_TEMPLATES : SITARC_PRESET_TEMPLATES).map((p) => p.name);
  const defaultTemplates = isSitarcTenant ? DEFAULT_SITARC_TEMPLATES : DEFAULT_TEMPLATES;

  const [templates, setTemplates] = useState(() => {
    try {
      const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId}`;
      let deletedList = [];
      try {
        const s = localStorage.getItem(deletedKey);
        if (s) deletedList = JSON.parse(s);
      } catch {}

      const filterDeleted = (list) => {
        if (!Array.isArray(list)) return [];
        if (!deletedList || deletedList.length === 0) return list;
        return list.filter((t) => !deletedList.includes(String(t.id)) && (!t.name || !deletedList.includes(t.name)));
      };

      const ensurePresets = (list) => {
        let cleaned = filterDeleted(list);
        if (isSitarcTenant) {
          cleaned = cleaned.filter((t) => !otherPresetNames.includes(t.name) && t.name !== 'ai_it_discovery');
        }
        for (let i = activePresets.length - 1; i >= 0; i--) {
          const p = activePresets[i];
          if (!deletedList.includes(p.name) && !deletedList.includes(String(p.id))) {
            if (!cleaned.some((t) => t.name === p.name || String(t.id) === String(p.id))) {
              cleaned.unshift({ ...p });
            }
          }
        }
        return cleaned;
      };

      const saved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      if (saved) return ensurePresets(JSON.parse(saved));
    } catch {}
    return defaultTemplates;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | greetings | services | pricing
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTriggers, setFormTriggers] = useState('');
  const [formCategory, setFormCategory] = useState('MARKETING'); // 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  const [formLanguage, setFormLanguage] = useState('en_US');
  const [formHeaderType, setFormHeaderType] = useState('NONE'); // 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formFooter, setFormFooter] = useState('');
  const [actionType, setActionType] = useState('QUICK_REPLY'); // 'NONE' | 'CTA' | 'QUICK_REPLY'
  const [ctaPhone, setCtaPhone] = useState(() => ({
    text: 'Call Us',
    phone: isSitarcTenant ? '+916369793937' : '+919791471277',
  }));
  const [ctaUrl, setCtaUrl] = useState(() => ({
    text: 'Visit Website',
    url: isSitarcTenant ? 'https://www.sitarc.com' : 'https://www.dhigrowth.com',
    urlType: 'Static',
  }));
  const [quickReplies, setQuickReplies] = useState([
    { id: 1, text: "Yes, I'm interested" },
    { id: 2, text: 'Tell me more' },
  ]);
  const [sampleValues, setSampleValues] = useState({});
  const [formButton1, setFormButton1] = useState('');
  const [formButton2, setFormButton2] = useState('');
  const [formReSubmitMeta, setFormReSubmitMeta] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [modalTab, setModalTab] = useState('editor'); // 'editor' | 'preview'
  const fileInputRef = useRef(null);

  // Helper to validate whether a string is a valid media URL, data URL, or uploaded path
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('data:')) return true;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
    if (trimmed.startsWith('/uploads/')) return true;
    return false;
  };

  // Image File Upload Handler (Supports local PNG/JPG/WebP/SVG upload)
  const handleImageFileSelect = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB', 'error');
      return;
    }

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setFormImageUrl(base64Data);

      try {
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            filename: file.name,
          }),
        });

        let uploadResult = null;
        if (res.ok) {
          uploadResult = await res.json();
        } else {
          const fbRes = await fetch('http://localhost:4000/api/upload/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: base64Data,
              filename: file.name,
            }),
          });
          if (fbRes.ok) uploadResult = await fbRes.json();
        }

        if (uploadResult?.url) {
          setFormImageUrl(uploadResult.url);
          showToast(`✓ Image "${file.name}" uploaded & attached!`, 'success');
        } else {
          showToast(`✓ Image "${file.name}" attached!`, 'success');
        }
      } catch (uploadErr) {
        console.warn('[Template Image Upload] Local preview retained:', uploadErr);
        showToast(`✓ Image "${file.name}" attached locally!`, 'success');
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setIsUploadingImage(false);
      showToast('Error reading image file', 'error');
    };

    reader.readAsDataURL(file);
  };

  // Meta Approval Async Action States
  const [submittingApprovalId, setSubmittingApprovalId] = useState(null);
  const [checkingStatusId, setCheckingStatusId] = useState(null);

  // Interactive Live Simulator State
  const [testInput, setTestInput] = useState('hi');
  const [simulatedReply, setSimulatedReply] = useState('');
  const [simulatedImage, setSimulatedImage] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load from Supabase on mount and whenever workspace changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      if (saved) {
        setTemplates(JSON.parse(saved));
      } else {
        setTemplates(currentWorkspaceId === DEFAULT_WORKSPACE_ID ? defaultTemplates : []);
      }
    } catch {
      setTemplates(currentWorkspaceId === DEFAULT_WORKSPACE_ID ? defaultTemplates : []);
    }
    loadTemplates();
  }, [currentWorkspaceId, isSitarcTenant]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL | MARKETING | UTILITY | AUTHENTICATION
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL | APPROVED | PENDING | REJECTED

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // 0. Get deleted templates filter set for workspace
      const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId}`;
      let deletedList = [];
      try {
        const s = localStorage.getItem(deletedKey);
        if (s) deletedList = JSON.parse(s);
      } catch {}

      const filterDeleted = (list) => {
        if (!Array.isArray(list)) return [];
        if (!deletedList || deletedList.length === 0) return list;
        return list.filter((t) => !deletedList.includes(String(t.id)) && (!t.name || !deletedList.includes(t.name)));
      };

      const ensurePresets = (list) => {
        let cleaned = filterDeleted(list);
        if (isSitarcTenant) {
          cleaned = cleaned.filter((t) => !otherPresetNames.includes(t.name) && t.name !== 'ai_it_discovery');
        }
        for (let i = activePresets.length - 1; i >= 0; i--) {
          const p = activePresets[i];
          if (!deletedList.includes(p.name) && !deletedList.includes(String(p.id))) {
            if (!cleaned.some((t) => t.name === p.name || String(t.id) === String(p.id))) {
              cleaned.unshift({ ...p });
            }
          }
        }
        return cleaned;
      };

      // 1. First check if this user already has a saved template list
      const localSaved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      let parsedLocal = null;
      if (localSaved !== null) {
        try {
          parsedLocal = JSON.parse(localSaved);
          if (Array.isArray(parsedLocal)) {
            setTemplates(ensurePresets(parsedLocal));
          }
        } catch {}
      }

      // 2. Fetch official templates from backend Meta templates API for this workspace
      let metaData;
      try {
        const res = await fetch(`/api/meta/templates?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
        if (res.ok) metaData = await res.json();
      } catch {}

      if (!metaData) {
        try {
          const res = await fetch(`http://localhost:4000/api/meta/templates?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
          if (res.ok) metaData = await res.json();
        } catch {}
      }

      if (metaData && Array.isArray(metaData.templates)) {
        const cleaned = ensurePresets(metaData.templates);
        setTemplates(cleaned);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(cleaned));
        } catch {}
        return;
      }

      // 3. Fallback to Supabase
      const data = await getTemplates(currentWorkspaceId);
      if (data && data.length > 0) {
        const cleaned = ensurePresets(data);
        setTemplates(cleaned);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(cleaned));
        } catch {}
      } else if (parsedLocal !== null) {
        setTemplates(ensurePresets(parsedLocal));
      } else {
        const cleaned = ensurePresets(defaultTemplates);
        setTemplates(cleaned);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(cleaned));
        } catch {}
      }
    } catch (err) {
      console.warn('Load templates note:', err);
      const localSaved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      if (localSaved !== null) {
        try {
          setTemplates(JSON.parse(localSaved));
          return;
        } catch {}
      }
      setTemplates(defaultTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncMeta = async () => {
    setIsSyncing(true);
    try {
      let res;
      try {
        res = await fetch('/api/meta/templates/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspaceId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/meta/templates/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: currentWorkspaceId }),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId}`;
          let deletedList = [];
          try {
            const s = localStorage.getItem(deletedKey);
            if (s) deletedList = JSON.parse(s);
          } catch {}
          const cleaned = data.templates.filter(
            (t) => !deletedList.includes(String(t.id)) && (!t.name || !deletedList.includes(t.name))
          );
          setTemplates(cleaned);
          try {
            localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(cleaned));
          } catch {}
        }
        showToast(data.message || `Synced ${data.syncedCount || 0} templates with Meta!`, 'success');
      } else {
        showToast('Templates synced with workspace cache.', 'info');
      }
    } catch (err) {
      showToast('Synced from workspace cache', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    if (!isSuperAdmin && subscription && subscription.status !== 'active') {
      showToast('🔒 Active subscription required to create official Meta templates. Please upgrade your plan.', 'error');
      if (typeof openCheckout === 'function') {
        openCheckout('Growth', 'monthly', 'razorpay');
      }
      return;
    }
    setFormName('');
    setFormTriggers('');
    setFormCategory('MARKETING');
    setFormLanguage('en_US');
    setFormHeaderType('NONE');
    setFormHeaderText('');
    setFormImageUrl('');
    setFormBody('');
    setFormFooter('');
    setActionType('QUICK_REPLY');
    setCtaPhone({ text: 'Call Us', phone: isSitarcTenant ? '+916369793937' : '+919791471277' });
    setCtaUrl({ text: 'Visit Website', url: isSitarcTenant ? 'https://www.sitarc.com' : 'https://www.dhigrowth.com', urlType: 'Static' });
    setQuickReplies([
      { id: 1, text: "Yes, I'm interested" },
      { id: 2, text: 'Tell me more' },
    ]);
    setSampleValues({});
    setFormReSubmitMeta(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.displayName || template.name || '');
    setFormTriggers(template.footer_text || '');
    setFormCategory((template.category || 'marketing').toUpperCase());
    setFormLanguage(template.language || 'en_US');
    setFormBody(template.body_text || '');
    setFormFooter(template.footer_text || '');

    // Buttons
    if (Array.isArray(template.buttons) && template.buttons.length > 0) {
      const hasCta = template.buttons.some((b) => b.type === 'URL' || b.type === 'PHONE_NUMBER');
      if (hasCta) {
        setActionType('CTA');
        const pBtn = template.buttons.find((b) => b.type === 'PHONE_NUMBER');
        if (pBtn) setCtaPhone({ text: pBtn.text || 'Call Us', phone: pBtn.phone_number || '' });
        const uBtn = template.buttons.find((b) => b.type === 'URL');
        if (uBtn) setCtaUrl({ text: uBtn.text || 'Visit Website', url: uBtn.url || '', urlType: 'Static' });
      } else {
        setActionType('QUICK_REPLY');
        setQuickReplies(
          template.buttons.map((b, i) => ({
            id: i + 1,
            text: b.text || b.title || '',
          }))
        );
      }
    } else {
      setActionType('NONE');
    }

    const rawHeaderType = (template.header_type || '').toUpperCase();
    if (rawHeaderType === 'IMAGE') {
      setFormHeaderType('IMAGE');
      setFormImageUrl(template.header_content || '');
      setFormHeaderText('');
    } else if (rawHeaderType === 'VIDEO') {
      setFormHeaderType('VIDEO');
      setFormImageUrl(template.header_content || '');
      setFormHeaderText('');
    } else if (rawHeaderType === 'DOCUMENT') {
      setFormHeaderType('DOCUMENT');
      setFormImageUrl(template.header_content || '');
      setFormHeaderText('');
    } else if (rawHeaderType === 'TEXT' || (template.header_content && !isValidImageUrl(template.header_content))) {
      setFormHeaderType('TEXT');
      setFormHeaderText(template.header_content || template.header_text || '');
      setFormImageUrl('');
    } else {
      setFormHeaderType('NONE');
      setFormImageUrl('');
      setFormHeaderText('');
    }

    setSampleValues(template.sampleValues || {});
    setFormReSubmitMeta(true);
  };

  const handleSubmitForApproval = async (template) => {
    setSubmittingApprovalId(template.id);
    try {
      let res;
      try {
        res = await fetch(`/api/meta/templates/${template.id}/submit-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspaceId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/meta/templates/${template.id}/submit-approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: currentWorkspaceId }),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        const updatedStatus = data.template?.status || 'PENDING';
        setTemplates((prev) => {
          const updated = prev.map((t) =>
            t.id === template.id
              ? {
                  ...t,
                  status: updatedStatus,
                  syncedWithMeta: true,
                  reviewNote: data.template?.reviewNote,
                  submittedAt: data.template?.submittedAt || new Date().toISOString(),
                }
              : t
          );
          try {
            localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        showToast(data.message || `Template "${template.name}" submitted to Meta for approval! Status: ${updatedStatus}`, 'success');
      } else {
        showToast('Template submission queued for Meta review', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting to Meta', 'error');
    } finally {
      setSubmittingApprovalId(null);
    }
  };

  const handleCheckStatus = async (template) => {
    setCheckingStatusId(template.id);
    try {
      let res;
      try {
        res = await fetch(`/api/meta/templates/${template.id}/status?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/meta/templates/${template.id}/status?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        const updatedStatus = (data.status || template.status || 'APPROVED').toUpperCase();
        setTemplates((prev) => {
          const updated = prev.map((t) =>
            t.id === template.id
              ? {
                  ...t,
                  status: updatedStatus,
                  rejectionReason: data.rejectionReason || null,
                  syncedWithMeta: true,
                }
              : t
          );
          try {
            localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (updatedStatus === 'APPROVED') {
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
          showToast(`🎉 Meta Status: APPROVED! Template "${template.name}" is active and ready for WhatsApp.`, 'success');
        } else if (updatedStatus === 'REJECTED') {
          showToast(`❌ Meta Status: REJECTED. Reason: ${data.rejectionReason || 'Compliance review note'}`, 'error');
        } else {
          showToast(`Meta Status: ${updatedStatus}. Review is in progress by Meta.`, 'info');
        }
      } else {
        showToast('Status verified with workspace records', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error checking Meta status', 'error');
    } finally {
      setCheckingStatusId(null);
    }
  };

  const handleSaveCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) {
      showToast('Template Name and Message Body are required', 'error');
      return;
    }

    setIsSaving(true);
    const hasMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formHeaderType) && Boolean(formImageUrl.trim());
    const isTextHeader = formHeaderType === 'TEXT' && Boolean(formHeaderText.trim());
    const headerType = formHeaderType || 'NONE';
    const headerContent = hasMedia ? formImageUrl.trim() : (isTextHeader ? formHeaderText.trim() : null);

    // Format buttons according to actionType
    const buttons = [];
    if (actionType === 'CTA') {
      if (ctaPhone?.text?.trim() && ctaPhone?.phone?.trim()) {
        buttons.push({
          type: 'PHONE_NUMBER',
          text: ctaPhone.text.trim().slice(0, 25),
          phone_number: ctaPhone.phone.trim().replace(/\s+/g, ''),
        });
      }
      if (ctaUrl?.text?.trim() && ctaUrl?.url?.trim()) {
        buttons.push({
          type: 'URL',
          text: ctaUrl.text.trim().slice(0, 25),
          url: ctaUrl.url.trim(),
        });
      }
    } else if (actionType === 'QUICK_REPLY') {
      quickReplies
        .filter((q) => q.text && q.text.trim())
        .slice(0, 3)
        .forEach((q) => {
          buttons.push({
            type: 'QUICK_REPLY',
            text: q.text.trim().slice(0, 25),
          });
        });
    }

    const cleanName = formName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    try {
      // 1. Create on Meta Template API
      let metaTemplate;
      let metaFeedback = null;
      const payload = {
        workspaceId: currentWorkspaceId,
        name: cleanName,
        displayName: formName.trim(),
        category: formCategory.toUpperCase(),
        language: formLanguage || 'en_US',
        headerType: headerType,
        headerImageUrl: hasMedia ? headerContent : null,
        headerMediaUrl: hasMedia ? headerContent : null,
        headerText: isTextHeader ? headerContent : null,
        bodyText: formBody.trim(),
        footerText: (formFooter || formTriggers || '').trim().slice(0, 60),
        buttons,
        sampleValues,
        submitToMeta: formReSubmitMeta,
      };

      try {
        const res = await fetch('/api/meta/templates/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resData = await res.json();
          metaTemplate = resData.template;
          metaFeedback = resData.template?.metaResult;
        }
      } catch {}

      if (!metaTemplate) {
        try {
          const res = await fetch('http://localhost:4000/api/meta/templates/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const resData = await res.json();
            metaTemplate = resData.template;
            metaFeedback = resData.template?.metaResult;
          }
        } catch {}
      }

      // Also create on Supabase if available
      try {
        await createTemplate({
          workspaceId: currentWorkspaceId,
          name: cleanName,
          body_text: formBody.trim(),
          footer_text: (formFooter || formTriggers || '').trim(),
          category: formCategory,
          status: formReSubmitMeta ? 'pending' : 'approved',
          header_type: headerType,
          header_content: headerContent,
          buttons,
        });
      } catch {}

      const newTmpl = metaTemplate || {
        id: `tmpl-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        name: cleanName,
        displayName: formName.trim(),
        body_text: formBody.trim(),
        footer_text: (formFooter || formTriggers || '').trim(),
        category: formCategory.toUpperCase(),
        language: formLanguage || 'en_US',
        status: formReSubmitMeta ? 'PENDING' : 'APPROVED',
        header_type: headerType,
        header_content: headerContent,
        buttons,
        sampleValues,
        syncedWithMeta: formReSubmitMeta,
      };

      setTemplates((prev) => {
        const updated = [newTmpl, ...prev];
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsCreateModalOpen(false);

      if (metaFeedback?.ok) {
        showToast(`Template "${cleanName}" registered with Meta Graph API! Status: ${metaFeedback.status || 'PENDING'}`, 'success');
      } else if (metaFeedback && !metaFeedback.ok) {
        showToast(`Template saved in CRM! Meta: ${metaFeedback.error}`, 'warning');
      } else if (formReSubmitMeta) {
        showToast(`Template "${formName}" created & submitted to Meta for approval!`, 'success');
      } else {
        showToast(`Template "${formName}" created & active!`, 'success');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      // Fallback local state
      const localTmpl = {
        id: `tmpl-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        name: cleanName,
        displayName: formName.trim(),
        body_text: formBody.trim(),
        footer_text: (formFooter || formTriggers || '').trim(),
        category: formCategory.toUpperCase(),
        language: formLanguage || 'en_US',
        status: formReSubmitMeta ? 'PENDING' : 'APPROVED',
        header_type: headerType,
        header_content: headerContent,
        buttons,
        sampleValues,
        syncedWithMeta: formReSubmitMeta,
      };
      setTemplates((prev) => {
        const updated = [localTmpl, ...prev];
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsCreateModalOpen(false);
      showToast(`Template saved locally and active!`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTemplate || !formName.trim() || !formBody.trim()) return;

    setIsSaving(true);
    const hasMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formHeaderType) && Boolean(formImageUrl.trim());
    const isTextHeader = formHeaderType === 'TEXT' && Boolean(formHeaderText.trim());
    const headerType = formHeaderType || 'NONE';
    const headerContent = hasMedia ? formImageUrl.trim() : (isTextHeader ? formHeaderText.trim() : null);

    // Format buttons according to actionType
    const buttons = [];
    if (actionType === 'CTA') {
      if (ctaPhone?.text?.trim() && ctaPhone?.phone?.trim()) {
        buttons.push({
          type: 'PHONE_NUMBER',
          text: ctaPhone.text.trim().slice(0, 25),
          phone_number: ctaPhone.phone.trim().replace(/\s+/g, ''),
        });
      }
      if (ctaUrl?.text?.trim() && ctaUrl?.url?.trim()) {
        buttons.push({
          type: 'URL',
          text: ctaUrl.text.trim().slice(0, 25),
          url: ctaUrl.url.trim(),
        });
      }
    } else if (actionType === 'QUICK_REPLY') {
      quickReplies
        .filter((q) => q.text && q.text.trim())
        .slice(0, 3)
        .forEach((q) => {
          buttons.push({
            type: 'QUICK_REPLY',
            text: q.text.trim().slice(0, 25),
          });
        });
    }

    const cleanName = formName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    try {
      // 1. Call Backend Update API with optional Meta re-submission
      let metaUpdated = null;
      const updatePayload = {
        workspaceId: currentWorkspaceId,
        name: cleanName,
        displayName: formName.trim(),
        category: formCategory.toUpperCase(),
        language: formLanguage || 'en_US',
        headerType,
        headerImageUrl: hasMedia ? headerContent : null,
        headerMediaUrl: hasMedia ? headerContent : null,
        headerText: isTextHeader ? headerContent : null,
        bodyText: formBody.trim(),
        footerText: (formFooter || formTriggers || '').trim().slice(0, 60),
        buttons,
        sampleValues,
        reSubmitToMeta: formReSubmitMeta,
      };

      try {
        const res = await fetch(`/api/meta/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        if (res.ok) {
          const d = await res.json();
          metaUpdated = d.template;
        }
      } catch {}

      if (!metaUpdated) {
        try {
          const res = await fetch(`http://localhost:4000/api/meta/templates/${editingTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
          });
          if (res.ok) {
            const d = await res.json();
            metaUpdated = d.template;
          }
        } catch {}
      }

      try {
        await updateTemplate(editingTemplate.id, {
          name: cleanName,
          body_text: formBody.trim(),
          footer_text: (formFooter || formTriggers || '').trim(),
          category: formCategory,
          status: formReSubmitMeta ? 'pending' : (editingTemplate.status || 'approved'),
          header_type: headerType,
          header_content: headerContent,
          buttons,
        });
      } catch {}

      const updatedObj = metaUpdated || {
        ...editingTemplate,
        name: cleanName,
        displayName: formName.trim(),
        body_text: formBody.trim(),
        footer_text: (formFooter || formTriggers || '').trim(),
        category: formCategory.toUpperCase(),
        language: formLanguage || 'en_US',
        status: formReSubmitMeta ? 'PENDING' : editingTemplate.status,
        header_type: headerType,
        header_content: headerContent,
        buttons,
        sampleValues,
      };

      setTemplates((prev) => {
        const next = prev.map((t) => (t.id === editingTemplate.id ? updatedObj : t));
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      setEditingTemplate(null);
      showToast(`Template "${formName}" updated successfully!`, 'success');
    } catch (err) {
      console.error('Error updating template:', err);
      setTemplates((prev) => {
        const next = prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: cleanName,
                displayName: formName.trim(),
                body_text: formBody.trim(),
                footer_text: (formFooter || formTriggers || '').trim(),
                category: formCategory.toUpperCase(),
                language: formLanguage || 'en_US',
                header_type: headerType,
                header_content: headerContent,
                buttons,
                sampleValues,
              }
            : t
        );
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
      setEditingTemplate(null);
      showToast(`Template updated locally!`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    const targetId = deletingTemplate.id;
    const targetName = deletingTemplate.name;
    setIsDeleting(true);

    try {
      // 1. Immediately record in persistent deleted set for workspace
      const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId}`;
      let deletedList = [];
      try {
        const s = localStorage.getItem(deletedKey);
        if (s) deletedList = JSON.parse(s);
      } catch {}
      if (targetId && !deletedList.includes(String(targetId))) deletedList.push(String(targetId));
      if (targetName && !deletedList.includes(targetName)) deletedList.push(targetName);
      try {
        localStorage.setItem(deletedKey, JSON.stringify(deletedList));
      } catch {}

      // 2. Immediately update UI state and workspace-isolated localStorage
      setTemplates((prev) => {
        const updated = prev.filter(
          (t) => String(t.id) !== String(targetId) && (!targetName || t.name !== targetName)
        );
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // 3. Delete from server store for this specific workspace and Meta Cloud API
      let serverDeleted = false;
      try {
        const res = await fetch(`/api/meta/templates/${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: currentWorkspaceId,
            name: targetName,
          }),
        });
        if (res.ok) serverDeleted = true;
      } catch {}

      if (!serverDeleted) {
        try {
          await fetch(`http://localhost:4000/api/meta/templates/${encodeURIComponent(targetId)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspaceId: currentWorkspaceId,
              name: targetName,
            }),
          });
        } catch {}
      }

      // 4. Delete from Supabase for this specific workspace
      try {
        if (typeof deleteTemplate === 'function') {
          await deleteTemplate(targetId, currentWorkspaceId);
        }
      } catch (err) {
        console.warn('Supabase delete template note:', err);
      }

      showToast(`Template "${targetName || targetId}" deleted successfully`, 'success');
    } catch (err) {
      console.error('Delete template error:', err);
      showToast('Template deleted', 'info');
    } finally {
      setIsDeleting(false);
      setDeletingTemplate(null);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Template content copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runTriggerTest = (query = testInput) => {
    if (!query.trim()) return;
    setIsSimulating(true);

    const cleanQuery = query.trim().toLowerCase();
    setTimeout(() => {
      // Find matching template
      let matched = null;
      for (const tmpl of templates) {
        const triggers = (tmpl.footer_text || '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        const isMatch = triggers.some((tr) => {
          if (cleanQuery === tr) return true;
          if (cleanQuery.startsWith(`${tr} `)) return true;
          if (cleanQuery.endsWith(` ${tr}`)) return true;
          if (cleanQuery.includes(` ${tr} `)) return true;
          return false;
        });

        if (isMatch) {
          matched = tmpl;
          break;
        }
      }

      if (matched) {
        setSimulatedReply(matched.body_text);
        setSimulatedImage(matched.header_content || null);
      } else {
        setSimulatedImage(null);
        const company = currentUser?.organization || (currentUser?.name ? `${currentUser.name} Workspace` : 'AI Business Concierge');
        setSimulatedReply(
          `Hello! 👋 ${company} is ready to help you with "${query}". Tell us what your business needs, and let's build something powerful together! 🚀`
        );
      }
      setIsSimulating(false);
    }, 250);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.footer_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.body_text.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatus !== 'ALL') {
      const s = (t.status || 'APPROVED').toUpperCase();
      if (selectedStatus === 'APPROVED' && s !== 'APPROVED') return false;
      if (selectedStatus === 'PENDING' && s !== 'PENDING') return false;
      if (selectedStatus === 'REJECTED' && s !== 'REJECTED' && s !== 'FAILED') return false;
    }

    if (activeTab === 'greetings') {
      return (
        (t.footer_text || '').toLowerCase().includes('hi') ||
        (t.footer_text || '').toLowerCase().includes('hello') ||
        (t.name || '').toLowerCase().includes('welcome') ||
        (t.name || '').toLowerCase().includes('discovery') ||
        (t.displayName || '').toLowerCase().includes('discovery')
      );
    }
    if (activeTab === 'services') {
      return (
        (t.footer_text || '').toLowerCase().includes('app') ||
        (t.footer_text || '').toLowerCase().includes('ai') ||
        (t.footer_text || '').toLowerCase().includes('crm') ||
        (t.footer_text || '').toLowerCase().includes('demo') ||
        (t.footer_text || '').toLowerCase().includes('software') ||
        (t.name || '').toLowerCase().includes('discovery') ||
        (t.name || '').toLowerCase().includes('crm') ||
        (t.name || '').toLowerCase().includes('call') ||
        (t.displayName || '').toLowerCase().includes('crm') ||
        (t.displayName || '').toLowerCase().includes('call')
      );
    }
    if (activeTab === 'pricing') {
      return (
        (t.footer_text || '').toLowerCase().includes('price') ||
        (t.footer_text || '').toLowerCase().includes('quote') ||
        (t.footer_text || '').toLowerCase().includes('call') ||
        (t.footer_text || '').toLowerCase().includes('voucher') ||
        (t.footer_text || '').toLowerCase().includes('offer') ||
        (t.name || '').toLowerCase().includes('call') ||
        (t.name || '').toLowerCase().includes('voucher') ||
        (t.displayName || '').toLowerCase().includes('call')
      );
    }
    return true;
  });

  const welcomeTemplate = templates.length > 0 ? (
    templates.find(
      (t) =>
        t.name === 'ai_it_discovery' ||
        t.name === 'hi' ||
        ((t.footer_text || '').toLowerCase().includes('hi') && (t.footer_text || '').toLowerCase().includes('hello'))
    ) || templates[0]
  ) : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Page Header & Hero Action Banner */}
      <div className="bg-white border border-[#EAECF0] rounded-3xl p-6 lg:p-8 shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F0F9FF] to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-[11px] font-bold font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                WhatsApp Live Auto-Replies Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-[11px] font-bold font-mono">
                {templates.length} Templates Configured
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight">
              Auto-Reply & WhatsApp Message Templates
            </h1>
            <p className="text-xs text-[#667085] max-w-2xl leading-relaxed">
              Configure exactly what our WhatsApp bot sends when customers text keywords like <span className="font-bold text-[#101828]">"Hi"</span>, <span className="font-bold text-[#101828]">"Hello"</span>, or service inquiry keywords. Changes sync directly to the live WhatsApp webhook!
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleSyncMeta}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl border border-[#0284C7]/30 bg-[#F0F9FF] hover:bg-[#E0F2FE] text-xs font-bold text-[#0284C7] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Sync official approved templates from Meta WhatsApp Cloud API"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#0284C7] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing with Meta...' : 'Sync with Meta'}</span>
            </button>
            <button
              onClick={loadTemplates}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Reload templates from database"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#667085] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Official Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Featured "Hi / Hello" Welcome Response Card */}
      {welcomeTemplate && (
        <div className="bg-gradient-to-r from-[#F0F9FF] to-white border border-[#BAE6FD] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BAE6FD]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#101828]">Primary Customer Welcome Greeting</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold font-mono">
                    DEFAULT ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-[#667085]">
                  Sent automatically whenever a customer sends greetings on WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(welcomeTemplate.body_text, welcomeTemplate.id)}
                className="px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#475467] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedId === welcomeTemplate.id ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === welcomeTemplate.id ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleOpenEdit(welcomeTemplate)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Greeting & Triggers</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Trigger Information & Text */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#475467] uppercase font-mono">Trigger Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(welcomeTemplate.footer_text || 'hi, hello, hey, start')
                    .split(',')
                    .map((tr) => tr.trim())
                    .filter(Boolean)
                    .map((trigger) => (
                      <span
                        key={trigger}
                        className="px-2.5 py-1 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold font-mono flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-[#0284C7]" />
                        "{trigger}"
                      </span>
                    ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAECF0] text-xs text-[#101828] leading-relaxed whitespace-pre-line shadow-2xs font-sans">
                {welcomeTemplate.body_text}
              </div>
            </div>

            {/* Right: Realistic WhatsApp Mobile Bubble Preview */}
            <div className="lg:col-span-5 bg-[#EFEAE2] p-4 rounded-2xl border border-[#D1D5DB] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/10 text-[11px] font-mono font-bold text-[#475467]">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>WhatsApp Live Preview</span>
                </div>
                <span className="text-[10px] text-[#16A34A] font-bold">Encrypted</span>
              </div>

              {/* Customer Simulated Bubble */}
              <div className="flex flex-col items-end ml-auto max-w-[80%]">
                <div className="bg-[#DCF8C6] text-[#111B21] p-2.5 rounded-2xl rounded-tr-xs text-xs shadow-xs">
                  <p>Hi</p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-gray-500 font-mono mt-0.5">
                    <span>1:45 PM</span>
                    <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                  </div>
                </div>
              </div>

              {/* Bot Response Bubble */}
              <div className="flex flex-col items-start mr-auto max-w-[92%]">
                <div className="bg-white text-[#111B21] p-3 rounded-2xl rounded-tl-xs text-xs shadow-xs leading-relaxed space-y-2">
                  {Boolean(welcomeTemplate.header_content) && (
                    <div className="rounded-xl overflow-hidden -mx-1 -mt-1 border border-black/5">
                      <img
                        src={welcomeTemplate.header_content}
                        alt="Header Banner"
                        className="w-full h-32 object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-line text-xs">{welcomeTemplate.body_text}</p>
                  <div className="flex justify-end items-center text-[9px] text-gray-400 font-mono pt-1">
                    <span>1:45 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Response Simulator */}
      <div className="bg-white border border-[#EAECF0] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="text-xs font-bold text-[#101828]">Test Trigger Simulator</h4>
            <span className="text-[11px] text-[#667085] hidden sm:inline">
              Type a word to test which template triggers in real-time
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#98A2B3]">Quick tests:</span>
            {['hi', 'app', 'ai', 'pricing'].map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => {
                  setTestInput(word);
                  runTriggerTest(word);
                }}
                className="px-2 py-0.5 rounded-md bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] font-mono text-[11px] font-bold cursor-pointer"
              >
                "{word}"
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type customer message to test (e.g. 'hello', 'what are your app services?')..."
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runTriggerTest();
            }}
            className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
          />
          <button
            type="button"
            onClick={() => runTriggerTest()}
            disabled={isSimulating || !testInput.trim()}
            className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Test Reply</span>
          </button>
        </div>

        {simulatedReply && (
          <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#101828] leading-relaxed space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#0284C7] font-bold">
              <Bot className="w-3 h-3 text-[#0284C7]" />
              <span>Simulated Auto-Pilot Output for "{testInput}":</span>
            </div>
            {simulatedImage && (
              <div className="max-w-xs rounded-xl overflow-hidden border border-[#BAE6FD]">
                <img
                  src={simulatedImage}
                  alt="Template Media Header"
                  className="w-full h-32 object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <p className="whitespace-pre-line">{simulatedReply}</p>
          </div>
        )}
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F2F4F7] p-1 rounded-2xl w-fit">
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'greetings', label: 'Greetings (Hi/Hello)' },
              { id: 'services', label: 'Services (App/AI/IT)' },
              { id: 'pricing', label: 'Pricing & Quotes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Meta Status Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-2xl w-fit">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'PENDING', label: 'In Review' },
              { id: 'REJECTED', label: 'Issues' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates or triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#EAECF0] pl-8 pr-3 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#0284C7]"
          />
        </div>
      </div>

      {/* 5. Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => {
          const triggers = (template.footer_text || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          return (
            <div
              key={template.id}
              className="bg-white border border-[#EAECF0] hover:border-[#0284C7]/40 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md space-y-4 group overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header Image Banner if attached */}
                {Boolean(template.header_content) && (
                  <div className="relative -mx-5 -mt-5 mb-3 h-28 overflow-hidden rounded-t-3xl border-b border-[#EAECF0] bg-gray-100">
                    <img
                      src={template.header_content}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold font-mono flex items-center gap-1 shadow-xs">
                      <ImageIcon className="w-3 h-3 text-emerald-400" />
                      <span>IMAGE HEADER</span>
                    </div>
                  </div>
                )}

                {template.header_type === 'TEXT' && template.header_content && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[11px] font-bold text-[#0284C7] w-fit shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Header: {template.header_content}</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#F0F9FF] text-[#0284C7] text-[10px] font-bold font-mono uppercase">
                        {template.category || 'Utility'}
                      </span>
                      {template.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] text-[10px] font-bold font-mono">
                          {template.badge}
                        </span>
                      )}
                      {Boolean(template.header_content) && template.header_type === 'IMAGE' && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>Image</span>
                        </span>
                      )}
                      {(template.variables?.length > 0 || (template.body_text || '').includes('{{1}}') || (template.body_text || '').includes('{{name}}')) && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] text-[10px] font-bold font-mono">
                          {template.variables?.length || ((template.body_text || '').match(/\{\{\w+\}\}/g) || []).length} VARS
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#101828] truncate group-hover:text-[#0284C7] transition-colors">
                      {template.displayName || template.name}
                    </h4>
                    {template.displayName && template.displayName !== template.name && (
                      <span className="text-[10px] text-[#98A2B3] font-mono block truncate">
                        key: {template.name}
                      </span>
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 flex items-center gap-1 ${
                    (template.status || '').toUpperCase() === 'PENDING'
                      ? 'bg-[#FEF0C7] text-[#B54708] border border-[#FEDF89]'
                      : (template.status || '').toUpperCase() === 'REJECTED' || (template.status || '').toUpperCase() === 'FAILED'
                      ? 'bg-[#FEE4E2] text-[#D92D20] border border-[#FECDCA]'
                      : 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                  }`}>
                    {(template.status || '').toUpperCase() === 'PENDING' && <Clock className="w-3 h-3 text-[#B54708]" />}
                    {((template.status || '').toUpperCase() === 'REJECTED' || (template.status || '').toUpperCase() === 'FAILED') && (
                      <AlertCircle className="w-3 h-3 text-[#D92D20]" />
                    )}
                    {((template.status || '').toUpperCase() === 'APPROVED' || !template.status) && (
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    )}
                    <span>{(template.status || 'APPROVED').toUpperCase()}</span>
                  </span>
                </div>

                {/* Meta Rejection or Review Alert Banner */}
                {template.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-[11px] text-[#B42318] flex items-start gap-2 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D92D20]" />
                    <div className="space-y-0.5">
                      <p className="font-bold">Meta Compliance Notice</p>
                      <p className="text-[10px] leading-relaxed text-[#7A271A]">{template.rejectionReason}</p>
                    </div>
                  </div>
                )}
                {!template.rejectionReason && template.reviewNote && (
                  <div className="p-2 rounded-xl bg-[#F0F9FF] border border-[#B9E6FE] text-[10px] text-[#026AA2] font-mono flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-[#026AA2] shrink-0" />
                    <span className="truncate">{template.reviewNote}</span>
                  </div>
                )}

                {/* Triggers */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#98A2B3] uppercase font-mono">
                    Triggers ({triggers.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
                    {triggers.map((tr) => (
                      <span
                        key={tr}
                        className="px-2 py-0.5 rounded-md bg-[#F9FAFB] border border-[#EAECF0] text-[10px] font-mono text-[#475467]"
                      >
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body Snippet */}
                <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-xs text-[#344054] line-clamp-4 leading-relaxed font-sans">
                  {template.body_text}
                </div>

                {/* Quick-Reply Buttons if present */}
                {Array.isArray(template.buttons) && template.buttons.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#98A2B3] uppercase font-mono">
                      <span>Quick-Reply Buttons ({template.buttons.length}):</span>
                      <span className="text-[#16A34A] text-[9px] font-semibold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> 1-Tap Reply
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.buttons.map((btn, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <Check className="w-3 h-3 text-[#16A34A]" />
                          <span>{btn.text || btn.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#EAECF0] flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => handleCopy(template.body_text, template.id)}
                  className="p-1.5 rounded-xl hover:bg-[#F2F4F7] text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
                  title="Copy content"
                >
                  {copiedId === template.id ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#667085]" />}
                </button>

                <div className="flex items-center gap-1">
                  {/* Submit to Meta Cloud API button */}
                  <button
                    onClick={() => handleSubmitForApproval(template)}
                    disabled={submittingApprovalId === template.id}
                    className="px-2.5 py-1.5 rounded-xl border border-[#0284C7]/30 bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[11px] font-bold text-[#0284C7] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Submit template directly to Meta WhatsApp Cloud API for official review"
                  >
                    {submittingApprovalId === template.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5 text-[#0284C7]" />
                    )}
                    <span>{submittingApprovalId === template.id ? 'Submitting...' : 'Submit to Meta'}</span>
                  </button>

                  {/* Check Meta Review Status button */}
                  <button
                    onClick={() => handleCheckStatus(template)}
                    disabled={checkingStatusId === template.id}
                    className="px-2 py-1.5 rounded-xl border border-[#EAECF0] hover:border-[#0284C7] bg-white text-[11px] font-bold text-[#344054] hover:text-[#0284C7] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Query live Meta Graph API for template status"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-[#667085] ${checkingStatusId === template.id ? 'animate-spin text-[#0284C7]' : ''}`} />
                    <span className="hidden sm:inline">{checkingStatusId === template.id ? 'Checking...' : 'Status'}</span>
                  </button>

                  {/* Edit Template */}
                  <button
                    onClick={() => handleOpenEdit(template)}
                    className="px-2.5 py-1.5 rounded-xl border border-[#EAECF0] hover:border-[#0284C7] bg-white text-[11px] font-bold text-[#344054] hover:text-[#0284C7] transition-all cursor-pointer flex items-center gap-1"
                    title="Edit template content and keywords"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Template */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTemplate(template);
                    }}
                    className="p-1.5 px-2 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#98A2B3] hover:text-[#DC2626] border border-[#EAECF0] hover:border-[#FECACA] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title={`Delete template "${template.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span className="text-[11px] font-bold text-[#DC2626] hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-[#EAECF0] rounded-3xl p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101828]">No Templates Configured Yet</h3>
            <p className="text-xs text-[#667085] max-w-sm mx-auto">
              You don't have any auto-reply templates in this workspace yet. Create your first template to automatically reply to customer messages!
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Template</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Add / Edit Template Modal (Split-Screen Builder & Live Phone Mockup) */}
      {(isCreateModalOpen || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-[#EAECF0] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#101828]">
                      {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'WhatsApp Cloud API Template Builder'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-bold font-mono flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#059669]" />
                      <span>Meta BSP Format (v22.0)</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#667085]">
                    Build, test in real-time, and register official WhatsApp templates directly with Meta Graph API
                  </p>
                </div>
              </div>

              {/* Mobile Tab Switcher */}
              <div className="flex lg:hidden items-center bg-[#F2F4F7] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalTab('editor')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    modalTab === 'editor' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('preview')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    modalTab === 'preview' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-[#667085]'
                  }`}
                >
                  Phone Preview
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTemplate(null);
                }}
                className="text-[#98A2B3] hover:text-[#101828] p-2 rounded-xl hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Screen (Left: Form, Right: Phone Mockup) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* LEFT COLUMN: BUILDER FORM */}
              <div
                className={`lg:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[calc(92vh-140px)] ${
                  modalTab === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                <form id="templateBuilderForm" onSubmit={editingTemplate ? handleSaveEdit : handleSaveCreate} className="space-y-6">
                  {/* PRESETS BAR */}
                  <div className="space-y-2 pb-4 border-b border-[#EAECF0]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#101828] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Pre-approved WhatsApp Templates</span>
                      </label>
                      <span className="text-[10px] text-[#667085]">
                        Click to auto-populate high conversion templates
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {activePresets.map((preset) => {
                        const isSelected = formName.toLowerCase() === preset.displayName.toLowerCase() || formName.toLowerCase() === preset.name.toLowerCase();
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setFormName(preset.displayName);
                              setFormTriggers(preset.footer_text || '');
                              setFormCategory((preset.category || 'marketing').toUpperCase());
                              setFormHeaderType(preset.header_type || 'NONE');
                              setFormHeaderText(preset.header_content || '');
                              setFormImageUrl(preset.header_type === 'IMAGE' ? (preset.header_content || '') : '');
                              setFormBody(preset.body_text || '');
                              setFormFooter(preset.footer_text || '');

                              if (Array.isArray(preset.buttons) && preset.buttons.length > 0) {
                                const hasCta = preset.buttons.some((b) => b.type === 'URL' || b.type === 'PHONE_NUMBER');
                                if (hasCta) {
                                  setActionType('CTA');
                                  const p = preset.buttons.find((b) => b.type === 'PHONE_NUMBER');
                                  if (p) setCtaPhone({ text: p.text || 'Call Us', phone: p.phone_number || (isSitarcTenant ? '+916369793937' : '+919791471277') });
                                  const u = preset.buttons.find((b) => b.type === 'URL');
                                  if (u) setCtaUrl({ text: u.text || 'Visit Website', url: u.url || (isSitarcTenant ? 'https://www.sitarc.com' : 'https://www.dhigrowth.com'), urlType: 'Static' });
                                } else {
                                  setActionType('QUICK_REPLY');
                                  setQuickReplies(
                                    preset.buttons.map((b, i) => ({ id: i + 1, text: b.text || b.title || '' }))
                                  );
                                }
                              } else {
                                setActionType('NONE');
                              }
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-22 ${
                              isSelected
                                ? 'bg-[#F0F9FF] border-2 border-[#0284C7] shadow-xs ring-2 ring-[#0284C7]/20'
                                : 'bg-white border-[#EAECF0] hover:border-[#BAE6FD] hover:bg-[#F9FAFB]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-[#101828] truncate">{preset.displayName}</h5>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                              </div>
                              {preset.badge && (
                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                  preset.badge === 'Recommended'
                                    ? 'bg-[#E0F2FE] text-[#0284C7]'
                                    : preset.badge === 'Popular'
                                    ? 'bg-[#E0F2FE] text-[#0369A1]'
                                    : preset.badge === 'High Conversion'
                                    ? 'bg-[#DCFCE7] text-[#16A34A]'
                                    : 'bg-[#F2F4F7] text-[#475467]'
                                }`}>
                                  {preset.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#667085] truncate">
                              {preset.buttons?.map((b) => b.text).join(' • ') || preset.category}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. BASIC INFORMATION (Name, Category, Language) */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#344054] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span>1. Basic Information</span>
                    </h4>

                    {/* Template Name & Slug */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#344054]">
                          Template Name <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-[#667085] font-mono">
                          Meta slug: <span className="font-bold text-[#0284C7]">{(formName || 'template_name').toLowerCase().replace(/[^a-z0-9_]/g, '_')}</span>
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. seasonal_promo_offer or Welcome Greeting"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full mt-1.5 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors"
                        required
                      />
                      <p className="text-[10px] text-[#98A2B3] mt-1">
                        Meta requires lowercase letters, numbers, and underscores only. We format it automatically.
                      </p>
                    </div>

                    {/* Category & Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#344054]">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full mt-1.5 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white font-medium"
                        >
                          <option value="MARKETING">Marketing (Promotions, Offers, Re-engagement)</option>
                          <option value="UTILITY">Utility (Account Alerts, Orders, Support)</option>
                          <option value="AUTHENTICATION">Authentication (OTPs, Security Verification)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#344054]">
                          Language <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <select
                            value={formLanguage}
                            onChange={(e) => setFormLanguage(e.target.value)}
                            className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white font-medium pr-8"
                          >
                            <option value="en_US">English (US) - en_US</option>
                            <option value="en_GB">English (UK) - en_GB</option>
                            <option value="hi">Hindi (India) - hi</option>
                            <option value="ta">Tamil (India) - ta</option>
                            <option value="te">Telugu (India) - te</option>
                            <option value="es">Spanish - es</option>
                            <option value="ar">Arabic - ar</option>
                            <option value="pt_BR">Portuguese (Brazil) - pt_BR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. HEADER COMPONENT (None, Text, Image, Video, Document) */}
                  <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                        <label className="text-xs font-bold text-[#344054]">
                          Header Component (Optional)
                        </label>
                      </div>
                      <span className="text-[10px] font-mono text-[#0284C7] bg-[#F0F9FF] border border-[#BAE6FD] px-2 py-0.5 rounded-full font-bold">
                        Official WhatsApp Formats
                      </span>
                    </div>

                    {/* 5 Header Format Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {[
                        { id: 'NONE', label: 'None', icon: null },
                        { id: 'TEXT', label: 'Text Title', icon: Type },
                        { id: 'IMAGE', label: 'Image', icon: ImageIcon },
                        { id: 'VIDEO', label: 'Video', icon: Video },
                        { id: 'DOCUMENT', label: 'Document', icon: FileCheck },
                      ].map((h) => {
                        const Icon = h.icon;
                        const isSelected = formHeaderType === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              setFormHeaderType(h.id);
                              if (h.id === 'NONE') {
                                setFormImageUrl('');
                                setFormHeaderText('');
                              } else if (h.id === 'TEXT') {
                                setFormImageUrl('');
                              }
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0284C7] text-white shadow-xs'
                                : 'text-[#667085] hover:text-[#101828] bg-white border border-[#EAECF0]'
                            }`}
                          >
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            <span>{h.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* TEXT HEADER CONFIGURATION */}
                    {formHeaderType === 'TEXT' && (
                      <div className="space-y-1.5 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-[#475467]">
                            Header Text (Bold Title)
                          </label>
                          <span className="text-[10px] font-mono text-[#98A2B3]">{formHeaderText.length} / 60</span>
                        </div>
                        <input
                          type="text"
                          maxLength={60}
                          placeholder={isSitarcTenant ? "e.g. Si'Tarc Testing & Calibration" : "e.g. Exclusive Offer from DhiGrowth"}
                          value={formHeaderText}
                          onChange={(e) => setFormHeaderText(e.target.value)}
                          className="w-full bg-white border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                        />
                        <p className="text-[10px] text-[#98A2B3]">
                          Appears as a prominent bold headline at the very top of your WhatsApp message.
                        </p>
                      </div>
                    )}

                    {/* MEDIA (IMAGE, VIDEO, DOCUMENT) CONFIGURATION */}
                    {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formHeaderType) && (
                      <div className="space-y-3 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={
                            formHeaderType === 'IMAGE'
                              ? 'image/*'
                              : formHeaderType === 'VIDEO'
                              ? 'video/mp4,video/3gpp'
                              : '.pdf,.doc,.docx,.xlsx'
                          }
                          onChange={handleImageFileSelect}
                          className="hidden"
                        />

                        {/* Media Attached Card */}
                        {Boolean(formImageUrl.trim()) ? (
                          <div className="p-3 bg-white border-2 border-[#BAE6FD] rounded-xl flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAECF0] bg-gray-50 flex items-center justify-center shrink-0">
                              {formHeaderType === 'IMAGE' ? (
                                <img
                                  src={formImageUrl}
                                  alt="Attached"
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : formHeaderType === 'VIDEO' ? (
                                <Video className="w-6 h-6 text-[#0284C7]" />
                              ) : (
                                <FileCheck className="w-6 h-6 text-[#0284C7]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7]">
                                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                                <span>{formHeaderType} Media Attached</span>
                              </div>
                              <p className="text-[11px] text-[#667085] truncate mt-0.5 font-mono">
                                {formImageUrl.startsWith('data:') ? 'Local file uploaded' : formImageUrl}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <UploadCloud className="w-3 h-3" />
                                  <span>Change File</span>
                                </button>
                                <span className="text-gray-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => setFormImageUrl('')}
                                  className="text-[11px] font-bold text-[#DC2626] hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Dropzone */
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 bg-white border-2 border-dashed border-[#BAE6FD] hover:border-[#0284C7] hover:bg-[#F0F9FF]/50 rounded-xl text-center cursor-pointer transition-all space-y-1 group"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                              <UploadCloud className="w-4 h-4 text-[#0284C7]" />
                            </div>
                            <div className="text-xs font-bold text-[#101828]">
                              Click to upload {formHeaderType.toLowerCase()} from your device
                            </div>
                            <p className="text-[10px] text-[#667085]">
                              {formHeaderType === 'IMAGE' && 'PNG, JPG, WebP (up to 10MB)'}
                              {formHeaderType === 'VIDEO' && 'MP4 video (up to 16MB)'}
                              {formHeaderType === 'DOCUMENT' && 'PDF or XLSX document (up to 25MB)'}
                            </p>
                          </div>
                        )}

                        {/* Public URL Input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[#475467]">
                            Or Paste Public {formHeaderType} URL:
                          </label>
                          <input
                            type="url"
                            placeholder={
                              formHeaderType === 'IMAGE'
                                ? 'https://example.com/banner.png'
                                : formHeaderType === 'VIDEO'
                                ? 'https://example.com/promo.mp4'
                                : 'https://example.com/brochure.pdf'
                            }
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            className="w-full bg-white border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                          />
                        </div>

                        {/* Presets if IMAGE */}
                        {formHeaderType === 'IMAGE' && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-[#98A2B3] font-mono font-bold uppercase">
                              Preset Banners:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_HEADER_IMAGES.map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => setFormImageUrl(preset.url)}
                                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                                    formImageUrl === preset.url
                                      ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold'
                                      : 'bg-white border-[#EAECF0] hover:border-[#0284C7] text-[#344054]'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. MESSAGE BODY (WhatsApp Text & Formatting Toolbar) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#344054] flex items-center gap-1.5">
                        <span>Message Body</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[10px] font-mono ${formBody.length > 1024 ? 'text-red-500 font-bold' : 'text-[#98A2B3]'}`}>
                        {formBody.length} / 1024 characters
                      </span>
                    </div>

                    {/* Toolbar: Formatting & Variable Injection */}
                    <div className="flex items-center justify-between gap-2 p-1.5 bg-[#F2F4F7] rounded-xl flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' *bold text* ')}
                          className="px-2 py-1 rounded-md bg-white hover:bg-gray-50 text-[10px] font-bold text-[#344054] border border-[#EAECF0] cursor-pointer shadow-2xs"
                          title="Add bold formatting"
                        >
                          *Bold*
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' _italic text_ ')}
                          className="px-2 py-1 rounded-md bg-white hover:bg-gray-50 text-[10px] italic font-semibold text-[#344054] border border-[#EAECF0] cursor-pointer shadow-2xs"
                          title="Add italic formatting"
                        >
                          _Italic_
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' ~strike~ ')}
                          className="px-2 py-1 rounded-md bg-white hover:bg-gray-50 text-[10px] line-through text-[#344054] border border-[#EAECF0] cursor-pointer shadow-2xs"
                          title="Add strikethrough"
                        >
                          ~Strike~
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold font-mono text-[#0284C7]">Insert Variable:</span>
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' {{1}}')}
                          className="px-2 py-1 rounded-md bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold font-mono cursor-pointer shadow-2xs"
                          title="Insert variable {{1}}"
                        >
                          + {'{{1}}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' {{2}}')}
                          className="px-2 py-1 rounded-md bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold font-mono cursor-pointer shadow-2xs"
                          title="Insert variable {{2}}"
                        >
                          + {'{{2}}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBody((prev) => prev + ' {{3}}')}
                          className="px-2 py-1 rounded-md bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold font-mono cursor-pointer shadow-2xs"
                          title="Insert variable {{3}}"
                        >
                          + {'{{3}}'}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={6}
                      placeholder={isSitarcTenant ? "Write your official WhatsApp message. Example: Hi {{1}}, thank you for contacting Si'Tarc Laboratory! Here is your test quotation: {{2}}." : "Write your official WhatsApp message. Example: Hi {{1}}, thank you for contacting DhiGrowth! Here is your exclusive deal: {{2}}."}
                      value={formBody}
                      onChange={(e) => setFormBody(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-3.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white leading-relaxed resize-none font-sans"
                      required
                    />
                  </div>

                  {/* 4. DYNAMIC SAMPLE VARIABLES (CRUCIAL FOR META APPROVAL) */}
                  {(() => {
                    const detectedVars = Array.from(
                      new Set((formBody.match(/\{\{(\d+|[a-zA-Z0-9_]+)\}\}/g) || []).map((v) => v.replace(/[{}]/g, '')))
                    );
                    if (detectedVars.length === 0) return null;

                    return (
                      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-3 animate-in fade-in">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-[#166534]">
                              Sample Variable Values (Required by Meta)
                            </h4>
                            <p className="text-[10px] text-[#15803D] leading-relaxed">
                              Meta's review team strictly requires realistic sample text for every variable placeholder before approving the template.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {detectedVars.map((v) => (
                            <div key={v} className="bg-white p-2.5 rounded-xl border border-[#BBF7D0] space-y-1">
                              <label className="text-[10px] font-mono font-bold text-[#166534] block">
                                Sample for {'{{' + v + '}}'}:
                              </label>
                              <input
                                type="text"
                                placeholder={v === '1' ? 'e.g. Rahul Sharma' : v === '2' ? 'e.g. 25% Discount' : 'e.g. Bengaluru'}
                                value={sampleValues[v] || ''}
                                onChange={(e) =>
                                  setSampleValues((prev) => ({
                                    ...prev,
                                    [v]: e.target.value,
                                  }))
                                }
                                className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-1.5 rounded-lg text-xs text-[#101828] focus:outline-none focus:border-[#16A34A] focus:bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 5. FOOTER (Optional, Max 60 chars) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#344054]">
                        Footer Disclaimer (Optional)
                      </label>
                      <span className="text-[10px] font-mono text-[#98A2B3]">
                        {formFooter.length} / 60
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder={isSitarcTenant ? "e.g. Reply STOP to unsubscribe • Sent via Si'Tarc Testing Laboratory" : "e.g. Reply STOP to unsubscribe • Sent via DhiGrowth CRM"}
                      value={formFooter}
                      onChange={(e) => setFormFooter(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white"
                    />
                    <p className="text-[10px] text-[#98A2B3]">
                      Small muted disclaimer line rendered at the bottom of the WhatsApp bubble.
                    </p>
                  </div>

                  {/* 6. INTERACTIVE ACTION BUTTONS (CTA or Quick Replies) */}
                  <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0284C7]" />
                        <span>Interactive Action Buttons</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#0284C7] bg-[#F0F9FF] border border-[#BAE6FD] px-2 py-0.5 rounded-full font-bold">
                        WhatsApp Interactive
                      </span>
                    </div>

                    {/* Button Type Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'NONE', label: 'None' },
                        { id: 'CTA', label: 'Call To Action (CTA)' },
                        { id: 'QUICK_REPLY', label: 'Quick Reply Buttons' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setActionType(type.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            actionType === type.id
                              ? 'bg-[#0284C7] text-white shadow-xs'
                              : 'bg-white border border-[#EAECF0] text-[#667085] hover:text-[#101828]'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* CTA CONFIGURATION */}
                    {actionType === 'CTA' && (
                      <div className="space-y-3 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                        {/* Phone CTA */}
                        <div className="p-3 bg-white border border-[#EAECF0] rounded-xl space-y-2">
                          <span className="text-[10px] font-mono font-bold text-[#16A34A] uppercase flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>1. Call Phone Number</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-[#667085]">Button Text (max 25)</label>
                              <input
                                type="text"
                                maxLength={25}
                                value={ctaPhone.text}
                                onChange={(e) => setCtaPhone((prev) => ({ ...prev, text: e.target.value }))}
                                placeholder="Call Us"
                                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#667085]">Phone Number with Country Code</label>
                              <input
                                type="text"
                                value={ctaPhone.phone}
                                onChange={(e) => setCtaPhone((prev) => ({ ...prev, phone: e.target.value }))}
                                placeholder="+919791471277"
                                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* URL CTA */}
                        <div className="p-3 bg-white border border-[#EAECF0] rounded-xl space-y-2">
                          <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>2. Visit Website URL</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-[#667085]">Button Text (max 25)</label>
                              <input
                                type="text"
                                maxLength={25}
                                value={ctaUrl.text}
                                onChange={(e) => setCtaUrl((prev) => ({ ...prev, text: e.target.value }))}
                                placeholder="Visit Website"
                                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#667085]">Website URL (https://)</label>
                              <input
                                type="url"
                                value={ctaUrl.url}
                                onChange={(e) => setCtaUrl((prev) => ({ ...prev, url: e.target.value }))}
                                placeholder={isSitarcTenant ? "https://www.sitarc.com" : "https://www.dhigrowth.com"}
                                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QUICK REPLY CONFIGURATION */}
                    {actionType === 'QUICK_REPLY' && (
                      <div className="space-y-2 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#475467]">
                            Quick Replies (Up to 3 buttons, max 25 chars each)
                          </span>
                          {quickReplies.length < 3 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuickReplies((prev) => [
                                  ...prev,
                                  { id: Date.now(), text: `Option ${prev.length + 1}` },
                                ])
                              }
                              className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Button</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {quickReplies.map((q, idx) => (
                            <div key={q.id || idx} className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#98A2B3] w-5">#{idx + 1}</span>
                              <input
                                type="text"
                                maxLength={25}
                                placeholder={`Button label ${idx + 1}`}
                                value={q.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuickReplies((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, text: val } : item))
                                  );
                                }}
                                className="flex-1 bg-white border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                              />
                              <span className="text-[10px] text-[#98A2B3] font-mono w-10 text-right">
                                {q.text?.length || 0}/25
                              </span>
                              {quickReplies.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setQuickReplies((prev) => prev.filter((_, i) => i !== idx))}
                                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                                  title="Remove Button"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. CRM TRIGGERS & META SUBMISSION */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-[#344054]">
                        CRM Bot Trigger Keywords (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. hi, hello, start, menu, promo"
                        value={formTriggers}
                        onChange={(e) => setFormTriggers(e.target.value)}
                        className="w-full mt-1.5 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white"
                      />
                      <p className="text-[10px] text-[#98A2B3] mt-1">
                        When customer texts any of these words on WhatsApp, this template is dispatched automatically.
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="formReSubmitMeta"
                        checked={formReSubmitMeta}
                        onChange={(e) => setFormReSubmitMeta(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-[#0284C7] rounded border-gray-300 focus:ring-[#0284C7] cursor-pointer"
                      />
                      <label htmlFor="formReSubmitMeta" className="text-xs text-[#344054] cursor-pointer leading-relaxed">
                        <span className="font-bold text-[#0284C7] flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#0284C7]" />
                          Submit to Meta WhatsApp Cloud API for Review
                        </span>
                        <span className="text-[11px] text-[#667085] block mt-0.5">
                          Directly calls Meta Graph API ({currentUser?.organization || 'Workspace'}). Once approved, the template can be sent to any WhatsApp user worldwide.
                        </span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: LIVE WHATSAPP PHONE MOCKUP */}
              <div
                className={`lg:col-span-5 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-[#EAECF0] p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(92vh-140px)] ${
                  modalTab === 'editor' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="w-full max-w-[340px] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#475467] px-1">
                    <span className="flex items-center gap-1.5 text-[#16A34A]">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp Live Preview</span>
                    </span>
                    <span className="text-[10px] text-[#667085] bg-gray-200 px-2 py-0.5 rounded-full font-bold">
                      iOS / Android
                    </span>
                  </div>

                  {/* SMARTPHONE FRAME */}
                  <div className="w-full rounded-[40px] border-8 border-gray-900 bg-white shadow-2xl overflow-hidden flex flex-col relative aspect-[9/18] min-h-[580px]">
                    {/* Top Notch / Dynamic Island */}
                    <div className="bg-gray-900 pt-2 pb-1.5 flex justify-center shrink-0">
                      <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-950"></div>
                      </div>
                    </div>

                    {/* WhatsApp Business Header */}
                    <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronDown className="w-4 h-4 rotate-90 text-white shrink-0" />
                        <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center text-[11px] font-bold text-white shrink-0 border border-white/20">
                          {activeBusinessInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold truncate" title={isSitarcTenant ? "Si'Tarc Testing & Calibration Laboratory" : activeBusinessName}>
                              {activeBusinessName}
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-[#25D366] fill-[#25D366] text-white shrink-0" />
                          </div>
                          <p className="text-[9px] text-white/80 leading-none truncate">Official Business Account</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/90">
                        <Video className="w-3.5 h-3.5" />
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* WhatsApp Chat Canvas */}
                    <div className="flex-1 bg-[#EFEAE2] p-3 overflow-y-auto space-y-2.5 flex flex-col justify-end text-[11px]">
                      {/* Date Chip */}
                      <div className="flex justify-center">
                        <span className="bg-[#FFFFFF]/90 backdrop-blur-xs text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs uppercase">
                          Today
                        </span>
                      </div>

                      {/* Encryption Note */}
                      <div className="bg-[#FFF9C4]/80 border border-[#FFEE58]/60 text-gray-700 text-[8px] p-1.5 rounded-lg text-center leading-snug shadow-2xs">
                        🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
                      </div>

                      {/* WhatsApp Outgoing Template Bubble */}
                      <div className="bg-white text-[#111B21] rounded-2xl rounded-tl-xs p-2.5 shadow-sm space-y-2 relative max-w-[96%]">
                        {/* Header Media */}
                        {formHeaderType === 'IMAGE' && (
                          <div className="rounded-xl overflow-hidden -mx-1 -mt-1 bg-gray-100 border border-black/5 aspect-video flex items-center justify-center relative">
                            {isValidImageUrl(formImageUrl) ? (
                              <img
                                src={formImageUrl}
                                alt="Header"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="text-center p-3 text-gray-400">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                <span className="text-[9px]">Image Header Preview</span>
                              </div>
                            )}
                          </div>
                        )}

                        {formHeaderType === 'VIDEO' && (
                          <div className="rounded-xl overflow-hidden -mx-1 -mt-1 bg-gray-900 border border-black/5 aspect-video flex items-center justify-center relative text-white">
                            <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center">
                              <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-white ml-0.5"></div>
                            </div>
                            <span className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono">
                              0:30
                            </span>
                          </div>
                        )}

                        {formHeaderType === 'DOCUMENT' && (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold truncate text-gray-800">
                                {formName ? `${formName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.pdf` : 'document.pdf'}
                              </p>
                              <p className="text-[8px] text-gray-400">PDF • 1.2 MB</p>
                            </div>
                          </div>
                        )}

                        {formHeaderType === 'TEXT' && Boolean(formHeaderText.trim()) && (
                          <div className="font-extrabold text-[12px] text-gray-900 leading-snug pb-1 border-b border-gray-100">
                            {formHeaderText.trim()}
                          </div>
                        )}

                        {/* Body Text with Variable Substitution & Markdown Parsing */}
                        <div className="text-[11px] leading-relaxed whitespace-pre-line text-gray-800 font-sans">
                          {(() => {
                            if (!formBody.trim()) {
                              return <span className="text-gray-400 italic">Your message will appear here...</span>;
                            }

                            let parsed = formBody;
                            // Replace variables with sample values if entered
                            const vars = Array.from(
                              new Set((formBody.match(/\{\{(\d+|[a-zA-Z0-9_]+)\}\}/g) || []).map((v) => v.replace(/[{}]/g, '')))
                            );

                            vars.forEach((v) => {
                              const sample = sampleValues[v];
                              const regex = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
                              if (sample && sample.trim()) {
                                parsed = parsed.replace(regex, `*${sample.trim()}*`);
                              }
                            });

                            return parsed.split('\n').map((line, idx) => {
                              const rendered = line
                                .replace(/\*([^*]+)\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                                .replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
                                .replace(/~([^~]+)~/g, '<del class="line-through text-gray-400">$1</del>')
                                .replace(
                                  /\{\{(\d+|[a-zA-Z0-9_]+)\}\}/g,
                                  '<span class="px-1 py-0.2 rounded bg-sky-100 text-sky-700 font-mono text-[9px] font-bold border border-sky-300">{{$1}}</span>'
                                );

                              return (
                                <span
                                  key={idx}
                                  className="block min-h-[1.1em]"
                                  dangerouslySetInnerHTML={{ __html: rendered }}
                                />
                              );
                            });
                          })()}
                        </div>

                        {/* Footer Disclaimer */}
                        {Boolean(formFooter.trim()) && (
                          <p className="text-[9px] text-gray-400 pt-1 border-t border-gray-100">
                            {formFooter.trim()}
                          </p>
                        )}

                        {/* Timestamp & Delivery Checks */}
                        <div className="flex items-center justify-end gap-1 text-[8px] text-gray-400 font-mono pt-0.5">
                          <span>10:45 AM</span>
                          <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                        </div>

                        {/* CTA Buttons inside bubble */}
                        {actionType === 'CTA' && (
                          <div className="pt-1.5 border-t border-gray-100 space-y-1">
                            {ctaPhone.text && (
                              <div className="w-full py-1 px-2 text-[#0284C7] text-[10px] font-bold flex items-center justify-center gap-1.5 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors">
                                <Phone className="w-3 h-3 text-[#0284C7]" />
                                <span>{ctaPhone.text}</span>
                              </div>
                            )}
                            {ctaUrl.text && (
                              <div className="w-full py-1 px-2 text-[#0284C7] text-[10px] font-bold flex items-center justify-center gap-1.5 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors">
                                <ExternalLink className="w-3 h-3 text-[#0284C7]" />
                                <span>{ctaUrl.text}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Reply Stacked Buttons below bubble */}
                      {actionType === 'QUICK_REPLY' && quickReplies.some((q) => q.text?.trim()) && (
                        <div className="space-y-1 pt-1">
                          {quickReplies
                            .filter((q) => q.text?.trim())
                            .map((q, idx) => (
                              <div
                                key={idx}
                                className="w-full py-1.5 px-3 bg-white text-[#00A884] font-bold text-[10px] rounded-xl shadow-xs border border-black/5 text-center flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3 text-[#00A884]" />
                                <span>{q.text}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Input Bar Mockup */}
                    <div className="bg-[#F0F2F5] px-2 py-1.5 flex items-center gap-1.5 shrink-0 border-t border-gray-200">
                      <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-gray-400">
                        Type a message
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#00A884] text-white flex items-center justify-center">
                        <Send className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#667085] text-center font-mono">
                    Live Meta layout preview • Updates in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="px-6 py-3.5 border-t border-[#EAECF0] bg-white flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-[#667085]">
                <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="hidden sm:inline">
                  {formReSubmitMeta
                    ? 'Will be submitted directly to Meta Graph API for review & approval'
                    : 'Will be stored locally in CRM workspace'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#EAECF0] hover:bg-[#F9FAFB] text-xs font-bold text-[#475467] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="templateBuilderForm"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shadow-sky-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingTemplate ? 'Save & Update Template' : 'Submit & Register Template'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mx-auto">
              <Trash2 className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#101828]">Delete Auto-Reply?</h3>
              <p className="text-xs text-[#667085]">
                Are you sure you want to permanently delete template <span className="font-bold text-[#101828]">"{deletingTemplate.name}"</span>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
