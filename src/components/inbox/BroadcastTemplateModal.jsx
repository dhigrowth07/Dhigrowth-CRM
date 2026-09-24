import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Check,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  MessageSquare,
  Users,
  Bot,
  Zap,
  Tag,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';
import { BACKEND_URL } from '../../services/apiConfig';

export const DEFAULT_WORKSPACE_PRESETS = [
  {
    id: '2950860201937776',
    rawName: 'new_client_welcome',
    name: 'new_client_welcome',
    displayName: 'new_client_welcome',
    badge: 'Marketing',
    category: 'MARKETING',
    varsCount: '3 VARS',
    header: '{{1}}',
    body: `"Hello {{1}}! ✨\nWishing you and your family a very happy and prosperous {{2}} from all of us at {{3}}. May this season bring you joy, peace, and success.\nThank you for being a valued part of our journey!"`,
    footer: '',
    buttons: [
      { id: 'btn_thank_you', title: '"Thank you!"' },
    ],
  },
  {
    id: '1744607210078710',
    rawName: 'hello_world',
    name: 'hello_world',
    displayName: 'hello_world',
    badge: 'Utility',
    category: 'UTILITY',
    header: 'Hello World',
    body: 'Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.',
    footer: 'WhatsApp Business Platform sample message',
    buttons: [],
  },
  {
    id: 'tpl_custom_template',
    rawName: 'custom_template',
    name: 'Custom Template',
    displayName: 'Custom Template',
    badge: 'Freeform',
    category: 'MARKETING',
    varsCount: '1 VARS',
    header: 'DhiGrowth IT Services',
    body: 'Hi {{name}}! We would love to share our latest updates with you. Would you like more details?',
    footer: 'updates, details, info, more, custom',
    buttons: [
      { id: 'btn_yes', title: 'Yes, please' },
      { id: 'btn_no', title: 'Not right now' },
    ],
  },
];

