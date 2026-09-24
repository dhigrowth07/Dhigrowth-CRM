import React from 'react';
import {
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
  Percent,
  LayoutTemplate,
  ArrowUpRight,
  ChevronsUpDown,
  Folder,
  Layers,
  ShoppingBag,
  Puzzle,
  Code,
  Grid,
  Settings,
  Wallet,
  Crown,
  LogOut,
  Key,
  Users,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    setIsUpgradeModalOpen,
    currentUser,
    logout,
    totalUnreadCount,
    subscription,
    hasNavPermission,
    impersonatedTenant,
    isSuperAdmin,
  } = useApp();

  const effectiveUser = impersonatedTenant || currentUser;
  const isPaidActive = Boolean(isSuperAdmin) || subscription?.status === 'active';
  const GATED_FEATURE_IDS = [
    'ai-assistants',
    'tools',
    'lead-studio',
    'segmentation',
    'campaigns',
    'drip-campaigns',
    'automations',
    'templates',
    'channel-whatsapp',
    'channel-instagram',
    'channel-messenger',
    'channel-line',
    'channels',
    'meta-api',
    'shopify',
    'zoho',
    'api',
    'apps',
  ];

  const NAV_SECTIONS = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, hasArrow: false, hasDot: false },
        { id: 'inbox', label: 'Inbox', icon: Mail, hasArrow: true, hasDot: false },
        { id: 'leads', label: 'Leads', icon: UserCheck, hasArrow: false, hasDot: false },
        { id: 'insights', label: 'Insights', icon: BarChart3, hasArrow: false, hasDot: true },
        { id: 'files', label: 'Files', icon: Folder, hasArrow: false, hasDot: false },
      ],
    },
    {
      title: 'AI',
      items: [
        { id: 'ai-assistants', label: 'AI Assistants', icon: Bot, hasArrow: false, hasDot: false },
        { id: 'tools', label: 'Tools', icon: Wrench, hasArrow: false, hasDot: false },
        { id: 'lead-studio', label: 'Lead Studio', icon: Target, hasArrow: false, hasDot: true },
        { id: 'segmentation', label: 'Segmentation', icon: GitFork, hasArrow: false, hasDot: false },
      ],
    },
    {
      title: 'ENGAGEMENT',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone, hasArrow: false, hasDot: false },
        { id: 'drip-campaigns', label: 'Drip Campaigns', icon: GitBranch, hasArrow: false, hasDot: false },
        { id: 'automations', label: 'Automations', icon: Percent, hasArrow: false, hasDot: false },
        { id: 'templates', label: 'Templates', icon: LayoutTemplate, hasArrow: false, hasDot: true },
      ],
    },
    {
      title: 'CHANNELS',
      items: [
        {
          id: 'channel-whatsapp',
          label: 'WhatsApp',
          customIcon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#475467]">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          ),
          dotColor: 'bg-[#22C55E]',
        },
        {
          id: 'channel-instagram',
          label: 'Instagram',
          customIcon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#475467]">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          ),
          dotColor: 'bg-[#E11D48]',
        },
        {
          id: 'channel-messenger',
          label: 'Messenger',
          customIcon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#475467]">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
          dotColor: 'bg-[#2563EB]',
        },
        {
          id: 'channel-line',
          label: 'LINE',
          customIcon: (
            <div className="w-3.5 h-3.5 rounded-full bg-[#98A2B3] text-white flex items-center justify-center font-bold text-[7px] shrink-0">
              L
            </div>
          ),
          dotColor: 'bg-[#98A2B3]',
        },
        { id: 'channels', label: 'All Channels', icon: Layers, hasArrow: false, hasDot: false },
      ],
    },
    {
      title: 'INTEGRATIONS',
      items: [
        { id: 'meta-api', label: 'Meta Cloud API', icon: Key, hasArrow: false, hasDot: true },
        { id: 'shopify', label: 'Shopify', icon: ShoppingBag, hasArrow: false, hasDot: false },
        { id: 'zoho', label: 'Zoho', icon: Puzzle, hasArrow: false, hasDot: false },
        { id: 'api', label: 'API', icon: Code, hasArrow: false, hasDot: false },
        { id: 'apps', label: 'Apps', icon: Grid, hasArrow: false, hasDot: false },
      ],
    },
    ...((currentUser?.isSuperAdmin || currentUser?.username?.toLowerCase() === 'admin')
      ? [
          {
            title: 'SUPER ADMIN',
            items: [
              { id: 'super-admin', label: 'Tenants & Users', icon: Users, hasArrow: false, hasDot: true },
            ],
          },
        ]
      : []),
    {
      title: 'ACCOUNT',
      items: [
        { id: 'team', label: 'Team Members', icon: Users, hasArrow: false, hasDot: false },
        { id: 'manage', label: 'Manage', icon: Settings, hasArrow: false, hasDot: false },
        { id: 'wallet', label: 'Wallet', icon: Wallet, hasArrow: false, hasDot: false },
        { id: 'plans', label: 'Plans', icon: Crown, hasArrow: false, hasDot: false, isUpgrade: true },
      ],
    },
  ];

  const visibleNavSections = NAV_SECTIONS.map((section) => {
    if (section.title === 'SUPER ADMIN') {
      if (impersonatedTenant || !isSuperAdmin) return null;
      return section;
    }
    const visibleItems = section.items.filter((item) => hasNavPermission(item.id));
    return {
      ...section,
      items: visibleItems,
    };
  }).filter(Boolean).filter((section) => section.items.length > 0);

  return (
    <aside
      className={`bg-white border-r border-[#EAECF0] hidden md:flex flex-col justify-between h-screen shrink-0 sticky top-0 font-sans transition-all duration-300 ease-in-out z-20 ${
        isSidebarCollapsed ? 'w-[76px]' : 'w-60'
      }`}
    >
      <div className="overflow-y-auto no-scrollbar">
        {/* Brand Top Header */}
        <div className={`h-16 flex items-center border-b border-[#F2F4F7] ${isSidebarCollapsed ? 'justify-between px-2.5' : 'justify-between px-4'}`}>
          {!isSidebarCollapsed ? (
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 min-w-0 cursor-pointer"
            >
              <img
                src="/wapppilot-logo.png"
                alt="WAPPPILOT"
                className="h-8 max-w-[155px] object-contain shrink-0"
              />
            </div>
          ) : (
            <div
              onClick={() => setActiveTab('dashboard')}
              className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-start shrink-0 cursor-pointer bg-blue-50/50 p-0.5"
              title="WAPPPILOT Dashboard"
            >
              <img
                src="/wapppilot-logo.png"
                alt="WAPPPILOT"
                className="h-7 max-w-none object-left"
              />
            </div>
          )}

          {/* Sidebar Collapse/Expand Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] hover:border-[#D0D5DD] flex items-center justify-center text-[#475467] hover:text-[#101828] transition-all shadow-2xs cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M9 3v18" />
              <path d="m14 9-3 3 3 3" />
            </svg>
          </button>
        </div>

        {/* User Workspace Box */}
        <div className="p-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center rounded-xl border border-[#EAECF0] bg-[#F9FAFB] hover:bg-[#F2F4F7] transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
            }`}
            title={currentUser?.organization || (currentUser?.name ? `${currentUser.name}'s Workspace` : 'Workspace')}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-[#EAECF0] uppercase shadow-2xs">
                {(effectiveUser?.name || effectiveUser?.username || 'W').charAt(0)}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#101828] truncate">
                      {effectiveUser?.name || effectiveUser?.username || 'Dhigrowth'}
                    </span>
                    {impersonatedTenant ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">VIEWING AS</span>
                    ) : (currentUser?.isSuperAdmin || currentUser?.username?.toLowerCase() === 'admin') ? (
                      <span className="text-xs" title="Super Administrator">👑</span>
                    ) : (currentUser?.role?.includes('Admin') || currentUser?.username === 'sri') ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-bold font-mono">ADMIN</span>
                    ) : null}
                  </div>
                  <div className="text-[10px] font-medium text-[#98A2B3] uppercase tracking-wider font-mono truncate max-w-[120px]">
                    {effectiveUser?.organization || (effectiveUser?.name ? `${effectiveUser.name} Workspace` : 'WORKSPACE')}
                  </div>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <ChevronsUpDown className="w-4 h-4 text-[#98A2B3] shrink-0" />
            )}
          </div>
        </div>

        {/* Empty Navigation State (When Super Admin has disabled all modules for this user) */}
        {visibleNavSections.length === 0 && (
          <div className={`my-6 text-center ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <div className="w-9 h-9 mx-auto rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-sm font-bold mb-2 shadow-2xs">
              🔒
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="text-xs font-bold text-[#101828]">All Modules Disabled</div>
                <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                  Feature access has been disabled in Super Admin settings.
                </p>
              </>
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <div className={`space-y-4 mt-1 pb-4 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {visibleNavSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider font-mono">
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isGated = !isSuperAdmin && !isPaidActive && GATED_FEATURE_IDS.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.isUpgrade) {
                          setIsUpgradeModalOpen(true);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      title={isSidebarCollapsed ? `${item.label}${isGated ? ' (Locked - Active Plan Required)' : ''}` : undefined}
                      className={`relative w-full flex items-center rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                        isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-[#F0F9FF] text-[#0284C7] font-semibold'
                          : 'text-[#475467] hover:text-[#101828] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.customIcon ? (
                          item.customIcon
                        ) : (
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#0284C7]' : 'text-[#667085] group-hover:text-[#344054]'
                            }`}
                          />
                        )}
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isGated ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] flex items-center gap-1 shadow-2xs">
                              <Lock className="w-2.5 h-2.5" />
                              <span>PRO</span>
                            </span>
                          ) : item.id === 'inbox' && totalUnreadCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[10px] font-bold font-mono shadow-xs animate-pulse">
                              {totalUnreadCount}
                            </span>
                          ) : (
                            <>
                              {item.dotColor && (
                                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                              )}
                              {item.hasDot && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                              )}
                              {item.hasArrow && (
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#98A2B3]" />
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {isSidebarCollapsed && isGated && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0284C7] rounded-full ring-1 ring-white" />
                      )}

                      {isSidebarCollapsed && !isGated && item.id === 'inbox' && totalUnreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#16A34A] rounded-full ring-2 ring-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Account & Logout */}
      <div className={`border-t border-[#F2F4F7] ${isSidebarCollapsed ? 'p-2' : 'p-3'} flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                {(currentUser?.name?.[0] || currentUser?.username?.[0] || 'S').toUpperCase()}
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#101828] truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#667085] truncate font-mono">
                  {currentUser?.role || 'Workspace Owner'}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {(currentUser?.name?.[0] || currentUser?.username?.[0] || 'S').toUpperCase()}
            </div>
          )}

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
            title="Sign Out / Lock Workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
    </aside>
  );
};
