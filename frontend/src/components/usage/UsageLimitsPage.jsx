import React from 'react';
import {
  Crown,
  Clock,
  RotateCw,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Users,
  Bot,
  Wrench,
  FileText,
  UserCheck,
  HardDrive,
  GitFork,
  Sliders,
  Radio,
  Sparkles,
  Folder,
  CornerUpRight,
  Tag,
  Droplet,
  Send,
  MessageSquare,
  Repeat,
  Headphones,
  Network,
  Phone,
  Mic,
  Camera,
  BarChart2,
  Code,
  ShieldCheck,
  MessageCircle,
  Calendar,
  Building,
  CheckCircle2,
  X,
  Target,
  Mail,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UsageLimitsPage = () => {
  const { currentPlan, daysRemaining, setIsUpgradeModalOpen, setActiveTab } = useApp();

  const RESOURCE_USAGE = [
    { id: 'contacts', label: 'Contacts', type: 'Billing cycle', usage: '0 / 80.0k', time: '23d left', icon: Users },
    { id: 'models', label: 'Models', type: 'Billing cycle', usage: '0 / 6', time: '23d left', icon: Bot },
    { id: 'tools', label: 'Tools', type: 'Billing cycle', usage: '0 / 60', time: '23d left', icon: Wrench },
    { id: 'templates', label: 'Templates', type: 'Billing cycle', usage: '∞ Unlimited', isUnlimited: true, time: null, icon: FileText },
    { id: 'team_members', label: 'Team Members', type: 'Billing cycle', usage: '0 / 20', time: '23d left', icon: UserCheck },
    { id: 'file_storage', label: 'File Storage Gb', type: 'Billing cycle', usage: '0 / 10', time: '23d left', icon: HardDrive },
    { id: 'segments', label: 'Segments', type: 'Billing cycle', usage: '0 / 20', time: '23d left', icon: GitFork },
    { id: 'custom_attrs', label: 'Custom Attributes', type: 'Billing cycle', usage: '0 / 20', time: '23d left', icon: Sliders },
    { id: 'channels', label: 'Channels', type: 'Billing cycle', usage: '0 / 3', time: '23d left', icon: Radio },
    { id: 'ai_insights', label: 'Ai Insights', type: 'Billing cycle', usage: '0 / 10', time: '23d left', icon: Sparkles },
    { id: 'lead_categories', label: 'Lead Categories', type: 'Billing cycle', usage: '0 / 15', time: '23d left', icon: Folder },
    { id: 'ai_followups', label: 'Ai Followups', type: 'Billing cycle', usage: '0 / 30', time: '23d left', icon: CornerUpRight },
    { id: 'contact_tags', label: 'Contact Tags', type: 'Billing cycle', usage: '0 / 50', time: '23d left', icon: Tag },
    { id: 'drip_campaigns', label: 'Drip Campaigns', type: 'Billing cycle', usage: '0 / 10', time: '23d left', icon: Droplet },
    { id: 'campaigns_mo', label: 'Campaigns / Mo', type: 'Monthly', usage: '0 / 300', time: 'Resets in 22d', isReset: true, icon: Send },
    { id: 'conv_mo', label: 'Conversations / Mo', type: 'Monthly', usage: '0 / 1000.0k', time: 'Resets in 22d', isReset: true, icon: MessageSquare },
    { id: 'triggers_mo', label: 'Automation Triggers / Mo', type: 'Monthly', usage: '0 / 10.0k', time: 'Resets in 22d', isReset: true, icon: Repeat },
    { id: 'agents', label: 'Agents', type: 'Billing cycle', usage: '0 / 10', time: '23d left', icon: Headphones },
    { id: 'teams', label: 'Teams', type: 'Billing cycle', usage: '0 / 3', time: '23d left', icon: Network },
  ];

  const PLAN_FEATURES = [
    // Row 1
    { name: 'Calling', icon: Phone, enabled: true },
    { name: 'Ai Voice Detection', icon: Mic, enabled: true },
    { name: 'Ai Image Detection', icon: Camera, enabled: true },
    { name: 'Advanced Analytics', icon: BarChart2, enabled: true },
    { name: 'Api Access', icon: Code, enabled: true },
    { name: 'Priority Support', icon: ShieldCheck, enabled: true },

    // Row 2
    { name: 'Custom Functions Tool', icon: Wrench, enabled: true },
    { name: 'Followup', icon: RotateCw, enabled: true },
    { name: 'Meta Whatsapp', icon: MessageSquare, enabled: true },
    { name: 'Instagram', icon: Camera, enabled: true },
    { name: 'Messenger', icon: Zap, enabled: true },
    { name: 'Line', icon: MessageCircle, enabled: true },

    // Row 3
    { name: 'Ai Lead Segmentation', icon: GitFork, enabled: true },
    { name: 'Shopify', icon: Code, enabled: true },
    { name: 'Zoho', icon: Code, enabled: true },
    { name: 'Meta Pixel', icon: Code, enabled: true },
    { name: 'Voice Reply', icon: Mic, enabled: true },
    { name: 'Ai Reply Time Control', icon: Clock, enabled: true },

    // Row 4
    { name: 'Ai Memory Duration Control', icon: Clock, enabled: true },
    { name: 'Bulk Csv Import', icon: UserCheck, enabled: true },
    { name: 'Contacts Api', icon: Code, enabled: true },
    { name: 'Campaign Scheduling', icon: Calendar, enabled: true },
    { name: 'Resend Undelivered', icon: RotateCw, enabled: true },
    { name: 'Ai Insights', icon: Sparkles, enabled: true },

    // Row 5
    { name: 'Lead Studio', icon: Target, enabled: true },
    { name: 'Schedule Messages Api', icon: Send, enabled: true },
    { name: 'Account Manager', icon: UserCheck, enabled: true },
    { name: 'Drip Campaign', icon: Droplet, enabled: true },
    { name: 'Client Access', icon: Building, enabled: false },
    { name: 'Custom Attributes', icon: Sliders, enabled: false },

    // Row 6
    { name: 'Demo Whatsapp', icon: CheckCircle2, enabled: true },
    { name: 'Dynamic Segments', icon: GitFork, enabled: false },
    { name: 'Multi Team', icon: Users, enabled: false },
    { name: 'Round Robin', icon: RotateCw, enabled: false },
    { name: 'Shared Team Inbox', icon: Mail, enabled: true },
    { name: 'Webhook Access', icon: Code, enabled: false },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* 1. Header Plan Card */}
      <div className="sendiee-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white shrink-0 shadow-sm">
          <Crown className="w-6 h-6 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#101828] tracking-tight">
              {currentPlan}
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
              <span>✓</span> Active
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            High volume and custom solutions
          </p>
        </div>
      </div>

      {/* 2. Billing Cycle & Monthly Reset (2 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Billing Cycle */}
        <div className="sendiee-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] shrink-0">
              <Clock className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#667085] tracking-wider uppercase font-mono">
                BILLING CYCLE
              </div>
              <div className="text-sm font-semibold text-[#101828] mt-0.5">
                9/3/2026 – 10/3/2026
              </div>
            </div>
          </div>

          <span className="text-xs font-semibold text-[#7C3AED] bg-[#F4F0FD] border border-[#E9D8FD] px-3 py-1 rounded-full">
            {daysRemaining || 23}d left
          </span>
        </div>

        {/* Monthly Reset */}
        <div className="sendiee-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] shrink-0">
              <RotateCw className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#667085] tracking-wider uppercase font-mono">
                MONTHLY RESET
              </div>
              <div className="text-sm font-semibold text-[#101828] mt-0.5">
                9/3/2026 – 10/3/2026
              </div>
            </div>
          </div>

          <span className="text-xs font-semibold text-[#7C3AED] bg-[#F4F0FD] border border-[#E9D8FD] px-3 py-1 rounded-full">
            Resets in 22d
          </span>
        </div>
      </div>

      {/* 3. Resource Usage Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-base font-bold text-[#101828]">Resource Usage</h2>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Increase Limits</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-column Grid of Resource Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCE_USAGE.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="sendiee-card p-4 flex flex-col justify-between hover:border-[#D0D5DD] transition-all hover-lift"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED] shrink-0">
                      <Icon className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#101828] leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                        {item.isReset ? (
                          <RotateCw className="w-2.5 h-2.5 text-[#98A2B3]" />
                        ) : (
                          <Clock className="w-2.5 h-2.5 text-[#98A2B3]" />
                        )}
                        <span>{item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold tracking-tight ${item.isUnlimited ? 'text-[#7C3AED]' : 'text-[#101828]'}`}>
                      {item.usage}
                    </div>
                  </div>
                </div>

                {item.time && (
                  <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] flex items-center justify-end text-[10px] text-[#98A2B3] gap-1">
                    {item.isReset ? (
                      <RotateCw className="w-2.5 h-2.5" />
                    ) : (
                      <Clock className="w-2.5 h-2.5" />
                    )}
                    <span>{item.time}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Plan Features Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-base font-bold text-[#101828]">Plan Features</h2>
        </div>

        {/* 6-column Grid of Feature Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PLAN_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isEnabled = feat.enabled;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isEnabled
                    ? 'bg-white border-[#EAECF0] hover:border-[#D0D5DD]'
                    : 'bg-[#F9FAFB] border-[#EAECF0] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`shrink-0 ${isEnabled ? 'text-[#16A34A]' : 'text-[#98A2B3]'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[11px] font-semibold truncate ${isEnabled ? 'text-[#101828]' : 'text-[#98A2B3]'}`}>
                    {feat.name}
                  </span>
                </div>

                <div className="shrink-0 text-xs">
                  {isEnabled ? (
                    <span className="text-[#16A34A] font-bold">✓</span>
                  ) : (
                    <span className="text-[#98A2B3] font-bold">✕</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
