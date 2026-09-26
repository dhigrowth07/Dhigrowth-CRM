import React, { useState } from 'react';
import { X, Check, Zap, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const UpgradeModal = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, currentPlan, openCheckout, showToast } = useApp();
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly | yearly

  if (!isUpgradeModalOpen) return null;

  const PLANS = [
    {
      name: 'Growth',
      price: billingCycle === 'yearly' ? '₹1,424' : '₹1,899',
      period: '/ month',
      description: 'Ideal for solo creators and growing direct-to-consumer stores.',
      features: [
        '1 WhatsApp Cloud API Number',
        'Instagram DM Automation',
        '2,500 Messages / month',
        'AI Chatbot (GPT-4o / Gemini)',
        'Basic Meta Pixel CAPI',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'yearly' ? '₹2,625' : '₹3,499',
      period: '/ month',
      description: 'Built for high-volume e-commerce brands and scaling teams.',
      features: [
        '3 WhatsApp Cloud API Numbers',
        'Instagram + Messenger Omnichannel',
        '10,000 Messages / month',
        'Custom AI RAG Knowledge Base',
        'Meta CAPI + Shopify Webhooks',
        'Automated Drip Sequences',
      ],
      popular: true,
    },
    {
      name: 'Business',
      price: billingCycle === 'yearly' ? '₹3,749' : '₹4,999',
      period: '/ month',
      description: 'Unlimited team agents, sub-second voice AI calling, and verified Green Tick.',
      features: [
        'Unlimited WhatsApp & IG Channels',
        'Official Meta Verified Green Tick Filing',
        'Speech-to-Speech AI Voice Calling',
        'Unlimited Team Seats & Shared Inbox',
        'Dedicated Priority WhatsApp Support',
        'Enterprise Webhook SLAs',
      ],
      popular: false,
    },
  ];

  const handleSelectPlan = (planName) => {
    setIsUpgradeModalOpen(false);
    if (openCheckout) {
      openCheckout(planName, billingCycle, 'razorpay');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-4xl w-full p-6 lg:p-8 shadow-2xl relative overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={() => setIsUpgradeModalOpen(false)}
          className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0FD] border border-[#E9D8FD] text-xs font-semibold text-[#7C3AED]">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Official Meta Business Partner Platform</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            Upgrade your Dhigrowth Workspace
          </h2>
          <p className="text-xs lg:text-sm text-[#475467] max-w-lg mx-auto">
            Zero markup on Meta WhatsApp conversation fees. Pay-per-use AI token wallet and unlimited scalability.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-[#F2F4F7] p-1 rounded-xl border border-[#EAECF0] mt-3">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            return (
              <div
                key={plan.name}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#7C3AED] bg-[#FCFAFF] shadow-md ring-2 ring-[#7C3AED]/20 relative'
                    : 'border-[#EAECF0] bg-white hover:border-[#D0D5DD]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">{plan.name}</h3>
                    <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#101828]">{plan.price}</span>
                    <span className="text-xs text-[#667085] font-medium">{plan.period}</span>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2 pt-3 border-t border-[#EAECF0]">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#344054]">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold mt-5 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/20'
                      : 'bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#101828]'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
