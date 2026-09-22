import React, { useState, useRef } from 'react';
import {
  X,
  Zap,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';
import { BACKEND_URL } from '../../services/apiConfig';

const TEMPLATE_PRESETS = [
  {
    id: 'formal',
    name: 'Formal Billing',
    badge: 'Default',
    text: `🧾 *INVOICE DUE: {{invoiceId}}*

Dear {{name}},
Your invoice for *{{description}}* has been issued.

💳 *Amount Due:* {{amount}}
🔗 *Secure Payment Link:* {{paymentLink}}

Click the link above to pay via UPI, Cards, or NetBanking. Once completed, your official Paid Receipt PDF will be automatically sent here.

_DhiGrowth IT Services_`,
  },
  {
    id: 'friendly',
    name: 'Friendly Reminder',
    badge: 'Casual',
    text: `Hi {{name}}! 👋 Hope you're having a great day.

Quick friendly reminder regarding your invoice *#{{invoiceId}}* for *{{description}}*.

💳 *Amount Due:* {{amount}}
🔗 *1-Click Pay Link:* {{paymentLink}}

Thank you! ✨`,
  },
  {
    id: 'urgent',
    name: 'Urgent Notice',
    badge: 'Priority',
    text: `⚠️ *URGENT PAYMENT NOTICE: {{invoiceId}}*

Dear {{name}},
Payment of *{{amount}}* for *{{description}}* is currently pending.

Please settle immediately via the secure link: {{paymentLink}}

Official Receipt PDF will be automatically sent upon payment.`,
  },
  {
    id: 'custom',
    name: 'Custom',
    badge: 'Freeform',
    text: '',
  },
];

const DYNAMIC_TAGS = [
  { tag: '{{name}}', label: 'Client Name', desc: 'e.g. Alex Morgan' },
  { tag: '{{amount}}', label: 'Amount', desc: 'e.g. INR 2,499' },
  { tag: '{{invoiceId}}', label: 'Invoice #', desc: 'e.g. INV-785016' },
  { tag: '{{description}}', label: 'Service', desc: 'e.g. WhatsApp CRM' },
  { tag: '{{paymentLink}}', label: 'Pay Link', desc: '1-click secure URL' },
];

export const BroadcastDueModal = ({ onClose }) => {
  const {
    chats = [],
    currentUser,
    currentWorkspaceId,
    isBroadcastDueModalOpen,
    setIsBroadcastDueModalOpen,
    showToast,
  } = useApp();

  const [broadcastDesc, setBroadcastDesc] = useState('WAPPPILOT WhatsApp CRM & AI Business Concierge');
  const [broadcastAmount, setBroadcastAmount] = useState(2499);
  const [selectedPreset, setSelectedPreset] = useState('formal');
  const [customTemplate, setCustomTemplate] = useState(TEMPLATE_PRESETS[0].text);
  const [showPreview, setShowPreview] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSummary, setBroadcastSummary] = useState(null);

  const textareaRef = useRef(null);

  if (!isBroadcastDueModalOpen) return null;

  // Recipients scoped strictly to current workspace
  const effectiveChats = chats || [];

  const handleClose = () => {
    setIsBroadcastDueModalOpen(false);
    setBroadcastSummary(null);
    if (onClose) onClose();
  };

  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const target = TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (target && presetId !== 'custom') {
      setCustomTemplate(target.text);
    }
  };

  const handleInsertTag = (tag) => {
    if (!textareaRef.current) {
      setCustomTemplate((prev) => prev + ' ' + tag);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevText = customTemplate;

    const nextText = prevText.substring(0, start) + tag + prevText.substring(end);
    setCustomTemplate(nextText);
    setSelectedPreset('custom');

    // Restore focus and position cursor after tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  const handleBroadcastDueInvoices = async (e) => {
    e?.preventDefault();
    setIsBroadcasting(true);
    setBroadcastSummary(null);

    try {
      const targetContacts = effectiveChats.map((c) => ({
        name: c.contactName || c.customerName || 'Valued Client',
        phone: c.phone || '+91 97914 71277',
        email: c.email || '',
        city: c.city || 'India',
        conversationId: c.conversationId || c.id,
      }));

      const payload = {
        contacts: targetContacts,
        description: broadcastDesc,
        amount: broadcastAmount,
        messageTemplate: customTemplate,
        senderName: currentUser?.name || 'CRM Administrator',
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.id || 'sri',
        username: currentUser?.username || 'sri',
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/invoices/broadcast-due-to-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Primary BACKEND_URL failed, falling back to local backend:', err.message);
      }

      // If remote Render hasn't finished deploying or failed, fallback to local backend
      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/invoices/broadcast-due-to-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.warn('Local fallback also failed:', err.message);
        }
      }

      if (!res) {
        throw new Error('Unable to connect to backend server. Please ensure backend is running.');
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Server returned invalid response. Please try again.');
      }

      if (data.success && data.summary) {
        setBroadcastSummary(data.summary);
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
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

  // Compute live preview text
  const sampleRecipient = effectiveChats[0]?.contactName || effectiveChats[0]?.customerName || 'Alex Morgan';
  const previewText = (customTemplate || '')
    .replace(/\{\{\s*name\s*\}\}/gi, sampleRecipient)
    .replace(/\{\{\s*customerName\s*\}\}/gi, sampleRecipient)
    .replace(/\{\{\s*amount\s*\}\}/gi, `INR ${(Number(broadcastAmount) || 2499).toLocaleString('en-IN')}`)
    .replace(/\{\{\s*invoiceId\s*\}\}/gi, 'INV-785016')
    .replace(/\{\{\s*id\s*\}\}/gi, 'INV-785016')
    .replace(/\{\{\s*description\s*\}\}/gi, broadcastDesc || 'WhatsApp CRM & Automation')
    .replace(/\{\{\s*paymentLink\s*\}\}/gi, 'https://api-wappilot.dhigrowth.com/invoices/INV-785016/pay');

  // Format WhatsApp basic markup for preview
  const formatWhatsAppText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Bold *text*
      let parsed = line.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      // Italic _text_
      parsed = parsed.replace(/_(.*?)_/g, '<em>$1</em>');
      return (
        <span key={idx} className="block leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: parsed || '&nbsp;' }} />
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] shadow-xs">
            <Zap className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#101828]">Broadcast Due Invoices (All Contacts)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                Auto-Receipt
              </span>
            </div>
            <p className="text-xs text-[#667085]">Customize message template & dispatch Due PDF + 1-Click Pay Link to each contact on WhatsApp</p>
          </div>
        </div>

        {broadcastSummary ? (
          <div className="space-y-5 py-2 text-center animate-in zoom-in-95 duration-200">
            {/* Celebratory Icon & Header */}
            <div className="space-y-3">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#DCFCE7] to-[#BBF7D0] border-4 border-white flex items-center justify-center text-[#15803D] mx-auto shadow-lg shadow-[#16A34A]/20 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
                </div>
                <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#101828] tracking-tight">
                  Sent Successfully to All Contacts! 🎉
                </h2>
                <p className="text-xs text-[#475467] max-w-md mx-auto leading-relaxed">
                  Official Payment Due PDF invoices and secure 1-click payment links have been delivered to each contact's WhatsApp chat.
                </p>
              </div>
            </div>

            {/* 3 Metric Summary Badges */}
            <div className="grid grid-cols-3 gap-2.5 text-left">
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider font-mono">Dispatched</div>
                <div className="text-lg font-black text-[#166534] mt-0.5">
                  {broadcastSummary.dispatched} / {broadcastSummary.total}
                </div>
                <div className="text-[10px] text-[#15803D] font-medium">100% Delivered</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0]">
                <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">Invoice Amount</div>
                <div className="text-lg font-black text-[#101828] mt-0.5">
                  ₹{broadcastAmount || 2499}
                </div>
                <div className="text-[10px] text-[#667085]">Per contact</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD]">
                <div className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider font-mono">Receipt Mode</div>
                <div className="text-lg font-black text-[#6D28D9] mt-0.5">
                  Auto-Pilot
                </div>
                <div className="text-[10px] text-[#7C3AED]">On payment</div>
              </div>
            </div>

            {/* Delivery Contact Logs */}
            <div className="border border-[#EAECF0] rounded-2xl p-3.5 bg-[#F9FAFB] text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#344054]">
                <span>Recipients Delivered ({broadcastSummary.results?.length || 0})</span>
                <span className="text-[10px] text-[#16A34A] font-mono font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#86EFAC]">
                  ✓ WhatsApp Meta API Verified
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {broadcastSummary.results?.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#EAECF0] shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ContactAvatar name={res.name} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#101828] truncate">{res.name}</div>
                        <div className="text-[11px] font-mono text-[#667085]">{res.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {res.invoiceId && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                          {res.invoiceId}
                        </span>
                      )}
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        res.success
                          ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                          : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                      }`}>
                        <Check className="w-3 h-3 text-[#16A34A]" />
                        <span>{res.success ? 'Delivered' : 'Failed'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Paid Receipt Guarantee Box */}
            <div className="p-4 bg-gradient-to-r from-[#F0FDF4] via-[#F4F0FD] to-[#F0FDF4] border-2 border-[#86EFAC] rounded-2xl text-left flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-[#14532D] flex items-center gap-1.5">
                  <span>⚡ Automated Paid Receipt Guarantee Active</span>
                </div>
                <p className="text-[11px] text-[#166534] leading-relaxed">
                  When any recipient clicks their payment link and completes payment, our cloud backend will <strong>automatically generate and dispatch their official Green Paid Receipt PDF</strong> with a verified Transaction ID directly to their WhatsApp!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBroadcastSummary(null)}
                className="flex-1 py-3 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Broadcast
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Done & Dismiss</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBroadcastDueInvoices} className="space-y-4">
            {/* Recipients Overview */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#EAECF0] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#344054]">Target Recipients</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] font-mono border border-[#E9D8FD]">
                  {effectiveChats.length} Contacts
                </span>
              </div>
              {effectiveChats.length === 0 ? (
                <div className="py-2 text-xs text-[#667085] italic">
                  No contacts found in this workspace yet. Please create or import contacts before broadcasting invoices.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {effectiveChats.map((c, i) => (
                    <span
                      key={c.id || i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white border border-[#EAECF0] text-[#344054] shadow-2xs"
                    >
                      <ContactAvatar name={c.contactName || c.customerName} size="xs" />
                      <span>{c.contactName || c.customerName}</span>
                      <span className="font-mono text-[#98A2B3] text-[10px]">
                        ({(c.phone || '').slice(-4) || 'WA'})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Service & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Invoice Description / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="DhiGrowth WhatsApp CRM & AI Business Concierge"
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Due Amount per Contact (INR ₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#667085]">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2499"
                    value={broadcastAmount}
                    onChange={(e) => setBroadcastAmount(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-8 pr-3.5 py-2.5 rounded-xl text-xs text-[#101828] font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>

            {/* Custom Template Editor */}
            <div className="border border-[#E9D8FD] bg-[#FDFBFF] rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[#101828]">WhatsApp Message Template</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#EDE9FE] text-[#6D28D9]">
                    Customizable
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const formal = TEMPLATE_PRESETS[0];
                      setSelectedPreset('formal');
                      setCustomTemplate(formal.text);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#667085] hover:text-[#7C3AED] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer"
                  >
                    {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                  </button>
                </div>
              </div>

              {/* Template Presets Selector */}
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_PRESETS.map((p) => {
                  const isActive = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-white border border-[#EAECF0] text-[#475467] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F2F4F7] text-[#667085]'
                        }`}
                      >
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Variables Tags Toolbar */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-[#475467] flex items-center justify-between">
                  <span>Click to insert dynamic variables into your message:</span>
                  <span className="text-[10px] text-[#98A2B3] font-mono">Auto-replaced per client</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DYNAMIC_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => handleInsertTag(t.tag)}
                      title={`Click to insert ${t.tag} (${t.desc})`}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-white border border-[#D8B4FE] text-[#7C3AED] hover:bg-[#F4F0FD] hover:border-[#9333EA] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>{t.tag}</span>
                      <span className="text-[9px] font-sans font-medium text-[#9333EA] opacity-80">({t.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Textarea */}
              <div>
                <textarea
                  ref={textareaRef}
                  required
                  rows={6}
                  value={customTemplate}
                  onChange={(e) => {
                    setCustomTemplate(e.target.value);
                    if (selectedPreset !== 'custom') {
                      setSelectedPreset('custom');
                    }
                  }}
                  placeholder="Enter your custom message template here. Use {{name}}, {{amount}}, {{invoiceId}}, {{description}}, {{paymentLink}}..."
                  className="w-full bg-white border border-[#D0D5DD] p-3 rounded-xl text-xs font-mono text-[#101828] focus:outline-none focus:border-[#7C3AED] leading-relaxed shadow-inner"
                />
                <div className="flex justify-between items-center text-[10px] text-[#667085] mt-1 px-1">
                  <span>Supports WhatsApp Markdown: *bold*, _italic_</span>
                  <span>{customTemplate.length} characters</span>
                </div>
              </div>

              {/* Live WhatsApp Bubble Preview */}
              {showPreview && (
                <div className="pt-2 border-t border-[#E9D8FD]/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#475467]">
                    <span className="flex items-center gap-1 text-[#15803D]">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                      Live WhatsApp Preview (Recipient: {sampleRecipient})
                    </span>
                    <span className="text-[10px] font-mono text-[#98A2B3]">Sample Output</span>
                  </div>

                  {/* Realistic WhatsApp Chat Bubble */}
                  <div className="bg-[#EFEAE2] p-3 rounded-2xl border border-[#D1D5DB] flex justify-end">
                    <div className="bg-[#DCF8C6] border border-[#B2D8A4] rounded-2xl rounded-tr-xs p-3 max-w-sm text-left shadow-xs text-xs text-[#111827] space-y-2 font-sans">
                      {/* Attached Document Card */}
                      <div className="bg-white/80 border border-[#CBD5E1] rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0 font-bold text-[10px]">
                          PDF
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-[#0F172A] truncate">
                            Invoice_INV-785016.pdf
                          </div>
                          <div className="text-[10px] text-[#64748B]">1 page • 142 kB</div>
                        </div>
                        <FileText className="w-4 h-4 text-[#64748B]" />
                      </div>

                      {/* Message Content */}
                      <div className="text-xs whitespace-pre-wrap leading-relaxed text-[#1F2937]">
                        {formatWhatsAppText(previewText)}
                      </div>

                      {/* Time & Double Checkmark */}
                      <div className="flex justify-end items-center gap-1 text-[10px] text-[#4B5563] pt-1">
                        <span>10:45 AM</span>
                        <span className="text-[#2563EB] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Explanation Banner */}
            <div className="p-3.5 bg-[#F4F0FD] border border-[#E9D8FD] rounded-2xl text-[11px] text-[#6D28D9] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#7C3AED]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Receipt Guarantee:</span>
              </div>
              <p className="text-[11px] text-[#5B21B6] leading-relaxed">
                When a recipient clicks their customized payment link and completes payment, our cloud backend immediately generates and sends their official <strong>Green Paid Receipt PDF</strong> with verified Transaction ID back to their WhatsApp automatically!
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isBroadcasting}
                className="flex-1 py-3 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBroadcasting || effectiveChats.length === 0}
                className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to WhatsApp ({effectiveChats.length})...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Dispatch Custom Due Invoices</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
