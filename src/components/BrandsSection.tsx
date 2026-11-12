import React from 'react';
import { useStore } from '../context/StoreContext';

export const BrandsSection: React.FC = () => {
  const { setSearchQuery, setSelectedCategoryId, setSelectedFilter } = useStore();

  const brands = [
    { name: "TOTAL", label: "توتال تولز", color: "text-[#0089c4]" },
    { name: "BOSCH", label: "بوش الألمانية", color: "text-[#c8102e]" },
    { name: "WADFOW", label: "وادفو تكنولوجي", color: "text-[#f97316]" },
    { name: "JOTUN", label: "دهانات جوتن", color: "text-[#0284c7]" },
    { name: "SIPES", label: "بويات سايبس", color: "text-[#16a34a]" },
    { name: "Schneider", label: "شنايدر إلكتريك", color: "text-[#059669]" },
    { name: "السويدي", label: "السويدي للكابلات", color: "text-[#dc2626]" },
    { name: "AIWO", label: "أيوو للأدوات", color: "text-[#2563eb]" }
  ];

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
            علاماتنا التجارية وشركاء النجاح
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            وكلاء وموزعون معتمدون لأفضل العلامات العالمية والمحلية في مصر
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {brands.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => handleBrandClick(brand.name)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md hover:border-slate-300 group"
            >
              <span className={`text-base sm:text-xl font-black tracking-wider uppercase ${brand.color} group-hover:scale-110 transition-transform font-mono`}>
                {brand.name}
              </span>
              <span className="text-[11px] font-bold text-slate-500 mt-1 group-hover:text-slate-800 transition-colors">
                {brand.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
