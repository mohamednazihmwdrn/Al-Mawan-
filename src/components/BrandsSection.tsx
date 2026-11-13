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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {brands.map((brand) => {
            const colorClass = (brand.color && BRAND_COLOR_MAP[brand.color]) || 'text-blue-700';
            return (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.name)}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md hover:border-slate-300 group"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-9 sm:h-11 object-contain mb-1.5 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className={`text-base sm:text-xl font-black tracking-wider uppercase ${colorClass} group-hover:scale-110 transition-transform font-mono`}>
                    {brand.name}
                  </span>
                )}
                <span className="text-[11px] font-bold text-slate-500 mt-1 group-hover:text-slate-800 transition-colors">
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
