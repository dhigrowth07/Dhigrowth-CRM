import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import bcrypt from 'bcryptjs';
import {
  isSupabaseConfigured,
  getWalletData,
  getContacts,
  getConversations,
  getWorkspaceMessages,
  getChannels,
  getMessages,
  createContact as createDbContact,
  updateContact as updateDbContact,
  deleteContact as deleteDbContact,
  sendChatMessage,
  subscribeToNewMessages,
  subscribeToWorkspaceRealtime,
  DEFAULT_WORKSPACE_ID,
  ensureWorkspaceExists,
  updateConversationStatus,
  rechargeWalletSupabase,
} from '../services/supabaseClient';
import { BACKEND_URL } from '../services/apiConfig';
import {
  playNotificationSound,
  showDesktopNotification,
  requestNotificationPermission,
} from '../services/notificationService';

export const SEED_TENANTS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    workspaceId: 'a0000000-0000-0000-0000-000000000001',
    name: 'Super Administrator',
    username: 'admin',
    email: 'admin@wapppilot.com',
    companyName: 'WAPPPILOT Platform',
    slug: 'admin',
    role: 'Super Administrator',
    plan: 'Enterprise',
    isSuperAdmin: true,
    isAdmin: true,
    isExternalClient: false,
    password: 'wappilot@',
    passwordHash: '$2b$10$6M.SDAOCSZAI9MIIdkfA.u8oGEL7mTMWvhCds9LOp/UUayeCIY39i',
    permissions: {
      sendDueToAll: true,
      teamInbox: true,
      metaKeys: true,
      aiStudio: true,
      fileManager: true,
      invoicing: true,
    },
    status: 'active',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    workspaceId: 'b0000000-0000-0000-0000-000000000001',
    name: 'Sri',
    username: 'sri',
    email: 'sri@dhigrowth.com',
    companyName: 'Dhigrowth CRM',
    slug: 'sri',
    role: 'DhiGrowth Admin',
    plan: 'Business',
    isSuperAdmin: false,
    isAdmin: false, // DhiGrowth admin only, NOT super admin
    isExternalClient: false,
    password: 'dhigrowth2026',
    passwordHash: '$2a$10$954hF52aM/UfxY8c3Y7fse9fL4k9nU2r8/xRSm2sT.k2k9e9nL8zK', // sri123
    permissions: {
      sendDueToAll: true,
      teamInbox: true,
      metaKeys: true,
      aiStudio: true,
      fileManager: true,
      invoicing: true,
    },
    status: 'active',
    createdAt: '2026-09-11T00:00:00.000Z',
  },
];

export const NAVIGATION_MODULES = [
  {
    category: 'WORKSPACE',
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', default: true },
      { id: 'inbox', label: 'Inbox', default: true },
      { id: 'leads', label: 'Leads', default: true },
      { id: 'insights', label: 'Insights', default: true },
      { id: 'files', label: 'Files', default: true },
    ],
  },
  {
    category: 'AI',
    title: 'AI Engine & Concierge',
    items: [
      { id: 'ai-assistants', label: 'AI Assistants', default: true },
      { id: 'tools', label: 'Tools', default: true },
      { id: 'lead-studio', label: 'Lead Studio', default: true },
      { id: 'segmentation', label: 'Segmentation', default: true },
    ],
  },
  {
    category: 'ENGAGEMENT',
    title: 'Engagement & Campaigns',
    items: [
      { id: 'campaigns', label: 'Campaigns', default: true },
      { id: 'drip-campaigns', label: 'Drip Campaigns', default: true },
      { id: 'automations', label: 'Automations', default: true },
      { id: 'templates', label: 'Templates', default: true },
    ],
  },
  {
    category: 'CHANNELS',
    title: 'Communication Channels',
    items: [
      { id: 'channel-whatsapp', label: 'WhatsApp', default: true },
      { id: 'channel-instagram', label: 'Instagram', default: true },
      { id: 'channel-messenger', label: 'Messenger', default: true },
      { id: 'channel-line', label: 'LINE', default: true },
      { id: 'channels', label: 'All Channels', default: true },
    ],
  },
  {
    category: 'INTEGRATIONS',
    title: 'Integrations & APIs',
    items: [
      { id: 'meta-api', label: 'Meta Cloud API', default: true },
      { id: 'shopify', label: 'Shopify', default: true },
      { id: 'zoho', label: 'Zoho', default: true },
      { id: 'api', label: 'API', default: true },
      { id: 'apps', label: 'Apps', default: true },
    ],
  },
  {
    category: 'ACCOUNT',
    title: 'Account & Settings',
    items: [
      { id: 'team', label: 'Team Members', default: true },
      { id: 'manage', label: 'Manage Settings', default: true },
      { id: 'wallet', label: 'Wallet', default: true },
      { id: 'plans', label: 'Plans & Pricing', default: true },
    ],
  },
  {
    category: 'SPECIAL',
    title: 'Special Privileges',
    items: [
      { id: 'send_due_all', label: 'Send Due to All Contacts', default: true },
    ],
  },
];

