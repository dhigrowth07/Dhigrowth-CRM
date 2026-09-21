import React from 'react';
import { Search, Percent, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header = () => {
  const {
    credits,
    activeTab,
    setActiveTab,
    setIsSearchOpen,
    setIsUpgradeModalOpen,
    setIsUsageModalOpen,
    isWorkspaceDropdownOpen,
    setIsWorkspaceDropdownOpen,
    showToast,
    currentUser,
    logout,
    adminViewProfile,
    switchAdminProfile,
    clientViewMode,
    toggleClientViewMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'inbox': return 'Inbox';
      case 'leads': return 'Leads';
      case 'insights': return 'Insights';
      case 'files': return 'Files';
      case 'ai-assistants': return 'AI Assistants';
      case 'tools': return 'Tools';
      case 'lead-studio': return 'Lead Studio';
      case 'segmentation': return 'Segmentation';
      case 'campaigns': return 'Campaign Manager';
      case 'drip-campaigns': return 'Drip Campaigns';
      case 'automations': return 'Automations';
      case 'templates': return 'Templates';
      case 'meta-api':
      case 'meta_api':
      case 'meta-settings':
        return 'Meta WhatsApp API Settings';
      case 'channel-whatsapp':
      case 'whatsapp':
        return 'WhatsApp Official Cloud API';
      case 'channel-instagram':
      case 'instagram':
        return 'Instagram Direct Messaging';
      case 'channel-messenger':
      case 'messenger':
        return 'Facebook Messenger Channel';
      case 'channel-line':
      case 'line':
        return 'LINE Official Channel';
      case 'channels': return 'Connected Communication Channels';
      case 'shopify': return 'Shopify CAPI Webhooks';
      case 'zoho': return 'Zoho CRM Sync';
      case 'api': return 'REST Webhooks & Developers';
      case 'apps':
      case 'integrations':
        return 'Integrations Hub';
      case 'wallet': return 'Credits & Billing Wallet';
      case 'settings':
      case 'manage':
        return 'Organization Settings';
      case 'plans': return 'Subscription Plans';
      case 'usage':
      case 'team':
      case 'team-members':
        return 'Team Members & Roles';
      default: return 'Dashboard';
    }
  };

  const isKiki = currentUser?.username?.toLowerCase() === 'kiki';
  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'Super Administrator' ||
    currentUser?.username?.toLowerCase() === 'admin'
  );
  const isAdmin = isSuperAdmin;

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[#EAECF0] px-3 md:px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#475467] hover:bg-[#F2F4F7] active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5 text-[#101828]" />
        </button>

        <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#101828] font-sans truncate">
          {getTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* BYOK Client Suite Switcher Pill (For Kiki or Admin viewing Kiki) */}
        {(isKiki || (isAdmin && adminViewProfile === 'kiki')) && (
          <button
            type="button"
            onClick={() => toggleClientViewMode('portal')}
            className="hidden sm:flex px-2.5 py-1 rounded-xl bg-[#F4F0FD] hover:bg-[#EDE5FA] border border-[#E9D8FD] text-[#7C3AED] text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch to BYOK Client Suite (Own Meta API Keys & Rules)"
          >
            <span>⚡ BYOK Suite</span>
          </button>
        )}

        {/* Search Bar with Ctrl+K trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center justify-center sm:justify-start bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] rounded-xl px-2 sm:px-3.5 py-1.5 w-9 sm:w-48 md:w-60 text-left cursor-pointer transition-colors"
          title="Search dashboard"
        >
          <Search className="w-4 h-4 text-[#98A2B3] sm:mr-2 shrink-0" />
          <span className="hidden sm:inline w-full text-xs text-[#98A2B3] truncate">Search...</span>
          <span className="text-[11px] font-mono text-[#98A2B3] bg-white border border-[#EAECF0] px-1.5 py-0.5 rounded shadow-2xs shrink-0 hidden md:inline">
            ctrl K
          </span>
        </button>

        {/* Credits Badge */}
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-1 sm:gap-1.5 bg-[#F9F5FF] hover:bg-[#F4F0FD] border border-[#E9D8FD] px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-[#6941C6] cursor-pointer transition-colors shrink-0"
          title="Click to manage credits and wallet"
        >
          <div className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
            $
          </div>
          <span className="font-mono tracking-tight font-bold text-[11px] sm:text-xs">
            ${credits.toFixed(2)}<span className="hidden sm:inline"> CREDITS</span>
          </span>
        </button>

        {/* User Workspace Pill */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="flex items-center gap-2 bg-white hover:bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
              {(currentUser?.name?.[0] || currentUser?.username?.[0] || 'S').toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#344054]">
              {currentUser?.name || currentUser?.username || 'Sri'}
            </span>
            {isSuperAdmin ? (
              <span className="text-xs" title="Super Administrator">👑</span>
            ) : (currentUser?.role?.includes('Admin') || currentUser?.username === 'sri') ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold font-mono">ADMIN</span>
            ) : null}
            <ChevronDown className="w-3.5 h-3.5 text-[#98A2B3]" />
          </button>

          {isWorkspaceDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#EAECF0] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in">
              <div className="px-3 py-2 border-b border-[#F2F4F7]">
                <div className="text-xs font-bold text-[#101828]">
                  {currentUser?.organization || (currentUser?.name ? `${currentUser.name}'s Workspace` : "Workspace")}
                </div>
                <div className="text-[10px] text-[#667085] font-mono">
                  {currentUser?.email || 'support@dhigrowth.com'}
                </div>
                <div className="mt-1 inline-block px-1.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[9px] font-bold font-mono">
                  {currentUser?.role || 'Workspace Owner'}
                </div>
              </div>

              {/* Quick Profile / User Switcher (Super Admin Only) */}
              {isSuperAdmin && (
                <div className="p-2 bg-[#FAF8FF] border border-[#E9D8FD] rounded-xl my-1">
                  <div className="text-[10px] font-bold text-[#6941C6] uppercase font-mono mb-1 px-1">
                    Switch Workspace User:
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        switchAdminProfile('sri');
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className={`py-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        adminViewProfile === 'sri'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-white text-[#475467] border border-[#EAECF0] hover:bg-[#F2F4F7]'
                      }`}
                    >
                      Sri (CRM)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchAdminProfile('kiki');
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className={`py-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        adminViewProfile === 'kiki'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-white text-[#475467] border border-[#EAECF0] hover:bg-[#F2F4F7]'
                      }`}
                    >
                      Kiki (Client)
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveTab('meta-api');
                  setIsWorkspaceDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#344054] hover:bg-[#F4F0FD] hover:text-[#7C3AED] rounded-xl font-medium cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>Meta WhatsApp API</span>
                <span className="text-[9px] bg-[#F4F0FD] text-[#7C3AED] px-1.5 py-0.5 rounded font-mono font-bold border border-[#E9D8FD]">API</span>
              </button>

              {!isKiki && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('usage');
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#344054] hover:bg-[#F4F0FD] hover:text-[#7C3AED] rounded-xl font-medium cursor-pointer transition-colors"
                  >
                    Usage & Limits
                  </button>

                  <button
                    onClick={() => {
                      setIsUpgradeModalOpen(true);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#344054] hover:bg-[#F4F0FD] hover:text-[#7C3AED] rounded-xl font-medium cursor-pointer transition-colors"
                  >
                    Subscription & Plans
                  </button>
                </>
              )}

              <div className="pt-1 border-t border-[#F2F4F7]">
                <button
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl font-bold cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Initial Circle */}
        <button
          onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
          className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer transition-colors"
          title="Account Menu"
        >
          {(currentUser?.name?.[0] || currentUser?.username?.[0] || 'S').toUpperCase()}
        </button>
      </div>
    </header>
  );
};
