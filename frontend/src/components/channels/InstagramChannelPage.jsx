import React, { useState } from 'react';
import {
  Activity,
  Bot,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InstagramChannelPage = () => {
  const { channels, connectChannel, disconnectChannel, showToast, setActiveTab } = useApp();

  const isConnected = channels.instagram.connected;
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('@dhigrowth_store');

  const handleFinishOAuth = () => {
    connectChannel('instagram', `Connected: ${handle}`);
    setShowMetaModal(false);
    showToast(`Instagram account ${handle} connected successfully!`, 'success');
  };

  const FEATURES = [
    {
      title: 'AI Chatbot',
      desc: 'Set up AI-powered responses for your Instagram DMs',
    },
    {
      title: 'Ice Breakers',
      desc: 'Set up conversation starters for new users',
    },
    {
      title: 'Persistent Menu',
      desc: 'Create quick access menu options',
    },
    {
      title: 'Keyword Auto DM',
      desc: 'Automatic replies based on keywords',
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Instagram</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
              Instagram
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Instagram Direct automation, DM chatbots & comments management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('instagram-inbox')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FD5949] via-[#D6249F] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Open Instagram Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>{channels.instagram.detail}</span>
                </span>
                <button
                  onClick={() => {
                    disconnectChannel('instagram');
                    showToast('Instagram account disconnected', 'info');
                  }}
                  className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer ml-1"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Connect Card (8 cols) */}
        <div className="lg:col-span-8 sendiee-card p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
          {/* Gradient Instagram Logo */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
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

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl lg:text-2xl font-bold text-[#101828]">
              Connect Instagram
            </h2>
            <p className="text-xs lg:text-sm text-[#475467] leading-relaxed">
              Connect your Instagram Business or Creator account to enable automated messaging, chatbots, and more.
            </p>
          </div>

          <div className="space-y-3 w-full max-w-sm">
            <button
              onClick={() => {
                setStep(1);
                setShowMetaModal(true);
              }}
              className="w-full py-3 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Continue with Instagram</span>
            </button>

            <div className="text-[11px] text-[#98A2B3]">
              By connecting, you agree to Instagram's API Terms of Use
            </div>
          </div>
        </div>

        {/* Right Features Card (4 cols) */}
        <div className="lg:col-span-4 sendiee-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">Instagram Features</h3>

          <div className="space-y-4">
            {FEATURES.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] shrink-0">
                  <Settings className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">{item.title}</div>
                  <div className="text-[11px] text-[#667085] leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support footer */}
      <div className="text-center text-xs text-[#667085]">
        Trouble connecting Instagram?{' '}
        <button
          onClick={() => showToast('Opening Instagram integration troubleshooting guide', 'info')}
          className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
        >
          Contact support
        </button>
      </div>

      {/* Meta OAuth Modal Simulator */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#EAECF0] animate-in zoom-in-95 space-y-4 p-6 relative">
            <button
              onClick={() => setShowMetaModal(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FD5949] to-[#D6249F] flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Connect Instagram Direct</h3>
                <p className="text-xs text-[#667085]">Meta Graph API for Professional Accounts</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Instagram Account Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] font-mono"
                />
              </div>

              <div className="p-3.5 bg-[#FAF5FF] border border-[#E9D8FD] rounded-xl text-[11px] text-[#6941C6] space-y-1">
                <div className="font-bold">Permissions granted:</div>
                <div>• instagram_manage_messages (Reply to DMs)</div>
                <div>• instagram_manage_comments (Auto-DM upon reel comment)</div>
              </div>
            </div>

            <button
              onClick={handleFinishOAuth}
              className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              Authorize & Connect Instagram Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
