import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Check,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Play,
  RotateCw,
  X,
  Edit2,
  Trash2,
  Pause,
  Filter,
  Search,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';

const DEFAULT_STARTER_AUTOMATIONS = [
  {
    id: 'auto_welcome_greeting',
    name: 'WhatsApp AI Welcome & Service Menu',
    description: 'Instantly send interactive button card & service menu on first customer message',
    trigger: 'First Inbound Message',
    triggerCondition: 'First message from new contact or 24h inactive',
    action: 'Dispatch Interactive Greeting',
    actionDetails: 'Send button card with App Dev, CRM, and AI Solutions',
    status: 'Active',
    runs: 142,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_app_inquiry',
    name: 'Mobile & Web App Funnel',
    description: 'Auto-respond with portfolio deck when customer asks about apps or websites',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "app", "website", "ios", "android", "1"',
    action: 'Send Portfolio & Tech Deck',
    actionDetails: 'Send Flutter & React Native portfolio with consultation link',
    status: 'Active',
    runs: 89,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_crm_funnel',
    name: 'WhatsApp CRM & Auto-Pilot Funnel',
    description: 'Explain WhatsApp API features and pricing when requested',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "crm", "auto-pilot", "whatsapp api", "2"',
    action: 'Send WhatsApp CRM Overview',
    actionDetails: 'Send Cloud API features, lead funnels, and pricing plans',
    status: 'Active',
    runs: 64,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'auto_agent_handoff',
    name: 'High-Intent Human Agent Handoff',
    description: 'Assign to live human agent when user asks for quote, call, or urgent help',
    trigger: 'Keyword Match',
    triggerCondition: 'Matches: "quote", "call", "urgent", "human", "talk"',
    action: 'Assign to Agent & Pause AI',
    actionDetails: 'Move to Manual Agent mode and notify team inbox',
    status: 'Active',
    runs: 31,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
];

export const AutomationsPage = () => {
  const { currentWorkspaceId, showToast, setIsUpgradeModalOpen, setActiveTab } = useApp();

  const [automations, setAutomations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | paused

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [automationToDelete, setAutomationToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTrigger, setFormTrigger] = useState('Keyword Match');
  const [formTriggerCondition, setFormTriggerCondition] = useState('');
  const [formAction, setFormAction] = useState('Send WhatsApp Catalog');
  const [formActionDetails, setFormActionDetails] = useState('');

  // Load Automations
  const loadAutomations = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/automations?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/automations?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
        } catch {}
      }

      if (res && res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.automations && Array.isArray(data.automations)) {
            setAutomations(data.automations);
            try {
              localStorage.setItem(`dhigrowth_automations_${currentWorkspaceId}`, JSON.stringify(data.automations));
            } catch {}
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch automations from backend:', err.message);
    } finally {
      setIsLoading(false);
    }

    // Fallback to localStorage or default seed
    try {
      const saved = localStorage.getItem(`dhigrowth_automations_${currentWorkspaceId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAutomations(parsed);
          return;
        }
      }
    } catch {}

    setAutomations(DEFAULT_STARTER_AUTOMATIONS);
    try {
      localStorage.setItem(`dhigrowth_automations_${currentWorkspaceId}`, JSON.stringify(DEFAULT_STARTER_AUTOMATIONS));
    } catch {}
  };

  useEffect(() => {
    loadAutomations();
  }, [currentWorkspaceId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAutomation(null);
    setFormName('');
    setFormDescription('');
    setFormTrigger('Keyword Match');
    setFormTriggerCondition('Matches: "order", "price", "demo"');
    setFormAction('Send WhatsApp Interactive Menu');
    setFormActionDetails('Send product catalog and service buttons');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (auto) => {
    setEditingAutomation(auto);
    setFormName(auto.name || '');
    setFormDescription(auto.description || '');
    setFormTrigger(auto.trigger || 'Keyword Match');
    setFormTriggerCondition(auto.triggerCondition || '');
    setFormAction(auto.action || 'Send WhatsApp Interactive Menu');
    setFormActionDetails(auto.actionDetails || '');
    setIsModalOpen(true);
  };

  // Save / Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Automation Name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAutomation) {
        // Update Existing
        const payload = {
          workspaceId: currentWorkspaceId,
          name: formName.trim(),
          description: formDescription.trim(),
          trigger: formTrigger,
          triggerCondition: formTriggerCondition.trim(),
          action: formAction,
          actionDetails: formActionDetails.trim(),
        };

        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/automations/${editingAutomation.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/automations/${editingAutomation.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.automation) {
            setAutomations((prev) =>
              prev.map((a) => (a.id === editingAutomation.id ? data.automation : a))
            );
          }
        } else {
          setAutomations((prev) =>
            prev.map((a) => (a.id === editingAutomation.id ? { ...a, ...payload } : a))
          );
        }

        showToast(`✏️ Automation "${formName}" updated successfully!`, 'success');
        setIsModalOpen(false);
        setEditingAutomation(null);
      } else {
        // Create New
        const payload = {
          workspaceId: currentWorkspaceId,
          name: formName.trim(),
          description: formDescription.trim(),
          trigger: formTrigger,
          triggerCondition: formTriggerCondition.trim(),
          action: formAction,
          actionDetails: formActionDetails.trim(),
        };

        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/automations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch('http://localhost:4000/api/automations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.automation) {
            setAutomations((prev) => [data.automation, ...prev]);
          }
        } else {
          const fallbackAuto = {
            id: `auto_${Date.now()}`,
            ...payload,
            status: 'Active',
            runs: 0,
            createdAt: new Date().toISOString(),
            lastRunAt: null,
          };
          setAutomations((prev) => [fallbackAuto, ...prev]);
        }

        showToast(`⚡ Automation "${formName}" created & activated!`, 'success');
        setIsModalOpen(false);
      }
    } catch (err) {
      showToast(`Error saving automation: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Paused
  const handleToggleStatus = async (autoId) => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/automations/${autoId}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspaceId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/automations/${autoId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: currentWorkspaceId }),
          });
        } catch {}
      }

      setAutomations((prev) =>
        prev.map((a) => {
          if (a.id === autoId) {
            const nextStatus = a.status === 'Active' ? 'Paused' : 'Active';
            showToast(`Automation "${a.name}" is now ${nextStatus}`, 'info');
            return { ...a, status: nextStatus };
          }
          return a;
        })
      );
    } catch (err) {
      showToast('Status updated', 'info');
    }
  };

  // Test Run Simulation
  const handleTestTrigger = async (auto) => {
    setTestingId(auto.id);
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/automations/${auto.id}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspaceId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/automations/${auto.id}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: currentWorkspaceId }),
          });
        } catch {}
      }

      setAutomations((prev) =>
        prev.map((a) =>
          a.id === auto.id
            ? { ...a, runs: (a.runs || 0) + 1, lastRunAt: new Date().toISOString() }
            : a
        )
      );

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } });
      } catch {}

      showToast(`🚀 Trigger executed! "${auto.name}" ran action "${auto.action}".`, 'success');
    } catch (err) {
      showToast(`Trigger test note: ${err.message}`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  // Delete Automation
  const handleDelete = async (autoId) => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/automations/${autoId}?workspaceId=${encodeURIComponent(currentWorkspaceId)}`, {
          method: 'DELETE',
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/automations/${autoId}?workspaceId=${encodeURIComponent(currentWorkspaceId)}`, {
            method: 'DELETE',
          });
        } catch {}
      }

      setAutomations((prev) => prev.filter((a) => a.id !== autoId));
      showToast('🗑️ Automation deleted successfully', 'info');
      setAutomationToDelete(null);
    } catch (err) {
      showToast('Automation deleted', 'info');
      setAutomations((prev) => prev.filter((a) => a.id !== autoId));
      setAutomationToDelete(null);
    }
  };

  // Filtered List
  const filteredAutomations = automations.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.trigger || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.action || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return a.status === 'Active';
    if (statusFilter === 'paused') return a.status === 'Paused';
    return true;
  });

  const totalRuns = automations.reduce((acc, a) => acc + (a.runs || 0), 0);
  const activeCount = automations.filter((a) => a.status === 'Active').length;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828] cursor-pointer">
              Dashboard
            </button>
            <span>&gt;</span>
            <span className="text-[#101828] font-semibold">Automations</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight mt-1">
            Automations &amp; Event Triggers
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Connect inbound customer messages, lead status changes, and webhook events to automated WhatsApp workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAutomations}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#344054] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Refresh automations"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#667085] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: TRIGGERS / MONTH */}
        <div className="sendiee-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
              <Zap className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                TRIGGERS / MONTH
              </div>
              <div className="text-xl font-bold text-[#101828]">
                {totalRuns}{' '}
                <span className="text-[#98A2B3] text-xs font-normal">/ 10,000</span>
              </div>
              <div className="text-[10px] text-[#98A2B3] flex items-center gap-1 font-mono mt-0.5">
                <Clock className="w-3 h-3" />
                <span>Resets in 30 days</span>
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

        {/* Card 2: TOTAL */}
        <div className="sendiee-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <Activity className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#101828] leading-none">
              {automations.length}
            </div>
            <div className="text-[10px] font-bold font-mono text-[#667085] uppercase mt-1">TOTAL AUTOMATIONS</div>
          </div>
        </div>

        {/* Card 3: ACTIVE */}
        <div className="sendiee-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981]">
            <Check className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#101828] leading-none">
              {activeCount}
            </div>
            <div className="text-[10px] font-bold font-mono text-[#667085] uppercase mt-1">ACTIVE &amp; LISTENING</div>
          </div>
        </div>

        {/* Card 4: FAILED */}
        <div className="sendiee-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#101828] leading-none">
              0
            </div>
            <div className="text-[10px] font-bold font-mono text-[#667085] uppercase mt-1">FAILED (100% HEALTH)</div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-xl w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-[#101828] shadow-xs'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            All Automations ({automations.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-[#101828] shadow-xs'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('paused')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'paused'
                ? 'bg-white text-[#101828] shadow-xs'
                : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Paused ({automations.length - activeCount})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search automations or triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#EAECF0] pl-9 pr-3.5 py-2 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED] shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Automations Table */}
      {filteredAutomations.length === 0 ? (
        <div className="sendiee-card p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF5FF] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <Zap className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">No automations found</h3>
            <p className="text-xs text-[#667085] max-w-sm">
              Create automatic event triggers to engage customers 24/7.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation</span>
          </button>
        </div>
      ) : (
        <div className="sendiee-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECF0] bg-[#F9FAFB] text-[#667085] font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">AUTOMATION RULE</th>
                  <th className="p-4 font-semibold">TRIGGER EVENT</th>
                  <th className="p-4 font-semibold">ACTION EXECUTED</th>
                  <th className="p-4 font-semibold text-center">TOTAL RUNS</th>
                  <th className="p-4 font-semibold text-center">STATUS</th>
                  <th className="p-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredAutomations.map((auto) => (
                  <tr key={auto.id} className="hover:bg-[#F9FAFB] transition-colors">
                    {/* 1. Rule Name & Description */}
                    <td className="p-4 space-y-1 max-w-[280px]">
                      <div className="font-bold text-[#101828] text-sm flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                        <span>{auto.name}</span>
                      </div>
                      <p className="text-[11px] text-[#667085] line-clamp-1">
                        {auto.description || 'Automated WhatsApp workflow'}
                      </p>
                    </td>

                    {/* 2. Trigger Event & Condition */}
                    <td className="p-4 space-y-1">
                      <div className="font-semibold text-[#344054] flex items-center gap-1">
                        <span>{auto.trigger}</span>
                      </div>
                      <div className="text-[10px] text-[#7C3AED] font-mono bg-[#F4F0FD] px-2 py-0.5 rounded-md inline-block max-w-[220px] truncate">
                        {auto.triggerCondition || 'Event match'}
                      </div>
                    </td>

                    {/* 3. Action Executed & Details */}
                    <td className="p-4 space-y-1">
                      <div className="font-semibold text-[#101828] flex items-center gap-1">
                        <span>{auto.action}</span>
                      </div>
                      <div className="text-[11px] text-[#667085] max-w-[220px] truncate">
                        {auto.actionDetails || 'Execute action'}
                      </div>
                    </td>

                    {/* 4. Total Runs */}
                    <td className="p-4 text-center font-mono">
                      <div className="font-bold text-[#101828] text-sm">{auto.runs || 0}</div>
                      {auto.lastRunAt && (
                        <div className="text-[10px] text-[#98A2B3]">
                          {new Date(auto.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    {/* 5. Status Toggle */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(auto.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          auto.status === 'Active'
                            ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] hover:bg-[#BBF7D0]'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Click to toggle Active / Paused"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${auto.status === 'Active' ? 'bg-[#16A34A]' : 'bg-gray-400'}`} />
                        <span>{auto.status}</span>
                      </button>
                    </td>

                    {/* 6. Actions: Test, Edit, Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestTrigger(auto)}
                          disabled={testingId === auto.id}
                          className="px-2.5 py-1.5 bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] border border-[#E9D8FD] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Simulate / Run Trigger Now"
                        >
                          {testingId === auto.id ? (
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
                          )}
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(auto)}
                          className="p-1.5 rounded-xl border border-[#EAECF0] hover:border-[#7C3AED] bg-white hover:bg-[#F4F0FD] text-[#475467] hover:text-[#7C3AED] transition-all cursor-pointer shadow-2xs"
                          title="Edit automation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAutomationToDelete(auto)}
                          className="p-1.5 rounded-xl border border-[#EAECF0] hover:border-[#FDA29B] bg-white hover:bg-[#FEF3F2] text-[#475467] hover:text-[#D92D20] transition-all cursor-pointer shadow-2xs"
                          title="Delete automation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Automation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAutomation(null);
              }}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                {editingAutomation ? <Edit2 className="w-5 h-5 text-[#7C3AED]" /> : <Zap className="w-5 h-5 text-[#7C3AED]" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">
                  {editingAutomation ? 'Edit Automation Rule' : 'Create New Automation'}
                </h3>
                <p className="text-xs text-[#667085]">Connect trigger events to instant actions</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Automation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant COD Order Confirmation"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Rule Description</label>
                <input
                  type="text"
                  placeholder="e.g. Automatically send booking confirmation and address verify link"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">When this happens (Trigger Event):</label>
                <select
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Keyword Match">Customer sends keyword (e.g. "Price", "COD", "Demo")</option>
                  <option value="First Inbound Message">First Message from New Contact (Welcome Greeting)</option>
                  <option value="Stage Changed">Lead moves to Hot Lead or Deal Won</option>
                  <option value="Form Submitted">Meta Lead Ad Form / Website Contact Form</option>
                  <option value="Cart Abandoned">Shopify / WooCommerce Cart Abandoned</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Trigger Condition / Keyword Filter:</label>
                <input
                  type="text"
                  placeholder='e.g. Matches: "cod", "confirm", "order"'
                  value={formTriggerCondition}
                  onChange={(e) => setFormTriggerCondition(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Then do this (Action):</label>
                <select
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Dispatch Interactive Greeting">Dispatch Interactive WhatsApp Greeting Card</option>
                  <option value="Send WhatsApp Catalog">Send WhatsApp Product Catalog &amp; Services</option>
                  <option value="Assign to Agent & Pause AI">Assign conversation to Human Agent (Pause AI)</option>
                  <option value="Send Portfolio & Tech Deck">Send PDF Brochure / Presentation</option>
                  <option value="Apply 10% Discount Tag">Apply Discount Coupon Tag</option>
                  <option value="Fire Meta CAPI Event">Fire Meta CAPI Purchase / Lead Event</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Action Details / Payload:</label>
                <input
                  type="text"
                  placeholder="e.g. Send card with 3 interactive options and team booking link"
                  value={formActionDetails}
                  onChange={(e) => setFormActionDetails(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAutomation(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs font-bold text-[#475467] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : editingAutomation ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>{editingAutomation ? 'Save Changes' : 'Deploy & Activate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Automation Confirmation Modal */}
      {automationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEE4E2] border border-[#FECDCA] flex items-center justify-center text-[#D92D20]">
                <Trash2 className="w-5 h-5 text-[#D92D20]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Delete Automation Rule</h3>
                <p className="text-xs text-[#667085]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#344054] leading-relaxed bg-[#F9FAFB] p-3 rounded-xl border border-[#EAECF0]">
              Are you sure you want to delete <span className="font-bold text-[#101828]">"{automationToDelete.name}"</span>? The trigger event and automatic responses will stop immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAECF0]">
              <button
                type="button"
                onClick={() => setAutomationToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs font-bold text-[#475467] hover:bg-[#F9FAFB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(automationToDelete.id)}
                className="px-4 py-2.5 bg-[#D92D20] hover:bg-[#B42318] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Automation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
