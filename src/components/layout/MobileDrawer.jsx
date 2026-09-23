import React from 'react';
import {
  X,
  LayoutGrid,
  Mail,
  UserCheck,
  BarChart3,
  Bot,
  Wrench,
  Target,
  GitFork,
  Megaphone,
  GitBranch,
  LayoutTemplate,
  Key,
  Layers,
  Settings,
  Wallet,
  Crown,
  LogOut,
  Users,
  ShoppingBag,
  Puzzle,
  Code,
  Grid,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileDrawer = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
    credits,
    logout,
    subscription,
    openCheckout,
    setIsUpgradeModalOpen,
    hasNavPermission,
  } = useApp();

  if (!isMobileMenuOpen) return null;

  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'Super Administrator' ||
    currentUser?.username?.toLowerCase() === 'admin'
  );

  const menuSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutGrid },
        { id: 'inbox', label: 'Team Inbox', icon: Mail },
        { id: 'leads', label: 'Leads CRM', icon: UserCheck },
        { id: 'insights', label: 'Analytics & Insights', icon: BarChart3 },
      ],
    },
    {
      title: 'MARKETING & AUTOMATION',
      items: [
        { id: 'campaigns', label: 'Campaign Manager', icon: Megaphone },
        { id: 'templates', label: 'Message Templates', icon: LayoutTemplate },
        { id: 'automations', label: 'Workflow Automations', icon: GitBranch },
        { id: 'drip-campaigns', label: 'Drip Campaigns', icon: GitFork },
      ],
    },
    {
      title: 'AI ENGINE & VOICE',
      items: [
        { id: 'ai-assistants', label: 'AI Concierge Studio', icon: Bot },
        { id: 'tools', label: 'AI Function Calling Tools', icon: Wrench },
        { id: 'voice-calling', label: 'AI Voice Calling Agent', icon: PhoneCall },
      ],
    },
    {
      title: 'CHANNELS & WEBHOOKS',
      items: [
        { id: 'channel-whatsapp', label: 'WhatsApp Official API', icon: MessageSquareIcon },
        { id: 'channel-instagram', label: 'Instagram Direct', icon: InstagramIcon },
        { id: 'channel-messenger', label: 'Facebook Messenger', icon: MessengerIcon },
        { id: 'channels', label: 'All Connected Channels', icon: Layers },
      ],
    },
    {
      title: 'INTEGRATIONS',
      items: [
        { id: 'meta-api', label: 'Meta Cloud API Credentials', icon: Key },
        { id: 'shopify', label: 'Shopify Webhooks', icon: ShoppingBag },
        { id: 'zoho', label: 'Zoho CRM Sync', icon: Puzzle },
        { id: 'api', label: 'Developer API & Webhooks', icon: Code },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'SUPER ADMIN',
            items: [
              { id: 'super-admin', label: 'Tenants & Users Management', icon: Users },
            ],
          },
        ]
      : []),
    {
      title: 'TEAM & SETTINGS',
      items: [
        { id: 'team', label: 'Team Members & Roles', icon: Users },
        { id: 'wallet', label: 'Credits & Wallet Balance', icon: Wallet },
        { id: 'plans', label: 'Subscription Plans', icon: Crown },
        { id: 'manage', label: 'Workspace Settings', icon: Settings },
      ],
    },
  ];

  const visibleMenuSections = menuSections.map((section) => {
    if (section.title === 'SUPER ADMIN') return section;
    const visibleItems = section.items.filter((item) => hasNavPermission(item.id));
    return {
      ...section,
      items: visibleItems,
    };
  }).filter((section) => section.items.length > 0);

  const handleSelect = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-up Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-[#EAECF0] z-10 animate-in slide-in-from-bottom duration-300">
        {/* Pull handle indicator */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 bg-[#D0D5DD] rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 border-b border-[#EAECF0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {(currentUser?.name?.[0] || currentUser?.username?.[0] || 'S').toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-[#101828]">
                {currentUser?.name || currentUser?.username || 'Sri'}
              </div>
              <div className="text-xs text-[#667085] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-mono font-medium">${credits.toFixed(2)} AI Credits</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-9 h-9 rounded-xl bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#475467] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {visibleMenuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 text-[10px] font-mono font-bold tracking-wider text-[#98A2B3] uppercase">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] active:scale-[0.99] ${
                        isActive
                          ? 'bg-[#F0F9FF] text-[#0284C7] font-bold shadow-2xs'
                          : 'text-[#344054] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-[#0284C7] text-white' : 'text-[#667085]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D0D5DD]" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Logout Button */}
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] text-xs font-bold cursor-pointer active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Fallback Icons for custom channels
function MessageSquareIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function MessengerIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  );
}
