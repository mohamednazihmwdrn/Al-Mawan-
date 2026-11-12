import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft } from 'lucide-react';

export const CategoryCircles: React.FC = () => {
  const { categories, selectedCategoryId, setSelectedCategoryId, setSelectedFilter } = useStore();

  const handleSelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            تصفح أقسام المحل الرئيسية
          </h2>
          <p className="text-xs text-slate-500">
            عدد أصلية، دهانات كمبيوتر، لوازم نجارة ومعمار
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
              </div>

              <span
                className={`text-xs sm:text-sm font-bold mt-2 line-clamp-2 max-w-[90px] sm:max-w-[110px] transition-colors leading-tight ${
                  isSelected ? 'text-amber-600 font-black' : 'text-slate-800 group-hover:text-blue-700'
                }`}
              >
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {cat.itemCount || 10}+ صنف
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
