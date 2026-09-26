import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-purple-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md">
      <div className="bg-[#181926] border border-purple-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
        {icons[toastMessage.type] || icons.info}
        <span className="text-xs font-medium text-slate-200">{toastMessage.message}</span>
      </div>
    </div>
  );
};
