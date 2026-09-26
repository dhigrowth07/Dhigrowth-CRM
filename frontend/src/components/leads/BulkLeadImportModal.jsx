import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_CSV_CONTENT = `Name,Phone,Email,Stage,City,Deal Value,Product
Rajesh Kumar,919876543210,rajesh@example.com,Hot,Mumbai,₹50,000,Custom Mobile App
Priya Sharma,919812345678,priya@sharma.in,Interested,Bangalore,₹25,000,WhatsApp CRM
Amit Patel,919700011223,amit@startup.io,Discovery,Delhi,₹75,000,AI Auto-Pilot
Sunita Verma,919988776655,sunita@enterprise.com,Cold,Chennai,₹1,20,000,Enterprise Cloud`;

export const BulkLeadImportModal = ({
  isOpen,
  onClose,
  createLead,
  showToast,
  currentWorkspaceId,
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsedLeads, setParsedLeads] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dhigrowth_leads_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Sample CSV template downloaded!', 'success');
  };

  const parseCSVContent = (text) => {
    if (!text.trim()) {
      showToast('No data found to parse', 'error');
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      showToast('Empty CSV data', 'error');
      return;
    }

    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes('name') ||
      firstLine.includes('phone') ||
      firstLine.includes('mobile') ||
      firstLine.includes('email');

    const startIndex = hasHeader ? 1 : 0;
    const headerCols = hasHeader
      ? lines[0].split(/,|\t/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))
      : [];

    const nameIdx = headerCols.findIndex((h) => h.includes('name'));
    const phoneIdx = headerCols.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
    const emailIdx = headerCols.findIndex((h) => h.includes('email'));
    const tagIdx = headerCols.findIndex((h) => h.includes('stage') || h.includes('tag') || h.includes('status'));
    const cityIdx = headerCols.findIndex((h) => h.includes('city') || h.includes('location'));
    const dealIdx = headerCols.findIndex((h) => h.includes('deal') || h.includes('value') || h.includes('price') || h.includes('budget'));
    const productIdx = headerCols.findIndex((h) => h.includes('product') || h.includes('service') || h.includes('interest'));

    const parsed = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const delimiter = line.includes('\t') ? '\t' : ',';
      const values = line
        .split(delimiter)
        .map((val) => val.trim().replace(/^["']|["']$/g, ''));

      let name = '';
      let phone = '';
      let email = '';
      let tag = 'Interested';
      let city = 'Mumbai, IN';
      let dealValue = '₹2,499';
      let product = 'General CRM Lead';

      if (hasHeader) {
        name = nameIdx !== -1 ? values[nameIdx] : values[0] || '';
        phone = phoneIdx !== -1 ? values[phoneIdx] : values[1] || '';
        email = emailIdx !== -1 ? values[emailIdx] : values[2] || '';
        tag = tagIdx !== -1 ? values[tagIdx] : 'Interested';
        city = cityIdx !== -1 ? values[cityIdx] : 'Mumbai, IN';
        dealValue = dealIdx !== -1 ? values[dealIdx] : '₹2,499';
        product = productIdx !== -1 ? values[productIdx] : 'General CRM Lead';
      } else {
        name = values[0] || '';
        phone = values[1] || '';
        email = values[2] || '';
        tag = values[3] || 'Interested';
        city = values[4] || 'Mumbai, IN';
        dealValue = values[5] || '₹2,499';
        product = values[6] || 'General CRM Lead';
      }

      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      if (!name.trim()) continue;

      let cleanTag = 'Interested';
      const lowerTag = (tag || '').toLowerCase();
      if (lowerTag.includes('hot') || lowerTag.includes('won') || lowerTag.includes('confirm')) cleanTag = 'Hot';
      else if (lowerTag.includes('cold') || lowerTag.includes('lost')) cleanTag = 'Cold';
      else if (lowerTag.includes('disc') || lowerTag.includes('new')) cleanTag = 'Discovery';

      parsed.push({
        tempId: `lead-${Date.now()}-${i}`,
        name: name.trim(),
        phone: cleanPhone || '919800000000',
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        tag: cleanTag,
        city: city || 'India',
        dealValue: dealValue || '₹2,499',
        product: product || 'CRM Lead',
        isValid: Boolean(name.trim() && cleanPhone.length >= 7),
      });
    }

    if (parsed.length === 0) {
      showToast('Could not extract any valid contact rows from file/text', 'error');
      return;
    }

    setParsedLeads(parsed);
    showToast(`Successfully parsed ${parsed.length} contact rows!`, 'success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        parseCSVContent(content);
      }
    };
    reader.onerror = () => {
      showToast('Error reading file. Please check file format.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        parseCSVContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    setPasteText(SAMPLE_CSV_CONTENT);
    parseCSVContent(SAMPLE_CSV_CONTENT);
  };

  const handleRemoveRow = (tempId) => {
    setParsedLeads((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const handleExecuteImport = async () => {
    if (parsedLeads.length === 0) return;

    setIsProcessing(true);
    setImportProgress(0);

    let successCount = 0;

    for (let i = 0; i < parsedLeads.length; i++) {
      const item = parsedLeads[i];
      try {
        await createLead({
          name: item.name,
          phone: item.phone,
          email: item.email,
          tag: item.tag,
          city: item.city,
          dealValue: item.dealValue,
          product: item.product,
          budget: item.dealValue,
          channel: 'whatsapp',
        });
        successCount++;
      } catch (err) {
        console.warn('Import item notice:', err);
      }
      setImportProgress(Math.round(((i + 1) / parsedLeads.length) * 100));
    }

    setIsProcessing(false);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    showToast(`Successfully imported ${successCount} new leads into your workspace!`, 'success');
    setParsedLeads([]);
    setPasteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Bulk Lead Import & CSV Tools
              </h3>
              <p className="text-xs text-[#667085]">
                Upload CSV or paste contacts to instantly sync into your CRM workspace.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F2F4F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#344054]">
                Supported Columns: Name, Phone, Email, Stage, City, Deal Value
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F4F7] border border-[#EAECF0] text-xs font-bold text-[#7C3AED] shadow-2xs transition-all cursor-pointer"
              title="Download pre-formatted sample CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-[#EAECF0] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB]'
              }`}
            >
              Upload CSV File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB]'
              }`}
            >
              Copy-Paste Text
            </button>
          </div>

          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#7C3AED] bg-[#F4F0FD]/60'
                  : 'border-[#D0D5DD] hover:border-[#7C3AED] bg-[#F9FAFB]/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#101828]">
                Click to upload or drag & drop CSV file
              </p>
              <p className="text-xs text-[#667085] mt-1">
                Accepts .csv files (UTF-8 formatted with comma or tab delimiters)
              </p>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#344054]">
                  Paste CSV text or tab-separated data:
                </label>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill Demo Leads</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Name, Phone, Email, Stage, City, Deal Value&#10;Rajesh, 919876543210, rajesh@mail.com, Hot, Mumbai, ₹50,000"
                className="w-full bg-[#F9FAFB] border border-[#EAECF0] p-3.5 rounded-2xl text-xs font-mono text-[#101828] focus:outline-none focus:border-[#7C3AED]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => parseCSVContent(pasteText)}
                  disabled={!pasteText.trim()}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Parse Contacts
                </button>
              </div>
            </div>
          )}

          {parsedLeads.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#101828]">
                    Parsed Preview ({parsedLeads.length} leads ready)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[10px] font-bold font-mono">
                    VALIDATED
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setParsedLeads([])}
                  className="text-xs text-[#DC2626] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="border border-[#EAECF0] rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] border-b border-[#EAECF0] text-[11px] font-bold text-[#667085] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Phone</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Stage</th>
                      <th className="px-3 py-2.5">City</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {parsedLeads.map((lead) => (
                      <tr key={lead.tempId} className="hover:bg-[#F9FAFB]/70 transition-colors">
                        <td className="px-3 py-2 font-bold text-[#101828] whitespace-nowrap">
                          {lead.name}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#475467] whitespace-nowrap">
                          {lead.phone}
                        </td>
                        <td className="px-3 py-2 text-[#667085] whitespace-nowrap">
                          {lead.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              lead.tag === 'Hot'
                                ? 'bg-red-50 text-red-600'
                                : lead.tag === 'Cold'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-purple-50 text-purple-600'
                            }`}
                          >
                            {lead.tag}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#475467] whitespace-nowrap">
                          {lead.city}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(lead.tempId)}
                            className="text-[#98A2B3] hover:text-[#DC2626] p-1 rounded transition-colors cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#7C3AED]">
                <span>Importing contacts into workspace...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7C3AED] h-full transition-all duration-200"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#EAECF0] bg-white text-xs font-bold text-[#344054] hover:bg-[#F2F4F7] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsedLeads.length === 0 || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <span>Import {parsedLeads.length} Contacts</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
