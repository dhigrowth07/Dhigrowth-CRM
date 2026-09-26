import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  Info,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Layers,
  Bell,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ZohoIntegrationPage = () => {
  const { showToast, setActiveTab } = useApp();

  const [activeNav, setActiveNav] = useState('setup'); // 'setup' | 'notifications'
  const [datacenter, setDatacenter] = useState('United States');
  const [selectedProducts, setSelectedProducts] = useState({
    crm: true,
    inventory: false,
    desk: false,
    books: false,
  });
  const [isConnected, setIsConnected] = useState(false);

  const toggleProduct = (prod) => {
    setSelectedProducts((prev) => ({ ...prev, [prod]: !prev[prod] }));
  };

  const handleConnect = () => {
    setIsConnected(true);
    showToast(`Zoho CRM & Books successfully linked in (${datacenter}) datacenter!`, 'success');
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
          <span className="text-[#101828] font-semibold">Zoho Integration</span>
        </div>
        <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1">
          Connection Setup
        </h1>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Navigation Menu (3 cols) */}
        <div className="lg:col-span-3 sendiee-card p-3 space-y-1">
          <button
            onClick={() => setActiveNav('setup')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeNav === 'setup'
                ? 'bg-[#FAF5FF] text-[#7C3AED] font-bold border border-[#E9D8FD]'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Link2 className="w-4 h-4 text-[#7C3AED]" />
            <span>Connection Setup</span>
          </button>

          <button
            onClick={() => setActiveNav('notifications')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeNav === 'notifications'
                ? 'bg-[#FAF5FF] text-[#7C3AED] font-bold border border-[#E9D8FD]'
                : 'text-[#475467] hover:bg-[#F9FAFB]'
            }`}
          >
            <Bell className="w-4 h-4 text-[#667085]" />
            <span>Notification Settings</span>
          </button>
        </div>

        {/* Right Content Card (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {activeNav === 'setup' ? (
            <div className="sendiee-card p-6 space-y-6">
              {/* Header with Zoho 4-color box logo */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[#FAF8F5] border border-[#EAECF0]">
                  <span className="w-3 h-3 rounded-xs bg-[#E42528]" />
                  <span className="w-3 h-3 rounded-xs bg-[#22B24C]" />
                  <span className="w-3 h-3 rounded-xs bg-[#008DD2]" />
                  <span className="w-3 h-3 rounded-xs bg-[#FDB813]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#101828]">Connect Zoho</h2>
                  <p className="text-xs text-[#667085]">
                    Integrate your Zoho apps to sync contacts and automate notifications
                  </p>
                </div>
              </div>

              {/* Field 1: Select Datacenter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#344054]">
                  <span className="text-[#DC2626] mr-1">*</span>Select Datacenter
                </label>
                <div className="relative">
                  <select
                    value={datacenter}
                    onChange={(e) => setDatacenter(e.target.value)}
                    className="w-full appearance-none bg-[#FAF8F5] border border-[#EAECF0] p-3 pr-10 rounded-xl text-xs font-medium text-[#101828] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="United States">United States (zoho.com)</option>
                    <option value="India">India (zoho.in)</option>
                    <option value="Europe">Europe (zoho.eu)</option>
                    <option value="Australia">Australia (zoho.com.au)</option>
                    <option value="Japan">Japan (zoho.jp)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#98A2B3] absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Select Products to Connect */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#344054]">
                  <span className="text-[#DC2626] mr-1">*</span>Select Products to Connect
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Zoho CRM */}
                  <div
                    onClick={() => toggleProduct('crm')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProducts.crm
                        ? 'border-[#7C3AED] bg-[#FAF5FF]'
                        : 'border-[#EAECF0] bg-[#FAF8F5]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                        selectedProducts.crm ? 'bg-[#7C3AED]' : 'border border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {selectedProducts.crm && <CheckCircle2 className="w-3.5 h-3.5 fill-[#7C3AED] text-white" />}
                    </div>
                    <span className="text-xs font-bold text-[#101828]">Zoho CRM</span>
                  </div>

                  {/* Zoho Inventory */}
                  <div
                    onClick={() => toggleProduct('inventory')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProducts.inventory
                        ? 'border-[#7C3AED] bg-[#FAF5FF]'
                        : 'border-[#EAECF0] bg-[#FAF8F5]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                        selectedProducts.inventory ? 'bg-[#7C3AED]' : 'border border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {selectedProducts.inventory && <CheckCircle2 className="w-3.5 h-3.5 fill-[#7C3AED] text-white" />}
                    </div>
                    <span className="text-xs font-bold text-[#101828]">Zoho Inventory</span>
                  </div>

                  {/* Zoho Desk */}
                  <div
                    onClick={() => toggleProduct('desk')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProducts.desk
                        ? 'border-[#7C3AED] bg-[#FAF5FF]'
                        : 'border-[#EAECF0] bg-[#FAF8F5]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                        selectedProducts.desk ? 'bg-[#7C3AED]' : 'border border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {selectedProducts.desk && <CheckCircle2 className="w-3.5 h-3.5 fill-[#7C3AED] text-white" />}
                    </div>
                    <span className="text-xs font-bold text-[#101828]">Zoho Desk</span>
                  </div>

                  {/* Zoho Books */}
                  <div
                    onClick={() => toggleProduct('books')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProducts.books
                        ? 'border-[#7C3AED] bg-[#FAF5FF]'
                        : 'border-[#EAECF0] bg-[#FAF8F5]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                        selectedProducts.books ? 'bg-[#7C3AED]' : 'border border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {selectedProducts.books && <CheckCircle2 className="w-3.5 h-3.5 fill-[#7C3AED] text-white" />}
                    </div>
                    <span className="text-xs font-bold text-[#101828]">Zoho Books</span>
                  </div>
                </div>
              </div>

              {/* Connect Zoho Button */}
              <button
                onClick={handleConnect}
                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isConnected ? 'Zoho Connected (✓)' : 'Connect Zoho'}</span>
              </button>

              {/* Info Box */}
              <div className="p-4 rounded-2xl bg-[#EFF8FF] border border-[#B2DDFF] flex items-start gap-3 text-xs text-[#175CD3]">
                <Info className="w-4 h-4 text-[#175CD3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Secure OAuth Connection</div>
                  <div className="text-[11px] text-[#175CD3]/90">
                    You'll be redirected to Zoho to authorize this connection. We'll never store your password.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sendiee-card p-6 space-y-4">
              <h2 className="text-base font-bold text-[#101828]">Notification Triggers</h2>
              <p className="text-xs text-[#667085]">
                Send automatic WhatsApp alerts whenever a Zoho invoice is created or lead is updated.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAECF0] text-xs space-y-2">
                <div className="font-bold text-[#101828]">Trigger WhatsApp alert on Zoho Books Invoice paid</div>
                <div className="text-[11px] text-[#667085]">Sends PDF receipt directly to customer's WhatsApp.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