export const ALL_PERMISSION_KEYS = NAVIGATION_MODULES.flatMap((cat) => cat.items.map((it) => it.id));

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Theme State (Persisted across browser refresh)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace(/^#\/?/, '').trim();
        if (hash && !hash.startsWith('payment-') && !hash.startsWith('access_token')) {
          return hash;
        }
        const params = new URLSearchParams(window.location.search);
        const queryTab = params.get('tab') || params.get('page');
        if (queryTab) {
          return queryTab;
        }
        const savedTab = localStorage.getItem('dhigrowth_active_tab');
        if (savedTab && typeof savedTab === 'string') {
          return savedTab;
        }
      }
    } catch {}
    return 'dashboard';
  });

  if (typeof window !== 'undefined') {
    window.__setActiveTab = setActiveTab;
  }

  // Synchronize active tab with URL hash and localStorage so refresh stays on the same page
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeTab) {
        localStorage.setItem('dhigrowth_active_tab', activeTab);
        const currentHash = window.location.hash.replace(/^#\/?/, '').trim();
        if (currentHash !== activeTab && !currentHash.startsWith('payment-') && !currentHash.startsWith('access_token')) {
          window.history.replaceState(null, '', `#${activeTab}`);
        }
      }
    } catch {}
  }, [activeTab]);

  // Support browser Back and Forward navigation buttons via hashchange
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      try {
        const newHash = window.location.hash.replace(/^#\/?/, '').trim();
        if (newHash && !newHash.startsWith('payment-') && !newHash.startsWith('access_token')) {
          setActiveTab((prev) => (prev !== newHash ? newHash : prev));
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isBroadcastDueModalOpen, setIsBroadcastDueModalOpen] = useState(false);
  const [isBroadcastTemplateModalOpen, setIsBroadcastTemplateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Multi-Tenant Directory State
  const [tenants, setTenants] = useState(() => {
    try {
      const savedDeleted = localStorage.getItem('dhigrowth_deleted_tenants');
      const deletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];

      const saved = localStorage.getItem('dhigrowth_tenants');
      let baseList = SEED_TENANTS;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed.filter(
            (t) => !deletedIds.includes(t.id) && !deletedIds.includes(t.username?.toLowerCase())
          );
        }
      }

      // Overlay saved dedicated permissions for each tenant
      return baseList.map((t) => {
        const cleanUser = t.username?.toLowerCase();
        let savedPerms = null;
        try {
          const s = localStorage.getItem(`dhigrowth_tenant_perms_${cleanUser}`) ||
                    localStorage.getItem(`dhigrowth_tenant_perms_${t.id}`);
          if (s) savedPerms = JSON.parse(s);
        } catch {}
        if (savedPerms) {
          return {
            ...t,
            permissions: {
              ...(t.permissions || {}),
              ...savedPerms,
            },
          };
        }
        return t;
      });
    } catch {}
    return SEED_TENANTS;
  });

  // URL Tenant Resolver (e.g. ?tenant=client or ?t=client or ?workspace=xyz)
  const [urlTenantSlug] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || params.get('t') || params.get('workspace') || null;
      }
    } catch {}
    return null;
  });

  // Authentication & Session State (Tenant-Isolated Session Support)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlTenant = urlParams?.get('tenant') || urlParams?.get('t');
      const storageKey = urlTenant ? `dhigrowth_auth_session_${urlTenant}` : 'dhigrowth_auth_session';
      const saved = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || (!urlTenant ? localStorage.getItem('dhigrowth_auth_session') : null);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.username?.toLowerCase() === 'sri') {
        parsed.role = 'DhiGrowth Admin';
        parsed.isSuperAdmin = false;
        parsed.isAdmin = false;
      } else if (parsed?.username?.toLowerCase() === 'admin') {
        parsed.role = 'Super Administrator';
        parsed.isSuperAdmin = true;
        parsed.isAdmin = true;
      }

      // Overlay saved tenant permissions for currentUser
      if (parsed?.username) {
        const cleanUser = parsed.username.toLowerCase();
        let savedPerms = null;
        try {
          const s = localStorage.getItem(`dhigrowth_tenant_perms_${cleanUser}`) ||
                    localStorage.getItem(`dhigrowth_tenant_perms_${parsed.id}`);
          if (s) savedPerms = JSON.parse(s);
        } catch {}
        if (savedPerms) {
          parsed.permissions = {
            ...(parsed.permissions || {}),
            ...savedPerms,
          };
        }
      }

      return parsed;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(currentUser);

  // Super Administrator check (Master Platform Owner)
  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.username?.toLowerCase() === 'admin' ||
    currentUser?.role === 'Super Administrator'
  );

  // Client tenants list (excluding Super Admin)
  const clientTenants = useMemo(() => {
    return (tenants || []).filter(
      (t) => !t.isSuperAdmin && t.username?.toLowerCase() !== 'admin' && t.role !== 'Super Administrator'
    );
  }, [tenants]);

  // Current logged in tenant record
  const currentTenant = useMemo(() => {
    if (!currentUser) return null;
    return (tenants || []).find(
      (t) =>
        t.id === currentUser.id ||
        t.workspaceId === currentUser.workspaceId ||
        t.username?.toLowerCase() === currentUser.username?.toLowerCase()
    );
  }, [currentUser, tenants]);

  // Impersonation State: Super Admin viewing the app as a specific tenant to verify permissions
  const [impersonatedTenant, setImpersonatedTenant] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem('dhigrowth_impersonated_tenant');
        return s ? JSON.parse(s) : null;
      }
    } catch {}
    return null;
  });

  const viewAsTenant = (tenant) => {
    if (!tenant) return;
    const latestTenant = (tenants || []).find(
      (t) => t.id === tenant.id || t.username?.toLowerCase() === tenant.username?.toLowerCase()
    ) || tenant;
    setImpersonatedTenant(latestTenant);
    try {
      localStorage.setItem('dhigrowth_impersonated_tenant', JSON.stringify(latestTenant));
    } catch {}
    showToast(`Viewing workspace as ${latestTenant.name || latestTenant.username}`, 'info');
  };

  const exitViewAs = () => {
    setImpersonatedTenant(null);
    try {
      localStorage.removeItem('dhigrowth_impersonated_tenant');
    } catch {}
    showToast('Returned to Super Administrator mode', 'success');
  };

  // Permission check helper for sidebar options and tabs
  const hasNavPermission = (navId, targetUserOrTenant = null) => {
    // Determine the active target whose permissions are being evaluated:
    // 1. Explicit target passed as parameter
    // 2. Currently impersonated tenant (Super Admin viewing as tenant)
    // 3. Regular non-superadmin session (currentTenant or currentUser)
    const activeTarget =
      targetUserOrTenant ||
      impersonatedTenant ||
      (!isSuperAdmin ? (currentTenant || currentUser) : null);

    if (activeTarget) {
      // Platform Super Admin target always has full access
      if (
        activeTarget.isSuperAdmin ||
        activeTarget.username?.toLowerCase() === 'admin' ||
        activeTarget.role === 'Super Administrator'
      ) {
        return true;
      }

      // Super Admin tenant directory itself is strictly reserved for Super Admin
      if (navId === 'super-admin' || navId === 'tenants' || navId === 'tenant-management') {
        return false;
      }

      // Essential core modules: Manage Settings, Wallet, Plans & Pricing are ALWAYS enabled for all users
      if (navId === 'manage' || navId === 'wallet' || navId === 'plans') {
        return true;
      }

      const perms = activeTarget.permissions || {};

      // Backward compatibility aliases
      if (navId === 'inbox') {
        if (perms['inbox'] === true) return true;
        if (perms['inbox'] === false || perms['team_inbox'] === false || perms['teamInbox'] === false) return false;
        return true;
      }
      if (navId === 'leads') {
        if (perms['leads'] === true) return true;
        if (perms['leads'] === false || perms['crm_leads'] === false) return false;
        return true;
      }
      if (navId === 'ai-assistants') {
        if (perms['ai-assistants'] === true) return true;
        if (perms['ai-assistants'] === false || perms['ai_studio'] === false || perms['aiStudio'] === false) return false;
        return true;
      }
      if (navId === 'meta-api') {
        if (perms['meta-api'] === true) return true;
        if (perms['meta-api'] === false || perms['meta_api'] === false || perms['metaKeys'] === false) return false;
        return true;
      }
      if (navId === 'send_due_all') {
        if (perms['send_due_all'] === true) return true;
        if (perms['send_due_all'] === false || perms['sendDueToAll'] === false) return false;
        return true;
      }

      // Direct key check
      return perms[navId] !== false;
    }

    // Default Super Admin session (not impersonating any tenant) has full access
    if (isSuperAdmin) return true;

    // Super Admin directory reserved for Super Admin
    if (navId === 'super-admin' || navId === 'tenants' || navId === 'tenant-management') {
      return false;
    }

    // Essential core modules: Manage Settings, Wallet, Plans & Pricing are ALWAYS enabled for all users
    if (navId === 'manage' || navId === 'wallet' || navId === 'plans') {
      return true;
    }

    const perms = (currentTenant || currentUser)?.permissions || {};
    return perms[navId] !== false;
  };

  // Super Admin Client Profile Selector: 'all' (Global Feed) or a specific tenant's workspaceId
  const [selectedClientWorkspace, setSelectedClientWorkspace] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dhigrowth_superadmin_selected_workspace');
        if (saved) return saved;
      }
    } catch {}
    return 'all';
  });

  // Active individual profile key (e.g. currentUser slug/username or 'sri')
  const [adminViewProfile, setAdminViewProfile] = useState('sri');
  const activeProfileKey = useMemo(() => {
    const rawKey = currentUser?.username || currentUser?.slug || adminViewProfile || 'sri';
    return String(rawKey).toLowerCase().trim();
  }, [currentUser?.username, currentUser?.slug, adminViewProfile]);

  // Current active workspace ID (Strict Partitioning)
  const currentWorkspaceId = currentUser?.workspaceId || DEFAULT_WORKSPACE_ID;

  // User & Wallet State (Individually partitioned per user profile)
  const [credits, setCreditsState] = useState(() => {
    try {
      const initKey = (currentUser?.username || currentUser?.slug || 'sri').toLowerCase().trim();
      const userSaved = localStorage.getItem(`dhigrowth_wallet_credits_${initKey}`);
      if (userSaved !== null) {
        const num = parseFloat(userSaved);
        if (!isNaN(num)) return num;
      }
      const saved = localStorage.getItem('dhigrowth_wallet_credits');
      if (saved !== null) {
        const num = parseFloat(saved);
        if (!isNaN(num)) return num;
      }
    } catch {}
    return 5.00; // Seed with promotional $5 launch credits
  });

  // Switch credits when active profile changes
  useEffect(() => {
    try {
      const userSaved = localStorage.getItem(`dhigrowth_wallet_credits_${activeProfileKey}`);
      if (userSaved !== null) {
        const num = parseFloat(userSaved);
        if (!isNaN(num)) {
          setCreditsState(num);
          return;
        }
      }
      // Fetch profile-specific balance from backend
      fetch(`${BACKEND_URL}/api/wallet/balance?userKey=${encodeURIComponent(activeProfileKey)}&workspaceId=${encodeURIComponent(currentWorkspaceId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.wallet?.balanceUsd !== undefined) {
            setCreditsState(data.wallet.balanceUsd);
            try {
              localStorage.setItem(`dhigrowth_wallet_credits_${activeProfileKey}`, String(data.wallet.balanceUsd));
            } catch {}
          } else {
            setCreditsState(5.00);
          }
        })
        .catch(() => {
          setCreditsState(5.00);
        });
    } catch {
      setCreditsState(5.00);
    }
  }, [activeProfileKey, currentWorkspaceId]);

  const setCredits = (valOrFn) => {
    setCreditsState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem(`dhigrowth_wallet_credits_${activeProfileKey}`, String(next));
        localStorage.setItem('dhigrowth_wallet_credits', String(next));
      } catch {}
      return next;
    });
  };

  const rechargeAiCredits = async (
    amountUsd,
    description = 'AI Assistant Credits Recharge',
    paymentId = '',
    provider = 'razorpay',
    method = 'UPI / NetBanking'
  ) => {
    const amt = parseFloat(amountUsd) || 0;
    if (amt <= 0) return;
    const newBal = +(credits + amt).toFixed(2);
    setCredits(newBal);

    const txId = paymentId || `pay_rzp_${Date.now()}`;
    const txRecord = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'TOP_UP',
      amount: `+$${amt.toFixed(2)}`,
      amountInr: `₹${Math.round(amt * 85)}`,
      description: `${description} via ${provider === 'razorpay' ? `Razorpay (${method})` : provider}`,
      paymentId: txId,
      provider,
      userKey: activeProfileKey,
    };

    // Save transaction to this user's profile logs
    try {
      const existingLogs = JSON.parse(localStorage.getItem(`dhigrowth_wallet_logs_${activeProfileKey}`) || '[]');
      localStorage.setItem(`dhigrowth_wallet_logs_${activeProfileKey}`, JSON.stringify([txRecord, ...existingLogs]));
    } catch {}

    // Sync to backend per-user profile
    try {
      const payload = {
        userKey: activeProfileKey,
        workspaceId: currentWorkspaceId,
        amountUsd: amt,
        amountInr: Math.round(amt * 85),
        paymentId: txId,
        orderId: `ord_${Date.now()}`,
        provider,
        method,
      };
      await fetch(`${BACKEND_URL}/api/wallet/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}

    // Sync to Supabase
    try {
      await rechargeWalletSupabase(currentWorkspaceId, amt, txId, description);
    } catch {}

    showToast(`⚡ Successfully recharged $${amt.toFixed(2)} AI Credits for ${activeProfileKey.toUpperCase()}!`, 'success');
  };

  const [phoneNumber, setPhoneNumber] = useState('9791471277');
  const [countryCode, setCountryCode] = useState('IN +91');
  const [hasClaimedBonus, setHasClaimedBonus] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Business');
  const [daysRemaining, setDaysRemaining] = useState(6);

  // SaaS Subscription & Unified Checkout State (Stripe / Razorpay)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ planId: 'Business', billingCycle: 'monthly', provider: 'razorpay' });
  const [subscription, setSubscription] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dhigrowth_subscription_b0000000-0000-0000-0000-000000000001') || localStorage.getItem('dhigrowth_subscription');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.status) return parsed;
        }
      }
    } catch {}
    return { status: 'active', planId: 'Business', planName: 'Business Plan' };
  });

  // Super Admin always uses the platform completely free without requiring any subscription.
  // User tenants only require an active paid subscription.
  const effectiveSubscription = useMemo(() => {
    if (isSuperAdmin && !impersonatedTenant) {
      return {
        workspaceId: currentWorkspaceId || 'a0000000-0000-0000-0000-000000000001',
        planId: 'Enterprise',
        planName: 'Super Admin (Lifetime Free)',
        billingCycle: 'lifetime',
        status: 'active',
        provider: 'platform_owner',
        trialDaysRemaining: 9999,
        isSuperAdminFree: true,
      };
    }
    return subscription;
  }, [isSuperAdmin, impersonatedTenant, subscription, currentWorkspaceId]);

  const isPaidActive = Boolean(isSuperAdmin && !impersonatedTenant) || effectiveSubscription?.status === 'active';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState(false);

  const registerNewTenant = async ({ fullName, companyName, email, phone, password }) => {
    const payload = { fullName, companyName, email, phone, password };
    let res;
    try {
      res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}

    if (!res || !res.ok) {
      try {
        res = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}
    }

    if (!res) throw new Error('Cannot connect to backend server. Please verify backend is running on port 4000.');

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account.');

    const session = {
      username: data.user?.email?.split('@')[0] || 'admin',
      name: data.user?.name || fullName,
      email: data.user?.email || email,
      phone: data.user?.phone || phone,
      role: data.user?.role || 'super_admin',
      isExternalClient: false,
      isAdmin: true,
      organization: data.organization?.name || data.workspace?.name || companyName,
      workspaceId: data.workspace?.id,
      slug: data.workspace?.slug || (companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')),
      token: `tenant_${data.user?.id || Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      loginAt: new Date().toISOString(),
      isFirstTimeOnboarding: true,
    };

    setCurrentUser(session);
    localStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
    localStorage.setItem(`dhigrowth_auth_session_${session.slug}`, JSON.stringify(session));
    setIsOnboardingWizardOpen(true);
    showToast(`🎉 Welcome to WAPPPILOT, ${session.name}! Your 14-day free trial has started.`, 'success');
    return session;
  };

  const openCheckout = (planId = 'Growth', billingCycle = 'monthly', provider = 'razorpay') => {
    if (isSuperAdmin && !impersonatedTenant) {
      showToast('👑 Super Administrator has permanent free access and does not require a subscription.', 'info');
      return;
    }
    setCheckoutData({ planId, billingCycle, provider });
    setIsCheckoutModalOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutModalOpen(false);
  };

  // Meta Cloud API Configuration State (Per-User / Per-Tenant Isolated)
  const [metaConfig, setMetaConfig] = useState(() => {
    try {
      const tenantKey = currentUser?.slug || currentUser?.username || 'default';
      const saved = localStorage.getItem(`dhigrowth_meta_config_${tenantKey}`);
      return saved ? JSON.parse(saved) : {
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        verifyToken: 'dhigrowth_webhook_secret_2026',
        isConfigured: false,
      };
    } catch {
      return {
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        verifyToken: 'dhigrowth_webhook_secret_2026',
        isConfigured: false,
      };
    }
  });
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  const fetchMetaConfig = async (wsId, userIdentifier) => {
    try {
      const activeWs = wsId || currentUser?.workspaceId || DEFAULT_WORKSPACE_ID;
      const activeUser = userIdentifier || currentUser?.username || currentUser?.slug || 'default';
      const queryParams = new URLSearchParams();
      if (activeWs) queryParams.set('workspaceId', activeWs);
      if (activeUser) queryParams.set('userId', activeUser);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/meta-config${queryString}`);
      } catch {}
      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/meta-config${queryString}`);
        } catch {}
      }
      if (res && res.ok) {
        const raw = await res.text();
        if (raw && !raw.trim().startsWith('<')) {
          const data = JSON.parse(raw);
          setMetaConfig(data);
          try {
            const tenantKey = activeUser || activeWs || 'default';
            localStorage.setItem(`dhigrowth_meta_config_${tenantKey}`, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[AppContext] Could not fetch meta config from server:', err);
    }
  };

  const saveMetaConfig = async (newConfig) => {
    setIsMetaLoading(true);
    try {
      const activeWs = currentWorkspaceId;
      const activeUser = currentUser?.username || currentUser?.slug || 'User';
      const payload = {
        ...newConfig,
        workspaceId: activeWs,
        userId: activeUser,
        username: currentUser?.username || activeUser,
        slug: currentUser?.slug,
        updatedBy: currentUser?.name || currentUser?.username || 'User',
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/meta-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/meta-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (!res) throw new Error('Cannot connect to backend server. Please verify backend is running.');

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Server returned HTML response instead of JSON. Ensure backend is running.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to save Meta configuration');

      setMetaConfig((prev) => ({
        ...prev,
        ...newConfig,
      }));

      try {
        const tenantKey = currentUser?.slug || currentUser?.username || activeWs || 'default';
        localStorage.setItem(`dhigrowth_meta_config_${tenantKey}`, JSON.stringify({
          ...metaConfig,
          ...newConfig,
        }));
      } catch {}

      showToast(`🎉 Meta WhatsApp credentials saved for ${currentUser?.name || activeUser}!`, 'success');
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setIsMetaLoading(false);
    }
  };

  const testMetaConfig = async (configToTest) => {
    try {
      const payload = {
        ...(configToTest || {}),
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.slug,
      };

      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/meta-config/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/meta-config/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (!res) return { success: false, error: 'Could not connect to backend server.' };

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return { success: false, error: 'Server returned HTML response instead of JSON.' };
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // AI Engine & API Configuration State
  const [aiConfig, setAiConfig] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
    systemPrompt: '',
    hasKey: false,
    maskedKey: '',
  });
  const [isAiConfigLoading, setIsAiConfigLoading] = useState(false);

  const fetchAiConfig = async () => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/ai-config`);
      } catch {}
      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/ai-config');
        } catch {}
      }
      if (res && res.ok) {
        const raw = await res.text();
        if (raw && !raw.trim().startsWith('<')) {
          const data = JSON.parse(raw);
          if (data.success && data.config) {
            setAiConfig((prev) => ({
              ...prev,
              ...data.config,
            }));
          }
        }
      }
    } catch (err) {
      console.warn('[AppContext] Could not fetch AI config from server:', err);
    }
  };

  const saveAiConfig = async (newConfig) => {
    setIsAiConfigLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/ai-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newConfig,
            updatedBy: currentUser?.username || 'user',
          }),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/ai-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newConfig,
              updatedBy: currentUser?.username || 'user',
            }),
          });
        } catch {}
      }

      if (!res) throw new Error('Cannot connect to backend server. Please verify backend is running.');

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Server returned HTML response instead of JSON.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to save AI configuration');

      setAiConfig((prev) => ({
        ...prev,
        ...newConfig,
        hasKey: Boolean(newConfig.apiKey || prev.apiKey),
        maskedKey: newConfig.apiKey
          ? `${newConfig.apiKey.slice(0, 7)}...${newConfig.apiKey.slice(-4)}`
          : prev.maskedKey,
      }));
      showToast(
        `🤖 ${newConfig.provider?.toUpperCase() || 'AI'} API credentials saved & connected to WhatsApp!`,
        'success'
      );
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setIsAiConfigLoading(false);
    }
  };

  const testAiConfig = async (configToTest) => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/ai-config/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configToTest || {}),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/ai-config/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configToTest || {}),
          });
        } catch {}
      }

      if (!res) {
        return { success: false, error: 'Could not connect to backend server. Please verify backend is running.' };
      }

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return { success: false, error: 'Server returned HTML response instead of JSON. Ensure backend is running.' };
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Fetch cloud-registered tenants from backend
  const fetchTenantsCloud = async () => {
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/tenants`);
      } catch {}
      if (!res || !res.ok) {
        try {
          res = await fetch('http://localhost:4000/api/tenants');
        } catch {}
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data?.tenants && Array.isArray(data.tenants)) {
          const savedDeleted = localStorage.getItem('dhigrowth_deleted_tenants');
          const deletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];

          setTenants((prev) => {
            const merged = [...prev];
            data.tenants.forEach((ct) => {
              if (
                deletedIds.includes(ct.id) ||
                deletedIds.includes(ct.workspaceId) ||
                deletedIds.includes(ct.username?.toLowerCase())
              ) {
                return;
              }
              const idx = merged.findIndex(
                (m) => m.id === ct.id || m.username?.toLowerCase() === ct.username?.toLowerCase()
              );

              const cleanUser = ct.username?.toLowerCase();
              let savedPerms = null;
              try {
                const s = localStorage.getItem(`dhigrowth_tenant_perms_${cleanUser}`) ||
                          localStorage.getItem(`dhigrowth_tenant_perms_${ct.id}`);
                if (s) savedPerms = JSON.parse(s);
              } catch {}

              const existingPerms = idx >= 0 ? merged[idx]?.permissions : null;
              // Cloud permissions configured by Super Admin are the authoritative source of truth
              const combinedPerms = {
                ...(existingPerms || {}),
                ...(savedPerms || {}),
                ...(ct.permissions || {}),
              };

              // Immediately sync dedicated tenant cache in localStorage with cloud
              try {
                localStorage.setItem(`dhigrowth_tenant_perms_${cleanUser}`, JSON.stringify(combinedPerms));
                if (ct.id) {
                  localStorage.setItem(`dhigrowth_tenant_perms_${ct.id}`, JSON.stringify(combinedPerms));
                }
              } catch {}

              // If currently active user is this tenant, immediately synchronize permissions
              if (
                currentUser &&
                (currentUser.id === ct.id ||
                  currentUser.workspaceId === ct.workspaceId ||
                  currentUser.username?.toLowerCase() === cleanUser)
              ) {
                setCurrentUser((prevUser) => {
                  if (!prevUser) return prevUser;
                  const updatedUser = { ...prevUser, permissions: combinedPerms };
                  try {
                    localStorage.setItem('dhigrowth_auth_session', JSON.stringify(updatedUser));
                    localStorage.setItem(`dhigrowth_auth_session_${cleanUser}`, JSON.stringify(updatedUser));
                  } catch {}
                  return updatedUser;
                });
              }

              // Also sync impersonatedTenant if viewing as this tenant
              if (
                impersonatedTenant &&
                (impersonatedTenant.id === ct.id ||
                  impersonatedTenant.username?.toLowerCase() === cleanUser)
              ) {
                setImpersonatedTenant((prevImp) => {
                  if (!prevImp) return prevImp;
                  const nextImp = { ...prevImp, permissions: combinedPerms };
                  try {
                    localStorage.setItem('dhigrowth_impersonated_tenant', JSON.stringify(nextImp));
                  } catch {}
                  return nextImp;
                });
              }

              const mergedTenant = {
                ...(idx >= 0 ? merged[idx] : {}),
                ...ct,
                permissions: combinedPerms,
              };

              if (idx >= 0) {
                merged[idx] = mergedTenant;
              } else {
                merged.push(mergedTenant);
              }
            });
            const filtered = merged.filter(
              (t) =>
                !deletedIds.includes(t.id) &&
                !deletedIds.includes(t.workspaceId) &&
                !deletedIds.includes(t.username?.toLowerCase())
            );
            try {
              localStorage.setItem('dhigrowth_tenants', JSON.stringify(filtered));
            } catch {}
            return filtered;
          });
        }
      }
    } catch (err) {
      console.warn('[TenantsCloud] Notice:', err.message);
    }
  };

  useEffect(() => {
    fetchMetaConfig();
    fetchAiConfig();
    fetchTenantsCloud();

    // Live sync polling: check cloud tenants every 3 seconds so Super Admin changes reflect immediately for user
    const interval = setInterval(() => {
      fetchTenantsCloud();
    }, 3000);

    const onFocus = () => {
      fetchTenantsCloud();
    };

    const handlePermissionsChanged = () => {
      fetchTenantsCloud();
    };

    const handleStorageEvent = (e) => {
      if (
        e.key?.startsWith('dhigrowth_tenant_perms_') ||
        e.key === 'dhigrowth_tenants' ||
        e.key === 'dhigrowth_auth_session'
      ) {
        fetchTenantsCloud();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('dhigrowth_permissions_changed', handlePermissionsChanged);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('dhigrowth_permissions_changed', handlePermissionsChanged);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [currentUser?.username, impersonatedTenant?.username]);

  // Bcrypt hashed passwords for secure authentication (Cost Factor: 10)
  const USER_PASSWORD_HASHES = {
    admin: '$2b$10$6M.SDAOCSZAI9MIIdkfA.u8oGEL7mTMWvhCds9LOp/UUayeCIY39i', // wappilot@
    sri: '$2b$10$5ZDjuHTdcawqR3JfLwxc6uckYA9dVEQDZ0J9Lhv4W28Se8hmoyiXy', // dhigrowth2026
  };

  const login = async ({ username, password, remember = true }) => {
    const cleanUser = username?.trim().toLowerCase();
    const cleanPass = password?.trim();

    // 1. First attempt Cloud Authentication with Supabase backend
    try {
      let cloudRes;
      try {
        cloudRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanUser, username: cleanUser, password: cleanPass }),
        });
      } catch {}

      if (!cloudRes || !cloudRes.ok) {
        try {
          cloudRes = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanUser, username: cleanUser, password: cleanPass }),
          });
        } catch {}
      }

      if (cloudRes && cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData?.success && cloudData?.user) {
          const isSuperAdminUser = cloudData.user.role === 'super_admin' || cloudData.user.username === 'admin';
          const isSriAdmin = cleanUser === 'sri' || cloudData.user.username === 'sri';
          const session = {
            username: cloudData.user.username || cloudData.user.email?.split('@')[0] || cleanUser,
            name: cloudData.user.name || cleanUser,
            email: cloudData.user.email || `${cleanUser}@dhigrowth.com`,
            phone: cloudData.user.phone || '',
            role: isSuperAdminUser ? 'Super Administrator' : (isSriAdmin ? 'DhiGrowth Admin' : (cloudData.user.role || 'CRM User')),
            isExternalClient: cloudData.user.isExternalClient || false,
            isSuperAdmin: isSuperAdminUser,
            isAdmin: isSuperAdminUser, // Only Super Admin has platform-level master privileges
            isDhigrowthAdmin: isSriAdmin,
            organization: cloudData.workspace?.name || `${cloudData.user.name}'s Workspace`,
            workspaceId: cloudData.workspace?.id || DEFAULT_WORKSPACE_ID,
            slug: cloudData.workspace?.slug || cleanUser,
            token: `tenant_${cloudData.user.id || cleanUser}_${Date.now()}`,
            loginAt: new Date().toISOString(),
          };
          setCurrentUser(session);
          const storageKey = session.slug ? `dhigrowth_auth_session_${session.slug}` : 'dhigrowth_auth_session';
          if (remember) {
            localStorage.setItem(storageKey, JSON.stringify(session));
            localStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
          } else {
            sessionStorage.setItem(storageKey, JSON.stringify(session));
            sessionStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
          }
          showToast(`Welcome back, ${session.name}! 👋`, 'success');
          return session;
        }
      }
    } catch (cloudAuthErr) {
      console.warn('[CloudAuth] Backend login check skipped, falling back to local credentials:', cloudAuthErr.message);
    }

    let savedCreds = null;
    try {
      const raw = localStorage.getItem('dhigrowth_auth_credentials');
      if (raw) savedCreds = JSON.parse(raw);
    } catch {}

    const isValidCustom = Boolean(
      savedCreds &&
      cleanUser === savedCreds.username?.toLowerCase() &&
      cleanPass === savedCreds.password
    );

    const isSri = cleanUser === 'sri' || cleanUser === 'sri@dhigrowth.com';
    const isValidSri =
      isSri &&
      Boolean(cleanPass) &&
      (
        cleanPass === 'dhigrowth2026' ||
        cleanPass === 'Dhigrowth2026' ||
        (() => {
          try {
            return bcrypt.compareSync(cleanPass, USER_PASSWORD_HASHES.sri);
          } catch {
            return false;
          }
        })()
      );

    const isAdmin = cleanUser === 'admin' || cleanUser === 'admin@wapppilot.com' || cleanUser === 'admin@dhigrowth.com';
    const isValidAdmin =
      isAdmin &&
      Boolean(cleanPass) &&
      (
        cleanPass === 'wappilot@' ||
        cleanPass === 'Wappilot@' ||
        cleanPass === 'DhiGrowth@admin' ||
        cleanPass === 'dhigrowth@admin' ||
        (() => {
          try {
            return bcrypt.compareSync(cleanPass, USER_PASSWORD_HASHES.admin);
          } catch {
            return false;
          }
        })()
      );

    // Check dynamic registered tenants
    const matchedTenant = (tenants || []).find(
      (t) => cleanUser === t.username?.toLowerCase() || cleanUser === t.email?.toLowerCase()
    );

    let isValidTenant = false;
    if (matchedTenant && Boolean(cleanPass)) {
      if (matchedTenant.passwordHash) {
        try {
          isValidTenant = bcrypt.compareSync(cleanPass, matchedTenant.passwordHash);
        } catch {
          isValidTenant = false;
        }
      }
      if (!isValidTenant && matchedTenant.password) {
        isValidTenant = cleanPass.toLowerCase() === matchedTenant.password.toLowerCase();
      }
    }

    if (!isValidAdmin && !isValidSri && !isValidCustom && !isValidTenant) {
      throw new Error('Invalid username or password. Please try again.');
    }

    let session;
    if (isValidTenant && matchedTenant) {
      let savedPerms = null;
      try {
        const s =
          localStorage.getItem(`dhigrowth_tenant_perms_${matchedTenant.username?.toLowerCase()}`) ||
          localStorage.getItem(`dhigrowth_tenant_perms_${matchedTenant.id}`);
        if (s) savedPerms = JSON.parse(s);
      } catch {}

      const effectivePerms = {
        ...(matchedTenant.permissions || {}),
        ...(savedPerms || {}),
      };

      session = {
        id: matchedTenant.id,
        workspaceId: matchedTenant.workspaceId || matchedTenant.id,
        username: matchedTenant.username,
        name: matchedTenant.name,
        email: matchedTenant.email,
        role: matchedTenant.role || 'CRM User',
        isExternalClient: matchedTenant.isExternalClient || false,
        isAdmin: matchedTenant.isAdmin || false,
        isSuperAdmin: Boolean(matchedTenant.isSuperAdmin),
        organization: matchedTenant.companyName || `${matchedTenant.name}'s Workspace`,
        slug: matchedTenant.slug || matchedTenant.username,
        permissions: effectivePerms,
        token: `tenant_${matchedTenant.username}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        loginAt: new Date().toISOString(),
      };
    } else if (isValidCustom && savedCreds) {
      session = {
        id: savedCreds.id || `custom_${cleanUser}`,
        username: savedCreds.username || cleanUser,
        name: savedCreds.name || savedCreds.username || 'User',
        email: savedCreds.email || `${cleanUser}@dhigrowth.com`,
        role: savedCreds.role || 'CRM User',
        isExternalClient: false,
        isAdmin: false,
        isSuperAdmin: false,
        organization: savedCreds.organization || 'WAPPPILOT',
        workspaceId: savedCreds.workspaceId || DEFAULT_WORKSPACE_ID,
        slug: savedCreds.slug || cleanUser,
        permissions: savedCreds.permissions || {},
        token: `custom_${cleanUser}_${Date.now()}`,
        loginAt: new Date().toISOString(),
      };
    } else if (isSri || cleanUser === 'sri') {
      const sriTenant =
        (tenants || []).find((t) => t.username?.toLowerCase() === 'sri') || SEED_TENANTS[1];
      let savedPerms = null;
      try {
        const s =
          localStorage.getItem('dhigrowth_tenant_perms_sri') ||
          localStorage.getItem('dhigrowth_tenant_perms_b0000000-0000-0000-0000-000000000001');
        if (s) savedPerms = JSON.parse(s);
      } catch {}

      const effectivePerms = {
        ...(sriTenant?.permissions || {}),
        ...(savedPerms || {}),
      };

      session = {
        id: sriTenant?.id || 'b0000000-0000-0000-0000-000000000001',
        workspaceId: sriTenant?.workspaceId || sriTenant?.id || 'b0000000-0000-0000-0000-000000000001',
        username: 'sri',
        name: sriTenant?.name || 'Sri',
        email: sriTenant?.email || 'sri@dhigrowth.com',
        role: 'DhiGrowth Admin',
        isExternalClient: false,
        isSuperAdmin: false,
        isAdmin: false, // DhiGrowth admin only, NOT super admin
        isDhigrowthAdmin: true,
        organization: sriTenant?.companyName || 'Dhigrowth CRM',
        slug: 'sri',
        permissions: effectivePerms,
        token: `dhi_sri_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        loginAt: new Date().toISOString(),
      };
    } else {
      session = {
        username: 'admin',
        name: 'Super Administrator',
        email: 'admin@wapppilot.com',
        role: 'Super Administrator',
        isExternalClient: false,
        isSuperAdmin: true,
        isAdmin: true,
        organization: 'WAPPPILOT Platform Operations',
        workspaceId: DEFAULT_WORKSPACE_ID,
        slug: 'admin',
        token: `wappilot_admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        loginAt: new Date().toISOString(),
      };
    }

    setCurrentUser(session);
    const storageKey = session.slug ? `dhigrowth_auth_session_${session.slug}` : 'dhigrowth_auth_session';
    if (remember) {
      localStorage.setItem(storageKey, JSON.stringify(session));
      localStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
    } else {
      sessionStorage.setItem(storageKey, JSON.stringify(session));
      sessionStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
    }

    showToast(`Welcome back, ${session.name}! 👋`, 'success');
    return session;
  };

  // Synchronize tenant Meta credentials whenever active user or workspace changes
  useEffect(() => {
    if (!currentUser) return;
    const tenantKey = currentUser.slug || currentUser.username || currentWorkspaceId;
    try {
      const saved = localStorage.getItem(`dhigrowth_meta_config_${tenantKey}`);
      if (saved) {
        setMetaConfig(JSON.parse(saved));
      } else {
        setMetaConfig({
          phoneNumberId: '',
          wabaId: '',
          accessToken: '',
          verifyToken: 'dhigrowth_webhook_secret_2026',
          isConfigured: false,
        });
      }
    } catch {}

    fetchMetaConfig(currentWorkspaceId, currentUser.username || currentUser.slug);
    refreshSubscription();
  }, [currentUser?.username, currentUser?.workspaceId, currentWorkspaceId, adminViewProfile]);

  const refreshSubscription = async () => {
    try {
      const activeWs = currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';
      // 1. Check localStorage first
      try {
        const saved = localStorage.getItem(`dhigrowth_subscription_${activeWs}`) || localStorage.getItem('dhigrowth_subscription');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.status) {
            setSubscription(parsed);
            if (parsed.planId) setCurrentPlan(parsed.planId);
          }
        }
      } catch {}

      // 2. Query backend in background
      const endpoints = Array.from(new Set([
        `${BACKEND_URL}/api/billing/subscription?workspaceId=${encodeURIComponent(activeWs)}`,
        `http://localhost:4000/api/billing/subscription?workspaceId=${encodeURIComponent(activeWs)}`,
      ]));

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data?.subscription) {
              setSubscription(data.subscription);
              if (data.subscription.planId) {
                setCurrentPlan(data.subscription.planId);
              }
              try {
                localStorage.setItem(`dhigrowth_subscription_${activeWs}`, JSON.stringify(data.subscription));
              } catch {}
              break;
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[AppContext] Note refreshing subscription:', err.message);
    }
  };

  const setSubscriptionStatus = async (status = 'active', wsId) => {
    const activeWs = wsId || currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001';
    
    // 1. Immediate Optimistic UI update (Never block on network)
    const now = new Date();
    const currentPeriodEnd = new Date(now.getTime() + 30 * 86400000).toISOString();
    const optimisticRecord = {
      workspaceId: activeWs,
      planId: 'Business',
      planName: 'Business',
      billingCycle: 'monthly',
      status: status, // 'active' or 'trialing'
      provider: 'razorpay',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: false,
      trialDaysRemaining: status === 'active' ? 30 : 0,
      updatedAt: now.toISOString(),
      paymentMethod: {
        provider: 'razorpay',
        brand: 'UPI / NetBanking',
        last4: '2026',
      },
    };

    setSubscription(optimisticRecord);
    setCurrentPlan('Business');
    if (status === 'active') {
      setDaysRemaining(30);
    }

    try {
      localStorage.setItem(`dhigrowth_subscription_${activeWs}`, JSON.stringify(optimisticRecord));
      localStorage.setItem('dhigrowth_subscription', JSON.stringify(optimisticRecord));
    } catch {}

    if (status === 'active') {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
      showToast('🎉 All features unlocked! Business plan is now ACTIVE.', 'success');
    } else {
      showToast('🔒 Subscription set to Trialing. Paywall active for testing.', 'info');
    }

    // 2. Sync to Backend in Background
    const endpoints = Array.from(new Set([
      `${BACKEND_URL}/api/billing/set-status`,
      'http://localhost:4000/api/billing/set-status',
    ]));

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: activeWs, status }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.subscription) {
            setSubscription(data.subscription);
            try {
              localStorage.setItem(`dhigrowth_subscription_${activeWs}`, JSON.stringify(data.subscription));
            } catch {}
          }
          break;
        }
      } catch {}
    }
  };

  // Client Workspace View Mode: 'crm' (Full CRM UI with Sidebar & TeamInbox) | 'portal' (BYOK Client Suite)
  const [clientViewMode, setClientViewMode] = useState(() => {
    try {
      return localStorage.getItem('dhigrowth_client_view_mode') || 'crm';
    } catch {
      return 'crm';
    }
  });

  const toggleClientViewMode = (mode) => {
    const nextMode = mode || (clientViewMode === 'crm' ? 'portal' : 'crm');
    setClientViewMode(nextMode);
    try {
      localStorage.setItem('dhigrowth_client_view_mode', nextMode);
    } catch {}
    showToast(`Switched view to ${nextMode === 'crm' ? 'Full CRM Workspace' : 'BYOK Client Suite'}`, 'info');
  };

  const switchAdminProfile = (profileName) => {
    if (!profileName) return;
    setAdminViewProfile(profileName);
  };

  const logout = () => {
    const slug = currentUser?.slug || urlTenantSlug;
    setCurrentUser(null);
    setChats([]);
    setActiveChatId(null);
    setActiveTab('dashboard');
    try {
      localStorage.removeItem('dhigrowth_auth_session');
      sessionStorage.removeItem('dhigrowth_auth_session');
      localStorage.removeItem('dhigrowth_active_tab');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      if (slug) {
        localStorage.removeItem(`dhigrowth_auth_session_${slug}`);
        sessionStorage.removeItem(`dhigrowth_auth_session_${slug}`);
      }
    } catch {}
    showToast('Signed out of workspace', 'info');
  };

  // Create New Tenant User
  const createTenantUser = ({
    name,
    username,
    email,
    password,
    companyName,
    role = 'CRM User',
    plan = 'Business',
    permissions = {},
  }) => {
    const cleanUser = String(username || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanUser) throw new Error('Username is required and must contain alphanumeric characters.');
    if (!cleanEmail) throw new Error('Valid email address is required.');
    if (!password) throw new Error('Password is required.');

    const exists = tenants.some(
      (t) => t.username?.toLowerCase() === cleanUser || t.email?.toLowerCase() === cleanEmail
    );
    if (exists || cleanUser === 'admin') {
      throw new Error(`A user or tenant with username "${cleanUser}" or email "${cleanEmail}" already exists.`);
    }

    const newWorkspaceId = `b${Date.now().toString(16).padStart(7, '0')}-${Math.random().toString(16).substring(2, 6)}-${Math.random().toString(16).substring(2, 6)}-${Math.random().toString(16).substring(2, 6)}-${Math.random().toString(16).substring(2, 14)}`;

    let passwordHash = '';
    try {
      passwordHash = bcrypt.hashSync(password, 10);
    } catch {
      passwordHash = password;
    }

    const defaultPerms = {
      sendDueToAll: true,
      teamInbox: true,
      metaKeys: role !== 'External Client (BYOK)',
      aiStudio: true,
      fileManager: true,
      invoicing: true,
      ...permissions,
    };

    const newTenant = {
      id: newWorkspaceId,
      workspaceId: newWorkspaceId,
      name: name.trim(),
      username: cleanUser,
      email: cleanEmail,
      companyName: companyName?.trim() || `${name.trim()}'s Workspace`,
      slug: cleanUser,
      role,
      plan,
      isAdmin: false,
      isExternalClient: role === 'External Client (BYOK)',
      passwordHash,
      password, // Saved for quick Super Admin retrieval
      permissions: defaultPerms,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const updated = [...tenants, newTenant];
    setTenants(updated);
    try {
      localStorage.setItem('dhigrowth_tenants', JSON.stringify(updated));
    } catch {}

    setUserPermissions((prev) => {
      const next = { ...prev, [cleanUser]: defaultPerms };
      try {
        localStorage.setItem('dhigrowth_user_permissions', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Auto-create workspace in Supabase and initialize isolated local state
    if (isSupabaseConfigured) {
      ensureWorkspaceExists(newWorkspaceId, newTenant.companyName).catch(() => {});
    }
    try {
      localStorage.setItem(`dhigrowth_chats_${newWorkspaceId}`, JSON.stringify([]));
    } catch {}

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Cloud Sync to Render backend so accessible on any device on Vercel
    try {
      fetch(`${BACKEND_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      }).catch(() => {
        fetch('http://localhost:4000/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTenant),
        }).catch(() => {});
      });
    } catch {}

    showToast(`🎉 Tenant "${newTenant.name}" (${newTenant.companyName}) created successfully!`, 'success');
    return newTenant;
  };

  // Delete Tenant User
  const deleteTenantUser = (tenantId) => {
    const cleanId = String(tenantId || '').toLowerCase();
    const target = tenants.find(
      (t) => t.id === tenantId || t.workspaceId === tenantId || t.username?.toLowerCase() === cleanId
    );
    if (!target) return;
    if (target.username?.toLowerCase() === 'sri' || target.username?.toLowerCase() === 'admin') {
      showToast('Core system accounts cannot be deleted.', 'error');
      return;
    }

    // Permanently record in deleted tenants list so it is never restored
    try {
      const savedDeleted = localStorage.getItem('dhigrowth_deleted_tenants');
      const deletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (target.id && !deletedIds.includes(target.id)) deletedIds.push(target.id);
      if (target.workspaceId && !deletedIds.includes(target.workspaceId)) deletedIds.push(target.workspaceId);
      if (target.username && !deletedIds.includes(target.username.toLowerCase())) {
        deletedIds.push(target.username.toLowerCase());
      }
      localStorage.setItem('dhigrowth_deleted_tenants', JSON.stringify(deletedIds));
    } catch {}

    const filtered = tenants.filter(
      (t) =>
        t.id !== target.id &&
        t.workspaceId !== target.workspaceId &&
        t.username?.toLowerCase() !== target.username?.toLowerCase()
    );
    setTenants(filtered);
    try {
      localStorage.setItem('dhigrowth_tenants', JSON.stringify(filtered));
      if (target.username) {
        localStorage.removeItem(`dhigrowth_auth_session_${target.username.toLowerCase()}`);
        sessionStorage.removeItem(`dhigrowth_auth_session_${target.username.toLowerCase()}`);
      }
    } catch {}

    // Cloud delete from Render backend
    try {
      fetch(`${BACKEND_URL}/api/tenants/${target.id || tenantId}`, { method: 'DELETE' }).catch(() => {
        fetch(`http://localhost:4000/api/tenants/${target.id || tenantId}`, { method: 'DELETE' }).catch(() => {});
      });
    } catch {}

    showToast(`Tenant "${target.name}" deleted permanently.`, 'info');
  };

  // Update Tenant User
  const updateTenantUser = (tenantId, updates) => {
    setTenants((prev) => {
      const updated = prev.map((t) => {
        if (t.id === tenantId || t.workspaceId === tenantId) {
          const merged = { ...t, ...updates };
          if (updates.password) {
            try {
              merged.passwordHash = bcrypt.hashSync(updates.password, 10);
            } catch {}
          }
          return merged;
        }
        return t;
      });
      try {
        localStorage.setItem('dhigrowth_tenants', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Tenant updated successfully!', 'success');
  };

  // Toggle Tenant Permission
  const toggleTenantPermission = (identifier, permissionKey, value) => {
    // Manage Settings, Wallet, and Plans & Pricing are essential core modules and always remain enabled
    if (permissionKey === 'manage' || permissionKey === 'wallet' || permissionKey === 'plans') {
      showToast('Manage Settings, Wallet, and Plans & Pricing are core modules and remain always enabled.', 'info');
      return;
    }

    const cleanId = String(identifier || '').toLowerCase();
    const targetTenant = (tenants || []).find(
      (t) => t.id === identifier || t.workspaceId === identifier || t.username?.toLowerCase() === cleanId
    );
    const tenantUser = targetTenant?.username?.toLowerCase() || cleanId;
    const currentP = targetTenant?.permissions || {};
    const currentVal = currentP[permissionKey] !== false;
    const nextVal = value !== undefined ? value : !currentVal;

    const updatedPerms = { ...currentP, [permissionKey]: nextVal, manage: true, wallet: true, plans: true };

    // Alias syncing for backwards compatibility
    if (permissionKey === 'inbox') {
      updatedPerms.team_inbox = nextVal;
      updatedPerms.teamInbox = nextVal;
    } else if (permissionKey === 'leads') {
      updatedPerms.crm_leads = nextVal;
    } else if (permissionKey === 'ai-assistants') {
      updatedPerms.ai_studio = nextVal;
      updatedPerms.aiStudio = nextVal;
    } else if (permissionKey === 'meta-api') {
      updatedPerms.meta_api = nextVal;
      updatedPerms.metaKeys = nextVal;
    } else if (permissionKey === 'send_due_all') {
      updatedPerms.sendDueToAll = nextVal;
    }

    const targetUpdatedTenant = targetTenant
      ? { ...targetTenant, permissions: updatedPerms }
      : { id: identifier, workspaceId: identifier, username: tenantUser, permissions: updatedPerms };

    // 1. Immediately persist to dedicated tenant permissions cache in localStorage
    try {
      localStorage.setItem(`dhigrowth_tenant_perms_${tenantUser}`, JSON.stringify(updatedPerms));
      if (targetTenant?.id) {
        localStorage.setItem(`dhigrowth_tenant_perms_${targetTenant.id}`, JSON.stringify(updatedPerms));
      }
    } catch {}

    // 2. Update React tenants state & localStorage
    setTenants((prev) => {
      const updated = prev.map((t) => {
        if (t.id === identifier || t.workspaceId === identifier || t.username?.toLowerCase() === cleanId) {
          return { ...t, permissions: updatedPerms };
        }
        return t;
      });

      try {
        localStorage.setItem('dhigrowth_tenants', JSON.stringify(updated));
      } catch {}

      return updated;
    });

    // 3. Update currentUser session if active or stored
    try {
      const rawStored = localStorage.getItem('dhigrowth_auth_session');
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (parsed.id === identifier || parsed.username?.toLowerCase() === tenantUser) {
          parsed.permissions = updatedPerms;
          localStorage.setItem('dhigrowth_auth_session', JSON.stringify(parsed));
        }
      }
      const tenantStored = localStorage.getItem(`dhigrowth_auth_session_${tenantUser}`);
      if (tenantStored) {
        const parsed = JSON.parse(tenantStored);
        parsed.permissions = updatedPerms;
        localStorage.setItem(`dhigrowth_auth_session_${tenantUser}`, JSON.stringify(parsed));
      }
    } catch {}

    if (currentUser?.id === identifier || currentUser?.username?.toLowerCase() === tenantUser) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const currentP = prev.permissions || {};
        const updatedUser = { ...prev, permissions: { ...currentP, [permissionKey]: nextVal } };
        return updatedUser;
      });
    }

    // 3b. Update impersonatedTenant if active
    if (
      impersonatedTenant &&
      (impersonatedTenant.id === identifier ||
        impersonatedTenant.username?.toLowerCase() === tenantUser)
    ) {
      setImpersonatedTenant((prev) => {
        if (!prev) return prev;
        const next = { ...prev, permissions: updatedPerms };
        try {
          localStorage.setItem('dhigrowth_impersonated_tenant', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    try {
      window.dispatchEvent(new CustomEvent('dhigrowth_permissions_changed', { detail: { tenantUser, permissions: updatedPerms } }));
    } catch {}

    // 4. Sync immediately to backend
    try {
      fetch(`${BACKEND_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUpdatedTenant),
      }).catch(() => {
        fetch('http://localhost:4000/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetUpdatedTenant),
        }).catch(() => {});
      });
    } catch {}

    showToast(`Updated "${permissionKey}" for ${targetTenant?.name || tenantUser}`, 'success');
  };

  // Batch update all permissions for a tenant
  const batchUpdateTenantPermissions = (identifier, newPermissions) => {
    const cleanId = String(identifier || '').toLowerCase();
    const targetTenant = (tenants || []).find(
      (t) => t.id === identifier || t.workspaceId === identifier || t.username?.toLowerCase() === cleanId
    );
    const tenantUser = targetTenant?.username?.toLowerCase() || cleanId;
    const currentP = targetTenant?.permissions || {};
    const mergedPerms = { ...currentP, ...newPermissions, manage: true, wallet: true, plans: true };

    const targetUpdatedTenant = targetTenant
      ? { ...targetTenant, permissions: mergedPerms }
      : { id: identifier, workspaceId: identifier, username: tenantUser, permissions: mergedPerms };

    // 1. Immediately persist to dedicated tenant permissions cache in localStorage
    try {
      localStorage.setItem(`dhigrowth_tenant_perms_${tenantUser}`, JSON.stringify(mergedPerms));
      if (targetTenant?.id) {
        localStorage.setItem(`dhigrowth_tenant_perms_${targetTenant.id}`, JSON.stringify(mergedPerms));
      }
    } catch {}

    // 2. Update React tenants state & localStorage
    setTenants((prev) => {
      const updated = prev.map((t) => {
        if (t.id === identifier || t.workspaceId === identifier || t.username?.toLowerCase() === cleanId) {
          return { ...t, permissions: mergedPerms };
        }
        return t;
      });

      try {
        localStorage.setItem('dhigrowth_tenants', JSON.stringify(updated));
      } catch {}

      return updated;
    });

    // 3. Update currentUser session if active or stored
    try {
      const rawStored = localStorage.getItem('dhigrowth_auth_session');
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (parsed.id === identifier || parsed.username?.toLowerCase() === tenantUser) {
          parsed.permissions = mergedPerms;
          localStorage.setItem('dhigrowth_auth_session', JSON.stringify(parsed));
        }
      }
      const tenantStored = localStorage.getItem(`dhigrowth_auth_session_${tenantUser}`);
      if (tenantStored) {
        const parsed = JSON.parse(tenantStored);
        parsed.permissions = mergedPerms;
        localStorage.setItem(`dhigrowth_auth_session_${tenantUser}`, JSON.stringify(parsed));
      }
    } catch {}

    if (currentUser?.id === identifier || currentUser?.username?.toLowerCase() === tenantUser) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updatedUser = { ...prev, permissions: mergedPerms };
        return updatedUser;
      });
    }

    // 3b. Update impersonatedTenant if active
    if (
      impersonatedTenant &&
      (impersonatedTenant.id === identifier ||
        impersonatedTenant.username?.toLowerCase() === tenantUser)
    ) {
      setImpersonatedTenant((prev) => {
        if (!prev) return prev;
        const next = { ...prev, permissions: mergedPerms };
        try {
          localStorage.setItem('dhigrowth_impersonated_tenant', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    try {
      window.dispatchEvent(new CustomEvent('dhigrowth_permissions_changed', { detail: { tenantUser, permissions: mergedPerms } }));
    } catch {}

    // 4. Sync immediately to backend
    try {
      fetch(`${BACKEND_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUpdatedTenant),
      }).catch(() => {
        fetch('http://localhost:4000/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetUpdatedTenant),
        }).catch(() => {});
      });
    } catch {}

    showToast(`Updated all permissions for ${targetTenant?.name || tenantUser}`, 'success');
  };

  // Multi-Tenant User Permissions State (Admin can manage permissions for other users)
  const DEFAULT_USER_PERMISSIONS = {
    sri: {
      sendDueToAll: true,
      teamInbox: true,
      channels: true,
      campaigns: true,
      metaKeys: true,
    },
  };

  const [userPermissions, setUserPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('dhigrowth_user_permissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER_PERMISSIONS,
          ...parsed,
          sri: { ...DEFAULT_USER_PERMISSIONS.sri, ...(parsed.sri || {}) },
        };
      }
    } catch {}
    return DEFAULT_USER_PERMISSIONS;
  });

  const updateUserPermission = (username, permissionKey, isEnabled) => {
    const cleanUser = username?.toLowerCase()?.trim();
    if (!cleanUser) return;

    setUserPermissions((prev) => {
      const updated = {
        ...prev,
        [cleanUser]: {
          ...(prev[cleanUser] || {}),
          [permissionKey]: isEnabled,
        },
      };
      try {
        localStorage.setItem('dhigrowth_user_permissions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const labelMap = {
      sendDueToAll: 'Send Due to All Contacts',
      metaKeys: 'Meta API Credentials',
      autoReply: 'Auto-Reply Bot Rules',
      isolatedInbox: 'WhatsApp Inbox',
      teamInbox: 'Team Inbox Access',
      channels: 'Connected Channels',
      campaigns: 'Broadcast Campaigns',
    };
    const featureName = labelMap[permissionKey] || permissionKey;
    showToast(
      `Updated ${cleanUser.toUpperCase()} permissions: "${featureName}" is now ${isEnabled ? 'ENABLED' : 'DISABLED'}`,
      isEnabled ? 'success' : 'info'
    );
  };

  const hasPermission = (permissionKey, targetUser = null) => {
    // Super Admin has master access to everything
    const activeUsername = currentUser?.username?.toLowerCase()?.trim();
    if (currentUser?.isAdmin || activeUsername === 'admin') {
      return true;
    }

    const checkUser = targetUser ? targetUser.toLowerCase().trim() : activeUsername;
    if (!checkUser) return false;

    const userPerms = userPermissions[checkUser];
    if (!userPerms) return false;

    return Boolean(userPerms[permissionKey]);
  };


  // Channels Connection State
  const [channels, setChannels] = useState({
    whatsapp: { connected: false, detail: 'Not connected' },
    instagram: { connected: false, detail: 'Not connected' },
    messenger: { connected: false, detail: 'Not connected' },
  });

  const connectChannel = (channelKey, detail) => {
    setChannels((prev) => ({
      ...prev,
      [channelKey]: { connected: true, detail: detail || 'Connected' },
    }));
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast(`🎉 ${channelKey.toUpperCase()} connected successfully!`, 'success');
  };

  const disconnectChannel = (channelKey) => {
    setChannels((prev) => ({
      ...prev,
      [channelKey]: { connected: false, detail: 'Not connected' },
    }));
    showToast(`${channelKey.toUpperCase()} disconnected`, 'info');
  };

  // Metrics Data
  const [metrics, setMetrics] = useState({
    messagesHandled: 42,
    aiSpend30d: 0.21,
    totalLeads: 18,
    openRate: 99.1,
    replyRate: 34.8,
    aiResolutionRate: 88.4,
    avgResponseLatency: '3.2s',
  });

  // Helper to load strictly workspace-scoped chats
  const getInitialChatsForWorkspace = (wsId) => {
    // If it's a tenant workspace (not Sri's default workspace), start completely isolated: []
    if (wsId && wsId !== DEFAULT_WORKSPACE_ID) {
      try {
        const saved = localStorage.getItem(`dhigrowth_chats_${wsId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
      return [];
    }

    // Default Seed / Sri Workspace
    try {
      const saved = localStorage.getItem(`dhigrowth_chats_${DEFAULT_WORKSPACE_ID}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    if (isSupabaseConfigured) return [];
    return [
      {
        id: 'c1',
        contactName: 'Priya Sharma',
        avatar: null,
        phone: '+91 97914 71277',
        channel: 'whatsapp',
        tag: 'Hot',
        city: 'Mumbai, IN',
        lastSeen: '2m ago',
        unreadCount: 1,
        aiHandled: true,
        dealValue: '₹2,499',
        attributes: {
          budget: '₹2,000 - ₹3,500',
          product: 'Organic Linen Bedcover 90x72',
          intent: 'COD Order Confirmation',
          city: 'Mumbai',
        },
        notes: [
          { id: 'n1', author: 'Agent Sarah', text: 'Customer asked for express BlueDart shipping to Bandra West.', time: '10m ago' }
        ],
        messages: [
          { id: 'm1', sender: 'user', text: 'Hi, do you have the king size organic linen bedcover in beige?', time: '10:24 AM' },
          { id: 'm2', sender: 'ai', text: 'Hello Priya! 👋 Yes, our Premium King Size Linen Cover (Beige · 90"×72") is in stock and ready to ship today.\n\nPrice is ₹2,499 with complimentary express delivery and Cash on Delivery available.', time: '10:24 AM' },
          { id: 'm3', sender: 'user', text: 'Great! Can you confirm if matching pillowcases come with it?', time: '10:27 AM' },
          { id: 'm4', sender: 'ai', text: 'Yes, 2 matching flange pillowcases are included! Would you like me to reserve one for you with code LAUNCH10 for 10% off?', time: '10:27 AM' },
          { id: 'm5', sender: 'user', text: 'Yes please, add COD to Bandra West address.', time: '10:30 AM' },
        ],
      },
      {
        id: 'c2',
        contactName: 'David Miller',
        avatar: null,
        phone: '+1 (415) 890-2134',
        channel: 'instagram',
        tag: 'Interested',
        city: 'San Francisco, USA',
        lastSeen: '14m ago',
        unreadCount: 0,
        aiHandled: true,
        dealValue: '$1,200',
        attributes: {
          budget: '$1,000+',
          product: 'Shopify CAPI Webhook integration',
          intent: 'SaaS Integration',
          city: 'San Francisco',
        },
        notes: [],
        messages: [
          { id: 'm201', sender: 'user', text: 'Saw your reel about Meta CAPI integration. Can we trigger events from Shopify webhooks directly?', time: '09:40 AM' },
          { id: 'm202', sender: 'ai', text: 'Hey David! 🚀 Absolutely. Whenever a cart is abandoned or purchase is completed, Dhigrowth posts events directly to Meta Conversions API with 9.8/10 match quality.', time: '09:40 AM' },
        ],
      },
      {
        id: 'c3',
        contactName: 'Tariq Al-Mansoor',
        avatar: null,
        phone: '+971 50 234 9812',
        channel: 'whatsapp',
        tag: 'Converted',
        city: 'Dubai, UAE',
        lastSeen: '1h ago',
        unreadCount: 0,
        aiHandled: false,
        dealValue: '$4,800',
        attributes: {
          budget: '$5,000/mo',
          product: 'Enterprise Meta Partner WABA',
          intent: 'Annual Paid Subscription',
          city: 'Dubai',
        },
        notes: [],
        messages: [
          { id: 'm301', sender: 'user', text: 'Invoice paid via wire transfer. When will our WABA green tick be live?', time: '08:15 AM' },
          { id: 'm302', sender: 'agent', text: 'Thank you Tariq! We have submitted your official Meta business verification documents. Meta typically reviews official Green Tick badges within 24-48 hours.', time: '08:20 AM' },
        ],
      },
    ];
  };

  // Chats List partitioned strictly per workspace
  // Helper to load single workspace chats with metadata
  const getChatsForSingleWorkspace = (wsId) => {
    const rawChats = getInitialChatsForWorkspace(wsId);
    const matchedClient = (tenants || []).find((t) => (t.workspaceId || t.id) === wsId);
    const clientName = matchedClient?.name || (wsId === DEFAULT_WORKSPACE_ID ? 'Sri' : 'Client');
    const clientCompany = matchedClient?.companyName || (wsId === DEFAULT_WORKSPACE_ID ? 'Dhigrowth CRM' : 'Workspace');

    return (rawChats || []).map((c) => ({
      ...c,
      workspaceId: wsId,
      clientProfileName: c.clientProfileName || clientName,
      clientCompanyName: c.clientCompanyName || clientCompany,
    }));
  };

  // Helper to load all client workspaces chats merged for Super Admin
  const getAllClientWorkspacesChats = () => {
    const all = [];
    const seenIds = new Set();

    const clientProfiles = (tenants || []).filter(
      (t) => !t.isSuperAdmin && t.username?.toLowerCase() !== 'admin' && t.role !== 'Super Administrator'
    );

    clientProfiles.forEach((t) => {
      const wsId = t.workspaceId || t.id;
      const tenantChats = getChatsForSingleWorkspace(wsId);
      tenantChats.forEach((c) => {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          all.push(c);
        }
      });
    });

    // Also include DEFAULT_WORKSPACE_ID (Sri) if not already included
    if (!seenIds.has('c1') && !seenIds.has('c2')) {
      const defaultChats = getChatsForSingleWorkspace(DEFAULT_WORKSPACE_ID);
      defaultChats.forEach((c) => {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          all.push(c);
        }
      });
    }

    all.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    return all;
  };

  const getChatCountForWorkspace = (wsId) => {
    try {
      const saved = localStorage.getItem(`dhigrowth_chats_${wsId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
      if (wsId === DEFAULT_WORKSPACE_ID) return 3;
    } catch {}
    return 0;
  };

  // Helper to persist updated chats into localStorage per workspace
  const persistChatUpdate = (targetChatId, chatUpdater) => {
    setChats((prev) => {
      const updated = chatUpdater(prev);
      const targetChat = updated.find((c) => c.id === targetChatId) || prev.find((c) => c.id === targetChatId);
      const targetWs = targetChat?.workspaceId || (isSuperAdmin && selectedClientWorkspace !== 'all' ? selectedClientWorkspace : currentWorkspaceId);

      try {
        const saved = localStorage.getItem(`dhigrowth_chats_${targetWs}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedTarget = updated.find((c) => c.id === targetChatId);
          if (savedTarget) {
            const idx = parsed.findIndex((c) => c.id === targetChatId);
            if (idx >= 0) {
              parsed[idx] = savedTarget;
            } else {
              parsed.unshift(savedTarget);
            }
            localStorage.setItem(`dhigrowth_chats_${targetWs}`, JSON.stringify(parsed));
          }
        } else {
          const wsChats = updated.filter((c) => (c.workspaceId || targetWs) === targetWs);
          localStorage.setItem(`dhigrowth_chats_${targetWs}`, JSON.stringify(wsChats));
        }
      } catch {}

      return updated;
    });
  };

  // Chats List: Super Admin sees all or selected client profile; regular tenants see only their isolated workspace
  const [chats, setChats] = useState(() => {
    if (isSuperAdmin) {
      if (selectedClientWorkspace === 'all') {
        return getAllClientWorkspacesChats();
      }
      return getChatsForSingleWorkspace(selectedClientWorkspace);
    }
    return getChatsForSingleWorkspace(currentWorkspaceId);
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const initialChats = isSuperAdmin
      ? (selectedClientWorkspace === 'all' ? getAllClientWorkspacesChats() : getChatsForSingleWorkspace(selectedClientWorkspace))
      : getChatsForSingleWorkspace(currentWorkspaceId);
    return initialChats.length > 0 ? initialChats[0].id : null;
  });

  // Strict Tenant Isolation & Super Admin client switching
  useEffect(() => {
    if (isSuperAdmin) {
      const updated = selectedClientWorkspace === 'all'
        ? getAllClientWorkspacesChats()
        : getChatsForSingleWorkspace(selectedClientWorkspace);
      setChats(updated);
      setActiveChatId((prev) => {
        if (prev && updated.some((c) => c.id === prev)) return prev;
        return updated.length > 0 ? updated[0].id : null;
      });
    } else {
      const updated = getChatsForSingleWorkspace(currentWorkspaceId);
      setChats(updated);
      setActiveChatId((prev) => {
        if (prev && updated.some((c) => c.id === prev)) return prev;
        return updated.length > 0 ? updated[0].id : null;
      });
    }
  }, [currentWorkspaceId, isSuperAdmin, selectedClientWorkspace]);

  // Client profile switcher for Super Admin
  const selectClientWorkspace = (wsIdOrAll) => {
    setSelectedClientWorkspace(wsIdOrAll);
    try {
      localStorage.setItem('dhigrowth_superadmin_selected_workspace', wsIdOrAll);
    } catch {}

    let nextChats = [];
    if (wsIdOrAll === 'all') {
      nextChats = getAllClientWorkspacesChats();
      showToast('Showing all inbox messages across all client profiles', 'info');
    } else {
      nextChats = getChatsForSingleWorkspace(wsIdOrAll);
      const matched = tenants.find((t) => (t.workspaceId || t.id) === wsIdOrAll);
      showToast(`Filtered inbox to ${matched?.name || 'client'} profile`, 'info');
    }
    setChats(nextChats);
    setActiveChatId(nextChats.length > 0 ? nextChats[0].id : null);
  };

  // Campaigns List
  const [campaigns, setCampaigns] = useState([
    {
      id: 'camp-1',
      name: 'Diwali Flash Sale 25% VIP Broadcast',
      channel: 'WhatsApp',
      template: 'festive_discount_v3',
      status: 'Active',
      audience: 'Hot Leads & VIPs (2,840 contacts)',
      sent: 2840,
      delivered: 2802,
      read: 2710,
      replied: 894,
      conversions: 312,
      revenue: '$14,280',
      roas: '776x',
    },
    {
      id: 'camp-2',
      name: 'Abandoned Cart 1h Recovery Drip',
      channel: 'WhatsApp + IG',
      template: 'cart_recovery_dynamic',
      status: 'Automated Drip',
      audience: 'Shopify Trigger (Real-time)',
      sent: 1420,
      delivered: 1400,
      read: 1362,
      replied: 480,
      conversions: 218,
      revenue: '$9,810',
      roas: '1066x',
    },
  ]);

  // Knowledge Base Documents
  const [knowledgeBase, setKnowledgeBase] = useState([
    { id: 'kb-1', title: 'Product Catalog & Pricing 2026', category: 'Catalog', tokens: '4,280 tokens', lastSync: '2h ago' },
    { id: 'kb-2', title: 'Shipping, Returns & COD Policies', category: 'Policy FAQ', tokens: '1,850 tokens', lastSync: 'Yesterday' },
  ]);

  // Sync live state with Supabase cloud database
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    const syncCloudData = async () => {
      try {
        const queryWsId = isSuperAdmin ? selectedClientWorkspace : currentWorkspaceId;
        const targetSingleWs = queryWsId === 'all' ? DEFAULT_WORKSPACE_ID : queryWsId;

        // 1. Fetch live wallet balance
        const walletResult = await getWalletData(targetSingleWs);
        if (walletResult?.wallet && isMounted) {
          const balance = parseFloat(walletResult.wallet.balance_usd) || 0;
          setCredits(balance);
          if (balance >= 5.0) setHasClaimedBonus(true);
        }

        // 2. Fetch live channels status
        const channelsResult = await getChannels(targetSingleWs);
        if (channelsResult && channelsResult.length > 0 && isMounted) {
          const updated = { ...channels };
          channelsResult.forEach((ch) => {
            if (updated[ch.type]) {
              updated[ch.type] = {
                connected: ch.is_connected,
                detail: ch.display_name || ch.identifier,
              };
            }
          });
          setChannels(updated);
        }

        // 3. Fetch live contacts, conversations, and messages
        const [contactsResult, convsResult, msgsResult] = await Promise.all([
          getContacts(queryWsId),
          getConversations(queryWsId),
          getWorkspaceMessages(queryWsId),
        ]);

        if (contactsResult && isMounted) {
          setMetrics((prev) => ({
            ...prev,
            totalLeads: contactsResult.length,
          }));

          // If this workspace has 0 contacts, set chats to empty and clear localStorage
          if (contactsResult.length === 0) {
            setChats([]);
            setActiveChatId(null);
            if (queryWsId !== 'all') {
              try {
                localStorage.setItem(`dhigrowth_chats_${queryWsId}`, JSON.stringify([]));
              } catch {}
            }
            return;
          }

          // Create map of contact_id -> conversation_id
          const contactToConvMap = {};
          (convsResult || []).forEach((cv) => {
            const cId = cv.contact_id;
            if (cId) {
              contactToConvMap[cId] = cv.id;
            }
          });

          // Group messages by conversation_id
          const convMessagesMap = {};
          (msgsResult || []).forEach((m) => {
            if (!convMessagesMap[m.conversation_id]) {
              convMessagesMap[m.conversation_id] = [];
            }
            const msgDate = new Date(m.sent_at || m.created_at || Date.now());
            convMessagesMap[m.conversation_id].push({
              id: m.id,
              sender: m.ai_generated ? 'ai' : m.direction === 'inbound' ? 'user' : 'agent',
              text: m.content === '[interactive attachment]' ? "Yes, I'm interested" : m.content,
              time: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: msgDate.getTime(),
              status: m.status || 'delivered',
            });
          });

          const dbChats = contactsResult.map((c) => {
            const conversationId = contactToConvMap[c.id] || null;
            const contactMsgs = conversationId && convMessagesMap[conversationId]?.length > 0
              ? convMessagesMap[conversationId]
              : [
                  {
                    id: `init-${c.id}`,
                    sender: 'ai',
                    text: `Hello! 👋 Welcome to **DhiGrowth IT Services**.\n\nHow can our AI Business Concierge help you today? 🤖\n\nWe help businesses with:\n📱 **App Development**\n🤖 **AI Business Solutions & Development**\n💬 **WhatsApp CRM & Automation**\n💻 **Custom IT Solutions**\n\nTell us what your business needs, and let’s build something powerful together! 🚀`,
                    time: 'Recent',
                    timestamp: new Date(c.created_at || Date.now()).getTime(),
                  },
                ];

            const lastMsg = contactMsgs[contactMsgs.length - 1];
            const lastMessageTimestamp = lastMsg?.timestamp || new Date(c.updated_at || c.created_at || Date.now()).getTime();

            const convObj = (convsResult || []).find((cv) => cv.contact_id === c.id || cv.id === conversationId);
            const isAiHandled = convObj?.status ? (convObj.status === 'bot_active' || convObj.status === 'ai') : true;

            const chatWs = c.workspace_id || (queryWsId !== 'all' ? queryWsId : DEFAULT_WORKSPACE_ID);
            const matchedClient = (tenants || []).find((t) => (t.workspaceId || t.id) === chatWs);
            const clientName = matchedClient?.name || (chatWs === DEFAULT_WORKSPACE_ID ? 'Sri' : 'Client');
            const clientCompany = matchedClient?.companyName || (chatWs === DEFAULT_WORKSPACE_ID ? 'Dhigrowth CRM' : 'Workspace');

            return {
              id: c.id,
              workspaceId: chatWs,
              clientProfileName: clientName,
              clientCompanyName: clientCompany,
              conversationId,
              contactName: c.full_name,
              avatar: null,
              phone: c.phone_number,
              email: c.email || `${c.full_name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
              channel: 'whatsapp',
              tag: c.custom_attributes?.tag || (c.lead_score >= 90 ? 'Hot' : c.lead_score >= 70 ? 'Interested' : 'Discovery'),
              city: c.custom_attributes?.city || 'Mumbai, IN',
              lastSeen: lastMsg?.time || 'Active',
              lastMessageTimestamp,
              unreadCount: 0,
              aiHandled: isAiHandled,
              dealValue: c.custom_attributes?.dealValue || '₹2,499',
              attributes: {
                budget: '₹2,000 - ₹5,000',
                product: 'Omnichannel CRM Lead',
                intent: c.lead_stage || 'Discovery',
                city: c.custom_attributes?.city || 'India',
              },
              notes: [],
              messages: contactMsgs,
            };
          });

          // Sort descending by newest message first
          dbChats.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

          setChats((prev) => {
            const hasChanged = dbChats.some((newChat) => {
              const oldChat = prev.find((p) => p.id === newChat.id);
              if (!oldChat) return true;
              if ((oldChat.messages || []).length !== (newChat.messages || []).length) return true;
              const oldLast = oldChat.messages?.[oldChat.messages.length - 1];
              const newLast = newChat.messages?.[newChat.messages.length - 1];
              return oldLast?.id !== newLast?.id || oldLast?.text !== newLast?.text;
            });

            if (!hasChanged && prev.length === dbChats.length && prev.length > 0) {
              return prev;
            }

            // If a new inbound message arrived from a client, play notification sound & show toast
            if (prev.length > 0) {
              dbChats.forEach((newChat) => {
                const oldChat = prev.find((p) => p.id === newChat.id);
                if (oldChat) {
                  const oldLast = oldChat.messages?.[oldChat.messages.length - 1];
                  const newLast = newChat.messages?.[newChat.messages.length - 1];
                  if (newLast && newLast.id !== oldLast?.id && newLast.sender === 'user') {
                    playNotificationSound();
                    showDesktopNotification(newChat.contactName, newLast.text);
                    showToast(`💬 ${newChat.contactName}: "${newLast.text.slice(0, 45)}${newLast.text.length > 45 ? '...' : ''}"`, 'info');
                  }
                }
              });
            }

            const updated = dbChats.map((newChat) => {
              const oldChat = prev.find((p) => p.id === newChat.id);
              if (!oldChat) return newChat;
              return {
                ...newChat,
                aiHandled: oldChat.aiHandled !== undefined ? oldChat.aiHandled : newChat.aiHandled,
                unreadCount: oldChat.unreadCount !== undefined ? oldChat.unreadCount : newChat.unreadCount,
                notes: oldChat.notes?.length > 0 ? oldChat.notes : newChat.notes,
                tag: oldChat.tag || newChat.tag,
              };
            });

            // Always prioritize newest active conversation at top
            updated.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

            if (queryWsId === 'all') {
              const byWs = {};
              updated.forEach((ch) => {
                const w = ch.workspaceId || DEFAULT_WORKSPACE_ID;
                if (!byWs[w]) byWs[w] = [];
                byWs[w].push(ch);
              });
              Object.entries(byWs).forEach(([w, list]) => {
                try {
                  localStorage.setItem(`dhigrowth_chats_${w}`, JSON.stringify(list));
                } catch {}
              });
            } else {
              try {
                localStorage.setItem(`dhigrowth_chats_${queryWsId}`, JSON.stringify(updated));
              } catch {}
            }
            return updated;
          });

          setActiveChatId((prev) => {
            if (prev && dbChats.some((d) => d.id === prev)) return prev;
            return dbChats.length > 0 ? dbChats[0].id : null;
          });
        }
      } catch (err) {
        console.warn('Supabase cloud sync note:', err);
      }
    };

    // Initial cloud sync once on workspace load / switch
    syncCloudData();

    // Connect Realtime WebSocket Stream (Completely replaces 2-second HTTP polling!)
    const queryWsId = isSuperAdmin ? selectedClientWorkspace : currentWorkspaceId;
    const subscription = subscribeToWorkspaceRealtime(queryWsId, {
      onNewMessage: (newMsg) => {
        if (!isMounted || !newMsg) return;
        const msgTimestamp = new Date(newMsg.sent_at || newMsg.created_at || Date.now()).getTime();
        const formatted = {
          id: newMsg.id,
          sender: newMsg.ai_generated ? 'ai' : newMsg.direction === 'inbound' ? 'user' : 'agent',
          text: newMsg.content === '[interactive attachment]' ? "Yes, I'm interested" : newMsg.content,
          time: new Date(msgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: msgTimestamp,
          status: newMsg.status || 'delivered',
        };

        const isInbound = !newMsg.ai_generated && newMsg.direction === 'inbound';

        setChats((prev) => {
          const targetIndex = prev.findIndex(
            (c) =>
              c.conversationId === newMsg.conversation_id ||
              c.id === newMsg.conversation_id ||
              (!c.conversationId && prev.length === 1)
          );

          if (targetIndex < 0) {
            // New inbound lead not yet in memory
            if (isInbound) {
              playNotificationSound();
              showDesktopNotification('New Lead', newMsg.content);
              showToast(`💬 New message received!`, 'info');
            }
            syncCloudData();
            return prev;
          }

          const target = prev[targetIndex];
          const exists = (target.messages || []).some((m) => m.id === newMsg.id);
          if (exists) return prev;

          if (isInbound) {
            playNotificationSound();
            showDesktopNotification(target.contactName, newMsg.content);
            showToast(`💬 ${target.contactName}: "${newMsg.content.slice(0, 45)}${newMsg.content.length > 45 ? '...' : ''}"`, 'info');
          }

          const updatedTarget = {
            ...target,
            messages: [...(target.messages || []), formatted],
            lastSeen: formatted.time,
            lastMessageTimestamp: msgTimestamp,
            unreadCount: isInbound ? (target.unreadCount || 0) + 1 : target.unreadCount,
          };

          const remaining = prev.filter((_, idx) => idx !== targetIndex);
          const updated = [updatedTarget, ...remaining];

          const targetWs = target.workspaceId || (queryWsId !== 'all' ? queryWsId : DEFAULT_WORKSPACE_ID);
          try {
            localStorage.setItem(`dhigrowth_chats_${targetWs}`, JSON.stringify(updated.filter(c => (c.workspaceId || targetWs) === targetWs)));
          } catch {}
          return updated;
        });
      },

      onContactChange: (payload) => {
        console.log('⚡ [WebSocket] Conversation event received:', payload?.eventType);
        syncCloudData();
      },
      onWalletChange: (newWallet) => {
        if (!isMounted || !newWallet) return;
        const balance = parseFloat(newWallet.balance_usd) || 0;
        setCredits(balance);
        if (balance >= 5.0) setHasClaimedBonus(true);
      },
      onChannelChange: (newChannel) => {
        if (!isMounted || !newChannel) return;
        setChannels((prev) => ({
          ...prev,
          [newChannel.type]: {
            connected: newChannel.is_connected,
            detail: newChannel.display_name || newChannel.identifier,
          },
        }));
      },
    });

    // Auto-polling fallback every 2.5 seconds: guarantees client messages appear live in real-time
    const pollInterval = setInterval(() => {
      if (isMounted && typeof document !== 'undefined' && document.visibilityState !== 'hidden') {
        syncCloudData();
      }
    }, 2500);

    const handleFocus = () => {
      if (isMounted) syncCloudData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [currentWorkspaceId, isSuperAdmin, selectedClientWorkspace]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Claim $5 Bonus
  const claimBonus = () => {
    if (hasClaimedBonus) {
      showToast('You have already claimed your $5 launch credit!', 'info');
      return;
    }
    setCredits((prev) => +(prev + 5.00).toFixed(2));
    setHasClaimedBonus(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast('🎉 $5.00 launch credit added to your wallet!', 'success');
  };

  // Open Chat and clear unread badge
  const openChat = (chatId) => {
    setActiveChatId(chatId);
    persistChatUpdate(chatId, (prev) => {
      return prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c));
    });
  };

  // Send Message in Inbox
  const sendMessage = (text, sender = 'agent') => {
    if (!text.trim()) return;

    const now = Date.now();
    const newMsg = {
      id: `msg-${now}`,
      sender,
      text,
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    };

    persistChatUpdate(activeChatId, (prev) => {
      const targetIndex = prev.findIndex((c) => c.id === activeChatId);
      if (targetIndex === -1) return prev;
      const target = prev[targetIndex];
      const updatedTarget = {
        ...target,
        messages: [...(target.messages || []), newMsg],
        lastSeen: 'Just now',
        lastMessageTimestamp: now,
      };
      const remaining = prev.filter((_, idx) => idx !== targetIndex);
      return [updatedTarget, ...remaining];
    });

    setMetrics((prev) => ({
      ...prev,
      messagesHandled: prev.messagesHandled + 1,
    }));

    if (sender === 'user') {
      let isAiEnabled = true;
      let targetContactName = 'Valued Client';
      let targetChannel = 'whatsapp';
      let targetWs = currentWorkspaceId;

      // 1. Check local storage for the most up-to-date chat state
      const activeChatObj = chats.find((c) => c.id === activeChatId);
      if (activeChatObj) {
        targetWs = activeChatObj.workspaceId || targetWs;
        if (activeChatObj.aiHandled === false) isAiEnabled = false;
        targetContactName = activeChatObj.contactName || targetContactName;
        targetChannel = activeChatObj.channel || targetChannel;
      }

      try {
        const saved = localStorage.getItem(`dhigrowth_chats_${targetWs}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const matched = parsed.find((c) => c.id === activeChatId);
          if (matched) {
            isAiEnabled = matched.aiHandled !== false;
            targetContactName = matched.contactName || targetContactName;
            targetChannel = matched.channel || targetChannel;
          }
        }
      } catch {}

      // CRITICAL: If Manual Agent is turned on, AI auto-reply MUST NOT WORK!
      if (!isAiEnabled) {
        console.log(`👤 [AppContext] Chat "${targetContactName}" (${activeChatId}) is in Manual Agent mode. AI auto-reply is disabled.`);
        showToast(`👤 Manual Agent active for ${targetContactName}. AI auto-reply is paused.`, 'info');
        return;
      }

      (async () => {
        let reply = '';
        let imageUrl = null;
        try {
          let res;
          try {
            res = await fetch(`${BACKEND_URL}/api/ai/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerMessage: text,
                customerName: activeChatObj?.contactName || 'Valued Client',
                channelType: activeChatObj?.channel || 'whatsapp',
                workspaceId: targetWs,
              }),
            });
          } catch {}

          if (!res || !res.ok) {
            try {
              res = await fetch('http://localhost:4000/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerMessage: text,
                  customerName: activeChatObj?.contactName || 'Valued Client',
                  channelType: activeChatObj?.channel || 'whatsapp',
                  workspaceId: targetWs,
                }),
              });
            } catch {}
          }

          if (res && res.ok) {
            const data = await res.json();
            if (data.success && data.reply) {
              reply = data.reply;
              imageUrl = data.imageUrl || null;
            }
          }
        } catch (e) {
          console.warn('AI auto reply error:', e);
        }

        if (!reply) {
          reply = `Hello ${activeChatObj?.contactName || 'there'}! 👋 Welcome to DhiGrowth IT Services.\n\nHow can our AI Business Concierge help you today? Tell us what your business needs and let's build something powerful together! 🚀`;
        }

        const aiTime = Date.now();
        const aiMsg = {
          id: `ai-${aiTime}`,
          sender: 'ai',
          text: reply,
          media_url: imageUrl || null,
          time: new Date(aiTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: aiTime,
        };

        playNotificationSound();

        persistChatUpdate(activeChatId, (prevChats) => {
          const targetIndex = prevChats.findIndex((c) => c.id === activeChatId);
          if (targetIndex === -1) return prevChats;
          const target = prevChats[targetIndex];
          const updatedTarget = {
            ...target,
            messages: [...(target.messages || []), aiMsg],
            lastSeen: 'Just now',
            lastMessageTimestamp: aiTime,
          };
          const remaining = prevChats.filter((_, idx) => idx !== targetIndex);
          return [updatedTarget, ...remaining];
        });

        setMetrics((prev) => ({
          ...prev,
          messagesHandled: prev.messagesHandled + 1,
          aiSpend30d: +(prev.aiSpend30d + 0.005).toFixed(3),
        }));
      })();
    }
  };

  const setAiForChat = (chatId, isAiEnabled) => {
    let targetConvId = null;
    let targetContactName = '';
    let targetPhone = '';
    let targetWs = currentWorkspaceId;

    persistChatUpdate(chatId, (prev) => {
      return prev.map((c) => {
        if (c.id === chatId) {
          targetConvId = c.conversationId || c.id;
          targetContactName = c.contactName;
          targetPhone = c.phone;
          targetWs = c.workspaceId || targetWs;
          return { ...c, aiHandled: Boolean(isAiEnabled) };
        }
        return c;
      });
    });

    // Notify backend server so Meta incoming webhooks immediately respect Manual Agent mode!
    try {
      const modePayload = {
        phone: targetPhone,
        conversationId: targetConvId,
        isAiEnabled: Boolean(isAiEnabled),
        workspaceId: targetWs,
      };

      fetch(`${BACKEND_URL}/api/conversations/set-agent-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modePayload),
      }).catch(() => {
        fetch('http://localhost:4000/api/conversations/set-agent-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modePayload),
        }).catch(() => {});
      });
    } catch {}

    if (isSupabaseConfigured && targetConvId) {
      updateConversationStatus(targetConvId, isAiEnabled ? 'bot_active' : 'human_agent').catch((e) => {
        console.warn('Could not sync conversation status to DB:', e.message);
      });
    }

    showToast(
      isAiEnabled
        ? `🤖 AI Auto-Pilot ON — AI will auto-reply to ${targetContactName || 'this contact'}`
        : `👤 Manual Agent Active — AI auto-reply is disabled for ${targetContactName || 'this contact'}`,
      isAiEnabled ? 'success' : 'info'
    );
  };

  const toggleAiForChat = (chatId) => {
    const targetChat = chats.find((c) => c.id === chatId);
    const next = !targetChat?.aiHandled;
    setAiForChat(chatId, next);
  };

  const addInternalNote = (chatId, text) => {
    if (!text.trim()) return;
    const authorName = currentUser?.name || currentUser?.username || 'Admin';
    const note = {
      id: `n-${Date.now()}`,
      author: authorName,
      text,
      time: 'Just now',
    };
    persistChatUpdate(chatId, (prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, notes: [note, ...(c.notes || [])] } : c))
    );
    showToast('Internal note saved to contact timeline', 'success');
  };

  const updateLeadTag = (chatId, newTag) => {
    persistChatUpdate(chatId, (prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, tag: newTag } : c))
    );
    showToast(`Lead stage updated to "${newTag}"`, 'success');
  };

  const createLead = async (leadData) => {
    let newDbId = `c-${Date.now()}`;
    const targetWs = leadData.workspaceId || (isSuperAdmin && selectedClientWorkspace !== 'all' ? selectedClientWorkspace : currentWorkspaceId);
    const matchedClient = (tenants || []).find((t) => (t.workspaceId || t.id) === targetWs);
    const clientName = matchedClient?.name || (targetWs === DEFAULT_WORKSPACE_ID ? 'Sri' : 'Client');
    const clientCompany = matchedClient?.companyName || (targetWs === DEFAULT_WORKSPACE_ID ? 'Dhigrowth CRM' : 'Workspace');

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const res = await createDbContact({
          workspaceId: targetWs,
          fullName: leadData.name,
          phoneNumber: leadData.phone,
          email: leadData.email,
          leadStage: leadData.tag === 'Hot' ? 'Won / Confirmed' : 'Discovery',
          leadScore: leadData.tag === 'Hot' ? 95 : 65,
          city: leadData.city || 'Mumbai, IN',
          dealValue: leadData.dealValue || '₹2,499',
          tag: leadData.tag || 'Interested',
        });
        if (res?.contact?.id) {
          newDbId = res.contact.id;
        }
      } catch (err) {
        console.warn('Supabase create contact notice:', err);
      }
    }

    const newLead = {
      id: newDbId,
      workspaceId: targetWs,
      clientProfileName: clientName,
      clientCompanyName: clientCompany,
      contactName: leadData.name,
      avatar: leadData.avatar || null,
      phone: leadData.phone,
      email: leadData.email || `${leadData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      channel: leadData.channel || 'whatsapp',
      tag: leadData.tag || 'Interested',
      city: leadData.city || 'Mumbai, IN',
      lastSeen: 'Just now',
      unreadCount: 0,
      aiHandled: true,
      dealValue: leadData.dealValue || '₹2,499',
      attributes: {
        budget: leadData.budget || '₹2,499',
        product: leadData.product || 'General inquiry',
        intent: 'New Lead',
        city: leadData.city || 'Mumbai, IN',
      },
      notes: [],
      messages: [
        {
          id: `init-${Date.now()}`,
          sender: 'ai',
          text: `Hello! 👋 Welcome to **${clientCompany}**.\n\nHow can our AI Business Concierge help you today? 🤖\n\nTell us what your business needs, and let’s build something powerful together! 🚀`,
          time: 'Just now',
        },
      ],
    };

    setChats((prev) => {
      const updated = [newLead, ...prev];
      try {
        const saved = localStorage.getItem(`dhigrowth_chats_${targetWs}`);
        const parsed = saved ? JSON.parse(saved) : [];
        localStorage.setItem(`dhigrowth_chats_${targetWs}`, JSON.stringify([newLead, ...parsed]));
      } catch {}
      return updated;
    });
    setActiveChatId(newDbId);
    setMetrics((prev) => ({ ...prev, totalLeads: prev.totalLeads + 1 }));
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast(`Contact "${leadData.name}" saved for ${clientName} (${clientCompany})!`, 'success');
  };

  const updateLead = async (contactId, updatedData) => {
    const targetChat = chats.find((c) => c.id === contactId);
    const targetWs = targetChat?.workspaceId || (isSuperAdmin && selectedClientWorkspace !== 'all' ? selectedClientWorkspace : currentWorkspaceId);

    // 1. Update in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await updateDbContact(
          contactId,
          {
            fullName: updatedData.name,
            phoneNumber: updatedData.phone,
            email: updatedData.email,
            tag: updatedData.tag,
            custom_attributes: {
              ...(targetChat?.attributes || {}),
              city: updatedData.city || targetChat?.city || targetChat?.attributes?.city || 'Mumbai, IN',
              dealValue: updatedData.dealValue || targetChat?.dealValue || '₹2,499',
              tag: updatedData.tag || targetChat?.tag || 'Interested',
              ...(updatedData.attributes || {}),
            },
          },
          targetWs,
          targetChat?.phone
        );
      } catch (err) {
        console.warn('Supabase update contact notice:', err);
      }
    }

    // 2. Update local state and storage
    persistChatUpdate(contactId, (prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            contactName: updatedData.name !== undefined ? updatedData.name : c.contactName,
            phone: updatedData.phone !== undefined ? updatedData.phone : c.phone,
            email: updatedData.email !== undefined ? updatedData.email : c.email,
            tag: updatedData.tag !== undefined ? updatedData.tag : c.tag,
            city: updatedData.city !== undefined ? updatedData.city : c.city,
            dealValue: updatedData.dealValue !== undefined ? updatedData.dealValue : c.dealValue,
            attributes: {
              ...c.attributes,
              ...(updatedData.attributes || {}),
              city: updatedData.city || c.attributes?.city || c.city,
              budget: updatedData.dealValue || updatedData.budget || c.attributes?.budget || c.dealValue,
              product: updatedData.product || c.attributes?.product,
            },
          };
        }
        return c;
      })
    );

    showToast(`Contact "${updatedData.name || targetChat?.contactName}" updated successfully!`, 'success');
  };

  const deleteLead = async (contactId) => {
    const targetChat = chats.find((c) => c.id === contactId);
    const targetWs = targetChat?.workspaceId || (isSuperAdmin && selectedClientWorkspace !== 'all' ? selectedClientWorkspace : currentWorkspaceId);

    // 1. Delete from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await deleteDbContact(contactId, targetWs, targetChat?.phone);
      } catch (err) {
        console.warn('Supabase delete contact notice:', err);
      }
    }

    // 2. Remove from local state and storage
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== contactId);
      try {
        const saved = localStorage.getItem(`dhigrowth_chats_${targetWs}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updatedSaved = parsed.filter((c) => c.id !== contactId);
          localStorage.setItem(`dhigrowth_chats_${targetWs}`, JSON.stringify(updatedSaved));
        }
      } catch {}
      return remaining;
    });

    setActiveChatId((prevActive) => {
      if (prevActive === contactId) {
        const remaining = chats.filter((c) => c.id !== contactId);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return prevActive;
    });

    setMetrics((prev) => ({ ...prev, totalLeads: Math.max(0, prev.totalLeads - 1) }));
    showToast(`Contact deleted from database`, 'info');
  };

  const createCampaign = (campData) => {
    const newCamp = {
      id: `camp-${Date.now()}`,
      name: campData.name || 'New Broadcast Campaign',
      channel: campData.channel || 'WhatsApp',
      template: campData.template || 'order_shipped_tracker',
      status: 'Active',
      audience: campData.audience || 'Hot Leads (1,200 contacts)',
      sent: 1200,
      delivered: 1184,
      read: 1140,
      replied: 410,
      conversions: 142,
      revenue: '$4,850',
      roas: '680x',
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast('🚀 Broadcast Campaign scheduled & launched!', 'success');
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate total unread messages across all chats
  const totalUnreadCount = useMemo(() => {
    return (chats || []).reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [chats]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeProfileKey,
        theme,
        setTheme,
        credits,
        setCredits,
        rechargeAiCredits,
        phoneNumber,
        setPhoneNumber,
        countryCode,
        setCountryCode,
        hasClaimedBonus,
        claimBonus,
        currentPlan,
        setCurrentPlan,
        daysRemaining,
        channels,
        connectChannel,
        disconnectChannel,
        metrics,
        chats,
        activeChatId,
        setActiveChatId,
        openChat,
        totalUnreadCount,
        playNotificationSound,
        showDesktopNotification,
        requestNotificationPermission,
        sendMessage,
        toggleAiForChat,
        setAiForChat,
        addInternalNote,
        updateLeadTag,
        createLead,
        updateLead,
        deleteLead,
        campaigns,
        createCampaign,
        aiConfig,
        setAiConfig,
        knowledgeBase,
        setKnowledgeBase,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar: () => setIsSidebarCollapsed((prev) => !prev),
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isUsageModalOpen,
        setIsUsageModalOpen,
        isWidgetOpen,
        setIsWidgetOpen,
        isWorkspaceDropdownOpen,
        setIsWorkspaceDropdownOpen,
        isBroadcastDueModalOpen,
        setIsBroadcastDueModalOpen,
        isBroadcastTemplateModalOpen,
        setIsBroadcastTemplateModalOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toastMessage,
        showToast,
        currentUser,
        isAuthenticated,
        login,
        logout,
        metaConfig,
        isMetaLoading,
        fetchMetaConfig,
        saveMetaConfig,
        testMetaConfig,
        adminViewProfile,
        setAdminViewProfile,
        switchAdminProfile,
        clientViewMode,
        setClientViewMode,
        toggleClientViewMode,
        userPermissions,
        updateUserPermission,
        hasPermission,
        saveAiConfig,
        testAiConfig,
        fetchAiConfig,
        isAiConfigLoading,
        // Multi-Tenant Super Admin state & handlers
        isSuperAdmin,
        impersonatedTenant,
        viewAsTenant,
        exitViewAs,
        selectedClientWorkspace,
        setSelectedClientWorkspace,
        selectClientWorkspace,
        clientTenants,
        getChatCountForWorkspace,
        tenants,
        currentTenant,
        createTenantUser,
        deleteTenantUser,
        updateTenantUser,
        toggleTenantPermission,
        batchUpdateTenantPermissions,
        hasNavPermission,
        NAVIGATION_MODULES,
        ALL_PERMISSION_KEYS,
        currentWorkspaceId,
        urlTenantSlug,
        // SaaS Subscription & Checkout
        isCheckoutModalOpen,
        closeCheckout,
        openCheckout,
        checkoutData,
        subscription: effectiveSubscription,
        rawSubscription: subscription,
        isPaidActive,
        refreshSubscription,
        setSubscriptionStatus,
        // Commercial SaaS Onboarding & Multi-Tenancy
        isOnboardingWizardOpen,
        setIsOnboardingWizardOpen,
        registerNewTenant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
