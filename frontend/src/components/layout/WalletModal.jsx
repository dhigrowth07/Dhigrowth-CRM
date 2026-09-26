import React, { useState } from 'react';
import { X, Zap, Check, ShieldCheck, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WalletModal = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, metrics, topUpWallet } = useApp();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');

  if (!isWalletModalOpen) return null;

  const handleTopUp = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (finalAmount > 0) {
      topUpWallet(finalAmount);
    }
  };

  const estimatedMessages = Math.floor((customAmount ? parseFloat(customAmount) || 0 : selectedAmount) / 0.005 * 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-strong)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => setIsWalletModalOpen(false)}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6 fill-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Sendiee AI Wallet & Usage Credits</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Current balance: <span className="font-bold text-emerald-400 font-mono">${metrics.walletBalance.toFixed(2)}</span> · Pay-per-use AI token credits
            </p>
          </div>
        </div>

        {/* Amount Selector */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Select Recharge Amount (USD)
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedAmount === amt && !customAmount
                    ? 'border-purple-500 bg-purple-600/20 text-purple-300 shadow-md ring-2 ring-purple-500/30'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span>${amt}</span>
                <span className="text-[10px] font-normal text-[var(--text-dim)]">
                  ~{(amt / 0.005 * 6).toLocaleString()} msgs
                </span>
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-1">Or enter custom amount:</div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)] font-mono text-sm">$</span>
              <input
                type="number"
                placeholder="Custom USD amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full pl-8 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm font-mono text-[var(--text-main)] focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Value Calculator Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Estimated AI Conversations:</span>
              <span className="font-bold text-emerald-400 font-mono">
                ~{estimatedMessages.toLocaleString()} messages
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Meta WhatsApp Cloud API Fee:</span>
              <span className="font-mono text-emerald-400 font-semibold">Zero markup (Direct Meta rate)</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Multimodal Vision & Audio:</span>
              <span className="font-semibold text-purple-400">Included natively</span>
            </div>
          </div>

          {/* Payment CTA */}
          <button
            onClick={handleTopUp}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              Add ${customAmount ? parseFloat(customAmount) || 0 : selectedAmount} to Wallet
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-dim)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted 256-bit checkout via Stripe / Cashfree</span>
          </div>
        </div>
      </div>
    </div>
  );
};
