import React from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, MessageSquare, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setQuickViewProduct, settings } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.hasOptions && product.options?.length) {
      setQuickViewProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `السلام عليكم، أود طلب المنتج التالي من متجر الموان:\n- المنتج: ${product.name}\n- الماركة: ${product.brand}\n- السعر: ${product.price} جنيه مصري\nالرابط/الكود: #${product.id}`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl group relative cursor-pointer"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 absolute top-2.5 right-2.5 left-2.5 z-10 pointer-events-none">
        {/* Discount Badge */}
        {product.discountBadge ? (
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            {product.discountBadge}
          </span>
        ) : product.isNew ? (
          <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            وصل حديثاً
          </span>
        ) : <span />}

        {/* Stock status indicator */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            product.inStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {product.inStock ? 'متوفر بالمخزن' : 'نفذت الكمية'}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mt-5 mb-3 flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Button overlay */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>معاينة وتفاصيل</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold mb-1">
            <span className="text-blue-700 uppercase tracking-wider">{product.brand}</span>
            <span className="text-slate-600 text-[10px]">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price Section matching screenshots */}
        <div className="pt-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-[11px] text-slate-400 line-through font-semibold">
              EGP {product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-600">
              {product.hasOptions ? 'من EGP' : 'EGP'}
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600">
              {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
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
          className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
