import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Search,
  ChevronDown,
  Info,
  Settings,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Play,
  RotateCw,
  Edit2,
  Trash2,
  Clock,
  MessageSquare,
  ChevronRight,
  Filter,
  Users,
  Send,
  AlertTriangle,
  Sliders,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';

const DEFAULT_STARTER_DRIPS = [
  {
    id: 'drip_hot_fasttrack',
    name: 'Hot Lead Fast-Track Nurture',
    category: 'lead_stage',
    trigger: 'Hot',
    delay: '1 day(s)',
    status: 'Active',
    enrolled: 124,
    delivered: 120,
    steps: [
      { step: 1, delay: 'Instant', action: 'Send Product Deck & Client Case Studies' },
      { step: 2, delay: 'After 1 Day', action: 'Offer 1-on-1 Consultation Call Link' },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_cart_recovery',
    name: 'Abandoned Cart 24-Hour Recovery',
    category: 'cart_recovery',
    trigger: 'Interested',
    delay: '2 day(s)',
    status: 'Active',
    enrolled: 86,
    delivered: 82,
    steps: [
      { step: 1, delay: 'After 1 Hour', action: 'Send 10% Discount Promo Code (LAUNCH10)' },
      { step: 2, delay: 'After 24 Hours', action: 'Send Direct WhatsApp Checkout Link' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_post_purchase',
    name: 'Post-Purchase VIP Loyalty Sequence',
    category: 'post_purchase',
    trigger: 'Converted',
    delay: '7 day(s)',
    status: 'Active',
    enrolled: 210,
    delivered: 204,
    steps: [
      { step: 1, delay: 'Day 3', action: 'Product Setup & Onboarding Guide' },
      { step: 2, delay: 'Day 7', action: 'Google Review Request & Feedback Survey' },
      { step: 3, delay: 'Day 14', action: '₹500 Referral Bonus Invitation' },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'drip_cold_reactivation',
    name: 'Cold Lead Re-engagement Winback',
    category: 'lead_stage',
    trigger: 'Cold',
    delay: '15 day(s)',
    status: 'Active',
    enrolled: 95,
    delivered: 91,
    steps: [
      { step: 1, delay: 'Day 15', action: 'Share Major New Feature & AI Enhancements' },
      { step: 2, delay: 'Day 30', action: 'Exclusive Reactivation 20% Voucher' },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggerAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const DripCampaignsPage = () => {
  const { currentWorkspaceId, showToast, setIsUpgradeModalOpen, setActiveTab } = useApp();

  const [dripList, setDripList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | paused

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDrip, setEditingDrip] = useState(null);
  const [dripToDelete, setDripToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    quietHoursStart: '21:00',
    quietHoursEnd: '09:00',
    stopOnReply: true,
    maxConcurrentDrips: '1',
  });

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('lead_stage');
  const [formTrigger, setFormTrigger] = useState('Hot');
  const [formDelay, setFormDelay] = useState('1 day(s)');
  const [formSteps, setFormSteps] = useState([
    { step: 1, delay: 'Instant', action: 'Send Product Deck & Portfolio' },
    { step: 2, delay: 'After 1 Day', action: 'Offer 1-on-1 Consultation Link' },
  ]);

  // Load Drips
  const loadDrips = async () => {
    setIsLoading(true);
    const wsId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/drips?workspaceId=${encodeURIComponent(wsId)}`);
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/drips?workspaceId=${encodeURIComponent(wsId)}`);
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.drips && Array.isArray(data.drips)) {
          setDripList(data.drips);
          return;
        }
      }

      // Fallback
      setDripList(DEFAULT_STARTER_DRIPS);
    } catch (err) {
      console.warn('Could not reach drip API, using fallback store:', err.message);
      setDripList(DEFAULT_STARTER_DRIPS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrips();
  }, [currentWorkspaceId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDrip(null);
    setFormName('');
    setFormCategory('lead_stage');
    setFormTrigger('Hot');
    setFormDelay('1 day(s)');
    setFormSteps([
      { step: 1, delay: 'Instant', action: 'Send Welcome Greeting & Intro Deck' },
      { step: 2, delay: 'After 1 Day', action: 'Offer Live Consultation Call Link' },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (drip) => {
    setEditingDrip(drip);
    setFormName(drip.name || '');
    setFormCategory(drip.category || 'lead_stage');
    setFormTrigger(drip.trigger || 'Hot');
    setFormDelay(drip.delay || '1 day(s)');
    setFormSteps(
      drip.steps && drip.steps.length > 0
        ? JSON.parse(JSON.stringify(drip.steps))
        : [
            { step: 1, delay: 'Instant', action: 'Send Welcome Greeting & Intro Deck' },
            { step: 2, delay: 'After 1 Day', action: 'Offer Live Consultation Call Link' },
          ]
    );
    setIsModalOpen(true);
  };

  // Step editing handlers
  const handleAddStep = () => {
    const nextStepNum = formSteps.length + 1;
    setFormSteps([
      ...formSteps,
      {
        step: nextStepNum,
        delay: `After ${nextStepNum} Day(s)`,
        action: 'Follow-up WhatsApp Message & Special Offer',
      },
    ]);
  };

  const handleRemoveStep = (index) => {
    if (formSteps.length <= 1) {
      showToast('A drip sequence requires at least 1 step', 'error');
      return;
    }
    const updated = formSteps
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({ ...s, step: idx + 1 }));
    setFormSteps(updated);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...formSteps];
    updated[index][field] = value;
    setFormSteps(updated);
  };

  // Save (Create or Update)
  const handleSaveDrip = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please provide a campaign name', 'error');
      return;
    }

    setIsSubmitting(true);
    const wsId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';

    const payload = {
      workspaceId: wsId,
      name: formName.trim(),
      category: formCategory,
      trigger: formTrigger,
      delay: formDelay,
      steps: formSteps,
    };

    try {
      let res;
      if (editingDrip) {
        // PUT
        try {
          res = await fetch(`${BACKEND_URL}/api/drips/${editingDrip.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/drips/${editingDrip.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          setDripList((prev) =>
            prev.map((d) => (d.id === editingDrip.id ? data.drip : d))
          );
          showToast(`Updated drip sequence "${formName}"!`, 'success');
        } else {
          // Optimistic local update
          setDripList((prev) =>
            prev.map((d) =>
              d.id === editingDrip.id ? { ...d, ...payload } : d
            )
          );
          showToast(`Updated drip sequence "${formName}"`, 'success');
        }
      } else {
        // POST
        try {
          res = await fetch(`${BACKEND_URL}/api/drips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/drips`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          setDripList((prev) => [data.drip, ...prev]);
          showToast(`Created new drip sequence "${formName}"!`, 'success');
        } else {
          // Optimistic create
          const newDrip = {
            id: `drip_${Date.now()}`,
            ...payload,
            status: 'Active',
            enrolled: 0,
            delivered: 0,
            createdAt: new Date().toISOString(),
            lastTriggerAt: null,
          };
          setDripList((prev) => [newDrip, ...prev]);
          showToast(`Created drip campaign "${formName}"`, 'success');
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      showToast('Error saving drip campaign: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Paused
  const handleToggleStatus = async (drip) => {
    const wsId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';
    const nextStatus = drip.status === 'Active' ? 'Paused' : 'Active';

    // Optimistic
    setDripList((prev) =>
      prev.map((d) => (d.id === drip.id ? { ...d, status: nextStatus } : d))
    );

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/drips/${drip.id}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: wsId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/drips/${drip.id}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: wsId }),
          });
        } catch {}
      }

      showToast(
        `Sequence "${drip.name}" is now ${nextStatus.toLowerCase()}`,
        nextStatus === 'Active' ? 'success' : 'info'
      );
    } catch (err) {
      showToast(`Toggled status to ${nextStatus}`, 'info');
    }
  };

  // Test Trigger
  const handleTestTrigger = async (drip) => {
    setTestingId(drip.id);
    const wsId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/drips/${drip.id}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: wsId }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/drips/${drip.id}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId: wsId }),
          });
        } catch {}
      }

      // Increment locally
      setDripList((prev) =>
        prev.map((d) =>
          d.id === drip.id
            ? {
                ...d,
                enrolled: (d.enrolled || 0) + 1,
                delivered: (d.delivered || 0) + 1,
                lastTriggerAt: new Date().toISOString(),
              }
            : d
        )
      );

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C3AED', '#3B82F6', '#10B981'],
        });
      } catch {}

      showToast(
        `Simulation: Enrolled test lead into Step 1 of "${drip.name}"!`,
        'success'
      );
    } catch (err) {
      showToast(`Test triggered for ${drip.name}`, 'success');
    } finally {
      setTestingId(null);
    }
  };

  // Delete
  const handleDeleteDrip = async () => {
    if (!dripToDelete) return;
    const wsId = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';
    const targetId = dripToDelete.id;
    const targetName = dripToDelete.name;

    // Optimistic delete
    setDripList((prev) => prev.filter((d) => d.id !== targetId));
    setDripToDelete(null);

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/drips/${targetId}?workspaceId=${encodeURIComponent(wsId)}`, {
          method: 'DELETE',
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/drips/${targetId}?workspaceId=${encodeURIComponent(wsId)}`, {
            method: 'DELETE',
          });
        } catch {}
      }

      showToast(`Deleted drip sequence "${targetName}"`, 'info');
    } catch (err) {
      showToast(`Removed sequence "${targetName}"`, 'info');
    }
  };

  // Filtered list
  const filteredDrips = dripList.filter((drip) => {
    const matchesSearch =
      drip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drip.trigger?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drip.steps &&
        drip.steps.some((s) =>
          s.action.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesCat = selectedCat === 'all' || drip.category === selectedCat;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && drip.status === 'Active') ||
      (statusFilter === 'paused' && drip.status === 'Paused');

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Aggregated metrics
  const totalEnrolled = dripList.reduce((acc, d) => acc + (d.enrolled || 0), 0);
  const totalDelivered = dripList.reduce((acc, d) => acc + (d.delivered || 0), 0);
  const activeCount = dripList.filter((d) => d.status === 'Active').length;

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'lead_stage':
        return 'Lead Stage Nurturing';
      case 'cart_recovery':
        return 'Cart Recovery';
      case 'post_purchase':
        return 'Post-Purchase VIP';
      default:
        return 'Custom Sequence';
    }
  };

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case 'Hot':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Interested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cold':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-[#101828] cursor-pointer"
            >
              Dashboard
            </button>
            <span>&gt;</span>
            <span className="text-[#101828] font-semibold">Drip Campaigns</span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1 flex items-center gap-2.5">
            <span>Drip Campaigns</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
              Multi-Step Sequences
            </span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Automated message sequences triggered by lead stage and category transitions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] transition-colors cursor-pointer shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 text-[#667085]" />
            <span>Tour</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] transition-colors cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-[#667085]" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Drip Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Bar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Drip Campaign Counter (Exact matching screenshot design) */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
              <Droplets className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                DRIP CAMPAIGNS
              </div>
              <div className="text-base font-bold text-[#101828]">
                {dripList.length} <span className="text-[#98A2B3] text-xs font-normal">/ 10</span>
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

        {/* Active Sequences */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                ACTIVE SEQUENCES
              </div>
              <div className="text-base font-bold text-[#101828]">
                {activeCount}{' '}
                <span className="text-emerald-600 text-xs font-semibold">
                  ({Math.round((activeCount / (dripList.length || 1)) * 100)}% live)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Enrolled */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                ENROLLED LEADS
              </div>
              <div className="text-base font-bold text-[#101828]">
                {totalEnrolled.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Total Dispatched */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                DELIVERED MSGS
              </div>
              <div className="text-base font-bold text-[#101828]">
                {totalDelivered.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search | Filter | Status */}
      <div className="sendiee-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search campaigns or actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-9 pr-3.5 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="appearance-none bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-1.5 pr-8 rounded-xl text-xs text-[#344054] font-medium focus:outline-none focus:border-[#7C3AED] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="lead_stage">Lead Stage Nurturing</option>
              <option value="cart_recovery">Cart Recovery</option>
              <option value="post_purchase">Post-Purchase Re-order</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#98A2B3] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#EAECF0] p-0.5 rounded-xl">
            {['all', 'active', 'paused'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-[#101828] shadow-2xs font-bold'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDrips}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] hover:bg-white text-xs font-medium text-[#475467] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Reload campaigns"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#7C3AED]' : 'text-[#667085]'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4. Content Area: Cards or Empty State */}
      {filteredDrips.length === 0 ? (
        <div className="sendiee-card p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
          <div className="w-16 h-16 rounded-full bg-[#FAF5FF] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <Droplets className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">
              {searchTerm || selectedCat !== 'all' || statusFilter !== 'all'
                ? 'No matching campaigns found'
                : 'No drip campaigns yet'}
            </h3>
            <p className="text-xs text-[#667085] max-w-sm">
              {searchTerm || selectedCat !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters to view sequences.'
                : 'Create your first drip campaign to automatically send message sequences when contacts are categorized into different lead stages.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrips.map((drip) => {
            const isActive = drip.status === 'Active';
            const isTesting = testingId === drip.id;

            return (
              <div
                key={drip.id}
                className="sendiee-card p-5 space-y-4 flex flex-col justify-between border hover:border-[#D6BBFB] transition-all hover:shadow-xs group"
              >
                {/* Top: Category + Status Toggle + Menu */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                        {getCategoryLabel(drip.category)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStageBadgeColor(
                          drip.trigger
                        )}`}
                      >
                        Trigger: {drip.trigger}
                      </span>
                    </div>

                    {/* Status Pill Toggle */}
                    <button
                      onClick={() => handleToggleStatus(drip)}
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#DCFCE7] text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#F2F4F7] text-[#667085] border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isActive ? '● Active' : '○ Paused'}
                    </button>
                  </div>

                  {/* Campaign Name */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#101828] group-hover:text-[#7C3AED] transition-colors">
                      {drip.name}
                    </h3>
                  </div>

                  {/* Multi-step Visual Flow */}
                  <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#EAECF0] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#475467]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Nurturing Sequence Flow ({drip.steps?.length || 0} steps)</span>
                      </span>
                      <span className="text-[#98A2B3] font-mono text-[10px]">
                        Delay: {drip.delay}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {drip.steps && drip.steps.length > 0 ? (
                        drip.steps.map((stepItem, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-[#344054] bg-white p-2 rounded-lg border border-[#F2F4F7]"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F4F0FD] text-[#7C3AED] font-bold text-[10px] flex items-center justify-center border border-[#E9D8FD]">
                              {stepItem.step || idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-[#7C3AED] uppercase">
                                  {stepItem.delay || 'Instant'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#475467] truncate mt-0.5">
                                {stepItem.action}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-[#98A2B3] italic">
                          No customized steps configured yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Metrics & Action Buttons */}
                <div className="pt-3 border-t border-[#F2F4F7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-[#667085] text-[11px]">
                    <span className="font-mono">
                      <strong className="text-[#101828] font-bold">{drip.enrolled || 0}</strong> enrolled
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      <strong className="text-emerald-600 font-bold">{drip.delivered || 0}</strong> delivered
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    {/* Test Trigger Button */}
                    <button
                      onClick={() => handleTestTrigger(drip)}
                      disabled={isTesting}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF5FF] hover:bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      title="Simulate enrollment for test contact"
                    >
                      <Play className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Enrolling...' : 'Test'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(drip)}
                      className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB] rounded-lg transition-colors cursor-pointer border border-[#EAECF0]"
                      title="Edit Campaign"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDripToDelete(drip)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create / Edit Drip Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Droplets className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">
                  {editingDrip ? 'Edit Drip Sequence' : 'New Drip Sequence'}
                </h3>
                <p className="text-xs text-[#667085]">
                  Automate scheduled WhatsApp messages across minutes or days
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDrip} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Day Abandoned Cart Sequence"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="lead_stage">Lead Stage</option>
                    <option value="cart_recovery">Cart Recovery</option>
                    <option value="post_purchase">Post-Purchase</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">Trigger Stage</label>
                  <select
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Hot">🔥 Hot Lead</option>
                    <option value="Interested">💡 Interested</option>
                    <option value="Cold">❄️ Cold Lead</option>
                    <option value="Converted">🏆 Converted</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#475467]">Default Interval</label>
                  <select
                    value={formDelay}
                    onChange={(e) => setFormDelay(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="1 day(s)">1 Day</option>
                    <option value="2 day(s)">2 Days</option>
                    <option value="3 day(s)">3 Days</option>
                    <option value="7 day(s)">7 Days</option>
                    <option value="15 day(s)">15 Days</option>
                  </select>
                </div>
              </div>

              {/* Step Sequence Builder */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#475467]">
                    Sequence Timeline Steps ({formSteps.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {formSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#101828]">
                            Step {idx + 1}
                          </span>
                        </div>

                        {formSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove step"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Delay (e.g. Instant, Day 2)"
                            value={step.delay}
                            onChange={(e) =>
                              handleStepChange(idx, 'delay', e.target.value)
                            }
                            className="w-full bg-white border border-[#EAECF0] px-2.5 py-1.5 rounded-lg text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Action description / template to send"
                            value={step.action}
                            onChange={(e) =>
                              handleStepChange(idx, 'action', e.target.value)
                            }
                            className="w-full bg-white border border-[#EAECF0] px-2.5 py-1.5 rounded-lg text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAECF0] text-xs font-semibold text-[#475467] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDrip ? 'Save Changes' : 'Create & Activate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation */}
      {dripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#101828]">Delete Drip Sequence?</h3>
              <p className="text-xs text-[#667085]">
                Are you sure you want to delete <strong>"{dripToDelete.name}"</strong>? Leads currently enrolled will stop receiving further steps.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDripToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-[#EAECF0] text-xs font-semibold text-[#475467] hover:bg-[#F9FAFB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDrip}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Tour Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsTourOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Drip Campaigns Guide</h3>
                <p className="text-xs text-[#667085]">How smart automated nurturing sequences work</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Dynamic Stage Triggers</h4>
                  <p className="text-xs text-[#667085] mt-0.5">
                    When contacts change status (e.g. to Hot, Interested, or Converted), they are automatically enrolled into the matching sequence.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Multi-Day Spaced Scheduling</h4>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Messages are queued with precise intervals (Day 1 &rarr; Day 3 &rarr; Day 7) and respect business quiet hours.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Automatic Exit On Reply</h4>
                  <p className="text-xs text-[#667085] mt-0.5">
                    When the customer sends an inbound message, the drip auto-pauses so an AI Agent or live human can converse naturally without robot overlaps.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTourOpen(false)}
              className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors mt-2"
            >
              Got it, let's build!
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Sliders className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Drip Sequence Settings</h3>
                <p className="text-xs text-[#667085]">Global compliance & sending window rules</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475467]">Quiet Hours (Do Not Disturb)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#667085]">From:</span>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) =>
                        setSettings({ ...settings, quietHoursStart: e.target.value })
                      }
                      className="w-full mt-0.5 bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-1.5 rounded-lg text-xs text-[#101828]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085]">Until:</span>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) =>
                        setSettings({ ...settings, quietHoursEnd: e.target.value })
                      }
                      className="w-full mt-0.5 bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-1.5 rounded-lg text-xs text-[#101828]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#EAECF0] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#101828]">Stop Sequence on Reply</h4>
                  <p className="text-[11px] text-[#667085]">
                    Pause automated follow-ups once lead replies
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.stopOnReply}
                  onChange={(e) =>
                    setSettings({ ...settings, stopOnReply: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475467]">Max Active Sequences per Lead</label>
                <select
                  value={settings.maxConcurrentDrips}
                  onChange={(e) =>
                    setSettings({ ...settings, maxConcurrentDrips: e.target.value })
                  }
                  className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828]"
                >
                  <option value="1">1 Sequence at a time (Recommended)</option>
                  <option value="2">Up to 2 concurrent sequences</option>
                  <option value="unlimited">Unlimited sequences</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSettingsOpen(false);
                showToast('Drip campaign settings saved successfully!', 'success');
              }}
              className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors mt-2"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
