import React, { useState } from 'react';
import {
  Sparkles,
  GripVertical,
  Plus,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers,
  Palette,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeadStudioPage = () => {
  const { showToast, setActiveTab } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [stages, setStages] = useState([
    { id: 'st-1', name: 'Not Categorized', type: 'ENTRY', enabled: true, color: '#334155' },
    { id: 'st-2', name: 'Hot Lead (High Intent)', type: 'PIPELINE', enabled: true, color: '#DC2626' },
    { id: 'st-3', name: 'Product Interested', type: 'PIPELINE', enabled: true, color: '#16A34A' },
    { id: 'st-4', name: 'Payment Link Sent', type: 'ACTION', enabled: true, color: '#7C3AED' },
  ]);

  const [newStageName, setNewStageName] = useState('');
  const [isAddingStage, setIsAddingStage] = useState(false);

  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const newSt = {
      id: `st-${Date.now()}`,
      name: newStageName,
      type: 'CUSTOM',
      enabled: true,
      color: '#7C3AED',
    };
    setStages((prev) => [...prev, newSt]);
    setNewStageName('');
    setIsAddingStage(false);
    showToast(`Added stage "${newStageName}" to pipeline!`, 'success');
  };

  const toggleStage = (id) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">Lead Studio</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            Lead Studio
          </h1>
          <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
            EXPERIMENTAL
          </span>
        </div>
      </div>

      {/* 2. Top Wizard Container */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-[#101828]">Set Up Lead Studio</h2>
        <p className="text-xs text-[#667085]">
          Configure your lead pipeline in 3 simple steps
        </p>

        {/* 3 Step Progress Bar matching screenshot */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? 'border-[#7C3AED] bg-white shadow-sm ring-1 ring-[#7C3AED]'
                : 'border-[#EAECF0] bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 1 ? 'bg-[#7C3AED] text-white' : 'bg-[#EAECF0] text-[#667085]'
              }`}>
                1
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#101828]">Stages</div>
                <div className="text-[10px] text-[#667085] truncate">Configure your lead stages</div>
              </div>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 2
                ? 'border-[#7C3AED] bg-white shadow-sm ring-1 ring-[#7C3AED]'
                : 'border-[#EAECF0] bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 2 ? 'bg-[#7C3AED] text-white' : 'bg-[#EAECF0] text-[#667085]'
              }`}>
                2
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#101828]">Preferences</div>
                <div className="text-[10px] text-[#667085] truncate">Set your defaults</div>
              </div>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 3
                ? 'border-[#7C3AED] bg-white shadow-sm ring-1 ring-[#7C3AED]'
                : 'border-[#EAECF0] bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 3 ? 'bg-[#7C3AED] text-white' : 'bg-[#EAECF0] text-[#667085]'
              }`}>
                3
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#101828]">Confirm</div>
                <div className="text-[10px] text-[#667085] truncate">Review and launch</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Main Step 1 Card: Configure Lead Stages */}
      {currentStep === 1 && (
        <div className="sendiee-card p-6 space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Configure Lead Stages</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Drag to reorder, set types and colors for each stage
            </p>
          </div>

          {/* Stages Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold font-mono uppercase text-[#98A2B3] px-4 pb-1">
              <div className="col-span-6">STAGE NAME</div>
              <div className="col-span-3">TYPE</div>
              <div className="col-span-3 text-right">COLOR IN FLOW</div>
            </div>

            <div className="space-y-2">
              {stages.map((st) => (
                <div
                  key={st.id}
                  className="grid grid-cols-12 items-center p-3.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl text-xs hover:border-[#D0D5DD] transition-colors"
                >
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <GripVertical className="w-4 h-4 text-[#98A2B3] shrink-0 cursor-grab" />
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="font-bold text-[#101828] truncate">{st.name}</span>
                  </div>

                  <div className="col-span-3">
                    <span className="text-[10px] font-mono font-bold bg-[#EAECF0] text-[#475467] px-2.5 py-1 rounded-md">
                      {st.type}
                    </span>
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => toggleStage(st.id)}
                      className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        st.enabled ? 'bg-[#7C3AED]' : 'bg-[#EAECF0]'
                      }`}
                    >
                      <div
                        className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                          st.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Stage Button */}
            {isAddingStage ? (
              <form onSubmit={handleAddStage} className="p-4 rounded-2xl bg-white border border-[#E9D8FD] flex gap-2 animate-in fade-in">
                <input
                  type="text"
                  required
                  placeholder="Stage Name (e.g. Awaiting Customer Payment)"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="flex-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Stage
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="w-full py-3.5 border border-dashed border-[#EAECF0] hover:border-[#7C3AED] rounded-2xl text-xs font-bold text-[#7C3AED] flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stage</span>
              </button>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#EAECF0]">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Next: Preferences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="sendiee-card p-6 space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-[#101828]">Automation Preferences</h3>
            <p className="text-xs text-[#667085] mt-0.5">Set automatic stage transition rules</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#101828]">Auto-promote to Hot Lead upon asking for pricing</div>
                <div className="text-[11px] text-[#667085]">AI triggers instant hot tag when user requests price or COD</div>
              </div>
              <button className="w-9 h-5 flex items-center rounded-full p-1 bg-[#7C3AED]">
                <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md translate-x-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t border-[#EAECF0]">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-[#EAECF0] text-xs font-bold text-[#475467] rounded-xl hover:bg-[#F9FAFB]"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: Confirm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="sendiee-card p-6 space-y-6 max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#101828]">Pipeline Ready to Launch</h3>
            <p className="text-xs text-[#667085]">
              Your Lead Studio rules have been compiled into active Meta Cloud API webhooks.
            </p>
          </div>
          <button
            onClick={() => {
              showToast('Lead Studio pipeline deployed to production!', 'success');
              setActiveTab('leads');
            }}
            className="px-8 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Launch Pipeline & Open Leads CRM
          </button>
        </div>
      )}
    </div>
  );
};
