import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Key,
  Globe,
  Radio,
  Copy,
  Zap,
  Check,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Server,
  Sparkles,
  HelpCircle,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';
import { MetaEmbeddedSignupModal } from './MetaEmbeddedSignupModal';

export const MetaApiSettings = () => {
  const {
    metaConfig,
    saveMetaConfig,
    testMetaConfig,
    isMetaLoading,
    showToast,
    currentUser,
    currentWorkspaceId,
    setIsUpgradeModalOpen
  } = useApp();

  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.username?.toLowerCase() === 'admin' ||
    currentUser?.role?.toLowerCase() === 'super administrator' ||
    currentUser?.role?.toLowerCase() === 'super_admin'
  );

  // Form State
  const [phoneNumberId, setPhoneNumberId] = useState(metaConfig?.phoneNumberId || '');
  const [accessToken, setAccessToken] = useState(metaConfig?.accessToken || '');
  const [wabaId, setWabaId] = useState(metaConfig?.wabaId || '');
  const [verifyToken, setVerifyToken] = useState(metaConfig?.verifyToken || 'dhigrowth_webhook_secret_2026');

  // UI state
  const [isEmbeddedModalOpen, setIsEmbeddedModalOpen] = useState(false);
  const [isChannelConnected, setIsChannelConnected] = useState(Boolean(metaConfig?.phoneNumberId && metaConfig?.accessToken));
  const [showToken, setShowToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);

  const handleDisconnectChannel = async () => {
    if (!window.confirm('Are you sure you want to disconnect this WhatsApp Business account from this workspace?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/meta/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          username: currentUser?.username || 'sri'
        })
      });
      setPhoneNumberId('');
      setAccessToken('');
      setWabaId('');
      setIsChannelConnected(false);
      showToast('WhatsApp Business account unlinked successfully', 'info');
    } catch (err) {
      showToast('Error disconnecting: ' + err.message, 'error');
    }
  };

  // Sync with context if metaConfig updates for this specific user
  useEffect(() => {
    if (metaConfig) {
      setPhoneNumberId(metaConfig.phoneNumberId || '');
      setAccessToken(metaConfig.accessToken || '');
      setWabaId(metaConfig.wabaId || '');
      setVerifyToken(metaConfig.verifyToken || 'dhigrowth_webhook_secret_2026');
    }
  }, [metaConfig]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!phoneNumberId.trim()) {
      showToast('Phone Number ID is required', 'error');
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
      setHasSaved(true);
      // Auto test after save
      handleTestConnection({
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async (overrideConfig) => {
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

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7C3AED] bg-[#F4F0FD] px-2.5 py-0.5 rounded-full border border-[#E9D8FD]">
              Meta Cloud API Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828]">
            Meta WhatsApp Cloud API Credentials
          </h1>
          <p className="text-xs text-[#667085]">
            Configure and hot-swap your WhatsApp Phone Number ID, Graph API Access Token, and WABA ID in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleTestConnection()}
            disabled={isTesting || !phoneNumberId || !accessToken}
            className="bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] text-[#344054] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#7C3AED]' : ''}`} />
            <span>{isTesting ? 'Verifying with Meta...' : 'Test Meta Connection'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isMetaLoading}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-75"
          >
            <Save className="w-4 h-4" />
            <span>{isMetaLoading ? 'Saving...' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Tenant Isolation Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F4F0FD] via-[#FAF5FF] to-[#EFF8FF] border border-[#E9D8FD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0 uppercase">
            {(currentUser?.name || currentUser?.username || 'U')[0]}
          </div>
          <div>
            <div className="text-xs font-bold text-[#101828] flex items-center gap-2">
              <span>Account: <strong className="text-[#7C3AED]">{currentUser?.name || currentUser?.username || 'CRM User'}</strong></span>
              <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-mono px-2 py-0.5 rounded-full font-bold border border-[#BBF7D0]">
                Private & Isolated Workspace
              </span>
            </div>
            <p className="text-[11px] text-[#475467] mt-0.5">
              These WhatsApp Cloud API credentials belong strictly to <strong className="text-[#101828]">{currentUser?.organization || `${currentUser?.name || 'Your'}'s Workspace`}</strong>. Each user configures their own independent Phone Number ID and Meta Access Token.
            </p>
          </div>
        </div>
      </div>

      {/* Zero-Markup Meta Direct Billing Banner */}
      <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#166534] flex items-center gap-2">
              <span>Direct Meta Billing · 0% Markup Guarantee</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] rounded-full border border-[#BBF7D0]">
                WHOLESALE RATES
              </span>
            </div>
            <p className="text-[11px] text-[#166534]/90 mt-0.5 leading-relaxed">
              You pay Meta directly via your Meta Business Manager payment card for WhatsApp conversation fees (marketing, utility, service). Dhigrowth CRM adds <strong>$0 markup</strong> on all messages. You only pay Dhigrowth CRM a flat monthly platform subscription.
            </p>
          </div>
        </div>
      </div>

      {/* Test Result Live Banner (if tested) */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in flex items-start justify-between gap-3 ${
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
                {testResult.success ? 'Meta Cloud API Verified & Live' : 'Meta API Verification Error'}
              </div>
              <p className="text-[11px] mt-0.5 opacity-90">
                {testResult.success
                  ? `Successfully linked to Meta Graph API! Display Phone: ${testResult.data?.display_phone_number || 'Live'} · Verified Name: ${testResult.data?.verified_name || 'Active'} · Quality: ${testResult.data?.quality_rating || 'GREEN'}`
                  : testResult.error}
              </p>
            </div>
          </div>
          {testResult.success && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] shrink-0">
              ACTIVE LIVE
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sendiee-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
              <div className="text-xs font-bold uppercase text-[#344054] flex items-center gap-2 font-mono">
                <Key className="w-4 h-4 text-[#7C3AED]" />
                <span>WhatsApp Cloud API Credentials</span>
              </div>
              <span className="text-[10px] text-[#667085] font-mono">
                Last updated: {metaConfig?.updatedAt ? new Date(metaConfig.updatedAt).toLocaleTimeString() : 'Current'}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* 1. WhatsApp Phone Number ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>WhatsApp Phone Number ID</span>
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
                  Found under <strong>WhatsApp &gt; API Setup &gt; Step 1</strong> in your Meta App Dashboard.
                </p>
              </div>

              {/* 2. Meta WhatsApp Access Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Meta Graph API Access Token</span>
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
                <div className="relative">
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. EAAqrs7Hxa2wB..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all shadow-2xs resize-y"
                    style={{ WebkitTextSecurity: showToken ? 'none' : 'disc' }}
                  />
                </div>
                <p className="text-[11px] text-[#667085]">
                  Supports both temporary 24-hour developer tokens and permanent System User Access Tokens.
                </p>
              </div>

              {/* 3. WhatsApp Business Account ID (WABA ID) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054]">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wabaId, 'WABA ID')}
                    className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === 'WABA ID' ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2288734648550898"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs font-mono text-[#101828] focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all shadow-2xs"
                />
              </div>

              {/* 4. Webhook Callback URL & Verify Token (Super Admin Only) */}
              {isSuperAdmin && (
                <div className="pt-2 border-t border-[#EAECF0] space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#344054]">
                        Webhook Callback URL (Inbound Messages)
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
                        Webhook Verify Token
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

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isMetaLoading}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-75"
                >
                  <Save className="w-4 h-4" />
                  <span>{isMetaLoading ? 'Saving Credentials...' : 'Save & Update Server'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Guides & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Overview Card */}
          <div className="sendiee-card p-5 bg-[#F0FDF4] border-[#BBF7D0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#101828] flex items-center gap-1.5">
                  Meta WhatsApp Cloud API
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                </h3>
                <p className="text-[11px] text-[#475467]">
                  Graph API v20.0 · Production Ready
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
              READY
            </span>
          </div>

          {/* Quick Guide for Credentials */}
          <div className="sendiee-card p-6 space-y-4">
            <div className="text-xs font-bold uppercase text-[#667085] flex items-center gap-2 font-mono">
              <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
              <span>How to find your credentials</span>
            </div>

            <div className="space-y-3 text-xs text-[#475467] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                <div className="font-bold text-[#101828] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>Meta for Developers</span>
                </div>
                <p className="text-[11px] text-[#667085] pl-5">
                  Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-[#7C3AED] font-semibold underline inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="w-3 h-3" /></a> and open your WhatsApp Business app.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                <div className="font-bold text-[#101828] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>Get Phone Number ID</span>
                </div>
                <p className="text-[11px] text-[#667085] pl-5">
                  Navigate to <strong>WhatsApp &gt; API Setup</strong>. Copy the numeric <strong>Phone number ID</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1">
                <div className="font-bold text-[#101828] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[10px] flex items-center justify-center font-mono">3</span>
                  <span>Generate Access Token</span>
                </div>
                <p className="text-[11px] text-[#667085] pl-5">
                  For production, create a <strong>System User</strong> in Meta Business Settings with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code> scopes.
                </p>
              </div>
            </div>
          </div>

          {/* Webhook SLA info */}
          <div className="sendiee-card p-6 space-y-3 text-xs">
            <div className="text-xs font-bold uppercase text-[#667085] flex items-center gap-2 font-mono">
              <Server className="w-4 h-4 text-[#7C3AED]" />
              <span>Gateway Runtime Metrics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#667085]">Active Phone ID:</span>
                <span className="font-mono font-bold text-[#101828]">{phoneNumberId || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Token Status:</span>
                <span className="font-mono font-bold text-[#16A34A]">
                  {accessToken ? `${accessToken.slice(0, 8)}... (${accessToken.length} chars)` : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Backend Server:</span>
                <span className="font-mono text-[#16A34A] font-bold">{BACKEND_URL}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Embedded Signup 1-Click Modal */}
      <MetaEmbeddedSignupModal
        isOpen={isEmbeddedModalOpen}
        onClose={() => setIsEmbeddedModalOpen(false)}
        onConnected={(channel) => {
          setIsChannelConnected(true);
          if (channel.phoneNumberId) setPhoneNumberId(channel.phoneNumberId);
          if (channel.wabaId) setWabaId(channel.wabaId);
          if (channel.accessToken) setAccessToken(channel.accessToken);
        }}
      />
    </div>
  );
};
