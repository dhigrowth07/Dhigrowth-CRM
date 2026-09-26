import React, { useState } from 'react';
import {
  Wrench,
  Tag,
  Download,
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToolsPage = () => {
  const { showToast, setIsUpgradeModalOpen, setActiveTab } = useApp();

  const [tools, setTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toolName, setToolName] = useState('');
  const [toolType, setToolType] = useState('Webhook');
  const [toolDesc, setToolDesc] = useState('');

  const handleCreateTool = (e) => {
    e.preventDefault();
    if (!toolName.trim()) return;

    const newTool = {
      id: `tool-${Date.now()}`,
      name: toolName,
      type: toolType,
      description: toolDesc || 'Custom webhook integration tool for WhatsApp bot execution.',
      status: 'Active',
      calls: 0,
    };

    setTools((prev) => [newTool, ...prev]);
    setToolName('');
    setToolDesc('');
    setIsModalOpen(false);
    showToast(`Created AI Tool "${toolName}" successfully!`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
              Dashboard
            </button>
            <span>&gt;</span>
            <span className="text-[#101828] font-semibold">Tools</span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1">Tools</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Opening Tag Manager', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] transition-colors cursor-pointer shadow-2xs"
          >
            <Tag className="w-3.5 h-3.5 text-[#667085]" />
            <span>Manage tags</span>
          </button>

          <button
            onClick={() => showToast('Importing pre-built AI tool templates', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#667085]" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add tool</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Bar Card: TOOLS 0 / 60 */}
      <div className="sendiee-card p-4 flex items-center justify-between max-w-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <Wrench className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
              TOOLS
            </div>
            <div className="text-base font-bold text-[#101828]">
              {tools.length} <span className="text-[#98A2B3] text-xs font-normal">/ 60</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] bg-[#F4F0FD] hover:bg-[#EDE5FA] border border-[#E9D8FD] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
        >
          <ArrowUpRight className="w-3 h-3" />
          <span>Addon</span>
        </button>
      </div>

      {/* 3. Toolbar: Search | All Types | Filter by tags | View Switcher */}
      <div className="sendiee-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-9 pr-3.5 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* All Types */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-1.5 pr-8 rounded-xl text-xs text-[#344054] font-medium focus:outline-none focus:border-[#7C3AED] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="webhook">Webhook Action</option>
              <option value="database">Database Query</option>
              <option value="meta_capi">Meta CAPI Event</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#98A2B3] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Filter by tags */}
          <div className="relative">
            <select className="appearance-none bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-1.5 pr-8 rounded-xl text-xs text-[#344054] font-medium focus:outline-none focus:border-[#7C3AED] cursor-pointer">
              <option value="">Filter by tags</option>
              <option value="crm">CRM Actions</option>
              <option value="ecommerce">Shopify/COD</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#98A2B3] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* View Switcher: Cards vs Table */}
        <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-[#101828] shadow-2xs font-bold'
                : 'text-[#667085]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-[#101828] shadow-2xs font-bold'
                : 'text-[#667085]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* 4. Empty State matching user's exact uploaded screenshot */}
      {tools.length === 0 ? (
        <div className="sendiee-card p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
          <div className="w-16 h-16 rounded-full bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-center text-[#98A2B3]">
            <Wrench className="w-8 h-8 text-[#98A2B3]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">No tools yet</h3>
            <p className="text-xs text-[#667085] max-w-sm">
              Create your first AI tool to give your chatbot new abilities.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add tool</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="sendiee-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#101828]">{tool.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-full">
                    {tool.status}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-1 line-clamp-2">{tool.description}</p>
              </div>
              <div className="pt-2 border-t border-[#F2F4F7] flex justify-between items-center text-[11px] text-[#667085] font-mono">
                <span>Type: {tool.type}</span>
                <span className="text-[#7C3AED] font-bold">{tool.calls} calls</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Tool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Wrench className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Create AI Execution Tool</h3>
                <p className="text-xs text-[#667085]">Equip bot with custom APIs & database triggers</p>
              </div>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Tool Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check Order Tracking API"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Action Type</label>
                <select
                  value={toolType}
                  onChange={(e) => setToolType(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Webhook">Webhook / REST API Endpoint</option>
                  <option value="Shopify">Shopify Inventory & Order lookup</option>
                  <option value="Meta CAPI">Meta CAPI Event Dispatcher</option>
                  <option value="CRM">Dhigrowth CRM Status Updater</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Description & Bot Instructions</label>
                <textarea
                  rows={3}
                  placeholder="When to call this tool and what parameters to extract from user messages..."
                  value={toolDesc}
                  onChange={(e) => setToolDesc(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-3 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Register AI Tool
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
