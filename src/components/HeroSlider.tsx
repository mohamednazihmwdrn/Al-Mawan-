import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const HeroSlider: React.FC = () => {
  const { banners, settings, setSelectedCategoryId, setIsPaintStudioOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = banners.filter((b) => b.active);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const safeIndex = currentSlide < slides.length ? currentSlide : 0;
  const current = slides[safeIndex];

  const handleActionClick = () => {
    if (current.buttonActionType === 'paint_studio') {
      setIsPaintStudioOpen(true);
    } else if (current.buttonActionType === 'category' && current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    } else if (current.buttonActionType === 'whatsapp') {
      const text = `السلام عليكم، بخصوص العرض المعلن: ${current.title || settings.storeName}`;
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    }
  };

  return (
    <div className="relative bg-[#0d2149] text-white overflow-hidden border-b border-indigo-950/40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5 relative z-10">
        <div className="relative w-full aspect-square sm:aspect-auto sm:h-[460px] md:h-[520px] lg:h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#081530]">
          <img
            key={current.id}
            src={current.image}
            alt={current.title || settings.storeName}
            onClick={handleActionClick}
            className="w-full h-full object-fill block cursor-pointer animate-in fade-in"
          />

          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeIndex ? 'w-7 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
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
