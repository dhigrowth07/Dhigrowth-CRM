import React from 'react';
import { X, Activity, MessageSquare, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UsageModal = () => {
  const { isUsageModalOpen, setIsUsageModalOpen, currentPlan, daysRemaining, metrics, credits } = useApp();

  if (!isUsageModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
        <button
          onClick={() => setIsUsageModalOpen(false)}
          className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <Activity className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#101828]">Plan & Usage Analytics</h3>
            <p className="text-xs text-[#667085]">
              {currentPlan} Plan · {daysRemaining} days remaining in trial
            </p>
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#344054]">WhatsApp Messages Handled</span>
              <span className="font-mono font-bold text-[#101828]">{metrics.messagesHandled} / 10,000</span>
            </div>
            <div className="w-full bg-[#EAECF0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${(metrics.messagesHandled / 10000) * 100}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#344054]">AI Pay-Per-Use Spend (30d)</span>
              <span className="font-mono font-bold text-[#16A34A]">${metrics.aiSpend30d.toFixed(3)}</span>
            </div>
            <div className="text-[11px] text-[#667085]">
              Available Wallet Balance: <span className="font-bold text-[#101828]">${credits.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#344054]">Meta Cloud API SLA & Green Tick</span>
              <span className="font-bold text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
            <div className="text-[11px] text-[#667085]">
              Tier 3 High-Volume throughput (Unlimited messages/day)
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsUsageModalOpen(false)}
          className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Close Analytics
        </button>
      </div>
    </div>
  );
};
