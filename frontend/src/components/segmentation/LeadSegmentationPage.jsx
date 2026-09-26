import React, { useState } from 'react';
import {
  ShoppingBag,
  Target,
  Headphones,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Filter,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeadSegmentationPage = () => {
  const { showToast, setActiveTab } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const TEMPLATES = [
    {
      id: 'ecommerce',
      title: 'E-commerce',
      description: 'Online stores, product catalog buyers, abandoned-cart leads.',
      meta: '6 categories · 3 insights · 3 default follow-ups',
      icon: ShoppingBag,
    },
    {
      id: 'leadgen',
      title: 'Lead Gen',
      description: 'B2B / service businesses, demo bookings, qualification flows.',
      meta: '5 categories · 4 insights · 3 default follow-ups',
      icon: Target,
    },
    {
      id: 'support',
      title: 'Customer Support',
      description: 'Inbound support / helpdesk routing for existing customers.',
      meta: '5 categories · 3 insights · 2 default follow-ups',
      icon: Headphones,
    },
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    showToast(`Applied starter pack: "${template.title}"`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-[1200px] mx-auto font-sans min-h-[calc(100vh-6rem)] flex flex-col justify-center">
      {/* Centered Heading */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
          Start with a template
        </h1>
        <p className="text-xs lg:text-sm text-[#667085] leading-relaxed">
          Pre-built starter packs for common use cases. Pick one to populate categories, lead insights, and default follow-ups — you can edit everything after.
        </p>
      </div>

      {/* 3 Template Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`bg-white border rounded-3xl p-6 space-y-4 hover:border-[#7C3AED] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-sm'
                  : 'border-[#EAECF0]'
              }`}
            >
              <div className="space-y-4">
                {/* Purple Icon Box */}
                <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                  <Icon className="w-5 h-5 text-[#7C3AED]" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-[#101828]">{tmpl.title}</h3>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              {/* Meta details footer */}
              <div className="text-[11px] text-[#98A2B3] font-mono pt-3 border-t border-[#F2F4F7]">
                {tmpl.meta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={() => {
            showToast('Opening custom segmentation rule builder', 'info');
            setActiveTab('leads');
          }}
          className="text-xs font-semibold text-[#667085] hover:text-[#101828] hover:underline cursor-pointer"
        >
          Skip — I'll set it up from scratch
        </button>
      </div>
    </div>
  );
};
