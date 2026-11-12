import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { COLOR_PALETTES } from '../data/initialData';
import { X, Palette, Calculator, ShoppingCart, MessageSquare, Check, Sparkles, Layers } from 'lucide-react';

export const PaintStudioModal: React.FC = () => {
  const { isPaintStudioOpen, setIsPaintStudioOpen, addToCart, settings, showToast } = useStore();

  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0]);
  const [customHex, setCustomHex] = useState('#E8DEC8');
  const [finish, setFinish] = useState<'matt' | 'semi-gloss' | 'silk' | 'gloss'>('silk');
  const [roomWidth, setRoomWidth] = useState<number>(4);
  const [roomHeight, setRoomHeight] = useState<number>(3);
  const [coats, setCoats] = useState<number>(2);

  if (!isPaintStudioOpen) return null;

  // Pricing based on finish
  const finishPrices = {
    matt: { name: 'مطفي (Matt) - كتم لمعان', price: 885 },
    'semi-gloss': { name: 'نصف لامع (Semi-Gloss)', price: 930 },
    silk: { name: 'حريري فائق النعومة (Silk)', price: 960 },
    gloss: { name: 'لامع كامل (Gloss)', price: 990 }
  };

  // Surface area calculation (4 walls estimate for standard room: 2*(w+w)*h minus 15% doors/windows)
  const roomPerimeter = (roomWidth + roomWidth) * 2;
  const grossWallArea = Math.round(roomPerimeter * roomHeight * 0.85);
  // 1 Liter covers ~12 m² per coat
  const totalCoverageNeeded = grossWallArea * coats;
  const litersNeeded = Math.max(1, Math.ceil(totalCoverageNeeded / 12));
  const bucketsNeeded = Math.max(1, Math.ceil(litersNeeded / 9)); // 9 liter standard bucket

  const activeColorHex = selectedColor ? selectedColor.hex : customHex;
  const activeColorCode = selectedColor ? selectedColor.code : 'CUSTOM-COLOR';
  const activeColorName = selectedColor ? selectedColor.name : 'لون مخصص بالكمبيوتر';

  const handleAddPaintToCart = () => {
    const customProduct = {
      id: `paint-custom-${Date.now()}`,
      name: `بستلة دهان كمبيوتر 9 لتر - كود (${activeColorCode}) ${activeColorName}`,
      brand: 'الموان ستوديو للألوان',
      categoryId: 'computer-paints',
      categoryName: 'خلط ألوان بالكمبيوتر',
      price: finishPrices[finish].price,
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      description: `دهان كمبيوتر خلط فوري بدقة المليجرام. كود اللون: ${activeColorCode}، التشطيب: ${finishPrices[finish].name}. قابل للغسيل ومقاوم للاصفرار.`,
      inStock: true,
      stockCount: 100,
      unit: 'بستلة 9 لتر'
    };

    addToCart(customProduct, bucketsNeeded, undefined, {
      colorCode: activeColorCode,
      colorName: activeColorName,
      hex: activeColorHex,
      finish: finishPrices[finish].name,
      liters: bucketsNeeded * 9
    });

    setIsPaintStudioOpen(false);
  };

  const handleWhatsAppCustomOrder = () => {
    const text = `السلام عليكم ورحمة الله،
أود تجهيز دهان كمبيوتر فوري من متجر الموان:
- كود اللون: ${activeColorCode}
- اسم اللون: ${activeColorName}
- كود الدرجة (Hex): ${activeColorHex}
- نوع التشطيب: ${finishPrices[finish].name}
- عدد البستلات (9 لتر): ${bucketsNeeded} بستلة
- مساحة الغرفة التقريبية: ${grossWallArea} متر مربع
- السعر الإجمالي المقدر: ${finishPrices[finish].price * bucketsNeeded} جنيه مصري.`;

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#132d66] to-[#0d4f3b] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black">
                  استوديو كمبيوتر الألوان - الموان
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  خلط فوري
                </span>
              </div>
              <p className="text-xs text-blue-200">
                تحديد كود اللون، محاكاة الدهان على الحائط، وحساب مساحة الغرفة والكمية باللتر
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPaintStudioOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Visualizer Room */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visualizer Frame */}
            <div className="md:col-span-6 bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5 self-start">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>معاينة حية للون على الجدار الداخلي:</span>
              </div>

              {/* Mockup Room with Live Color */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md relative border border-slate-300 flex flex-col justify-end">
                {/* Wall in background */}
                <div
                  className="absolute inset-0 transition-colors duration-500 flex items-center justify-center"
                  style={{ backgroundColor: activeColorHex }}
                >
                  <div className="text-center p-3 rounded-lg bg-black/30 backdrop-blur-xs text-white max-w-[200px]">
                    <div className="text-xs font-bold">{activeColorName}</div>
                    <div className="text-[11px] font-mono text-amber-300">{activeColorCode}</div>
                  </div>
                </div>

                {/* Floor and couch silhouettes */}
                <div className="relative z-10 w-full h-1/3 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end justify-center pb-2 px-4">
                  <div className="w-3/4 h-8 bg-amber-900/40 rounded-t-lg border-t-2 border-amber-800/60 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/80">
                    أرضية باركيه خشبي
                  </div>
                </div>
              </div>

              {/* Finish Selector */}
              <div className="w-full mt-4">
                <label className="text-xs font-bold text-slate-800 mb-2 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>درجة لمعان وتشطيب البستلة:</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(Object.keys(finishPrices) as Array<keyof typeof finishPrices>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setFinish(key)}
                      className={`p-2 rounded-xl text-right border transition-all ${
                        finish === key
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-1">{finishPrices[key].name}</span>
                        {finish === key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[11px] text-rose-600 font-bold mt-1">
                        EGP {finishPrices[key].price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Palette Picker */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  اختر من كتالوج الألوان الأكثر طلباً بالمحل:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {COLOR_PALETTES.map((palette) => {
                    const isSelected = selectedColor?.code === palette.code;
                    return (
                      <button
                        key={palette.code}
                        onClick={() => setSelectedColor(palette)}
                        className={`p-1.5 rounded-xl border text-right transition-all group flex flex-col items-center ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-full aspect-[4/3] rounded-lg shadow-inner mb-1.5 border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: palette.hex }}
                        />
                        <div className="text-[10px] font-bold text-slate-800 line-clamp-1 w-full text-center">
                          {palette.name.split(' ')[0]}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {palette.code}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeColorHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setSelectedColor({
                        code: `HEX-${e.target.value.replace('#', '').toUpperCase()}`,
                        name: 'لون مخصص برغبة العميل',
                        hex: e.target.value,
                        category: 'مخصص'
                      });
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      أو اختر لونك الخاص يدوياً:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      كود اللون: {activeColorHex}
                    </span>
                  </div>
                </div>

                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md shrink-0"
                  style={{ backgroundColor: activeColorHex }}
                />
              </div>

              {/* Room Area & Quantity Calculator */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span>حاسبة أمتار الحوائط والكمية المطلوبة:</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">عرض الغرفة (م)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value) || 1)}
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">ارتفاع الحائط (م)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(Number(e.target.value) || 1)}
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">عدد الأوجه</label>
                    <select
                      value={coats}
                      onChange={(e) => setCoats(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-center font-bold text-xs"
                    >
                      <option value={1}>وجه واحد (1)</option>
                      <option value={2}>وجهين أساس (2)</option>
                      <option value={3}>3 أوجه تشطيب (3)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-950">
                  <div>
                    <span>مساحة الحوائط الصافية: </span>
                    <span className="text-amber-800">{grossWallArea} م²</span>
                  </div>
                  <div className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md shadow-xs">
                    تحتاج: {bucketsNeeded} بستلة (9 لتر)
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">إجمالي التكلفة المقدرة للبستلات ({bucketsNeeded} بستلة 9 لتر):</div>
            <div className="text-lg sm:text-xl font-black text-rose-600">
              EGP {(finishPrices[finish].price * bucketsNeeded).toLocaleString('en-US')}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleWhatsAppCustomOrder}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تأكيد الكود عبر واتساب</span>
            </button>

            <button
              onClick={handleAddPaintToCart}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>إضافة الدهان للسلة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
