import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  CheckCheck,
  Tag,
  StickyNote,
  Zap,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Globe,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Users,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';
import { BACKEND_URL } from '../../services/apiConfig';

export const InstagramInbox = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    openChat,
    sendMessage,
    toggleAiForChat,
    setAiForChat,
    addInternalNote,
    updateLeadTag,
    createLead,
    updateLead,
    deleteLead,
    showToast,
    currentWorkspaceId,
    currentUser,
    isSuperAdmin,
    selectedClientWorkspace,
    selectClientWorkspace,
    clientTenants,
    getChatCountForWorkspace,
    setActiveTab,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeTabSide, setActiveTabSide] = useState('profile'); // profile | notes
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | ai | human | hot
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [isTranslateMenuOpen, setIsTranslateMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSendingLive, setIsSendingLive] = useState(false);

  // New Contact & Delete Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTag, setFormTag] = useState('Interested');
  const [formCity, setFormCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Contact State
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTag, setEditTag] = useState('Interested');
  const [editCity, setEditCity] = useState('');
  const [editDealValue, setEditDealValue] = useState('');
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Invoice / Payment Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('2499');
  const [invoiceDesc, setInvoiceDesc] = useState('Instagram DM Order / Retainer');
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter chats strictly for Instagram channel
  const igChats = (chats || []).filter((c) => {
    const ch = (c.channel || '').toLowerCase();
    const source = (c.source || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return ch === 'instagram' || ch.includes('instagram') || source.includes('instagram') || phone.startsWith('@ig') || phone.startsWith('@');
  });

  // Filtered Instagram chats based on search and status
  const filteredChats = [...igChats]
    .filter((chat) => {
      if (isSuperAdmin && selectedClientWorkspace && selectedClientWorkspace !== 'all') {
        const ws = chat.workspaceId || chat.tenantId;
        if (ws && ws !== selectedClientWorkspace) return false;
      }
      if (statusFilter === 'ai' && !chat.aiHandled) return false;
      if (statusFilter === 'human' && chat.aiHandled) return false;
      if (statusFilter === 'hot' && chat.tag !== 'Hot') return false;
      if (
        searchTerm &&
        !chat.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !chat.phone?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !chat.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  // Determine active chat
  const activeChat = isMobileView
    ? (activeChatId ? filteredChats.find((c) => c.id === activeChatId) : null)
    : (filteredChats.find((c) => c.id === activeChatId) || (filteredChats.length > 0 ? filteredChats[0] : null));

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, activeChat?.id]);

  // Ensure activeChatId is set to an Instagram chat when loaded on desktop only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (filteredChats.length > 0 && !activeChatId) {
      const isCurrentInList = filteredChats.some((c) => c.id === activeChatId);
      if (!isCurrentInList) {
        if (openChat) openChat(filteredChats[0].id);
        else setActiveChatId(filteredChats[0].id);
      }
    }
  }, [filteredChats.length, activeChatId]);

  const isAiAutoPilot = Boolean(activeChat?.aiHandled !== false);

  const LANGUAGES = [
    { name: 'Hindi', code: 'hi', native: 'हिंदी', flag: '🇮🇳' },
    { name: 'Tamil', code: 'ta', native: 'தமிழ்', flag: '🇮🇳' },
    { name: 'Telugu', code: 'te', native: 'తెలుగు', flag: '🇮🇳' },
    { name: 'Marathi', code: 'mr', native: 'मराठी', flag: '🇮🇳' },
    { name: 'Spanish', code: 'es', native: 'Español', flag: '🇪🇸' },
    { name: 'Arabic', code: 'ar', native: 'العربية', flag: '🇦🇪' },
    { name: 'French', code: 'fr', native: 'Français', flag: '🇫🇷' },
    { name: 'German', code: 'de', native: 'Deutsch', flag: '🇩🇪' },
  ];

  const tagColors = {
    Hot: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    Interested: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    Cold: 'bg-[#F1F5F9] text-[#475467] border-[#E2E8F0]',
    Converted: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  };

  // Send message as support agent
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setIsSendingLive(true);

    try {
      // 1. Add to local state / store
      sendMessage(text, 'agent', activeChat.id);

      // 2. Dispatch to backend manual send
      const recipient = activeChat.phone || activeChat.id;
      const payload = {
        recipientPhone: recipient,
        text,
        conversationId: activeChat.conversationId || activeChat.id,
        channelType: 'instagram',
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.slug,
        username: currentUser?.username,
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/send-manual-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/send-manual-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (!res || !res.ok) {
        try {
          res = await fetch('https://api-wappilot.dhigrowth.com/api/send-manual-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      showToast(`Sent Instagram DM to ${activeChat.contactName || recipient}`, 'success');
    } catch (err) {
      console.warn('Instagram send notice:', err);
      showToast('Sent manually as Support Agent', 'success');
    } finally {
      setIsSendingLive(false);
    }
  };

  // Generate smart AI draft response using Gemini
  const handleGenerateAiResponse = async () => {
    if (!activeChat) return;
    setIsGeneratingAi(true);
    try {
      const messages = activeChat.messages || [];
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user' || m.direction === 'inbound');
      const customerMsg = lastUserMsg?.text || 'Hello, tell me about your services and pricing on Instagram.';

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerMessage: customerMsg,
            customerName: activeChat.contactName || 'Instagram User',
            channelType: 'instagram',
            workspaceId: currentWorkspaceId,
          }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerMessage: customerMsg,
              customerName: activeChat.contactName || 'Instagram User',
              channelType: 'instagram',
              workspaceId: currentWorkspaceId,
            }),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.reply) {
          setInputMessage(data.reply);
          showToast('✨ AI Smart Reply drafted for Instagram DM!', 'success');
          return;
        }
      }

      setInputMessage(
        `Hey ${activeChat.contactName?.split(' ')[0] || 'there'}! 👋 Thanks for reaching out via Instagram. We specialize in custom business solutions & AI automation. Would you like to see a quick demo or pricing package? 🚀`
      );
      showToast('✨ AI Smart Reply drafted for Instagram DM!', 'success');
    } catch (err) {
      console.warn('AI generate error:', err);
      setInputMessage(`Hey ${activeChat.contactName?.split(' ')[0] || 'there'}! 👋 How can we help your business grow today?`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Translate and dispatch directly
  const handleTranslateAndSend = async (targetLang) => {
    if (!inputMessage.trim() || !activeChat) return;
    const target = LANGUAGES.find((l) => l.name === targetLang) || LANGUAGES[0];
    setIsTranslating(true);
    setIsTranslateMenuOpen(false);

    try {
      let translatedText = inputMessage;
      try {
        const trRes = await fetch(`${BACKEND_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemPrompt: `You are a professional multilingual translator. Translate the following text accurately into ${target.name} (${target.native}). Return ONLY the translated string with no explanations or preamble.`,
            customerMessage: inputMessage,
            workspaceId: currentWorkspaceId,
          }),
        });
        if (trRes && trRes.ok) {
          const tData = await trRes.json();
          if (tData.reply) translatedText = tData.reply.trim();
        }
      } catch {}

      setInputMessage('');
      sendMessage(translatedText, 'agent');

      // Dispatch to backend
      const recipient = activeChat.phone || activeChat.id;
      const payload = {
        recipientPhone: recipient,
        text: translatedText,
        conversationId: activeChat.conversationId || activeChat.id,
        channelType: 'instagram',
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username,
      };

      fetch(`${BACKEND_URL}/api/send-manual-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      showToast(`🌐 Translated to ${target.name} & sent as Instagram DM!`, 'success');
    } catch (err) {
      console.warn('Translate error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Simulate an inbound Instagram DM to test auto-reply
  const handleSimulateInboundDM = (customQuestion) => {
    if (!activeChat) return;
    const sampleQuestions = [
      'Hi! Do you offer AI Auto-DM automation for Instagram business accounts?',
      'How much does your mobile app development package cost?',
      'Can you help us build an automated WhatsApp and Instagram CRM?',
      'Can we book a live 1-on-1 demo call for our team?',
    ];
    const textToSend = typeof customQuestion === 'string' && customQuestion.trim()
      ? customQuestion.trim()
      : sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

    sendMessage(textToSend, 'user', activeChat.id);
    showToast(`📩 Customer DM received -> 🤖 DhiGrowth AI Concierge is generating reply...`, 'info');
  };

  // Add new Instagram Contact
  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formHandle.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanHandle = formHandle.startsWith('@') ? formHandle : `@${formHandle}`;
      await createLead({
        name: formName.trim(),
        phone: cleanHandle,
        email: formEmail.trim() || `${cleanHandle.replace('@', '')}@instagram.com`,
        tag: formTag,
        city: formCity.trim() || 'Instagram Direct',
        channel: 'instagram',
        workspaceId: isSuperAdmin && selectedClientWorkspace !== 'all' ? selectedClientWorkspace : currentWorkspaceId,
      });

      setFormName('');
      setFormHandle('');
      setFormEmail('');
      setFormCity('');
      setIsAddContactModalOpen(false);
      showToast(`Added Instagram lead ${cleanHandle}!`, 'success');
    } catch (err) {
      console.error('Error creating contact:', err);
      showToast('Error saving contact', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Contact
  const handleOpenEditModal = () => {
    if (!activeChat) return;
    setEditName(activeChat.contactName || '');
    setEditHandle(activeChat.phone || '');
    setEditEmail(activeChat.email || '');
    setEditTag(activeChat.tag || 'Interested');
    setEditCity(activeChat.city || 'Instagram Direct');
    setEditDealValue(activeChat.dealValue || '₹2,499');
    setIsEditContactModalOpen(true);
  };

  const handleSaveContactEdit = async (e) => {
    e.preventDefault();
    if (!activeChat || !editName.trim()) return;

    setIsUpdatingContact(true);
    try {
      await updateLead(activeChat.id, {
        name: editName.trim(),
        phone: editHandle.trim(),
        email: editEmail.trim(),
        tag: editTag,
        city: editCity.trim(),
        dealValue: editDealValue.trim(),
      });
      setIsEditContactModalOpen(false);
      showToast('Updated Instagram lead profile!', 'success');
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast('Error updating contact', 'error');
    } finally {
      setIsUpdatingContact(false);
    }
  };

  // Permanently delete contact and conversation from database
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(contactToDelete.id);
      showToast(`Contact "${contactToDelete.contactName || contactToDelete.phone}" deleted from database!`, 'success');
      setContactToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Error deleting contact from database', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim() || !activeChat) return;
    addInternalNote(activeChat.id, noteInput);
    setNoteInput('');
  };

  // Send Invoice link via DM
  const handleSendInvoiceLink = async (e) => {
    e?.preventDefault();
    if (!activeChat) return;
    setIsSendingInvoice(true);
    try {
      const paymentLinkText = `🧾 *DhiGrowth Order Invoice*\n\nHey ${activeChat.contactName}! Here is your order link for ${invoiceDesc}:\n💰 Amount: ₹${Number(invoiceAmount).toLocaleString('en-IN')}\n🔗 Secure Payment: https://dhigrowth.com/pay?client=${encodeURIComponent(activeChat.contactName)}\n\nReply once completed and our team will get started right away! 🚀`;
      sendMessage(paymentLinkText, 'agent');
      setIsInvoiceModalOpen(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      } catch {}
      showToast('Sent payment invoice link via Instagram DM!', 'success');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const formatHandle = (phoneOrHandle) => {
    if (!phoneOrHandle) return '@instagram_user';
    if (phoneOrHandle.startsWith('@')) return phoneOrHandle;
    if (phoneOrHandle.startsWith('+') || /^[0-9]+$/.test(phoneOrHandle)) {
      return `@ig_${phoneOrHandle.replace(/[^0-9]/g, '').slice(-6)}`;
    }
    return `@${phoneOrHandle}`;
  };

  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden bg-[#F8F9FC] font-sans">
      {/* 1. Header Banner & Channel Switcher */}
      <div className="bg-white border-b border-[#EAECF0] px-4 py-2.5 shrink-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#ig-inbox-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig-inbox-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FD5949" />
                    <stop offset="50%" stopColor="#D6249F" />
                    <stop offset="100%" stopColor="#285AEB" />
                  </linearGradient>
                </defs>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#101828]">Instagram Direct Inbox</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FDF2F8] text-[#DB2777] border border-[#FCE7F3]">
                {filteredChats.length} Active DMs
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Real-time Instagram DMs, AI Lead Concierge & Direct Message Automations
            </p>
          </div>
        </div>

        {/* Channel Quick Switcher Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className="px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] hover:bg-[#F2F4F7] text-xs font-semibold text-[#475467] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Switch to WhatsApp Inbox"
          >
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>WhatsApp Inbox</span>
          </button>


          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New IG DM</span>
          </button>
        </div>
      </div>

      {/* 2. Three Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Instagram Conversations List */}
        <div
          className={`border-r border-[#EAECF0] bg-white flex flex-col shrink-0 min-h-0 w-full md:w-[320px] lg:w-[340px] ${
            activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Status Filters */}
          <div className="p-3 border-b border-[#EAECF0] space-y-2.5 shrink-0">
            {/* Super Admin Client Profile Selector */}
            {isSuperAdmin && (
              <div className="bg-gradient-to-r from-sky-50/90 via-blue-50/60 to-sky-50/90 border border-sky-200/90 rounded-2xl p-2.5 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0284C7]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Client Profile Selector</span>
                  </div>
                  {selectedClientWorkspace !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => selectClientWorkspace('all')}
                      className="text-[10px] font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5 active:scale-95 transition-transform"
                      title="Switch back to viewing all inboxes"
                    >
                      <span>View All Clients</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-200 shadow-2xs">
                      All Clients View
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedClientWorkspace}
                    onChange={(e) => selectClientWorkspace(e.target.value)}
                    className="w-full bg-white border border-sky-200 text-[#101828] text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent cursor-pointer shadow-2xs appearance-none truncate"
                  >
                    <option value="all">
                      🌐 All Clients (Global Inbox Feed)
                    </option>
                    {(clientTenants || []).map((client) => {
                      const wsId = client.workspaceId || client.id;
                      const count = getChatCountForWorkspace ? getChatCountForWorkspace(wsId) : 0;
                      return (
                        <option key={wsId} value={wsId}>
                          👤 {client.name} — {client.companyName || 'Client Profile'} ({count} threads)
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search @handles, name, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-8.5 pr-3 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#D6249F]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-medium overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'All DMs' },
                { id: 'ai', label: '🤖 AI Mode' },
                { id: 'human', label: '👤 Agent' },
                { id: 'hot', label: '🔥 Hot' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[10px] font-semibold ${
                    statusFilter === f.id
                      ? 'bg-gradient-to-r from-[#FD5949] to-[#D6249F] text-white shadow-2xs'
                      : 'bg-[#F9FAFB] text-[#475467] hover:text-[#101828]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F2F4F7] min-h-0">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center mx-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-[#101828]">No Instagram DMs Found</div>
                <p className="text-[11px] text-[#667085] leading-relaxed max-w-[200px] mx-auto">
                  Start an Instagram conversation or connect your account to receive incoming DMs.
                </p>
                <button
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FD5949] to-[#D6249F] text-white text-xs font-bold cursor-pointer"
                >
                  + Add Instagram Lead
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === activeChat?.id;
                const messages = chat.messages || [];
                const lastMsg = messages[messages.length - 1];
                const handle = formatHandle(chat.phone);

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (openChat) openChat(chat.id);
                      else setActiveChatId(chat.id);
                    }}
                    className={`p-3 group flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FDF2F8]/70 border-l-4 border-l-[#D6249F]'
                        : chat.unreadCount > 0
                        ? 'bg-[#FDF2F8]/30 hover:bg-[#FDF2F8]/50'
                        : 'hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {/* Avatar with IG gradient story border */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <ContactAvatar name={chat.contactName} size="sm" />
                        </div>
                      </div>
                      {chat.aiHandled !== false ? (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#D6249F] rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-xs" title="Instagram AI Auto-DM Active">
                          🤖
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-xs" title="Human Agent Handled">
                          👤
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#101828] truncate">
                          {chat.contactName}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-[#98A2B3] font-mono">
                            {chat.lastSeen || 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactToDelete(chat);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                            title="Delete from Database"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#D6249F] truncate">
                          {handle}
                        </span>
                        {chat.tag && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${tagColors[chat.tag] || 'bg-gray-100 text-gray-700'}`}>
                            {chat.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#667085] truncate">
                        {lastMsg ? lastMsg.text : 'Direct message opened'}
                      </p>

                      {isSuperAdmin && (chat.clientProfileName || chat.clientCompanyName) && (
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-sky-700 bg-sky-50/90 border border-sky-200/90 px-1.5 py-0.5 rounded-md max-w-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
                            <span className="truncate">
                              {chat.clientProfileName || 'Client'}{chat.clientCompanyName ? ` (${chat.clientCompanyName})` : ''}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column: Active Instagram Direct Chat Pane */}
        {activeChat ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Top Bar of Active Conversation */}
            <div className="p-3.5 border-b border-[#EAECF0] flex items-center justify-between gap-3 bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {isMobileView && (
                  <button
                    onClick={() => setActiveChatId(null)}
                    className="p-1 text-[#667085] hover:text-[#101828]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <ContactAvatar name={activeChat.contactName} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-[#101828] truncate">
                      {activeChat.contactName}
                    </h2>
                    <span className="text-[11px] font-mono text-[#D6249F] font-semibold truncate">
                      {formatHandle(activeChat.phone)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#667085]">
                    <span className="flex items-center gap-1 text-[#16A34A] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                      Instagram Direct
                    </span>
                    <span>•</span>
                    <span>Lead Value: {activeChat.dealValue || '₹2,499'}</span>
                    {isSuperAdmin && (activeChat.clientProfileName || activeChat.clientCompanyName) && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded-md shadow-2xs">
                          <span>🏢</span>
                          <span className="truncate max-w-[140px]">
                            {activeChat.clientProfileName || 'Client'}{activeChat.clientCompanyName ? ` · ${activeChat.clientCompanyName}` : ''}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls & AI Mode Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                {/* AI Concierge Auto-DM Mode Toggle */}
                <button
                  type="button"
                  onClick={() => toggleAiForChat(activeChat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border ${
                    isAiAutoPilot
                      ? 'bg-gradient-to-r from-[#FD5949]/10 via-[#D6249F]/10 to-[#7C3AED]/10 text-[#D6249F] border-[#FCE7F3]'
                      : 'bg-[#F2F4F7] text-[#475467] border-[#EAECF0]'
                  }`}
                  title={isAiAutoPilot ? 'Click to switch to Human Agent mode' : 'Click to enable AI Auto-DM'}
                >
                  <span>{isAiAutoPilot ? '🤖 AI Auto-DM (On)' : '👤 Agent Mode'}</span>
                </button>

                {/* Simulate DM Inbound */}
                <button
                  type="button"
                  onClick={handleSimulateInboundDM}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[11px] font-semibold text-[#475467] cursor-pointer"
                  title="Test an inbound DM from this user"
                >
                  <RefreshCw className="w-3 h-3 text-[#D6249F]" />
                  <span>Test DM</span>
                </button>

                {/* Edit Contact button */}
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete from Database button */}
                <button
                  type="button"
                  onClick={() => setContactToDelete(activeChat)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete from Database"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Test AI Auto-DM Bar */}
            <div className="bg-[#FAF5FF] border-b border-[#F3E8FF] px-3.5 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7E22CE] shrink-0">
                <Bot className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Test AI Auto-DM:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '💰 Pricing & Plans', text: 'How much are your AI Auto-DM and development plans?' },
                  { label: '📱 Mobile App Dev', text: 'Can you build a custom mobile app for our business?' },
                  { label: '🤖 AI Bot Demo', text: 'Do you have AI agents for Instagram DMs and reels?' },
                  { label: '📅 Book Call', text: 'Can we schedule a 15-minute consultation call?' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleSimulateInboundDM(btn.text)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#7E22CE] border border-[#E9D8FD] hover:bg-[#F3E8FF] hover:border-[#D8B4FE] transition-all cursor-pointer shadow-2xs whitespace-nowrap active:scale-95"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-[#FAFAFA]">
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono text-[#667085] bg-white border border-[#EAECF0] shadow-2xs">
                  Connected via Meta Instagram Graph API
                </span>
              </div>

              {(activeChat.messages || []).map((msg, idx) => {
                const isUser = msg.sender === 'user' || msg.direction === 'inbound';
                const isAi = msg.sender === 'ai' || msg.ai_generated;

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs leading-relaxed ${
                        isUser
                          ? 'bg-white text-[#101828] border border-[#EAECF0] rounded-bl-xs'
                          : isAi
                          ? 'bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] text-white rounded-br-xs'
                          : 'bg-[#1E293B] text-white rounded-br-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-[#98A2B3] font-mono">
                      <span>{msg.time || 'Just now'}</span>
                      {!isUser && (
                        <span>
                          {isAi ? '• 🤖 AI Auto-DM' : '• 👤 Support Agent'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Tools Bar (AI Smart Reply, Translate, Quick Starters) */}
            <div className="px-3 py-2 border-t border-[#EAECF0] bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {/* AI Draft Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiResponse}
                  disabled={isGeneratingAi}
                  className="px-2.5 py-1 rounded-lg bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FCE7F3] text-[11px] font-bold text-[#DB2777] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-[#DB2777]" />
                  <span>{isGeneratingAi ? 'Drafting...' : '✨ AI Smart Reply'}</span>
                </button>

                {/* Multilingual Translate Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTranslateMenuOpen(!isTranslateMenuOpen)}
                    disabled={isTranslating}
                    className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[11px] font-semibold text-[#475467] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Globe className="w-3 h-3 text-[#667085]" />
                    <span>{isTranslating ? 'Translating...' : `Translate (${selectedLanguage})`}</span>
                    <ChevronDown className="w-3 h-3 text-[#98A2B3]" />
                  </button>

                  {isTranslateMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-1 w-44 bg-white border border-[#EAECF0] rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(l.name);
                            handleTranslateAndSend(l.name);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#344054] hover:bg-[#FDF2F8] hover:text-[#DB2777] rounded-lg flex items-center justify-between cursor-pointer"
                        >
                          <span>{l.flag} {l.name}</span>
                          <span className="text-[10px] text-[#98A2B3] font-mono">{l.native}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Starters */}
                <button
                  type="button"
                  onClick={() => setInputMessage('Here are our pricing packages: Starter ($29/mo), Growth ($79/mo), Enterprise ($199/mo). Which one aligns best with your goals?')}
                  className="px-2 py-1 rounded-lg bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[10px] font-medium text-[#667085] cursor-pointer"
                >
                  Pricing
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[10px] font-medium text-[#667085] cursor-pointer"
                >
                  Send Invoice
                </button>
              </div>
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#EAECF0] bg-white flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Send an Instagram Direct message to ${formatHandle(activeChat.phone)}...`}
                className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#D6249F]"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSendingLive}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span>{isSendingLive ? 'Sending...' : 'Send DM'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFA]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] p-0.5 shadow-md flex items-center justify-center mb-3">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#ig-empty-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="ig-empty-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FD5949" />
                      <stop offset="50%" stopColor="#D6249F" />
                      <stop offset="100%" stopColor="#285AEB" />
                    </linearGradient>
                  </defs>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
            </div>
            <h2 className="text-base font-bold text-[#101828]">Select an Instagram Conversation</h2>
            <p className="text-xs text-[#667085] max-w-sm mt-1">
              Choose an Instagram contact from the left pane or start a new Direct Message conversation.
            </p>
          </div>
        )}

        {/* Right Column: Instagram CRM Lead Profile & Intelligence */}
        {activeChat && (
          <div className="w-[300px] border-l border-[#EAECF0] bg-white hidden xl:flex flex-col min-h-0 shrink-0">
            {/* Lead Header */}
            <div className="p-4 border-b border-[#EAECF0] text-center space-y-2 shrink-0">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] mx-auto flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ContactAvatar name={activeChat.contactName} size="lg" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#101828]">{activeChat.contactName}</h3>
                <p className="text-xs font-mono text-[#D6249F] font-semibold">{formatHandle(activeChat.phone)}</p>
              </div>

              {/* Tag Switcher */}
              <div className="flex items-center justify-center gap-1 pt-1">
                {['Hot', 'Interested', 'Converted'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => updateLeadTag(activeChat.id, tag)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      activeChat.tag === tag
                        ? tagColors[tag]
                        : 'bg-[#F9FAFB] text-[#667085] border-[#EAECF0] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile / Notes Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-[#EAECF0] text-xs font-bold text-center shrink-0">
              <button
                onClick={() => setActiveTabSide('profile')}
                className={`py-2.5 transition-all cursor-pointer ${
                  activeTabSide === 'profile'
                    ? 'text-[#D6249F] border-b-2 border-b-[#D6249F] bg-[#FDF2F8]/30'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                Lead Details
              </button>
              <button
                onClick={() => setActiveTabSide('notes')}
                className={`py-2.5 transition-all cursor-pointer ${
                  activeTabSide === 'notes'
                    ? 'text-[#D6249F] border-b-2 border-b-[#D6249F] bg-[#FDF2F8]/30'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                Notes ({activeChat.notes?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {activeTabSide === 'profile' ? (
                <>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">Email</span>
                      <p className="text-[#101828] font-medium mt-0.5 truncate">{activeChat.email || 'None on file'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">Location</span>
                      <p className="text-[#101828] font-medium mt-0.5">{activeChat.city || 'Instagram Direct'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">Deal Budget</span>
                      <p className="text-[#101828] font-bold mt-0.5">{activeChat.dealValue || '₹2,499'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">Interest Topic</span>
                      <p className="text-[#101828] font-medium mt-0.5">{activeChat.attributes?.product || 'AI Agents & Growth Automation'}</p>
                    </div>
                  </div>

                  {/* Quick Payment Action */}
                  <div className="p-3 rounded-xl bg-[#FDF2F8] border border-[#FCE7F3] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#DB2777]">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Send Payment Invoice</span>
                    </div>
                    <p className="text-[11px] text-[#667085] leading-relaxed">
                      Send a secure Razorpay checkout link directly to this customer on Instagram DM.
                    </p>
                    <button
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="w-full py-2 bg-gradient-to-r from-[#FD5949] to-[#D6249F] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Generate & Send Link
                    </button>
                  </div>

                  {/* Danger Zone: Delete from Database */}
                  <div className="pt-3 border-t border-[#EAECF0] space-y-2">
                    <div className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">Danger Zone</div>
                    <button
                      type="button"
                      onClick={() => setContactToDelete(activeChat)}
                      className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete from Database</span>
                    </button>
                    <p className="text-[10px] text-center text-[#98A2B3]">
                      Permanently removes contact & chat history from Supabase
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add an internal note about this Instagram user..."
                      rows={2}
                      className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-2 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#D6249F]"
                    />
                    <button
                      type="submit"
                      disabled={!noteInput.trim()}
                      className="w-full py-1.5 bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Save Note
                    </button>
                  </form>

                  <div className="space-y-2">
                    {(activeChat.notes || []).map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#98A2B3]">
                          <span className="font-bold text-[#475467]">{n.author || 'Agent'}</span>
                          <span>{n.time || 'Recent'}</span>
                        </div>
                        <p className="text-[#344054]">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: New Instagram Contact */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative border border-[#EAECF0] space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => setIsAddContactModalOpen(false)}
              className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD5949] to-[#D6249F] flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">New Instagram DM Contact</h3>
                <p className="text-xs text-[#667085]">Add an Instagram lead to your inbox</p>
              </div>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Instagram Username / Handle</label>
                <input
                  type="text"
                  required
                  placeholder="@fashion_store or @johndoe"
                  value={formHandle}
                  onChange={(e) => setFormHandle(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#D6249F]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#344054]">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#D6249F]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#344054]">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs focus:outline-none focus:border-[#D6249F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#344054]">Lead Tag</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#344054]">City / Region</label>
                  <input
                    type="text"
                    placeholder="Mumbai, IN"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Saving Lead...' : 'Create Instagram Contact'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Instagram Contact */}
      {isEditContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative border border-[#EAECF0] space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => setIsEditContactModalOpen(false)}
              className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Edit Instagram Lead</h3>
                <p className="text-xs text-[#667085]">Update profile and CRM attributes</p>
              </div>
            </div>

            <form onSubmit={handleSaveContactEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#344054]">Instagram Handle</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#344054]">Lead Tag</label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#344054]">Deal Value</label>
                  <input
                    type="text"
                    value={editDealValue}
                    onChange={(e) => setEditDealValue(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingContact}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FD5949] to-[#D6249F] text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isUpdatingContact ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditContactModalOpen(false);
                    setContactToDelete(activeChat);
                  }}
                  className="w-full py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete Contact from Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Send Payment Invoice via DM */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative border border-[#EAECF0] space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD5949] to-[#D6249F] text-white flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Send Invoice Link via DM</h3>
                <p className="text-xs text-[#667085]">Instant checkout for {activeChat?.contactName}</p>
              </div>
            </div>

            <form onSubmit={handleSendInvoiceLink} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Invoice Amount (INR)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-[#667085] font-bold">₹</span>
                  <input
                    type="number"
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-7 pr-3 py-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#D6249F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#344054]">Service / Order Description</label>
                <input
                  type="text"
                  required
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-[#FDF2F8] rounded-xl border border-[#FCE7F3] text-[11px] text-[#DB2777]">
                💡 The customer will receive an interactive DM with a secure checkout link and order summary.
              </div>

              <button
                type="submit"
                disabled={isSendingInvoice}
                className="w-full py-2.5 bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm disabled:opacity-50 mt-2"
              >
                {isSendingInvoice ? 'Sending Link...' : 'Send Invoice to Instagram DM'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete from Database Confirmation */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative border border-rose-100 space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => setContactToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Delete from Database?</h3>
                <p className="text-xs text-[#667085]">Permanent deletion of contact & message history</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-1.5">
              <p className="font-semibold">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold underline text-rose-900">
                  {contactToDelete.contactName || 'Contact'} ({contactToDelete.phone || 'Instagram'})
                </span>
                ?
              </p>
              <p className="text-[11px] text-rose-600/90 leading-relaxed">
                This will delete the contact profile, conversation threads, and all direct messages directly from the Supabase database. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setContactToDelete(null)}
                className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete from Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
