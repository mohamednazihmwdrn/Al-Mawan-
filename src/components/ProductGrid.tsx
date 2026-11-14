import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowUpDown, AlertCircle, PackagePlus, MessageSquare, Phone, Layers } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const {
    products,
    settings,
    hasMoreProducts,
    loadMoreProducts,
    categories,
    subPages,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedSubPageId,
    setSelectedSubPageId,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    isOwnerAuthenticated,
    setActiveView,
    setAdminSubTab
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const categorySubPages = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subPages.filter((sp) => sp.categoryId === selectedCategoryId);
  }, [subPages, selectedCategoryId]);

  const activeSubPage = useMemo(
    () => categorySubPages.find((sp) => sp.id === selectedSubPageId) || null,
    [categorySubPages, selectedSubPageId]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = prod.name.toLowerCase().includes(query);
          const matchesBrand = prod.brand.toLowerCase().includes(query);
          const matchesCategory = prod.categoryName.toLowerCase().includes(query);
          const matchesSubPage = (prod.subPageName || '').toLowerCase().includes(query);
          const matchesDesc = prod.description.toLowerCase().includes(query);
          if (!matchesName && !matchesBrand && !matchesCategory && !matchesSubPage && !matchesDesc) {
            return false;
          }
        }

        // Category
        if (selectedCategoryId && prod.categoryId !== selectedCategoryId) {
          return false;
        }

        // SubPage
        if (selectedSubPageId && prod.subPageId !== selectedSubPageId) {
          return false;
        }

        // Filter pills
        if (
          selectedFilter === 'deals' &&
          !prod.discountBadge &&
          (!prod.originalPrice || prod.originalPrice <= prod.price)
        ) {
          return false;
        }
        if (selectedFilter === 'new' && !prod.isNew) {
          return false;
        }
        if (selectedFilter === 'bestsellers' && !prod.isBestSeller) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategoryId, selectedSubPageId, searchQuery, selectedFilter, sortBy]);

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || null;
  const currentCategoryName = currentCategory?.name;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      {/* Section Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-blue-600 inline-block" />
              <h2 className="text-base sm:text-xl font-black text-slate-900">
                {searchQuery
                  ? `نتائج البحث عن: "${searchQuery}"`
                  : activeSubPage
                  ? `${currentCategoryName} — ${activeSubPage.name}`
                  : currentCategoryName
                  ? currentCategoryName
                  : selectedFilter === 'deals'
                  ? 'أقوى العروض والخصومات الحالية'
                  : selectedFilter === 'new'
                  ? 'أحدث المنتجات التي وصلت المحل'
                  : selectedFilter === 'bestsellers'
                  ? 'المنتجات الأكثر طلباً ومبيعاً'
                  : settings.productsTitle || 'كافة المعروضات ولوازم المعمار'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 mr-4">
              {activeSubPage?.description
                ? activeSubPage.description
                : currentCategory?.description && !searchQuery
                ? currentCategory.description
                : products.length > 0
                ? `إجمالي المنتجات المعروضة: ${filteredProducts.length} صنف`
                : 'تصفح أقسام المتجر وتواصل معنا للطلب الفوري'}
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>ترتيب حسب:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">المميز والأكثر تطابقاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="name">الاسم أبجدياً</option>
            </select>
          </div>
        </div>

        {/* Subpages inside selected category */}
        {selectedCategoryId && categorySubPages.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 mb-2.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>الصفحات الفرعية داخل قسم {currentCategoryName}:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubPageId(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                  !selectedSubPageId
                    ? 'bg-[#163674] text-white border-[#163674] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                عرض كل {currentCategoryName}
              </button>

              {categorySubPages.map((sp) => {
                const spCount = products.filter((p) => p.subPageId === sp.id).length;
                const isSelected = selectedSubPageId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSelectedSubPageId(sp.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-sm'
                        : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {sp.image && (
                      <img
                        src={sp.image}
                        alt={sp.name}
                        className="w-6 h-6 rounded-lg object-cover border border-black/10 shrink-0"
                      />
                    )}
                    <span>{sp.name}</span>
                    {spCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                          isSelected ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {spCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        {(selectedCategoryId || selectedSubPageId || selectedFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-bold">الفلاتر النشطة:</span>
            {selectedCategoryId && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
                <span>القسم: {currentCategoryName}</span>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="hover:text-blue-900 text-xs mr-1"
                >
                  ✕
                </button>
              </span>
            )}
            {activeSubPage && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-200">
                <span>صفحة فرعية: {activeSubPage.name}</span>
                <button
                  onClick={() => setSelectedSubPageId(null)}
                  className="hover:text-indigo-900 text-xs mr-1"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold border border-amber-200">
                <span>
                  {selectedFilter === 'deals' ? 'عروض فقط' : selectedFilter === 'new' ? 'جديد فقط' : 'الأكثر طلباً'}
                </span>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="hover:text-amber-900 text-xs mr-1"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                <span>بحث: {searchQuery}</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 text-xs mr-1"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:underline font-bold mr-auto"
            >
              إلغاء كل الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMoreProducts && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={loadMoreProducts}
                className="px-6 py-3 rounded-2xl bg-[#163674] hover:bg-[#122854] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                عرض المزيد من المنتجات والمعدات
              </button>
            </div>
          )}
        </>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <PackagePlus className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
            {activeSubPage
              ? `صفحة "${activeSubPage.name}" جاهزة لإضافة المنتجات`
              : `جاري تجهيز وإضافة منتجات ${settings.storeName}`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            {activeSubPage?.description
              ? activeSubPage.description
              : 'نقوم حالياً بإضافة أحدث العدد والمعدات والبويات ولوازم المعمار بأسعارها الحقيقية المحدثة. يمكنك التواصل معنا مباشرة الآن للاستفسار أو الطلب الفوري.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {isOwnerAuthenticated && (
              <button
                onClick={() => {
                  setAdminSubTab('products');
                  setActiveView('admin');
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition-all"
              >
                إضافة أول منتج من لوحة المالك
              </button>
            )}
            <a
              href={`https://wa.me/${settings.whatsappNumber || '201029190615'}?text=${encodeURIComponent(`السلام عليكم ${settings.storeName}، أريد الاستفسار عن توفر منتجات وأسعار${activeSubPage ? ` (${activeSubPage.name})` : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>اطلب عبر واتساب</span>
            </a>
            <a
              href={`tel:${settings.phoneNumber || '01008377405'}`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل بنا</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
            لا توجد منتجات تطابق بحثك حالياً
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            جرب كتابة اسم مختلف أو إزالة الفلاتر، أو تواصل مع خدمة العملاء لتوفير طلبك الخاص.
          </p>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
          >
            إظهار كافة منتجات المحل
          </button>
        </div>
      )}
    </section>
  );
};
