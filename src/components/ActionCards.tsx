import React from 'react';
import { useStore } from '../context/StoreContext';
import { Tag, Sparkles, Star, Palette } from 'lucide-react';

export const ActionCards: React.FC = () => {
  const { selectedFilter, setSelectedFilter, setSelectedCategoryId, setIsPaintStudioOpen } = useStore();

  const handleFilter = (filter: 'all' | 'deals' | 'new' | 'bestsellers') => {
    setSelectedFilter(filter);
    setSelectedCategoryId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Offers & Discounts */}
        <button
          onClick={() => handleFilter('deals')}
          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center transition-all duration-200 border group ${
            selectedFilter === 'deals'
              ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400'
              : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2.5 group-hover:scale-110 transition-transform">
            <Tag className="w-6 h-6" />
          </div>
          <span className="text-sm sm:text-base font-black text-slate-800 group-hover:text-rose-600 transition-colors">
            عروض وخصومات
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">وفر حتى 35% على العدد</span>
        </button>

        {/* New Arrivals */}
        <button
          onClick={() => handleFilter('new')}
          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center transition-all duration-200 border group ${
            selectedFilter === 'new'
              ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-400'
              : 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-2.5 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-sm sm:text-base font-black text-slate-800 group-hover:text-sky-600 transition-colors">
            وصل حديثاً
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">أحدث موديلات 2026</span>
        </button>

        {/* Best Sellers */}
        <button
          onClick={() => handleFilter('bestsellers')}
          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center transition-all duration-200 border group ${
            selectedFilter === 'bestsellers'
              ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400'
              : 'bg-white border-slate-200/80 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2.5 group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <span className="text-sm sm:text-base font-black text-slate-800 group-hover:text-amber-600 transition-colors">
            الأكثر مبيعاً
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">اختيارات الفنيين والصنايعية</span>
        </button>

        {/* Computer Paint Studio Card */}
        <button
          onClick={() => setIsPaintStudioOpen(true)}
          className="rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center transition-all duration-200 border bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 hover:border-teal-400 hover:shadow-md group relative overflow-hidden"
        >
          <span className="absolute top-2 left-2 bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            جديد
          </span>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white mb-2.5 group-hover:scale-110 transition-transform shadow-md">
            <Palette className="w-6 h-6 text-amber-300" />
          </div>
          <span className="text-sm sm:text-base font-black text-teal-900 group-hover:text-teal-700 transition-colors">
            كمبيوتر الألوان
          </span>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5">تلوين وحساب الدهان فوري</span>
        </button>

      </div>
    </div>
  );
};
