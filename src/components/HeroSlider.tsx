import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft, ArrowLeft, MessageSquare, Palette, Sparkles } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { banners, settings, setSelectedCategoryId, setIsPaintStudioOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = banners.filter((b) => b.active);
  const slides = activeBanners.length > 0 ? activeBanners : banners;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const current = slides[currentSlide] || slides[0];

  const handleActionClick = () => {
    if (current.buttonActionType === 'paint_studio') {
      setIsPaintStudioOpen(true);
    } else if (current.buttonActionType === 'category' && current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    } else if (current.buttonActionType === 'whatsapp') {
      const text = `السلام عليكم، بخصوص العرض المعلن في بنر: ${current.title}`;
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    } else {
      setSelectedCategoryId('power-tools');
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = `السلام عليكم ورحمة الله، استفسار بخصوص منتجات وبنر: "${current.title}"`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="relative bg-[#0d2149] text-white overflow-hidden border-b border-indigo-950/40 select-none">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-[#0d2149] to-[#07132a] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10 space-y-3.5 sm:space-y-4">
        
        {/* TOP DEDICATED TEXT SECTION (النص بأعلى الصور باحترافية تامة ودون أي تداخل) */}
        <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            
            <div className="space-y-2 flex-1 text-right">
              {/* Badge */}
              {current.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{current.badge}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                {current.title}
              </h1>

              {/* Subtitle */}
              {current.subtitle && (
                <div className="text-xs sm:text-sm md:text-base font-bold text-amber-300">
                  {current.subtitle}
                </div>
              )}

              {/* Description */}
              {current.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                  {current.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 pt-1 md:pt-0">
              <button
                onClick={handleActionClick}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <span>{current.buttonText || 'تصفح العروض'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5"
                title="استفسار سريع عبر واتساب"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">طلب واتساب</span>
              </button>
            </div>

          </div>
        </div>

        {/* BOTTOM DEDICATED IMAGE BANNER CANVAS (الصورة واضحة كاملة أسفل النص تماماً) */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[180px] sm:min-h-[260px] md:min-h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 group">
          <img
            key={current.id}
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 animate-in fade-in"
          />

          {/* Subtle gradient vignette at very bottom for depth */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Store watermark in corner */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-slate-950/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl border border-white/15 text-[11px] sm:text-xs font-bold pointer-events-none">
            {settings.storeName}
          </div>

          {/* Slider Prev / Next controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg backdrop-blur-xs"
                aria-label="السابق"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg backdrop-blur-xs"
                aria-label="التالي"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator inside bottom of image */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'w-7 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`شريحة ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
