import React, { useState } from 'react';
import {
  Key,
  Lock,
  Plus,
  BookOpen,
  Copy,
  CheckCircle2,
  Trash2,
  Shield,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ApiWebhooksPage = () => {
  const { showToast, setActiveTab } = useApp();

  const [subTab, setSubTab] = useState('api-keys'); // 'api-keys' | 'logs' | 'webhooks'
  const [keys, setKeys] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['messages.read', 'messages.send']);

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    const newKey = {
      id: `key-${Date.now()}`,
      name: keyName,
      secret: `dhigrowth_live_sk_${Math.random().toString(36).substring(2, 15)}`,
      created: 'Just now',
      scopes: selectedScopes,
    };

    setKeys((prev) => [newKey, ...prev]);
    setKeyName('');
    setIsCreateModalOpen(false);
    showToast(`Created API Key "${keyName}"!`, 'success');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied API Key to clipboard!', 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">API & Webhooks</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight mt-1">
          API &amp; Webhooks
        </h1>
        <p className="text-xs lg:text-sm text-[#475467] mt-0.5">
          Keys that grant programmatic access to your workspace, with per-app permissions and request logs.
        </p>
      </div>

      {/* 2. Sub-Tabs Bar: API Keys | Logs | Webhooks [DEPRECATED] */}
      <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setSubTab('api-keys')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'api-keys'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys</span>
        </button>

        <button
          onClick={() => setSubTab('logs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'logs'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Logs</span>
        </button>

        <button
          onClick={() => setSubTab('webhooks')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            subTab === 'webhooks'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <span>Webhooks</span>
          <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.2 rounded-md">
            DEPRECATED
          </span>
        </button>
      </div>

      {/* 3. Scoped API Keys Card (Recommended) */}
      <div className="sendiee-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] shrink-0">
              <Key className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#101828]">Scoped API Keys</h2>
                <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Issue a separate key per app, limited to only the permissions it needs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://docs.dhigrowth.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] transition-colors cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#667085]" />
              <span>API docs</span>
            </a>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create key</span>
            </button>
          </div>
        </div>

        {/* Empty State or Keys List */}
        {keys.length === 0 ? (
          <div className="p-12 border border-dashed border-[#EAECF0] rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-[#FAF8F5]">
            <div className="w-12 h-12 rounded-full bg-[#FAF5FF] flex items-center justify-center text-[#7C3AED]">
              <Key className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#101828]">No scoped keys yet</h3>
              <p className="text-xs text-[#667085] max-w-sm">
                Create a key with only the permissions an app needs — safer than sharing your full-access key.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first key</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#101828]">{k.name}</div>
                  <div className="font-mono text-[#7C3AED] text-[11px] mt-0.5">{k.secret}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(k.secret)}
                  className="px-3 py-1.5 bg-white border border-[#EAECF0] hover:bg-[#F2F4F7] rounded-lg text-xs font-bold text-[#475467] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Legacy API Key Card */}
      <div className="sendiee-card p-6 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
            <Lock className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#101828]">Legacy API Key</h2>
              <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full">
                DEPRECATION PLANNED
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Full-access key used by existing integrations. Prefer scoped keys for anything new.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#EAECF0] rounded-2xl flex items-center justify-between text-xs">
          <span className="text-[#667085]">
            No legacy key. You probably don't need one — create a scoped key instead.
          </span>
          <button
            onClick={() => showToast('Generated master legacy API key', 'info')}
            className="px-3.5 py-1.5 bg-white border border-[#EAECF0] hover:bg-[#F2F4F7] rounded-xl text-xs font-semibold text-[#475467] cursor-pointer shadow-2xs"
          >
            Generate anyway
          </button>
        </div>
      </div>

      {/* Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Key className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Create Scoped API Key</h3>
                <p className="text-xs text-[#667085]">Generate token for backend integration</p>
              </div>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Key Name / Integration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERP Order Sync Service"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Allowed Scopes</label>
                <div className="space-y-1.5 mt-1 text-xs">
                  {['messages.read', 'messages.send', 'contacts.write', 'templates.read'].map((sc) => (
                    <label key={sc} className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB] cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-[#7C3AED]" />
                      <span className="font-mono text-[11px] text-[#344054]">{sc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Generate API Secret
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
