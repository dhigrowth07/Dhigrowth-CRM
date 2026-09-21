import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Users,
  Send,
  Tag,
  Droplets,
  ShoppingBag,
  PhoneCall,
  Smartphone,
  ArrowRightLeft,
  PlusCircle,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppBusinessPage = () => {
  const {
    channels,
    connectChannel,
    disconnectChannel,
    showToast,
    setActiveTab,
    currentUser,
  } = useApp();

  const isConnected = channels.whatsapp.connected;

  const [connectionMethod, setConnectionMethod] = useState('existing'); // 'existing' | 'migrate' | 'new' | 'virtual'
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaStep, setMetaStep] = useState(1);
  const [selectedPortfolio, setSelectedPortfolio] = useState('Dhigrowth Retail Group (ID: 8849102)');
  const [selectedWaba, setSelectedWaba] = useState('Dhigrowth Official WhatsApp (+91 97914 71277)');
  const [otpCode, setOtpCode] = useState('');

  const TOP_FEATURES = [
    {
      icon: Bot,
      title: 'AI Chatbot',
      desc: 'Automated AI-powered replies on WhatsApp, 24/7',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: Users,
      title: 'Shared Team Inbox',
      desc: 'View, reply, and assign WhatsApp chats across your team',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: Send,
      title: 'Bulk Campaign Broadcasts',
      desc: 'Send WhatsApp template messages to thousands of contacts in one click',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: Tag,
      title: 'AI Lead Categorization',
      desc: 'Automatically classify leads as Interested, Converted, Not Interested, and more',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: Droplets,
      title: 'Drip Campaigns',
      desc: 'Send long-term message sequences tailored to each lead segment',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: ShoppingBag,
      title: 'Shopify Integration & COD Confirmation',
      desc: 'Order alerts, abandoned checkout recovery, and COD confirmation to cut RTO',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
    {
      icon: PhoneCall,
      title: 'AI WhatsApp Calling',
      desc: 'Let AI handle outbound and inbound voice calls — your 24/7 sales agent',
      bg: 'bg-[#F4F0FD]',
      color: 'text-[#7C3AED]',
    },
  ];

  const handleStartMetaOAuth = () => {
    setMetaStep(1);
    setShowMetaModal(true);
  };

  const handleFinishMetaConnection = () => {
    connectChannel('whatsapp', 'Connected: +91 97914 71277 (Coexistence API)');
    setShowMetaModal(false);
    showToast('WhatsApp Business successfully linked with Meta Cloud API Coexistence!', 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">WhatsApp Business</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            WhatsApp Business
          </h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('meta-api')}
              className="px-3.5 py-1.5 rounded-xl border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Configure Meta Token & Phone ID</span>
            </button>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Connected & Live</span>
                </span>
                <button
                  onClick={() => {
                    disconnectChannel('whatsapp');
                    showToast('WhatsApp Business disconnected', 'info');
                  }}
                  className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer ml-2"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top View: Connect Card (Left) + Top Features (Right) */}
      {!isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Hero Connect Card (7 cols) */}
          <div className="lg:col-span-7 sendiee-card p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
            {/* Green WhatsApp Circle Icon */}
            <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"></path>
              </svg>
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-xl lg:text-2xl font-bold text-[#101828]">
                Connect WhatsApp Business
              </h2>
              <p className="text-xs lg:text-sm text-[#475467] leading-relaxed">
                Connect your WhatsApp Business account to enable AI-powered messaging, broadcast campaigns, and automated replies.
              </p>
            </div>

            {/* Continue with WhatsApp button */}
            <div className="space-y-3 w-full max-w-sm">
              <button
                onClick={handleStartMetaOAuth}
                className="w-full py-3 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"></path>
                </svg>
                <span>Continue with WhatsApp</span>
              </button>

              <div className="text-[11px] text-[#98A2B3]">
                By connecting, you agree to WhatsApp's Business Terms of Service
              </div>
            </div>
          </div>

          {/* Right Top WhatsApp Features Card (5 cols) */}
          <div className="lg:col-span-5 sendiee-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#101828]">
              Top WhatsApp Features
            </h3>

            <div className="space-y-3.5">
              {TOP_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#101828]">{item.title}</div>
                      <div className="text-[11px] text-[#667085] leading-snug">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. "How to connect WhatsApp" Method Selector */}
      <div className="sendiee-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <span>How to connect WhatsApp</span>
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Pick the option that matches your situation to see the exact steps. You choose the same option inside the Facebook window during connection.
          </p>
        </div>

        {/* 4 Method Cards Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: Connect WhatsApp Business App */}
          <div
            onClick={() => setConnectionMethod('existing')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              connectionMethod === 'existing'
                ? 'border-[#16A34A] bg-[#F0FDF4] ring-1 ring-[#16A34A]'
                : 'border-[#EAECF0] bg-[#FAF8F5] hover:bg-[#F2F4F7]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Connect WhatsApp Business App</div>
                <div className="text-[11px] text-[#667085]">Use your existing WhatsApp Business app number (Coexistence)</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-md shrink-0">
              EXISTING APP
            </span>
          </div>

          {/* Method 2: Migrate from another partner */}
          <div
            onClick={() => setConnectionMethod('migrate')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              connectionMethod === 'migrate'
                ? 'border-[#16A34A] bg-[#F0FDF4] ring-1 ring-[#16A34A]'
                : 'border-[#EAECF0] bg-[#FAF8F5] hover:bg-[#F2F4F7]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Migrate from another partner</div>
                <div className="text-[11px] text-[#667085]">Move a number that is already on the API with a different provider</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded-md shrink-0">
              SWITCH BSP
            </span>
          </div>

          {/* Method 3: Connect a new number */}
          <div
            onClick={() => setConnectionMethod('new')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              connectionMethod === 'new'
                ? 'border-[#16A34A] bg-[#F0FDF4] ring-1 ring-[#16A34A]'
                : 'border-[#EAECF0] bg-[#FAF8F5] hover:bg-[#F2F4F7]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Connect a new number (API)</div>
                <div className="text-[11px] text-[#667085]">Onboard a fresh phone number directly to the WhatsApp API</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded-md shrink-0">
              NEW NUMBER
            </span>
          </div>

          {/* Method 4: Get a virtual WhatsApp number */}
          <div
            onClick={() => setConnectionMethod('virtual')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              connectionMethod === 'virtual'
                ? 'border-[#16A34A] bg-[#F0FDF4] ring-1 ring-[#16A34A]'
                : 'border-[#EAECF0] bg-[#FAF8F5] hover:bg-[#F2F4F7]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Get a virtual WhatsApp number</div>
                <div className="text-[11px] text-[#667085]">Message under a display name without your own phone number</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded-md shrink-0">
              DISPLAY NAME
            </span>
          </div>
        </div>

        {/* Selected Method Details & Guide */}
        <div className="space-y-4 pt-4 border-t border-[#EAECF0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Connect WhatsApp Business App
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Link the number already running on your WhatsApp Business app to the API. You keep chatting from the app while WAPPPILOT adds automation, broadcasts and AI on the same number.
              </p>
            </div>

            <button
              onClick={handleStartMetaOAuth}
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Connect WhatsApp</span>
            </button>
          </div>

          {/* Amber Alert: Before you start */}
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2 text-xs text-[#92400E]">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#D97706]" />
              <span>Before you start</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-[#78350F] pl-1">
              <li>Works only with the WhatsApp Business app — a personal WhatsApp account cannot be connected.</li>
              <li>A WhatsApp Business portfolio must already exist for your business.</li>
              <li>Complete business verification to raise your messaging tier.</li>
              <li>Keep the WhatsApp Business app updated and your phone nearby to scan a QR code.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Realistic Embedded Meta / Facebook Login Modal Simulator */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-[#EAECF0] animate-in zoom-in-95">
            {/* Mac Window Title Bar */}
            <div className="bg-[#F2F4F7] px-4 py-2.5 border-b border-[#EAECF0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <div className="font-medium text-[#475467] flex items-center gap-1 font-mono text-[11px]">
                <Lock className="w-3 h-3 text-[#16A34A]" />
                <span>facebook.com/v17.0/dialog/oauth?app_id=550369918986603...</span>
              </div>
              <button
                onClick={() => setShowMetaModal(false)}
                className="text-[#667085] hover:text-[#101828]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta Header */}
            <div className="p-4 border-b border-[#EAECF0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0866FF">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-bold text-[#101828]">Meta for Business</span>
              </div>
              <div className="text-[11px] text-[#667085]">Step {metaStep} of 3</div>
            </div>

            {/* Step 1 Content: Login & OAuth Consent */}
            {metaStep === 1 && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">
                    Continue as {currentUser?.name || 'User'}?
                  </h3>
                  <p className="text-xs text-[#475467] mt-1 leading-relaxed">
                    WAPPPILOT will receive your name, business portfolio details, and manage WhatsApp Cloud API messaging webhooks on your behalf.
                  </p>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#EAECF0] text-xs text-[#475467] space-y-2">
                  <div className="font-semibold text-[#101828]">Permissions requested:</div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#667085]">
                    <li>whatsapp_business_messaging (Manage WhatsApp conversations)</li>
                    <li>whatsapp_business_management (Create templates and read analytics)</li>
                    <li>business_management (Select business asset portfolio)</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowMetaModal(false)}
                    className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setMetaStep(2)}
                    className="flex-1 py-2.5 bg-[#0866FF] hover:bg-[#0055D4] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Continue as {currentUser?.name || 'User'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Content: Select Business Assets */}
            {metaStep === 2 && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">
                    Select your business assets
                  </h3>
                  <p className="text-xs text-[#475467] mt-1">
                    Choose the Meta Business Account and WhatsApp Business Phone Number to connect.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#344054]">Business portfolio</label>
                    <select
                      value={selectedPortfolio}
                      onChange={(e) => setSelectedPortfolio(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs font-medium text-[#101828]"
                    >
                      <option value="Dhigrowth Retail Group (ID: 8849102)">Dhigrowth Retail Group (ID: 8849102)</option>
                      <option value="Apex Commerce Global (ID: 9918231)">Apex Commerce Global (ID: 9918231)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#344054]">WhatsApp Business account</label>
                    <select
                      value={selectedWaba}
                      onChange={(e) => setSelectedWaba(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs font-medium text-[#101828]"
                    >
                      <option value="Dhigrowth Official WhatsApp (+91 97914 71277)">Dhigrowth Official WhatsApp (+91 97914 71277)</option>
                      <option value="Support Hotline (+91 98765 43210)">Support Hotline (+91 98765 43210)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setMetaStep(1)}
                    className="py-2.5 px-4 bg-[#F2F4F7] text-[#344054] font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setMetaStep(3)}
                    className="flex-1 py-2.5 bg-[#0866FF] hover:bg-[#0055D4] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Next: Setup Coexistence
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Content: Coexistence & Confirm */}
            {metaStep === 3 && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">
                    Confirm Coexistence Setup
                  </h3>
                  <p className="text-xs text-[#475467] mt-1">
                    Connect your existing WhatsApp Business app with Meta Cloud API.
                  </p>
                </div>

                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-2 text-xs text-[#166534]">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Live Coexistence Mode Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#15803D]">
                    You can continue chatting directly on the WhatsApp Business mobile app on your phone while WAPPPILOT automatically handles AI replies, webhooks, broadcasts, and team routing.
                  </p>
                </div>

                <button
                  onClick={handleFinishMetaConnection}
                  className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Authorize & Finalize WhatsApp Connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
