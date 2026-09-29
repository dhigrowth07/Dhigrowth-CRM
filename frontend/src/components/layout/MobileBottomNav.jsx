import React from 'react';
import {
  LayoutGrid,
  Mail,
  Bot,
  Wallet,
  Menu,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav = () => {
  const {
    activeTab,
    activeChatId,
    setActiveTab,
    credits,
    totalUnreadCount,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    hasNavPermission,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutGrid,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Mail,
      badge: totalUnreadCount > 0 ? totalUnreadCount : null,
    },
    {
      id: 'campaigns',
      label: 'Broadcasts',
      icon: Megaphone,
    },
    {
      id: 'wallet',
      label: `$${credits.toFixed(0)}`,
      icon: Wallet,
      isWallet: true,
    },
    {
      id: 'more',
      label: 'Menu',
      icon: Menu,
      isMenuToggle: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.isMenuToggle || hasNavPermission(item.id));

  return (
    <nav
      aria-label="Mobile Bottom Thumb Navigation"
      className={`fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAECF0] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none ${activeTab === 'inbox' && activeChatId ? 'hidden' : 'block'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="grid h-16 items-center px-1"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, visibleNavItems.length)}, minmax(0, 1fr))` }}
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isMenuToggle ? isMobileMenuOpen : activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isMenuToggle) {
                  setIsMobileMenuOpen((prev) => !prev);
                } else {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }
              }}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1.5 transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive ? 'text-[#0284C7]' : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              {/* Active thumb indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 bg-[#0284C7] rounded-full" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#0284C7] stroke-[2.5]' : 'stroke-2'
                  }`}
                />

                {/* Badge for unread chats */}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white font-bold text-[9px] flex items-center justify-center font-mono shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Live dot for wallet */}
                {item.isWallet && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#10B981] border border-white" />
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium truncate max-w-[56px] leading-tight ${
                  isActive ? 'font-bold text-[#0284C7]' : 'text-[#667085]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
