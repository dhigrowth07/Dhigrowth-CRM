import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Clock,
  User,
  Phone,
  Target,
  Sparkles,
} from 'lucide-react';
import { BACKEND_URL } from '../../services/apiConfig';
import { useApp } from '../../context/AppContext';

const DEFAULT_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Customer Name", "Phone Number", "Service Needed", "Purpose / Requirements", "Channel"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#F0FDF4").setFontColor("#15803D");
      sheet.setFrozenRows(1);
    }
    
    // Append the customer details
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name || "N/A",
      data.phone || "N/A",
      data.service || "N/A",
      data.purpose || "N/A",
      data.channel || "WhatsApp"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Lead saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const GoogleSheetsIntegrationModal = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'leads' | 'guide'

  const [config, setConfig] = useState({
    webhookUrl: 'https://script.google.com/macros/s/AKfycbw-YouvVwMPJRhvM2KWDeVQwmQ3V8zRd5u0ZqC8wioIiw0HlBi3NXizIQHpQ67KnezmGg/exec',
    sheetUrl: '',
    enabled: true,
    sheetName: 'DhiGrowth Inbound Leads',
    lastSyncedAt: null,
  });

  const [scriptTemplate, setScriptTemplate] = useState(DEFAULT_APPS_SCRIPT_CODE);
  const [capturedLeads, setCapturedLeads] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      fetchCapturedLeads();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/integrations/google-sheets`);
      const data = await res.json();
      if (data.success) {
        if (data.config) setConfig(data.config);
        if (data.scriptTemplate) setScriptTemplate(data.scriptTemplate);
      }
    } catch (err) {
      console.warn('Could not fetch Google Sheets config:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCapturedLeads = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/leads/captured`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setCapturedLeads(data.leads);
      }
    } catch (err) {
      console.warn('Could not fetch captured leads:', err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/integrations/google-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        showToast('Google Sheets settings saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Network error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.webhookUrl) {
      showToast('Please enter and save your Google Apps Script Webhook URL first.', 'error');
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/integrations/google-sheets/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sri (Test Customer)',
          phone: '+91 97914 71277',
          service: 'Mobile App & AI Automation',
          purpose: 'Inbound customer requirements sync test from WAP PILOT',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Test row successfully written to your Google Sheet!', 'success');
        fetchCapturedLeads();
      } else {
        showToast(`⚠️ Sync failed: ${data.error || 'Please check your Webhook URL'}`, 'error');
      }
    } catch (err) {
      showToast('Network error testing Google Sheets connection', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleCopyCode = () => {
    if (!scriptTemplate) return;
    navigator.clipboard.writeText(scriptTemplate);
    setCopiedCode(true);
    showToast('Apps Script code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAECF0] flex items-center justify-between bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#101828]">Google Sheets Requirements Sync</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  config.webhookUrl && config.enabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {config.webhookUrl && config.enabled ? 'Active Sync' : 'Setup Required'}
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Automatically ask new customers for requirements and stream their Name, Phone &amp; Purpose into Google Sheets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#98A2B3] hover:text-[#344054] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAECF0] px-6 bg-[#FCFCFD]">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            Webhook Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            <span>Captured Customer Requirements</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-700 text-[10px] font-mono">
              {capturedLeads.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Setup Guide (3 Steps)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-sky-950">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>How Inbound Requirements Capture Works:</span>
                </div>
                <p className="text-sky-800 leading-relaxed">
                  When a new customer reaches out via WhatsApp or omnichannel chat, WAP PILOT greets them and collects:
                  <strong className="block mt-1 font-semibold text-sky-950">
                    1. Desired DhiGrowth Service &nbsp;•&nbsp; 2. Customer Name &nbsp;•&nbsp; 3. Phone Number &nbsp;•&nbsp; 4. Project Purpose / Details
                  </strong>
                  As soon as they reply, their entry is instantly posted to your Google Sheet!
                </p>
              </div>

              {/* Google Spreadsheet Direct Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054]">
                    Google Spreadsheet Storage Link (Viewable Sheet)
                  </label>
                  {config.sheetUrl && (
                    <a
                      href={config.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open Spreadsheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={config.sheetUrl || ''}
                  onChange={(e) => setConfig({ ...config, sheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-[#667085]">
                  Save your Google Spreadsheet URL so you can open and view all your customer rows directly with 1 click.
                </p>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#344054] block">
                  Google Apps Script Web App URL (Data Writer Webhook) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-[#667085]">
                  Need a Web App URL? Open the <button type="button" onClick={() => setActiveTab('guide')} className="text-emerald-700 font-bold hover:underline">Setup Guide</button> to copy the ready script.
                </p>
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs font-bold text-[#101828] block">Enable Auto-Sync to Sheet</span>
                  <span className="text-[11px] text-[#667085]">Stream each customer requirement into Google Sheets in real-time</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !config.webhookUrl}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-[#344054] border border-[#D0D5DD] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{testing ? 'Testing...' : 'Send Test Row to Sheet'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-[#475467] border border-[#D0D5DD] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAPTURED LEADS TABLE */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                    Inbound Customer Requirements Log
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Captured by WAP PILOT via WhatsApp and submitted to Google Sheets
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCapturedLeads}
                  className="px-2.5 py-1 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {capturedLeads.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#344054]">No leads captured yet</p>
                  <p className="text-[11px] text-[#667085] max-w-sm mx-auto mt-1">
                    When a new customer messages WAP PILOT on WhatsApp, their service, name, phone, and purpose will show up here.
                  </p>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="mt-3 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs"
                  >
                    Send Test Lead Row
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#EAECF0] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[#475467] font-bold border-b border-[#EAECF0]">
                      <tr>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Service Needed</th>
                        <th className="py-2.5 px-3">Purpose / Requirements</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Google Sheet</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7]">
                      {capturedLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#101828] flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span>{lead.name}</span>
                            </div>
                            <div className="text-[11px] text-[#667085] flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5 text-gray-400" />
                              <span>{lead.phone}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#0284C7]">
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100">
                              {lead.service}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#344054] max-w-xs">
                            <p className="line-clamp-2 text-xs">{lead.purpose}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {lead.channel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {lead.sheetSynced ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Synced</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600" title={lead.error}>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[#667085] whitespace-nowrap">
                            {lead.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs space-y-1">
                    <strong className="text-[#101828] block">Create or Open your Google Sheet</strong>
                    <p className="text-[#667085]">
                      Create a new Google Sheet named <em>"DhiGrowth Inbound Leads"</em> (or any name you prefer).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs space-y-1 w-full">
                    <strong className="text-[#101828] block">Open Apps Script &amp; Paste this Code</strong>
                    <p className="text-[#667085]">
                      In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>. Replace everything in <code>Code.gs</code> with the code below:
                    </p>
                    <div className="relative mt-2">
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-700">
                        {scriptTemplate}
                      </pre>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs space-y-1.5 w-full">
                    <strong className="text-[#101828] block">Deploy as Web App &amp; Paste URL</strong>
                    <p className="text-[#667085]">
                      Click <strong>Deploy &gt; New deployment</strong> (or <em>Manage deployments &gt; Edit</em>).<br />
                      Select type: <strong>Web app</strong>.<br />
                      Set <em>"Execute as"</em>: <strong>Me</strong>.<br />
                      Set <em>"Who has access"</em>: <strong className="text-emerald-700 underline">Anyone</strong>.
                    </p>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                      ⚠️ <strong>Crucial Permission Step:</strong> Make sure <em>"Who has access"</em> is set to <strong>Anyone</strong> (not "Only myself"). Otherwise, Google blocks automated webhook writes and returns a "You need access" page.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
