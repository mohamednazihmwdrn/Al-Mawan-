import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Palette,
  Sparkles,
  PhoneCall,
  Flame,
  ChevronLeft,
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    setIsCartOpen,
    activeView,
    closeProductDetails,
    searchQuery,
    setSearchQuery,
    categories,
    products,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedFilter,
    setSelectedFilter,
    setIsPaintStudioOpen,
    triggerSecretClick
  } = useStore();

  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  useEffect(() => {
    if (!sideMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSideMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sideMenuOpen]);

  const scrollToProducts = () => {
    setTimeout(() => {
      document.getElementById('store-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategoryId(catId);
    setSelectedFilter('all');
    if (activeView !== 'storefront') closeProductDetails();
    setSideMenuOpen(false);
    if (catId !== null) {
      scrollToProducts();
    }
  };

  const handleFilterClick = (filter: 'all' | 'deals' | 'new' | 'bestsellers') => {
    setSelectedFilter(filter);
    setSelectedCategoryId(null);
    if (activeView !== 'storefront') closeProductDetails();
    setSideMenuOpen(false);
    if (filter !== 'all') {
      scrollToProducts();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-[100vw] overflow-x-clip bg-[#163674] text-white shadow-lg border-b border-indigo-900/40">
      {settings.announcementNotice?.trim() && (
        <div className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black text-center py-1.5 px-3">
          {settings.announcementNotice}
        </div>
      )}
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Store Name */}
          <div className="flex items-center gap-2.5 group md:shrink-0 mobile-header-brand">
            <div
              onClick={() => {
                closeProductDetails();
                setSelectedCategoryId(null);
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md cursor-pointer group-hover:scale-105 transition-transform shrink-0"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tighter">م</span>
            </div>
            
            <div
              onClick={(e) => {
                e.stopPropagation();
                triggerSecretClick();
              }}
              className="flex flex-col select-none min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  {settings.storeName.split(' ')[0] || 'الموان'}
                </span>
              </div>

              {/* Full store subtitle */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] sm:text-xs font-bold text-amber-400 select-none leading-tight mobile-header-subtitle">
                  {settings.storeName.split(' ').slice(1).join(' ') || 'للحدايد والبويات ولوازم المعمار'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView === 'product') closeProductDetails();
                }}
                placeholder="ابحث عن عدد، شنيور، بويات، مسامير، خراطيم، كود لون..."
                className="w-full bg-white/10 text-white placeholder-blue-200/70 border border-white/20 rounded-full py-2 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:text-slate-900 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-white/20 hover:bg-white/40 rounded-full w-5 h-5 flex items-center justify-center text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* PWA Install App Button */}
            <PWAInstallButton variant="header" />

            {/* Computer Paint Studio Button */}
            {settings.showPaintStudio !== false && (
              <button
                onClick={() => setIsPaintStudioOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 border border-teal-400/30"
                title="كمبيوتر خلط الألوان الفوري"
              >
                <Palette className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">كمبيوتر الألوان</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              aria-label="سلة التسوق"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-black">السلة</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#163674] shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Side Menu Drawer Toggle (Mobile & Desktop) */}
            <button
              type="button"
              onClick={() => setSideMenuOpen(!sideMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="القائمة الجانبية"
              title="القائمة الجانبية - الأقسام"
            >
              {sideMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView === 'product') closeProductDetails();
              }}
              placeholder="ابحث عن عدد، بويات، مسامير، خراطيم، كود لون..."
              className="w-full bg-white/15 text-white placeholder-blue-200/80 border border-white/20 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:text-slate-900 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Horizontal Navigation Bar */}
      <div className="w-full max-w-full bg-[#0f2858] border-t border-white/10 px-2 sm:px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2 text-xs font-semibold whitespace-nowrap min-w-max mobile-header-pills">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3 py-1.5 rounded-full transition-all ${
              selectedCategoryId === null && selectedFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow'
                : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            جميع المنتجات
          </button>

          <button
            onClick={() => handleFilterClick('deals')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
              selectedFilter === 'deals'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'text-rose-200 hover:bg-rose-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>العروض والخصومات</span>
          </button>

          {settings.showPaintStudio !== false && (
            <button
              onClick={() => setIsPaintStudioOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold shadow hover:opacity-90 transition-all"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span>كمبيوتر الألوان (جديد)</span>
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-out Side Menu Drawer (القائمة الجانبية للأقسام) */}
      {sideMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start" dir="rtl">
          {/* Dark Backdrop */}
          <div
            onClick={() => setSideMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
          />

          {/* Side Panel */}
          <aside className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full bg-[#0f2858] text-white shadow-2xl border-l border-white/15 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3.5 bg-[#163674] border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow">
                  <span className="text-lg">م</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-white truncate">{settings.storeName}</div>
                  <div className="text-[11px] font-bold text-amber-300">القائمة الجانبية للأقسام</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSideMenuOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                aria-label="إغلاق القائمة الجانبية"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
              <div className="space-y-1.5">
                <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>الأقسام الرئيسية</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-right py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                    selectedCategoryId === null && selectedFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <span>جميع الأقسام والمنتجات</span>
                  <Sparkles className={`w-4 h-4 ${selectedCategoryId === null && selectedFilter === 'all' ? 'text-slate-950' : 'text-amber-400'}`} />
                </button>

                {categories.map((cat) => {
                  const catCount = products.filter((p) => p.categoryId === cat.id).length;
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full text-right py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow'
                          : 'hover:bg-white/10 text-blue-50 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cat.image && (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-7 h-7 rounded-lg object-cover border border-white/20 shrink-0"
                          />
                        )}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                            isActive ? 'bg-slate-950/15 text-slate-950' : 'bg-white/15 text-blue-100'
                          }`}
                        >
                          {catCount}
                        </span>
                        <ChevronLeft className="w-4 h-4 opacity-75" />
                      </div>
                    </button>
                  );
                })}

                {categories.length === 0 && (
                  <div className="text-xs text-blue-200/70 px-3 py-2">
                    لم يتم إضافة أقسام بعد
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => handleFilterClick('deals')}
                  className={`w-full text-right py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                    selectedFilter === 'deals'
                      ? 'bg-rose-500 text-white font-black shadow'
                      : 'hover:bg-white/10 text-rose-200'
                  }`}
                >
                  <span>العروض والخصومات</span>
                  <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
                </button>

                {settings.showPaintStudio !== false && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaintStudioOpen(true);
                      setSideMenuOpen(false);
                    }}
                    className="w-full text-right py-2.5 px-3 rounded-xl bg-teal-800/40 border border-teal-500/30 text-teal-100 text-xs sm:text-sm font-bold flex items-center justify-between hover:bg-teal-800/60 transition-colors"
                  >
                    <span>🎨 استوديو كمبيوتر الألوان</span>
                    <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded-full font-black">فوري</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer Contact & PWA */}
            <div className="p-3.5 border-t border-white/10 bg-[#0b1f45] space-y-2">
              <PWAInstallButton variant="mobileMenu" onAfterAction={() => setSideMenuOpen(false)} />
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${settings.phoneNumber || '01008377405'}`}
                  className="py-2 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span dir="ltr">{settings.phoneNumber || '01008377405'}</span>
                </a>
                <a
                  href={`tel:${settings.phoneNumber2 || '01029190615'}`}
                  className="py-2 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span dir="ltr">{settings.phoneNumber2 || '01029190615'}</span>
                </a>
              </div>
              <a
                href={`https://wa.me/${settings.whatsappNumber || '201029190615'}?text=${encodeURIComponent('السلام عليكم، استفسار بخصوص منتجات الموان')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>واتساب مبيعات: {settings.phoneNumber2 || '01029190615'}</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
