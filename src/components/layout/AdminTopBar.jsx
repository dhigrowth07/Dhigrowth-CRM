import React from 'react';
import { LogOut, Users, Eye, ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminTopBar = () => {
  const { logout, setActiveTab, impersonatedTenant, exitViewAs, ALL_PERMISSION_KEYS } = useApp();

  if (impersonatedTenant) {
    const perms = impersonatedTenant.permissions || {};
    const activeCount = (ALL_PERMISSION_KEYS || []).filter((k) => {
      if (k === 'inbox') {
        return perms['inbox'] !== false && perms['team_inbox'] !== false && perms['teamInbox'] !== false;
      }
      if (k === 'leads') {
        return perms['leads'] !== false && perms['crm_leads'] !== false;
      }
      if (k === 'ai-assistants') {
        return perms['ai-assistants'] !== false && perms['ai_studio'] !== false && perms['aiStudio'] !== false;
      }
      if (k === 'meta-api') {
        return perms['meta-api'] !== false && perms['meta_api'] !== false && perms['metaKeys'] !== false;
      }
      if (k === 'send_due_all') {
        return perms['send_due_all'] !== false && perms['sendDueToAll'] !== false;
      }
      return perms[k] !== false;
    }).length;

    return (
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-md font-sans border-b border-sky-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-sky-300" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-bold text-white">
              Viewing Workspace: <span className="text-sky-300 font-extrabold">{impersonatedTenant.name || impersonatedTenant.username}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-800/80 text-sky-200 border border-sky-600/50 font-mono hidden sm:inline">
              {activeCount} / {ALL_PERMISSION_KEYS?.length || 28} Active Modules
            </span>
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              (Sidebar navigation & routes strictly reflect this tenant's permissions)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('super-admin')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-900/90 hover:bg-sky-800 text-sky-100 border border-sky-700/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Configure Permissions for Tenants"
          >
            <Shield className="w-3.5 h-3.5 text-sky-300" />
            <span>Manage Permissions</span>
          </button>
          <button
            type="button"
            onClick={exitViewAs}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-sky-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Exit View As and return to full Super Administrator view"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-900" />
            <span>Exit View As</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#101828] px-4 lg:px-8 py-2 border-b border-[#EAECF0] flex items-center justify-end gap-3 sticky top-0 z-50 shadow-2xs font-sans">
      <button
        type="button"
        onClick={() => setActiveTab('super-admin')}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shadow-2xs"
        title="Open Tenant Directory"
      >
        <Users className="w-4 h-4" />
        <span>Tenant Directory</span>
      </button>

      <div className="h-4 w-px bg-[#EAECF0]" />

      <button
        type="button"
        onClick={logout}
        className="p-1.5 rounded-lg text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
        title="Sign Out of Admin Session"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
