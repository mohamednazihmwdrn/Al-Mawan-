import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShoppingCart, MessageSquare, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const ProductQuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, settings } = useStore();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const currentOption = selectedOption || (quickViewProduct.options?.[0] ?? '');

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
- الإجمالي التقريبي: ${quickViewProduct.price * quantity} جنيه مصري`;

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
              {quickViewProduct.brand}
            </span>
            <span className="text-xs text-slate-500">
              {quickViewProduct.categoryName}
            </span>
          </div>

          <button
            onClick={() => setQuickViewProduct(null)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Image */}
            <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center relative overflow-hidden">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-contain"
              />
              {quickViewProduct.discountBadge && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                  {quickViewProduct.discountBadge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {quickViewProduct.name}
              </h2>

              {/* Price */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                  <span className="text-xs text-slate-400 line-through font-bold block">
                    السعر السابق: EGP {quickViewProduct.originalPrice.toLocaleString('en-US')}
                  </span>
                )}
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-bold text-slate-600">السعر الحالي: EGP</span>
                  <span className="text-2xl font-black text-rose-600">
                    {quickViewProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mr-1">/ {quickViewProduct.unit}</span>
                </div>
              </div>

              {/* Options Selector if available */}
              {quickViewProduct.hasOptions && quickViewProduct.options?.length && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    المقاس أو الموديل المطلوب:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.options.map((opt) => (
                      <button
                        key={opt}
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
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-slate-200 text-slate-700 font-black text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-black text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-slate-200 text-slate-700 font-black text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-1.5">وصف المنتج ومميزاته:</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {quickViewProduct.description}
            </p>
          </div>

          {/* Technical Specs */}
          {quickViewProduct.specs && quickViewProduct.specs.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-800 mb-2">المواصفات الفنية:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {quickViewProduct.specs.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium">{spec.label}</span>
                    <span className="text-slate-900 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500">الإجمالي:</div>
            <div className="text-base sm:text-lg font-black text-rose-600">
              EGP {(quickViewProduct.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppOrder}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">طلب واتساب</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
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
