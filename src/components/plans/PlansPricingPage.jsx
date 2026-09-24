import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PlansPricingPage = () => {
  const {
    currentPlan,
    openCheckout,
    subscription,
    showToast,
    setActiveTab,
    setSubscriptionStatus,
    isSuperAdmin,
  } = useApp();

  const isPaidActive = Boolean(isSuperAdmin) || subscription?.status === 'active';

  const [interval, setInterval] = useState('monthly'); // 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'

  const INTERVALS = [
    { id: 'monthly', label: 'Monthly', discount: null },
    { id: 'quarterly', label: 'Quarterly', discount: 'Save 10%' },
    { id: 'half-yearly', label: 'Half-Yearly', discount: 'Save 20%' },
    { id: 'yearly', label: 'Yearly', discount: 'Save 25%' },
  ];

  const PLANS = [
    {
      id: 'Creator Lite',
      name: 'Creator Lite',
      subtitle: 'Creators on Instagram & Messenger',
      channelsText: '2 channels',
      channelsIcons: ['instagram', 'messenger'],
      priceINR: interval === 'yearly' ? '974' : '1,299',
      priceGST: interval === 'yearly' ? '₹1,149' : '₹1,533',
      isBestValue: false,
      isCurrent: currentPlan === 'Creator Lite',
    },
    {
      id: 'Creator Plus',
      name: 'Creator Plus',
      subtitle: 'Creators scaling DMs & content',
      channelsText: '2 channels',
      channelsIcons: ['instagram', 'messenger'],
      priceINR: interval === 'yearly' ? '1,274' : '1,699',
      priceGST: interval === 'yearly' ? '₹1,503' : '₹2,005',
      isBestValue: false,
      isCurrent: currentPlan === 'Creator Plus',
    },
    {
      id: 'Growth',
      name: 'Growth',
      subtitle: 'Perfect for solo founders & D2C stores',
      channelsText: 'Any 1 of 3 Channels',
      channelsIcons: ['whatsapp', 'instagram', 'messenger'],
      priceINR: interval === 'yearly' ? '1,424' : '1,899',
      priceGST: interval === 'yearly' ? '₹1,680' : '₹2,241',
      isBestValue: true,
      isCurrent: currentPlan === 'Growth',
    },
    {
      id: 'Pro',
      name: 'Pro',
      subtitle: 'Built for high-volume brands & scaling teams',
      channelsText: 'All 3 Channels + Webhooks',
      channelsIcons: ['whatsapp', 'instagram', 'messenger'],
      priceINR: interval === 'yearly' ? '2,625' : '3,499',
      priceGST: interval === 'yearly' ? '₹3,097' : '₹4,128',
      isBestValue: false,
      isCurrent: currentPlan === 'Pro',
    },
    {
      id: 'Business',
      name: 'Business',
      subtitle: 'Omnichannel brands scaling with sub-second AI',
      channelsText: 'All 4 Channels + Custom RAG',
      channelsIcons: ['whatsapp', 'instagram', 'messenger', 'line'],
      priceINR: interval === 'yearly' ? '3,749' : '4,999',
      priceGST: interval === 'yearly' ? '₹4,423' : '₹5,898',
      isBestValue: false,
      isCurrent: currentPlan === 'Business',
    },
  ];

  const handlePlanSelect = (planName) => {
    openCheckout(planName, interval === 'yearly' ? 'yearly' : 'monthly', 'razorpay');
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1300px] mx-auto font-sans">
      {/* 1. Centered Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#101828] tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-xs lg:text-sm text-[#475467]">
          Scale your business with the right plan. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* 3-Pillar Transparent Billing Model */}
      <div className="bg-white border border-[#EAECF0] rounded-3xl p-6 shadow-sm space-y-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2F4F7] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#101828] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>Transparent SaaS Pricing Architecture: How Billing Works</span>
            </h3>
            <p className="text-xs text-[#667085]">
              You only pay us for the software platform. Infrastructure costs (Meta WhatsApp Cloud API &amp; AI Tokens) are billed directly to their providers with zero markup.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#F4F0FD] text-[#7C3AED] rounded-full self-start sm:self-auto border border-[#E9D8FD]">
            0% MARKUP ON META &amp; AI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Pillar 1: Dhigrowth Platform Fee */}
          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E9D8FD] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="font-bold text-[#101828]">What You Pay Us</div>
            </div>
            <div className="text-[11px] font-bold text-[#7C3AED] uppercase font-mono">
              Monthly Platform Fee
            </div>
            <p className="text-[11px] text-[#475467] leading-relaxed">
              Paid monthly to Dhigrowth CRM. Unlocks our multi-agent Team Inbox, mass broadcast campaign scheduler, flow automations, analytics, CRM contacts, and team seats.
            </p>
          </div>

          {/* Pillar 2: Meta WhatsApp Cloud API */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="font-bold text-[#101828]">What You Pay Meta</div>
            </div>
            <div className="text-[11px] font-bold text-[#16A34A] uppercase font-mono">
              Official WhatsApp Fees
            </div>
            <p className="text-[11px] text-[#475467] leading-relaxed">
              Paid directly to Meta via your Meta Business Manager card. You get 1,000 free service chats/mo, and only pay wholesale Meta rates (approx ₹0.75 - ₹0.85 per marketing template). Zero markup from us.
            </p>
          </div>

          {/* Pillar 3: AI Assistant (BYOK) */}
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#FEF0C7] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="font-bold text-[#101828]">What You Pay AI Provider</div>
            </div>
            <div className="text-[11px] font-bold text-[#D97706] uppercase font-mono">
              Direct AI Token Usage
            </div>
            <p className="text-[11px] text-[#475467] leading-relaxed">
              Connect your own Google Gemini (free tier), Groq (free tier), OpenAI, or Claude API key. You pay your AI provider directly for the tokens your bot consumes at direct developer rates.
            </p>
          </div>
        </div>
      </div>

      {/* Active / Inactive Status Alert */}
      {isSuperAdmin ? (
        <div className="max-w-2xl mx-auto p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0F172A] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              👑
            </div>
            <div>
              <div className="font-bold text-[#0F172A] flex items-center gap-2">
                <span>Super Administrator Account — Lifetime Free Tier</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  NO SUBSCRIPTION REQUIRED
                </span>
              </div>
              <div className="text-[11px] text-[#475467] mt-0.5">
                Super Admins have permanent free access to all platform features. Paid subscriptions are only required for client users.
              </div>
            </div>
          </div>
        </div>
      ) : !isPaidActive ? (
        <div className="max-w-2xl mx-auto p-4 bg-[#FFF9EB] border border-[#FEEFC6] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B54708] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FEF08A] text-[#D97706] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#92400E]">Subscription Inactive — Operational Features Gated</div>
              <div className="text-[11px] text-[#B45309]">Pick any plan below to instantly activate your subscription and unlock all features.</div>
            </div>
          </div>
          {typeof setSubscriptionStatus === 'function' && (
            <button
              onClick={() => setSubscriptionStatus('active')}
              className="px-3 py-1.5 bg-white hover:bg-[#FEF08A] text-[#78350F] border border-[#FDE047] font-bold rounded-xl text-[10px] cursor-pointer shrink-0"
              title="Developer toggle: simulate active subscription"
            >
              ⚡ Test Unlock
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#166534] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#14532D]">Active Plan: {subscription?.planName || currentPlan} ({subscription?.billingCycle || 'monthly'})</div>
              <div className="text-[11px] text-[#15803D]">All features and quotas are active and unlocked.</div>
            </div>
          </div>
          {typeof setSubscriptionStatus === 'function' && (
            <button
              onClick={() => setSubscriptionStatus('trialing')}
              className="px-3 py-1.5 bg-white hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-bold rounded-xl text-[10px] cursor-pointer shrink-0"
              title="Developer toggle: simulate unsubscribed state to test paywall"
            >
              🔒 Test Lock
            </button>
          )}
        </div>
      )}

      {/* 2. Billing Switcher Pills */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-full text-xs font-semibold">
          {INTERVALS.map((item) => (
            <button
              key={item.id}
              onClick={() => setInterval(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all cursor-pointer ${
                interval === item.id
                  ? 'bg-[#7C3AED] text-white shadow-2xs font-bold'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <span>{item.label}</span>
              {item.discount && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  interval === item.id ? 'bg-white/20 text-white' : 'bg-[#DCFCE7] text-[#16A34A]'
                }`}>
                  {item.discount}
                </span>
              )}
            </button>
          ))}
        </div>

        <a
          href="https://sendiee.com/pricing"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
        >
          <span>Compare all features &amp; limits in detail</span>
          <span className="font-sans">↗</span>
        </a>
      </div>

      {/* 3. 4 Plan Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`bg-white border rounded-3xl p-6 space-y-6 flex flex-col justify-between transition-all relative ${
              p.isBestValue
                ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-lg shadow-purple-600/10'
                : 'border-[#EAECF0] shadow-2xs hover:border-[#D0D5DD]'
            }`}
          >
            {/* BEST VALUE floating pill badge */}
            {p.isBestValue && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                BEST VALUE
              </div>
            )}

            <div className="space-y-4">
              {/* Icon Box */}
              <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#EAECF0] flex items-center justify-center text-[#7C3AED]">
                <Zap className="w-5 h-5 text-[#7C3AED]" />
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-lg font-bold text-[#101828]">{p.name}</h3>
                <p className="text-xs text-[#667085] mt-0.5">{p.subtitle}</p>
              </div>

              {/* Channels Row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex -space-x-1">
                  {p.channelsIcons.map((ic) => (
                    <div
                      key={ic}
                      className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] text-white ${
                        ic === 'whatsapp' ? 'bg-[#25D366]' : ic === 'instagram' ? 'bg-[#E1306C]' : ic === 'messenger' ? 'bg-[#0866FF]' : 'bg-[#00B900]'
                      }`}
                    >
                      •
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[#667085] font-medium">{p.channelsText}</span>
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-[#F2F4F7]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#101828]">₹{p.priceINR}</span>
                  <span className="text-xs text-[#667085]">/ month</span>
                </div>
                <div className="text-[11px] text-[#98A2B3] font-mono mt-0.5">
                  {p.priceGST} (includes 18% GST)
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              {p.isCurrent ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] rounded-xl text-xs font-bold cursor-default"
                >
                  Current Plan (Active ✓)
                </button>
              ) : (
                <button
                  onClick={() => handlePlanSelect(p.name)}
                  className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[#344054] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>{p.id === 'Business' ? 'Upgrade Plan' : '↘ Downgrade'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
