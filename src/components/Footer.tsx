import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    settings,
    brands,
    setSelectedCategoryId,
    setSelectedFilter,
    setSearchQuery,
    closeProductDetails,
    triggerSecretClick
  } = useStore();

  const handleBrandClick = (brandName: string) => {
    setSelectedCategoryId(null);
    setSelectedFilter('all');
    setSearchQuery(brandName);
    closeProductDetails();
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0b1c3d] text-slate-300 pt-7 pb-6 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        {/* Address & Contact Info */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">
            التواصل وفروع المحل
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-slate-200 leading-snug">{settings.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${settings.phoneNumber || '01008377405'}`}
                  dir="ltr"
                  className="text-white font-bold hover:text-amber-400"
                >
                  {settings.phoneNumber || '01008377405'}
                </a>
                <span className="text-slate-500">|</span>
                <a
                  href={`tel:${settings.phoneNumber2 || '01029190615'}`}
                  dir="ltr"
                  className="text-white font-bold hover:text-amber-400"
                >
                  {settings.phoneNumber2 || '01029190615'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-400 shrink-0" />
              <a
                href={`https://wa.me/${settings.whatsappNumber || '201029190615'}?text=${encodeURIComponent('السلام عليكم، استفسار بخصوص منتجات الموان')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold hover:text-green-400"
                dir="ltr"
              >
                {settings.phoneNumber2 || '01029190615'} (واتساب مبيعات)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{settings.workingHours}</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-white/10 text-center text-[11px] text-slate-400">
          <span>
            جميع الحقوق محفوظة © {new Date().getFullYear()} لـ{' '}
            <strong
              onClick={triggerSecretClick}
              className="text-slate-200 select-none"
            >
              {settings.storeName}
            </strong>
          </span>
        </div>

        {/* Compact Side-by-Side Brands Underneath */}
        {settings.showBrands !== false && brands.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-center text-xs font-bold text-slate-300 mb-3">
              {settings.brandsTitle || 'علاماتنا التجارية وشركاء النجاح'}
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandClick(brand.name)}
                  title={`${brand.name} - ${brand.label}`}
                  className="w-[70px] sm:w-[78px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 p-1.5 flex flex-col items-center transition-all group"
                >
                  {brand.logoUrl ? (
                    <div className="w-full h-9 sm:h-10 rounded-lg bg-white flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={brand.logoUrl}
                        alt={`${brand.name} - ${brand.label}`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-9 sm:h-10 rounded-lg bg-white flex items-center justify-center px-1">
                      <span className="text-[10px] font-black text-slate-900 font-mono truncate">
                        {brand.name}
                      </span>
                    </div>
                  )}
                  <span className="text-[9px] font-bold text-slate-300 group-hover:text-white mt-1 line-clamp-1 w-full text-center">
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

