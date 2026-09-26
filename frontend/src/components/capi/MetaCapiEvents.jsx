import React, { useState } from 'react';
import {
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MetaCapiEvents = () => {
  const { showToast } = useApp();
  const [events, setEvents] = useState([
    { id: 'ev-1', name: 'Purchase', value: '₹2,499 INR', user: '+91 97914... (Priya S.)', time: '10:30 AM', match: '9.8 / 10', status: 'HTTP 200' },
    { id: 'ev-2', name: 'Lead', value: '$1,200 USD', user: 'david_m_sf (David M.)', time: '10:24 AM', match: '9.5 / 10', status: 'HTTP 200' },
    { id: 'ev-3', name: 'InitiateCheckout', value: '$4,800 USD', user: '+971 50 234... (Tariq)', time: '09:15 AM', match: '9.9 / 10', status: 'HTTP 200' },
  ]);

  const [eventName, setEventName] = useState('Purchase');
  const [val, setVal] = useState('2499');

  const handleDispatch = (e) => {
    e.preventDefault();
    const newEv = {
      id: `ev-${Date.now()}`,
      name: eventName,
      value: `₹${val} INR`,
      user: '+91 98765... (Live Test)',
      time: 'Just now',
      match: '9.9 / 10',
      status: 'HTTP 200',
    };
    setEvents((prev) => [newEv, ...prev]);
    showToast(`Meta CAPI Event "${eventName}" dispatched to Graph API!`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Meta Conversions API (CAPI) & Pixel Hub</h1>
          <p className="text-xs text-[#667085]">
            Direct server-to-server event tracking from WhatsApp and Instagram with 9.8/10 event match quality.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
          <span>Meta Graph API v21.0 Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events Table (7 cols) */}
        <div className="lg:col-span-7 sendiee-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">Live Event Stream</h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#7C3AED] bg-[#F4F0FD] px-2 py-0.5 rounded-full font-mono">
                      {ev.name}
                    </span>
                    <span className="font-medium text-[#101828]">{ev.user}</span>
                  </div>
                  <span className="text-[10px] text-[#98A2B3] font-mono">{ev.time}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#667085] pt-1">
                  <span>Match Quality: <strong className="text-[#16A34A]">{ev.match}</strong></span>
                  <span className="font-mono font-bold text-[#16A34A]">{ev.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatcher (5 cols) */}
        <div className="lg:col-span-5 sendiee-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">Test Event Dispatcher</h3>

          <form onSubmit={handleDispatch} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#475467]">Event Type</label>
              <select
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Purchase">Purchase (Conversion)</option>
                <option value="InitiateCheckout">InitiateCheckout</option>
                <option value="Lead">Lead (WhatsApp Chat Started)</option>
                <option value="AddToCart">AddToCart</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#475467]">Value (INR)</label>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
            >
              Dispatch Event to Meta Pixel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
