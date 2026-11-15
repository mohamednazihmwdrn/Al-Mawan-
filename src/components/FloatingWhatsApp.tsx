import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();

  const handleClick = () => {
    const defaultText = `السلام عليكم ورحمة الله، أتواصل معكم من خلال موقع متجر الموان للحدايد والبويات ولوازم المعمار للاستفسار والطلب.`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(defaultText)}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center group mobile-floating-whatsapp">
      {/* Tooltip on hover */}
      <div className="hidden md:block ml-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        تواصل فوري عبر واتساب
      </div>

      <button
        onClick={handleClick}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 relative"
        aria-label="تواصل عبر واتساب"
      >
        {/* Radar ping ring */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-35" />
        
        {/* WhatsApp Icon */}
        <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.491 1.199.534 1.286.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 22l4.98-1.305A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.15-.494-4.417-1.34l-.316-.213-3.277.859.874-3.194-.233-.371A8.127 8.127 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
        </svg>
      </button>
    </div>
  );
};
