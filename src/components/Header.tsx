import React, { useState } from 'react';
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
  Wrench,
  Zap,
  Hammer,
  MessageSquare
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    setIsCartOpen,
    activeView,
    setActiveView,
    closeProductDetails,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedFilter,
    setSelectedFilter,
    setIsPaintStudioOpen,
    triggerSecretClick,
    secretClicks
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategoryId(catId);
    setSelectedFilter('all');
    if (activeView !== 'storefront') closeProductDetails();
    setMobileMenuOpen(false);
  };

  const handleFilterClick = (filter: 'all' | 'deals' | 'new' | 'bestsellers') => {
    setSelectedFilter(filter);
    setSelectedCategoryId(null);
    if (activeView !== 'storefront') closeProductDetails();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#163674] text-white shadow-lg border-b border-indigo-900/40">
      {settings.announcementNotice?.trim() && (
        <div className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black text-center py-1.5 px-3">
          {settings.announcementNotice}
        </div>
      )}
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Store Name */}
          <div className="flex items-center gap-2.5 group shrink-0">
            <div
              onClick={() => {
                closeProductDetails();
                setSelectedCategoryId(null);
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md cursor-pointer group-hover:scale-105 transition-transform"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tighter">م</span>
            </div>
            
            <div className="flex flex-col">
              <div
                onClick={() => {
                  closeProductDetails();
                  setSelectedCategoryId(null);
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors leading-tight">
                  {settings.storeName.split(' ')[0] || 'الموان'}
                </span>
              </div>

              {/* Full store subtitle + discreet 10-click owner panel trigger */}
              <div className="flex items-center gap-1.5">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerSecretClick();
                  }}
                  className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer select-none transition-colors leading-tight"
                >
                  {settings.storeName.split(' ').slice(1).join(' ') || 'للحدايد والبويات ولوازم المعمار'}
                </span>
                {secretClicks > 2 && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded-full animate-pulse">
                    {secretClicks}/10
                  </span>
                )}
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

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
      <div className="bg-[#0f2858] border-t border-white/10 px-2 sm:px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2 text-xs font-semibold whitespace-nowrap min-w-max">
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 py-4 text-sm animate-in slide-in-from-top duration-200">
          <div className="space-y-2 mb-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">الأقسام الرئيسية</div>
            <button
              onClick={() => handleCategoryClick(null)}
              className="w-full text-right py-2 px-3 rounded-lg hover:bg-white/10 text-white flex items-center justify-between"
            >
              <span>جميع المنتجات والمعروضات</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
            {settings.showPaintStudio !== false && (
              <button
                onClick={() => {
                  setIsPaintStudioOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right py-2 px-3 rounded-lg bg-teal-800/40 border border-teal-500/30 text-teal-200 flex items-center justify-between"
              >
                <span>🎨 استوديو كمبيوتر الألوان وتحديد الأكواد</span>
                <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded-full">فوري</span>
              </button>
            )}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full text-right py-2 px-3 rounded-lg flex items-center justify-between ${
                  selectedCategoryId === cat.id ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-white/10 text-blue-100'
                }`}
              >
                <span>{cat.name}</span>
                {cat.id.includes('power') && <Zap className="w-4 h-4 text-amber-400" />}
                {cat.id.includes('hand') && <Wrench className="w-4 h-4 text-blue-400" />}
                {cat.id.includes('construction') && <Hammer className="w-4 h-4 text-orange-400" />}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <PWAInstallButton variant="mobileMenu" onAfterAction={() => setMobileMenuOpen(false)} />
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${settings.phoneNumber || '01008377405'}`}
                className="py-2.5 px-2 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span dir="ltr">{settings.phoneNumber || '01008377405'}</span>
              </a>
              <a
                href={`tel:${settings.phoneNumber2 || '01029190615'}`}
                className="py-2.5 px-2 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span dir="ltr">{settings.phoneNumber2 || '01029190615'}</span>
              </a>
            </div>
            <a
              href={`https://wa.me/${settings.whatsappNumber || '201029190615'}?text=${encodeURIComponent('السلام عليكم، استفسار بخصوص منتجات الموان')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-700/50 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>محادثة واتساب مبيعات: {settings.phoneNumber2 || '01029190615'}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
