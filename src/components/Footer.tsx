import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Palette,
  CreditCard,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories, setSelectedCategoryId, closeProductDetails, setIsPaintStudioOpen, triggerSecretClick } = useStore();

  return (
    <footer className="bg-[#0b1c3d] text-slate-300 pt-12 pb-8 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-xs">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
                م
              </div>
              <span className="text-base font-black text-white">
                {settings.storeName}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {settings.storeSubtitle}. {settings.footerBio || 'نوفر لعملائنا نخب أول من العدد اليدوية والكهربائية ومستلزمات الهواء والدهانات الأصلية مع خلط ألوان دقيق بالكمبيوتر.'}
            </p>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              أقسام المعروضات
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      closeProductDetails();
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors text-right"
                  >
                    • {cat.name}
                  </button>
                </li>
              ))}
              {settings.showPaintStudio !== false && (
                <li>
                  <button
                    onClick={() => setIsPaintStudioOpen(true)}
                    className="text-teal-300 font-bold hover:underline"
                  >
                    • استوديو تلوين الكمبيوتر الفوري
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              التواصل وفروع المحل
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 leading-snug">{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <a href={`tel:${settings.phoneNumber || '01008377405'}`} dir="ltr" className="text-white font-bold hover:text-amber-400">
                    {settings.phoneNumber || '01008377405'}
                  </a>
                  <span className="text-slate-500">|</span>
                  <a href={`tel:${settings.phoneNumber2 || '01029190615'}`} dir="ltr" className="text-white font-bold hover:text-amber-400">
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

          {/* Col 4: Assurances & Discreet Group Line */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              خدمات وتسهيلات المتجر
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ضمان الوكيل على كافة العدد والماكينات</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>دفع كاش عند الاستلام أو إنستاباي وفودافون كاش</span>
              </div>
            </div>

            {/* Store name */}
            <div className="pt-4 border-t border-white/5">
              <div onClick={triggerSecretClick} className="mt-1.5 py-1">
                <span className="font-bold text-slate-200 select-none">
                  {settings.storeName}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>
              جميع الحقوق محفوظة © {new Date().getFullYear()} لـ{' '}
              <strong
                onClick={triggerSecretClick}
                className="text-slate-300 select-none"
              >
                {settings.storeName}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>توصيل سريع</span>
            <span>•</span>
            <span>أسعار جملة</span>
            <span>•</span>
            <span>خلط ألوان كمبيوتر معتمد</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
