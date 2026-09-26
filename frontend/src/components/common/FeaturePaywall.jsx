import React from 'react';
import {
  Lock,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FeaturePaywall = ({
  featureTitle = 'Premium Feature',
  featureDescription = 'This advanced feature requires an active subscription to access and use.',
  requiredPlan = 'Growth',
  benefits = [
    'Official Meta WhatsApp Cloud API access',
    'Mass broadcast campaigns with dynamic variable replacement',
    'Automated AI auto-pilot & custom knowledge bases',
    'Full CRM contact export and webhook automation',
    '24/7 Priority WhatsApp & chat support',
  ],
}) => {
  const { openCheckout, setIsUpgradeModalOpen, subscription } = useApp();

  const handleUnlock = () => {
    if (typeof openCheckout === 'function') {
      openCheckout(requiredPlan, 'monthly', 'razorpay');
    } else if (typeof setIsUpgradeModalOpen === 'function') {
      setIsUpgradeModalOpen(true);
    }
  };

  return (
    <div className="p-4 lg:p-10 max-w-4xl mx-auto font-sans animate-in fade-in">
      <div className="bg-white border border-[#E9D8FD] rounded-3xl p-8 lg:p-12 text-center shadow-lg relative overflow-hidden space-y-6">
        {/* Top Decorative Background Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#F4F0FD] to-transparent rounded-full -mt-40 pointer-events-none opacity-80" />

        {/* Lock Icon */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
          <Lock className="w-8 h-8" />
        </div>

        {/* Header Text */}
        <div className="relative z-10 space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0FD] border border-[#E9D8FD] text-xs font-semibold text-[#7C3AED]">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Active Subscription Required</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#101828] tracking-tight">
            Unlock {featureTitle}
          </h2>

          <p className="text-xs lg:text-sm text-[#475467] leading-relaxed">
            {featureDescription} Subscribe to any of our plans to immediately unlock and start using this feature in your workspace.
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="relative z-10 bg-[#FAF8FF] border border-[#E9D8FD]/80 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-2.5">
          <div className="text-[11px] font-bold text-[#7C3AED] uppercase font-mono tracking-wider">
            WHAT YOU GET WITH AN ACTIVE PLAN:
          </div>
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-[#344054]">
              <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleUnlock}
            className="w-full sm:w-auto px-7 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Subscribe &amp; Unlock Feature</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleUnlock}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-[#F9FAFB] border border-[#EAECF0] text-xs font-semibold text-[#344054] rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <span>View All Plans &amp; Pricing</span>
          </button>
        </div>

        {/* Transparent billing notice */}
        <div className="relative z-10 text-[11px] text-[#475467] bg-[#F9FAFB] rounded-xl py-2 px-3 border border-[#EAECF0] max-w-md mx-auto">
          💡 <strong>0% Markup Guarantee:</strong> Your subscription covers Dhigrowth platform software. WhatsApp fees and AI tokens are paid directly to Meta and your AI provider at raw cost.
        </div>

        <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] text-[#667085] pt-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Official Meta Tech Partner</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Instant UPI / Cards Activation</span>
          </div>
          <span>•</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
};
