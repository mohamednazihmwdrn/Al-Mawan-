import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductReview } from '../types/store';
import { ProductCard } from './ProductCard';
import {
  ArrowRight,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Send,
  Trash2,
  UserCheck,
  MapPin,
  Phone,
  CheckCircle2,
  Share2,
  AlertCircle
} from 'lucide-react';

const RATING_LABELS: Record<number, string> = {
  5: 'ممتاز — أنصح به بشدة',
  4: 'جيد جداً — جودة عالية',
  3: 'جيد — مناسب للسعر',
  2: 'مقبول — أقل من المتوقع',
  1: 'ضعيف — تجربة غير مرضية'
};

export const ProductDetailsPage: React.FC = () => {
  const {
    selectedProduct,
    closeProductDetails,
    products,
    addToCart,
    settings,
    setSelectedCategoryId,
    subscribeToProductReviews,
    addProductReview,
    deleteProductReview,
    updateProduct,
    isCloudAdmin,
    isCloudSeeded,
    showToast
  } = useStore();

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reviews State (Firestore Real-time)
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const galleryImages = useMemo(() => {
    if (!selectedProduct) return [];
    const list = [selectedProduct.image, ...(selectedProduct.images || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) {
      setReviews([]);
      return;
    }
    setSelectedOption('');
    setQuantity(1);
    setActiveImageIdx(0);
    setStarFilter('all');

    const unsub = subscribeToProductReviews(selectedProduct.id, (list) => {
      setReviews(list);
    });

    return () => unsub();
  }, [selectedProduct?.id, subscribeToProductReviews]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter((p) => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
      .slice(0, 4);
  }, [products, selectedProduct]);

  if (!selectedProduct) return null;

  const currentOption = selectedOption || (selectedProduct.options?.[0] ?? '');
  const displayImage = galleryImages[activeImageIdx] || selectedProduct.image;

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : selectedProduct.ratingAvg || 0;
  const displayCount = totalReviews > 0 ? totalReviews : selectedProduct.ratingCount || 0;

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.max(1, Math.min(5, Math.round(r.rating)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;
  });

  const filteredReviews =
    starFilter === 'all'
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === starFilter);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, currentOption || undefined);
  };

  const handleWhatsAppOrder = () => {
    const text = `السلام عليكم متجر ${settings.storeName}، أود طلب المنتج التالي:
- اسم المنتج: ${selectedProduct.name}
- الماركة: ${selectedProduct.brand}
- الخيار / المقاس: ${currentOption || 'القياسي'}
- الكمية المطلوبة: ${quantity}
- السعر الإفرادي: ${selectedProduct.price} جنيه مصري
- الإجمالي التقريبي: ${(selectedProduct.price * quantity).toFixed(2)} جنيه مصري`;

    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleShareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedProduct.name,
          text: `${selectedProduct.name} - متجر الموان للحدايد والبويات`,
          url
        });
        return;
      } catch {
        // user cancelled or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('تم نسخ رابط المنتج لمشاركته مع الآخرين!');
    } catch {
      showToast('يمكنك نسخ الرابط من شريط المتصفح.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewerName.trim().length < 2) {
      showToast('يرجى إدخال اسمك (حرفان على الأقل).');
      return;
    }
    if (reviewComment.trim().length < 3) {
      showToast('يرجى كتابة تعليق لا يقل عن 3 أحرف.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addProductReview(selectedProduct.id, {
        customerName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      if (isCloudAdmin) {
        const nextCount = reviews.length + 1;
        const nextAvg =
          (reviews.reduce((sum, r) => sum + r.rating, 0) + reviewRating) / nextCount;
        await updateProduct(selectedProduct.id, {
          ratingAvg: Number(nextAvg.toFixed(1)),
          ratingCount: nextCount
        });
      }

      setReviewerName('');
      setReviewComment('');
      setReviewRating(5);
    } catch {
      if (!isCloudSeeded) {
        showToast('يرجى من مالك المتجر تفعيل المزامنة السحابية ونشر الكتالوج لحفظ التقييمات.');
      } else {
        showToast('تعذر نشر التقييم حالياً، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('هل تريد حذف هذا التعليق نهائياً؟')) return;
    try {
      await deleteProductReview(selectedProduct.id, reviewId);
      if (isCloudAdmin) {
        const remaining = reviews.filter((r) => r.id !== reviewId);
        const nextCount = remaining.length;
        const nextAvg =
          nextCount > 0
            ? remaining.reduce((sum, r) => sum + r.rating, 0) / nextCount
            : 0;
        await updateProduct(selectedProduct.id, {
          ratingAvg: Number(nextAvg.toFixed(1)),
          ratingCount: nextCount
        });
      }
    } catch {
      showToast('تعذر حذف التعليق');
    }
  };

  const activeStarValue = hoverRating || reviewRating;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
          <button
            type="button"
            onClick={closeProductDetails}
            className="text-blue-700 hover:underline font-black"
          >
            الرئيسية
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId(selectedProduct.categoryId);
              closeProductDetails();
            }}
            className="hover:text-blue-700 transition-colors"
          >
            {selectedProduct.categoryName}
          </button>
          <span>/</span>
          <span className="text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-sm">
            {selectedProduct.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareProduct}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة</span>
          </button>

          <button
            type="button"
            onClick={closeProductDetails}
            className="px-3.5 py-1.5 rounded-xl bg-[#163674] hover:bg-[#122854] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمتجر</span>
          </button>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Right Col: Gallery */}
          <div className="lg:col-span-5 space-y-3">
            <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-center relative overflow-hidden">
              <img
                src={displayImage}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
              {selectedProduct.discountBadge && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow">
                  {selectedProduct.discountBadge}
                </span>
              )}
              <span
                className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  selectedProduct.inStock
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedProduct.inStock ? 'متوفر بالمخزن' : 'نفذت الكمية'}
              </span>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 shrink-0 transition-all ${
                      activeImageIdx === idx
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left Col: Details & Purchase */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg uppercase">
                  {selectedProduct.brand}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {selectedProduct.categoryName}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  كود: #{selectedProduct.id}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug">
                {selectedProduct.name}
              </h1>

              {/* Live Star Rating Jump Link */}
              <a
                href="#product-reviews-section"
                className="inline-flex items-center gap-2 pt-1 group"
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(averageRating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                  {displayCount > 0
                    ? `${averageRating.toFixed(1)} من 5 (${displayCount} تقييم من العملاء)`
                    : 'لا توجد تقييمات بعد — أضف أول تقييم'}
                </span>
              </a>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                {selectedProduct.originalPrice &&
                  selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="text-xs text-slate-400 line-through font-bold">
                      السعر السابق: EGP {selectedProduct.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-600">EGP</span>
                  <span className="text-3xl font-black text-rose-600">
                    {selectedProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    / {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedProduct.inStock
                    ? `متاح بالمعرض (${selectedProduct.stockCount} ${selectedProduct.unit})`
                    : 'غير متوفر حالياً'}
                </span>
              </div>
            </div>

            {/* Options Selector */}
            {selectedProduct.hasOptions && selectedProduct.options?.length ? (
              <div>
                <label className="text-xs font-black text-slate-800 block mb-2">
                  اختر المقاس أو النوع المطلوب:
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition-all ${
                        currentOption === opt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-800 font-black text-base"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-800 font-black text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedProduct.inStock}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#009fe3] hover:bg-[#0089c4] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  أضف إلى السلة (EGP{' '}
                  {(selectedProduct.price * quantity).toLocaleString('en-US', {
                    minimumFractionDigits: 2
                  })}
                  )
                </span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>اطلب عبر واتساب</span>
              </button>
            </div>

            {/* Description & Technical Specs */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  وصف المنتج ومميزاته:
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-slate-900 mb-2">
                    المواصفات الفنية:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedProduct.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <span className="text-slate-500 font-bold">{spec.label}</span>
                        <span className="text-slate-900 font-black">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Store Assurances & Direct Store Address / Phones */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600 bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">ضمان أصلي 100%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-bold">شحن سريع لموقعك</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span className="font-bold">استبدال فوري</span>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>عنوان المعرض للاستلام المباشر:</strong> {settings.address}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-700">
                <span className="inline-flex items-center gap-1 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>التواصل:</span>
                </span>
                <a href={`tel:${settings.phoneNumber}`} dir="ltr" className="font-black text-blue-800 hover:underline">
                  {settings.phoneNumber}
                </a>
                <span>|</span>
                <a href={`tel:${settings.phoneNumber2}`} dir="ltr" className="font-black text-blue-800 hover:underline">
                  {settings.phoneNumber2}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL FIRESTORE REAL-TIME RATINGS & REVIEWS SECTION */}
      <section
        id="product-reviews-section"
        className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900">
                تقييمات وتعليقات العملاء على المنتج
              </h2>
              <p className="text-xs text-slate-500">
                تقييمات حية ومباشرة من عملاء متجر الموان بتحديث لحظي فوري
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>مرتبط لحظياً بقاعدة البيانات السحابية</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Summary & Star Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
              <div className="text-4xl font-black text-slate-900">
                {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
                <span className="text-base font-bold text-slate-400"> / 5</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs font-bold text-slate-600">
                بناءً على {totalReviews} تقييم مسجل
              </div>
            </div>

            {/* 5-to-1 Star Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="font-black text-slate-800 mb-2">توزيع التقييمات (اضغط للتصفية):</div>
              {[5, 4, 3, 2, 1].map((starVal) => {
                const count = starCounts[starVal] || 0;
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const isSelected = starFilter === starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? 'all' : starVal)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                      isSelected ? 'bg-amber-100/80 ring-1 ring-amber-400' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-12 text-right font-bold text-slate-700 flex items-center gap-1">
                      <span>{starVal}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 text-left font-bold text-slate-500">{count}</span>
                  </button>
                );
              })}

              {starFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStarFilter('all')}
                  className="w-full mt-2 text-[11px] font-bold text-blue-600 hover:underline text-center"
                >
                  عرض جميع التقييمات ({totalReviews})
                </button>
              )}
            </div>
          </div>

          {/* Add Review Form + Live Reviews List */}
          <div className="lg:col-span-8 space-y-5">
            {!isCloudSeeded && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  تنبيه للإدارة: لحفظ التقييمات الجديدة على منتجات الكتالوج الافتراضي في Firestore، يجب دخول مالك المتجر وتفعيل المزامنة السحابية لمرة واحدة لنشر المنتجات في قاعدة البيانات.
                </span>
              </div>
            )}

            {/* Interactive Review Form */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs"
            >
              <div className="font-black text-sm text-slate-900">
                شارك تجربتك وأضف تقييمك للمنتج
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-700">تقييمك بالنجوم:</span>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-115"
                      aria-label={`${star} نجوم`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= activeStarValue
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                  {RATING_LABELS[activeStarValue]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="اكتب اسمك..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">تعليقك وتجربتك *</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={800}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="اكتب رأيك في الخامة والأداء والتعامل مع متجر الموان..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReview ? 'جاري الحفظ...' : 'نشر التقييم والتعليق'}</span>
                </button>
              </div>
            </form>

            {/* Live Reviews List */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-3">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-100">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900">
                            {rev.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleString('ar-EG', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {isCloudAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="حذف التعليق"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pr-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs sm:text-sm text-slate-500">
                {starFilter === 'all'
                  ? 'لا توجد تعليقات مسجلة لهذا المنتج حتى الآن — كن أول من يقيمه!'
                  : `لا توجد تعليقات بتقييم ${starFilter} نجوم.`}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-base sm:text-xl font-black text-slate-900">
              منتجات مشابهة من نفس القسم
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
