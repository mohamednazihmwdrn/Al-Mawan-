import React from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, MessageSquare, Eye, Star, Images } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openProductDetails, setQuickViewProduct, settings } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.hasOptions && product.options?.length) {
      setQuickViewProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const priceLine = product.price > 0
      ? `- السعر: ${product.price} جنيه مصري`
      : '- السعر: أرجو توضيح السعر (السعر عند التواصل)';
    const text = `السلام عليكم، أود الاستفسار / طلب المنتج التالي من متجر الموان:\n- المنتج: ${product.name}\n- الماركة: ${product.brand}\n${priceLine}\nالرابط/الكود: #${product.id}`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const extraImagesCount = product.images?.filter((img) => img && img !== product.image).length || 0;

  return (
    <div
      onClick={() => openProductDetails(product)}
      className="h-full bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group relative cursor-pointer mobile-product-card"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 absolute top-2.5 right-2.5 left-2.5 z-10 pointer-events-none mobile-card-hide-overlay">
        {product.discountBadge ? (
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            {product.discountBadge}
          </span>
        ) : product.isNew ? (
          <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            وصل حديثاً
          </span>
        ) : (
          <span />
        )}

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            product.inStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {product.inStock ? 'متوفر' : 'نفذت الكمية'}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mt-5 mb-3 flex items-center justify-center p-2 mobile-card-img-box">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {extraImagesCount > 0 && (
          <span className="absolute bottom-2 left-2 bg-slate-900/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 mobile-card-hide-overlay">
            <Images className="w-3 h-3" />
            <span>+{extraImagesCount}</span>
          </span>
        )}

        {/* Always-accessible Quick View Button (Desktop / Tablet) */}
        <button
          type="button"
          onClick={handleQuickView}
          aria-label="عرض سريع للمنتج"
          className="absolute bottom-2 right-2 z-10 bg-white/95 hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 transition-all active:scale-95 mobile-card-hide-overlay"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:text-current" />
          <span>عرض سريع</span>
        </button>

        {/* Desktop Hover Overlay Quick View */}
        <div className="hidden sm:flex absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={handleQuickView}
            className="pointer-events-auto bg-white hover:bg-blue-600 text-slate-900 hover:text-white text-xs font-black px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض سريع للمنتج</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold mb-1 mobile-card-meta">
            <span className="text-blue-700 uppercase tracking-wider">{product.brand}</span>
            <span className="text-slate-600 text-[10px]">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors mobile-card-title">
            {product.name}
          </h3>

          {/* Rating Summary Pill */}
          <div className="flex items-center gap-1 mt-1.5 text-[11px] mobile-card-rating">
            {product.ratingCount && product.ratingCount > 0 ? (
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{(product.ratingAvg ?? 5).toFixed(1)}</span>
                <span className="text-slate-400 font-medium">({product.ratingCount} تقييم)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <Star className="w-3 h-3 text-amber-400" />
                <span>التقييمات والتعليقات</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-2 mobile-card-price-wrap">
          {product.price > 0 ? (
            <>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-[11px] text-slate-400 line-through font-semibold mobile-card-price-old">
                  EGP {product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}

              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600 mobile-card-price-label">
                  {product.hasOptions ? 'من EGP' : 'EGP'}
                </span>
                <span className="text-base sm:text-lg font-black text-rose-600 mobile-card-price-val">
                  {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </>
          ) : (
            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs sm:text-sm font-black text-blue-700 mobile-card-contact-price">
              السعر عند التواصل
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 mobile-card-actions">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 mobile-card-cart-btn ${
            !product.inStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#009fe3] hover:bg-[#0089c4] text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.hasOptions ? 'اختر الخيارات' : 'أضف إلى السلة'}</span>
        </button>

        <button
          onClick={handleWhatsAppOrder}
          title="اطلب فوراً عبر واتساب"
          className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shrink-0 mobile-card-wa-btn"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
