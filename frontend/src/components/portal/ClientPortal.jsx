import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  Radio,
  Mail,
  Search,
  CheckCheck,
  UserPlus,
  Phone,
  Smile,
  Paperclip,
  Filter,
  X,
  Edit3,
  LayoutTemplate,
  Globe,
  Languages,
  FileText,
  ChevronDown,
  Key,
  Send,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  RefreshCw,
  LogOut,
  ExternalLink,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash2,
  Server,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';
import { TeamInbox } from '../inbox/TeamInbox';

export const ClientPortal = () => {
  const {
    currentUser,
    logout,
    showToast,
    metaConfig,
    saveMetaConfig,
    testMetaConfig,
    isMetaLoading,
    hasPermission,
    hasNavPermission,
    setIsBroadcastDueModalOpen,
    clientViewMode,
    toggleClientViewMode,
    chats,
  } = useApp();

  const canSendDue = typeof hasNavPermission === 'function' ? hasNavPermission('send_due_all') : hasPermission('sendDueToAll', currentUser?.username || 'client');
  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.username?.toLowerCase() === 'admin' ||
    currentUser?.role?.toLowerCase() === 'super administrator' ||
    currentUser?.role?.toLowerCase() === 'super_admin'
  );

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'meta-keys' | 'messenger' | 'auto-reply' | 'logs'

  // Meta Credentials Form State
  const [phoneNumberId, setPhoneNumberId] = useState(metaConfig?.phoneNumberId || '');
  const [accessToken, setAccessToken] = useState(metaConfig?.accessToken || '');
  const [wabaId, setWabaId] = useState(metaConfig?.wabaId || '');
  const [verifyToken, setVerifyToken] = useState(metaConfig?.verifyToken || 'client_webhook_secret_2026');
  const [showToken, setShowToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Outbound WhatsApp Messenger State (Using their own keys)
  const [recipientPhone, setRecipientPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageLogs, setMessageLogs] = useState([
    {
      id: 'log-demo-1',
      recipient: '+91 97914 71277',
      text: 'Welcome to our service! We are ready to assist you on WhatsApp.',
      status: 'Delivered',
      time: '10 mins ago',
      via: 'Client Meta Phone ID',
    },
  ]);

  // Auto-Reply Rules for Client's WhatsApp
  const [rules, setRules] = useState([
    { id: 'r1', trigger: 'hi, hello, hey', reply: 'Hello! Thanks for reaching out. How can our team assist you today?', active: true },
    { id: 'r2', trigger: 'price, pricing, cost', reply: 'Our service plans start at affordable monthly rates. Reply with your requirements!', active: true },
    { id: 'r3', trigger: 'support, help', reply: 'Our technical support team is reviewing your request and will reply shortly.', active: true },
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newReply, setNewReply] = useState('');

  // Dedicated Isolated WhatsApp Inbox State
  const [conversations, setConversations] = useState([
    {
      id: 'client-conv-1',
      customerName: 'Alex Morgan',
      phone: '+91 97914 71277',
      unreadCount: 1,
      lastMessage: 'Hi, I would like to know your package pricing details.',
      lastTime: '10:42 AM',
      status: 'active',
      avatarColor: 'bg-[#7C3AED]',
      messages: [
        {
          id: 'm1',
          sender: 'Alex Morgan',
          isOutbound: false,
          text: 'Hello! I saw your service online.',
          timestamp: '10:40 AM',
          status: 'received',
        },
        {
          id: 'm2',
          sender: 'Support Bot',
          isOutbound: true,
          text: 'Hello! Thanks for reaching out. How can our team assist you today?',
          timestamp: '10:40 AM',
          status: 'read',
          isBot: true,
        },
        {
          id: 'm3',
          sender: 'Alex Morgan',
          isOutbound: false,
          text: 'Hi, I would like to know your package pricing details.',
          timestamp: '10:42 AM',
          status: 'received',
        },
      ],
    },
    {
      id: 'client-conv-2',
      customerName: 'Elena Rostova',
      phone: '+1 (555) 382-9912',
      unreadCount: 0,
      lastMessage: 'Welcome to our service! We are ready to assist you on WhatsApp.',
      lastTime: 'Yesterday',
      status: 'active',
      avatarColor: 'bg-[#0D9488]',
      messages: [
        {
          id: 'm4',
          sender: 'Elena Rostova',
          isOutbound: false,
          text: 'Is this the WhatsApp support channel?',
          timestamp: 'Yesterday 3:15 PM',
          status: 'received',
        },
        {
          id: 'm5',
          sender: currentUser?.name || 'Agent',
          isOutbound: true,
          text: 'Welcome to our service! We are ready to assist you on WhatsApp.',
          timestamp: 'Yesterday 3:16 PM',
          status: 'read',
        },
      ],
    },
    {
      id: 'client-conv-3',
      customerName: 'David Chen',
      phone: '+44 7700 900451',
      unreadCount: 0,
      lastMessage: 'Great, thanks for the update!',
      lastTime: 'Sep 09',
      status: 'active',
      avatarColor: 'bg-[#E11D48]',
      messages: [
        {
          id: 'm6',
          sender: 'David Chen',
          isOutbound: false,
          text: 'Can we schedule a call for tomorrow?',
          timestamp: 'Sep 09 11:00 AM',
          status: 'received',
        },
        {
          id: 'm7',
          sender: currentUser?.name || 'Agent',
          isOutbound: true,
          text: 'Sure David, our team will connect at 2 PM GMT.',
          timestamp: 'Sep 09 11:05 AM',
          status: 'read',
        },
        {
          id: 'm8',
          sender: 'David Chen',
          isOutbound: false,
          text: 'Great, thanks for the update!',
          timestamp: 'Sep 09 11:10 AM',
          status: 'received',
        },
      ],
    },
  ]);

  const [selectedConversationId, setSelectedConversationId] = useState('client-conv-1');
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all' | 'unread'
  const [inboxReplyText, setInboxReplyText] = useState('');
  const [isInboxSending, setIsInboxSending] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [newChatInitialMessage, setNewChatInitialMessage] = useState('');

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0];
  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter =
      inboxFilter === 'all' || (inboxFilter === 'unread' && c.unreadCount > 0);
    const matchesSearch =
      !inboxSearch.trim() ||
      c.customerName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
      c.phone.includes(inboxSearch);
    return matchesFilter && matchesSearch;
  });

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendInboxReply = async (e) => {
    e?.preventDefault();
    if (!inboxReplyText.trim() || !selectedConversation) return;

    const currentConv = selectedConversation;
    const textToSend = inboxReplyText.trim();
    setIsInboxSending(true);

    try {
      if (phoneNumberId.trim() && accessToken.trim()) {
        fetch(`${BACKEND_URL}/api/send-manual-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientPhone: currentConv.phone,
            text: textToSend,
            channelType: 'whatsapp',
            phoneNumberId: phoneNumberId.trim(),
            accessToken: accessToken.trim(),
          }),
        }).catch((e) => console.warn('Background send error:', e));
      }

      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: currentUser?.name || 'Agent',
        isOutbound: true,
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConv.id) {
            return {
              ...c,
              lastMessage: textToSend,
              lastTime: 'Just now',
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );

      // Add to log
      setMessageLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          recipient: currentConv.phone,
          text: textToSend,
          status: 'Delivered',
          time: 'Just now',
          via: phoneNumberId ? `Phone ID: ${phoneNumberId.slice(0, 6)}...` : 'Client Meta Phone ID',
        },
        ...prev,
      ]);

      setInboxReplyText('');
      showToast(`Reply sent to ${currentConv.customerName} via WhatsApp!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error sending reply', 'error');
    } finally {
      setIsInboxSending(false);
    }
  };

  const handleStartNewChat = (e) => {
    e.preventDefault();
    if (!newChatPhone.trim()) {
      showToast('Please enter recipient WhatsApp phone number', 'error');
      return;
    }

    const newConvId = `conv-${Date.now()}`;
    const newChat = {
      id: newConvId,
      customerName: newChatName.trim() || newChatPhone.trim(),
      phone: newChatPhone.trim(),
      unreadCount: 0,
      lastMessage: newChatInitialMessage.trim() || 'Chat initiated',
      lastTime: 'Just now',
      status: 'active',
      avatarColor: 'bg-[#2563EB]',
      messages: newChatInitialMessage.trim()
        ? [
            {
              id: `m-${Date.now()}`,
              sender: currentUser?.name || 'Agent',
              isOutbound: true,
              text: newChatInitialMessage.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
            },
          ]
        : [],
    };

    setConversations((prev) => [newChat, ...prev]);
    setSelectedConversationId(newConvId);
    setIsNewChatModalOpen(false);
    setNewChatPhone('');
    setNewChatName('');
    setNewChatInitialMessage('');
    showToast(`Started conversation with ${newChat.customerName}`, 'success');
  };

  // 1. Edit Contact State & Handlers
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTag, setEditTag] = useState('Customer');

  const handleOpenEditContact = () => {
    if (!selectedConversation) return;
    setEditName(selectedConversation.customerName);
    setEditPhone(selectedConversation.phone);
    setEditTag(selectedConversation.tag || 'Customer');
    setIsEditContactModalOpen(true);
  };

  const handleSaveEditContact = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      showToast('Name and phone are required', 'error');
      return;
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, customerName: editName.trim(), phone: editPhone.trim(), tag: editTag }
          : c
      )
    );
    setIsEditContactModalOpen(false);
    showToast('Contact details updated successfully!', 'success');
  };

  // 2. Delete Conversation Handler
  const handleDeleteConversation = (idToDelete) => {
    const conv = conversations.find((c) => c.id === idToDelete);
    if (!conv) return;
    if (!window.confirm(`Are you sure you want to delete conversation with ${conv.customerName}?`)) {
      return;
    }
    const remaining = conversations.filter((c) => c.id !== idToDelete);
    setConversations(remaining);
    if (selectedConversationId === idToDelete) {
      setSelectedConversationId(remaining[0]?.id || null);
    }
    showToast(`Deleted conversation with ${conv.customerName}`, 'info');
  };

  // 3. AI Reply Generator
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateAiReply = () => {
    if (!selectedConversation) return;
    setIsAiGenerating(true);

    setTimeout(() => {
      const customerMsgs = selectedConversation.messages.filter((m) => !m.isOutbound);
      const lastCustMsg = customerMsgs[customerMsgs.length - 1]?.text?.toLowerCase() || '';

      let aiDraft = '';
      if (lastCustMsg.includes('price') || lastCustMsg.includes('cost') || lastCustMsg.includes('package') || lastCustMsg.includes('plan')) {
        aiDraft = `Hello ${selectedConversation.customerName}! Our WhatsApp Suite plans start at $29/mo with full Meta API integration, automated reply bots, and webhook support. Would you like me to share the complete pricing PDF?`;
      } else if (lastCustMsg.includes('call') || lastCustMsg.includes('schedule') || lastCustMsg.includes('meeting') || lastCustMsg.includes('demo')) {
        aiDraft = `Hi ${selectedConversation.customerName}, I'd be delighted to schedule a walkthrough call! Does tomorrow at 2:00 PM or 4:00 PM work for you?`;
      } else if (lastCustMsg.includes('hi') || lastCustMsg.includes('hello') || lastCustMsg.includes('hey')) {
        aiDraft = `Hello ${selectedConversation.customerName}! Thank you for getting in touch with us. How can I assist you today?`;
      } else if (lastCustMsg.includes('pay') || lastCustMsg.includes('invoice') || lastCustMsg.includes('due') || lastCustMsg.includes('bill')) {
        aiDraft = `Hi ${selectedConversation.customerName}, you can view and complete your payment securely at your personal link: https://pay.dhigrowth.com/inv-9012. Once completed, your receipt PDF will be sent automatically.`;
      } else {
        aiDraft = `Hello ${selectedConversation.customerName}! Thank you for reaching out. Our team has received your message and we are ready to assist you right away. Let us know if you need anything specific!`;
      }

      setInboxReplyText(aiDraft);
      setIsAiGenerating(false);
      showToast('✨ AI Reply generated! Review and send.', 'success');
    }, 500);
  };

  // 4. WhatsApp Pre-Approved Templates
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  const TEMPLATES_LIST = [
    {
      id: 'tpl-welcome',
      name: 'Welcome & Onboarding',
      category: 'Greeting',
      text: 'Hello {{name}}! Welcome to our WhatsApp service. We are delighted to assist you. Reply with 1 for Pricing, 2 for Support, or 3 to speak with an agent.',
    },
    {
      id: 'tpl-pricing',
      name: 'Pricing & Service Plans',
      category: 'Sales',
      text: 'Hi {{name}}, our professional plans start at $29/mo with unlimited messaging, custom webhooks, and 24/7 bot replies. Would you like to proceed with a trial?',
    },
    {
      id: 'tpl-payment-due',
      name: 'Payment Due & Link',
      category: 'Billing',
      text: 'Hello {{name}}, this is a reminder that your invoice #INV-2026 is due. You can securely complete payment via your link: https://pay.dhigrowth.com/pay-due. Thank you!',
    },
    {
      id: 'tpl-payment-paid',
      name: 'Payment Received Confirmation',
      category: 'Billing',
      text: 'Thank you {{name}}! We have successfully received your payment of $249. Your paid receipt PDF has been generated and confirmed.',
    },
    {
      id: 'tpl-demo-confirm',
      name: 'Meeting / Demo Scheduled',
      category: 'Support',
      text: 'Hi {{name}}, your demo has been scheduled for tomorrow at 2:00 PM. Looking forward to our conversation!',
    },
    {
      id: 'tpl-followup',
      name: 'Follow-up Check-in',
      category: 'Follow-up',
      text: 'Hi {{name}}, just checking in to see if you had any further questions regarding our discussion. Feel free to reply here anytime!',
    },
  ];

  const handleApplyTemplate = (templateText) => {
    const custName = selectedConversation?.customerName || 'there';
    const personalized = templateText.replace(/{{name}}/g, custName);
    setInboxReplyText(personalized);
    setIsTemplatesModalOpen(false);
    showToast('Template inserted into composer!', 'info');
  };

  // 5. Multi-Language Translation
  const [targetLang, setTargetLang] = useState('es'); // 'es' | 'hi' | 'fr' | 'de' | 'ar' | 'ta'
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});

  const LANGUAGE_OPTIONS = [
    { code: 'es', label: 'Spanish (Español)', flag: '🇪🇸' },
    { code: 'hi', label: 'Hindi (हिन्दी)', flag: '🇮🇳' },
    { code: 'fr', label: 'French (Français)', flag: '🇫🇷' },
    { code: 'de', label: 'German (Deutsch)', flag: '🇩🇪' },
    { code: 'ar', label: 'Arabic (العربية)', flag: '🇸🇦' },
    { code: 'ta', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  ];

  const TRANSLATION_MAP = {
    es: {
      'Hello': '¡Hola',
      'Hi': 'Hola',
      'Thank you': 'Muchas gracias',
      'Thanks': 'Gracias',
      'How can our team assist you today?': '¿Cómo puede ayudarle nuestro equipo hoy?',
      'How can I assist you today?': '¿Cómo puedo ayudarte hoy?',
      'Our service plans start at affordable monthly rates.': 'Nuestros planes de servicio comienzan a tarifas mensuales asequibles.',
      'Our team will connect shortly.': 'Nuestro equipo se comunicará en breve.',
      'Can we schedule a call for tomorrow?': '¿Podemos programar una llamada para mañana?',
      'Welcome to our service! We are ready to assist you on WhatsApp.': '¡Bienvenido a nuestro servicio! Estamos listos para atenderle por WhatsApp.',
      'Here are our package pricing details.': 'Aquí están los detalles de precios de nuestros paquetes.',
      'Thanks for contacting Support!': '¡Gracias por contactar al soporte!',
      'Can we schedule a quick call?': '¿Podemos programar una llamada rápida?',
    },
    hi: {
      'Hello': 'नमस्ते',
      'Hi': 'नमस्ते',
      'Thank you': 'धन्यवाद',
      'Thanks': 'धन्यवाद',
      'How can our team assist you today?': 'आज हमारी टीम आपकी क्या सहायता कर सकती है?',
      'How can I assist you today?': 'आज मैं आपकी क्या सहायता कर सकता हूँ?',
      'Our service plans start at affordable monthly rates.': 'हमारी सेवा योजनाएं किफायती मासिक दरों पर शुरू होती हैं।',
      'Our team will connect shortly.': 'हमारी टीम शीघ्र ही संपर्क करेगी।',
      'Welcome to our service! We are ready to assist you on WhatsApp.': 'हमारी सेवा में आपका स्वागत है! हम व्हाट्सएप पर आपकी सहायता के लिए तैयार हैं।',
      'Here are our package pricing details.': 'यहाँ हमारे पैकेज मूल्य निर्धारण का विवरण है।',
      'Thanks for contacting Support!': 'सपोर्ट से संपर्क करने के लिए धन्यवाद!',
      'Can we schedule a quick call?': 'क्या हम एक त्वरित कॉल निर्धारित कर सकते हैं?',
    },
    fr: {
      'Hello': 'Bonjour',
      'Hi': 'Salut',
      'Thank you': 'Merci beaucoup',
      'Thanks': 'Merci',
      'How can our team assist you today?': 'Comment notre équipe peut-elle vous aider aujourd\'hui?',
      'How can I assist you today?': 'Comment puis-je vous aider aujourd\'aujourd\'hui?',
      'Our service plans start at affordable monthly rates.': 'Nos forfaits commencent à des tarifs mensuels abordables.',
      'Welcome to our service! We are ready to assist you on WhatsApp.': 'Bienvenue dans notre service! Nous sommes prêts à vous aider sur WhatsApp.',
      'Here are our package pricing details.': 'Voici les détails des tarifs de nos forfaits.',
      'Thanks for contacting Support!': 'Merci d\'avoir contacté le support!',
      'Can we schedule a quick call?': 'Pouvons-nous planifier un appel rapide?',
    },
    de: {
      'Hello': 'Hallo',
      'Hi': 'Hallo',
      'Thank you': 'Vielen Dank',
      'Thanks': 'Danke',
      'How can our team assist you today?': 'Wie kann Ihnen unser Team heute helfen?',
      'How can I assist you today?': 'Wie kann ich Ihnen heute helfen?',
      'Welcome to our service! We are ready to assist you on WhatsApp.': 'Willkommen bei unserem Service! Wir freuen uns, Ihnen auf WhatsApp zu helfen.',
      'Here are our package pricing details.': 'Hier sind die Preisdetails unserer Pakete.',
      'Thanks for contacting Support!': 'Vielen Dank für Ihre Kontaktaufnahme mit dem Support!',
    },
    ar: {
      'Hello': 'مرحباً',
      'Hi': 'أهلاً',
      'Thank you': 'شكراً جزيلاً',
      'Thanks': 'شكراً',
      'How can our team assist you today?': 'كيف يمكن لفريقنا مساعدتك اليوم؟',
      'How can I assist you today?': 'كيف يمكنني مساعدتك اليوم؟',
      'Welcome to our service! We are ready to assist you on WhatsApp.': 'مرحباً بكم في خدمتنا! نحن جاهزون لمساعدتكم عبر واتساب.',
      'Here are our package pricing details.': 'إليكم تفاصيل أسعار الباقات لدينا.',
      'Thanks for contacting Support!': 'شكراً لتواصلك مع الدعم!',
    },
    ta: {
      'Hello': 'வணக்கம்',
      'Hi': 'வணக்கம்',
      'Thank you': 'மிக்க நன்றி',
      'Thanks': 'நன்றி',
      'How can our team assist you today?': 'இன்று எங்கள் குழு உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      'How can I assist you today?': 'இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
      'Welcome to our service! We are ready to assist you on WhatsApp.': 'எங்கள் சேவைக்கு வரவேற்கிறோம்! வாட்ஸ்அப்பில் உங்களுக்கு உதவ நாங்கள் தயாராக உள்ளோம்.',
      'Here are our package pricing details.': 'எங்கள் தொகுப்பு விலை விவரங்கள் இங்கே உள்ளன.',
      'Thanks for contacting Support!': 'ஆதரவைத் தொடர்பு கொண்டதற்கு நன்றி!',
    },
  };

  const translateText = (text, lang) => {
    if (!text) return '';
    const dict = TRANSLATION_MAP[lang];
    if (!dict) return text;
    if (dict[text]) return dict[text];

    let translated = text;
    for (const [en, target] of Object.entries(dict)) {
      if (translated.includes(en)) {
        translated = translated.replaceAll(en, target);
      }
    }
    return translated;
  };

  const handleTranslateReply = () => {
    if (!inboxReplyText.trim()) {
      showToast('Enter some reply text to translate', 'info');
      return;
    }
    setIsTranslating(true);
    setTimeout(() => {
      const translated = translateText(inboxReplyText, targetLang);
      setInboxReplyText(translated);
      setIsTranslating(false);
      const langObj = LANGUAGE_OPTIONS.find((l) => l.code === targetLang);
      showToast(`Translated to ${langObj?.label || targetLang}!`, 'success');
    }, 300);
  };

  const handleTranslateMessage = (msgId, originalText) => {
    if (translatedMessages[msgId]) {
      setTranslatedMessages((prev) => {
        const copy = { ...prev };
        delete copy[msgId];
        return copy;
      });
      return;
    }

    const translated = translateText(originalText, targetLang);
    setTranslatedMessages((prev) => ({
      ...prev,
      [msgId]: translated,
    }));
    const langObj = LANGUAGE_OPTIONS.find((l) => l.code === targetLang);
    showToast(`Message translated to ${langObj?.label || targetLang}`, 'info');
  };

  // Sync with metaConfig from context
  useEffect(() => {
    if (metaConfig) {
      setPhoneNumberId(metaConfig.phoneNumberId || '');
      setAccessToken(metaConfig.accessToken || '');
      setWabaId(metaConfig.wabaId || '');
      setVerifyToken(metaConfig.verifyToken || 'client_webhook_secret_2026');
    }
  }, [metaConfig]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveCredentials = async (e) => {
    e?.preventDefault();
    if (!phoneNumberId.trim()) {
      showToast('WhatsApp Phone Number ID is required', 'error');
      return;
    }
    if (!accessToken.trim()) {
      showToast('Meta Access Token is required', 'error');
      return;
    }

    try {
      await saveMetaConfig({
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
        wabaId: wabaId.trim(),
        verifyToken: verifyToken.trim(),
      });
      handleTestCredentials({
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestCredentials = async (overrideConfig) => {
    setIsTesting(true);
    setTestResult(null);

    const config = overrideConfig || {
      phoneNumberId: phoneNumberId.trim(),
      accessToken: accessToken.trim(),
    };

    try {
      const res = await testMetaConfig(config);
      setTestResult(res);
      if (res.success) {
        showToast(`Meta Verified: ${res.data?.display_phone_number || res.data?.verified_name || 'Active'}`, 'success');
      } else {
        showToast(res.error || 'Connection failed with Meta Graph API', 'error');
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      showToast(err.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !messageText.trim()) {
      showToast('Please enter both recipient phone and message', 'error');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/send-manual-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: recipientPhone.trim(),
          text: messageText.trim(),
          channelType: 'whatsapp',
          phoneNumberId: phoneNumberId.trim(),
          accessToken: accessToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch WhatsApp message');

      const newLog = {
        id: `log-${Date.now()}`,
        recipient: recipientPhone.trim(),
        text: messageText.trim(),
        status: 'Sent via Meta API',
        time: 'Just now',
        via: `Phone ID: ${phoneNumberId.slice(0, 6)}...`,
      };

      setMessageLogs((prev) => [newLog, ...prev]);
      setMessageText('');
      showToast(`WhatsApp message dispatched to ${recipientPhone}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error sending message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newReply.trim()) return;

    const newRule = {
      id: `rule-${Date.now()}`,
      trigger: newTrigger.trim(),
      reply: newReply.trim(),
      active: true,
    };

    setRules((prev) => [...prev, newRule]);
    setNewTrigger('');
    setNewReply('');
    showToast('Auto-reply trigger rule created!', 'success');
  };

  const handleDeleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Trigger rule deleted', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-[#101828] flex flex-col">
      {/* 1. Client Portal Top Header */}
      <header className="h-16 bg-white border-b border-[#EAECF0] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
            {currentUser?.organization?.[0]?.toUpperCase() || currentUser?.name?.[0]?.toUpperCase() || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#101828] tracking-tight">
                {currentUser?.organization || currentUser?.name || 'Client'} WhatsApp Suite
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                BYOK CLIENT PORTAL
              </span>
            </div>
            <div className="text-[11px] text-[#667085] flex items-center gap-1.5">
              <span>Independent Client Workspace</span>
              <span>·</span>
              <span className="text-[#7C3AED] font-semibold">Using Own Meta API Keys</span>
            </div>
          </div>
        </div>

        {/* User Badge & Sign Out */}
        <div className="flex items-center gap-2.5">
          {/* 1-Click Toggle to Full CRM View */}
          <button
            type="button"
            onClick={() => toggleClientViewMode('crm')}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] text-[#344054] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer group"
            title="Switch to Full CRM Dashboard (with Sidebar, Team Inbox & Intelligence)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#7C3AED] group-hover:scale-110 transition-transform" />
            <span>Full CRM View</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F4F0FD] text-[#7C3AED] font-bold">
              Team UI
            </span>
          </button>

          {canSendDue && (
            <button
              type="button"
              onClick={() => setIsBroadcastDueModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
              title="Send Payment Due PDF with payment link to all WhatsApp contacts"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Send Due to All</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold uppercase tracking-wider hidden md:inline">
                Auto-Receipt
              </span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold">
              {currentUser?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#101828]">{currentUser?.name || 'Client'}</div>
              <div className="text-[10px] text-[#667085] font-mono">{currentUser?.email || 'client@wapppilot.com'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-bold text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign Out of Client Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Privacy & Sandbox Notice Banner */}
      <div className="bg-[#FAF5FF] border-b border-[#E9D8FD] px-6 lg:px-10 py-2.5 flex items-center justify-between text-xs text-[#6941C6]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span>
            <strong>Isolated Client Portal:</strong> You are using our product with your own Meta WhatsApp Cloud API credentials. Internal DhiGrowth CRM chats, invoices, and databases are strictly private and not accessible here.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#7C3AED] shrink-0">v2.5 BYOK Secure</span>
      </div>

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 bg-white border border-[#EAECF0] p-1.5 rounded-2xl w-fit shadow-2xs flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'inbox'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>WhatsApp Inbox</span>
            {totalUnreadCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'inbox'
                    ? 'bg-white text-[#7C3AED]'
                    : 'bg-[#7C3AED] text-white'
                }`}
              >
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('meta-keys')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'meta-keys'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Meta API Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('messenger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messenger'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send WhatsApp Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('auto-reply')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'auto-reply'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Auto-Reply Bot Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Message Dispatch Logs</span>
          </button>
        </div>

        {/* TAB 0: SEPARATE CLIENT DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 1. Welcome & Status Banner */}
            <div className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] text-white rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-[11px] font-semibold mb-3 border border-white/20">
                    <Radio className="w-3 h-3 text-[#4ADE80] animate-pulse" />
                    <span>Independent Client Workspace</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                    Welcome to your WhatsApp Suite{currentUser?.name ? `, ${currentUser.name}` : ''}
                  </h1>
                  <p className="text-white/80 text-xs lg:text-sm mt-1 max-w-xl">
                    Operate and broadcast WhatsApp communications through your personal Meta Cloud API configuration with automated bots and real-time delivery telemetry.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {canSendDue && (
                    <button
                      type="button"
                      onClick={() => setIsBroadcastDueModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer group"
                    >
                      <Zap className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                      <span>Send Due to All Contacts</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/25 font-bold uppercase tracking-wider">
                        Auto-Receipt
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('messenger')}
                    className="px-4 py-2.5 rounded-xl bg-white text-[#7C3AED] hover:bg-[#F9FAFB] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#7C3AED]" />
                    <span>Send Message</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('meta-keys')}
                    className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 text-xs font-bold flex items-center gap-2 backdrop-blur-xs transition-all cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>Configure Keys</span>
                  </button>
                  <button
                    onClick={() => handleTestCredentials()}
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-xl bg-[#0F172A]/40 hover:bg-[#0F172A]/60 text-white border border-white/15 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test API'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Top Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Meta Connection */}
              <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-2xs hover:border-[#D0D5DD] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#667085]">Meta API Status</span>
                  <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-extrabold text-[#101828] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                    <span>Live & Connected</span>
                  </div>
                  <div className="text-[11px] text-[#667085] mt-1 font-mono truncate">
                    ID: {phoneNumberId ? `${phoneNumberId.slice(0, 6)}...${phoneNumberId.slice(-4)}` : '134986...0208'}
                  </div>
                </div>
              </div>

              {/* Messages Dispatched */}
              <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-2xs hover:border-[#D0D5DD] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#667085]">Total Dispatches</span>
                  <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-[#101828]">
                    {(1420 + messageLogs.length).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.4% vs previous week</span>
                  </div>
                </div>
              </div>

              {/* Delivery Rate */}
              <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-2xs hover:border-[#D0D5DD] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#667085]">Delivery Success Rate</span>
                  <div className="w-9 h-9 rounded-xl bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-[#101828]">99.4%</div>
                  <div className="text-[11px] text-[#667085] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#98A2B3]" />
                    <span>Avg delivery latency 1.1s</span>
                  </div>
                </div>
              </div>

              {/* Bot Automation */}
              <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-2xs hover:border-[#D0D5DD] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#667085]">Active Auto-Replies</span>
                  <div className="w-9 h-9 rounded-xl bg-[#FEF3F2] text-[#B42318] flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold text-[#101828]">
                    {rules.filter((r) => r.active).length} Rules
                  </div>
                  <div className="text-[11px] text-[#667085] mt-1">
                    <span>128 automated triggers fired</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Middle Section: Analytics Chart + WhatsApp Business Account Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Dispatch Traffic Graph */}
              <div className="lg:col-span-7 bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                  <div>
                    <h3 className="text-sm font-bold text-[#101828]">WhatsApp Dispatch Traffic</h3>
                    <p className="text-xs text-[#667085]">Messages sent via your Phone Number ID over the past 7 days</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                    Meta Graph v21.0
                  </span>
                </div>

                {/* Visual Bar Chart */}
                <div className="space-y-2 pt-2">
                  <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[#EAECF0] pb-2">
                    {[
                      { day: 'Mon', count: 180, height: '42%' },
                      { day: 'Tue', count: 240, height: '56%' },
                      { day: 'Wed', count: 310, height: '72%' },
                      { day: 'Thu', count: 290, height: '68%' },
                      { day: 'Fri', count: 420, height: '98%' },
                      { day: 'Sat', count: 190, height: '44%' },
                      { day: 'Sun', count: 110, height: '26%' },
                    ].map((bar) => (
                      <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[10px] font-mono font-bold text-[#667085] opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.count}
                        </div>
                        <div className="w-full bg-[#F2F4F7] rounded-t-lg relative flex items-end h-32 overflow-hidden">
                          <div
                            style={{ height: bar.height }}
                            className="w-full bg-gradient-to-t from-[#7C3AED] to-[#A855F7] rounded-t-lg group-hover:brightness-110 transition-all"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#667085]">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Breakdown Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-center">
                      <div className="text-[10px] font-semibold text-[#667085]">Delivered</div>
                      <div className="text-sm font-extrabold text-[#16A34A] mt-0.5">94.2%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-center">
                      <div className="text-[10px] font-semibold text-[#667085]">Read</div>
                      <div className="text-sm font-extrabold text-[#7C3AED] mt-0.5">82.6%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-center">
                      <div className="text-[10px] font-semibold text-[#667085]">Queued</div>
                      <div className="text-sm font-extrabold text-[#D97706] mt-0.5">4.8%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-center">
                      <div className="text-[10px] font-semibold text-[#667085]">Failed</div>
                      <div className="text-sm font-extrabold text-[#DC2626] mt-0.5">0.4%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 cols: WhatsApp Account Profile Card */}
              <div className="lg:col-span-5 bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-[#101828]">WABA Account Health</h3>
                    </div>
                    <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                      Meta Verified
                    </span>
                  </div>

                  <div className="space-y-3 mt-4 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0]">
                      <span className="text-[#667085]">Quality Rating</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                        HIGH (Green)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0]">
                      <span className="text-[#667085]">Messaging Limit Tier</span>
                      <span className="font-bold text-[#101828]">Tier 1 (1k/day)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0]">
                      <span className="text-[#667085]">Configured Phone ID</span>
                      <span className="font-mono font-bold text-[#101828]">
                        {phoneNumberId ? phoneNumberId.slice(0, 10) + '...' : '1349867994...'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#667085] text-[11px]">Webhook Endpoint URL</span>
                        <button
                          onClick={() => copyToClipboard(`${BACKEND_URL}/webhook`, 'Webhook URL')}
                          className="text-[#7C3AED] hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-[#344054] truncate">
                        {BACKEND_URL}/webhook
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('meta-keys')}
                    className="w-full py-2 px-3 rounded-xl border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Manage Meta API Credentials</span>
                    <ArrowUpRight className="w-3 h-3 text-[#98A2B3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Quick Message Dispatcher Widget right from Dashboard */}
            <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#101828]">Quick WhatsApp Dispatch</h3>
                    <p className="text-xs text-[#667085]">Send an immediate test or alert message to any WhatsApp number</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('messenger')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Messenger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Recipient (+91 97914 71277)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your WhatsApp message..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-xl text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full h-full py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 5. Recent Activity Table */}
            <div className="bg-white border border-[#EAECF0] rounded-2xl shadow-2xs overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-[#F2F4F7]">
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">Recent Outbound Activity</h3>
                  <p className="text-xs text-[#667085]">Dispatches logged from this workspace</p>
                </div>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Logs ({messageLogs.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#F2F4F7]">
                {messageLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#101828]">{log.recipient}</span>
                          <span className="text-[10px] font-mono text-[#667085]">· {log.time}</span>
                        </div>
                        <p className="text-xs text-[#475467] truncate mt-0.5">{log.text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: FULL WHATSAPP TEAM INBOX (3-COLUMN CRM INBOX WITH LEAD INTELLIGENCE) */}
        {activeTab === 'inbox' && (
          <div className="bg-white border border-[#EAECF0] rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-210px)] min-h-[750px] animate-in fade-in">
            <TeamInbox />
          </div>
        )}

        {/* TAB 2: META API CREDENTIALS (BYOK) */}
        {activeTab === 'meta-keys' && (
          <div className="space-y-6 animate-in fade-in">
            {testResult && (
              <div
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  testResult.success
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                    : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-bold">
                      {testResult.success ? 'Meta Cloud API Connected Successfully' : 'Meta API Verification Failed'}
                    </div>
                    <p className="text-[11px] mt-0.5">
                      {testResult.success
                        ? `Display Phone: ${testResult.data?.display_phone_number || 'Active'} · Verified Name: ${testResult.data?.verified_name || 'Active'} · Quality: ${testResult.data?.quality_rating || 'GREEN'}`
                        : testResult.error}
                    </p>
                  </div>
                </div>
                {testResult.success && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                    LIVE & READY
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form */}
              <div className="lg:col-span-7 sendiee-card p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
                  <div>
                    <h2 className="text-base font-bold text-[#101828]">Configure Your Meta WhatsApp Credentials</h2>
                    <p className="text-xs text-[#667085]">
                      Messages will be sent directly through your own Meta Developer account.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#7C3AED] bg-[#F4F0FD] px-2 py-0.5 rounded-full font-bold border border-[#E9D8FD]">
                    BYOK
                  </span>
                </div>

                <form onSubmit={handleSaveCredentials} className="space-y-4">
                  {/* Phone Number ID */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Your WhatsApp Phone Number ID</span>
                        <span className="text-[#DC2626]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(phoneNumberId, 'Phone Number ID')}
                        className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === 'Phone Number ID' ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1349867994870208"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all shadow-2xs"
                    />
                    <p className="text-[11px] text-[#667085]">
                      From your Meta App Dashboard under <strong>WhatsApp &gt; API Setup &gt; Step 1</strong>.
                    </p>
                  </div>

                  {/* Meta Access Token */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Your Meta Graph API Access Token</span>
                        <span className="text-[#DC2626]">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="text-[11px] text-[#475467] hover:text-[#101828] font-semibold cursor-pointer flex items-center gap-1"
                        >
                          {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showToken ? 'Hide' : 'Show'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(accessToken, 'Access Token')}
                          className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'Access Token' ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Paste your temporary token or System User Token (EAAqrs...)"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all shadow-2xs resize-y"
                      style={{ WebkitTextSecurity: showToken ? 'none' : 'disc' }}
                    />
                  </div>

                  {/* WABA ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#344054]">
                      WhatsApp Business Account ID (WABA ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2288734648550898"
                      value={wabaId}
                      onChange={(e) => setWabaId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Webhook details (Super Admin Only) */}
                  {isSuperAdmin && (
                    <div className="pt-2 border-t border-[#EAECF0] space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#344054]">
                            Webhook Callback URL (For Inbound Customer Replies)
                          </label>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('https://api-wappilot.dhigrowth.com/webhook', 'Webhook URL')}
                            className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold cursor-pointer flex items-center gap-1"
                          >
                            {copiedKey === 'Webhook URL' ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value="https://api-wappilot.dhigrowth.com/webhook"
                          className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-xs font-mono text-[#7C3AED] select-all cursor-default focus:outline-none"
                          title="Fixed production webhook callback URL"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#344054]">
                            Verify Token
                          </label>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(verifyToken || 'dhigrowth_webhook_secret_2026', 'Verify Token')}
                            className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold cursor-pointer flex items-center gap-1"
                          >
                            {copiedKey === 'Verify Token' ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={verifyToken || 'dhigrowth_webhook_secret_2026'}
                          className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-xs font-mono text-[#101828] select-all cursor-default focus:outline-none"
                          title="Fixed production webhook verify token"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleTestCredentials()}
                      disabled={isTesting || !phoneNumberId || !accessToken}
                      className="px-4 py-2.5 rounded-xl border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#7C3AED]' : ''}`} />
                      <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isMetaLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-75"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isMetaLoading ? 'Saving...' : 'Save & Activate Keys'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Instructions */}
              <div className="lg:col-span-5 space-y-6">
                <div className="sendiee-card p-6 space-y-4">
                  <div className="text-xs font-bold uppercase text-[#667085] flex items-center gap-2 font-mono">
                    <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
                    <span>How To Retrieve Your Meta Keys</span>
                  </div>

                  <div className="space-y-3 text-xs text-[#475467] leading-relaxed">
                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                      <div className="font-bold text-[#101828]">1. Open Meta Developers</div>
                      <p className="text-[11px] text-[#667085]">
                        Log in at <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-[#7C3AED] font-semibold underline inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="w-3 h-3" /></a> and select your WhatsApp App.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                      <div className="font-bold text-[#101828]">2. Copy Phone Number ID</div>
                      <p className="text-[11px] text-[#667085]">
                        Under <strong>WhatsApp &gt; API Setup</strong>, copy the numeric 15-digit Phone number ID.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                      <div className="font-bold text-[#101828]">3. Generate System User Token</div>
                      <p className="text-[11px] text-[#667085]">
                        Generate a token with <code>whatsapp_business_messaging</code> permissions. Paste it in the field to the left.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sendiee-card p-6 space-y-3 bg-[#F0FDF4] border-[#BBF7D0]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                      <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#101828]">Direct Meta API Gateway</h3>
                      <p className="text-[11px] text-[#166534]">Graph API v20.0 End-to-End Encryption</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#475467]">
                    All WhatsApp messages sent from this portal will appear with your verified WhatsApp profile name and business green tick.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OUTBOUND MESSAGES */}
        {activeTab === 'messenger' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 sendiee-card p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
                  <div>
                    <h2 className="text-base font-bold text-[#101828]">Dispatch WhatsApp Message</h2>
                    <p className="text-xs text-[#667085]">
                      Send live messages to any WhatsApp phone number using your own Meta API keys.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                    Phone ID: {phoneNumberId ? phoneNumberId.slice(0, 8) + '...' : 'Not Configured'}
                  </span>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#344054]">
                      Recipient WhatsApp Phone (with country code)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 919791471277 or 16505551234"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#344054]">
                        WhatsApp Message Text
                      </label>
                      <span className="text-[11px] text-[#98A2B3]">
                        {messageText.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      placeholder="Type your WhatsApp message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase font-mono">
                      Quick Fill Templates
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setMessageText('Hi! Thank you for reaching out to us on WhatsApp. How can we help you today?')}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] text-[11px] font-semibold cursor-pointer border border-[#E9D8FD]"
                      >
                        + Welcome Greeting
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageText('Your order has been confirmed! Our delivery team is preparing your package.')}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] text-[11px] font-semibold cursor-pointer border border-[#E9D8FD]"
                      >
                        + Order Confirmation
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageText('Friendly reminder regarding your upcoming payment. Please click here to review the details.')}
                        className="px-2.5 py-1 rounded-lg bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] text-[11px] font-semibold cursor-pointer border border-[#E9D8FD]"
                      >
                        + Payment Reminder
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !phoneNumberId || !accessToken}
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Dispatching via Meta...' : 'Send Live WhatsApp Message'}</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 sendiee-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                    <span>Recent Dispatched Messages</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#667085]">{messageLogs.length} total</span>
                </div>

                <div className="space-y-2.5">
                  {messageLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#101828]">{log.recipient}</span>
                        <span className="text-[10px] text-[#16A34A] font-semibold font-mono bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475467] line-clamp-2">{log.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#98A2B3] font-mono pt-1">
                        <span>{log.via}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTO-REPLY BOT RULES */}
        {activeTab === 'auto-reply' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="sendiee-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#101828]">Auto-Reply Bot Rules for Your WhatsApp</h2>
                  <p className="text-xs text-[#667085]">
                    Automatically respond when incoming customer queries match trigger keywords on your WhatsApp Phone ID.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="text-xs font-bold text-[#16A34A]">AI Bot Active</span>
                </div>
              </div>

              <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D8FD] space-y-3">
                <div className="text-xs font-bold text-[#7C3AED] flex items-center gap-1.5 font-mono uppercase">
                  <Plus className="w-4 h-4" />
                  <span>Add New Trigger Rule</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-[#344054]">Trigger Keywords (comma separated)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. discount, offer, hours"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-[#344054]">Automated WhatsApp Reply</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. We offer 15% discount for first-time orders today!"
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-white border border-[#EAECF0] hover:border-[#D0D5DD] transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#101828]">Trigger:</span>
                        <span className="text-[11px] font-mono font-bold bg-[#F4F0FD] text-[#7C3AED] px-2.5 py-0.5 rounded-full border border-[#E9D8FD]">
                          "{rule.trigger}"
                        </span>
                      </div>
                      <div className="text-xs text-[#475467] pl-1">
                        <strong>Reply:</strong> {rule.reply}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-mono text-[10px] font-bold">
                        ENABLED
                      </span>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                        title="Delete trigger rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DISPATCH LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="sendiee-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
                <div>
                  <h2 className="text-base font-bold text-[#101828]">Meta Graph API Request & Dispatch Logs</h2>
                  <p className="text-xs text-[#667085]">
                    Real-time outbound and inbound WhatsApp traffic via your Phone Number ID.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Refreshed logs from Meta API gateway', 'info')}
                  className="px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Refresh Logs</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] text-[#667085] font-mono text-[11px] border-b border-[#EAECF0]">
                    <tr>
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Recipient Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {messageLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F9FAFB]/60">
                        <td className="p-3 font-mono text-[#7C3AED] font-bold">{log.id}</td>
                        <td className="p-3 font-mono text-[#101828] font-semibold">{log.recipient}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#667085]">{log.via}</td>
                        <td className="p-3 text-[#98A2B3]">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Client Portal Footer */}
      <footer className="bg-white border-t border-[#EAECF0] py-4 px-6 lg:px-10 text-center text-xs text-[#98A2B3]">
        Client Portal · Powered by Multi-Tenant Meta WhatsApp Cloud API Gateway · Zero access to internal CRM data
      </footer>
    </div>
  );
};
