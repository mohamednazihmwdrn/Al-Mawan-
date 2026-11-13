import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageSquare,
  Send,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  User,
  FileText,
  Headphones
} from 'lucide-react';

const QUICK_TOPICS = [
  'استفسار عن توافر منتج',
  'طلب تسعير كميات / مقاولات',
  'استفسار عن خلط ألوان الكمبيوتر',
  'متابعة شحن وتوصيل'
];

export const ContactSection: React.FC = () => {
  const { settings, submitInquiry, showToast } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [subject, setSubject] = useState(QUICK_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const validateForm = (): boolean => {
    setFormError('');
    if (customerName.trim().length < 2) {
      setFormError('يرجى إدخال الاسم بالكامل (حرفان على الأقل).');
      return false;
    }
    if (customerPhone.trim().length < 7) {
      setFormError('يرجى إدخال رقم هاتف أو واتساب صحيح.');
      return false;
    }
    if (subject.trim().length < 2) {
      setFormError('يرجى كتابة موضوع الاستفسار.');
      return false;
    }
    if (message.trim().length < 5) {
      setFormError('يرجى كتابة تفاصيل استفسارك (5 أحرف على الأقل).');
      return false;
    }
    return true;
  };

  const handleSaveInquiry = async (via: 'database' | 'whatsapp_and_database') => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const saved = await submitInquiry({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        sentVia: via
      });

      if (via === 'whatsapp_and_database') {
        const waText = `السلام عليكم متجر ${settings.storeName}، لدي استفسار جديد:\n- الاسم: ${customerName.trim()}\n- الهاتف: ${customerPhone.trim()}\n- الموضوع: ${subject.trim()}\n- الرسالة: ${message.trim()}`;
        window.open(
          `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(waText)}`,
          '_blank'
        );
      }

      setSubmittedRef(saved.id.slice(-6).toUpperCase());
      setCustomerName('');
      setCustomerPhone('');
      setMessage('');
    } catch {
      showToast('تعذر إرسال الاستفسار حالياً، يمكنك التواصل معنا مباشرة عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-10 w-full">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Right Side: Store Contact Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#122854] via-[#163674] to-[#0f234b] text-white p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                <Headphones className="w-4 h-4" />
                <span>{settings.contactBadge || 'خدمة العملاء واستشارات المعمار'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black leading-snug">
                {settings.contactTitle || `تواصل مع ${settings.storeName} مباشرة`}
              </h2>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {settings.contactDescription || 'هل تبحث عن معدة معينة، تسعير جملة لمشروع مقاولات، أو كود لون بالكمبيوتر؟ أرسل استفسارك وسيصل مباشرة لإدارة المتجر أو تواصل فوراً عبر واتساب.'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 text-[11px] mb-0.5">عنوان المعرض الرئيسي</div>
                  <div className="text-white font-semibold leading-snug">{settings.address}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${settings.phoneNumber}`}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-blue-200">هاتف 1</div>
                    <div className="font-black tracking-wide" dir="ltr">
                      {settings.phoneNumber}
                    </div>
                  </div>
                </a>

                <a
                  href={`tel:${settings.phoneNumber2}`}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-blue-200">هاتف 2 / واتساب</div>
                    <div className="font-black tracking-wide" dir="ltr">
                      {settings.phoneNumber2}
                    </div>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-blue-200 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{settings.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Left Side: Interactive Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/50">
            {submittedRef ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-black text-slate-900">
                    تم استلام استفسارك بنجاح!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    تم حفظ رسالتك في نظام متجر الموان برقم مرجعي{' '}
                    <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      #{submittedRef}
                    </span>{' '}
                    وسيقوم فريق المبيعات بالرد عليك في أسرع وقت.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow transition-all"
                >
                  إرسال استفسار آخر
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveInquiry('database');
                }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    أرسل استفسارك أو طلب عرض سعر
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يُحفظ استفسارك مباشرة في سجل المتجر مع إمكانية إرساله فوراً عبر واتساب.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      الاسم بالكامل *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: م. محمد حسن"
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pr-9 pl-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      رقم الموبايل / واتساب *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        minLength={7}
                        maxLength={25}
                        dir="ltr"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="010xxxxxxxx"
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pr-9 pl-3 font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1.5">
                    موضوع الاستفسار *
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSubject(topic)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                          subject === topic
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="اكتب موضوع الاستفسار..."
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pr-9 pl-3 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">
                    تفاصيل الرسالة أو الأصناف المطلوبة *
                  </label>
                  <textarea
                    rows={3}
                    required
                    minLength={5}
                    maxLength={1500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب أسماء العدد أو البويات أو الكميات المطلوبة وسنرد عليك بالتفاصيل والأسعار..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال وحفظ في المتجر'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSaveInquiry('whatsapp_and_database')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال عبر واتساب وحفظ</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
