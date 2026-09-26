import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Briefcase,
  List,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MessengerChannelPage = () => {
  const { channels, connectChannel, disconnectChannel, showToast, setActiveTab } = useApp();

  const isConnected = channels.messenger.connected;
  const [showModal, setShowModal] = useState(false);
  const [pageName, setPageName] = useState('Dhigrowth Official Facebook Page');

  const handleFinish = () => {
    connectChannel('messenger', `Connected: ${pageName}`);
    setShowModal(false);
    showToast(`Facebook Page "${pageName}" linked successfully!`, 'success');
  };

  const FEATURES = [
    {
      icon: Bot,
      title: 'AI Chatbot',
      desc: 'Automated AI-powered replies in Messenger conversations',
    },
    {
      icon: MessageSquare,
      title: 'Conversation Starters',
      desc: 'Suggested questions to help users start a chat',
    },
    {
      icon: List,
      title: 'Main Menu',
      desc: 'Persistent menu for quick access to common actions',
    },
    {
      icon: Rocket,
      title: 'Get Started Button',
      desc: 'Onboard new users with a welcome flow',
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
          <span className="text-[#101828] font-semibold">Messenger</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            Messenger
          </h1>
          {isConnected && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>{channels.messenger.detail}</span>
              </span>
              <button
                onClick={() => {
                  disconnectChannel('messenger');
                  showToast('Messenger disconnected', 'info');
                }}
                className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer ml-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Connect Card (8 cols) */}
        <div className="lg:col-span-8 sendiee-card p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
          {/* Blue Messenger Logo */}
          <div className="w-20 h-20 rounded-full bg-[#0866FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.909 1.458 5.518 3.738 7.202V22l3.39-1.862c.907.251 1.874.388 2.872.388 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.026 12.443l-2.585-2.756-5.048 2.756 5.553-5.892 2.651 2.756 4.982-2.756-5.553 5.892z" />
            </svg>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl lg:text-2xl font-bold text-[#101828]">
              Connect Messenger
            </h2>
            <p className="text-xs lg:text-sm text-[#475467] leading-relaxed">
              Connect your Facebook Page to automate Messenger conversations, set up menus, and engage your audience with AI.
            </p>
          </div>

          <div className="space-y-3 w-full max-w-sm">
            {/* Primary Button: Continue with Facebook */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* Secondary Button: Connect via Business Portfolio */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 px-6 bg-[#FAF5EE] hover:bg-[#F2ECE2] border border-[#E8DFC8] text-[#475467] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-[#7C3AED]" />
              <span>Connect via Business Portfolio</span>
            </button>

            <div className="text-[11px] text-[#98A2B3]">
              Use this if your Page is managed through Meta Business Manager
            </div>

            <div className="text-[11px] text-[#98A2B3] pt-1">
              By connecting, you agree to Meta's Platform Terms
            </div>
          </div>
        </div>

        {/* Right Features Card (4 cols) */}
        <div className="lg:col-span-4 sendiee-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">Messenger Features</h3>

          <div className="space-y-4">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] shrink-0">
                    <Icon className="w-4 h-4 text-[#7C3AED]" />
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

      {/* Support footer */}
      <div className="text-center text-xs text-[#667085]">
        Trouble connecting Messenger?{' '}
        <button
          onClick={() => showToast('Opening Messenger setup guide', 'info')}
          className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
        >
          Contact support
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#EAECF0] animate-in zoom-in-95 space-y-4 p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0866FF] flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Connect Facebook Messenger</h3>
                <p className="text-xs text-[#667085]">Select Facebook Page to authorize webhook sync</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#344054]">Facebook Page Name</label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828]"
                />
              </div>

              <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[11px] text-[#166534] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Meta Verified App Token Ready</span>
                </div>
                <div>Enables 24/7 AI conversational responses and lead qualification.</div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-[#0866FF] hover:bg-[#0055D4] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              Link Facebook Page to Dhigrowth CRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
