import React, { useState } from 'react';
import {
  MessageSquare,
  Activity,
  Zap,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConnectedChannelsPage = () => {
  const {
    channels,
    connectChannel,
    disconnectChannel,
    showToast,
    setActiveTab,
  } = useApp();

  const [activeModal, setActiveModal] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const connectedCount = Object.values(channels).filter((c) => c.connected).length;

  const CHANNEL_CONFIG = [
    {
      key: 'whatsapp',
      name: 'WhatsApp Business',
      desc: 'Enable automated messaging, broadcasts, and AI replies.',
      icon: MessageSquare,
      color: '#25D366',
      btnColor: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
      directTab: 'channel-whatsapp',
    },
    {
      key: 'instagram',
      name: 'Instagram',
      desc: 'DM automation and AI chatbots for Instagram.',
      icon: Activity,
      color: '#E1306C',
      btnColor: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
      directTab: 'channel-instagram',
    },
    {
      key: 'messenger',
      name: 'Messenger',
      desc: 'Facebook Page automation and AI chat.',
      icon: Zap,
      color: '#0866FF',
      btnColor: 'bg-[#0866FF] hover:bg-[#0055D4]',
      directTab: 'channel-messenger',
    },
    {
      key: 'line',
      name: 'LINE',
      desc: 'AI chatbot for LINE Official Account.',
      icon: Bot,
      color: '#00B900',
      btnColor: 'bg-[#00B900] hover:bg-[#009900]',
      directTab: 'channel-line',
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
          <span className="text-[#101828] font-semibold">Channels</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight mt-1">
          Connected Channels
        </h1>
        <p className="text-xs lg:text-sm text-[#475467] mt-0.5">
          Manage your messaging channels and integrations
        </p>
        <div className="text-xs text-[#667085] font-mono mt-2">
          {connectedCount} / 3 channels connected
        </div>
      </div>

      {/* 2. Four Channel Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {CHANNEL_CONFIG.map((ch) => {
          const isConnected = channels[ch.key]?.connected;
          const detail = channels[ch.key]?.detail;

          return (
            <div
              key={ch.key}
              className="sendiee-card p-5 space-y-5 flex flex-col justify-between hover:border-[#D0D5DD] transition-all"
            >
              <div className="space-y-4">
                {/* Header with Icon and Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: ch.color }}
                  >
                    <ch.icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isConnected
                        ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                        : 'bg-[#F2F4F7] text-[#667085] border-[#EAECF0]'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">{ch.name}</h3>
                  <p className="text-xs text-[#667085] mt-1 line-clamp-2">
                    {isConnected ? detail : ch.desc}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => setActiveTab(ch.directTab)}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    ch.btnColor
                  }`}
                >
                  <span>{isConnected ? 'Manage Channel' : 'Connect'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Support footer */}
      <div className="text-center text-xs text-[#667085] pt-4">
        Trouble connecting a channel?{' '}
        <button
          onClick={() => showToast('Opening Channels Integration Guide', 'info')}
          className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
        >
          Contact support
        </button>
      </div>
    </div>
  );
};
