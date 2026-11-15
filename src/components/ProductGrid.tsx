import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { AlertCircle, PackagePlus, MessageSquare, Phone, Layers, ChevronLeft, ArrowRight, Search, X, LayoutGrid } from 'lucide-react';

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
    setSelectedFilter
  } = useStore();

  const categorySubPages = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subPages.filter((sp) => sp.categoryId === selectedCategoryId);
  }, [subPages, selectedCategoryId]);

  const activeSubPage = useMemo(
    () => categorySubPages.find((sp) => sp.id === selectedSubPageId) || null,
    [categorySubPages, selectedSubPageId]
  );

  // Filter products when inside a category, subpage, search, or filter
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
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [products, selectedCategoryId, selectedSubPageId, searchQuery, selectedFilter]);

  // Group products by category for the main storefront view
  const categorySections = useMemo(() => {
    return categories.map((cat) => ({
      category: cat,
      items: products
        .filter((prod) => prod.categoryId === cat.id)
        .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }));
  }, [categories, products]);

  // Products not belonging to any explicit category (e.g. 'general')
  const uncategorizedProducts = useMemo(() => {
    const categoryIds = new Set(categories.map((c) => c.id));
    return products
      .filter((prod) => !categoryIds.has(prod.categoryId))
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [categories, products]);

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || null;
  const currentCategoryName = currentCategory?.name;

  const isHomeOverview =
    !selectedCategoryId && !selectedSubPageId && selectedFilter === 'all' && !searchQuery.trim();

  const hasSubPagesBar = Boolean(selectedCategoryId && categorySubPages.length > 0);
  const hasActiveFiltersBar = Boolean(
    selectedCategoryId || selectedSubPageId || selectedFilter !== 'all' || searchQuery
  );

  const handleEnterCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedFilter('all');
    setTimeout(() => {
      document.getElementById('store-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <section id="store-products-section" className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-6 scroll-mt-24">
      {/* Main Page Instant Product Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input by Product Name */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج بالاسم (مثال: سافيتو، دهان، شنيور، مسمار)..."
              aria-label="ابحث عن المنتجات بالاسم"
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-[#163674] focus:ring-2 focus:ring-[#163674]/15 rounded-xl py-2.5 pr-10 pl-9 text-xs sm:text-sm font-bold outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          {categories.length > 0 && (
            <div className="relative sm:w-56 md:w-64 shrink-0">
              <LayoutGrid className="w-4 h-4 text-[#163674] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSelectedCategoryId(val);
                  setSelectedSubPageId(null);
                  setSelectedFilter('all');
                }}
                aria-label="تصفية المنتجات حسب القسم"
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 border border-slate-200 focus:border-[#163674] focus:ring-2 focus:ring-[#163674]/15 rounded-xl py-2.5 pr-9 pl-3 text-xs sm:text-sm font-black outline-none transition-all cursor-pointer"
              >
                <option value="">جميع الأقسام</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Instant Live Result Summary when Searching or Filtering */}
        {(searchQuery.trim() || selectedCategoryId) && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600">
              النتائج الفورية:{' '}
              <span className="font-black text-[#163674]">{filteredProducts.length}</span> منتج
              {currentCategoryName ? ` في قسم «${currentCategoryName}»` : ''}
              {searchQuery.trim() ? ` مطابق لـ «${searchQuery.trim()}»` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
                setSelectedSubPageId(null);
                setSelectedFilter('all');
              }}
              className="text-rose-600 hover:underline font-black"
            >
              إعادة ضبط
            </button>
          </div>
        )}
      </div>

      {(selectedCategoryId || hasSubPagesBar || hasActiveFiltersBar) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm mb-6">
          {/* Selected Category Header Banner */}
          {currentCategory && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {currentCategory.image && (
                  <img
                    src={currentCategory.image}
                    alt={currentCategory.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                )}
                <div>
                  <h2 className="text-base sm:text-xl font-black text-slate-900">
                    {currentCategory.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    {filteredProducts.length} منتج متاح في هذا القسم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedSubPageId(null);
                  setSelectedFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لجميع الأقسام</span>
              </button>
            </div>
          )}

          {/* Subpages inside selected category */}
          {hasSubPagesBar && (
            <div>
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
          {hasActiveFiltersBar && (
            <div className={`flex flex-wrap items-center gap-2 text-xs ${hasSubPagesBar ? 'mt-3 pt-3 border-t border-slate-100' : ''}`}>
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
      )}

      {/* Main Storefront: Every category with its products in horizontal scroll */}
      {isHomeOverview && categories.length > 0 ? (
        <div className="space-y-8">
          {categorySections.map(({ category, items }) => (
            <div key={category.id} className="space-y-3">
              {/* Category Row Header */}
              <div className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-slate-200/80 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleEnterCategory(category.id)}
                  className="flex items-center gap-2.5 text-right group"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {category.name}
                    </h2>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {items.length} منتج
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleEnterCategory(category.id)}
                  className="text-xs sm:text-sm font-black text-[#163674] hover:text-blue-700 flex items-center gap-0.5 shrink-0 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal Scrollable Products Row */}
              {items.length > 0 ? (
                <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 px-0.5 snap-x snap-mandatory">
                  {items.map((product) => (
                    <div
                      key={product.id}
                      className="w-[176px] sm:w-[224px] lg:w-[248px] shrink-0 snap-start"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-xs sm:text-sm text-slate-500 font-bold">
                  لا توجد منتجات مضافة في قسم «{category.name}» حالياً
                </div>
              )}
            </div>
          ))}

          {/* Uncategorized / General Products Row if any exist */}
          {uncategorizedProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-slate-200/80 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-lg font-black text-slate-900">منتجات عامة</h2>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {uncategorizedProducts.length} منتج
                  </span>
                </div>
              </div>

              <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 px-0.5 snap-x snap-mandatory">
                {uncategorizedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-[176px] sm:w-[224px] lg:w-[248px] shrink-0 snap-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMoreProducts && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={loadMoreProducts}
                className="px-6 py-3 rounded-2xl bg-[#163674] hover:bg-[#122854] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                عرض المزيد من المنتجات والمعدات
              </button>
            </div>
          )}
        </div>
      ) : filteredProducts.length > 0 ? (
        /* Category / Subpage / Search / Filter View: Full Vertical Grid showing ALL matching products */
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
              : currentCategoryName
              ? `قسم "${currentCategoryName}" جاهز لإضافة المنتجات`
              : `جاري تجهيز وإضافة منتجات ${settings.storeName}`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            {activeSubPage?.description
              ? activeSubPage.description
              : 'نقوم حالياً بإضافة أحدث العدد والمعدات والبويات ولوازم المعمار بأسعارها الحقيقية المحدثة. يمكنك التواصل معنا مباشرة الآن للاستفسار أو الطلب الفوري.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={`https://wa.me/${settings.whatsappNumber || '201029190615'}?text=${encodeURIComponent(`السلام عليكم ${settings.storeName}، أريد الاستفسار عن توفر منتجات وأسعار${activeSubPage ? ` (${activeSubPage.name})` : currentCategoryName ? ` (${currentCategoryName})` : ''}`)}`}
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
            {currentCategoryName && !searchQuery.trim()
              ? `لا توجد منتجات مضافة في قسم "${currentCategoryName}" حالياً`
              : 'لا توجد منتجات تطابق بحثك حالياً'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            {currentCategoryName && !searchQuery.trim()
              ? 'يمكنك العودة لاستعراض باقي الأقسام أو التواصل معنا للاستفسار عن أي منتج.'
              : 'جرب كتابة اسم مختلف أو إزالة الفلاتر، أو تواصل مع خدمة العملاء لتوفير طلبك الخاص.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
          >
            إظهار كافة أقسام ومنتجات المحل
          </button>
        </div>
      )}
    </section>
  );
};

