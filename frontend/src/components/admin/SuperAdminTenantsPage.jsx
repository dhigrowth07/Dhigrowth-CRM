import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Key,
  Radio,
  Trash2,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  CheckSquare,
  Square,
  LayoutGrid,
  Mail,
  UserCheck,
  BarChart3,
  Folder,
  Bot,
  Wrench,
  Target,
  GitFork,
  Megaphone,
  GitBranch,
  Percent,
  LayoutTemplate,
  ShoppingBag,
  Puzzle,
  Code,
  Grid,
  Settings,
  Wallet,
  Crown,
  Ticket,
  Tag,
  Calendar,
  Clock,
  ArrowUpRight,
  CheckCheck,
  FileText,
  X,
  Edit3,
  Gift,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useApp, NAVIGATION_MODULES, ALL_PERMISSION_KEYS } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';

const DEFAULT_PROMOCODES = [
  {
    id: 'promo_launch50',
    code: 'LAUNCH50',
    discountPercentage: 50,
    expiryDate: '2026-12-31',
    maxUses: 100,
    usedCount: 2,
    isActive: true,
    description: 'Launch special: 50% discount across all growth & scaling plans',
    usedBy: [
      {
        id: 'red_001',
        username: 'sri',
        tenantName: 'Sri (Dhigrowth)',
        workspaceId: 'b0000000-0000-0000-0000-000000000001',
        planId: 'Growth',
        discountPercentage: 50,
        amountSaved: '₹1,062',
        redeemedAt: '2026-09-21T10:30:00.000Z',
      },
      {
        id: 'red_002',
        username: 'david_store',
        tenantName: 'David Miller',
        workspaceId: 'b0000000-0000-0000-0000-000000000002',
        planId: 'Pro',
        discountPercentage: 50,
        amountSaved: '₹1,959',
        redeemedAt: '2026-09-24T14:15:00.000Z',
      },
    ],
  },
  {
    id: 'promo_growth30',
    code: 'GROWTH30',
    discountPercentage: 30,
    expiryDate: '2026-11-30',
    maxUses: 50,
    usedCount: 0,
    isActive: true,
    description: 'Exclusive 30% discount for expanding creator & e-commerce teams',
    usedBy: [],
  },
  {
    id: 'promo_flash80',
    code: 'FLASH80',
    discountPercentage: 80,
    expiryDate: '2026-08-15',
    maxUses: 10,
    usedCount: 10,
    isActive: true,
    description: 'Independence Day flash discount: 80% off (Limited seats)',
    usedBy: [
      {
        id: 'red_003',
        username: 'early_founder',
        tenantName: 'Early Founder Labs',
        workspaceId: 'b0000000-0000-0000-0000-000000000003',
        planId: 'Business',
        discountPercentage: 80,
        amountSaved: '₹4,479',
        redeemedAt: '2026-08-14T10:00:00.000Z',
      },
    ],
  },
];

