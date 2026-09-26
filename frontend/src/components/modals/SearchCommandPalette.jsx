import React, { useState } from 'react';
import { Search, X, LayoutGrid, Mail, UserCheck, Bot, Megaphone, Target, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';

export const SearchCommandPalette = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveTab, chats, campaigns } = useApp();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const NAV_RESULTS = [
    { id: 'dashboard', label: 'Dashboard Overview', category: 'Navigation', icon: LayoutGrid },
    { id: 'inbox', label: 'Shared Team Inbox', category: 'Navigation', icon: Mail },
    { id: 'leads', label: 'Leads CRM', category: 'Navigation', icon: UserCheck },
    { id: 'ai-assistants', label: 'AI Assistants & Prompts', category: 'AI Tools', icon: Bot },
    { id: 'campaigns', label: 'Broadcast Campaigns', category: 'Engagement', icon: Megaphone },
    { id: 'lead-studio', label: 'Lead Studio & Tags', category: 'AI Tools', icon: Target },
  ];

  const filteredNav = NAV_RESULTS.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredChats = chats.filter((c) =>
    c.contactName.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  );

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-2xl max-w-xl w-full p-4 shadow-2xl relative space-y-3">
        {/* Search Input */}
        <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-[#98A2B3] mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search contact, or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-[11px] font-mono text-[#98A2B3] bg-white border border-[#EAECF0] px-1.5 py-0.5 rounded ml-2"
          >
            ESC
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-[#F2F4F7]">
          {filteredNav.length > 0 && (
            <div className="space-y-1 pb-2">
              <div className="text-[10px] font-bold text-[#98A2B3] uppercase px-3 py-1 font-mono">
                Pages & Workspaces
              </div>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#344054] hover:bg-[#F4F0FD] hover:text-[#7C3AED] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#667085]" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-[#98A2B3] font-mono">{item.category}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredChats.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="text-[10px] font-bold text-[#98A2B3] uppercase px-3 py-1 font-mono">
                Contacts ({filteredChats.length})
              </div>
              {filteredChats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect('inbox')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#344054] hover:bg-[#F4F0FD] hover:text-[#7C3AED] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ContactAvatar name={c.contactName} size="sm" />
                    <div>
                      <span className="font-semibold text-[#101828]">{c.contactName}</span>
                      <span className="text-[10px] text-[#667085] ml-2 font-mono">{c.phone}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2F4F7] text-[#475467]">
                    {c.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
