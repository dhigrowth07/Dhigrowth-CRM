import React, { useState } from 'react';
import {
  PhoneCall,
  ShoppingBag,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleSheetsIntegrationModal } from './GoogleSheetsIntegrationModal';

export const IntegrationsHubPage = () => {
  const { showToast, setActiveTab } = useApp();
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);

  const APPS = [
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      badge: 'GS',
      badgeBg: 'bg-[#0F9D58] text-white',
      desc: 'Capture customer requirements (Service, Name, Phone & Purpose) via WhatsApp bot and stream them into your Google Sheet.',
      actionText: 'Configure Sheets',
      onClick: () => setIsGoogleSheetsOpen(true),
    },
    {
      id: 'millis',
      name: 'Millis.ai',
      badge: 'ms',
      badgeBg: 'bg-[#06B6D4] text-white',
      desc: 'Integrate with Millis to enhance your calling agent experience.',
      actionText: 'Configure',
      onClick: () => showToast('Opening Millis.ai Voice AI calling configuration', 'info'),
    },
    {
      id: 'woocommerce',
      name: 'Woocommerce',
      badge: 'Woo',
      badgeBg: 'bg-[#96588A] text-white',
      desc: 'Integrate with Woocommerce to integrate your store and manage orders in chat seamlessly.',
      actionText: 'Configure',
      onClick: () => showToast('Opening WooCommerce REST API store connector', 'info'),
    },
    {
      id: 'shopify',
      name: 'Shopify',
      badge: 'S',
      badgeBg: 'bg-[#95BF47] text-white',
      desc: 'Integrate with Shopify to enhance your e-commerce experience with WAPPPILOT.',
      actionText: 'Shopify Settings',
      onClick: () => setActiveTab('shopify'),
    },
    {
      id: 'meta_pixel',
      name: 'Meta Pixel',
      badge: '∞',
      badgeBg: 'bg-[#0866FF] text-white',
      desc: 'Send customer events like ViewContent, Purchase, InitiateCheckout to Meta Pixel for optimized ad delivery.',
      actionText: 'Configure',
      onClick: () => setActiveTab('capi'),
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Integrations</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight mt-1">
          Integrations
        </h1>
      </div>

      {/* 2. Four Apps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APPS.map((app) => (
          <div
            key={app.id}
            className="sendiee-card p-6 space-y-4 flex flex-col justify-between hover:border-[#D0D5DD] transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${app.badgeBg} shadow-2xs`}>
                  {app.badge}
                </div>
                <h3 className="text-base font-bold text-[#101828]">{app.name}</h3>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">{app.desc}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={app.onClick}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {app.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Google Sheets Configuration & Lead Viewer Modal */}
      <GoogleSheetsIntegrationModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
      />
    </div>
  );
};