export const SuperAdminTenantsPage = () => {
  const {
    tenants,
    createTenantUser,
    deleteTenantUser,
    toggleTenantPermission,
    batchUpdateTenantPermissions,
    currentUser,
    showToast,
    viewAsTenant,
    setActiveTab,
    impersonatedTenant,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all', 'active', 'admin'
  const [expandedPermissions, setExpandedPermissions] = useState({});

  // Promocodes & Plan Discounts State
  const [primaryView, setPrimaryView] = useState('tenants'); // 'tenants' | 'promocodes'
  const [promocodes, setPromocodes] = useState(DEFAULT_PROMOCODES);
  const [promoFilter, setPromoFilter] = useState('all'); // 'all' | 'active' | 'used' | 'expired'
  const [promoSearch, setPromoSearch] = useState('');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [selectedPromoForRedemptions, setSelectedPromoForRedemptions] = useState(null);
  const [copiedPromoCode, setCopiedPromoCode] = useState(null);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountPercentage: 30,
    expiryDate: '2026-12-31',
    maxUses: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPromocodes();
  }, []);

  const fetchPromocodes = async () => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/promocodes`);
      } catch {}
      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/promocodes');
        } catch {}
      }
      if (!res || !res.ok) {
        try {
          res = await fetch('https://api-wappilot.dhigrowth.com/api/promocodes');
        } catch {}
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data.promocodes && Array.isArray(data.promocodes)) {
          setPromocodes(data.promocodes);
          try {
            localStorage.setItem('dhigrowth_promocodes', JSON.stringify(data.promocodes));
          } catch {}
          return;
        }
      }
    } catch (err) {
      console.warn('Backend promocodes note:', err.message);
    }

    try {
      const saved = localStorage.getItem('dhigrowth_promocodes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPromocodes(parsed);
        }
      }
    } catch {}
  };

  const getPromoBadge = (promo) => {
    if (promo.isActive === false) {
      return {
        label: 'Disabled',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        dotClass: 'bg-gray-400',
        statusKey: 'disabled',
      };
    }
    if (promo.expiryDate) {
      const expTime = new Date(`${promo.expiryDate}T23:59:59`).getTime();
      if (!isNaN(expTime) && Date.now() > expTime) {
        return {
          label: 'Expired',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
          statusKey: 'expired',
        };
      }
    }
    if (promo.maxUses && Number(promo.usedCount) >= Number(promo.maxUses)) {
      return {
        label: 'Used Up',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
        statusKey: 'used_up',
      };
    }
    return {
      label: 'Active',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      statusKey: 'active',
    };
  };

  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      discountPercentage: 30,
      expiryDate: '2026-12-31',
      maxUses: '',
      description: '',
      isActive: true,
    });
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      discountPercentage: promo.discountPercentage || 20,
      expiryDate: promo.expiryDate || '',
      maxUses: promo.maxUses || '',
      description: promo.description || '',
      isActive: promo.isActive !== false,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim()) {
      showToast('Please enter a promo code name', 'error');
      return;
    }
    const cleanCode = promoForm.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const discount = Math.min(Math.max(Number(promoForm.discountPercentage) || 0, 1), 100);

    setIsSavingPromo(true);
    try {
      const payload = {
        code: cleanCode,
        discountPercentage: discount,
        expiryDate: promoForm.expiryDate,
        maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null,
        description: promoForm.description,
        isActive: promoForm.isActive,
      };

      if (editingPromo) {
        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/promocodes/${editingPromo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/promocodes/${editingPromo.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (!res || !res.ok) {
          try {
            res = await fetch(`https://api-wappilot.dhigrowth.com/api/promocodes/${editingPromo.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          setPromocodes((prev) => {
            const next = prev.map((p) => (p.id === editingPromo.id ? data.promocode : p));
            try { localStorage.setItem('dhigrowth_promocodes', JSON.stringify(next)); } catch {}
            return next;
          });
        } else {
          setPromocodes((prev) => {
            const next = prev.map((p) => (p.id === editingPromo.id ? { ...p, ...payload } : p));
            try { localStorage.setItem('dhigrowth_promocodes', JSON.stringify(next)); } catch {}
            return next;
          });
        }
        showToast(`Promo code "${cleanCode}" updated with ${discount}% discount!`, 'success');
      } else {
        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/promocodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}

        if (!res || !res.ok) {
          try {
            res = await fetch('http://localhost:4000/api/promocodes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (!res || !res.ok) {
          try {
            res = await fetch('https://api-wappilot.dhigrowth.com/api/promocodes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } catch {}
        }

        if (res && res.ok) {
          const data = await res.json();
          setPromocodes((prev) => {
            const next = [data.promocode, ...prev];
            try { localStorage.setItem('dhigrowth_promocodes', JSON.stringify(next)); } catch {}
            return next;
          });
        } else {
          const newCodeObj = {
            id: `promo_${cleanCode.toLowerCase()}_${Date.now()}`,
            ...payload,
            usedCount: 0,
            usedBy: [],
            isActive: true,
          };
          setPromocodes((prev) => {
            const next = [newCodeObj, ...prev];
            try { localStorage.setItem('dhigrowth_promocodes', JSON.stringify(next)); } catch {}
            return next;
          });
        }
        showToast(`Promo code "${cleanCode}" created with ${discount}% discount!`, 'success');
      }
      setIsPromoModalOpen(false);
      fetchPromocodes();
    } catch (err) {
      showToast(err.message || 'Error saving promo code', 'error');
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo) => {
    const nextActive = !promo.isActive;
    try {
      await fetch(`${BACKEND_URL}/api/promocodes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });
    } catch (e) {
      // Local fallback
    }
    setPromocodes((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, isActive: nextActive } : p))
    );
    showToast(`Promo code "${promo.code}" is now ${nextActive ? 'Active' : 'Paused'}.`, 'success');
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) return;
    try {
      await fetch(`${BACKEND_URL}/api/promocodes/${promo.id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      // Local fallback
    }
    setPromocodes((prev) => prev.filter((p) => p.id !== promo.id));
    showToast(`Promo code "${promo.code}" deleted.`, 'success');
  };

  const handleCopyPromo = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedPromoCode(code);
    showToast(`Copied promo code "${code}" to clipboard!`, 'success');
    setTimeout(() => setCopiedPromoCode(null), 2500);
  };

  const toggleExpandPermissions = (tenantId) => {
    setExpandedPermissions((prev) => ({
      ...prev,
      [tenantId]: !prev[tenantId],
    }));
  };

  const getInitialPermissions = () => {
    const init = {};
    (ALL_PERMISSION_KEYS || []).forEach((k) => {
      init[k] = true;
    });
    init.send_due_all = true;
    init.team_inbox = true;
    init.ai_studio = true;
    init.meta_api = true;
    init.crm_leads = true;
    init.campaigns = true;
    return init;
  };

  // New Tenant Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    companyName: '',
    plan: 'Pro Plan',
    credits: 500,
    permissions: getInitialPermissions(),
  });

  const getModuleIcon = (id) => {
    const map = {
      dashboard: LayoutGrid,
      inbox: Mail,
      leads: UserCheck,
      insights: BarChart3,
      files: Folder,
      'ai-assistants': Bot,
      tools: Wrench,
      'lead-studio': Target,
      segmentation: GitFork,
      campaigns: Megaphone,
      'drip-campaigns': GitBranch,
      automations: Percent,
      templates: LayoutTemplate,
      'channel-whatsapp': Zap,
      'channel-instagram': Radio,
      'channel-messenger': Mail,
      'channel-line': Radio,
      channels: Layers,
      'meta-api': Key,
      shopify: ShoppingBag,
      zoho: Puzzle,
      api: Code,
      apps: Grid,
      team: Users,
      manage: Settings,
      wallet: Wallet,
      plans: Crown,
      send_due_all: Zap,
    };
    return map[id] || Layers;
  };

  const isTenantFeatureEnabled = (tenant, featureId) => {
    if (tenant.username === 'admin' || tenant.isSuperAdmin) return true;
    // Core essential modules: always enabled for every user
    if (featureId === 'manage' || featureId === 'wallet' || featureId === 'plans') {
      return true;
    }
    const perms = tenant.permissions || {};
    if (featureId === 'inbox') {
      return perms['inbox'] !== false && perms['team_inbox'] !== false && perms['teamInbox'] !== false;
    }
    if (featureId === 'leads') {
      return perms['leads'] !== false && perms['crm_leads'] !== false;
    }
    if (featureId === 'ai-assistants') {
      return perms['ai-assistants'] !== false && perms['ai_studio'] !== false && perms['aiStudio'] !== false;
    }
    if (featureId === 'meta-api') {
      return perms['meta-api'] !== false && perms['meta_api'] !== false && perms['metaKeys'] !== false;
    }
    if (featureId === 'send_due_all') {
      return perms['send_due_all'] !== false && perms['sendDueToAll'] !== false;
    }
    return perms[featureId] !== false;
  };

  const countActivePermissions = (tenant) => {
    if (tenant.username === 'admin' || tenant.isSuperAdmin) return ALL_PERMISSION_KEYS.length;
    return (ALL_PERMISSION_KEYS || []).filter((k) => isTenantFeatureEnabled(tenant, k)).length;
  };

  const handleToggleAllFeatures = (tenantId, shouldEnable) => {
    const patch = {};
    (ALL_PERMISSION_KEYS || []).forEach((k) => {
      patch[k] = shouldEnable;
    });
    patch.team_inbox = shouldEnable;
    patch.teamInbox = shouldEnable;
    patch.crm_leads = shouldEnable;
    patch.ai_studio = shouldEnable;
    patch.aiStudio = shouldEnable;
    patch.meta_api = shouldEnable;
    patch.metaKeys = shouldEnable;
    patch.sendDueToAll = shouldEnable;
    patch.send_due_all = shouldEnable;

    // Core essential modules: Manage Settings, Wallet, Plans & Pricing are always enabled
    patch.manage = true;
    patch.wallet = true;
    patch.plans = true;

    batchUpdateTenantPermissions(tenantId, patch);
  };

  const handleToggleCategory = (tenantId, categoryItems, shouldEnable) => {
    const patch = {};
    categoryItems.forEach((it) => {
      patch[it.id] = shouldEnable;
      if (it.id === 'inbox') {
        patch.team_inbox = shouldEnable;
        patch.teamInbox = shouldEnable;
      }
      if (it.id === 'leads') patch.crm_leads = shouldEnable;
      if (it.id === 'ai-assistants') {
        patch.ai_studio = shouldEnable;
        patch.aiStudio = shouldEnable;
      }
      if (it.id === 'meta-api') {
        patch.meta_api = shouldEnable;
        patch.metaKeys = shouldEnable;
      }
      if (it.id === 'send_due_all') patch.sendDueToAll = shouldEnable;

      // Keep core essential modules always enabled
      if (it.id === 'manage' || it.id === 'wallet' || it.id === 'plans') {
        patch[it.id] = true;
      }
    });
    batchUpdateTenantPermissions(tenantId, patch);
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/?tenant=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showToast(`Copied workspace URL for tenant "${slug}"!`, 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const [copiedPasswordId, setCopiedPasswordId] = useState(null);
  const [copiedCredsId, setCopiedCredsId] = useState(null);

  const handleCopyPassword = (id, password, username) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(id);
    showToast(`Copied password for "${username}": ${password}`, 'success');
    setTimeout(() => setCopiedPasswordId(null), 2500);
  };

  const handleCopyCredentials = (tenant, password) => {
    const credsText = `Workspace: ${window.location.origin}/?tenant=${tenant.slug || tenant.username}\nUsername: ${tenant.username}\nPassword: ${password}`;
    navigator.clipboard.writeText(credsText);
    setCopiedCredsId(tenant.id);
    showToast(`Copied login credentials for "${tenant.username}"!`, 'success');
    setTimeout(() => setCopiedCredsId(null), 2500);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      showToast('Please fill in Name, Username, and Password', 'error');
      return;
    }

    const created = createTenantUser(formData);
    if (created) {
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        companyName: '',
        plan: 'Pro Plan',
        credits: 500,
        permissions: getInitialPermissions(),
      });
    }
  };

  const filteredTenants = (tenants || []).filter((t) => {
    const matchQuery =
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.workspaceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;
    if (activeTabFilter === 'admin') return t.isAdmin;
    if (activeTabFilter === 'active') return t.status === 'active' || t.status === 'Active';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Super Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] text-[11px] font-bold border border-purple-200 mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            Super Admin Control Center
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#101828]">
            {primaryView === 'tenants' ? 'Tenant Organizations & Users' : 'Promo Codes & Plan Discounts'}
          </h1>
          <p className="text-[#475467] text-xs sm:text-sm mt-0.5">
            {primaryView === 'tenants'
              ? 'Manage isolated customer accounts, workspaces, and user permissions.'
              : 'Create discount promo codes, manage percentages, track redemptions, and monitor expiration status.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {primaryView === 'tenants' ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New Tenant / User
            </button>
          ) : (
            <button
              onClick={handleOpenCreatePromo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Promo Code
            </button>
          )}
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#EAECF0] rounded-2xl shadow-2xs w-fit">
        <button
          onClick={() => setPrimaryView('tenants')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            primaryView === 'tenants'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenants & Workspaces</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              primaryView === 'tenants' ? 'bg-white/20 text-white' : 'bg-[#EAECF0] text-[#344054]'
            }`}
          >
            {tenants?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setPrimaryView('promocodes')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            primaryView === 'promocodes'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Promo Codes & Plan Discounts</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              primaryView === 'promocodes' ? 'bg-white/20 text-white' : 'bg-[#EAECF0] text-[#344054]'
            }`}
          >
            {promocodes.length}
          </span>
        </button>
      </div>

      {primaryView === 'tenants' && (
        <>
          {/* Metrics Row (Crisp Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Total Tenants</span>
            <Building2 className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <p className="text-2xl font-bold text-[#101828] mt-2">{tenants?.length || 0}</p>
          <span className="text-xs text-[#10B981] font-semibold">All isolated partitions</span>
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Active Users</span>
            <Users className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl font-bold text-[#101828] mt-2">
            {(tenants || []).filter((t) => t.status === 'Active' || t.status === 'active').length}
          </p>
          <span className="text-xs text-[#10B981] font-semibold">100% operational</span>
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Super Admins</span>
            <Shield className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <p className="text-2xl font-bold text-[#101828] mt-2">
            {(tenants || []).filter((t) => t.isAdmin).length}
          </p>
          <span className="text-xs text-[#7C3AED] font-semibold">Master organization</span>
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Active Session</span>
            <Radio className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-sm font-bold text-[#101828] mt-2 truncate">
            {currentUser?.name || 'Super Admin'}
          </p>
          <span className="text-xs text-[#0284C7] font-mono truncate block mt-0.5">
            {currentUser?.workspaceId || 'ws_default_dhigrowth'}
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-[#EAECF0] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, slug, workspace ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F2F4F7] rounded-lg self-stretch sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            All Tenants ({tenants?.length || 0})
          </button>
          <button
            onClick={() => setActiveTabFilter('active')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTabFilter === 'active'
                ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setActiveTabFilter('admin')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTabFilter === 'admin'
                ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                : 'text-[#475467] hover:text-[#101828]'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Tenants Directory List */}
      <div className="space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-12 text-center shadow-2xs">
            <Users className="w-12 h-12 text-[#98A2B3] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-[#101828]">No Tenants Found</h3>
            <p className="text-sm text-[#667085] mt-1 max-w-sm mx-auto">
              No tenant matched your filter criteria. Click "Add New Tenant / User" to spin up an isolated customer workspace.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Tenant
            </button>
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const isSelf = currentUser?.id === tenant.id || currentUser?.username === tenant.username;
            const isPasswordShown = visiblePasswords[tenant.id] !== false;
            const displayPassword = tenant.password || (tenant.username === 'admin' ? 'wappilot@' : tenant.username === 'sri' ? 'dhigrowth2026' : tenant.username === 'maddy' ? 'maddy2' : `${tenant.username}123`);

            return (
              <div
                key={tenant.id}
                className={`bg-white border transition-all rounded-2xl p-5 shadow-2xs hover:shadow-md ${
                  isSelf
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/10'
                    : 'border-[#EAECF0]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Tenant Identity */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-2xs ${
                        tenant.username === 'admin' || tenant.isSuperAdmin
                          ? 'bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white'
                          : tenant.username === 'sri'
                          ? 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white'
                          : 'bg-gradient-to-br from-[#10B981] to-[#14B8A6] text-white'
                      }`}
                    >
                      {tenant.name ? tenant.name.substring(0, 2).toUpperCase() : 'TN'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#101828] text-base sm:text-lg">
                          {tenant.name}
                        </h3>
                        {tenant.companyName && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F2F4F7] text-[#344054] font-medium border border-[#E4E7EC]">
                            {tenant.companyName}
                          </span>
                        )}
                        {tenant.username === 'admin' || tenant.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                            <Shield className="w-3 h-3" /> Super Admin
                          </span>
                        ) : tenant.username === 'sri' || tenant.role === 'DhiGrowth Admin' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3 h-3 text-blue-600" /> DhiGrowth Admin
                          </span>
                        ) : tenant.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Workspace Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                            Client Tenant
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F0FD] text-[#7C3AED] border border-[#E9D8FD]">
                            Current Session
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#475467]">
                        <span>
                          Username: <strong className="text-[#101828]">{tenant.username}</strong>
                        </span>
                        {tenant.email && <span>Email: {tenant.email}</span>}
                        <span>
                          Plan: <strong className="text-[#7C3AED]">{tenant.plan || 'Pro'}</strong>
                        </span>
                        <span>
                          Credits: <strong className="text-[#101828]">{tenant.credits ?? 500}</strong>
                        </span>
                      </div>

                      {/* Workspace ID & Credentials Box */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F9FAFB] border border-[#EAECF0] font-mono text-[11px] text-[#344054]">
                          <Layers className="w-3 h-3 text-[#7C3AED]" />
                          <span>Partition:</span>
                          <span className="font-bold text-[#7C3AED]">{tenant.workspaceId}</span>
                        </div>

                        {/* Password display & quick copy */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F0FD] border border-[#E9D8FD] font-mono text-[11px] text-[#344054]">
                          <Key className="w-3 h-3 text-[#7C3AED]" />
                          <span className="text-[#667085]">Password:</span>
                          <span className="font-bold text-[#101828] select-all bg-white px-1.5 py-0.5 rounded border border-[#E9D8FD]">
                            {isPasswordShown ? displayPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(tenant.id)}
                            className="text-[#98A2B3] hover:text-[#7C3AED] ml-0.5 p-0.5 rounded hover:bg-white transition-colors cursor-pointer"
                            title={isPasswordShown ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(tenant.id, displayPassword, tenant.username)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white hover:bg-[#EDE5FA] text-[#7C3AED] border border-[#E9D8FD] font-sans font-semibold text-[10px] transition-colors cursor-pointer ml-1"
                            title="Copy Password"
                          >
                            {copiedPasswordId === tenant.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#10B981]" />
                                <span className="text-[#047857]">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#7C3AED]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center">
                    {/* View As Workspace Button */}
                    {tenant.username !== 'admin' && !tenant.isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          viewAsTenant(tenant);
                          setActiveTab('dashboard');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="View and test dashboard as this tenant to verify active/disabled permissions"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>View as {tenant.name || tenant.username}</span>
                      </button>
                    )}

                    {/* Launch Window */}
                    <a
                      href={`${window.location.origin}/?tenant=${tenant.slug || tenant.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] border border-[#E9D8FD] text-xs font-bold transition-all shadow-2xs"
                      title="Open dedicated workspace in a new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Launch
                    </a>

                    {/* Copy Login Credentials */}
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(tenant, displayPassword)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7C3AED] border border-[#E9D8FD] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Copy full login credentials (Workspace URL, Username & Password)"
                    >
                      {copiedCredsId === tenant.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="text-[#047857] font-bold">Copied Login!</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5 text-[#7C3AED]" />
                          <span>Copy Login</span>
                        </>
                      )}
                    </button>

                    {/* Copy Workspace URL */}
                    <button
                      onClick={() => handleCopyLink(tenant.slug || tenant.username)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F2F4F7] text-[#344054] border border-[#EAECF0] text-xs font-medium transition-colors cursor-pointer"
                      title="Copy URL with tenant link"
                    >
                      {copiedSlug === (tenant.slug || tenant.username) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="text-[#047857] font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#98A2B3]" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    {/* Delete Tenant (Guard primary super admin) */}
                    {tenant.username !== 'admin' && !tenant.isSuperAdmin && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete tenant "${tenant.name}" and all associated credentials?`)) {
                            deleteTenantUser(tenant.id);
                          }
                        }}
                        className="p-2 rounded-lg text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                        title="Delete Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Feature Permissions Manager */}
                <div className="mt-4 pt-4 border-t border-[#F2F4F7]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#344054] uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#0284C7]" />
                        Sidebar & Feature Access
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200">
                        {countActivePermissions(tenant)} / {ALL_PERMISSION_KEYS.length} Active
                      </span>
                      {tenant.username !== 'admin' && !tenant.isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            viewAsTenant(tenant);
                            setActiveTab('dashboard');
                          }}
                          className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1 ml-1"
                          title="Preview what this tenant sees in the sidebar"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview User View</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {tenant.username !== 'admin' && !tenant.isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleAllFeatures(tenant.id, true)}
                            className="text-[11px] font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                          >
                            Enable All
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAllFeatures(tenant.id, false)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Disable All
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpandPermissions(tenant.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F9FAFB] hover:bg-[#F2F4F7] text-[#475467] border border-[#D0D5DD] transition-all cursor-pointer ml-1"
                      >
                        <span>{expandedPermissions[tenant.id] ? 'Compact View' : 'Configure All Modules'}</span>
                        {expandedPermissions[tenant.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Compact Preview of All Modules */}
                  {!expandedPermissions[tenant.id] ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(ALL_PERMISSION_KEYS || []).map((key) => {
                        const isAllowed = isTenantFeatureEnabled(tenant, key);
                        const Icon = getModuleIcon(key);
                        let label = key;
                        for (const cat of NAVIGATION_MODULES) {
                          const it = cat.items.find((x) => x.id === key);
                          if (it) {
                            label = it.label;
                            break;
                          }
                        }

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={tenant.username === 'admin' || tenant.isSuperAdmin}
                            onClick={() => toggleTenantPermission(tenant.id, key)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isAllowed
                                ? 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD] hover:bg-[#E0F2FE]'
                                : 'bg-[#F2F4F7] text-[#98A2B3] border-[#EAECF0] line-through opacity-70'
                            }`}
                            title={`Click to toggle ${label} for ${tenant.name} (${isAllowed ? 'Enabled' : 'Disabled'})`}
                          >
                            <Icon className="w-3 h-3 shrink-0" />
                            <span>{label}</span>
                            {isAllowed ? (
                              <Check className="w-3 h-3 text-[#0284C7]" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-[#98A2B3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Detailed Categorized Breakdown matching screenshots */
                    <div className="space-y-3 bg-[#F8F9FC] p-3.5 rounded-xl border border-[#EAECF0]">
                      {NAVIGATION_MODULES.map((cat) => {
                        const allCatEnabled = cat.items.every((it) => isTenantFeatureEnabled(tenant, it.id));

                        return (
                          <div key={cat.category} className="bg-white p-3 rounded-xl border border-[#EAECF0] shadow-2xs">
                            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#F2F4F7]">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-[#344054] uppercase tracking-wider">
                                  {cat.title || cat.category}
                                </span>
                                <span className="text-[11px] text-[#0284C7] font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                                  {cat.items.filter((it) => isTenantFeatureEnabled(tenant, it.id)).length}/{cat.items.length} enabled
                                </span>
                              </div>

                              {tenant.username !== 'admin' && !tenant.isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleCategory(tenant.id, cat.items, !allCatEnabled)}
                                  className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                                >
                                  {allCatEnabled ? 'Disable Section' : 'Enable Section'}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {cat.items.map((it) => {
                                const isAllowed = isTenantFeatureEnabled(tenant, it.id);
                                const Icon = getModuleIcon(it.id);

                                return (
                                  <button
                                    key={it.id}
                                    type="button"
                                    disabled={tenant.username === 'admin' || tenant.isSuperAdmin}
                                    onClick={() => toggleTenantPermission(tenant.id, it.id)}
                                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold border transition-all text-left cursor-pointer ${
                                      isAllowed
                                        ? 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD] hover:bg-[#E0F2FE]'
                                        : 'bg-[#F9FAFB] text-[#98A2B3] border-[#EAECF0] line-through'
                                    }`}
                                    title={`Toggle ${it.label} for ${tenant.name}`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Icon className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{it.label}</span>
                                    </div>
                                    {isAllowed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0 ml-1" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5 text-[#98A2B3] shrink-0 ml-1" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Primary View: Promo Codes & Plan Discounts Management */}
      {primaryView === 'promocodes' && (
        <div className="space-y-6">
          {/* Promocodes KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Total Promo Codes</span>
                <Ticket className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <p className="text-2xl font-bold text-[#101828] mt-2">{promocodes.length}</p>
              <span className="text-xs text-[#7C3AED] font-semibold">Configured discount codes</span>
            </div>

            <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Active & Valid</span>
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              </div>
              <p className="text-2xl font-bold text-[#101828] mt-2">
                {promocodes.filter((p) => getPromoBadge(p).label === 'Active').length}
              </p>
              <span className="text-xs text-[#10B981] font-semibold">Ready for checkout use</span>
            </div>

            <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Total Redemptions</span>
                <Users className="w-4 h-4 text-[#0284C7]" />
              </div>
              <p className="text-2xl font-bold text-[#101828] mt-2">
                {promocodes.reduce((sum, p) => sum + (Number(p.usedCount) || 0), 0)}
              </p>
              <span className="text-xs text-[#0284C7] font-semibold">Applied across plans</span>
            </div>

            <div className="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Expired / Used Up</span>
                <Clock className="w-4 h-4 text-[#F43F5E]" />
              </div>
              <p className="text-2xl font-bold text-[#101828] mt-2">
                {promocodes.filter((p) => {
                  const b = getPromoBadge(p).label;
                  return b === 'Expired' || b === 'Used Up';
                }).length}
              </p>
              <span className="text-xs text-[#F43F5E] font-semibold">Past expiry date or cap</span>
            </div>
          </div>

          {/* Promocodes Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-[#EAECF0] shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="text"
                value={promoSearch}
                onChange={(e) => setPromoSearch(e.target.value)}
                placeholder="Search by code, notes, discount %..."
                className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F2F4F7] rounded-lg self-stretch sm:self-auto text-xs font-bold">
              <button
                onClick={() => setPromoFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  promoFilter === 'all'
                    ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                All ({promocodes.length})
              </button>
              <button
                onClick={() => setPromoFilter('active')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  promoFilter === 'active'
                    ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Active ({promocodes.filter((p) => getPromoBadge(p).label === 'Active').length})
              </button>
              <button
                onClick={() => setPromoFilter('used')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  promoFilter === 'used'
                    ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Used ({promocodes.filter((p) => (p.usedCount || 0) > 0).length})
              </button>
              <button
                onClick={() => setPromoFilter('expired')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  promoFilter === 'expired'
                    ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                    : 'text-[#475467] hover:text-[#101828]'
                }`}
              >
                Expired ({promocodes.filter((p) => getPromoBadge(p).label === 'Expired').length})
              </button>
            </div>
          </div>

          {/* Promocodes Grid Cards */}
          {(() => {
            const filteredPromos = promocodes.filter((promo) => {
              const q = promoSearch.toLowerCase().trim();
              const matchSearch =
                !q ||
                promo.code.toLowerCase().includes(q) ||
                (promo.description && promo.description.toLowerCase().includes(q)) ||
                String(promo.discountPercentage).includes(q);

              if (!matchSearch) return false;

              const badge = getPromoBadge(promo);
              if (promoFilter === 'active') return badge.label === 'Active';
              if (promoFilter === 'expired') return badge.label === 'Expired';
              if (promoFilter === 'used') return (promo.usedCount || 0) > 0;
              return true;
            });

            if (filteredPromos.length === 0) {
              return (
                <div className="bg-white border border-[#EAECF0] rounded-2xl p-12 text-center shadow-2xs">
                  <Ticket className="w-12 h-12 text-[#98A2B3] mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="text-lg font-bold text-[#101828]">No Promo Codes Found</h3>
                  <p className="text-sm text-[#667085] mt-1 max-w-sm mx-auto">
                    No promo codes match your current filter. Create a new code to give plan discounts to users.
                  </p>
                  <button
                    onClick={handleOpenCreatePromo}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Create Promo Code
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPromos.map((promo) => {
                  const badge = getPromoBadge(promo);
                  const isUsed = (promo.usedCount || 0) > 0;
                  const isCopied = copiedPromoCode === promo.code;

                  // Expiry calculations
                  let daysRemainingText = null;
                  let isPastDate = false;
                  if (promo.expiryDate) {
                    const expTime = new Date(`${promo.expiryDate}T23:59:59`).getTime();
                    const diffDays = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                      isPastDate = true;
                      daysRemainingText = `Expired ${Math.abs(diffDays)} days ago`;
                    } else if (diffDays === 0) {
                      daysRemainingText = 'Expires today';
                    } else {
                      daysRemainingText = `${diffDays} days left`;
                    }
                  }

                  const usagePercent = promo.maxUses
                    ? Math.min(100, Math.round(((promo.usedCount || 0) / promo.maxUses) * 100))
                    : 0;

                  return (
                    <div
                      key={promo.id}
                      className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Ribbon: Code ticket + Discount % + Status Badge */}
                        <div className="flex items-center justify-between gap-2 border-b border-[#F2F4F7] pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-base tracking-wider text-[#7C3AED] bg-purple-50 px-2.5 py-1 rounded-lg border-2 border-dashed border-[#7C3AED]/30 flex items-center gap-1.5">
                              <Ticket className="w-3.5 h-3.5" />
                              {promo.code}
                            </span>
                            <button
                              onClick={() => handleCopyPromo(promo.code)}
                              className="p-1 rounded-md text-[#98A2B3] hover:text-[#7C3AED] hover:bg-[#F4F0FD] transition-colors cursor-pointer"
                              title="Copy promo code"
                            >
                              {isCopied ? (
                                <CheckCheck className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#7C3AED] text-white shadow-2xs shrink-0">
                            {promo.discountPercentage}% OFF
                          </span>
                        </div>

                        {/* Status Badge + Is Used Or Not Status */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>

                          {/* "Is It Used Or Not" Clear Visual Indicator */}
                          {isUsed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Used ({promo.usedCount} {promo.usedCount === 1 ? 'time' : 'times'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Not Used Yet
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#475467] leading-relaxed mb-4 min-h-[36px]">
                          {promo.description || 'Special promo code discount applicable at checkout on all plans.'}
                        </p>

                        {/* Details Card (Usage limit, Expiry status) */}
                        <div className="bg-[#F8F9FC] rounded-xl p-3 border border-[#EAECF0] space-y-2 mb-4 text-xs">
                          {/* Expiration Status Detail */}
                          <div className="flex items-center justify-between">
                            <span className="text-[#667085] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                              Expiration:
                            </span>
                            <span
                              className={`font-semibold ${
                                isPastDate ? 'text-rose-600 font-bold' : 'text-[#101828]'
                              }`}
                            >
                              {promo.expiryDate || 'No expiry'}
                              {daysRemainingText && (
                                <span
                                  className={`ml-1 text-[11px] font-medium ${
                                    isPastDate ? 'text-rose-600' : 'text-[#667085]'
                                  }`}
                                >
                                  ({daysRemainingText})
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Usage Limit & Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[#667085] flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#98A2B3]" />
                                Redemptions:
                              </span>
                              <span className="font-semibold text-[#101828]">
                                {promo.usedCount || 0}
                                {promo.maxUses ? ` / ${promo.maxUses} max` : ' (Unlimited)'}
                              </span>
                            </div>
                            {promo.maxUses && (
                              <div className="w-full bg-[#EAECF0] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usagePercent >= 100
                                      ? 'bg-amber-500'
                                      : usagePercent > 70
                                      ? 'bg-purple-600'
                                      : 'bg-[#10B981]'
                                  }`}
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-[#EAECF0] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              promo.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={promo.isActive !== false ? 'Click to Pause' : 'Click to Activate'}
                          >
                            {promo.isActive !== false ? 'Active' : 'Paused'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditPromo(promo)}
                            className="p-1.5 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:text-[#7C3AED] transition-colors cursor-pointer"
                            title="Edit discount percentage & details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePromo(promo)}
                            className="p-1.5 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                            title="Delete promo code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* View Redemptions Button */}
                        {isUsed ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPromoForRedemptions(promo)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] hover:underline cursor-pointer"
                          >
                            <span>Redemptions ({promo.usedCount})</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#98A2B3]">No uses yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#EAECF0] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center border border-[#A7F3D0]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Add New Tenant / User</h3>
                  <p className="text-xs text-[#667085]">
                    Spawns an isolated customer workspace with custom credentials and direct access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#98A2B3] hover:text-[#101828] text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    User Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Organization / Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Logistics"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Login Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                      })
                    }
                    placeholder="e.g. ramesh"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] font-mono focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  />
                  <span className="text-[11px] text-[#667085] mt-1 block">
                    URL Slug: <code className="text-[#047857] font-bold">?tenant={formData.username || 'username'}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. Ramesh@2026"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] font-mono focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@company.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Plan Tier
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15"
                  >
                    <option value="Starter Plan">Starter Plan (Free)</option>
                    <option value="Pro Plan">Pro Plan (₹2,499/mo)</option>
                    <option value="Enterprise Scale">Enterprise Scale (₹9,999/mo)</option>
                  </select>
                </div>
              </div>

              {/* Granular Feature & Navigation Permissions Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-bold text-[#344054]">
                      Sidebar Navigation & Feature Permissions
                    </label>
                    <span className="text-[11px] text-[#667085]">
                      Select which sidebar options and features are enabled for this tenant
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {};
                        (ALL_PERMISSION_KEYS || []).forEach((k) => (updated[k] = true));
                        updated.send_due_all = true;
                        updated.team_inbox = true;
                        updated.teamInbox = true;
                        updated.crm_leads = true;
                        updated.ai_studio = true;
                        updated.aiStudio = true;
                        updated.meta_api = true;
                        updated.metaKeys = true;
                        updated.sendDueToAll = true;
                        setFormData({ ...formData, permissions: updated });
                      }}
                      className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {};
                        (ALL_PERMISSION_KEYS || []).forEach((k) => (updated[k] = false));
                        updated.send_due_all = false;
                        updated.team_inbox = false;
                        updated.teamInbox = false;
                        updated.crm_leads = false;
                        updated.ai_studio = false;
                        updated.aiStudio = false;
                        updated.meta_api = false;
                        updated.metaKeys = false;
                        updated.sendDueToAll = false;
                        setFormData({ ...formData, permissions: updated });
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#EAECF0]">
                  {NAVIGATION_MODULES.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold font-mono text-[#667085] uppercase tracking-wider">
                        <span>{cat.title || cat.category}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {cat.items.map((it) => {
                          const isChecked = formData.permissions[it.id] !== false;
                          const Icon = getModuleIcon(it.id);

                          return (
                            <label
                              key={it.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                                isChecked
                                  ? 'bg-white border-[#BAE6FD] text-[#0284C7] font-semibold shadow-2xs'
                                  : 'bg-gray-50/70 border-[#EAECF0] text-gray-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const nextChecked = e.target.checked;
                                  const updated = {
                                    ...formData.permissions,
                                    [it.id]: nextChecked,
                                  };
                                  if (it.id === 'inbox') {
                                    updated.team_inbox = nextChecked;
                                    updated.teamInbox = nextChecked;
                                  } else if (it.id === 'leads') {
                                    updated.crm_leads = nextChecked;
                                  } else if (it.id === 'ai-assistants') {
                                    updated.ai_studio = nextChecked;
                                    updated.aiStudio = nextChecked;
                                  } else if (it.id === 'meta-api') {
                                    updated.meta_api = nextChecked;
                                    updated.metaKeys = nextChecked;
                                  } else if (it.id === 'send_due_all') {
                                    updated.sendDueToAll = nextChecked;
                                  }
                                  setFormData({
                                    ...formData,
                                    permissions: updated,
                                  });
                                }}
                                className="rounded border-[#D0D5DD] text-[#0284C7] focus:ring-[#0284C7]"
                              />
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{it.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#D0D5DD] text-[#344054] text-sm font-semibold hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Create Tenant Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Promo Code Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#EAECF0] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center border border-purple-200">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">
                    {editingPromo ? `Edit Promo Code: ${editingPromo.code}` : 'Create New Promo Code'}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Configure discount percentage, validity period, and redemption limits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-[#98A2B3] hover:text-[#101828] text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePromo} className="p-6 space-y-4">
              {/* Promo Code Name */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Promo Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                    })
                  }
                  placeholder="e.g. LAUNCH50, DIWALI30"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
                />
                <span className="text-[11px] text-[#667085] mt-1 block">
                  Letters, numbers, and dashes only. Automatically converted to uppercase.
                </span>
              </div>

              {/* Discount Percentage with Slider & Input */}
              <div className="bg-[#F8F9FC] p-4 rounded-xl border border-[#EAECF0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054] flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#7C3AED]" />
                    Discount Percentage <span className="text-rose-500">*</span>
                  </label>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#7C3AED] text-white">
                    {promoForm.discountPercentage}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={promoForm.discountPercentage}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discountPercentage: Number(e.target.value) })
                    }
                    className="w-full accent-[#7C3AED] cursor-pointer"
                  />
                  <div className="flex items-center w-20 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={promoForm.discountPercentage}
                      onChange={(e) =>
                        setPromoForm({
                          ...promoForm,
                          discountPercentage: Math.min(Math.max(Number(e.target.value), 1), 100),
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-center font-bold text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                    <span className="ml-1 text-xs text-[#667085] font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Expiry Date & Max Uses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={promoForm.expiryDate}
                    onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
                  />
                  <span className="text-[11px] text-[#667085] mt-1 block">
                    Code automatically expires after this date.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#98A2B3]" />
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={promoForm.maxUses}
                    onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3.5 py-2 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
                  />
                  <span className="text-[11px] text-[#667085] mt-1 block">
                    Total times users can claim this code.
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Description / Campaign Notes
                </label>
                <textarea
                  rows="2"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="e.g. Special festival launch offer: 30% discount on all plans"
                  className="w-full px-3.5 py-2 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15"
                />
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={promoForm.isActive}
                  onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#D0D5DD] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <label htmlFor="promoActiveCheck" className="text-xs font-bold text-[#344054] cursor-pointer">
                  Activate promo code immediately for customer checkouts
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#7C3AED]">
                  Live Checkout Preview
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#7C3AED]">
                      {promoForm.code || 'YOURCODE'}
                    </span>
                    <span className="text-xs text-[#344054]">• {promoForm.discountPercentage}% discount</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Valid at checkout
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#D0D5DD] text-[#344054] text-sm font-semibold hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="px-5 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPromo ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingPromo ? 'Save Changes' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redemption History Modal */}
      {selectedPromoForRedemptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#EAECF0] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center border border-purple-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">
                    Redemption History: <span className="font-mono text-[#7C3AED]">{selectedPromoForRedemptions.code}</span>
                  </h3>
                  <p className="text-xs text-[#667085]">
                    {selectedPromoForRedemptions.discountPercentage}% Discount • Total Redemptions: {selectedPromoForRedemptions.usedCount || selectedPromoForRedemptions.usedBy?.length || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPromoForRedemptions(null)}
                className="text-[#98A2B3] hover:text-[#101828] text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Redemption List */}
            <div className="p-6 max-h-[420px] overflow-y-auto">
              {!selectedPromoForRedemptions.usedBy || selectedPromoForRedemptions.usedBy.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-[#98A2B3] mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold text-[#101828]">No Recorded Redemptions</p>
                  <p className="text-xs text-[#667085] mt-1">
                    This promo code has not been redeemed by any tenant yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#667085] uppercase tracking-wider pb-2 border-b border-[#EAECF0]">
                    <span>Tenant / Organization</span>
                    <span>Plan & Savings</span>
                    <span>Date Redeemed</span>
                  </div>

                  {selectedPromoForRedemptions.usedBy.map((red, idx) => (
                    <div
                      key={red.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FC] border border-[#EAECF0] hover:bg-white transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center font-bold text-xs">
                          {red.tenantName ? red.tenantName.substring(0, 2).toUpperCase() : 'TN'}
                        </div>
                        <div>
                          <p className="font-bold text-[#101828]">{red.tenantName || red.username}</p>
                          <p className="text-[11px] text-[#667085]">@{red.username || 'user'}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {red.planId || 'Growth'} Plan
                        </span>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          Saved {red.amountSaved || 'Discounted'}
                        </p>
                      </div>

                      <div className="text-right text-[#667085]">
                        <p className="font-medium text-[#101828]">
                          {red.redeemedAt ? new Date(red.redeemedAt).toLocaleDateString() : 'Recent'}
                        </p>
                        <p className="text-[11px]">
                          {red.redeemedAt ? new Date(red.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAECF0] flex justify-end bg-[#F9FAFB]">
              <button
                type="button"
                onClick={() => setSelectedPromoForRedemptions(null)}
                className="px-4 py-2 rounded-lg bg-white border border-[#D0D5DD] text-[#344054] text-xs font-bold hover:bg-[#F2F4F7] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
