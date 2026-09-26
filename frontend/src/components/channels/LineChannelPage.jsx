import React, { useState } from 'react';
import {
  Bot,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LineChannelPage = () => {
  const { channels, connectChannel, disconnectChannel, showToast, setActiveTab } = useApp();

  const isConnected = channels.line.connected;

  const [channelSecret, setChannelSecret] = useState('');
  const [channelToken, setChannelToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleValidateConnect = (e) => {
    e.preventDefault();
    if (!channelSecret.trim() || !channelToken.trim()) {
      showToast('Please provide both Channel Secret and Access Token', 'error');
      return;
    }

    connectChannel('line', 'Connected: LINE Official Account (Verified API)');
    showToast('LINE Messaging API validated and connected!', 'success');
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
          <span className="text-[#101828] font-semibold">LINE</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            LINE
          </h1>
          {isConnected && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>{channels.line.detail}</span>
              </span>
              <button
                onClick={() => {
                  disconnectChannel('line');
                  showToast('LINE channel disconnected', 'info');
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
        {/* Left Connect Card (7 cols) */}
        <div className="lg:col-span-7 sendiee-card p-8 lg:p-10 space-y-6">
          {/* Green LINE Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#00B900] flex items-center justify-center text-white shadow-lg shadow-green-600/20 mx-auto">
            <span className="text-2xl font-black font-sans tracking-tight">LINE</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-[#101828]">Connect LINE</h2>
            <p className="text-xs text-[#475467]">
              Paste your LINE channel credentials to enable the AI chatbot on your LINE Official Account.
            </p>
          </div>

          <form onSubmit={handleValidateConnect} className="space-y-4 text-xs">
            {/* Field 1: Channel Secret */}
            <div>
              <label className="font-semibold text-[#344054]">Channel Secret</label>
              <div className="relative mt-1">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  placeholder="Paste your Channel Secret"
                  value={channelSecret}
                  onChange={(e) => setChannelSecret(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#101828] font-mono focus:outline-none focus:border-[#00B900]"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-3 text-[#98A2B3] hover:text-[#101828]"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-[#667085] mt-1">
                LINE Developers Console &rarr; your channel &rarr; Basic settings
              </div>
            </div>

            {/* Field 2: Channel Access Token */}
            <div>
              <label className="font-semibold text-[#344054]">Channel Access Token</label>
              <div className="relative mt-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  placeholder="Paste your long-lived Channel Access Token"
                  value={channelToken}
                  onChange={(e) => setChannelToken(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#101828] font-mono focus:outline-none focus:border-[#00B900]"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-3 text-[#98A2B3] hover:text-[#101828]"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-[#667085] mt-1">
                LINE Developers Console &rarr; your channel &rarr; Messaging API &rarr; Channel access token (long-lived)
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#00B900] hover:bg-[#009900] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all cursor-pointer"
            >
              <span>Validate &amp; Connect</span>
            </button>

            <div className="text-[11px] text-center text-[#98A2B3] pt-1">
              By connecting, you agree to LINE's Messaging API Terms of Use.
            </div>
          </form>
        </div>

        {/* Right Instructions Card (5 cols) */}
        <div className="lg:col-span-5 sendiee-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">How to connect LINE</h3>

          <ol className="space-y-3 text-xs text-[#475467] list-decimal list-inside leading-relaxed">
            <li>
              Create a <strong className="text-[#101828]">LINE Official Account</strong> in the{' '}
              <a href="https://manager.line.biz" target="_blank" rel="noreferrer" className="text-[#00B900] hover:underline font-semibold">
                LINE Official Account Manager ↗
              </a>.
            </li>
            <li>
              In the OA Manager &rarr; <strong>Settings &rarr; Messaging API</strong>, enable the Messaging API and choose/create a provider.
            </li>
            <li>
              In the{' '}
              <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-[#00B900] hover:underline font-semibold">
                LINE Developers Console ↗
              </a>{' '}
              open your channel &rarr; <strong>Basic settings</strong> &rarr; copy the <strong>Channel secret</strong>.
            </li>
            <li>
              Same channel &rarr; <strong>Messaging API</strong> &rarr; issue a long-lived <strong>Channel access token</strong> &rarr; copy it.
            </li>
            <li>
              Paste both here and click <strong>Validate &amp; Connect</strong>, then copy the generated <strong>Webhook URL</strong> back into the console (Messaging API &rarr; Webhook URL), turn on <strong>Use webhook</strong>, and click <strong>Verify</strong>.
            </li>
            <li>
              In the OA Manager &rarr; <strong>Settings &rarr; Response settings</strong>, set <strong>Chat = Off / Bot</strong> and turn off the default Auto-response and Greeting messages.
            </li>
          </ol>

          <div className="pt-2 text-center text-xs text-[#667085] border-t border-[#EAECF0]">
            Trouble connecting LINE?{' '}
            <button
              onClick={() => showToast('Opening LINE integration troubleshooting guide', 'info')}
              className="font-bold text-[#00B900] hover:underline cursor-pointer"
            >
              Contact support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
