import React from 'react';
import { useStore } from '../context/StoreContext';

const BRAND_COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-600',
  sky: 'text-sky-600',
  rose: 'text-rose-600',
  red: 'text-red-600',
  orange: 'text-orange-500',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  green: 'text-green-600',
  indigo: 'text-indigo-600',
  slate: 'text-slate-800',
  '#0089c4': 'text-[#0089c4]',
  '#c8102e': 'text-[#c8102e]',
  '#f97316': 'text-[#f97316]',
  '#0284c7': 'text-[#0284c7]',
  '#16a34a': 'text-[#16a34a]',
  '#059669': 'text-[#059669]',
  '#dc2626': 'text-[#dc2626]',
  '#2563eb': 'text-[#2563eb]'
};

export const BrandsSection: React.FC = () => {
  const { brands, settings, setSearchQuery, setSelectedCategoryId, setSelectedFilter } = useStore();

  if (brands.length === 0) return null;

  const handleBrandClick = (brandName: string) => {
    setSelectedCategoryId(null);
    setSelectedFilter('all');
    setSearchQuery(brandName);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            {settings.brandsTitle || 'علاماتنا التجارية وشركاء النجاح'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {settings.brandsSubtitle || 'وكلاء وموزعون معتمدون لأفضل العلامات العالمية والمحلية في مصر'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {brands.map((brand) => {
            const colorClass = (brand.color && BRAND_COLOR_MAP[brand.color]) || 'text-blue-700';
            return (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.name)}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 flex flex-col items-center justify-between transition-all duration-200 hover:shadow-md hover:border-blue-300 group min-h-[115px] sm:min-h-[128px]"
              >
                {brand.logoUrl ? (
                  <div className="w-full h-14 sm:h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 mb-2 overflow-hidden shadow-2xs">
                    <img
                      src={brand.logoUrl}
                      alt={`${brand.name} - ${brand.label}`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-14 sm:h-16 flex items-center justify-center mb-2">
                    <span className={`text-base sm:text-xl font-black tracking-wider uppercase ${colorClass} group-hover:scale-110 transition-transform font-mono`}>
                      {brand.name}
                    </span>
                  </div>
                )}
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 group-hover:text-blue-800 transition-colors line-clamp-1">
                  {brand.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