export const formatTemplatePreset = (tpl) => {
  const rawName = tpl.name || tpl.displayName || 'template';
  const displayName = tpl.displayName || (
    tpl.name === 'new_client_welcome' ? 'new_client_welcome' :
    tpl.name === 'hello_world' ? 'hello_world' :
    tpl.name === 'custom_template' ? 'Custom Template' :
    tpl.name
  );

  let header = tpl.header_content || tpl.header || '';
  if (tpl.header_type === 'TEXT' && tpl.header_content) {
    header = tpl.header_content;
  }
  const body = tpl.body_text || tpl.body || '';
  const footer = tpl.footer_text || tpl.footer || '';

  let buttons = [];
  if (Array.isArray(tpl.buttons)) {
    buttons = tpl.buttons.map((b, idx) => ({
      id: b.id || `btn_${idx + 1}`,
      title: (b.text || b.title || '').replace(/^["']|["']$/g, '').trim(),
    })).filter((b) => b.title);
  }

  const category = (tpl.category || 'MARKETING').toUpperCase();
  const badge = tpl.badge || (category === 'UTILITY' ? 'Utility' : 'Marketing');
  const varsCount = Array.isArray(tpl.variables) && tpl.variables.length > 0
    ? `${tpl.variables.length} VARS`
    : (body.match(/\{\{[^}]+\}\}/g)?.length ? `${new Set(body.match(/\{\{[^}]+\}\}/g)).size} VARS` : null);

  return {
    id: String(tpl.id || tpl.name),
    rawName,
    name: displayName,
    badge,
    category,
    varsCount,
    header,
    body,
    footer,
    buttons,
    status: tpl.status || 'APPROVED',
  };
};

const DYNAMIC_TAGS = [
  { tag: '{{name}}', label: 'Full Name', sample: 'Sri' },
  { tag: '{{first_name}}', label: 'First Name', sample: 'Sri' },
  { tag: '{{phone}}', label: 'Phone', sample: '+919791471277' },
];

export const BroadcastTemplateModal = ({ onClose }) => {
  const {
    chats = [],
    isBroadcastTemplateModalOpen,
    setIsBroadcastTemplateModalOpen,
    currentWorkspaceId,
    showToast,
  } = useApp();

  const [presets, setPresets] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId || 'default'}`;
        let deletedList = [];
        try {
          const s = localStorage.getItem(deletedKey);
          if (s) deletedList = JSON.parse(s);
        } catch {}

        const saved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId || 'default'}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const active = parsed.filter(t => !deletedList.includes(String(t.id)) && (!t.name || !deletedList.includes(t.name)));
            if (active.length > 0) {
              return active.map(formatTemplatePreset);
            }
          }
        }
      }
    } catch {}
    return DEFAULT_WORKSPACE_PRESETS;
  });

  const initialPreset = presets[0] || DEFAULT_WORKSPACE_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);
  const [headerText, setHeaderText] = useState(initialPreset.header || '');
  const [bodyText, setBodyText] = useState(initialPreset.body || '');
  const [footerText, setFooterText] = useState(initialPreset.footer || '');
  const [button1Text, setButton1Text] = useState(initialPreset.buttons[0]?.title || '');
  const [button2Text, setButton2Text] = useState(initialPreset.buttons[1]?.title || '');
  const [showPreview, setShowPreview] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSummary, setBroadcastSummary] = useState(null);

  // Sync templates dynamically from workspace store & API
  useEffect(() => {
    if (!isBroadcastTemplateModalOpen) return;

    let isMounted = true;
    const fetchLatestTemplates = async () => {
      try {
        const deletedKey = `dhigrowth_deleted_templates_${currentWorkspaceId || 'default'}`;
        let deletedList = [];
        try {
          const s = localStorage.getItem(deletedKey);
          if (s) deletedList = JSON.parse(s);
        } catch {}

        let list = null;
        const saved = localStorage.getItem(`dhigrowth_templates_${currentWorkspaceId || 'default'}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed;
            }
          } catch {}
        }

        try {
          const res = await fetch(`${BACKEND_URL}/api/meta/templates?workspaceId=${encodeURIComponent(currentWorkspaceId || 'default')}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.templates && Array.isArray(data.templates) && data.templates.length > 0) {
              list = data.templates;
            }
          }
        } catch {}

        if (!list) {
          try {
            const res = await fetch(`http://localhost:4000/api/meta/templates?workspaceId=${encodeURIComponent(currentWorkspaceId || 'default')}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.templates && Array.isArray(data.templates) && data.templates.length > 0) {
                list = data.templates;
              }
            }
          } catch {}
        }

        if (list && isMounted) {
          const filtered = list.filter(t => !deletedList.includes(String(t.id)) && (!t.name || !deletedList.includes(t.name)));
          const formatted = filtered.map(formatTemplatePreset);
          if (formatted.length > 0) {
            setPresets(formatted);
          }
        }
      } catch (err) {
        console.warn('Could not refresh templates:', err);
      }
    };

    fetchLatestTemplates();
    return () => { isMounted = false; };
  }, [isBroadcastTemplateModalOpen, currentWorkspaceId]);

  // Ensure current selection is valid when presets update
  useEffect(() => {
    if (presets && presets.length > 0) {
      const current = presets.find((p) => p.id === selectedPresetId);
      if (!current) {
        handleSelectPreset(presets[0]);
      }
    }
  }, [presets, selectedPresetId]);

  // Extract unique contacts from chats
  const [selectedContacts, setSelectedContacts] = useState(() => {
    const seen = new Set();
    const list = [];
    chats.forEach((c) => {
      const rawPhone = c.phone || c.phone_number || '';
      const clean = rawPhone.replace(/[^0-9]/g, '');
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        list.push({
          id: c.id,
          name: c.contactName || c.name || 'Valued Client',
          phone: clean,
          avatar: c.avatar,
        });
      }
    });
    return list;
  });

  const textareaRef = useRef(null);
  const summaryRef = useRef(null);
  const scrollContainerRef = useRef(null);

  if (!isBroadcastTemplateModalOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setHeaderText(preset.header);
    setBodyText(preset.body);
    setFooterText(preset.footer);
    setButton1Text(preset.buttons[0]?.title || 'Yes');
    setButton2Text(preset.buttons[1]?.title || 'Tell me more');
  };

  const handleInsertTag = (tag) => {
    if (!textareaRef.current) {
      setBodyText((prev) => prev + ' ' + tag);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const next = bodyText.substring(0, start) + tag + bodyText.substring(end);
    setBodyText(next);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + tag.length, start + tag.length);
      }
    }, 50);
  };

  const toggleContact = (phone) => {
    setSelectedContacts((prev) => {
      const exists = prev.some((c) => c.phone === phone);
      if (exists) {
        return prev.filter((c) => c.phone !== phone);
      } else {
        const found = chats.find((c) => (c.phone || '').replace(/[^0-9]/g, '') === phone);
        return [
          ...prev,
          {
            id: found?.id || phone,
            name: found?.contactName || 'Valued Client',
            phone,
            avatar: found?.avatar,
          },
        ];
      }
    });
  };

  const handleSelectAll = () => {
    const seen = new Set();
    const all = [];
    chats.forEach((c) => {
      const raw = c.phone || c.phone_number || '';
      const clean = raw.replace(/[^0-9]/g, '');
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        all.push({
          id: c.id,
          name: c.contactName || 'Valued Client',
          phone: clean,
          avatar: c.avatar,
        });
      }
    });
    setSelectedContacts(all);
  };

  const handleDeselectAll = () => {
    setSelectedContacts([]);
  };

  // Live preview text with resolved {{name}} and numbered variables
  const previewSampleName = selectedContacts[0]?.name || 'Sri';
  const resolvedPreviewText = (bodyText || '')
    .replaceAll('{{name}}', previewSampleName)
    .replaceAll('{{first_name}}', previewSampleName.split(' ')[0] || previewSampleName)
    .replaceAll('{{phone}}', selectedContacts[0]?.phone ? `+${selectedContacts[0].phone}` : '+919791471277')
    .replaceAll('{{1}}', previewSampleName)
    .replaceAll('{{2}}', 'Diwali & New Year')
    .replaceAll('{{3}}', 'DhiGrowth IT Services');

  const resolvedPreviewHeader = (headerText || '')
    .replaceAll('{{name}}', previewSampleName)
    .replaceAll('{{first_name}}', previewSampleName.split(' ')[0] || previewSampleName)
    .replaceAll('{{1}}', previewSampleName);

  const handleBroadcast = async () => {
    if (!bodyText.trim()) {
      showToast('Please enter message text for the template', 'error');
      return;
    }

    if (selectedContacts.length === 0) {
      showToast('Please select at least one contact to receive the broadcast', 'error');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastSummary(null);

    const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

    const buttons = [];
    if (button1Text.trim()) {
      buttons.push({ id: 'btn_1', title: button1Text.trim() });
    }
    if (button2Text.trim()) {
      buttons.push({ id: 'btn_2', title: button2Text.trim() });
    }

    const payload = {
      contacts: selectedContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
      })),
      templateName: selectedPreset?.rawName || selectedPreset?.name || 'custom_template',
      headerText: headerText.trim() || undefined,
      bodyText: bodyText.trim(),
      footerText: footerText.trim() || undefined,
      buttons,
      workspaceId: currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001',
    };

    try {
      let res;
      // 1. Try local Node server first
      try {
        res = await fetch('http://localhost:4000/api/templates/broadcast-to-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      // 2. Try configured BACKEND_URL
      if (!res || !res.ok) {
        try {
          res = await fetch(`${BACKEND_URL}/api/templates/broadcast-to-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        const summary = data.summary || {
          total: selectedContacts.length,
          dispatched: selectedContacts.length,
          failed: 0,
          results: selectedContacts.map((c) => ({
            name: c.name,
            phone: c.phone,
            success: true,
            metaDelivered: true,
          })),
        };
        setBroadcastSummary(summary);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (summary.failed > 0) {
          showToast(
            `⚠️ Broadcast completed: ${summary.dispatched} Delivered / Received, ${summary.failed} Failed`,
            'info'
          );
        } else {
          showToast(
            `🚀 Successfully delivered template to all ${summary.dispatched} contacts!`,
            'success'
          );
        }

        // Auto-scroll down to show the delivery results breakdown
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err) {
      console.error('Broadcast template error:', err);
      // Construct a visible summary so the user sees which failed and why
      const failSummary = {
        total: selectedContacts.length,
        dispatched: 0,
        failed: selectedContacts.length,
        results: selectedContacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          success: false,
          error: err.message || 'Network connection failed',
        })),
      };
      setBroadcastSummary(failSummary);
      showToast('Could not complete broadcast: ' + err.message, 'error');
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleClose = () => {
    setIsBroadcastTemplateModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EAECF0] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAECF0] flex items-center justify-between bg-linear-to-r from-[#F0F9FF] to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 flex items-center justify-center text-[#0284C7] border border-[#BAE6FD]">
              <Sparkles className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#101828]">Broadcast Template with "Yes" Reply Button</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  Interactive Quick Reply
                </span>
              </div>
              <p className="text-xs text-[#475467]">
                Send WhatsApp messages with 1-click interactive response buttons. When contacts tap "Yes", AI Auto-Pilot replies automatically!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#344054] uppercase tracking-wide">
                1. Choose Template Preset ({presets.length} Active Templates)
              </label>
              <span className="text-[11px] text-[#0284C7] font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Synced from Meta Templates
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0284C7] bg-[#F0F9FF] shadow-xs ring-2 ring-[#0284C7]/20'
                        : 'border-[#EAECF0] hover:border-[#D0D5DD] bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-[#101828] truncate">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#0284C7] font-semibold bg-[#E0F2FE] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          {preset.badge || preset.category}
                        </span>
                        {preset.varsCount && (
                          <span className="text-[10px] text-[#475467] font-semibold bg-[#F2F4F7] px-1.5 py-0.5 rounded-sm">
                            {preset.varsCount}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">
                          APPROVED
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#475467] line-clamp-2">
                      {preset.buttons && preset.buttons.length > 0
                        ? preset.buttons.map((b) => b.title).join(' • ')
                        : (preset.footer || 'Standard Meta notification')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Left Form & Right WhatsApp Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Message Customizer */}
            <div className="lg:col-span-7 space-y-4">
              {/* Header Text Input */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Header Title <span className="text-[11px] font-normal text-[#667085]">(Optional, displayed in bold)</span>
                </label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="e.g. DhiGrowth IT Services"
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Message Body & Dynamic Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#344054]">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#667085] font-medium">Insert tag:</span>
                    {DYNAMIC_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => handleInsertTag(t.tag)}
                        className="text-[10px] font-mono font-bold text-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] px-1.5 py-0.5 rounded cursor-pointer transition-all"
                        title={`Click to insert ${t.label}`}
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Type your WhatsApp message..."
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-3 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all font-mono leading-relaxed"
                />
              </div>

              {/* Interactive Quick Reply Buttons */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#EAECF0] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span className="text-xs font-bold text-[#101828]">Quick-Reply Buttons</span>
                  </div>
                  <span className="text-[10px] text-[#667085]">1-tap reply in WhatsApp (max 20 chars)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#16A34A] mb-1 flex items-center gap-1">
                      <span>Button 1: Positive Reply</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">Primary</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={button1Text}
                      onChange={(e) => setButton1Text(e.target.value)}
                      placeholder="e.g. Yes, I'm interested"
                      className="w-full bg-white border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs font-bold text-[#15803D] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1 flex items-center gap-1">
                      <span>Button 2: Secondary Option</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">Optional</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={button2Text}
                      onChange={(e) => setButton2Text(e.target.value)}
                      placeholder="e.g. Tell me more"
                      className="w-full bg-white border border-[#EAECF0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475467] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>

                {/* Footer Text */}
                <div>
                  <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                    Footer Note <span className="text-[10px] text-[#98A2B3]">(Small helper text)</span>
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g. Tap an option to respond:"
                    className="w-full bg-white border border-[#EAECF0] px-3 py-1 rounded-lg text-xs text-[#64748B] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
            </div>

            {/* Right: WhatsApp Live Chat Simulation Preview */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>WhatsApp Live Preview</span>
                </span>
                <span className="text-[10px] text-[#0284C7] bg-[#F0F9FF] px-2 py-0.5 rounded-full font-bold">
                  Simulating: {previewSampleName}
                </span>
              </div>

              {/* Phone Mockup Window */}
              <div className="bg-[#EFEAE2] border border-[#CBD5E1] rounded-2xl p-3.5 flex-1 flex flex-col justify-between shadow-inner relative overflow-hidden min-h-[300px]">
                {/* Subtle WhatsApp chat pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* WhatsApp Chat Bubble */}
                <div className="max-w-[95%] bg-white rounded-2xl rounded-tl-xs shadow-xs border border-black/5 overflow-hidden z-10">
                  {/* Bubble Content */}
                  <div className="p-3.5 space-y-2">
                    {headerText && (
                      <div className="font-bold text-[13px] text-[#111B21] border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>{resolvedPreviewHeader || headerText}</span>
                      </div>
                    )}
                    <div className="text-[12px] text-[#111B21] whitespace-pre-wrap leading-relaxed">
                      {resolvedPreviewText || 'Your message preview will appear here...'}
                    </div>
                    {footerText && (
                      <div className="text-[10px] text-[#667781] pt-1">
                        {footerText}
                      </div>
                    )}
                    <div className="text-[9px] text-[#667781] text-right">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>

                  {/* Interactive Quick Reply Buttons in Preview */}
                  <div className="border-t border-[#E9EDEF] bg-[#F8FAFC]/50 divide-y divide-[#E9EDEF]">
                    {button1Text.trim() && (
                      <div className="py-2.5 px-3 text-center text-xs font-bold text-[#00A884] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer">
                        <Check className="w-3.5 h-3.5 text-[#00A884]" />
                        <span>{button1Text}</span>
                      </div>
                    )}
                    {button2Text.trim() && (
                      <div className="py-2.5 px-3 text-center text-xs font-medium text-[#00A884] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer">
                        <span>{button2Text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Concierge Intelligence Hint */}
                <div className="mt-3 p-2.5 bg-white/90 backdrop-blur-xs rounded-xl border border-[#CBD5E1] text-[11px] text-[#475467] flex items-start gap-2 z-10">
                  <Bot className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0284C7]">Automated AI Follow-up: </span>
                    When contacts tap <span className="font-semibold text-emerald-700">"{button1Text}"</span>, Dhigrowth AI Concierge immediately acknowledges their interest and guides them to book a call or share details!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Audience Section */}
          <div className="p-4 bg-[#F8FAFC] border border-[#EAECF0] rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-bold text-[#101828]">
                  Recipient Audience ({selectedContacts.length} Selected)
                </span>
                {broadcastSummary && (
                  <div className="flex items-center gap-1.5 text-[11px] ml-1">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {broadcastSummary.dispatched} Received
                    </span>
                    {broadcastSummary.failed > 0 && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        {broadcastSummary.failed} Failed
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer"
                >
                  Select All ({chats.length})
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-[11px] font-medium text-[#667085] hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Contacts Chips with Received / Failed delivery indicators */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {(() => {
                const resultMap = new Map(
                  (broadcastSummary?.results || []).map((r) => [
                    (r.phone || '').replace(/[^0-9]/g, '').slice(-10),
                    r,
                  ])
                );

                return chats.map((c) => {
                  const raw = c.phone || c.phone_number || '';
                  const clean = raw.replace(/[^0-9]/g, '');
                  if (!clean) return null;
                  const isSelected = selectedContacts.some((sc) => sc.phone === clean);
                  const result = resultMap.get(clean.slice(-10));
                  const isDelivered = Boolean(result?.success);
                  const isFailed = Boolean(result && !result.success);

                  let chipClasses = 'bg-white border-[#EAECF0] text-[#667085] hover:border-[#D0D5DD]';
                  if (isDelivered) {
                    chipClasses = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs ring-1 ring-emerald-400/30';
                  } else if (isFailed) {
                    chipClasses = 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs ring-1 ring-rose-400/30';
                  } else if (isSelected) {
                    chipClasses = 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1] font-bold shadow-2xs';
                  }

                  return (
                    <button
                      key={c.id || clean}
                      type="button"
                      onClick={() => toggleContact(clean)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${chipClasses}`}
                      title={isFailed ? (result.error || 'Delivery failed') : isDelivered ? 'Received and delivered to WhatsApp' : ''}
                    >
                      {isBroadcasting && isSelected ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284C7] shrink-0" />
                      ) : isDelivered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isFailed ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: isSelected ? '#0284C7' : '#D0D5DD' }}
                        />
                      )}
                      <span>{c.contactName || 'Client'}</span>
                      <span className="text-[10px] opacity-75 font-mono">+{clean.slice(-10)}</span>

                      {/* Live Received or Failed Status Badge */}
                      {isDelivered && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-300 shrink-0">
                          ✓ Received
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md border border-rose-300 shrink-0">
                          ✕ Failed
                        </span>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Broadcast Results Summary */}
          {broadcastSummary && (
            <div
              ref={summaryRef}
              className={`p-4 rounded-xl border animate-in fade-in space-y-3 ${
                broadcastSummary.failed > 0 && broadcastSummary.dispatched === 0
                  ? 'bg-rose-50 border-rose-200'
                  : broadcastSummary.failed > 0
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div
                  className={`flex items-center gap-2 font-bold text-sm ${
                    broadcastSummary.failed > 0 && broadcastSummary.dispatched === 0
                      ? 'text-rose-800'
                      : broadcastSummary.failed > 0
                      ? 'text-amber-900'
                      : 'text-emerald-800'
                  }`}
                >
                  {broadcastSummary.failed > 0 && broadcastSummary.dispatched === 0 ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span>
                    {broadcastSummary.failed > 0 && broadcastSummary.dispatched === 0
                      ? 'Broadcast Delivery Incomplete'
                      : broadcastSummary.failed > 0
                      ? 'Broadcast Completed with Partial Delivery'
                      : 'Broadcast Completed Successfully!'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ {broadcastSummary.dispatched} Received
                  </span>
                  {broadcastSummary.failed > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      ✕ {broadcastSummary.failed} Failed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-bold block">TOTAL TARGETS</span>
                  <span className="text-base font-extrabold text-gray-900">{broadcastSummary.total}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-emerald-600 font-bold block">RECEIVED / DELIVERED</span>
                  <span className="text-base font-extrabold text-emerald-700">{broadcastSummary.dispatched}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                  <span className="text-[10px] text-rose-500 font-bold block">FAILED</span>
                  <span className="text-base font-extrabold text-rose-600">{broadcastSummary.failed || 0}</span>
                </div>
              </div>

              {/* Per-Contact Delivery Breakdown */}
              {broadcastSummary.results && broadcastSummary.results.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pt-2 border-t border-gray-200/60">
                  <span className="text-[11px] font-bold text-gray-700 block">Recipient Delivery Status:</span>
                  {broadcastSummary.results.map((r, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                        r.success
                          ? 'bg-white border-emerald-100 text-emerald-900'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {r.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold">{r.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono ml-1.5">+{r.phone}</span>
                        </div>
                      </div>
                      <div className="text-[11px] font-medium text-right">
                        {r.success ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Delivered to WhatsApp ✓✓
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-rose-700 font-bold bg-rose-100/70 px-2 py-0.5 rounded-md border border-rose-200">
                              {r.error?.includes('131030') || r.error?.includes('allowed list')
                                ? 'Not in Meta Test Allowed List'
                                : r.error || 'Failed to deliver'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {broadcastSummary.failed > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>💡 Why did some numbers fail?</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-amber-700">
                        If Meta Developer mode is active, WhatsApp only delivers to verified numbers registered in the <em>Allowed Recipients</em> list. For full unlimited delivery to any phone number worldwide, link your permanent Business WhatsApp Cloud API number in Settings.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#667085]">
            {broadcastSummary ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#101828]">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {broadcastSummary.dispatched} Received / Delivered
                </span>
                {broadcastSummary.failed > 0 && (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    {broadcastSummary.failed} Failed
                  </span>
                )}
              </div>
            ) : (
              <>
                Targeting <strong className="text-[#101828]">{selectedContacts.length}</strong> contacts on official WhatsApp Cloud API
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {broadcastSummary ? (
              <>
                <button
                  type="button"
                  onClick={() => setBroadcastSummary(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#344054] hover:bg-[#EAECF0] border border-[#D0D5DD] transition-all cursor-pointer"
                >
                  Send Another
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isBroadcasting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#344054] hover:bg-[#EAECF0] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || selectedContacts.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white shadow-md transition-all cursor-pointer ${
                    isBroadcasting || selectedContacts.length === 0
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] shadow-sky-500/20 active:scale-95'
                  }`}
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching to WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Send Template to All ({selectedContacts.length})</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
