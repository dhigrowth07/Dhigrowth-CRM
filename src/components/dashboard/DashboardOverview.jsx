import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  Zap,
  Gift,
  ArrowRight,
  MessageSquare,
  DollarSign,
  Users,
  ArrowUpRight,
  ChevronDown,
  Bot,
  UserPlus,
  CreditCard,
  Send,
  BarChart3,
  LayoutTemplate,
  Wrench,
  BookOpen,
  Video,
  HelpCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Target,
  Sparkles,
  Link2,
  Cpu,
  Key,
  User,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardOverview = () => {
  const {
    currentUser,
    credits,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    hasClaimedBonus,
    claimBonus,
    currentPlan,
    daysRemaining,
    subscription,
    openCheckout,
    refreshSubscription,
    setSubscriptionStatus,
    metrics,
    channels,
    connectChannel,
    disconnectChannel,
    showToast,
    setActiveTab,
    setIsUpgradeModalOpen,
    setIsUsageModalOpen,
    setIsWidgetOpen,
    setIsBroadcastDueModalOpen,
    adminViewProfile,
    switchAdminProfile,
    userPermissions,
    updateUserPermission,
    isSuperAdmin,
  } = useApp();

  const [activeChannelToConnect, setActiveChannelToConnect] = useState(null);
  const [connectInput, setConnectInput] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleOpenConnect = (channelKey) => {
    setActiveChannelToConnect(channelKey);
    setConnectInput(
      channelKey === 'whatsapp'
        ? '+91 97914 71277'
        : channelKey === 'instagram'
        ? '@dhigrowth_crm'
        : 'Apex Retail Facebook Page ID: 884920'
    );
  };

  const handleSubmitConnect = (e) => {
    e.preventDefault();
    if (!connectInput.trim()) return;
    connectChannel(activeChannelToConnect, `Connected: ${connectInput}`);
    setActiveChannelToConnect(null);
  };

  const handleInviteTeam = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    showToast(`Team invitation sent to ${inviteEmail}!`, 'success');
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const isPaidActive = Boolean(isSuperAdmin) || subscription?.status === 'active';
  const activePlanName = isSuperAdmin ? 'Super Admin (Lifetime Free)' : (subscription?.planName || currentPlan || 'Business');

  // Calculate dynamic days remaining, end dates, start dates and gauge percentage
  const { calculatedDays, periodEndDateStr, periodEndTimeStr, gaugePercent, billingCycleStr, startDateStr } = React.useMemo(() => {
    let days = daysRemaining || 6;
    let endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    let startDate = new Date(Date.now() - (14 - days) * 24 * 60 * 60 * 1000);

    if (subscription?.currentPeriodEnd) {
      const end = new Date(subscription.currentPeriodEnd).getTime();
      const now = Date.now();
      days = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      endDate = new Date(subscription.currentPeriodEnd);
    }
    if (subscription?.currentPeriodStart) {
      startDate = new Date(subscription.currentPeriodStart);
    }

    const totalPeriodDays = subscription?.billingCycle === 'yearly' ? 365 : (isPaidActive ? 30 : 14);
    const pct = Math.min(100, Math.max(5, Math.round((days / totalPeriodDays) * 100)));

    const endStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const endHour = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const startStr = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const cycle = isPaidActive
      ? (subscription?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly')
      : 'Trial';

    return {
      calculatedDays: days,
      periodEndDateStr: endStr,
      periodEndTimeStr: endHour,
      gaugePercent: pct,
      billingCycleStr: cycle,
      startDateStr: startStr,
    };
  }, [subscription, daysRemaining, isPaidActive]);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans relative">
      {/* 1. Breadcrumb */}
      <div className="text-xs font-medium text-[#667085]">
        Dashboard
      </div>

      {/* 2. Main Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
          Good morning, {currentUser?.name || 'there'} 👋
        </h1>
        <p className="text-xs lg:text-sm text-[#475467]">
          Here's your {currentUser?.organization || 'workspace'} at a glance.
        </p>
      </div>

      {/* 3. Subscription Card matching exact screenshot */}
      <div className="sendiee-card p-6 space-y-6 hover-lift">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
              <span>SUBSCRIPTION</span>
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-[#101828]">
                {activePlanName}
              </h2>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  👑 Free Platform Owner Pass
                </span>
              ) : isPaidActive ? (
                <span className="inline-flex items-center gap-1 bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  Active plan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#F4F0FD] border border-[#E9D8FD] text-[#7C3AED] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                  Free trial
                </span>
              )}
            </div>

            <p className="text-xs text-[#667085]">
              {isSuperAdmin ? (
                <>👑 Permanent free access · <strong className="text-[#101828]">No subscription required for Super Admin</strong></>
              ) : isPaidActive ? (
                <>Active subscription · Renews <strong className="text-[#101828]">{periodEndDateStr} at {periodEndTimeStr}</strong></>
              ) : (
                <>Free trial · Ends <strong className="text-[#101828]">{periodEndDateStr} at {periodEndTimeStr}</strong></>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('usage')}
              className="px-4 py-2 bg-white hover:bg-[#F9FAFB] border border-[#EAECF0] text-xs font-semibold text-[#344054] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>View usage</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#667085]" />
            </button>
            {isSuperAdmin ? (
              <button
                onClick={() => setActiveTab('admin-tenants')}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Manage Tenants</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            ) : (
              <button
                onClick={() => openCheckout ? openCheckout(activePlanName, isPaidActive ? (subscription?.billingCycle || 'monthly') : 'monthly', 'razorpay') : setIsUpgradeModalOpen(true)}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer hover:scale-[1.02] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>{isPaidActive ? 'Manage plan' : 'Upgrade'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Item Metric Row (Hidden for Super Admin alone) */}
        {!isSuperAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Item 1: Circular Days Left Gauge */}
            <div
              onClick={() => openCheckout ? openCheckout(activePlanName, isPaidActive ? (subscription?.billingCycle || 'monthly') : 'monthly', 'razorpay') : setIsUpgradeModalOpen(true)}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center justify-center cursor-pointer hover:border-[#D0D5DD] transition-colors"
              title="Click to manage subscription"
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E9D8FD]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isPaidActive ? "text-[#16A34A]" : "text-[#7C3AED]"}
                    strokeDasharray={`${gaugePercent}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-[#101828] leading-none">{calculatedDays}</span>
                  <span className="text-[8px] font-bold text-[#667085] tracking-tight uppercase mt-0.5">DAYS LEFT</span>
                </div>
              </div>
            </div>

            {/* Item 2: Trial Ends / Renewal Date */}
            <div
              onClick={() => setActiveTab('wallet')}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center gap-3.5 cursor-pointer hover:border-[#D0D5DD] transition-colors"
              title="View billing & invoices"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#7C3AED] shrink-0 shadow-2xs">
                <Calendar className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                  {isPaidActive ? 'RENEWS ON' : 'TRIAL ENDS'}
                </div>
                <div className="text-sm font-bold text-[#101828] mt-0.5">
                  {periodEndDateStr}
                </div>
                <div className="text-[11px] text-[#667085]">
                  {periodEndTimeStr} · local time
                </div>
              </div>
            </div>

            {/* Item 3: Billing */}
            <div
              onClick={() => setActiveTab('wallet')}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center gap-3.5 cursor-pointer hover:border-[#D0D5DD] transition-colors"
              title="View payment history"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#7C3AED] shrink-0 shadow-2xs">
                <Calendar className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                  BILLING
                </div>
                <div className="text-sm font-bold text-[#101828] mt-0.5">
                  {billingCycleStr}
                </div>
                <div className="text-[11px] text-[#667085]">
                  Started {startDateStr}
                </div>
              </div>
            </div>

            {/* Item 4: Auto-Pay */}
            <div
              onClick={() => {
                if (isPaidActive) {
                  showToast('Automatic payment active via ' + (subscription?.provider === 'stripe' ? 'Stripe' : 'Razorpay'), 'info');
                } else {
                  openCheckout ? openCheckout(activePlanName, 'monthly', 'razorpay') : setIsUpgradeModalOpen(true);
                }
              }}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center gap-3.5 cursor-pointer hover:border-[#D0D5DD] transition-colors group"
              title={isPaidActive ? "Auto-renewal is active" : "Click to upgrade and enable auto-pay"}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#7C3AED] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                  AUTO-PAY
                </div>
                <div className={`text-sm font-bold mt-0.5 ${isPaidActive ? 'text-[#16A34A]' : 'text-[#101828]'}`}>
                  {isPaidActive ? 'Active' : 'Off'}
                </div>
                <div className="text-[11px] text-[#667085]">
                  {isPaidActive ? `Billed via ${subscription?.provider === 'stripe' ? 'Stripe' : 'Razorpay'}` : 'Enable when you upgrade'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Paywall Gating Notice & Quick Toggle (Hidden for Super Admin alone) */}
        {!isSuperAdmin && (
          <div className="pt-2 border-t border-[#F2F4F7]">
            {!isPaidActive ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#FFF9EB] border border-[#FEEFC6] rounded-2xl text-xs text-[#B54708]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>
                    <strong>Features Paywalled:</strong> Mass Broadcasts, Sequences, Automations, AI Studio, Function Tools, Lead Studio, and Segmentation are locked. Subscribe to unlock all features.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => openCheckout('Growth', 'monthly', 'razorpay')}
                    className="px-3 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-2xs text-[11px] cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                  {typeof setSubscriptionStatus === 'function' && (
                    <button
                      onClick={() => setSubscriptionStatus('active')}
                      className="px-2 py-1 bg-white hover:bg-[#FEF08A] text-[#78350F] border border-[#FDE047] font-bold rounded-xl text-[10px] cursor-pointer"
                      title="Developer toggle: simulate active subscription"
                    >
                      ⚡ Test Unlock
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl text-xs text-[#166534]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>
                    <strong>All SaaS Features Unlocked:</strong> Active <span className="font-bold uppercase font-mono">{activePlanName}</span> subscription is live. All broadcasting, automations, and AI tools active.
                  </span>
                </div>
                {typeof setSubscriptionStatus === 'function' && (
                  <button
                    onClick={() => setSubscriptionStatus('trialing')}
                    className="px-2 py-1 bg-white hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-bold rounded-xl text-[10px] cursor-pointer shrink-0 self-end sm:self-auto"
                    title="Developer toggle: simulate unsubscribed state to test paywall"
                  >
                    🔒 Test Lock
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Plan Banner */}
      <div className="sendiee-banner-purple p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover-lift">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#101828]">
              {isPaidActive ? (
                <>Active <span className="text-[#7C3AED]">{activePlanName}</span> Plan</>
              ) : (
                <>You've unlocked the <span className="text-[#7C3AED]">{activePlanName}</span> plan</>
              )}
            </h3>
            <p className="text-xs text-[#475467]">
              {isPaidActive ? (
                <>Your subscription is active — <strong>{calculatedDays} days until next renewal</strong>. All AI token models & Meta Cloud features unlocked.</>
              ) : (
                <>Your free trial is active — <strong>{calculatedDays} days left</strong>. Upgrade anytime to keep these features.</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => openCheckout ? openCheckout(activePlanName, isPaidActive ? (subscription?.billingCycle || 'monthly') : 'monthly', 'razorpay') : setIsUpgradeModalOpen(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 self-start md:self-auto transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
        >
          <span>{isPaidActive ? 'Manage Subscription' : 'Upgrade'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Claim $5 Launch Credit Banner */}
      <div className="sendiee-banner-claim p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover-lift">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#101828]">
              Claim your <span className="text-[#7C3AED]">$5 launch credit</span>
            </h3>
            <p className="text-xs text-[#475467]">
              On us, to get you started. Add your phone to claim it to your wallet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Phone Input Box */}
          <div className="flex items-center bg-[#FAF8F5] border border-[#E9E4DF] rounded-xl px-3 py-1.5 text-xs text-[#101828] focus-within:border-[#7C3AED] shadow-2xs">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#344054] pr-2 border-r border-[#E5E0D8]">
              <span>{countryCode}</span>
              <ChevronDown className="w-3 h-3 text-[#98A2B3]" />
            </div>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-transparent pl-3 pr-1 py-0.5 text-xs font-medium text-[#101828] focus:outline-none w-28 lg:w-32"
              placeholder="Phone number"
            />
          </div>

          <button
            onClick={claimBonus}
            disabled={hasClaimedBonus}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
              hasClaimedBonus
                ? 'bg-[#16A34A] cursor-default'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] hover:scale-[1.02]'
            }`}
          >
            {hasClaimedBonus ? 'Claimed ($5.00 ✓)' : 'Claim $5'}
          </button>
        </div>
      </div>

      {/* 6. Three Metric Cards Row with Hover Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Messages Handled */}
        <div
          onClick={() => setActiveTab('inbox')}
          className="sendiee-card p-5 flex items-center justify-between cursor-pointer hover-lift group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#101828] leading-none">
                {metrics.messagesHandled || 0}
              </div>
              <div className="text-xs text-[#667085] mt-1 font-medium">Messages handled</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Card 2: AI spend (30d) */}
        <div
          onClick={() => setIsUsageModalOpen(true)}
          className="sendiee-card p-5 flex items-center justify-between cursor-pointer hover-lift group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#101828] leading-none">
                ${metrics.aiSpend30d.toFixed(2)}
              </div>
              <div className="text-xs text-[#667085] mt-1 font-medium">AI spend (30d)</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Card 3: Total Leads */}
        <div
          onClick={() => setActiveTab('leads')}
          className="sendiee-card p-5 flex items-center justify-between cursor-pointer hover-lift group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#101828] leading-none">
                {metrics.totalLeads || 0}
              </div>
              <div className="text-xs text-[#667085] mt-1 font-medium">Total Leads</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      {/* 7. Middle Row: Finish Setting Up (Left) + Channels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Finish setting up (Matching exact user hover screenshot!) */}
        <div className="sendiee-card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#101828]">Finish setting up</h2>
            <p className="text-xs text-[#667085] mt-0.5">
              A few steps to get the most out of Dhigrowth
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Action: Broadcast Payment Due Invoices */}
            <div
              onClick={() => {
                setActiveTab('inbox');
                setIsBroadcastDueModalOpen(true);
              }}
              className="p-3.5 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white icon-box transition-colors shadow-2xs">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828] flex items-center gap-1.5">
                    <span>Send Payment Due PDFs to All Contacts</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      Auto-Receipt
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085]">Dispatches Due PDF & pay link; auto-sends Paid Receipt on payment</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C3AED] arrow-icon transition-all" />
            </div>

            {/* Step 1: Connect a channel */}
            <div
              onClick={() => setActiveTab('channels')}
              className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">Connect a channel</div>
                  <div className="text-[11px] text-[#667085]">Link WhatsApp, Instagram or Messenger</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3] arrow-icon transition-all" />
            </div>

            {/* Step 2: Set up your AI assistant */}
            <div
              onClick={() => setActiveTab('ai-assistants')}
              className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                  <Cpu className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">Set up your AI assistant</div>
                  <div className="text-[11px] text-[#667085]">Configure how your bot replies</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3] arrow-icon transition-all" />
            </div>

            {/* Step 3: Add your contacts (Hovered state matching screenshot) */}
            <div
              onClick={() => setActiveTab('leads')}
              className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                  <Users className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">Add your contacts</div>
                  <div className="text-[11px] text-[#667085]">Import or create your audience</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3] arrow-icon transition-all" />
            </div>

            {/* Step 4: Invite your team */}
            <div
              onClick={() => setIsInviteModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                  <UserPlus className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">Invite your team</div>
                  <div className="text-[11px] text-[#667085]">Add agents to your shared inbox</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3] arrow-icon transition-all" />
            </div>

            {/* Step 5: Choose a plan */}
            <div
              onClick={() => setIsUpgradeModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D8FD] flex items-center justify-between cursor-pointer hover-item-card group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                  <CreditCard className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#101828]">Choose a plan</div>
                  <div className="text-[11px] text-[#667085]">Unlock more channels, assistants & tools</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C3AED] arrow-icon transition-all" />
            </div>
          </div>
        </div>

        {/* Right Card: Channels */}
        <div className="sendiee-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#101828]">Channels</h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Connect where your customers message you
              </p>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCFAFF] border border-[#7C3AED] hover-item-card transition-colors shadow-2xs group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">WhatsApp</div>
                    <div className={`text-[11px] ${channels.whatsapp.connected ? 'text-[#16A34A] font-semibold' : 'text-[#667085]'}`}>
                      {channels.whatsapp.detail}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConnect('whatsapp')}
                  className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer transition-colors arrow-icon"
                >
                  <span>{channels.whatsapp.connected ? 'Manage' : 'Connect'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instagram Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] hover-item-card transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Instagram</div>
                    <div className={`text-[11px] ${channels.instagram.connected ? 'text-[#16A34A] font-semibold' : 'text-[#667085]'}`}>
                      {channels.instagram.detail}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConnect('instagram')}
                  className="text-xs font-semibold text-[#475467] group-hover:text-[#7C3AED] flex items-center gap-1 cursor-pointer transition-colors arrow-icon"
                >
                  <span>{channels.instagram.connected ? 'Manage' : 'Connect'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messenger Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] hover-item-card transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0866FF">
                      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.909 1.458 5.518 3.738 7.202V22l3.39-1.862c.907.251 1.874.388 2.872.388 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.026 12.443l-2.585-2.756-5.048 2.756 5.553-5.892 2.651 2.756 4.982-2.756-5.553 5.892z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Messenger</div>
                    <div className={`text-[11px] ${channels.messenger.connected ? 'text-[#16A34A] font-semibold' : 'text-[#667085]'}`}>
                      {channels.messenger.detail}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConnect('messenger')}
                  className="text-xs font-semibold text-[#475467] group-hover:text-[#7C3AED] flex items-center gap-1 cursor-pointer transition-colors arrow-icon"
                >
                  <span>{channels.messenger.connected ? 'Manage' : 'Connect'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dotted stats footer */}
          <div className="pt-4 border-t border-dashed border-[#EAECF0] flex items-center justify-between text-xs">
            <div className="flex items-center gap-5 text-[#667085]">
              <div>
                <strong className="font-bold text-[#101828]">3</strong> channels
              </div>
              <div>
                <strong className="font-bold text-[#101828]">6</strong> assistants
              </div>
              <div>
                <strong className="font-bold text-[#101828]">60</strong> tools
              </div>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* 8. Lower Row: Quick Actions (Left) + Learn & Get Help (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Quick Actions */}
        <div className="sendiee-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#101828]">Quick actions</h2>

          <div className="grid grid-cols-3 gap-3">
            {/* Action 1: New campaign */}
            <button
              onClick={() => setActiveTab('campaigns')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <Send className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">New campaign</span>
            </button>

            {/* Action 2: Insights */}
            <button
              onClick={() => setActiveTab('insights')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">Insights</span>
            </button>

            {/* Action 3: Contacts */}
            <button
              onClick={() => setActiveTab('leads')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <Users className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">Contacts</span>
            </button>

            {/* Action 4: Templates */}
            <button
              onClick={() => setActiveTab('templates')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <LayoutTemplate className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">Templates</span>
            </button>

            {/* Action 5: AI Assistants */}
            <button
              onClick={() => setActiveTab('ai-assistants')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <Bot className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">AI Assistants</span>
            </button>

            {/* Action 6: Tools */}
            <button
              onClick={() => setActiveTab('tools')}
              className="p-4 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box transition-colors">
                <Wrench className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-bold text-[#101828] text-center">Tools</span>
            </button>
          </div>
        </div>

        {/* Right Card: Learn & get help */}
        <div className="sendiee-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#101828]">Learn & get help</h2>

          <div className="space-y-2.5">
            {/* Help 1: Knowledge base */}
            <a
              href="https://docs.sendiee.com"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box shrink-0">
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Knowledge base</div>
                <div className="text-[11px] text-[#667085]">Guides & docs</div>
              </div>
            </a>

            {/* Help 2: Video tutorials */}
            <button
              onClick={() => showToast('Opening Dhigrowth Academy video walkthroughs', 'info')}
              className="w-full p-3.5 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex items-center gap-3.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box shrink-0">
                <Video className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Video tutorials</div>
                <div className="text-[11px] text-[#667085]">Watch & learn</div>
              </div>
            </button>

            {/* Help 3: Get help */}
            <button
              onClick={() => setIsWidgetOpen(true)}
              className="w-full p-3.5 rounded-2xl bg-[#F9FAFB] hover-item-card border border-[#EAECF0] flex items-center gap-3.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] flex items-center justify-center text-[#7C3AED] icon-box shrink-0">
                <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">Get help</div>
                <div className="text-[11px] text-[#667085]">Talk to our team</div>
              </div>
            </button>
          </div>
        </div>
      </div>



      {/* Interactive Channel Connection Modal */}
      {activeChannelToConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveChannelToConnect(null)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828] capitalize">
                  Connect {activeChannelToConnect}
                </h3>
                <p className="text-xs text-[#667085]">Official Meta Cloud API Authorization</p>
              </div>
            </div>

            <form onSubmit={handleSubmitConnect} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">
                  {activeChannelToConnect === 'whatsapp'
                    ? 'WhatsApp Business Phone Number'
                    : activeChannelToConnect === 'instagram'
                    ? 'Instagram Professional Handle'
                    : 'Facebook Page Name / ID'}
                </label>
                <input
                  type="text"
                  required
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  placeholder="Enter credential / handle"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Verify & Connect
                </button>
                {channels[activeChannelToConnect]?.connected && (
                  <button
                    type="button"
                    onClick={() => {
                      disconnectChannel(activeChannelToConnect);
                      setActiveChannelToConnect(null);
                    }}
                    className="py-2.5 px-3 bg-[#FEE2E2] hover:bg-[#FCD34D] text-[#DC2626] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Invite Team Modal */}
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
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <UserPlus className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Invite Team Agents</h3>
                <p className="text-xs text-[#667085]">Add teammates to collaborate on Shared Inbox</p>
              </div>
            </div>

            <form onSubmit={handleInviteTeam} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Teammate Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  placeholder="agent@company.com"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Send Team Invitation Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Widget Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsWidgetOpen(true)}
          className="w-12 h-12 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform hover:scale-110 cursor-pointer"
          title="Open Dhigrowth AI Concierge"
        >
          <Target className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
