import React, { useState } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Users,
  LifeBuoy,
  Bell,
  CheckCircle2,
  Key,
  Sliders,
  Tag,
  Building,
  Upload,
  ChevronDown,
  Check,
  Lock,
  Smartphone,
  QrCode,
  X,
  UserPlus,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaApiSettings } from './MetaApiSettings';

export const OrganizationSettingsPage = () => {
  const { showToast, setActiveTab, credits, currentPlan, daysRemaining, setIsUpgradeModalOpen } = useApp();

  const [activeTabNav, setActiveTabNav] = useState('profile');

  // Profile Form
  const [orgName, setOrgName] = useState('sri');
  const [primaryEmail, setPrimaryEmail] = useState('srivaladeno@gmail.com');
  const [primaryPhone, setPrimaryPhone] = useState('9791471277');
  const [countryCode, setCountryCode] = useState('IN +91');
  const [description, setDescription] = useState('test');

  // Security State
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');

  // Members State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState([
    { name: 'Sri (Owner)', email: 'srivaladeno@gmail.com', role: 'Super Admin', status: 'Active' },
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Organization details updated successfully!', 'success');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    showToast('Account password updated successfully!', 'success');
  };

  const handleEnable2Fa = (e) => {
    e.preventDefault();
    if (!twoFaCode) return;
    setIs2FaEnabled(true);
    setIs2FaModalOpen(false);
    setTwoFaCode('');
    showToast('Two-factor authentication (2FA) enabled with Google Authenticator!', 'success');
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setMembers((prev) => [
      ...prev,
      { name: inviteEmail.split('@')[0], email: inviteEmail, role: 'Agent', status: 'Pending Invite' },
    ]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
    showToast(`Invitation link sent to ${inviteEmail}`, 'success');
  };

  const SETTINGS_NAV = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'meta_api', label: 'Meta WhatsApp API', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'support', label: 'Support Access', icon: LifeBuoy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'optin', label: 'Optin Management', icon: CheckCircle2 },
    { id: 'api_keys', label: 'API Keys', icon: Key },
    { id: 'attributes', label: 'Attributes', icon: Sliders },
    { id: 'tags', label: 'Tags', icon: Tag },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1">
          Settings
        </h1>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Navigation Menu (3 cols) */}
        <div className="lg:col-span-3 sendiee-card p-3 space-y-1">
          {SETTINGS_NAV.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeTabNav === nav.id;

            return (
              <button
                key={nav.id}
                onClick={() => {
                  if (nav.id === 'api_keys') {
                    setActiveTab('api');
                  } else {
                    setActiveTabNav(nav.id);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF5FF] text-[#7C3AED] font-bold border border-[#E9D8FD]'
                    : 'text-[#475467] hover:bg-[#F9FAFB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-[#667085]'}`} />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Main Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* =========================================================
              VIEW 1: PROFILE
          ========================================================= */}
          {activeTabNav === 'profile' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#101828]">Organization Profile</h2>
                <p className="text-xs text-[#667085]">
                  Manage your organization details, branding, and preferences.
                </p>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSaveProfile} className="sendiee-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#101828] flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#667085]" />
                      <span>Organization Details</span>
                    </h3>
                    <p className="text-xs text-[#667085]">Basic information about your organization</p>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>

                {/* Logo Upload Box */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center justify-center text-[#98A2B3]">
                    <Building className="w-8 h-8 text-[#98A2B3]" />
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => showToast('Opening logo file picker', 'info')}
                      className="px-3 py-1.5 rounded-xl border border-[#EAECF0] bg-[#FAF8F5] hover:bg-[#F2F4F7] text-xs font-semibold text-[#344054] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </button>
                    <p className="text-[11px] text-[#98A2B3]">
                      PNG, JPG up to 2MB. Recommended 200x200px.
                    </p>
                  </div>
                </div>

                {/* Field: Organization Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#344054]">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Grid Fields: Primary Email & Primary Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#344054]">Primary Email</label>
                      <span className="text-[10px] font-mono font-bold text-[#7C3AED] bg-[#FAF5FF] border border-[#E9D8FD] px-2 py-0.2 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 fill-[#7C3AED] text-white" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={primaryEmail}
                        onChange={(e) => setPrimaryEmail(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EAECF0] p-2.5 pr-8 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                      />
                      <CheckCircle2 className="w-4 h-4 fill-[#7C3AED] text-white absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#344054]">Primary Phone</label>
                    <div className="flex items-center bg-[#FAF8F5] border border-[#EAECF0] rounded-xl text-xs text-[#101828] focus-within:border-[#7C3AED]">
                      <div className="flex items-center gap-1 px-3 py-2 border-r border-[#EAECF0] text-xs font-semibold text-[#344054]">
                        <span>{countryCode}</span>
                        <ChevronDown className="w-3 h-3 text-[#98A2B3]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        className="bg-transparent flex-1 p-2.5 text-xs text-[#101828] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Field: Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#344054]">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED] resize-none"
                  />
                </div>

                <p className="text-[11px] text-[#667085]">
                  Notifications regarding organization activities will be sent to the primary email and phone.
                </p>
              </form>
            </div>
          )}

          {/* =========================================================
              VIEW: META WHATSAPP CLOUD API
          ========================================================= */}
          {activeTabNav === 'meta_api' && (
            <div>
              <MetaApiSettings />
            </div>
          )}

          {/* =========================================================
              VIEW 2: SECURITY (Matching exact latest user screenshot!)
          ========================================================= */}
          {activeTabNav === 'security' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#101828]">Security</h2>
                <p className="text-xs text-[#667085]">
                  Manage your account password, two-factor authentication, and trusted devices.
                </p>
              </div>

              {/* Card 1: Password */}
              <div className="sendiee-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                    <Key className="w-4 h-4 text-[#475467]" />
                    <span>Password</span>
                  </div>
                  <p className="text-xs text-[#667085]">
                    Change your account password.
                  </p>
                </div>

                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-[#FAF5EE] hover:bg-[#F2ECE2] border border-[#E8DFC8] text-[#475467] rounded-xl text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  Change password
                </button>
              </div>

              {/* Card 2: Two-factor authentication */}
              <div className="sendiee-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                    <Shield className="w-4 h-4 text-[#475467]" />
                    <span>Two-factor authentication</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      is2FaEnabled
                        ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                        : 'bg-[#F2F4F7] text-[#667085] border-[#EAECF0]'
                    }`}
                  >
                    {is2FaEnabled ? 'ENABLED' : 'NOT ENABLED'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#667085]">
                  <div className="font-medium text-[#344054]">
                    Add an extra layer of security to your sign-ins.
                  </div>
                  <div>
                    Use an authenticator app like Google Authenticator, Authy, or 1Password to generate 6-digit codes when you sign in.
                  </div>
                </div>

                <button
                  onClick={() => setIs2FaModalOpen(true)}
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                    is2FaEnabled ? 'bg-[#16A34A]' : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                  }`}
                >
                  {is2FaEnabled ? '2FA Active (Google Authenticator ✓)' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: BILLING
          ========================================================= */}
          {activeTabNav === 'billing' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#101828]">Billing & Subscription</h2>
                <p className="text-xs text-[#667085]">
                  Manage active plans, credit top-ups, and invoice receipts.
                </p>
              </div>

              <div className="sendiee-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-[#667085]">Current Subscription</div>
                    <div className="text-lg font-bold text-[#7C3AED]">{currentPlan}</div>
                  </div>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Upgrade Plan
                  </button>
                </div>

                <div className="pt-4 border-t border-[#EAECF0] flex justify-between items-center text-xs text-[#667085]">
                  <span>Wallet Balance: <strong className="text-[#101828] font-mono">${credits.toFixed(2)}</strong></span>
                  <span>Free Trial Days Remaining: <strong className="text-[#101828] font-mono">{daysRemaining}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: MEMBERS
          ========================================================= */}
          {activeTabNav === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#101828]">Team Members</h2>
                  <p className="text-xs text-[#667085]">Invite agents to manage shared team inbox</p>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Member</span>
                </button>
              </div>

              <div className="sendiee-card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] border-b border-[#EAECF0] text-[#667085] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-4">Member</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {members.map((m) => (
                      <tr key={m.email} className="hover:bg-[#F9FAFB]">
                        <td className="p-4">
                          <div className="font-bold text-[#101828]">{m.name}</div>
                          <div className="text-[10px] text-[#667085] font-mono">{m.email}</div>
                        </td>
                        <td className="p-4 font-mono font-semibold">{m.role}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A]">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5-10: OTHER SETTINGS (Support, Notifications, Optin, Attributes, Tags)
          ========================================================= */}
          {['support', 'notifications', 'optin', 'attributes', 'tags'].includes(activeTabNav) && (
            <div className="sendiee-card p-8 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] mx-auto">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#101828] capitalize">
                {activeTabNav} Configuration
              </h3>
              <p className="text-xs text-[#667085] max-w-sm mx-auto">
                All settings for {activeTabNav} are active and synchronized across your Dhigrowth CRM workspace.
              </p>
              <button
                onClick={() => showToast('Preferences saved', 'success')}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Change Account Password</h3>
                <p className="text-xs text-[#667085]">Ensure high entropy password security</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enable 2FA Modal */}
      {is2FaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIs2FaModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Setup Two-Factor Authentication</h3>
                <p className="text-xs text-[#667085]">Scan with Google Authenticator or Authy</p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#EAECF0] rounded-2xl flex flex-col items-center justify-center space-y-2">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-[#EAECF0] flex items-center justify-center">
                <QrCode className="w-24 h-24 text-[#101828]" />
              </div>
              <div className="text-[10px] font-mono text-[#667085]">Secret: DHIGROWTH-2FA-AUTH-KEY-884</div>
            </div>

            <form onSubmit={handleEnable2Fa} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Enter 6-Digit Authenticator Code</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  maxLength={6}
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-center text-sm font-mono tracking-widest text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Verify & Activate 2FA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Invite Agent to Workspace</h3>
                <p className="text-xs text-[#667085]">Grant team inbox & lead access</p>
              </div>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Teammate Email</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@dhigrowth.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] p-2.5 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Send Invite Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
