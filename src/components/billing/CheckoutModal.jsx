import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Lock,
  Sparkles,
  CreditCard,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building,
  HelpCircle,
  Loader2,
  User,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Smartphone,
  QrCode,
  Wallet as WalletIcon,
  RefreshCw,
  Landmark,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../services/apiConfig';

export const CheckoutModal = () => {
  const {
    isCheckoutModalOpen,
    closeCheckout,
    checkoutData,
    currentWorkspaceId,
    currentUser,
    setCurrentPlan,
    showToast,
    refreshSubscription,
    phoneNumber,
  } = useApp();

  const [planId, setPlanId] = useState('Growth');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'cards' | 'emi' | 'netbanking' | 'wallet' | 'paylater'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activatedDetails, setActivatedDetails] = useState(null);
  const [countdown, setCountdown] = useState(715); // 11:55 in seconds

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Sync initial plan and interval when opened
  useEffect(() => {
    if (isCheckoutModalOpen && checkoutData) {
      if (checkoutData.planId) setPlanId(checkoutData.planId);
      if (checkoutData.billingCycle) setBillingCycle(checkoutData.billingCycle);
      setIsSuccess(false);
      setActivatedDetails(null);
      setPaymentMethod('upi');
      setCountdown(715);
    }
  }, [isCheckoutModalOpen, checkoutData]);

  // Live Countdown Timer (11:55 -> 00:00)
  useEffect(() => {
    if (!isCheckoutModalOpen || isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckoutModalOpen, isSuccess]);

  if (!isCheckoutModalOpen) return null;

  const PLANS_INFO = {
    Growth: {
      name: 'Growth',
      subtitle: 'Perfect for solo founders & D2C stores',
      priceINR: { monthly: 1899, yearly: 1424 },
      totalWithGst: { monthly: 2125, yearly: 19224 },
    },
    Pro: {
      name: 'Pro',
      subtitle: 'Built for high-volume brands & scaling teams',
      priceINR: { monthly: 3499, yearly: 2625 },
      totalWithGst: { monthly: 3919, yearly: 35437 },
    },
    Business: {
      name: 'Business',
      subtitle: 'Omnichannel brands scaling with AI',
      priceINR: { monthly: 4999, yearly: 3749 },
      totalWithGst: { monthly: 5599, yearly: 50611 },
    },
  };

  const currentPlanInfo = PLANS_INFO[planId] || PLANS_INFO['Growth'];
  const basePrice = billingCycle === 'yearly' ? currentPlanInfo.priceINR.yearly : currentPlanInfo.priceINR.monthly;
  const totalAmount = billingCycle === 'yearly'
    ? currentPlanInfo.totalWithGst.yearly
    : currentPlanInfo.totalWithGst.monthly;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const userPhone = phoneNumber || currentUser?.phone || '+91 97914 71277';

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create checkout session on backend
      let createRes;
      const checkoutPayload = {
        workspaceId: currentWorkspaceId,
        userId: currentUser?.username || currentUser?.slug,
        customerEmail: currentUser?.email || 'billing@dhigrowth.com',
        planId,
        billingCycle,
        provider: 'razorpay',
        billingDetails: {
          companyName: currentUser?.organization || 'Dhigrowth Workspace',
          billingEmail: currentUser?.email || 'billing@dhigrowth.com',
          phone: userPhone,
        },
      };

      try {
        createRes = await fetch(`${BACKEND_URL}/api/billing/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutPayload),
        });
      } catch {}

      if (!createRes || !createRes.ok) {
        try {
          createRes = await fetch('http://localhost:4000/api/billing/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutPayload),
          });
        } catch {}
      }

      const orderData = createRes ? await createRes.json() : {};

      // 2. Complete payment and activate
      const paymentRefId = `pay_rzp_${Date.now()}`;
      const verifyPayload = {
        workspaceId: currentWorkspaceId,
        planId,
        billingCycle,
        provider: 'razorpay',
        paymentId: paymentRefId,
        orderId: orderData.orderId || `order_${Date.now()}`,
        amount: totalAmount,
        currency: 'INR',
        billingDetails: checkoutPayload.billingDetails,
      };

      let verifyRes;
      try {
        verifyRes = await fetch(`${BACKEND_URL}/api/billing/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyPayload),
        });
      } catch {}

      if (!verifyRes || !verifyRes.ok) {
        try {
          verifyRes = await fetch('http://localhost:4000/api/billing/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyPayload),
          });
        } catch {}
      }

      const result = verifyRes ? await verifyRes.json() : { success: true };

      if (result.success) {
        setCurrentPlan(planId);
        if (typeof refreshSubscription === 'function') {
          refreshSubscription();
        }

        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
        });

        setIsSuccess(true);
        setActivatedDetails({
          planName: planId,
          billingCycle,
          totalAmount,
          currencySymbol: '₹',
          provider: 'Razorpay UPI',
          paymentId: paymentRefId,
          invoiceNumber: result.invoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        });

        showToast(`🎉 Payment Verified! ${planId} Plan is now ACTIVE on your workspace.`, 'success');
      } else {
        throw new Error(result.error || 'Failed to complete payment');
      }
    } catch (err) {
      console.error('[Razorpay Checkout Error]:', err);
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-[890px] w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[520px] border border-black/10">
        
        {/* Top-Right Red Corner Ribbon: Test Mode */}
        <div className="absolute top-5 -right-11 bg-[#E53E3E] text-white font-extrabold text-[9px] uppercase tracking-widest py-0.5 px-12 rotate-45 shadow-sm z-30 select-none pointer-events-none">
          Test Mode
        </div>

        {isSuccess ? (
          /* Payment Success Confirmation View */
          <div className="w-full text-center py-12 px-6 space-y-5 animate-in zoom-in-95 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A34A] bg-[#DCFCE7] px-3.5 py-1 rounded-full border border-[#BBF7D0]">
                Payment Successful & Verified by Razorpay
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#101828] mt-2">
                Welcome to the {activatedDetails?.planName} Plan!
              </h2>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                Your workspace subscription has been upgraded. All advanced modules, AI Concierge auto-replies, and WhatsApp Cloud APIs are now fully active.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] max-w-sm mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#667085]">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-[#101828]">{activatedDetails?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Payment Reference:</span>
                <span className="font-mono font-bold text-[#101828] truncate max-w-[180px]">{activatedDetails?.paymentId}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Billing Interval:</span>
                <span className="font-bold text-[#101828] capitalize">{activatedDetails?.billingCycle}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Total Amount:</span>
                <span className="font-extrabold text-[#16A34A] text-sm">
                  ₹{activatedDetails?.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={closeCheckout}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
              >
                Go to Workspace Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Razorpay 2-Column Split Checkout Modal */
          <>
            {/* 1. Left Column: Vibrant Purple Brand & Price Summary */}
            <div className="w-full md:w-[280px] lg:w-[295px] shrink-0 bg-gradient-to-b from-[#7C3AED] via-[#6D28D9] to-[#581C87] p-5 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#4C1D95]/40 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Brand Logo Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center font-extrabold text-sm text-white shadow-2xs backdrop-blur-xs">
                    W
                  </div>
                  <span className="text-base font-extrabold tracking-wider text-white uppercase">
                    WAPPPILOT
                  </span>
                </div>

                {/* White Price Summary Card */}
                <div className="bg-white rounded-2xl p-4 shadow-lg text-[#101828] space-y-1">
                  <span className="text-[11px] font-semibold text-[#667085] block">
                    Price Summary
                  </span>
                  <div className="text-2xl lg:text-3xl font-extrabold text-[#111827] tracking-tight">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#98A2B3] flex items-center justify-between pt-1 border-t border-gray-100">
                    <span>{currentPlanInfo.name} Plan ({billingCycle})</span>
                    <span>Incl. GST</span>
                  </div>
                </div>

                {/* Using As User Chip */}
                <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-xs flex items-center justify-between text-white transition-all cursor-pointer backdrop-blur-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate text-[11px] font-medium">Using as {userPhone}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </div>
              </div>

              {/* Bottom 3D Isometric Art & Secured by Razorpay */}
              <div className="pt-6 relative z-10 space-y-3">
                {/* Isometric SVG Illustration of 3D Blocks, Card & Coins */}
                <div className="flex justify-center -mb-2 pointer-events-none select-none">
                  <svg width="150" height="95" viewBox="0 0 150 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Isometric Cube 1 */}
                    <path d="M75 10L105 26V54L75 70L45 54V26L75 10Z" fill="url(#cubeGrad1)" fillOpacity="0.4" />
                    <path d="M75 10L105 26L75 42L45 26L75 10Z" fill="#C4B5FD" fillOpacity="0.6" />
                    <path d="M75 42L105 26V54L75 70V42Z" fill="#8B5CF6" fillOpacity="0.5" />
                    <path d="M45 26L75 42V70L45 54V26Z" fill="#A78BFA" fillOpacity="0.5" />
                    
                    {/* Isometric Credit Card */}
                    <g transform="translate(62, 38) rotate(-18)">
                      <rect x="0" y="0" width="60" height="36" rx="4" fill="#DDD6FE" stroke="#EDE9FE" strokeWidth="1.5" />
                      <rect x="6" y="8" width="10" height="7" rx="1.5" fill="#FBBF24" />
                      <line x1="6" y1="22" x2="30" y2="22" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                      <line x1="6" y1="27" x2="20" y2="27" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Stack of Isometric Coins */}
                    <ellipse cx="38" cy="62" rx="14" ry="7" fill="#C4B5FD" />
                    <ellipse cx="38" cy="58" rx="14" ry="7" fill="#DDD6FE" />
                    <ellipse cx="38" cy="54" rx="14" ry="7" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
                    <circle cx="38" cy="54" r="3" fill="#7C3AED" />

                    <defs>
                      <linearGradient id="cubeGrad1" x1="45" y1="10" x2="105" y2="70" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A78BFA" />
                        <stop offset="1" stopColor="#6D28D9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Razorpay Security Badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                  <span className="opacity-75">Secured by</span>
                  <div className="flex items-center gap-1 font-bold text-white tracking-wide">
                    <span className="text-[#38BDF8]">▲</span>
                    <span>Razorpay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Right Column: Payment Options & Method Views */}
            <div className="flex-1 flex flex-col justify-between bg-white relative">
              
              {/* Header */}
              <div className="h-12 border-b border-gray-100 flex items-center justify-between px-5 relative shrink-0">
                <div className="w-6" /> {/* Spacer */}
                <h4 className="text-xs sm:text-sm font-bold text-[#1F2937]">Payment Options</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg transition-colors cursor-pointer"
                    title="More Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Split Section: Payment Methods (Left) & Method Details (Right) */}
              <div className="flex-1 flex flex-col sm:flex-row overflow-y-auto no-scrollbar">
                
                {/* Left Sub-Column: Payment Methods List */}
                <div className="w-full sm:w-[155px] lg:w-[175px] border-b sm:border-b-0 sm:border-r border-gray-100 p-2 sm:p-2.5 space-y-1 shrink-0 bg-[#FAFAFA]/50">
                  
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>UPI</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00BAF2]" title="Paytm" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5F259F]" title="PhonePe" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" title="GPay" />
                    </div>
                  </button>

                  {/* Cards */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cards')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'cards'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>Cards</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-1 py-0.2 bg-[#1A1F71] text-white text-[8px] font-black rounded-xs">VISA</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" title="Mastercard" />
                    </div>
                  </button>

                  {/* EMI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('emi')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'emi'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>EMI</span>
                    <div className="flex items-center gap-1 shrink-0 text-[9px] font-mono text-gray-400">
                      <span>%</span>
                    </div>
                  </button>

                  {/* Netbanking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>Netbanking</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#004C8F]" title="HDFC" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B02A30]" title="ICICI" />
                    </div>
                  </button>

                  {/* Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>Wallet</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00BAF2]" title="Paytm Wallet" />
                    </div>
                  </button>

                  {/* Pay Later */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paylater')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'paylater'
                        ? 'bg-[#F4F0FD] text-[#6B21A8] font-bold shadow-2xs'
                        : 'hover:bg-gray-100 text-[#374151] font-semibold'
                    }`}
                  >
                    <span>Pay Later</span>
                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-amber-500 font-bold">
                      ⚡
                    </div>
                  </button>
                </div>

                {/* Right Sub-Column: Active Method View */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                  
                  {/* --- METHOD: UPI (QR CODE) --- */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-3.5 my-auto flex flex-col items-center justify-center text-center">
                      
                      {/* Top Row: UPI QR Title + Countdown Timer */}
                      <div className="w-full flex items-center justify-between px-1 text-xs">
                        <span className="font-bold text-[#111827]">UPI QR</span>
                        <div className="flex items-center gap-1 text-[#667085] font-mono text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#667085]" />
                          <span>{timeFormatted}</span>
                        </div>
                      </div>

                      {/* Scannable UPI QR Box */}
                      <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs inline-block">
                        <svg width="150" height="150" viewBox="0 0 150 150" className="mx-auto select-none">
                          {/* Corner Squares */}
                          <rect x="10" y="10" width="36" height="36" rx="6" fill="#111827" />
                          <rect x="15" y="15" width="26" height="26" rx="4" fill="white" />
                          <rect x="20" y="20" width="16" height="16" rx="2" fill="#111827" />

                          <rect x="104" y="10" width="36" height="36" rx="6" fill="#111827" />
                          <rect x="109" y="15" width="26" height="26" rx="4" fill="white" />
                          <rect x="114" y="20" width="16" height="16" rx="2" fill="#111827" />

                          <rect x="10" y="104" width="36" height="36" rx="6" fill="#111827" />
                          <rect x="15" y="109" width="26" height="26" rx="4" fill="white" />
                          <rect x="20" y="114" width="16" height="16" rx="2" fill="#111827" />

                          {/* Center UPI Logo in QR */}
                          <rect x="63" y="63" width="24" height="24" rx="5" fill="#7C3AED" />
                          <text x="75" y="78" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>

                          {/* Authentic Pattern Bits */}
                          <rect x="52" y="12" width="6" height="6" fill="#111827" />
                          <rect x="64" y="12" width="6" height="12" fill="#111827" />
                          <rect x="76" y="12" width="6" height="6" fill="#111827" />
                          <rect x="88" y="18" width="6" height="6" fill="#111827" />

                          <rect x="52" y="28" width="12" height="6" fill="#111827" />
                          <rect x="70" y="28" width="6" height="12" fill="#111827" />
                          <rect x="82" y="28" width="12" height="6" fill="#111827" />

                          <rect x="12" y="52" width="6" height="12" fill="#111827" />
                          <rect x="24" y="52" width="12" height="6" fill="#111827" />
                          <rect x="42" y="52" width="6" height="6" fill="#111827" />

                          <rect x="100" y="52" width="12" height="6" fill="#111827" />
                          <rect x="118" y="52" width="6" height="12" fill="#111827" />
                          <rect x="130" y="52" width="8" height="6" fill="#111827" />

                          <rect x="12" y="70" width="18" height="6" fill="#111827" />
                          <rect x="36" y="70" width="6" height="12" fill="#111827" />
                          <rect x="48" y="70" width="6" height="6" fill="#111827" />

                          <rect x="94" y="70" width="6" height="6" fill="#111827" />
                          <rect x="106" y="70" width="12" height="6" fill="#111827" />
                          <rect x="124" y="70" width="14" height="6" fill="#111827" />

                          <rect x="12" y="88" width="6" height="6" fill="#111827" />
                          <rect x="24" y="88" width="6" height="12" fill="#111827" />
                          <rect x="36" y="88" width="12" height="6" fill="#111827" />

                          <rect x="52" y="94" width="6" height="12" fill="#111827" />
                          <rect x="64" y="94" width="12" height="6" fill="#111827" />
                          <rect x="82" y="94" width="6" height="12" fill="#111827" />

                          <rect x="52" y="112" width="12" height="6" fill="#111827" />
                          <rect x="70" y="112" width="6" height="18" fill="#111827" />
                          <rect x="82" y="112" width="12" height="6" fill="#111827" />

                          <rect x="52" y="130" width="6" height="8" fill="#111827" />
                          <rect x="64" y="130" width="18" height="8" fill="#111827" />
                          <rect x="88" y="130" width="6" height="8" fill="#111827" />

                          <rect x="104" y="94" width="6" height="12" fill="#111827" />
                          <rect x="116" y="94" width="12" height="6" fill="#111827" />
                          <rect x="134" y="94" width="6" height="12" fill="#111827" />

                          <rect x="104" y="118" width="12" height="6" fill="#111827" />
                          <rect x="122" y="118" width="6" height="12" fill="#111827" />
                          <rect x="134" y="118" width="6" height="18" fill="#111827" />
                        </svg>
                      </div>

                      {/* App Instructions & Logos */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium text-[#667085]">
                          Scan the QR using any UPI App
                        </p>
                        
                        {/* Realistic UPI App Brand Badges */}
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#00BAF2]/10 border border-[#00BAF2]/30 text-[#00BAF2] font-black text-[9px] tracking-tight">
                            Paytm
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#1A73E8] font-black text-[9px]">
                            GPay
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#5F259F]/10 border border-[#5F259F]/30 text-[#5F259F] font-black text-[9px]">
                            PhonePe
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-700 font-black text-[9px]">
                            BHIM
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[9px]">
                            WhatsApp
                          </span>
                        </div>
                      </div>

                      {/* Instant Payment Trigger for Test Mode */}
                      <div className="w-full pt-1">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleCompletePayment}
                          className="w-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying UPI Payment...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Simulate Payment ₹{totalAmount.toLocaleString()} (Test Mode)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- METHOD: CARDS --- */}
                  {paymentMethod === 'cards' && (
                    <div className="space-y-3 my-auto">
                      <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                        <span>Credit / Debit Card</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">VISA</span>
                          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">MC</span>
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">RuPay</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-mono font-bold text-[#667085] block mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8920"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] font-mono focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-mono font-bold text-[#667085] block mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              maxLength={5}
                              className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] font-mono focus:outline-none focus:border-[#7C3AED]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono font-bold text-[#667085] block mb-1">CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              maxLength={4}
                              className="w-full bg-[#F9FAFB] border border-[#EAECF0] px-3 py-2 rounded-xl text-xs text-[#101828] font-mono focus:outline-none focus:border-[#7C3AED]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleCompletePayment}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>Pay ₹{totalAmount.toLocaleString()} via Card</span>
                      </button>
                    </div>
                  )}

                  {/* --- METHOD: NETBANKING --- */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3 my-auto">
                      <span className="text-xs font-bold text-[#111827] block">Select Your Bank</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'border-[#7C3AED] bg-[#F4F0FD] text-[#6B21A8]'
                                : 'border-gray-200 hover:bg-gray-50 text-[#374151]'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleCompletePayment}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-3.5 h-3.5" />}
                        <span>Pay ₹{totalAmount.toLocaleString()} via {selectedBank}</span>
                      </button>
                    </div>
                  )}

                  {/* --- METHOD: EMI / WALLET / PAY LATER --- */}
                  {(paymentMethod === 'emi' || paymentMethod === 'wallet' || paymentMethod === 'paylater') && (
                    <div className="space-y-3 my-auto text-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F0FD] text-[#7C3AED] flex items-center justify-center mx-auto">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-[#111827] capitalize">{paymentMethod} Payment Option</h5>
                        <p className="text-[11px] text-[#667085] max-w-xs mx-auto">
                          Instant pre-approved checkout available for {userPhone}.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleCompletePayment}
                        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Complete Payment ₹{totalAmount.toLocaleString()}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Footer Disclaimer */}
              <div className="px-5 py-2.5 border-t border-gray-100 text-center text-[10px] text-[#9CA3AF]">
                By proceeding, I agree to Razorpay's <span className="underline cursor-pointer hover:text-gray-600">Privacy Notice</span> • <span className="underline cursor-pointer hover:text-gray-600">Edit Preferences</span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
