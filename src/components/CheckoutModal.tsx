import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, CheckCircle, MessageSquare, Truck, ShieldCheck, MapPin, Phone, User, FileText } from 'lucide-react';

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "القليوبية", "الإسكندرية", "الدقهلية", "الشرقية",
  "المنوفية", "الغربية", "البحيرة", "كفر الشيخ", "دمياط", "بورسعيد",
  "الإسماعيلية", "السويس", "الفيوم", "بني سويف", "المنيا", "أسيوط",
  "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر", "مطروح", "جنوب سيناء"
];

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    settings,
    createOrder,
    showToast
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'instapay' | 'vodafone_cash'>('cash_on_delivery');
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const isFreeShipping = cartSubtotal >= settings.freeDeliveryThreshold;
  const shippingFee = isFreeShipping ? 0 : settings.deliveryFee;
  const total = cartSubtotal + shippingFee;

  const handleSubmitOrder = async (sendWhatsApp: boolean = false) => {
    if (name.trim().length < 2 || phone.trim().length < 7 || address.trim().length < 4) {
      showToast('من فضلك أكمل البيانات الأساسية بشكل صحيح: الاسم، رقم الهاتف، والعنوان.');
      return;
    }

    const orderItems = cart.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      brand: item.product.brand,
      unitPrice: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
      selectedOption: item.selectedOption,
      paintDetails: item.paintDetails
    }));

    try {
      const order = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerPhoneAlt: phoneAlt,
        governorate,
        city,
        address,
        notes,
        paymentMethod,
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee,
        discount: 0,
        total
      });

      setOrderCompleted(order.orderNumber);

      if (sendWhatsApp) {
        let message = `🛒 *طلب جديد من متجر الموان للحدايد والبويات*\n`;
        message += `رقم الطلب: *#${order.orderNumber}*\n`;
        message += `👤 *بيانات العميل:*\n`;
        message += `- الاسم: ${name}\n`;
        message += `- الهاتف: ${phone} ${phoneAlt ? `(بديل: ${phoneAlt})` : ''}\n`;
        message += `- المحافظة: ${governorate} - ${city}\n`;
        message += `- العنوان: ${address}\n`;
        message += `- طريقة الدفع: ${paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام' : paymentMethod === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}\n\n`;
        message += `📦 *المنتجات المطلوبة:*\n`;

        orderItems.forEach((it, i) => {
          message += `${i + 1}. ${it.productName}\n   - الماركة: ${it.brand}\n   - الكمية: ${it.quantity} × ${it.unitPrice} ج = ${it.total} ج\n`;
          if (it.paintDetails) {
            message += `   🎨 تركيب كمبيوتر: كود ${it.paintDetails.colorCode} (${it.paintDetails.colorName}) - ${it.paintDetails.finish}\n`;
          }
          if (it.selectedOption) {
            message += `   ⚙️ المقاس: ${it.selectedOption}\n`;
          }
        });

        message += `\n💵 *المجموع الفرعي:* ${cartSubtotal.toFixed(2)} ج\n`;
        message += `🚚 *الشحن:* ${shippingFee === 0 ? 'مجاني' : `${shippingFee} ج`}\n`;
        message += `💰 *الإجمالي المستحق:* *${total.toFixed(2)} جنيه مصري*\n`;
        if (notes) message += `📝 *ملاحظات:* ${notes}\n`;

        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch {
      showToast('تعذر حفظ الطلب حالياً، يمكنك إرسال الطلب مباشرة عبر واتساب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#163674] to-[#122854] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">إتمام الطلب وتأكيد الشحن</h3>
              <p className="text-xs text-blue-200">بيانات التوصيل والفاتورة الرسمية</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderCompleted(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {orderCompleted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                تم تسجيل طلبك بنجاح! 🎉
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                رقم طلبك هو: <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">#{orderCompleted}</span>
                <br />
                سيتم التواصل معك هاتفياً أو عبر واتساب لتأكيد موعد الشحن والتسليم.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-xs text-slate-600 text-right space-y-1">
                <div><strong>المستلم:</strong> {name}</div>
                <div><strong>الهاتف:</strong> {phone}</div>
                <div><strong>العنوان:</strong> {governorate}، {city} - {address}</div>
                <div><strong>الإجمالي:</strong> EGP {total.toFixed(2)}</div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setOrderCompleted(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow"
                >
                  العودة لتصفح المتجر
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Customer Info Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>بيانات العميل المستلم:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الاسم بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: م. أحمد عبد الرحمن"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رقم الموبايل الأساسي *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-right"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رقم هاتف بديل / واتساب (اختياري)</label>
                    <input
                      type="tel"
                      value={phoneAlt}
                      onChange={(e) => setPhoneAlt(e.target.value)}
                      placeholder="011XXXXXXXX"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-right"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المحافظة *</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      {EGYPT_GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المدينة / الحي *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: المعادي، الدقي، بنها..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">العنوان التفصيلي وموقع الورشة/الموقع *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="الشارع، رقم العقار، علامة مميزة"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">ملاحظات إضافية (أوقات التسليم أو كود الفاتورة الضريبية)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي تعليمات خاصة للمندوب أو فني الخلط..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="text-xs font-black text-slate-800">طريقة الدفع المفضلة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-blue-600 bg-blue-50 font-bold text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="text-blue-600"
                    />
                    <span>الدفع عند الاستلام</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('instapay')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'instapay'
                        ? 'border-purple-600 bg-purple-50 font-bold text-purple-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => setPaymentMethod('instapay')}
                      className="text-purple-600"
                    />
                    <span>إنستاباي (InstaPay)</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'vodafone_cash'
                        ? 'border-red-600 bg-red-50 font-bold text-red-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => setPaymentMethod('vodafone_cash')}
                      className="text-red-600"
                    />
                    <span>فودافون كاش</span>
                  </label>
                </div>
              </div>

              {/* Order summary box */}
              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي المنتجات ({cart.length} أصناف):</span>
                  <span className="font-bold">EGP {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الشحن والتوصيل ({governorate}):</span>
                  <span className="font-bold">{shippingFee === 0 ? 'مجاني 🎉' : `EGP ${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1.5 border-t border-slate-300">
                  <span>المبلغ المستحق للدفع:</span>
                  <span className="text-rose-600">EGP {total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer with Double Actions */}
        {!orderCompleted && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleSubmitOrder(true)}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تأكيد وإرسال الفاتورة عبر واتساب للمحل</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmitOrder(false)}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد الطلب بالمتجر</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
