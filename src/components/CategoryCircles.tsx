import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, Layers } from 'lucide-react';

export const CategoryCircles: React.FC = () => {
  const {
    categories,
    subPages,
    products,
    settings,
    selectedCategoryId,
    setSelectedCategoryId,
    setSelectedFilter
  } = useStore();

  if (categories.length === 0) return null;

  const handleSelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedFilter('all');
    setTimeout(() => {
      document.getElementById('store-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            {settings.categoriesTitle || 'تصفح أقسام المحل الرئيسية'}
          </h2>
          <p className="text-xs text-slate-500">
            {settings.categoriesSubtitle || 'عدد أصلية، دهانات كمبيوتر، لوازم نجارة ومعمار'}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategoryId(null);
            setSelectedFilter('all');
          }}
          className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 transition-colors"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const realCount = products.filter((p) => p.categoryId === cat.id).length;
          const subCount = subPages.filter((sp) => sp.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="flex flex-col items-center group text-center focus:outline-none"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 transition-all duration-300 relative shadow-sm ${
                  isSelected
                    ? 'ring-4 ring-amber-400 scale-105 shadow-md'
                    : 'hover:ring-2 hover:ring-blue-400 group-hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-inner relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                </div>
                {subCount > 0 && (
                  <span
                    title={`${subCount} صفحة فرعية`}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#163674] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow flex items-center gap-0.5 whitespace-nowrap"
                  >
                    <Layers className="w-2.5 h-2.5 text-amber-300" />
                    <span>{subCount}</span>
                  </span>
                )}
              </div>

              <span
                className={`text-xs sm:text-sm font-bold mt-2.5 line-clamp-2 max-w-[90px] sm:max-w-[110px] transition-colors leading-tight ${
                  isSelected ? 'text-amber-600 font-black' : 'text-slate-800 group-hover:text-blue-700'
                }`}
              >
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {realCount > 0
                  ? `${realCount} صنف`
                  : subCount > 0
                  ? `${subCount} صفحات فرعية`
                  : 'قسم رئيسي'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
