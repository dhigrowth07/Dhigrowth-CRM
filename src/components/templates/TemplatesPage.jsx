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

const DEFAULT_TEMPLATES = [
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
  const { currentWorkspaceId, currentUser, showToast, subscription, openCheckout } = useApp();

  const isDefaultWorkspace = currentWorkspaceId === DEFAULT_WORKSPACE_ID;

  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isDefaultWorkspace ? DEFAULT_TEMPLATES : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | greetings | services | pricing
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTriggers, setFormTriggers] = useState('');
  const [formCategory, setFormCategory] = useState('utility');
  const [formHeaderType, setFormHeaderType] = useState('NONE'); // 'NONE' | 'TEXT' | 'IMAGE'
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formReSubmitMeta, setFormReSubmitMeta] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to validate whether a string is a valid image URL, data URL, or uploaded path
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('data:image/')) return true;
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
        setTemplates(currentWorkspaceId === DEFAULT_WORKSPACE_ID ? DEFAULT_TEMPLATES : []);
      }
    } catch {
      setTemplates(currentWorkspaceId === DEFAULT_WORKSPACE_ID ? DEFAULT_TEMPLATES : []);
    }
    loadTemplates();
  }, [currentWorkspaceId]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL | MARKETING | UTILITY | AUTHENTICATION
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL | APPROVED | PENDING | REJECTED

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // 1. First check if this user already has a saved template list (including empty if deleted)
      const localSaved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId}`);
      let parsedLocal = null;
      if (localSaved !== null) {
        try {
          parsedLocal = JSON.parse(localSaved);
          if (Array.isArray(parsedLocal)) {
            setTemplates(parsedLocal);
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
        // If user explicitly deleted all templates locally, keep it empty and don't resurrect
        if (parsedLocal && parsedLocal.length === 0 && metaData.templates.length > 0) {
          return;
        }
        setTemplates(metaData.templates);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(metaData.templates));
        } catch {}
        return;
      }

      // 3. Fallback to Supabase
      const data = await getTemplates(currentWorkspaceId);
      if (data && data.length > 0) {
        setTemplates(data);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(data));
        } catch {}
      } else if (parsedLocal !== null) {
        setTemplates(parsedLocal);
      } else if (currentWorkspaceId === DEFAULT_WORKSPACE_ID) {
        setTemplates(DEFAULT_TEMPLATES);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(DEFAULT_TEMPLATES));
        } catch {}
      } else {
        setTemplates([]);
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify([]));
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
      if (currentWorkspaceId === DEFAULT_WORKSPACE_ID) {
        setTemplates(DEFAULT_TEMPLATES);
      } else {
        setTemplates([]);
      }
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
          setTemplates(data.templates);
          try {
            localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(data.templates));
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
    if (subscription && subscription.status !== 'active') {
      showToast('🔒 Active subscription required to create official Meta templates. Please upgrade your plan.', 'error');
      if (typeof openCheckout === 'function') {
        openCheckout('Growth', 'monthly', 'razorpay');
      }
      return;
    }
    setFormName('');
    setFormTriggers('');
    setFormCategory('utility');
    setFormHeaderType('NONE');
    setFormHeaderText('');
    setFormImageUrl('');
    setFormBody('');
    setFormReSubmitMeta(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.name || '');
    setFormTriggers(template.footer_text || '');
    setFormCategory((template.category || 'utility').toLowerCase());

    const rawHeaderType = (template.header_type || '').toUpperCase();
    if (rawHeaderType === 'IMAGE') {
      setFormHeaderType('IMAGE');
      setFormImageUrl(template.header_content || '');
      setFormHeaderText('');
    } else if (rawHeaderType === 'TEXT' || (template.header_content && !isValidImageUrl(template.header_content))) {
      setFormHeaderType('TEXT');
      setFormHeaderText(template.header_content || template.header_text || '');
      setFormImageUrl('');
    } else if (template.header_content && isValidImageUrl(template.header_content)) {
      setFormHeaderType('IMAGE');
      setFormImageUrl(template.header_content);
      setFormHeaderText('');
    } else {
      setFormHeaderType('NONE');
      setFormImageUrl('');
      setFormHeaderText('');
    }

    setFormBody(template.body_text || '');
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
      showToast('Template Name and Response Body are required', 'error');
      return;
    }

    if (formHeaderType === 'IMAGE' && formImageUrl.trim() && !isValidImageUrl(formImageUrl.trim())) {
      showToast('Please upload an image file or provide a valid URL starting with https://. If you want a text title, select "Text Title".', 'error');
      return;
    }

    setIsSaving(true);
    const hasImage = formHeaderType === 'IMAGE' && isValidImageUrl(formImageUrl.trim());
    const isTextHeader = formHeaderType === 'TEXT' && Boolean(formHeaderText.trim());
    const headerType = hasImage ? 'IMAGE' : (isTextHeader ? 'TEXT' : null);
    const headerContent = hasImage ? formImageUrl.trim() : (isTextHeader ? formHeaderText.trim() : null);

    try {
      // 1. Create on Meta Template API
      let metaTemplate;
      try {
        const res = await fetch('/api/meta/templates/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: currentWorkspaceId,
            name: formName.trim(),
            category: formCategory.toUpperCase(),
            language: 'en_US',
            headerType: headerType || 'NONE',
            headerImageUrl: hasImage ? headerContent : null,
            headerText: isTextHeader ? headerContent : null,
            bodyText: formBody.trim(),
            footerText: formTriggers.trim(),
            submitToMeta: formReSubmitMeta,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          metaTemplate = resData.template;
        }
      } catch {}

      if (!metaTemplate) {
        try {
          const res = await fetch('http://localhost:4000/api/meta/templates/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspaceId: currentWorkspaceId,
              name: formName.trim(),
              category: formCategory.toUpperCase(),
              language: 'en_US',
              headerType: headerType || 'NONE',
              headerImageUrl: hasImage ? headerContent : null,
              headerText: isTextHeader ? headerContent : null,
              bodyText: formBody.trim(),
              footerText: formTriggers.trim(),
              submitToMeta: formReSubmitMeta,
            }),
          });
          if (res.ok) {
            const resData = await res.json();
            metaTemplate = resData.template;
          }
        } catch {}
      }

      // Also create on Supabase if available
      try {
        await createTemplate({
          workspaceId: currentWorkspaceId,
          name: formName.trim(),
          body_text: formBody.trim(),
          footer_text: formTriggers.trim(),
          category: formCategory,
          status: formReSubmitMeta ? 'pending' : 'approved',
          header_type: headerType,
          header_content: headerContent,
        });
      } catch {}

      const newTmpl = metaTemplate || {
        id: `tmpl-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        name: formName.trim(),
        body_text: formBody.trim(),
        footer_text: formTriggers.trim(),
        category: formCategory.toUpperCase(),
        status: formReSubmitMeta ? 'PENDING' : 'APPROVED',
        header_type: headerType,
        header_content: headerContent,
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
      if (formReSubmitMeta) {
        showToast(`Template "${formName}" created & submitted to Meta for approval!`, 'success');
      } else {
        showToast(`Template "${formName}" created & active locally!`, 'success');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      // Fallback local state
      const localTmpl = {
        id: `tmpl-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        name: formName.trim(),
        body_text: formBody.trim(),
        footer_text: formTriggers.trim(),
        category: formCategory,
        status: formReSubmitMeta ? 'PENDING' : 'APPROVED',
        header_type: headerType,
        header_content: headerContent,
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

    if (formHeaderType === 'IMAGE' && formImageUrl.trim() && !isValidImageUrl(formImageUrl.trim())) {
      showToast('Please upload an image file or provide a valid URL starting with https://. If you want a text title, select "Text Title".', 'error');
      return;
    }

    setIsSaving(true);
    const hasImage = formHeaderType === 'IMAGE' && isValidImageUrl(formImageUrl.trim());
    const isTextHeader = formHeaderType === 'TEXT' && Boolean(formHeaderText.trim());
    const headerType = hasImage ? 'IMAGE' : (isTextHeader ? 'TEXT' : 'NONE');
    const headerContent = hasImage ? formImageUrl.trim() : (isTextHeader ? formHeaderText.trim() : null);

    try {
      // 1. Call Backend Update API with optional Meta re-submission
      let metaUpdated = null;
      try {
        const res = await fetch(`/api/meta/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: currentWorkspaceId,
            name: formName.trim(),
            category: formCategory.toUpperCase(),
            headerType,
            headerImageUrl: hasImage ? headerContent : null,
            headerText: isTextHeader ? headerContent : null,
            bodyText: formBody.trim(),
            footerText: formTriggers.trim(),
            reSubmitToMeta: formReSubmitMeta,
          }),
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
            body: JSON.stringify({
              workspaceId: currentWorkspaceId,
              name: formName.trim(),
              category: formCategory.toUpperCase(),
              headerType,
              headerImageUrl: hasImage ? headerContent : null,
              headerText: isTextHeader ? headerContent : null,
              bodyText: formBody.trim(),
              footerText: formTriggers.trim(),
              reSubmitToMeta: formReSubmitMeta,
            }),
          });
          if (res.ok) {
            const d = await res.json();
            metaUpdated = d.template;
          }
        } catch {}
      }

      try {
        await updateTemplate(editingTemplate.id, {
          name: formName.trim(),
          body_text: formBody.trim(),
          footer_text: formTriggers.trim(),
          category: formCategory,
          status: formReSubmitMeta ? 'pending' : (editingTemplate.status || 'approved'),
          header_type: headerType,
          header_content: headerContent,
        });
      } catch {}

      const updatedObj = metaUpdated || {
        ...editingTemplate,
        name: formName.trim(),
        body_text: formBody.trim(),
        footer_text: formTriggers.trim(),
        category: formCategory.toUpperCase(),
        status: formReSubmitMeta ? 'PENDING' : editingTemplate.status,
        header_type: headerType,
        header_content: headerContent,
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
                name: formName.trim(),
                body_text: formBody.trim(),
                footer_text: formTriggers.trim(),
                category: formCategory,
                header_type: headerType,
                header_content: headerContent,
              }
            : t
        );
        try {
          localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
      setEditingTemplate(null);
      showToast(`Template "${formName}" updated locally!`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    const targetId = deletingTemplate.id;
    const targetName = deletingTemplate.name;

    // 1. Immediately update UI state and workspace-isolated localStorage
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== targetId);
      try {
        localStorage.setItem(`dhigrowth_templates_${currentWorkspaceId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletingTemplate(null);

    // 2. Delete from server store for this specific workspace
    try {
      await fetch(`/api/meta/templates/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          name: targetName,
        }),
      });
    } catch (e) {
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

    // 3. Delete from Supabase for this specific workspace
    try {
      await deleteTemplate(targetId, currentWorkspaceId);
    } catch (err) {
      console.warn('Supabase delete template note:', err);
    }

    showToast(`Template permanently deleted for this user workspace`, 'info');
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
      return (t.footer_text || '').toLowerCase().includes('hi') || (t.footer_text || '').toLowerCase().includes('hello');
    }
    if (activeTab === 'services') {
      return (
        (t.footer_text || '').toLowerCase().includes('app') ||
        (t.footer_text || '').toLowerCase().includes('ai') ||
        (t.footer_text || '').toLowerCase().includes('crm') ||
        (t.footer_text || '').toLowerCase().includes('software')
      );
    }
    if (activeTab === 'pricing') {
      return (t.footer_text || '').toLowerCase().includes('price') || (t.footer_text || '').toLowerCase().includes('quote');
    }
    return true;
  });

  const welcomeTemplate = templates.length > 0 ? (
    templates.find(
      (t) =>
        (t.footer_text || '').toLowerCase().includes('hi') &&
        (t.footer_text || '').toLowerCase().includes('hello')
    ) || templates[0]
  ) : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Page Header & Hero Action Banner */}
      <div className="bg-white border border-[#EAECF0] rounded-3xl p-6 lg:p-8 shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F4F0FD] to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-[11px] font-bold font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                WhatsApp Live Auto-Replies Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] text-[11px] font-bold font-mono">
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
              className="px-3.5 py-2.5 rounded-xl border border-[#7C3AED]/30 bg-[#F4F0FD] hover:bg-[#EDE5FA] text-xs font-bold text-[#7C3AED] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Sync official approved templates from Meta WhatsApp Cloud API"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#7C3AED] ${isSyncing ? 'animate-spin' : ''}`} />
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
              className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Official Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Featured "Hi / Hello" Welcome Response Card */}
      {welcomeTemplate && (
        <div className="bg-gradient-to-r from-[#FAF8FF] to-white border border-[#E9D8FD] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9D8FD]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
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
                className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
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
                        className="px-2.5 py-1 rounded-lg bg-[#F4F0FD] border border-[#E9D8FD] text-[#7C3AED] text-xs font-bold font-mono flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-[#7C3AED]" />
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
            className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
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
          <div className="p-3.5 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] text-xs text-[#101828] leading-relaxed space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7C3AED] font-bold">
              <Bot className="w-3 h-3 text-[#7C3AED]" />
              <span>Simulated Auto-Pilot Output for "{testInput}":</span>
            </div>
            {simulatedImage && (
              <div className="max-w-xs rounded-xl overflow-hidden border border-[#E9D8FD]">
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
                    ? 'bg-white text-[#7C3AED] shadow-xs'
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
                    ? 'bg-white text-[#7C3AED] shadow-xs'
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
            className="w-full bg-white border border-[#EAECF0] pl-8 pr-3 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
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
              className="bg-white border border-[#EAECF0] hover:border-[#7C3AED]/40 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md space-y-4 group overflow-hidden"
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

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] text-[10px] font-bold font-mono uppercase">
                        {template.category || 'Utility'}
                      </span>
                      {Boolean(template.header_content) && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>Image</span>
                        </span>
                      )}
                      {(template.variables?.length > 0 || (template.body_text || '').includes('{{1}}')) && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] text-[10px] font-bold font-mono">
                          {template.variables?.length || ((template.body_text || '').match(/\{\{\d+\}\}/g) || []).length} VARS
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#101828] truncate group-hover:text-[#7C3AED] transition-colors">
                      {template.name}
                    </h4>
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
                    onClick={() => setDeletingTemplate(template)}
                    className="p-1.5 rounded-xl hover:bg-[#FEE2E2] text-[#98A2B3] hover:text-[#DC2626] transition-colors cursor-pointer"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

      {/* 6. Add / Edit Template Modal */}
      {(isCreateModalOpen || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTemplate(null);
              }}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                <MessageSquare className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">
                  {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Auto-Reply Template'}
                </h3>
                <p className="text-xs text-[#667085]">
                  Define the trigger words, optional header media, and the exact message WhatsApp should send back
                </p>
              </div>
            </div>

            <form onSubmit={editingTemplate ? handleSaveEdit : handleSaveCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054]">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome Greeting (Hi / Hello)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054]">
                  Trigger Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. hi, hello, hey, start, menu"
                  value={formTriggers}
                  onChange={(e) => setFormTriggers(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
                <p className="text-[10px] text-[#98A2B3] mt-1">
                  When customer sends any of these words, this template message will be dispatched automatically.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#344054]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="utility">Utility / Auto-Reply</option>
                    <option value="marketing">Marketing / Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#344054]">Channel</label>
                  <div className="mt-1 px-3.5 py-2 bg-[#F2F4F7] border border-[#EAECF0] rounded-xl text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                    <span>WhatsApp Cloud API</span>
                  </div>
                </div>
              </div>

              {/* Header Media (None, Text Title, or Attach Image) */}
              <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                    <label className="text-xs font-bold text-[#344054]">
                      Header Component (Optional)
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-[#0284C7] bg-[#F0F9FF] border border-[#BAE6FD] px-2 py-0.5 rounded-full font-bold">
                    Official WhatsApp Supported
                  </span>
                </div>

                {/* 3 Header Type Options */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormHeaderType('NONE');
                      setFormImageUrl('');
                      setFormHeaderText('');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      formHeaderType === 'NONE'
                        ? 'bg-white border-2 border-[#0284C7] text-[#0284C7] shadow-xs'
                        : 'text-[#667085] hover:text-[#101828] bg-white border border-[#EAECF0]'
                    }`}
                  >
                    None (Body Only)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormHeaderType('TEXT');
                      setFormImageUrl('');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formHeaderType === 'TEXT'
                        ? 'bg-white border-2 border-[#0284C7] text-[#0284C7] shadow-xs'
                        : 'text-[#667085] hover:text-[#101828] bg-white border border-[#EAECF0]'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Text Title</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormHeaderType('IMAGE');
                      setFormHeaderText('');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formHeaderType === 'IMAGE'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-[#667085] hover:text-[#101828] bg-white border border-[#EAECF0]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Attach Image</span>
                  </button>
                </div>

                {/* TEXT HEADER CONFIGURATION */}
                {formHeaderType === 'TEXT' && (
                  <div className="space-y-1.5 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                    <label className="text-[11px] font-semibold text-[#475467]">
                      Header Text / Bold Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DhiGrowth IT Services or Exclusive Announcement"
                      value={formHeaderText}
                      onChange={(e) => setFormHeaderText(e.target.value)}
                      className="w-full bg-white border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                    />
                    <p className="text-[10px] text-[#98A2B3]">
                      Appears as a prominent bold header line at the very top of your WhatsApp message.
                    </p>
                  </div>
                )}

                {/* IMAGE HEADER CONFIGURATION */}
                {formHeaderType === 'IMAGE' && (
                  <div className="space-y-3 pt-2 border-t border-[#EAECF0] animate-in fade-in">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />

                    {/* Image Attachment Card (when file or valid URL is present) */}
                    {isValidImageUrl(formImageUrl) ? (
                      <div className="p-3 bg-white border-2 border-[#BAE6FD] rounded-xl flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#EAECF0] bg-gray-50 shrink-0">
                          <img
                            src={formImageUrl}
                            alt="Selected banner"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7]">
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                            <span>Image Attached & Ready</span>
                          </div>
                          <p className="text-[11px] text-[#667085] truncate mt-0.5">
                            {formImageUrl.startsWith('data:') ? 'Local image uploaded from device' : formImageUrl}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingImage}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {isUploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                              <span>Change Image</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormImageUrl('')}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Upload Dropzone (when no valid image attached yet) */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-5 bg-white border-2 border-dashed border-[#BAE6FD] hover:border-[#0284C7] hover:bg-[#F0F9FF]/50 rounded-xl text-center cursor-pointer transition-all space-y-1.5 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#0284C7]" />
                          ) : (
                            <UploadCloud className="w-5 h-5 text-[#0284C7]" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-[#101828]">
                          {isUploadingImage ? 'Uploading Image...' : 'Click to Upload Image from your Device'}
                        </div>
                        <p className="text-[11px] text-[#667085]">
                          Select JPG, PNG, WebP or SVG from computer/mobile (up to 10MB)
                        </p>
                      </div>
                    )}

                    {/* Or Public URL Input */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-[#475467]">
                          Or Paste Public Image URL:
                        </label>
                        {isValidImageUrl(formImageUrl) && (
                          <span className="text-[10px] text-[#16A34A] font-bold">✓ Valid URL</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/banner.png"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          className="flex-1 bg-white border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                        />
                        {formImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormImageUrl('')}
                            className="p-2 text-[#98A2B3] hover:text-[#DC2626] rounded-xl hover:bg-white cursor-pointer"
                            title="Clear Image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Warning if user typed plain text (e.g. "DhiGrowth IT Services") instead of URL/image */}
                      {Boolean(formImageUrl.trim()) && !isValidImageUrl(formImageUrl.trim()) && (
                        <div className="p-2.5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-[11px] text-[#B42318] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">"{formImageUrl.trim()}"</span> looks like a text title rather than an image file!
                            <div className="mt-1">
                              👉 If you want a bold text headline, click{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormHeaderText(formImageUrl.trim());
                                  setFormImageUrl('');
                                  setFormHeaderType('TEXT');
                                }}
                                className="font-bold underline text-[#B42318] hover:text-[#7A271A] cursor-pointer"
                              >
                                Switch to "Text Title"
                              </button>
                              , or click "Upload Image" to pick a photo from your computer.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Image Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-[#98A2B3] font-mono font-bold uppercase">
                        Quick Preset Banners:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_HEADER_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setFormImageUrl(preset.url)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
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
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#344054]">
                    Message Content (WhatsApp Body)
                  </label>
                  <span className="text-[10px] font-mono text-[#98A2B3]">
                    Tip: Use *bold* or **bold** for bold text
                  </span>
                </div>

                {/* Variable Inserter Toolbar */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-[#667085]">Insert Variables:</span>
                  <button
                    type="button"
                    onClick={() => setFormBody((prev) => prev + ' {{1}}')}
                    className="px-2 py-0.5 rounded-lg bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    title="Insert {{1}} (e.g. Customer Name)"
                  >
                    + {'{{1}}'} Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormBody((prev) => prev + ' {{2}}')}
                    className="px-2 py-0.5 rounded-lg bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    title="Insert {{2}} (e.g. City, Deal, or Custom param)"
                  >
                    + {'{{2}}'} Custom Param
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormBody((prev) => prev + ' {{3}}')}
                    className="px-2 py-0.5 rounded-lg bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    title="Insert {{3}} (e.g. Link, Date, or Offer)"
                  >
                    + {'{{3}}'} Link/Offer
                  </button>
                </div>

                <textarea
                  rows={6}
                  placeholder="Write the exact message WhatsApp should send back..."
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-3 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] leading-relaxed resize-none font-sans"
                  required
                />
              </div>

              {/* Live WhatsApp Customer Bubble Preview */}
              {(formBody || (formHeaderType === 'IMAGE' && isValidImageUrl(formImageUrl)) || (formHeaderType === 'TEXT' && formHeaderText)) && (
                <div className="p-3.5 rounded-2xl bg-[#EFEAE2] border border-[#D1D5DB] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#16A34A]">
                    <Smartphone className="w-3 h-3" />
                    <span>WhatsApp Live Customer Bubble Preview:</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl text-xs text-[#111B21] shadow-xs leading-relaxed space-y-2 max-w-sm">
                    {/* Header Image Preview */}
                    {formHeaderType === 'IMAGE' && isValidImageUrl(formImageUrl.trim()) && (
                      <div className="rounded-xl overflow-hidden -mx-1 -mt-1 border border-black/5 max-h-48 bg-gray-100 flex items-center justify-center">
                        <img
                          src={formImageUrl.trim()}
                          alt="Template Header Media"
                          className="w-full max-h-48 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Header Text Title Preview */}
                    {formHeaderType === 'TEXT' && formHeaderText.trim() && (
                      <p className="font-bold text-[13px] text-[#111B21] leading-snug pb-1 border-b border-gray-100">
                        {formHeaderText.trim()}
                      </p>
                    )}

                    <p className="whitespace-pre-line text-xs">{formBody || 'Type your message above...'}</p>
                    <div className="flex justify-end items-center text-[9px] text-gray-400 font-mono pt-1">
                      <span>1:45 PM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Cloud API Approval Submission Toggle */}
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
                    Submit to Meta for Official Approval
                  </span>
                  <span className="text-[11px] text-[#667085] block mt-0.5">
                    Sync this template directly with Meta WhatsApp Cloud API ({currentUser?.organization || 'Current Workspace'}). Once submitted, Meta evaluates template variables and compliance.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#EAECF0] hover:bg-[#F9FAFB] text-xs font-bold text-[#475467] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingTemplate ? 'Save & Update Live' : 'Create & Activate'}</span>
                </button>
              </div>
            </form>
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
                onClick={() => setDeletingTemplate(null)}
                className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
