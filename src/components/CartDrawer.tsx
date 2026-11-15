import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    settings,
    setIsCheckoutOpen
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeDeliveryThreshold;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 pr-10 sm:pr-0">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#163674] to-[#1e4594] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black">سلة المشتريات</h3>
                <p className="text-xs text-blue-200">
                  {cart.length} أصناف في السلة
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-amber-50 p-3 border-b border-amber-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
              <span>
                {remainingForFreeShipping > 0
                  ? `أضف بقيمة EGP ${remainingForFreeShipping.toFixed(0)} لتحصل على شحن مجاني!`
                  : 'تهانينا! لقد حصلت على شحن مجاني لكافة محافظات مصر 🎉'}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                    {item.paintDetails && (
                      <div
                        className="absolute bottom-0 inset-x-0 h-2"
                        style={{ backgroundColor: item.paintDetails.hex }}
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                      {item.product.name}
                    </h4>

                    {/* Paint details badge or Option */}
                    {item.paintDetails ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded my-1 w-max">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: item.paintDetails.hex }}
                        />
                        <span>{item.paintDetails.colorCode} - {item.paintDetails.finish}</span>
                      </div>
                    ) : item.selectedOption ? (
                      <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded my-0.5 inline-block">
                        المقاس: {item.selectedOption}
                      </span>
                    ) : null}

                    {/* Price */}
                    <div className="text-xs font-black text-rose-600 mt-1">
                      {item.product.price > 0 ? (
                        <>
                          EGP {(item.product.price * item.quantity).toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal mr-1">
                            ({item.product.price} × {item.quantity})
                          </span>
                        </>
                      ) : (
                        <span className="text-blue-700">السعر عند التواصل (الكمية: {item.quantity})</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-200 text-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-200 text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">
                  سلة التسوق فارغة
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  تصفح العدد اليدوية والكهربائية ولوازم المعمار وأضف طلباتك لتصلك أينما كنت.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-slate-900">
                    EGP {cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>مصاريف الشحن التقديرية:</span>
                  <span className="font-bold text-slate-900">
                    {cartSubtotal >= settings.freeDeliveryThreshold
                      ? 'مجاني'
                      : `EGP ${settings.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-rose-600">
                    EGP {(cartSubtotal + (cartSubtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <span>متابعة إتمام الطلب والبيانات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>دفع آمن عند الاستلام أو عبر إنستاباي وفودافون كاش</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
