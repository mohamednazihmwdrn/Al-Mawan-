import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { COLOR_PALETTES } from '../data/initialData';
import {
  X,
  Palette,
  Calculator,
  ShoppingCart,
  MessageSquare,
  Check,
  Sparkles,
  Layers,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  ZoomIn,
  BookOpen
} from 'lucide-react';

function dataUrlToBlobUrl(dataUrl: string): string | null {
  try {
    if (!dataUrl.startsWith('data:')) return null;
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/data:([^;]+)/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export const PaintStudioModal: React.FC = () => {
  const {
    isPaintStudioOpen,
    setIsPaintStudioOpen,
    addToCart,
    settings,
    paintCatalogs,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'studio' | 'catalogs'>('studio');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0]);
  const [customHex, setCustomHex] = useState('#E8DEC8');
  const [customCatalogCode, setCustomCatalogCode] = useState('');
  const [finish, setFinish] = useState<'matt' | 'semi-gloss' | 'silk' | 'gloss'>('silk');
  const [roomWidth, setRoomWidth] = useState<number>(4);
  const [roomHeight, setRoomHeight] = useState<number>(3);
  const [coats, setCoats] = useState<number>(2);

  // Active catalog preview (PDF or Image lightbox) derived live from Firestore catalogs
  const [viewingCatalogId, setViewingCatalogId] = useState<string | null>(null);
  const viewingCatalog = viewingCatalogId
    ? paintCatalogs.find((c) => c.id === viewingCatalogId) || null
    : null;
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (viewingCatalogId && !viewingCatalog) {
      setViewingCatalogId(null);
    }
  }, [viewingCatalogId, viewingCatalog]);

  useEffect(() => {
    if (viewingCatalog?.fileType === 'pdf' && viewingCatalog.fileUrl.startsWith('data:')) {
      const url = dataUrlToBlobUrl(viewingCatalog.fileUrl);
      setPdfBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
    setPdfBlobUrl(null);
    return undefined;
  }, [viewingCatalog]);

  if (!isPaintStudioOpen) return null;

  // Pricing based on finish
  const finishPrices = {
    matt: { name: 'مطفي (Matt) - كتم لمعان', price: 885 },
    'semi-gloss': { name: 'نصف لامع (Semi-Gloss)', price: 930 },
    silk: { name: 'حريري فائق النعومة (Silk)', price: 960 },
    gloss: { name: 'لامع كامل (Gloss)', price: 990 }
  };

  // Surface area calculation
  const roomPerimeter = (roomWidth + roomWidth) * 2;
  const grossWallArea = Math.round(roomPerimeter * roomHeight * 0.85);
  const totalCoverageNeeded = grossWallArea * coats;
  const litersNeeded = Math.max(1, Math.ceil(totalCoverageNeeded / 12));
  const bucketsNeeded = Math.max(1, Math.ceil(litersNeeded / 9));

  const activeColorHex = selectedColor ? selectedColor.hex : customHex;
  const activeColorCode = selectedColor ? selectedColor.code : 'CUSTOM-COLOR';
  const activeColorName = selectedColor ? selectedColor.name : 'لون مخصص بالكمبيوتر';

  const handleApplyCatalogCode = () => {
    const trimmed = customCatalogCode.trim();
    if (!trimmed) {
      showToast('يرجى كتابة كود اللون المختار من الكتالوج أولاً');
      return;
    }
    setSelectedColor({
      code: trimmed.toUpperCase(),
      name: viewingCatalog ? `كود من ${viewingCatalog.title}` : 'كود لون من الكتالوج',
      hex: activeColorHex,
      category: 'كتالوج'
    });
    setViewingCatalogId(null);
    setActiveTab('studio');
    showToast(`تم اعتماد كود اللون (${trimmed.toUpperCase()}) بنجاح — يمكنك الآن تحديد التشطيب وإرساله للسلة أو واتساب!`);
  };

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
        <div className="bg-gradient-to-r from-[#132d66] to-[#0d4f3b] text-white p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black">
                  استوديو كمبيوتر الألوان - الموان
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  خلط فوري
                </span>
              </div>
              <p className="text-xs text-blue-200">
                تحديد كود اللون، تصفح كتالوجات PDF والصور، وحساب مساحة الغرفة والكمية باللتر
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPaintStudioOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-[#132d66] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>استوديو التجربة وحاسبة الكميات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalogs')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'catalogs'
                ? 'bg-[#0d4f3b] text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>كتالوجات الألوان (PDF وصور)</span>
            {paintCatalogs.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {paintCatalogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {activeTab === 'studio' ? (
            <>
              {/* Quick Callout for Owner-Uploaded Catalogs */}
              {paintCatalogs.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-emerald-950">
                        تصفح كتالوجات وأكواد الألوان المرفقة ({paintCatalogs.length} كتالوج PDF وصور)
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        تصفح كروت الألوان المعتمدة واختر الكود الذي تريده لخلطه بالكمبيوتر فوراً.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalogs')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-sm transition-colors"
                  >
                    فتح الكتالوجات الآن
                  </button>
                </div>
              )}

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
                    <div
                      className="absolute inset-0 transition-colors duration-500 flex items-center justify-center"
                      style={{ backgroundColor: activeColorHex }}
                    >
                      <div className="text-center p-3 rounded-lg bg-black/35 backdrop-blur-xs text-white max-w-[220px]">
                        <div className="text-xs font-bold">{activeColorName}</div>
                        <div className="text-[11px] font-mono text-amber-300 mt-0.5">{activeColorCode}</div>
                      </div>
                    </div>

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

                  {/* Direct Catalog Color Code Entry */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <label className="text-xs font-black text-blue-950 block">
                      أو اكتب كود اللون مباشرة (من كارت جوتن / سايبس / باكين / GLC):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customCatalogCode}
                        onChange={(e) => setCustomCatalogCode(e.target.value)}
                        placeholder="مثال: JOTUN 10678 أو S-1240"
                        dir="ltr"
                        className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCatalogCode}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shrink-0"
                      >
                        تطبيق الكود
                      </button>
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
            </>
          ) : (
            /* CATALOGS TAB: PDFs & IMAGES */
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    كتالوجات وكروت ألوان الكمبيوتر (PDF وصور عالية الجودة)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اضغط على أي كتالوج لتصفح الدرجات والأكواد، ثم اكتب الكود المطلوب لتجهيزه وطلبه فوراً.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <input
                    type="text"
                    value={customCatalogCode}
                    onChange={(e) => setCustomCatalogCode(e.target.value)}
                    placeholder="اكتب كود اللون هنا..."
                    dir="ltr"
                    className="flex-1 sm:w-44 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCatalogCode}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm shrink-0"
                  >
                    اعتماد الكود
                  </button>
                </div>
              </div>

              {paintCatalogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paintCatalogs.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      {cat.fileType === 'image' ? (
                        <button
                          type="button"
                          onClick={() => setViewingCatalogId(cat.id)}
                          className="relative aspect-[16/10] bg-slate-100 overflow-hidden group w-full block"
                        >
                          <img
                            src={cat.fileUrl}
                            alt={cat.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>صورة كارت ألوان</span>
                          </span>
                          <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" />
                            <span>تكبير وتصفح</span>
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewingCatalogId(cat.id)}
                          className="relative aspect-[16/10] bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-slate-100 flex flex-col items-center justify-center p-4 group w-full"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-2">
                            <FileText className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-black text-rose-900">ملف كتالوج PDF</span>
                          {cat.fileName && (
                            <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-full px-2" dir="ltr">
                              {cat.fileName}
                            </span>
                          )}
                        </button>
                      )}

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          {cat.brand && (
                            <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                              {cat.brand}
                            </span>
                          )}
                          <h5 className="text-sm font-black text-slate-900 line-clamp-1">
                            {cat.title}
                          </h5>
                          {cat.description && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingCatalogId(cat.id)}
                            className="flex-1 py-2 rounded-xl bg-[#132d66] hover:bg-[#0e224d] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>فتح وتصفح الكتالوج</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <h5 className="text-sm font-black text-slate-800">
                    لا توجد ملفات PDF أو صور كتالوج مرفقة بعد
                  </h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    يمكن لمالك المتجر رفع ملفات PDF وصور كروت الألوان من لوحة التحكم ليتمكن العملاء من تصفحها واختيار درجاتهم مباشرة هنا.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              الكود المختار: <span className="font-mono font-black text-slate-800">{activeColorCode}</span> • ({bucketsNeeded} بستلة 9 لتر)
            </div>
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

      {/* Inline PDF / Image Viewer Modal */}
      {viewingCatalog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-5 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#122854] text-white p-3.5 sm:p-4 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-black line-clamp-1">{viewingCatalog.title}</h4>
                {viewingCatalog.brand && (
                  <p className="text-[11px] text-amber-300 font-bold">{viewingCatalog.brand}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfBlobUrl || viewingCatalog.fileUrl}
                  download={viewingCatalog.fileName || `${viewingCatalog.title}.${viewingCatalog.fileType === 'pdf' ? 'pdf' : 'jpg'}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل الملف</span>
                </a>
                {!viewingCatalog.fileUrl.startsWith('data:') && (
                  <a
                    href={viewingCatalog.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">فتح الرابط</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingCatalogId(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-2 sm:p-4">
              {viewingCatalog.fileType === 'image' ? (
                <img
                  src={viewingCatalog.fileUrl}
                  alt={viewingCatalog.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg bg-white"
                />
              ) : (
                <iframe
                  title={viewingCatalog.title}
                  src={pdfBlobUrl || viewingCatalog.fileUrl}
                  className="w-full h-full rounded-xl border border-slate-300 bg-white"
                />
              )}
            </div>

            {/* Quick Select Color Code Footer inside Viewer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                وجدت الدرجة المناسبة في الكتالوج؟ اكتب كود اللون ليتم تجهيزه لك:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={customCatalogCode}
                  onChange={(e) => setCustomCatalogCode(e.target.value)}
                  placeholder="أدخل كود اللون هنا..."
                  dir="ltr"
                  className="flex-1 sm:w-52 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCatalogCode}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shrink-0 shadow"
                >
                  اعتماد الكود والطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
