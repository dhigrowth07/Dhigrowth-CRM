import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, MessageSquare, PhoneCall, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SendieeWidgetModal = () => {
  const { isWidgetOpen, setIsWidgetOpen, showToast } = useApp();
  const [messages, setMessages] = useState([
    { id: 'w1', sender: 'ai', text: 'Hello Sri! 👋 Welcome to Dhigrowth CRM. How can I help you set up WhatsApp Business Cloud API or automated AI chatbots today?' }
  ]);
  const [input, setInput] = useState('');

  if (!isWidgetOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: `w-${Date.now()}`, sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const curr = input;
    setInput('');

    setTimeout(() => {
      let reply = `Thanks for asking! As your Dhigrowth CRM concierge, I can connect your WhatsApp number in 20 minutes, configure AI auto-replies, or trigger bulk broadcast campaigns.`;
      if (curr.toLowerCase().includes('pricing') || curr.toLowerCase().includes('plan')) {
        reply = `Dhigrowth CRM plans start with 14-day full Business trial + $5 AI wallet credit! Zero markup on Meta WhatsApp conversation rates.`;
      } else if (curr.toLowerCase().includes('green') || curr.toLowerCase().includes('tick') || curr.toLowerCase().includes('verify')) {
        reply = `We file your Meta Verified Green Tick badge application for free. It usually gets reviewed within 24-48 hours.`;
      }

      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: reply }]);
    }, 700);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 w-96 bg-white border border-[#EAECF0] rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans flex flex-col h-[480px]">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
              <span>Dhigrowth AI Concierge</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
            </h4>
            <div className="text-[10px] text-purple-200">Official Meta Business Partner</div>
          </div>
        </div>

        <button
          onClick={() => setIsWidgetOpen(false)}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F9FC]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#7C3AED] text-white rounded-tr-xs'
                  : 'bg-white border border-[#EAECF0] text-[#101828] rounded-tl-xs shadow-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#EAECF0] flex gap-2">
        <input
          type="text"
          placeholder="Ask Dhigrowth AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
