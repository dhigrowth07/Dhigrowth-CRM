import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  PhoneCall,
  CheckCheck,
  ShieldCheck,
  Tag,
  StickyNote,
  Zap,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wand2,
  RefreshCw,
  MessageCircle,
  Loader2,
  Check,
  Smile,
  Plus,
  Trash2,
  X,
  Users,
  Edit2,
  Edit3,
  FileText,
  CreditCard,
  Download,
  ExternalLink,
  GripVertical,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';
import { BACKEND_URL } from '../../services/apiConfig';

export const TeamInbox = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    openChat,
    requestNotificationPermission,
    sendMessage,
    toggleAiForChat,
    setAiForChat,
    addInternalNote,
    updateLeadTag,
    createLead,
    updateLead,
    deleteLead,
    showToast,
    isBroadcastDueModalOpen,
    setIsBroadcastDueModalOpen,
    isBroadcastTemplateModalOpen,
    setIsBroadcastTemplateModalOpen,
    metaConfig,
    currentWorkspaceId,
    currentUser,
    adminViewProfile,
    subscription,
    openCheckout,
    isSuperAdmin,
    selectedClientWorkspace,
    selectClientWorkspace,
    clientTenants,
    getChatCountForWorkspace,
  } = useApp();

  useEffect(() => {
    if (typeof requestNotificationPermission === 'function') {
      requestNotificationPermission().catch(() => {});
    }
  }, [requestNotificationPermission]);

  const [inputMessage, setInputMessage] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeTabSide, setActiveTabSide] = useState('profile'); // profile | notes
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | ai | human | hot
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [isTranslateMenuOpen, setIsTranslateMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // New Contact & Delete Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [formTargetWorkspace, setFormTargetWorkspace] = useState(() => {
    return selectedClientWorkspace && selectedClientWorkspace !== 'all'
      ? selectedClientWorkspace
      : (clientTenants?.[0]?.workspaceId || clientTenants?.[0]?.id || 'b0000000-0000-0000-0000-000000000001');
  });

  useEffect(() => {
    if (selectedClientWorkspace && selectedClientWorkspace !== 'all') {
      setFormTargetWorkspace(selectedClientWorkspace);
    } else if (clientTenants?.length > 0) {
      setFormTargetWorkspace(clientTenants[0].workspaceId || clientTenants[0].id);
    }
  }, [selectedClientWorkspace, clientTenants]);

  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTag, setFormTag] = useState('Interested');
  const [formChannel, setFormChannel] = useState('WhatsApp');
  const [formCity, setFormCity] = useState('');

  // Edit Contact State
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTag, setEditTag] = useState('Interested');
  const [editCity, setEditCity] = useState('');
  const [editDealValue, setEditDealValue] = useState('');
  const [editProduct, setEditProduct] = useState('');

  // Horizontal Resizing State (Left & Right Splitters)
  const [leftWidth, setLeftWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('team_inbox_left_width');
      return saved ? Math.min(Math.max(parseInt(saved, 10) || 320, 220), 550) : 320;
    } catch {
      return 320;
    }
  });

  const [rightWidth, setRightWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('team_inbox_right_width');
      return saved ? Math.min(Math.max(parseInt(saved, 10) || 340, 240), 580) : 340;
    } catch {
      return 340;
    }
  });

  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(null); // 'left' | 'right' | null

  useEffect(() => {
    try {
      localStorage.setItem('team_inbox_left_width', leftWidth);
    } catch {}
  }, [leftWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('team_inbox_right_width', rightWidth);
    } catch {}
  }, [rightWidth]);

  const handleStartResizeLeft = (e) => {
    e.preventDefault();
    setIsDragging('left');
    const startX = e.clientX;
    const startWidth = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(Math.max(startWidth + delta, 220), 550);
      setLeftWidth(nextWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setIsDragging(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleStartResizeRight = (e) => {
    e.preventDefault();
    setIsDragging('right');
    const startX = e.clientX;
    const startWidth = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX; // dragging left expands right sidebar
      const nextWidth = Math.min(Math.max(startWidth + delta, 240), 580);
      setRightWidth(nextWidth);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setIsDragging(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Invoice & Payment Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceName, setInvoiceName] = useState('');
  const [invoicePhone, setInvoicePhone] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceCity, setInvoiceCity] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('DhiGrowth WhatsApp CRM & AI Concierge');
  const [invoiceAmount, setInvoiceAmount] = useState('2499');
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const handleOpenInvoiceModal = () => {
    if (!activeChat) return;
    setInvoiceName(activeChat.contactName || 'Valued Client');
    setInvoicePhone(activeChat.phone || '919791471277');
    setInvoiceEmail(activeChat.email || '');
    setInvoiceCity(activeChat.city || 'Mumbai, IN');
    setInvoiceDesc(activeChat.interestedIn ? `DhiGrowth Service - ${activeChat.interestedIn}` : 'DhiGrowth WhatsApp CRM & AI Concierge');
    setInvoiceAmount(activeChat.dealValue ? activeChat.dealValue.replace(/[^0-9]/g, '') || '2499' : '2499');
    setIsInvoiceModalOpen(true);
  };

  // Broadcast Payment Due Invoices to All Contacts State
  const [broadcastDesc, setBroadcastDesc] = useState('DhiGrowth WhatsApp CRM & AI Business Concierge');
  const [broadcastAmount, setBroadcastAmount] = useState('2499');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSummary, setBroadcastSummary] = useState(null);

  const handleBroadcastDueInvoices = async (e) => {
    e?.preventDefault();
    if (!isSuperAdmin && subscription && subscription.status !== 'active') {
      showToast('🔒 Active subscription required to broadcast invoice dues. Please upgrade your plan.', 'error');
      if (typeof openCheckout === 'function') {
        openCheckout('Growth', 'monthly', 'razorpay');
      }
      return;
    }
    setIsBroadcasting(true);
    setBroadcastSummary(null);

    try {
      const targetContacts = (chats || []).map((c) => ({
        name: c.contactName || 'Valued Client',
        phone: c.phone || '',
        email: c.email || '',
        city: c.city || 'India',
        conversationId: c.conversationId || c.id,
      }));

      const payload = {
        contacts: targetContacts,
        description: broadcastDesc,
        amount: broadcastAmount,
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/invoices/broadcast-due-to-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn('BACKEND_URL failed, falling back to local backend:', e.message);
      }

      // If remote Render hasn't finished deploying new commit (returned 404), fallback to local backend
      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/invoices/broadcast-due-to-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (e) {
          console.warn('Local fallback also failed:', e.message);
        }
      }

      if (!res) {
        throw new Error('Unable to connect to backend server. Please check your connection.');
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Backend is currently deploying latest code on Render. Please wait 1-2 minutes and try again.');
      }

      if (data.success && data.summary) {
        setBroadcastSummary(data.summary);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
        showToast(`🎉 Dispatched Payment Due PDFs to all ${data.summary.dispatched} contacts on WhatsApp!`, 'success');
      } else {
        showToast(data.error || 'Failed to broadcast invoices', 'error');
      }
    } catch (err) {
      showToast('Error broadcasting invoices: ' + err.message, 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCreateAndSendInvoice = async (e) => {
    e?.preventDefault();
    if (!invoicePhone) {
      showToast('Recipient phone number is required', 'error');
      return;
    }
    setIsSendingInvoice(true);
    try {
      const payload = {
        customerName: invoiceName,
        phone: invoicePhone,
        email: invoiceEmail,
        city: invoiceCity,
        description: invoiceDesc,
        amount: invoiceAmount,
        conversationId: activeChat?.conversationId || activeChat?.id,
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.id || 'sri',
        username: currentUser?.username || 'sri',
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/invoices/create-and-send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Remote invoice send failed, trying local fallback:', err.message);
      }

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/invoices/create-and-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.warn('Local fallback also failed:', err.message);
        }
      }

      if (!res) {
        throw new Error('Unable to reach invoice server. Please check backend connection.');
      }

      const data = await res.json();
      if (data.success) {
        const inv = data.invoice;
        const formattedAmount = `INR ${Number(inv.amount).toLocaleString('en-IN')}`;
        const text = `🧾 [INVOICE DUE: ${inv.id}]\nAmount: ${formattedAmount}\nService: ${inv.description}\nPayment Link: ${inv.paymentLink}`;
        sendMessage(text, 'agent');
        setIsInvoiceModalOpen(false);
        showToast(`🧾 Invoice ${inv.id} & Due PDF sent to WhatsApp (${inv.phone})!`, 'success');
      } else {
        showToast(data.error || 'Failed to generate invoice', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to invoice server: ' + err.message, 'error');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleMarkInvoicePaid = async (invoiceId) => {
    setMarkingPaidId(invoiceId);
    try {
      const payload = {
        paymentMethod: 'Manual CRM Confirmation',
        customerName: activeChat?.contactName || 'Valued Client',
        phone: activeChat?.phone || '919791471277',
        email: activeChat?.email || '',
        city: activeChat?.city || 'India',
        description: activeChat?.interestedIn ? `WAPPPILOT Service - ${activeChat.interestedIn}` : 'WAPPPILOT WhatsApp CRM & AI Business Concierge',
        amount: activeChat?.dealValue ? Number(activeChat.dealValue.replace(/[^0-9]/g, '')) || 2499 : 2499,
        conversationId: activeChat?.conversationId || activeChat?.id,
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.id || 'sri',
        username: currentUser?.username || 'sri',
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/invoices/${invoiceId}/mark-paid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn('Remote mark-paid failed, trying local fallback:', e.message);
      }

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/invoices/${invoiceId}/mark-paid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (e) {
          console.warn('Local mark-paid also failed:', e.message);
        }
      }

      if (!res) {
        throw new Error('Could not connect to backend server. Please check connection.');
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Backend is currently updating. Please try again in a few seconds.');
      }

      if (data.success) {
        const inv = data.invoice;
        const formattedAmount = `INR ${Number(inv.amount).toLocaleString('en-IN')}`;
        const receiptText = `✅ [PAYMENT RECEIVED: ${inv.id}]\nAmount: ${formattedAmount}\nTransaction ID: ${inv.transactionId}\nReceipt PDF sent to customer.`;
        sendMessage(receiptText, 'agent');
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        } catch {}
        showToast(`✅ Invoice ${inv.id} paid! Customer received Paid Receipt PDF on WhatsApp.`, 'success');
      } else {
        showToast(data.error || 'Failed to mark invoice paid', 'error');
      }
    } catch (err) {
      showToast('Failed to mark paid: ' + err.message, 'error');
    } finally {
      setMarkingPaidId(null);
    }
  };


  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isMobileContactPickerOpen, setIsMobileContactPickerOpen] = useState(false);

  // On desktop: if activeChatId is null, default to first chat so middle pane isn't blank
  // On mobile: if activeChatId is null, user is viewing the contact list!
  const activeChat = isMobileView
    ? (activeChatId ? chats.find((c) => c.id === activeChatId) : null)
    : (chats.find((c) => c.id === activeChatId) || (chats.length > 0 ? chats[0] : null));

  const currentChatIndex = chats.findIndex((c) => c.id === activeChat?.id);
  const hasPrevChat = currentChatIndex > 0;
  const hasNextChat = currentChatIndex >= 0 && currentChatIndex < chats.length - 1;

  const handlePrevChat = () => {
    if (hasPrevChat) {
      const prev = chats[currentChatIndex - 1];
      if (openChat) openChat(prev.id);
      else setActiveChatId(prev.id);
    }
  };

  const handleNextChat = () => {
    if (hasNextChat) {
      const next = chats[currentChatIndex + 1];
      if (openChat) openChat(next.id);
      else setActiveChatId(next.id);
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, activeChatId]);

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

  const filteredChats = [...(chats || [])]
    .filter((chat) => {
      if (statusFilter === 'ai' && !chat.aiHandled) return false;
      if (statusFilter === 'human' && chat.aiHandled) return false;
      if (statusFilter === 'hot' && chat.tag !== 'Hot') return false;
      if (
        searchTerm &&
        !chat.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !chat.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  const [isSendingLive, setIsSendingLive] = useState(false);
  const isAiAutoPilot = Boolean(activeChat?.aiHandled);
  const agentMode = isAiAutoPilot ? 'ai' : 'manual';

  // Sri User & New Contact Check (Exclusive first-time template trigger)
  const isSriUser = Boolean(
    currentUser?.username?.toLowerCase() === 'sri' ||
    currentUser?.slug?.toLowerCase() === 'sri' ||
    currentUser?.email?.toLowerCase().includes('sri') ||
    currentUser?.name?.toLowerCase().includes('sri') ||
    (currentUser?.isAdmin && adminViewProfile === 'sri')
  );

  const hasCustomerReplied = (activeChat?.messages || []).some(
    (m) => m.sender === 'user' || m.direction === 'inbound'
  );
  const isNewContact = Boolean(activeChat && !hasCustomerReplied);

  const [isTemplateSendModalOpen, setIsTemplateSendModalOpen] = useState(false);
  const [isSendingTemplate, setIsSendingTemplate] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState('hello_world');
  const [templateOptions, setTemplateOptions] = useState([
    {
      name: 'hello_world',
      title: 'hello_world (Meta Verified Sample - Ready to Send)',
      category: 'utility',
      status: 'approved',
      body_text: `Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.`,
    },
    {
      name: 'hi',
      title: 'hi (Official Starter Greeting)',
      category: 'utility',
      status: 'approved',
      body_text: `👋 *Hello {{1}}!*\n\nWelcome to *DhiGrowth IT Services* 🚀\n\nWe help businesses grow with powerful digital solutions:\n• WhatsApp Business API & AI Auto-Reply 💬\n• Custom Mobile & Web App Development 📱\n• Billing & Automated Invoicing CRM 🧾\n• SEO & Performance Marketing 📈\n\n👉 Let us know your requirement or reply with *YES* to talk with our team!\n\nReply to this message to start chatting with us.`,
    },
    {
      name: 'service_inquiry_starter',
      title: 'service_inquiry_starter (Business Solutions Starter)',
      category: 'marketing',
      status: 'approved',
      body_text: `Hi {{1}}! Thanks for connecting with DhiGrowth. We specialize in {{2}}. Explore our portfolio at {{3}} or reply to this message to connect directly!`,
    },
  ]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/templates?workspaceId=${currentWorkspaceId || 'default'}`);
        } catch {}
        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/templates?workspaceId=${currentWorkspaceId || 'default'}`);
          } catch {}
        }
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTemplateOptions(data);
          }
        }
      } catch (err) {
        console.warn('Could not load templates list:', err);
      }
    };
    loadTemplates();
  }, [currentWorkspaceId]);

  const currentSelectedTemplate =
    templateOptions.find((t) => t.name === selectedTemplateName) || templateOptions[0];
  const previewBody = (currentSelectedTemplate?.body_text || '')
    .replaceAll('{{1}}', activeChat?.contactName || 'Valued Client')
    .replaceAll('{{2}}', 'IT & AI Business Solutions')
    .replaceAll('{{3}}', 'https://dhigrowth.com');

  const handleSendFirstTemplate = async () => {
    if (!activeChat) return;
    const recipientPhone = activeChat.phone;
    if (!recipientPhone) {
      showToast('Recipient phone number is required to send template', 'error');
      return;
    }

    setIsSendingTemplate(true);
    try {
      const templateName = selectedTemplateName || 'hi';
      const contactName = activeChat.contactName || 'Valued Client';
      const conversationId = activeChat.conversationId || activeChat.id;
      const workspaceId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';

      const templatePayload = {
        recipientPhone,
        templateName,
        contactName,
        conversationId,
        workspaceId,
      };

      let success = false;
      let sentBody =
        previewBody ||
        `👋 *Hello ${contactName}!* Welcome to *DhiGrowth IT Services* 🚀\n\nReply to this message to start chatting with us.`;

      // 1. Primary: Dedicated template endpoint on configured BACKEND_URL
      try {
        const res = await fetch(`${BACKEND_URL}/api/send-template-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templatePayload),
        });
        if (res.ok) {
          const raw = await res.text();
          try {
            const data = JSON.parse(raw);
            if (data.success) {
              success = true;
              if (data.resolvedText) sentBody = data.resolvedText;
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Primary template send attempt:', err.message);
      }

      // 2. If not succeeded, try localhost:4000 if accessible
      if (!success) {
        try {
          const resLocal = await fetch('http://localhost:4000/api/send-template-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templatePayload),
          });
          if (resLocal.ok) {
            const raw = await resLocal.text();
            try {
              const dataLocal = JSON.parse(raw);
              if (dataLocal.success) {
                success = true;
                if (dataLocal.resolvedText) sentBody = dataLocal.resolvedText;
              }
            } catch {}
          }
        } catch {}
      }

      // 3. Fallback: Broadcast test-send endpoint (active on live Render production gateway)
      if (!success) {
        try {
          const resTest = await fetch(`${BACKEND_URL}/api/broadcasts/test-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: recipientPhone,
              templateName,
              sampleContact: { name: contactName },
              workspaceId,
              variableMapping: [
                { index: 1, field: 'name', fallback: contactName },
                { index: 2, field: 'custom', fallback: 'IT & AI Business Solutions' },
                { index: 3, field: 'link', fallback: 'https://dhigrowth.com' },
              ],
            }),
          });
          if (resTest.ok) {
            const raw = await resTest.text();
            try {
              const dataTest = JSON.parse(raw);
              if (dataTest.success) {
                success = true;
                if (dataTest.resolvedPreview) sentBody = dataTest.resolvedPreview;
              }
            } catch {}
          }
        } catch (err) {
          console.warn('Broadcast test-send fallback:', err.message);
        }
      }

      // 4. Direct message fallback (works across all Render & local deployments)
      if (!success) {
        try {
          const resManual = await fetch(`${BACKEND_URL}/api/send-manual-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientPhone,
              text: sentBody,
              conversationId,
              workspaceId,
            }),
          });
          if (resManual.ok) {
            const raw = await resManual.text();
            try {
              const dataManual = JSON.parse(raw);
              if (dataManual.success || dataManual.deliveredToWhatsApp) {
                success = true;
              }
            } catch {}
          }
        } catch (err) {
          console.warn('Manual send fallback:', err.message);
        }
      }

      if (success) {
        sendMessage(`📋 [TEMPLATE: ${templateName}]\n${sentBody}`, 'agent');
        setIsTemplateSendModalOpen(false);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        } catch {}
        showToast(
          `✨ Template "${templateName}" dispatched to ${recipientPhone} on WhatsApp! Awaiting customer reply to open 24h window.`,
          'success'
        );
      } else {
        // If all network dispatches fail (e.g. completely offline), log to conversation stream
        sendMessage(`📋 [TEMPLATE: ${templateName}]\n${sentBody}`, 'agent');
        setIsTemplateSendModalOpen(false);
        showToast(`📋 Template saved to chat timeline. Check WhatsApp connection if message is delayed.`, 'info');
      }
    } catch (err) {
      showToast('Error sending template: ' + err.message, 'error');
    } finally {
      setIsSendingTemplate(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    if (!isSuperAdmin && subscription && subscription.status !== 'active') {
      showToast('🔒 Active subscription required to send outbound WhatsApp messages. Please choose a plan to unlock full messaging.', 'error');
      if (typeof openCheckout === 'function') {
        openCheckout('Growth', 'monthly', 'razorpay');
      }
      return;
    }

    if (isNewContact) {
      showToast('⚠️ New contact: Meta policy requires sending an Approved Template to initiate chat and open the 24h window.', 'info');
      setSelectedTemplateName('hello_world');
      setIsTemplateSendModalOpen(true);
      return;
    }

    setInputMessage('');
    setIsSendingLive(true);

    // 1. Immediately append to chat in UI as Human Support Agent
    sendMessage(text, 'agent');

    // 2. Dispatch to live Meta WhatsApp Cloud API via server endpoint
    try {
      const recipient = activeChat.phone || '919791471277';
      const payload = {
        recipientPhone: recipient,
        text: text,
        conversationId: activeChat.conversationId || activeChat.id,
        channelType: activeChat.channel || 'whatsapp',
        phoneNumberId: metaConfig?.phoneNumberId,
        accessToken: metaConfig?.accessToken,
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

      const data = res ? await res.json() : {};
      if (data.deliveredToWhatsApp) {
        showToast(`🚀 Delivered to ${recipient} on WhatsApp!`, 'success');
      } else if (data.errorDetails) {
        if (data.errorDetails.code === 190) {
          showToast(`⚠️ Meta Token Expired: Your 24-hour temporary access token has expired on Meta. Please generate a renewed or Permanent System User Token in Profile Settings.`, 'error');
        } else if (data.errorDetails.code === 131047) {
          showToast(`⚠️ 24-Hour Window Closed: Customer hasn't replied in 24 hours. Please send an Approved Template (e.g. hello_world) to re-engage.`, 'error');
        } else if (data.errorDetails.code === 131030) {
          showToast(`⚠️ Meta Sandbox Recipient: ${recipient} is not in your Meta Allowed Recipients list. Add it in Meta Developers -> WhatsApp -> API Setup.`, 'error');
        } else {
          showToast(`⚠️ Meta API (${data.errorDetails.code || 'Error'}): ${data.errorDetails.details || data.errorDetails.message}`, 'error');
        }
      } else {
        showToast(`Sent manually as Support Agent`, 'success');
      }
    } catch (err) {
      console.warn('Manual send note:', err);
      showToast(`Sent manually as Support Agent`, 'success');
    } finally {
      setIsSendingLive(false);
    }
  };

  const handleUserSimulatorSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage, 'user');
    setInputMessage('');
  };

  // 1. AI Reply Generator (Connects to Live Gemini AI Engine)
  const handleGenerateAiReply = async () => {
    setIsGeneratingAi(true);
    const messages = activeChat?.messages || [];
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || activeChat?.lastMessage || 'I want to know more';

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerMessage: lastUserMsg,
            customerName: activeChat?.contactName || 'Valued Client',
            channelType: activeChat?.channel || 'whatsapp',
          }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerMessage: lastUserMsg,
              customerName: activeChat?.contactName || 'Valued Client',
              channelType: activeChat?.channel || 'whatsapp',
            }),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          setInputMessage(data.reply);
          showToast('✨ AI smart response drafted with Gemini!', 'success');
          return;
        }
      }

      // Fallback if offline
      let aiDraft = `Hi ${activeChat?.contactName || 'there'}! Welcome to DhiGrowth IT Services. How can our AI & IT team assist your business today? 🚀`;
      setInputMessage(aiDraft);
      showToast('✨ AI response drafted!', 'success');
    } catch (err) {
      console.warn('AI draft error:', err);
      showToast('Failed to draft with AI: ' + err.message, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper for real-time translation
  const translateText = async (text, targetLangCode = 'hi') => {
    if (!text || !text.trim()) return '';

    // 1. Try local Node backend endpoint
    try {
      const res = await fetch('http://localhost:4000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), targetLang: targetLangCode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) return data.translatedText;
      }
    } catch (err) {
      console.warn('[Translate] Local endpoint error, falling back to direct:', err);
    }

    // 2. Direct browser fallback via Google Translate API
    try {
      const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text.trim())}`;
      const resp = await fetch(directUrl);
      const json = await resp.json();
      return json[0].map((s) => s[0]).join('');
    } catch (err) {
      console.error('[Translate] Direct API error:', err);
      throw err;
    }
  };

  // 1. Translate Draft inside editor so user can review/edit
  const handleTranslateDraft = async (langName = selectedLanguage) => {
    const text = inputMessage.trim();
    if (!text) {
      showToast(`Type a message in the box first to translate into ${langName}`, 'info');
      return;
    }

    const target = LANGUAGES.find((l) => l.name === langName) || LANGUAGES[0];
    setIsTranslating(true);
    try {
      const translated = await translateText(text, target.code);
      setInputMessage(translated);
      setSelectedLanguage(target.name);
      showToast(`🌐 Translated to ${target.name}!`, 'success');
    } catch (err) {
      console.error('Translation error:', err);
      showToast('Translation error. Please check your connection.', 'error');
    } finally {
      setIsTranslating(false);
      setIsTranslateMenuOpen(false);
    }
  };

  // 2. Translate and Send directly to WhatsApp & Supabase
  const handleTranslateAndSend = async (langName = selectedLanguage) => {
    const text = inputMessage.trim();
    if (!text) {
      showToast(`Type a message in the box first to translate & send in ${langName}`, 'info');
      return;
    }

    const target = LANGUAGES.find((l) => l.name === langName) || LANGUAGES[0];
    setIsTranslating(true);
    setIsSendingLive(true);
    try {
      const translated = await translateText(text, target.code);
      setInputMessage('');
      setIsTranslateMenuOpen(false);

      // 1. Immediately append to chat in UI as Human Support Agent
      sendMessage(translated, 'agent');

      // 2. Dispatch to live Meta WhatsApp Cloud API via server endpoint
      const recipient = activeChat?.phone || '919791471277';
      const payload = {
        recipientPhone: recipient,
        text: translated,
        conversationId: activeChat?.conversationId || activeChat?.id,
        channelType: activeChat?.channel || 'whatsapp',
        phoneNumberId: metaConfig?.phoneNumberId,
        accessToken: metaConfig?.accessToken,
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

      const data = res ? await res.json() : {};
      if (data.deliveredToWhatsApp) {
        showToast(`🚀 Translated to ${target.name} & delivered to WhatsApp!`, 'success');
      } else if (data.errorDetails) {
        if (data.errorDetails.code === 131030) {
          showToast(`⚠️ Meta Error: ${recipient} is not in your Meta Allowed Recipients list. Add it in Meta Developers -> WhatsApp -> API Setup.`, 'error');
        } else {
          showToast(`⚠️ Meta API: ${data.errorDetails.details || data.errorDetails.message}`, 'error');
        }
      } else {
        showToast(`🌐 Translated to ${target.name} & sent!`, 'success');
      }
    } catch (err) {
      console.error('Translate & send error:', err);
      showToast('Failed to translate and dispatch message', 'error');
    } finally {
      setIsTranslating(false);
      setIsSendingLive(false);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addInternalNote(activeChat.id, noteInput);
    setNoteInput('');
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await createLead({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        tag: formTag,
        city: formCity.trim() || 'Mumbai, IN',
        channel: formChannel.toLowerCase(),
        workspaceId: isSuperAdmin ? formTargetWorkspace : currentWorkspaceId,
      });
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormCity('');
      setIsAddContactModalOpen(false);
    } catch (err) {
      console.error('Error adding contact:', err);
      showToast('Error saving contact to database', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(contactToDelete.id);
      setContactToDelete(null);
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast('Error deleting contact from database', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditModal = (chat = activeChat) => {
    if (!chat) return;
    setEditName(chat.contactName || '');
    setEditPhone(chat.phone || '');
    setEditEmail(chat.email || '');
    setEditTag(chat.tag || 'Interested');
    setEditCity(chat.city || chat.attributes?.city || 'Mumbai, IN');
    setEditDealValue(chat.dealValue || chat.attributes?.budget || '₹2,499');
    setEditProduct(chat.attributes?.product || 'General inquiry');
    setIsEditContactModalOpen(true);
  };

  const handleSaveContactEdit = async (e) => {
    e.preventDefault();
    if (!activeChat || !editName.trim() || !editPhone.trim()) return;

    setIsUpdatingContact(true);
    try {
      await updateLead(activeChat.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        tag: editTag,
        city: editCity.trim(),
        dealValue: editDealValue.trim(),
        attributes: {
          budget: editDealValue.trim(),
          city: editCity.trim(),
          product: editProduct.trim(),
        },
      });
      setIsEditContactModalOpen(false);
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast('Error updating contact details', 'error');
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const channelIcons = {
    whatsapp: <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-full font-mono">WhatsApp</span>,
    instagram: <span className="text-[10px] font-bold bg-[#FCE7F3] text-[#DB2777] px-2 py-0.5 rounded-full font-mono">Instagram</span>,
    messenger: <span className="text-[10px] font-bold bg-[#DBEAFE] text-[#2563EB] px-2 py-0.5 rounded-full font-mono">Messenger</span>,
  };

  const tagColors = {
    Hot: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    Interested: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    Cold: 'bg-[#F1F5F9] text-[#475467] border-[#E2E8F0]',
    Converted: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  };

  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden bg-[#F8F9FC] font-sans">
      {/* Mobile Top Contact Quick Switch Bar (Thumb Carousel) */}
      <div className="md:hidden bg-white border-b border-[#EAECF0] px-3 py-2 shrink-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="text-[11px] font-bold text-[#101828]">Switch User / Contact ({chats.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddContactModalOpen(true)}
            className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {chats.map((chat) => {
            const isSelected = activeChat?.id === chat.id;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => {
                  if (openChat) openChat(chat.id);
                  else setActiveChatId(chat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 transition-all cursor-pointer border active:scale-95 text-left ${
                  isSelected
                    ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-bold shadow-xs ring-2 ring-[#0284C7]/20'
                    : 'bg-[#F9FAFB] border-[#EAECF0] text-[#344054] hover:bg-[#F2F4F7]'
                }`}
              >
                <div className="relative shrink-0">
                  <ContactAvatar name={chat.contactName} size="xs" />
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white" />
                  )}
                </div>
                <span className="text-xs truncate max-w-[90px]">
                  {chat.contactName}
                </span>
                {chat.tag && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${tagColors[chat.tag]}`}>
                    {chat.tag[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 1. Left: Conversation List */}
        <div
          style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : `${leftWidth}px` }}
          className={`border-r border-[#EAECF0] bg-white flex flex-col shrink-0 min-h-0 relative select-text w-full md:w-auto ${
            activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
        {/* Header & New Contact & Search */}
        <div className="p-3.5 border-b border-[#EAECF0] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#101828]">Messages</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0F9FF] text-[#0284C7] font-mono font-bold">
                {chats.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Contact</span>
            </button>
          </div>

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
                  {clientTenants.map((client) => {
                    const wsId = client.workspaceId || client.id;
                    const count = getChatCountForWorkspace(wsId);
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

          {/* Quick Broadcast Actions (2-column responsive pills) */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setBroadcastSummary(null);
                setIsBroadcastDueModalOpen(true);
              }}
              className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] px-2 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs group min-w-0"
              title="Send Payment Due PDF with payment link to all WhatsApp contacts"
            >
              <Zap className="w-3.5 h-3.5 text-[#0284C7] group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Send Due to All</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBroadcastTemplateModalOpen(true)}
              className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] px-2 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs group min-w-0"
              title="Send interactive template with Yes reply button to all WhatsApp contacts"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7] group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Send Template (Yes)</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search leads, phone, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-8.5 pr-3 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { id: 'all', label: 'All Threads' },
              { id: 'ai', label: '🤖 AI Handled' },
              { id: 'human', label: '👤 Agent' },
              { id: 'hot', label: '🔥 Hot Leads' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#0284C7] text-white font-semibold'
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
          {filteredChats.map((chat) => {
            const isSelected = chat.id === activeChatId;
            const messages = chat.messages || [];
            const lastMsg = messages[messages.length - 1];
            return (
              <div
                key={chat.id}
                onClick={() => (openChat ? openChat(chat.id) : setActiveChatId(chat.id))}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#F0F9FF] border-l-4 border-l-[#0284C7]'
                    : chat.unreadCount > 0
                    ? 'bg-[#F0FDF4]/50 hover:bg-[#F0FDF4]'
                    : 'hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="relative shrink-0">
                  <ContactAvatar name={chat.contactName} size="md" />
                  {chat.aiHandled ? (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#0284C7] rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-xs" title="AI Auto-Pilot On">
                      🤖
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-xs" title="Human Agent Active">
                      👤
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs ${chat.unreadCount > 0 ? 'font-black text-[#101828]' : 'font-bold text-[#101828]'} truncate`}>
                      {chat.contactName}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#16A34A] text-white text-[9px] font-extrabold font-mono shadow-xs animate-pulse">
                          {chat.unreadCount} new
                        </span>
                      )}
                      <span className={`text-[10px] ${chat.unreadCount > 0 ? 'text-[#16A34A] font-bold' : 'text-[#98A2B3]'} font-mono`}>
                        {chat.lastSeen}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs truncate line-clamp-1 ${chat.unreadCount > 0 ? 'font-semibold text-[#101828]' : 'text-[#475467]'}`}>
                    {lastMsg ? lastMsg.text : 'New lead inbound'}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    {channelIcons[chat.channel] || channelIcons.whatsapp}
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                        tagColors[chat.tag] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {chat.tag}
                    </span>
                    {chat.dealValue && (
                      <span className="text-[9px] font-mono text-[#16A34A] font-bold ml-auto">
                        {chat.dealValue}
                      </span>
                    )}
                  </div>

                  {isSuperAdmin && (chat.clientProfileName || chat.clientCompanyName) && (
                    <div className="pt-1">
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
          })}

          {filteredChats.length === 0 && (
            <div className="p-6 text-center text-xs text-[#98A2B3] flex flex-col items-center justify-center h-52 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#98A2B3]">
                <MessageCircle className="w-5 h-5 text-[#98A2B3]" />
              </div>
              <div>
                <p className="font-semibold text-[#344054]">No conversations yet</p>
                <p className="text-[11px] text-[#667085] mt-0.5">Messages in this workspace will appear here</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
              >
                + Add your first contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Resizer: Between Messages List & Chat */}
      <div
        onMouseDown={handleStartResizeLeft}
        onDoubleClick={() => setLeftWidth(320)}
        title="Drag horizontally to resize Messages sidebar (Double-click to reset to 320px)"
        className={`hidden md:flex w-1.5 hover:w-2 transition-all cursor-col-resize select-none shrink-0 z-10 items-center justify-center group relative ${
          isDragging === 'left' ? 'bg-[#0284C7] w-2' : 'bg-[#EAECF0] hover:bg-[#0284C7]/70'
        }`}
      >
        <div className="w-0.5 h-7 rounded-full bg-[#98A2B3] group-hover:bg-white transition-colors" />
      </div>

      {/* 2. Center: Chat Conversation Window */}
      <div className={`flex-1 flex flex-col bg-[#F8F9FC] min-w-0 md:min-w-[320px] h-full min-h-0 ${!activeChat ? 'hidden md:flex' : 'flex w-full'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8F9FC] space-y-3 min-h-0">
            <div className="w-16 h-16 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#98A2B3]">
              <MessageCircle className="w-8 h-8 text-[#98A2B3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#101828]">No active conversation</h3>
              <p className="text-xs text-[#667085] max-w-sm">
                Select a conversation thread from the left or create a new contact to start chatting.
              </p>
            </div>
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="mt-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Contact</span>
            </button>
          </div>
        ) : (
          <>
            {/* Chat Top Header */}
            <div className="h-16 border-b border-[#EAECF0] bg-white px-3 sm:px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Back to Contacts Button */}
                <button
                  type="button"
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden p-2 -ml-1 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Back to conversations list"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5 text-[#344054]" />
                </button>

                {/* Contact Avatar & Info (Tap on mobile to open quick switch modal) */}
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                  onClick={() => setIsMobileContactPickerOpen(true)}
                  title="Tap to switch user / contact"
                >
                  <ContactAvatar name={activeChat.contactName} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h2 className="text-sm font-bold text-[#101828] truncate group-hover:text-[#0284C7] transition-colors">
                        {activeChat.contactName}
                      </h2>
                      <ChevronDown className="w-3.5 h-3.5 text-[#0284C7] md:hidden shrink-0" />
                      <span className="hidden sm:inline text-xs font-mono text-[#667085]">
                        {activeChat.phone}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${tagColors[activeChat.tag]}`}>
                        {activeChat.tag}
                      </span>
                      {isSuperAdmin && (activeChat.clientProfileName || activeChat.clientCompanyName) && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full shadow-2xs">
                          <span>🏢</span>
                          <span className="truncate max-w-[160px]">
                            {activeChat.clientProfileName || 'Client'}{activeChat.clientCompanyName ? ` · ${activeChat.clientCompanyName}` : ''}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#98A2B3] flex items-center gap-2 mt-0.5">
                      <span>{activeChat.city}</span>
                      <span>·</span>
                      <span className={`font-mono font-semibold flex items-center gap-1.5 ${isAiAutoPilot ? 'text-[#0284C7]' : 'text-[#16A34A]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAiAutoPilot ? 'bg-[#0284C7] animate-pulse' : 'bg-[#16A34A]'}`} />
                        <span className="truncate max-w-[120px] sm:max-w-none">{isAiAutoPilot ? 'AI Auto-Pilot' : 'Manual Agent'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Next / Previous User Arrows */}
                <div className="md:hidden flex items-center bg-[#F2F4F7] rounded-xl p-0.5 border border-[#EAECF0] shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={handlePrevChat}
                    disabled={!hasPrevChat}
                    className="p-1 rounded-lg text-[#344054] hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90"
                    title="Previous User"
                    aria-label="Previous User"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileContactPickerOpen(true)}
                    className="text-[10px] font-mono font-bold px-1.5 text-[#0284C7] hover:underline"
                    title="Tap to pick contact"
                  >
                    {currentChatIndex >= 0 ? `${currentChatIndex + 1}/${chats.length}` : 'Switch'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextChat}
                    disabled={!hasNextChat}
                    className="p-1 rounded-lg text-[#344054] hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90"
                    title="Next User"
                    aria-label="Next User"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Sri Exclusive: Send First Template to New Contact */}
                {isSriUser && isNewContact && (
                  <button
                    type="button"
                    onClick={() => setIsTemplateSendModalOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer bg-[#0284C7] hover:bg-[#0369A1] text-white animate-pulse shrink-0"
                    title="Sri Exclusive: Send approved Meta template to new contact to get their first reply and open 24h window"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send First Template</span>
                    <span className="sm:hidden">Template</span>
                  </button>
                )}

                {/* AI Auto-Pilot Switch */}
                <button
                  onClick={() => toggleAiForChat(activeChat.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                    isAiAutoPilot
                      ? 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] hover:bg-[#E0F2FE]'
                      : 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] hover:bg-[#D1FAE5]'
                  }`}
                  title={isAiAutoPilot ? "Click to switch to Manual Agent (Turn off AI auto-reply)" : "Click to switch to AI Auto-Pilot (Turn on AI auto-reply)"}
                >
                  {isAiAutoPilot ? <Bot className="w-3.5 h-3.5 text-[#0284C7]" /> : <User className="w-3.5 h-3.5 text-[#16A34A]" />}
                  <span className="hidden sm:inline">{isAiAutoPilot ? 'AI Auto-Pilot ON' : 'Manual Agent Active'}</span>
                </button>

                {/* Toggle Lead Intelligence Panel */}
                <button
                  onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                  className="hidden xl:flex p-2 rounded-xl border border-[#EAECF0] bg-white text-[#667085] hover:text-[#0284C7] hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all cursor-pointer shadow-2xs items-center justify-center shrink-0"
                  title={isRightCollapsed ? 'Expand Lead Intelligence Panel' : 'Collapse Lead Intelligence Panel'}
                >
                  {isRightCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
                </button>
              </div>
            </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3.5 min-h-0">
          {/* Sri Exclusive: New Contact First-Time Outreach Banner */}
          {isSriUser && isNewContact && (
            <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border-2 border-[#BAE6FD] rounded-2xl p-4 shadow-sm mb-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#101828]">New Contact Outreach · Awaiting Customer Reply</h4>
                      <span className="text-[10px] font-mono bg-[#F0F9FF] text-[#0284C7] font-bold px-2 py-0.5 rounded-full border border-[#BAE6FD]">
                        Sri Exclusive
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                      <strong>{activeChat.contactName}</strong> has not sent an inbound reply yet. Meta policy requires an approved template to initiate contact. Send the <strong>hello_world</strong> approved template to get their first inbound reply and unlock the 24-hour conversational window!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateName('hello_world');
                      setIsTemplateSendModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Approved Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {(activeChat.messages || []).map((msg) => {
            const isUser = msg.sender === 'user';
            const isAi = msg.sender === 'ai';
            const text = msg.text || '';
            const isInvoiceDue = text.includes('[INVOICE DUE:') || msg.type === 'invoice';
            const isPaymentReceived = text.includes('[PAYMENT RECEIVED:') || msg.type === 'receipt';

            let invoiceId = null;
            if (isInvoiceDue) {
              const match = text.match(/\[INVOICE DUE:\s*([A-Za-z0-9_-]+)\]/);
              if (match) invoiceId = match[1];
            } else if (isPaymentReceived) {
              const match = text.match(/\[PAYMENT RECEIVED:\s*([A-Za-z0-9_-]+)\]/);
              if (match) invoiceId = match[1];
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-start mr-auto' : 'items-end ml-auto'} max-w-[85%] sm:max-w-md`}
              >
                {isInvoiceDue ? (
                  <div className="bg-white border-2 border-[#BAE6FD] rounded-2xl p-4 shadow-sm space-y-3 w-full text-left font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-[#F0F9FF] pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                          <FileText className="w-4 h-4 text-[#0284C7]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#101828]">Invoice Due PDF</div>
                          <div className="text-[10px] font-mono text-[#0284C7] font-bold">{invoiceId || 'INV'}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                        PAYMENT DUE
                      </span>
                    </div>

                    <p className="text-xs text-[#344054] whitespace-pre-line leading-relaxed">
                      {text.replace(/🧾\s*\[INVOICE DUE:[^\]]+\]\n?/, '')}
                    </p>

                    <div className="space-y-2 pt-1 border-t border-[#F2F4F7]">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`http://localhost:4000/api/invoices/${invoiceId || 'sample'}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] rounded-xl text-[11px] font-bold transition-all text-center"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </a>
                        <a
                          href={`http://localhost:4000/invoices/${invoiceId || 'sample'}/pay`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-[11px] font-bold transition-all text-center shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Pay Page</span>
                        </a>
                      </div>

                      {invoiceId && (
                        <button
                          type="button"
                          disabled={markingPaidId === invoiceId}
                          onClick={() => handleMarkInvoicePaid(invoiceId)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-75"
                          title="Confirm payment received and instantly send Paid Receipt PDF to WhatsApp"
                        >
                          {markingPaidId === invoiceId ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending Receipt PDF to WhatsApp...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Paid & Send Receipt PDF</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : isPaymentReceived ? (
                  <div className="bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-2xl p-4 shadow-sm space-y-3 w-full text-left font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-[#DCFCE7] pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D]">
                          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#14532D]">Payment Confirmed</div>
                          <div className="text-[10px] font-mono text-[#15803D] font-bold">{invoiceId || 'PAID'}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                        ✓ PAID RECEIPT
                      </span>
                    </div>

                    <p className="text-xs text-[#166534] whitespace-pre-line leading-relaxed">
                      {text.replace(/✅\s*\[PAYMENT RECEIVED:[^\]]+\]\n?/, '')}
                    </p>

                    <a
                      href={`http://localhost:4000/api/invoices/${invoiceId || 'sample'}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-[11px] font-bold transition-all text-center shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Paid Tax Receipt PDF</span>
                    </a>
                  </div>
                ) : (
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-white border border-[#EAECF0] text-[#101828] rounded-tl-xs'
                        : isAi
                        ? 'bg-[#F0F9FF] border border-[#BAE6FD] text-[#101828] rounded-tr-xs'
                        : 'bg-[#0284C7] text-white rounded-tr-xs'
                    }`}
                  >
                    {isAi && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#0284C7] font-bold mb-1.5 pb-1 border-b border-[#BAE6FD]">
                        <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Dhigrowth AI Auto-Pilot</span>
                      </div>
                    )}

                    {!isUser && !isAi && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-sky-200 font-bold mb-1 pb-1 border-b border-sky-400/30">
                        <User className="w-3.5 h-3.5" />
                        <span>Support Agent</span>
                      </div>
                    )}

                    {/* Image Attachment (WhatsApp Media Header) */}
                    {Boolean(msg.media_url || msg.mediaUrl || msg.imageUrl) && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-black/5 max-w-sm">
                        <img
                          src={msg.media_url || msg.mediaUrl || msg.imageUrl}
                          alt="Media Attachment"
                          className="w-full h-auto max-h-52 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(msg.media_url || msg.mediaUrl || msg.imageUrl, '_blank')}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {text === '[interactive attachment]' || text === "Yes, I'm interested" ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="whitespace-pre-line font-medium text-xs">Yes, I'm interested</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                          🔘 Button Tap
                        </span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{text}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#98A2B3] font-mono">
                  <span>{msg.time}</span>
                  {!isUser && (
                    msg.status === 'failed' ? (
                      <span className="flex items-center gap-0.5 text-[#DC2626] font-bold" title={msg.error || 'Failed to deliver'}>
                        <AlertCircle className="w-3 h-3 text-[#DC2626]" />
                        <span>Failed</span>
                      </span>
                    ) : msg.status === 'read' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-[#0284C7]" title="Read by recipient" />
                    ) : msg.status === 'delivered' || msg.status === 'received' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" title="Delivered / Received" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#98A2B3]" title="Sent to WhatsApp" />
                    )
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer & Multi-Channel Action Bar */}
        <div className="p-3 lg:p-4 border-t border-[#EAECF0] bg-white shrink-0 space-y-2.5">
          {/* Top Bar: Mode Selector & Quick AI Chips */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Manual vs AI Mode Toggle */}
              <div className="inline-flex p-0.5 bg-[#F2F4F7] rounded-lg border border-[#EAECF0] shrink-0">
                <button
                  type="button"
                  onClick={() => setAiForChat(activeChat.id, false)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    !isAiAutoPilot
                      ? 'bg-white text-[#16A34A] border border-[#BBF7D0] shadow-xs'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                  title="Manual Agent: You reply manually. AI auto-reply is turned OFF."
                >
                  <User className="w-3 h-3 text-[#16A34A]" />
                  <span>Manual Agent</span>
                  {!isAiAutoPilot && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setAiForChat(activeChat.id, true)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAiAutoPilot
                      ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                  title="AI Auto-Pilot: AI automatically answers incoming questions."
                >
                  <Bot className="w-3 h-3 text-[#0284C7]" />
                  <span>AI Auto-Pilot</span>
                  {isAiAutoPilot && <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />}
                </button>
              </div>

              {/* Active Channel & Recipient Badge */}
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#DCFCE7]/70 border border-[#BBF7D0] text-[#16A34A] text-[11px] font-medium font-mono truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse shrink-0"></span>
                <span className="truncate">WhatsApp Live · {activeChat.phone}</span>
              </div>
            </div>

            {/* Quick Actions & AI Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {/* Sri Exclusive: First Template Send Button */}
              {isSriUser && isNewContact && (
                <button
                  type="button"
                  onClick={() => setIsTemplateSendModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-xs ring-2 ring-sky-300 animate-pulse"
                  title="Sri Exclusive: Send template to new contact to get first reply"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Send First Template</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenInvoiceModal}
                className="px-2.5 py-1 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Create and send official Payment Due PDF with payment link to WhatsApp"
              >
                <FileText className="w-3 h-3" />
                <span>Send Invoice PDF</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAiReply}
                disabled={isGeneratingAi}
                className="px-2.5 py-1 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] hover:border-[#0284C7] text-[#0284C7] text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                title="Auto-draft response with AI"
              >
                <Sparkles className="w-3 h-3 text-[#0284C7]" />
                <span>{isGeneratingAi ? 'Drafting...' : 'AI Draft'}</span>
              </button>


              <button
                type="button"
                onClick={() => setInputMessage('Yes please, confirmed COD order for Bandra West.')}
                className="px-2.5 py-1 rounded-full bg-[#F9FAFB] border border-[#EAECF0] hover:border-[#0284C7] text-[#475467] hover:text-[#0284C7] text-[11px] shrink-0 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                📦 COD Confirm
              </button>

              <button
                type="button"
                onClick={() => setInputMessage('Use promo code LAUNCH10 for an extra 10% off today!')}
                className="px-2.5 py-1 rounded-full bg-[#F9FAFB] border border-[#EAECF0] hover:border-[#0284C7] text-[#475467] hover:text-[#0284C7] text-[11px] shrink-0 transition-colors cursor-pointer hidden md:inline-flex"
              >
                🎟️ Promo
              </button>
            </div>
          </div>

          {/* Dedicated Full-Width Multi-Line Textarea */}
          <div className="relative bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl p-2.5 focus-within:border-[#0284C7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0284C7]/10 transition-all shadow-2xs">
            <textarea
              rows={2}
              placeholder={
                isSriUser && isNewContact
                  ? `✨ New Contact: Sri can click 'Send First Template' to dispatch Meta-approved 'hello_world' template and get their reply!`
                  : !isAiAutoPilot
                    ? `👤 Manual Agent Active: Type message to send directly to WhatsApp (${activeChat.phone})... (AI reply is paused)`
                    : `🤖 AI Auto-Pilot Active: Type message as agent, or test inbound inquiry...`
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none resize-none min-h-[44px] max-h-28 leading-relaxed"
            />

            {/* Bottom Toolbar inside composer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EAECF0]/80 gap-2">
              <div className="flex items-center gap-2 text-[#667085] min-w-0">
                <button
                  type="button"
                  onClick={handleGenerateAiReply}
                  className="p-1 hover:text-[#0284C7] hover:bg-[#F0F9FF] rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 text-[#0284C7] shrink-0"
                  title="Generate smart AI draft"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Draft with AI</span>
                </button>
                <span className="text-[#D0D5DD] hidden sm:inline">|</span>
                <span className="text-[10px] text-[#98A2B3] font-mono hidden lg:inline truncate">
                  ↵ Enter to send · Shift+↵ new line
                </span>
              </div>

              {/* Action & Send Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Translate & Send Dropdown */}
                <div className="relative">
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslateDraft(selectedLanguage)}
                      className="px-2.5 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-l-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-75"
                      title={`Translate text in box to ${selectedLanguage}`}
                    >
                      {isTranslating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      <span>{isTranslating ? 'Translating...' : selectedLanguage}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTranslateMenuOpen(!isTranslateMenuOpen)}
                      className="px-1.5 py-1.5 bg-[#0369A1] hover:bg-[#075985] text-white rounded-r-lg text-[11px] font-bold border-l border-sky-400 cursor-pointer"
                      title="Choose Target Language & Options"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Language Selection Popover */}
                  {isTranslateMenuOpen && (
                    <div className="absolute right-0 bottom-10 w-64 bg-white border border-[#EAECF0] rounded-2xl shadow-2xl p-2 z-50 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between px-1 pb-1 border-b border-[#EAECF0]">
                        <span className="text-[10px] font-bold text-[#98A2B3] uppercase font-mono">
                          Translate Language
                        </span>
                        <span className="text-[9px] text-[#0284C7] bg-[#F0F9FF] font-semibold px-1.5 py-0.5 rounded-md">
                          Live AI
                        </span>
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                        {LANGUAGES.map((lang) => (
                          <div
                            key={lang.name}
                            className={`flex items-center justify-between p-1.5 rounded-xl text-xs transition-colors ${
                              selectedLanguage === lang.name ? 'bg-[#F0F9FF] text-[#0284C7]' : 'hover:bg-[#F9FAFB] text-[#344054]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLanguage(lang.name);
                                handleTranslateDraft(lang.name);
                              }}
                              className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                              title={`Translate draft to ${lang.name}`}
                            >
                              <span>{lang.flag}</span>
                              <span className="font-semibold text-xs">{lang.name}</span>
                              <span className="text-[10px] text-[#98A2B3] font-mono">({lang.native})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLanguage(lang.name);
                                handleTranslateAndSend(lang.name);
                              }}
                              className="px-2 py-0.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
                              title={`Translate and send to WhatsApp in ${lang.name}`}
                            >
                              Send ↗
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1 border-t border-[#EAECF0] text-[10px] text-[#98A2B3] text-center font-mono">
                        Click language to translate in box · Click Send ↗ to send
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSendingLive || !inputMessage.trim()}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                    !inputMessage.trim()
                      ? 'bg-[#EAECF0] text-[#98A2B3] cursor-not-allowed'
                      : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-emerald-500/20 active:scale-95'
                  }`}
                  title="Send message directly to WhatsApp"
                >
                  {isSendingLive ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

      {/* Horizontal Resizer: Between Chat & Intelligence Panel */}
      {!isRightCollapsed && (
        <div
          onMouseDown={handleStartResizeRight}
          onDoubleClick={() => setRightWidth(340)}
          title="Drag horizontally to resize Lead Intelligence panel (Double-click to reset to 340px)"
          className={`hidden xl:flex w-1.5 hover:w-2 transition-all cursor-col-resize select-none shrink-0 z-10 items-center justify-center group relative ${
            isDragging === 'right' ? 'bg-[#0284C7] w-2' : 'bg-[#EAECF0] hover:bg-[#0284C7]/70'
          }`}
        >
          <div className="w-0.5 h-7 rounded-full bg-[#98A2B3] group-hover:bg-white transition-colors" />
        </div>
      )}

      {/* 3. Right: Contact Profile & Notes */}
      {!isRightCollapsed && (
        <div
          style={{ width: `${rightWidth}px` }}
          className="hidden xl:flex border-l border-[#EAECF0] bg-white flex-col shrink-0 min-h-0 select-text"
        >
        <div className="flex border-b border-[#EAECF0] shrink-0 bg-white">
          <button
            onClick={() => setActiveTabSide('profile')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTabSide === 'profile'
                ? 'border-[#0284C7] text-[#0284C7] bg-[#F0F9FF]/60'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            Lead Intelligence
          </button>
          <button
            onClick={() => setActiveTabSide('notes')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTabSide === 'notes'
                ? 'border-[#0284C7] text-[#0284C7] bg-[#F0F9FF]/60'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            Team Notes ({activeChat ? (activeChat.notes || []).length : 0})
          </button>
        </div>

        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#98A2B3] space-y-2 min-h-0">
            <Users className="w-8 h-8 text-[#D0D5DD]" />
            <p className="text-xs font-semibold text-[#667085]">No contact selected</p>
            <p className="text-[11px] text-[#98A2B3]">Select a conversation to view intelligence and notes</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {activeTabSide === 'profile' ? (
              <>
                {/* Profile Card */}
                <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ContactAvatar name={activeChat.contactName} size="xl" />
                      <div>
                        <h4 className="text-sm font-bold text-[#101828] flex items-center gap-1">
                          {activeChat.contactName}
                          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                        </h4>
                        <span className="text-xs text-[#667085] font-mono">{activeChat.phone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEditModal(activeChat)}
                      className="p-2 rounded-xl border border-[#EAECF0] bg-white text-[#475467] hover:text-[#0284C7] hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all cursor-pointer shadow-xs"
                      title="Edit Contact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                {/* Lead Stage Selector */}
                <div className="space-y-1.5 pt-2 border-t border-[#EAECF0]">
                  <div className="text-[10px] font-mono text-[#98A2B3] uppercase font-semibold">Lead Stage</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Hot', 'Interested', 'Cold', 'Converted'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => updateLeadTag(activeChat.id, stage)}
                        className={`py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          activeChat.tag === stage
                            ? `${tagColors[stage]} shadow-xs ring-1 ring-[#0284C7]`
                            : 'border-[#EAECF0] bg-white text-[#475467] hover:bg-[#F2F4F7]'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Extracted Attributes */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#101828] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>AI Extracted Entities</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-2 text-xs">
                  {Object.entries(activeChat.attributes || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-start pb-1.5 border-b border-[#EAECF0] last:border-none last:pb-0">
                      <span className="text-[#667085] capitalize font-mono text-[11px]">{key}:</span>
                      <span className="font-semibold text-[#101828] text-right">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Actions: Invoices, Edit & Delete */}
                <div className="pt-2 border-t border-[#EAECF0] space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenInvoiceModal}
                    className="w-full py-2 px-3 border border-[#BAE6FD] bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Send customized Payment Due PDF to this contact"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Send Due Invoice PDF</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(activeChat)}
                    className="w-full py-2 px-3 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Edit Contact Details</span>
                  </button>

                  <button
                    onClick={() => setContactToDelete(activeChat)}
                    className="w-full py-2 px-3 border border-[#FEE2E2] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Delete Contact from Database</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Add internal note for your team..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#0284C7] resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Internal Note
                </button>
              </form>

              <div className="space-y-2">
                {(activeChat.notes || []).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-[#0284C7] font-mono font-semibold">
                      <span>{n.author}</span>
                      <span className="text-[#98A2B3]">{n.time}</span>
                    </div>
                    <p className="text-[#101828] text-xs">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )}
      {/* Close the inner 3-column flex container */}
      </div>

      {/* Mobile Contact Quick Switcher Bottom Sheet Modal */}
      {isMobileContactPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in font-sans">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileContactPickerOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[82vh] flex flex-col shadow-2xl border-t border-[#EAECF0] z-10 animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-[#D0D5DD] rounded-full mx-auto mt-3 mb-1 shrink-0" />

            <div className="px-5 py-3 border-b border-[#EAECF0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0284C7]" />
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">Switch Contact / User</h3>
                  <p className="text-[11px] text-[#667085]">Tap any contact to open their chat instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileContactPickerOpen(false)}
                className="p-1.5 rounded-xl text-[#667085] hover:bg-[#F2F4F7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-2.5 border-b border-[#EAECF0] shrink-0 bg-[#F9FAFB]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, phone or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-[#EAECF0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#0284C7]"
                  autoFocus
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F2F4F7] p-2 min-h-0">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#667085]">
                  No contacts found matching "{searchTerm}"
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isSelected = activeChat?.id === chat.id;
                  const messages = chat.messages || [];
                  const lastMsg = messages[messages.length - 1];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        if (openChat) openChat(chat.id);
                        else setActiveChatId(chat.id);
                        setIsMobileContactPickerOpen(false);
                      }}
                      className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#F0F9FF] border border-[#BAE6FD]'
                          : 'hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <ContactAvatar name={chat.contactName} size="md" />
                        {chat.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white font-bold text-[9px] flex items-center justify-center font-mono border-2 border-white">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-[#0284C7]' : 'text-[#101828]'}`}>
                            {chat.contactName}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {chat.tag && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${tagColors[chat.tag]}`}>
                                {chat.tag}
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] bg-[#0284C7] text-white font-bold px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 text-xs text-[#667085]">
                          <span className="truncate pr-2">
                            {lastMsg?.text || (chat.phone ? chat.phone : 'No messages yet')}
                          </span>
                          {lastMsg && (
                            <span className="text-[10px] text-[#98A2B3] shrink-0 font-mono">
                              {lastMsg.time}
                            </span>
                          )}
                        </div>
                        {isSuperAdmin && (chat.clientProfileName || chat.clientCompanyName) && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              <span>{chat.clientProfileName || 'Client'}{chat.clientCompanyName ? ` (${chat.clientCompanyName})` : ''}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Contact Button in Sheet */}
            <div className="p-3 border-t border-[#EAECF0] bg-white shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsMobileContactPickerOpen(false);
                  setIsAddContactModalOpen(true);
                }}
                className="w-full py-2.5 bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddContactModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                <Users className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Add New Lead Contact</h3>
                <p className="text-xs text-[#667085]">Save contact into Supabase and start conversation</p>
              </div>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              {isSuperAdmin && (
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Target Client Profile</label>
                  <select
                    value={formTargetWorkspace}
                    onChange={(e) => setFormTargetWorkspace(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-sky-200 px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] font-medium"
                  >
                    {clientTenants.map((client) => {
                      const wsId = client.workspaceId || client.id;
                      return (
                        <option key={wsId} value={wsId}>
                          👤 {client.name} — {client.companyName || 'Client Profile'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#475467]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Lead Stage</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Interested">Interested</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Messenger">Messenger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, IN"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <span>Create Contact & Save to Supabase</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {isEditContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditContactModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                <Edit3 className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Edit Contact Details</h3>
                <p className="text-xs text-[#667085]">Update lead information in database</p>
              </div>
            </div>

            <form onSubmit={handleSaveContactEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 84384 89970"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Email Address</label>
                <input
                  type="email"
                  placeholder="sri@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Lead Stage</label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Interested">Interested</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, IN"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Budget / Deal Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,499"
                    value={editDealValue}
                    onChange={(e) => setEditDealValue(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Product / Interest</label>
                  <input
                    type="text"
                    placeholder="e.g. Omnichannel CRM Lead"
                    value={editProduct}
                    onChange={(e) => setEditProduct(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditContactModalOpen(false)}
                  disabled={isUpdatingContact}
                  className="flex-1 py-2.5 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingContact}
                  className="flex-1 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpdatingContact ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mx-auto">
              <Trash2 className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#101828]">Delete Contact?</h3>
              <p className="text-xs text-[#667085]">
                Are you sure you want to permanently delete <span className="font-bold text-[#101828]">{contactToDelete.contactName}</span> ({contactToDelete.phone}) from Supabase database?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setContactToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create & Send Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                <FileText className="w-6 h-6 text-[#0284C7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Create & Send Invoice PDF</h3>
                <p className="text-xs text-[#667085]">Dispatches official Due PDF with payment link to WhatsApp</p>
              </div>
            </div>

            <form onSubmit={handleCreateAndSendInvoice} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sri"
                    value={invoiceName}
                    onChange={(e) => setInvoiceName(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 97914 71277"
                    value={invoicePhone}
                    onChange={(e) => setInvoicePhone(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Customer Email</label>
                  <input
                    type="email"
                    placeholder="sri@example.com"
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">City / Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore, IN"
                    value={invoiceCity}
                    onChange={(e) => setInvoiceCity(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Service / Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="DhiGrowth WhatsApp CRM & AI Concierge Setup"
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Total Amount (INR ₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#667085]">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2499"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-8 pr-3.5 py-2.5 rounded-xl text-xs text-[#101828] font-bold focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[11px] text-[#0369A1] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Automated Workflow Highlights:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-[#0369A1]">
                  <li>Generates high-resolution vector PDF with DhiGrowth branding & Red "PAYMENT DUE" badge.</li>
                  <li>Uploads PDF directly to Meta Cloud API and delivers as an attachment to WhatsApp.</li>
                  <li>Includes secure dynamic checkout link with UPI, NetBanking & Cards.</li>
                  <li><strong>Auto-Receipt:</strong> Once paid, the system instantly generates and dispatches the Green "PAID / RECEIPT" PDF to WhatsApp!</li>
                </ul>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  disabled={isSendingInvoice}
                  className="flex-1 py-3 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvoice}
                  className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSendingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating & Sending PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Send Invoice Due PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sri Exclusive: Send First-Time Template to New Contact Modal */}
      {isTemplateSendModalOpen && activeChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EAECF0] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EAECF0] flex items-center justify-between bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#101828]">Send First Template</h3>
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                      Sri User Exclusive
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Meta WhatsApp outreach to initiate chat with new contact
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateSendModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white text-[#98A2B3] hover:text-[#344054] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Recipient Card */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <ContactAvatar name={activeChat.contactName} size="md" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#101828] truncate">
                      {activeChat.contactName}
                    </div>
                    <div className="text-[11px] font-mono text-[#667085]">
                      {activeChat.phone}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
                  New Contact · No Reply Yet
                </span>
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Select Meta-Approved Template
                </label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] font-bold focus:outline-none focus:border-[#0284C7]"
                >
                  {templateOptions.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.category || 'template'} ({t.status || 'approved'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#344054]">Personalized Message Preview:</span>
                  <span className="text-[10px] font-mono text-[#0284C7] font-bold">
                    Variable &#123;&#123;1&#125;&#125; = {activeChat.contactName || 'Valued Client'}
                  </span>
                </div>
                <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-[#E2D9CF] shadow-inner font-sans">
                  <div className="bg-white rounded-xl p-3 shadow-xs max-w-sm space-y-2 text-xs text-[#111B21] leading-relaxed whitespace-pre-wrap">
                    {previewBody}
                    <div className="pt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
                      <span>Just now</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Policy Explanation */}
              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl text-[11px] text-[#0369A1] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Why send a template for new contacts?</span>
                </div>
                <p className="text-[10px] text-[#0369A1] leading-relaxed">
                  Meta's WhatsApp Cloud API policy requires businesses to initiate conversations with new contacts using an approved template. Once <strong>{activeChat.contactName}</strong> replies, your <strong>24-hour conversational window unlocks</strong>, allowing standard messages and Dhigrowth AI auto-pilot!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateSendModalOpen(false)}
                  disabled={isSendingTemplate}
                  className="flex-1 py-3 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendFirstTemplate}
                  disabled={isSendingTemplate}
                  className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSendingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Template via Meta API...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Template on WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


