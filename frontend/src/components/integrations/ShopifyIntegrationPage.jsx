import React, { useState } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  MessageSquare,
  ShoppingCart,
  Truck,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShopifyIntegrationPage = () => {
  const { showToast, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'messages' | 'abandoned-cart' | 'cod-flow'
  const [storeUrl, setStoreUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectStore = (e) => {
    e.preventDefault();
    if (!storeUrl.trim()) return;

    setIsConnected(true);
    showToast(`Shopify store "${storeUrl}.myshopify.com" linked to WhatsApp Commerce!`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span>Integrations</span>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Shopify Store</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight mt-1">
          Shopify integration
        </h1>
        <p className="text-xs lg:text-sm text-[#475467] mt-0.5">
          Sync products, orders, customers and abandoned carts between your Shopify store and WAPPPILOT — automatically.
        </p>
      </div>

      {/* 2. Sub-Tabs Bar matching screenshot */}
      <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-2xl w-fit overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('messages')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'messages'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => setActiveSubTab('abandoned-cart')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'abandoned-cart'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Abandoned cart</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cod-flow')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'cod-flow'
              ? 'bg-white text-[#101828] shadow-2xs font-bold border border-[#EAECF0]'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>COD flow</span>
          <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.2 rounded-md ml-1">
            New
          </span>
        </button>
      </div>

      {/* 3. Status Alert Card (Top) */}
      <div className="p-5 rounded-2xl bg-[#FFFDF5] border border-[#FEF0C7] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FEE4E2] border border-[#FECACA] flex items-center justify-center text-[#D92D20] shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#D92D20]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#FEF0C7] text-[#B54708] px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B54708]" />
                <span>{isConnected ? 'CONNECTED' : 'NOT CONNECTED'}</span>
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#101828] mt-1">
              Connect your Shopify store
            </h3>
            <p className="text-xs text-[#667085]">
              Sync products, orders, customers, and recover abandoned carts via WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Main Connect Card */}
      <div className="sendiee-card p-6 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#95BF47]/20 border border-[#95BF47]/30 flex items-center justify-center text-[#5E8E3E]">
            <ShoppingBag className="w-5 h-5 text-[#5E8E3E]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101828]">Connect your Shopify store</h2>
            <p className="text-xs text-[#667085]">
              Authorise WAPPPILOT to read orders, customers, inventory, and write draft orders so we can power WhatsApp commerce.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConnectStore} className="space-y-2">
          <label className="text-xs font-semibold text-[#344054]">Shopify store URL</label>
          <div className="flex items-center gap-2 max-w-xl">
            <div className="flex items-center flex-1 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl px-3.5 py-2 text-xs text-[#101828] focus-within:border-[#7C3AED]">
              <span className="text-[#98A2B3] pr-2 font-mono">https://</span>
              <input
                type="text"
                required
                placeholder="my-shop.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="bg-transparent flex-1 text-xs text-[#101828] focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Connect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-[#667085] pt-1">
            Use the <code className="text-[#7C3AED] font-mono font-semibold">.myshopify.com</code> domain (not your custom domain). You'll be redirected to Shopify to authorise the install.{' '}
            <a href="https://help.shopify.com" target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline">
              Where to find my .myshopify.com domain?
            </a>
          </div>
        </form>

        {/* Info Box (Bottom) */}
        <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-[#B9E6FE] flex items-start gap-3 text-xs text-[#026AA2]">
          <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[#026AA2]">Installed from the Shopify App Store?</div>
            <div className="text-[11px] text-[#026AA2]/90">
              If you started the installation from Shopify and were redirected here, finish linking it to this workspace from the pending-connection banner above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
