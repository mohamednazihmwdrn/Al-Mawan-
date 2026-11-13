import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const ProductQuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    openProductDetails,
    addToCart,
    settings
  } = useStore();

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const galleryImages = useMemo(() => {
    if (!quickViewProduct) return [];
    const list = [quickViewProduct.image, ...(quickViewProduct.images || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [quickViewProduct]);

  useEffect(() => {
    if (!quickViewProduct) return;
    setSelectedOption('');
    setQuantity(1);
    setActiveImageIdx(0);
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const currentOption = selectedOption || (quickViewProduct.options?.[0] ?? '');
  const displayImage = galleryImages[activeImageIdx] || quickViewProduct.image;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, currentOption || undefined);
    setQuickViewProduct(null);
  };

  const handleWhatsAppOrder = () => {
    const text = `السلام عليكم، أود حجز أو طلب المنتج التالي من متجر الموان:
- اسم المنتج: ${quickViewProduct.name}
- الماركة: ${quickViewProduct.brand}
- الخيار / المقاس: ${currentOption || 'القياسي'}
- الكمية المطلوبة: ${quantity}
- السعر الإفرادي: ${quickViewProduct.price} جنيه مصري
- الإجمالي التقريبي: ${(quickViewProduct.price * quantity).toFixed(2)} جنيه مصري`;

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenFullPage = () => {
    const prod = quickViewProduct;
    setQuickViewProduct(null);
    openProductDetails(prod);
  };

  return (
    <div
      onClick={() => setQuickViewProduct(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black text-white bg-[#163674] px-2.5 py-1 rounded-md">
              عرض سريع
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
              {quickViewProduct.brand}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {quickViewProduct.categoryName}
            </span>
            {quickViewProduct.ratingCount && quickViewProduct.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{(quickViewProduct.ratingAvg ?? 5).toFixed(1)}</span>
                <span className="font-medium text-amber-600">({quickViewProduct.ratingCount})</span>
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
            aria-label="إغلاق العرض السريع"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Multi-Image Gallery */}
            <div className="space-y-2.5">
              <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center relative overflow-hidden">
                <img
                  src={displayImage}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-contain"
                />
                {quickViewProduct.discountBadge && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {quickViewProduct.discountBadge}
                  </span>
                )}
                <span
                  className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    quickViewProduct.inStock
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {quickViewProduct.inStock ? 'متوفر بالمخزن' : 'نفذت الكمية'}
                </span>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl border-2 p-1 bg-slate-50 shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Product Info */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {quickViewProduct.name}
              </h2>

              {/* Price */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="text-xs text-slate-400 line-through font-bold block">
                    السعر السابق: EGP {quickViewProduct.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-bold text-slate-600">EGP</span>
                  <span className="text-2xl font-black text-rose-600">
                    {quickViewProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mr-1">/ {quickViewProduct.unit}</span>
                </div>
                {quickViewProduct.inStock && (
                  <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>جاهز للشحن الفوري ({quickViewProduct.stockCount} {quickViewProduct.unit})</span>
                  </div>
                )}
              </div>

              {/* Options Selector if available */}
              {quickViewProduct.hasOptions && quickViewProduct.options?.length ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    المقاس أو الموديل المطلوب:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          currentOption === opt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 hover:bg-slate-200 text-slate-700 font-black text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-black text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 hover:bg-slate-200 text-slate-700 font-black text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Link to Full Product Details Page */}
              <button
                type="button"
                onClick={handleOpenFullPage}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>عرض الصفحة الكاملة والمواصفات وتقييمات العملاء</span>
              </button>
            </div>
          </div>

          {/* Concise Description */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black text-slate-800 mb-1.5">نبذة عن المنتج:</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
              {quickViewProduct.description}
            </p>
          </div>

          {/* Assurance badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ضمان أصلي 100%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>شحن سريع لموقعك</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>استبدال في حالة العيب</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500">الإجمالي:</div>
            <div className="text-base sm:text-lg font-black text-rose-600">
              EGP {(quickViewProduct.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">طلب واتساب</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!quickViewProduct.inStock}
              className="px-5 py-2.5 rounded-xl bg-[#009fe3] hover:bg-[#0089c4] text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>أضف إلى السلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
