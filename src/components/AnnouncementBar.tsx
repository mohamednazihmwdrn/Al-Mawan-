import React from 'react';
import { useStore } from '../context/StoreContext';
import { Megaphone, Phone, MessageSquare, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, activeView, setActiveView } = useStore();

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 text-xs sm:text-sm font-semibold shadow-inner transition-colors">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Notice Message with Icon */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-[280px]">
          <span className="flex items-center justify-center bg-slate-950 text-amber-400 p-1 rounded-full text-xs shadow shrink-0">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <div className="truncate font-bold tracking-tight">
            {settings.announcementNotice}
          </div>
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <a
            href={`tel:${settings.phoneNumber}`}
            className="hidden md:flex items-center gap-1 hover:text-white transition-colors bg-amber-700/20 px-2 py-0.5 rounded font-bold"
          >
            <Phone className="w-3 h-3" />
            <span dir="ltr">{settings.phoneNumber}</span>
          </a>

          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('السلام عليكم، استفسار بخصوص منتجات الموان')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors bg-emerald-700/20 px-2.5 py-1 rounded text-emerald-950 font-bold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-900" />
            <span>طلب واتساب مباشر</span>
          </a>
        </div>
      </div>
    </div>
  );
};
