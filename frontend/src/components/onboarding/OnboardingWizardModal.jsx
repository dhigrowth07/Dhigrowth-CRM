import React, { useState } from 'react';
import {
  Sparkles,
  Smartphone,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';
import { MetaEmbeddedSignupModal } from '../settings/MetaEmbeddedSignupModal';

export const OnboardingWizardModal = ({ isOpen, onClose }) => {
  const {
    currentWorkspaceId,
    currentUser,
    showToast,
    setIsUpgradeModalOpen
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [isEmbeddedModalOpen, setIsEmbeddedModalOpen] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [connectedPhone, setConnectedPhone] = useState('');

  // Step 2 Plan Selection
  const [selectedPlan, setSelectedPlan] = useState('growth'); // 'starter' | 'growth' | 'enterprise'

  // Step 3 Team Invites
  const [invites, setInvites] = useState([
    { email: '', fullName: '', role: 'agent' }
  ]);
  const [isSubmittingInvites, setIsSubmittingInvites] = useState(false);

  const handleAddInviteRow = () => {
    setInvites([...invites, { email: '', fullName: '', role: 'agent' }]);
  };

  const handleRemoveInviteRow = (index) => {
    if (invites.length <= 1) return;
    setInvites(invites.filter((_, idx) => idx !== index));
  };

  const handleInviteChange = (index, field, value) => {
    const updated = [...invites];
    updated[index][field] = value;
    setInvites(updated);
  };

  const handleSendInvites = async () => {
    setIsSubmittingInvites(true);
    try {
      const validInvites = invites.filter((inv) => inv.email.trim());
      for (const inv of validInvites) {
        await fetch(`${BACKEND_URL}/api/workspace/members/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: currentWorkspaceId,
            email: inv.email.trim(),
            fullName: inv.fullName.trim(),
            role: inv.role,
          }),
        });
      }
      if (validInvites.length > 0) {
        showToast(`Invited ${validInvites.length} team member(s)!`, 'success');
      }
    } catch (err) {
      console.warn('Invite sending note:', err.message);
    } finally {
      setIsSubmittingInvites(false);
    }
  };

  const handleCompleteAll = async () => {
    await handleSendInvites();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#25D366', '#3B82F6', '#F59E0B'],
      });
    } catch {}

    showToast(`Welcome to Dhigrowth CRM! Your workspace is ready.`, 'success');
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] text-white flex items-center justify-center font-bold shadow-md shadow-[#7C3AED]/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#101828] tracking-tight">
                Welcome to Dhigrowth CRM!
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#7C3AED] border border-[#E9D8FD]">
                14-Day Free Trial
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Let's complete your 3-step setup to activate your commercial WhatsApp auto-pilot
            </p>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: '1. Connect WhatsApp', icon: Smartphone },
            { step: 2, label: '2. Select Plan', icon: CreditCard },
            { step: 3, label: '3. Team Invites', icon: Users },
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                  isCurrent
                    ? 'border-[#7C3AED] bg-[#FAF5FF] text-[#7C3AED] shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[#EAECF0] bg-white text-[#667085] opacity-70'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: Connect WhatsApp */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 bg-gradient-to-r from-[#1877F2]/10 via-[#25D366]/10 to-[#7C3AED]/10 border border-[#1877F2]/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-[#101828] font-bold text-sm">
                <Smartphone className="w-5 h-5 text-[#25D366]" />
                <span>Connect Your WhatsApp Business Number</span>
              </div>
              <p className="text-xs text-[#475467] leading-relaxed">
                Connect your business number using our <strong>Meta 1-Click Embedded Signup</strong>. This enables Gemini AI auto-replies, Team Inbox chat, and marketing broadcasts.
              </p>

              {isWhatsAppConnected ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected: {connectedPhone || '+91 94437 24649'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">Verified</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsEmbeddedModalOpen(true)}
                  className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Connect WhatsApp (1-Click Meta Flow)</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#667085] hover:text-[#101828] font-semibold cursor-pointer"
              >
                Skip for now
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Plan */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'starter',
                  name: 'Starter Plan',
                  price: '₹999',
                  period: '/mo',
                  contacts: '2,500 Contacts',
                  agents: '2 Team Agents',
                  features: ['Meta Cloud API', '1,000 AI Auto-Replies', 'CSV Broadcasts'],
                },
                {
                  id: 'growth',
                  name: 'Growth Auto-Pilot',
                  popular: true,
                  price: '₹2,499',
                  period: '/mo',
                  contacts: '10,000 Contacts',
                  agents: '5 Team Agents',
                  features: ['Drip Sequences', '5,000 AI Auto-Replies', 'Zero Meta Markup', 'Priority Support'],
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise VIP',
                  price: '₹4,999',
                  period: '/mo',
                  contacts: 'Unlimited Contacts',
                  agents: 'Unlimited Agents',
                  features: ['Full AI Suite', 'Dedicated Account Manager', 'Custom API Webhooks'],
                },
              ].map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-[#7C3AED] bg-[#FAF5FF] shadow-md ring-2 ring-[#7C3AED]/20'
                        : 'border-[#EAECF0] bg-white hover:border-[#D0D5DD]'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED] text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#101828]">{plan.name}</span>
                        <input
                          type="radio"
                          name="plan"
                          checked={isSelected}
                          onChange={() => setSelectedPlan(plan.id)}
                          className="accent-[#7C3AED] cursor-pointer"
                        />
                      </div>
                      <div className="mt-1">
                        <span className="text-xl font-extrabold text-[#101828]">{plan.price}</span>
                        <span className="text-xs text-[#667085]">{plan.period}</span>
                      </div>
                      <div className="text-[11px] text-[#7C3AED] font-semibold mt-1">
                        {plan.contacts} • {plan.agents}
                      </div>
                    </div>

                    <ul className="text-[11px] text-[#475467] space-y-1 pt-2 border-t border-[#EAECF0]">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>14-Day Free Trial Included:</strong> You will not be charged today.</span>
              </span>
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Razorpay Checkout
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-[#667085] hover:text-[#101828] font-semibold cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Invite Team Members */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#101828]">Invite Your Team Members</h4>
                <p className="text-[11px] text-[#667085]">
                  Add colleagues to handle live customer WhatsApp chats and qualify leads
                </p>
              </div>
              <button
                onClick={handleAddInviteRow}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {invites.map((inv, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={inv.fullName}
                    onChange={(e) => handleInviteChange(idx, 'fullName', e.target.value)}
                    className="w-1/3 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                  <input
                    type="email"
                    placeholder="agent@company.com"
                    value={inv.email}
                    onChange={(e) => handleInviteChange(idx, 'email', e.target.value)}
                    className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                  <select
                    value={inv.role}
                    onChange={(e) => handleInviteChange(idx, 'role', e.target.value)}
                    className="bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {invites.length > 1 && (
                    <button
                      onClick={() => handleRemoveInviteRow(idx)}
                      className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EAECF0]">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-[#667085] hover:text-[#101828] font-semibold cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={handleCompleteAll}
                disabled={isSubmittingInvites}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Setup & Enter CRM</span>
              </button>
            </div>
          </div>
        )}

        {/* Embedded Signup Modal */}
        <MetaEmbeddedSignupModal
          isOpen={isEmbeddedModalOpen}
          onClose={() => setIsEmbeddedModalOpen(false)}
          onConnected={(channel) => {
            setIsWhatsAppConnected(true);
            setConnectedPhone(channel.phoneNumber || '');
            setIsEmbeddedModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};
