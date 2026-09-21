import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Sparkles,
  Lock,
  ArrowRight,
  Globe,
  Radio,
  Sliders,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BACKEND_URL } from '../../services/apiConfig';
import { useApp } from '../../context/AppContext';

export const MetaEmbeddedSignupModal = ({ isOpen, onClose, onConnected }) => {
  const { currentWorkspaceId, currentUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('meta_oauth'); // 'meta_oauth' | 'fast_connect'
  const [oauthConfig, setOAuthConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedData, setConnectedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fast Connect Form
  const [businessName, setBusinessName] = useState('DhiGrowth Business');
  const [phoneNumber, setPhoneNumber] = useState('+91 97914 71277');
  const [wabaIdInput, setWabaIdInput] = useState('1611291237194962');
  const [phoneIdInput, setPhoneIdInput] = useState('1272943605907701');

  // Load public Meta OAuth config from backend
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    setConnectedData(null);

    const loadConfig = async () => {
      setIsLoadingConfig(true);
      try {
        let res;
        try {
          res = await fetch(`${BACKEND_URL}/api/meta/oauth/config`);
        } catch {}
        if (!res || !res.ok) {
          try {
            res = await fetch(`http://localhost:4000/api/meta/oauth/config`);
          } catch {}
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data.config) setOAuthConfig(data.config);
        }
      } catch (err) {
        console.warn('Could not fetch Meta OAuth config:', err.message);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadConfig();

    // Dynamically inject Meta Facebook JavaScript SDK if not already present
    if (!window.FB && !document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);

      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.init({
            appId: oauthConfig?.appId || '1611291237194962',
            cookie: true,
            xfbml: true,
            version: 'v20.0',
          });
        }
      };
    }
  }, [isOpen]);

  // Listen for Meta Embedded Signup postMessage session info
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📥 [MetaEmbeddedSignup] Received session info event:', data);
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data || {};
            handleCompleteRegistration({
              phoneNumberId: phone_number_id,
              wabaId: waba_id,
            });
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentWorkspaceId, currentUser]);

  // Trigger Official Meta Embedded Signup Popup
  const launchMetaEmbeddedSignup = () => {
    setIsConnecting(true);
    setErrorMessage('');

    if (window.FB) {
      try {
        window.FB.login(
          (response) => {
            if (response.authResponse && response.authResponse.code) {
              handleCompleteRegistration({
                code: response.authResponse.code,
              });
            } else if (response.authResponse && response.authResponse.accessToken) {
              handleCompleteRegistration({
                accessToken: response.authResponse.accessToken,
              });
            } else {
              setIsConnecting(false);
              // Fallback to Express Connect if user cancelled or popup blocked
              console.log('Meta popup closed or cancelled, ready for Express Connect');
            }
          },
          {
            config_id: oauthConfig?.configId || undefined,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
              feature: 'whatsapp_embedded_signup',
              version: 2,
              sessionInfoVersion: 2,
            },
          }
        );
      } catch (err) {
        console.warn('FB.login error, switching to Express Connect:', err.message);
        setIsConnecting(false);
        setActiveTab('fast_connect');
      }
    } else {
      // If FB SDK not blocked by adblockers, switch to Express Connect tab
      setIsConnecting(false);
      setActiveTab('fast_connect');
      showToast('Meta SDK popup initializing. You can also use 1-Click Express Connect below!', 'info');
    }
  };

  // Complete Registration with Backend
  const handleCompleteRegistration = async (params = {}) => {
    setIsConnecting(true);
    setErrorMessage('');

    const payload = {
      workspaceId: currentWorkspaceId || 'b0000000-0000-0000-0000-000000000001',
      username: currentUser?.username || 'sri',
      phoneNumberId: params.phoneNumberId || phoneIdInput,
      wabaId: params.wabaId || wabaIdInput,
      phoneNumber: params.phoneNumber || phoneNumber,
      businessName: params.businessName || businessName,
      code: params.code || null,
      accessToken: params.accessToken || null,
    };

    try {
      let res;
      try {
        res = await fetch(`${BACKEND_URL}/api/meta/embedded-signup/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`http://localhost:4000/api/meta/embedded-signup/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {}
      }

      if (res && res.ok) {
        const result = await res.json();
        setConnectedData(result.channel || payload);

        // Confetti celebration
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#25D366', '#1877F2', '#7C3AED'],
          });
        } catch {}

        showToast('WhatsApp Business Account successfully linked in 1 click!', 'success');
        if (onConnected) onConnected(result.channel || payload);
      } else {
        throw new Error('Failed to complete Meta registration');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not link WhatsApp account. Please verify credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981]">
            <Smartphone className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#101828]">Meta Embedded Signup</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                Official Meta Flow
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Link your WhatsApp Business Account (WABA) in 1 click via Facebook Login
            </p>
          </div>
        </div>

        {/* Tabs: Official OAuth vs 1-Click Express */}
        <div className="flex items-center gap-2 border-b border-[#EAECF0] pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('meta_oauth')}
            className={`pb-2 -mb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'meta_oauth'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Login with Facebook (OAuth)</span>
          </button>
          <button
            onClick={() => setActiveTab('fast_connect')}
            className={`pb-2 -mb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fast_connect'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-[#667085] hover:text-[#101828]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Express Connect</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Connection Note: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Connected State */}
        {connectedData ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-emerald-950">WhatsApp Business Connected!</h4>
              <p className="text-xs text-emerald-700">
                Phone Number <strong>{connectedData.phoneNumber}</strong> is now live and synchronized with your Cloud Supabase CRM.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs text-left grid grid-cols-2 gap-2 text-[#475467]">
              <div>
                <span className="text-[10px] text-[#98A2B3] uppercase">Display Name</span>
                <p className="font-bold text-[#101828] truncate">{connectedData.businessName || 'WhatsApp Business'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#98A2B3] uppercase">Quality Rating</span>
                <p className="font-bold text-emerald-600">● {connectedData.qualityRating || 'GREEN'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#98A2B3] uppercase">Phone ID</span>
                <p className="font-mono text-[11px] truncate">{connectedData.phoneNumberId}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#98A2B3] uppercase">WABA ID</span>
                <p className="font-mono text-[11px] truncate">{connectedData.wabaId}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Done & Return to Settings
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: Meta Official OAuth Flow */}
            {activeTab === 'meta_oauth' && (
              <div className="space-y-4">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <ShieldCheck className="w-4 h-4 text-[#1877F2]" />
                    <span>How Meta 1-Click Embedded Signup Works</span>
                  </div>
                  <ul className="text-xs text-[#475467] space-y-1.5 list-disc list-inside">
                    <li>Opens the official secure Meta popup dialog.</li>
                    <li>Select or create your Meta Business Account and phone number in seconds.</li>
                    <li>Meta automatically grants permissions and subscribes webhooks with zero manual tokens.</li>
                  </ul>
                </div>

                {/* Big Blue Facebook / Meta Button */}
                <button
                  onClick={launchMetaEmbeddedSignup}
                  disabled={isConnecting}
                  className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Opening Meta Authentication...</span>
                    </>
                  ) : (
                    <>
                      {/* Meta Facebook Icon */}
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Continue with Facebook</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#98A2B3]">
                  Protected by Meta Business Terms & Official WhatsApp Cloud API
                </p>
              </div>
            )}

            {/* TAB 2: Fast Express Connect */}
            {activeTab === 'fast_connect' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCompleteRegistration();
                }}
                className="space-y-3.5"
              >
                <div className="bg-[#FAF5FF] border border-[#E9D8FD] p-3.5 rounded-2xl text-xs text-[#6B21A8]">
                  <strong>⚡ Instant Express Connect:</strong> Instantly links your WhatsApp phone and WABA directly to your cloud CRM workspace.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#475467]">Business / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#475467]">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#475467]">Phone Number ID</label>
                    <input
                      type="text"
                      required
                      value={phoneIdInput}
                      onChange={(e) => setPhoneIdInput(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#475467]">WhatsApp Business Account ID (WABA)</label>
                    <input
                      type="text"
                      required
                      value={wabaIdInput}
                      onChange={(e) => setWabaIdInput(e.target.value)}
                      className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Linking Account...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Link WhatsApp Business Account (1-Click)</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
