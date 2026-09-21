import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  Plus,
  RotateCw,
  Search,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';

export const TeamMembersPage = () => {
  const { currentWorkspaceId, currentUser, showToast } = useApp();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/workspace/members?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
      } catch {}
      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/workspace/members?workspaceId=${encodeURIComponent(currentWorkspaceId)}`);
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.members) setMembers(data.members);
      }
    } catch (err) {
      console.warn('Load members error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentWorkspaceId]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      let res;
      const payload = {
        workspaceId: currentWorkspaceId,
        email: inviteEmail.trim(),
        fullName: inviteName.trim(),
        role: inviteRole,
      };

      try {
        res = await fetch(`${BACKEND_URL}/api/workspace/members/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/workspace/members/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        setMembers((prev) => [data.member, ...prev]);
        showToast(`Invited ${inviteName || inviteEmail} as ${inviteRole}!`, 'success');
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteName('');
      }
    } catch (err) {
      showToast('Invite error: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this workspace?`)) return;

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    try {
      await fetch(`${BACKEND_URL}/api/workspace/members/${memberId}?workspaceId=${encodeURIComponent(currentWorkspaceId)}`, {
        method: 'DELETE',
      });
      showToast(`Removed team member`, 'info');
    } catch (err) {
      console.warn(err);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'agent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
            <span>Settings</span>
            <span>&gt;</span>
            <span className="text-[#101828] font-semibold">Team Members</span>
          </div>
          <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1 flex items-center gap-2.5">
            <span>Team Members & Roles (RBAC)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#7C3AED] border border-[#E9D8FD]">
              {members.length} Members
            </span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage agents, sales reps, and admins with access to this workspace
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sendiee-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-[#101828]">Admin</span>
          </div>
          <p className="text-[11px] text-[#667085]">
            Full access to broadcast campaigns, automations, WhatsApp credentials, and billing.
          </p>
        </div>

        <div className="sendiee-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-[#101828]">Agent</span>
          </div>
          <p className="text-[11px] text-[#667085]">
            Handles live customer WhatsApp chats in Team Inbox and qualifies leads.
          </p>
        </div>

        <div className="sendiee-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-[#101828]">Viewer</span>
          </div>
          <p className="text-[11px] text-[#667085]">
            Read-only access to campaign analytics, contacts, and delivery reports.
          </p>
        </div>
      </div>

      {/* Search & Members List */}
      <div className="sendiee-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-9 pr-3.5 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <button
            onClick={loadMembers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] hover:bg-white text-xs font-medium text-[#475467] transition-all cursor-pointer shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#7C3AED]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAECF0] text-[#667085] uppercase text-[10px] font-mono">
                <th className="pb-3 font-bold">Team Member</th>
                <th className="pb-3 font-bold">Email</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Joined</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 font-bold text-[#101828] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FAF5FF] border border-[#E9D8FD] flex items-center justify-center font-bold text-xs text-[#7C3AED]">
                      {m.fullName[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{m.fullName}</span>
                  </td>
                  <td className="py-3.5 text-[#475467] font-mono">{m.email}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(m.role)}`}>
                      {m.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{m.status || 'Active'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-[#667085] font-mono text-[11px]">{m.joinedAt}</td>
                  <td className="py-3.5 text-right">
                    {m.role !== 'super_admin' && (
                      <button
                        onClick={() => handleRemoveMember(m.id, m.fullName)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF5FF] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Invite Team Member</h3>
                <p className="text-xs text-[#667085]">Grant access to this workspace</p>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="agent">Agent (Team Inbox & Contacts)</option>
                  <option value="admin">Admin (Full Workspace Management)</option>
                  <option value="viewer">Viewer (Read-Only Analytics)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>Send Workspace Invitation</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
