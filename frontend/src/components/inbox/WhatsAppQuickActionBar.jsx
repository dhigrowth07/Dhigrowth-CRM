import React, { useState } from 'react';
import { Store, UserPlus, Share2, Check, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppQuickActionBar = ({
  contact,
  onOpenCatalogue,
  onOpenAddContact,
  variant = 'dark', // 'dark' | 'card' | 'inline'
}) => {
  const { showToast, createLead } = useApp();
  const [copiedShare, setCopiedShare] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!contact) return null;

  const phone = contact.phone || '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const contactName = contact.contactName || 'Customer';

  // 1. Catalogue Action
  const handleCatalogueClick = () => {
    if (onOpenCatalogue) {
      onOpenCatalogue();
    }
  };

  // 2. Add Contact to CRM / Google Sheets Action
  const handleAddClick = async () => {
    if (onOpenAddContact) {
      onOpenAddContact();
      return;
    }

    setIsAdding(true);
    try {
      if (createLead) {
        await createLead({
          name: contactName,
          phone: phone || cleanPhone,
          tag: contact.tag || 'Interested',
          channel: contact.channel || 'whatsapp',
        });
      }
      showToast(`✅ Added ${contactName} to CRM Contacts & Google Sheets!`, 'success');
    } catch {
      showToast(`Contact ${contactName} is already saved in CRM`, 'info');
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Share Action (Direct WhatsApp Link or Web Share API)
  const handleShareClick = async () => {
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}`
      : 'https://wa.me/919791471277';
    const shareData = {
      title: `${contactName} - DhiGrowth WhatsApp CRM`,
      text: `Connect with ${contactName} (${phone}) on WhatsApp:`,
      url: waUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(waUrl);
      setCopiedShare(true);
      showToast(`🔗 Copied ${contactName}'s WhatsApp link to clipboard!`, 'success');
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      showToast('Could not copy link to clipboard', 'error');
    }
  };

  // Render variant 1: Dark (exact match with user's screenshot)
  if (variant === 'dark') {
    return (
      <div className="flex items-center justify-center gap-6 py-4 px-4 bg-[#111214] rounded-2xl border border-white/5 shadow-inner select-none">
        {/* 1. Catalogue Button */}
        <button
          type="button"
          onClick={handleCatalogueClick}
          className="flex flex-col items-center gap-1.5 group cursor-pointer transition-all active:scale-95"
          title="Open Business Services Catalogue"
        >
          <div className="w-12 h-12 rounded-full bg-[#2A2B2E] group-hover:bg-[#383A3F] border border-white/5 flex items-center justify-center text-white transition-all shadow-md group-hover:border-sky-500/30">
            <Store className="w-5 h-5 text-white group-hover:text-sky-400 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">
            Catalogue
          </span>
        </button>

        {/* 2. Add Button */}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={isAdding}
          className="flex flex-col items-center gap-1.5 group cursor-pointer transition-all active:scale-95"
          title="Add / Save Contact in CRM"
        >
          <div className="w-12 h-12 rounded-full bg-[#2A2B2E] group-hover:bg-[#383A3F] border border-white/5 flex items-center justify-center text-white transition-all shadow-md group-hover:border-emerald-500/30">
            {isAdding ? (
              <UserCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <UserPlus className="w-5 h-5 text-white group-hover:text-emerald-400 transition-colors" />
            )}
          </div>
          <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
            {isAdding ? 'Added' : 'Add'}
          </span>
        </button>

        {/* 3. Share Button */}
        <button
          type="button"
          onClick={handleShareClick}
          className="flex flex-col items-center gap-1.5 group cursor-pointer transition-all active:scale-95"
          title="Share WhatsApp Direct Link"
        >
          <div className="w-12 h-12 rounded-full bg-[#2A2B2E] group-hover:bg-[#383A3F] border border-white/5 flex items-center justify-center text-white transition-all shadow-md group-hover:border-sky-500/30">
            {copiedShare ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Share2 className="w-5 h-5 text-white group-hover:text-sky-400 transition-colors" />
            )}
          </div>
          <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
            {copiedShare ? 'Copied' : 'Share'}
          </span>
        </button>
      </div>
    );
  }

  // Render variant 2: Header / Pill compact bar
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[#18191C] rounded-full border border-white/10 shadow-xs">
      <button
        type="button"
        onClick={handleCatalogueClick}
        className="px-2.5 py-1 rounded-full text-[11px] font-bold text-sky-400 hover:bg-[#2A2B2E] flex items-center gap-1.5 transition-all cursor-pointer"
        title="View Catalogue"
      >
        <Store className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden sm:inline">Catalogue</span>
      </button>

      <button
        type="button"
        onClick={handleAddClick}
        className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90 hover:bg-[#2A2B2E] flex items-center gap-1.5 transition-all cursor-pointer"
        title="Add to CRM Contacts"
      >
        <UserPlus className="w-3.5 h-3.5 text-white" />
        <span className="hidden sm:inline">Add</span>
      </button>

      <button
        type="button"
        onClick={handleShareClick}
        className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90 hover:bg-[#2A2B2E] flex items-center gap-1.5 transition-all cursor-pointer"
        title="Share Contact"
      >
        {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-white" />}
        <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
      </button>
    </div>
  );
};
