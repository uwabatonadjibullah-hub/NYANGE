import React from 'react';
import { AlertTriangle, PhoneCall, HeartHandshake } from 'lucide-react';
import { Language } from '../types';

interface EmergencyFloatingButtonProps {
  onTriggerEmergency: () => void;
  currentLanguage: Language;
}

export const EmergencyFloatingButton: React.FC<EmergencyFloatingButtonProps> = ({
  onTriggerEmergency,
  currentLanguage
}) => {
  const labels: Record<Language, { title: string; subtitle: string }> = {
    en: { title: 'Emergency', subtitle: 'Family Tragedy' },
    sw: { title: 'Dharura', subtitle: 'Msiba / Taarifa' },
    rw: { title: 'Ibyago', subtitle: 'Ubutumwa bwihutirwa' }
  };

  const label = labels[currentLanguage] || labels.en;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 group">
      {/* Tooltip / Hint on desktop hover */}
      <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-neutral-700 whitespace-nowrap pointer-events-none">
        Report urgent family tragedy or bereavement
      </div>

      {/* Primary Emergency Floating Trigger */}
      <button
        onClick={onTriggerEmergency}
        aria-label="Emergency Family Notification"
        className="relative flex items-center gap-2.5 px-4 py-3.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-rose-300 ring-4 ring-rose-600/30 touch-target"
      >
        {/* Pulsing beacon circle */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <AlertTriangle className="w-4 h-4 text-white shrink-0" />

        <div className="flex flex-col text-left leading-none">
          <span className="text-xs font-black tracking-wider text-white">
            {label.title}
          </span>
          <span className="text-[9px] font-medium text-rose-100 uppercase tracking-tight mt-0.5">
            {label.subtitle}
          </span>
        </div>
      </button>
    </div>
  );
};
