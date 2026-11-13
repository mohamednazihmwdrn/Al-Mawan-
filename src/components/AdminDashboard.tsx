import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Product,
  OrderStatus,
  BannerSlide,
  ContactInquiry,
  Category,
  StoreBrand,
  StoreFeature
} from '../types/store';
import { compressImageFile } from '../utils/imageCompress';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  MessageSquare,
  Phone,
  DollarSign,
  ArrowRight,
  Lock,
  Image as ImageIcon,
  Cloud,
  Upload,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Eye
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    toggleStock,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    features,
    addFeature,
    updateFeature,
    deleteFeature,
    orders,
    updateOrderStatus,
    deleteOrder,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    setActiveView,
    adminSubTab,
    setAdminSubTab,
    logoutOwner,
    isCloudAdmin,
    isCloudSeeded,
    signInCloudAdmin,
    seedCloudDefaults,
    showToast
  } = useStore();

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    categoryId: categories[0]?.id || 'power-tools',
    price: 100,
    originalPrice: 0,
    discountBadge: '',
    image: '',
    extraImagesText: '',
    description: '',
    inStock: true,
    stockCount: 20,
    unit: 'قطعة',
    optionsText: '',
    isFeatured: true,
    isNew: false,
    isBestSeller: false,
    specs: [] as { label: string; value: string }[]
  });

  // Banner modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    badge: 'المتجر الرسمي',
    subtitle: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'تصفح العروض',
    buttonActionType: 'category' as 'category' | 'whatsapp' | 'paint_studio' | 'link',
    buttonTarget: 'power-tools',
    active: true
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Category form state (Add & Edit)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Feature (ValueProps) form state
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [featureForm, setFeatureForm] = useState({
    title: '',
    subtitle: '',
    iconName: 'ShieldCheck',
    colorTheme: 'blue'
  });

  // Partner Brand form state
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    label: '',
    color: 'blue',
    logoUrl: ''
  });

  // Search & filter in admin
  const [adminSearch, setAdminSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  const inStockCount = products.filter(p => p.inStock).length;

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      brand: 'الموان',
      categoryId: categories[0]?.id || 'power-tools',
      price: 0,
      originalPrice: 0,
      discountBadge: '',
      image: '',
      extraImagesText: '',
      description: '',
      inStock: true,
      stockCount: 10,
      unit: 'قطعة',
      optionsText: '',
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      specs: []
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    const extraImgs = (prod.images || []).filter((img) => img !== prod.image);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      categoryId: prod.categoryId,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      discountBadge: prod.discountBadge || '',
      image: prod.image,
      extraImagesText: extraImgs.join('\n'),
      description: prod.description,
      inStock: prod.inStock,
      stockCount: prod.stockCount,
      unit: prod.unit,
      optionsText: prod.options?.join(', ') || '',
      isFeatured: Boolean(prod.isFeatured),
      isNew: Boolean(prod.isNew),
      isBestSeller: Boolean(prod.isBestSeller),
      specs: prod.specs ? prod.specs.map((s) => ({ ...s })) : []
    });
    setIsProductModalOpen(true);
  };

  const handleProductFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'main' | 'extra'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsCompressingImage(true);
    try {
      if (target === 'main') {
        const compressed = await compressImageFile(files[0]);
        setProductForm((prev) => ({ ...prev, image: compressed }));
        showToast('تم ضغط الصورة الرئيسية وتجهيزها للرفع السحابي');
      } else {
        const compressedList: string[] = [];
        for (let i = 0; i < Math.min(files.length, 6); i++) {
          const url = await compressImageFile(files[i], 700, 85000);
          compressedList.push(url);
        }
        setProductForm((prev) => ({
          ...prev,
          extraImagesText: [prev.extraImagesText, ...compressedList]
            .map((s) => s.trim())
            .filter(Boolean)
            .join('\n')
        }));
        showToast(`تم تجهيز ${compressedList.length} صور إضافية للمنتج`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر معالجة الصورة');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressed = await compressImageFile(file, 1000, 120000);
      setBannerForm((prev) => ({ ...prev, image: compressed }));
      showToast('تم ضغط صورة البنر وتجهيزها بنجاح');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر معالجة صورة البنر');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.image.trim()) {
      showToast('يرجى رفع صورة للمنتج أو وضع رابط صورة صحيح');
      return;
    }
    const cat = categories.find(c => c.id === productForm.categoryId);
    const options = productForm.optionsText
      ? productForm.optionsText.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;
    const extraImages = productForm.extraImagesText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
    const allImages = Array.from(new Set([productForm.image.trim(), ...extraImages].filter(Boolean))).slice(0, 15);
    const cleanSpecs = productForm.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value);

    const payload = {
      name: productForm.name,
      brand: productForm.brand,
      categoryId: productForm.categoryId,
      categoryName: cat?.name || 'عام',
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice) > 0 ? Number(productForm.originalPrice) : undefined,
      discountBadge: productForm.discountBadge || undefined,
      image: productForm.image,
      images: allImages,
      description: productForm.description,
      inStock: productForm.inStock,
      stockCount: Number(productForm.stockCount),
      unit: productForm.unit,
      isFeatured: productForm.isFeatured,
      isNew: productForm.isNew,
      isBestSeller: productForm.isBestSeller,
      hasOptions: !!(options && options.length > 0),
      options,
      specs: cleanSpecs.length > 0 ? cleanSpecs : undefined
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await addProduct(payload);
      }
      setIsProductModalOpen(false);
    } catch {
      // handled by StoreContext toast/error handler
    }
  };

  // Handlers for Banners
  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      badge: 'عرض جديد',
      subtitle: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      buttonText: 'تصفح المنتجات',
      buttonActionType: 'category',
      buttonTarget: 'power-tools',
      active: true
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerSlide) => {
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title,
      badge: b.badge || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      image: b.image,
      buttonText: b.buttonText || 'تصفح العروض',
      buttonActionType: b.buttonActionType || 'category',
      buttonTarget: b.buttonTarget || 'power-tools',
      active: b.active
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.image.trim()) {
      showToast('يرجى كتابة عنوان البنر ووضع رابط أو صورة للبنر');
      return;
    }

    try {
      if (editingBannerId) {
        await updateBanner(editingBannerId, bannerForm);
      } else {
        await addBanner(bannerForm);
      }
      setIsBannerModalOpen(false);
    } catch {
      // handled in StoreContext
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
    } catch {
      // handled in StoreContext
    }
  };

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressed = await compressImageFile(file, 600, 90000);
      setNewCatImage(compressed);
      showToast('تم تجهيز صورة القسم بنجاح');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر معالجة الصورة');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleEditCategoryStart = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
    setNewCatImage(cat.image);
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatImage('');
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catImage =
      newCatImage.trim() ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          image: catImage
        });
      } else {
        await addCategory({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          image: catImage,
          iconName: 'Package',
          itemCount: 0
        });
      }
      handleCancelCategoryEdit();
    } catch {
      // handled in StoreContext
    }
  };

  // Feature Handlers
  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureForm.title.trim() || !featureForm.subtitle.trim()) return;
    try {
      if (editingFeatureId) {
        await updateFeature(editingFeatureId, featureForm);
      } else {
        await addFeature(featureForm);
      }
      setEditingFeatureId(null);
      setFeatureForm({ title: '', subtitle: '', iconName: 'ShieldCheck', colorTheme: 'blue' });
    } catch {
      // handled in StoreContext
    }
  };

  const handleEditFeatureStart = (ft: StoreFeature) => {
    setEditingFeatureId(ft.id);
    setFeatureForm({
      title: ft.title,
      subtitle: ft.subtitle,
      iconName: ft.iconName || 'ShieldCheck',
      colorTheme: ft.colorTheme || 'blue'
    });
  };

  // Brand Handlers
  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressed = await compressImageFile(file, 400, 75000);
      setBrandForm((prev) => ({ ...prev, logoUrl: compressed }));
      showToast('تم تجهيز شعار الماركة بنجاح');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر معالجة الشعار');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim() || !brandForm.label.trim()) return;
    try {
      if (editingBrandId) {
        await updateBrand(editingBrandId, brandForm);
      } else {
        await addBrand(brandForm);
      }
      setEditingBrandId(null);
      setBrandForm({ name: '', label: '', color: 'blue', logoUrl: '' });
    } catch {
      // handled in StoreContext
    }
  };

  const handleEditBrandStart = (br: StoreBrand) => {
    setEditingBrandId(br.id);
    setBrandForm({
      name: br.name,
      label: br.label,
      color: br.color || 'blue',
      logoUrl: br.logoUrl || ''
    });
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    return true;
  });

  const filteredInquiries = inquiries.filter(i => {
    if (inquiryFilter !== 'all' && i.status !== inquiryFilter) return false;
    return true;
  });

  const filteredAdminProducts = products.filter(p => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      
      {/* Admin Top Bar */}
      <div className="bg-[#122854] text-white border-b border-indigo-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">
                  لوحة تحكم مالك متجر الموان
                </h1>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  <span>مزامنة سحابية لحظية متصلة</span>
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {settings.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('storefront')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all active:scale-95"
            >
              <span>معاينة كعميل</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={logoutOwner}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
              title="تسجيل الخروج وقفل اللوحة"
            >
              <Lock className="w-4 h-4" />
              <span>قفل اللوحة والخروج</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-[#0b1c3d] border-t border-white/10 px-4 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2 py-2 text-xs font-bold whitespace-nowrap">
            <button
              onClick={() => setAdminSubTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'overview' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الإحصائيات ونظرة عامة</span>
            </button>

            <button
              onClick={() => setAdminSubTab('banners')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'banners' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>بنرات الواجهة ({banners.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('products')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'products' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>إدارة المنتجات ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('orders')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all relative ${
                adminSubTab === 'orders' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>طلبات العملاء ({orders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              onClick={() => setAdminSubTab('inquiries')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all relative ${
                adminSubTab === 'inquiries' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>استفسارات العملاء ({inquiries.length})</span>
              {newInquiriesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              onClick={() => setAdminSubTab('categories')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'categories' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>الأقسام والتصنيفات ({categories.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('site_content')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'site_content' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>المميزات والماركات</span>
            </button>

            <button
              onClick={() => setAdminSubTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                adminSubTab === 'settings' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>إعدادات ونصوص الموقع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Auth & Sync Status Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {!isCloudAdmin ? (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-black text-amber-950">
                  المزامنة السحابية للنشر غير مفعّلة في هذه الجلسة
                </div>
                <p className="text-amber-800 mt-0.5">
                  لتتمكن من إضافة/تعديل المنتجات والأقسام والبنرات ونصوص الموقع ومزامنتها لحظياً، يرجى تأكيد الدخول بحساب المالك السحابي (Google).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signInCloudAdmin()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow shrink-0"
            >
              <Cloud className="w-4 h-4" />
              <span>تفعيل المزامنة السحابية (Google)</span>
            </button>
          </div>
        ) : !isCloudSeeded ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 text-xs">
              <Cloud className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-black text-blue-950">
                  حساب المالك السحابي متصل — إعدادات وأقسام المتجر جاهزة للنشر
                </div>
                <p className="text-blue-800 mt-0.5">
                  اضغط لمزامنة الأقسام والبنرات والإعدادات الأساسية إلى قاعدة البيانات السحابية.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => seedCloudDefaults(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>مزامنة الإعدادات للسحابة الآن</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* TAB 1: OVERVIEW & STATS */}
        {adminSubTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">إجمالي المبيعات المؤكدة</div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-600">
                    EGP {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">من طلبات المتجر وواتساب</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">إجمالي عدد الطلبات</div>
                  <div className="text-lg sm:text-2xl font-black text-blue-600">
                    {orders.length} طلب
                  </div>
                  <div className="text-[10px] text-amber-600 font-bold mt-1">
                    {pendingOrdersCount} قيد المراجعة الفورية
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">المنتجات المتوفرة بالمخزن</div>
                  <div className="text-lg sm:text-2xl font-black text-indigo-600">
                    {inStockCount} صنف
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">جاهزة للشحن والتسليم</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">بنرات الواجهة النشطة</div>
                  <div className="text-lg sm:text-2xl font-black text-amber-600">
                    {banners.filter(b => b.active).length} بنر
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">قابلة للإضافة والتعديل</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#122854] to-[#1c3e7d] rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-black">
                  مرحباً بك في لوحة تحكم {settings.storeName}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  العنوان المعتمد: {settings.address} | هاتف: {settings.phoneNumber} - {settings.phoneNumber2}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddBanner}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة بنر للواجهة</span>
                </button>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف جديد</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HERO BANNERS MANAGER (الميزة المطلوبة خصيصاً) */}
        {adminSubTab === 'banners' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>إدارة صور وبنرات الواجهة الرئيسية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  يمكنك إضافة صور بنرات جديدة مع النص الذي تريده في الأعلى باحترافية وبدون أي تداخل مع الصورة.
                </p>
              </div>

              <button
                onClick={handleOpenAddBanner}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة بنر جديد</span>
              </button>
            </div>

            {/* Banners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Top Text Preview */}
                  <div className="p-4 bg-slate-900 text-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      {b.badge && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                          {b.badge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {b.active ? 'ظاهر بالواجهة' : 'مخفي'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black line-clamp-1">{b.title}</h4>
                    {b.subtitle && <p className="text-xs text-amber-300 font-bold line-clamp-1">{b.subtitle}</p>}
                    {b.description && <p className="text-[11px] text-slate-300 line-clamp-2">{b.description}</p>}
                  </div>

                  {/* Image View */}
                  <div className="w-full aspect-[21/9] bg-slate-950 relative overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Controls Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleBannerActive(b.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        b.active
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                          : 'border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {b.active ? 'تعطيل الظهور' : 'تفعيل الظهور'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditBanner(b)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="تعديل البنر"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف هذا البنر؟`)) {
                            deleteBanner(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="حذف البنر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGER */}
        {adminSubTab === 'products' && (
          <div className="space-y-4">
            
            {/* Header with Search and Add Button */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الماركة أو القسم..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف جميع المنتجات (${products.length} منتج) لتنظيف المتجر بالكامل؟`)) {
                        clearAllProducts();
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف جميع المنتجات</span>
                  </button>
                )}

                <button
                  onClick={handleOpenAddProduct}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm space-y-3">
                <Package className="w-12 h-12 text-blue-300 mx-auto" />
                <div className="text-base font-black text-slate-900">
                  المتجر نظيف تماماً وجاهز لإضافة منتجاتك الحقيقية
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  لا توجد أي منتجات وهمية الآن. اضغط على زر "إضافة منتج جديد" لإضافة أول منتج بصوره وسعره ومواصفاته ليظهر فوراً للعملاء.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول منتج الآن</span>
                </button>
              </div>
            ) : (
              /* Products Table */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">المنتج والماركة</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5">السعر الحالي</th>
                        <th className="p-3.5">السعر الأصلي</th>
                        <th className="p-3.5">حالة التوفر</th>
                        <th className="p-3.5">المخزون</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdminProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-100 border border-slate-200 p-0.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-blue-600 font-bold uppercase">{p.brand}</div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-600">{p.categoryName}</td>
                          <td className="p-3.5 font-black text-rose-600">
                            EGP {p.price.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-slate-400 line-through">
                            {p.originalPrice ? `EGP ${p.originalPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => toggleStock(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                p.inStock
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {p.inStock ? 'متوفر بالمخزن' : 'غير متوفر'}
                            </button>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">
                            {p.stockCount} {p.unit}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="تعديل"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف المنتج: ${p.name}؟`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: ORDERS MANAGER */}
        {adminSubTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter Pills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-500 ml-1">تصفية حسب الحالة:</span>
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderFilter === st
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? 'جميع الطلبات'
                      : st === 'pending'
                      ? 'جديد'
                      : st === 'processing'
                      ? 'قيد التجهيز'
                      : st === 'shipped'
                      ? 'تم الشحن'
                      : st === 'delivered'
                      ? 'تم التوصيل'
                      : 'ملغي'}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-bold">
                عدد الطلبات: {filteredOrders.length}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                          #{ord.orderNumber}
                        </span>
                        <div>
                          <div className="text-sm font-black text-slate-900">{ord.customerName}</div>
                          <div className="text-xs text-slate-500">
                            بتاريخ: {new Date(ord.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-slate-50"
                        >
                          <option value="pending">جديد (قيد المراجعة)</option>
                          <option value="processing">جاري التجهيز بالمحل</option>
                          <option value="shipped">تم التسليم لمندوب الشحن</option>
                          <option value="delivered">تم التوصيل للعميل</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <a
                          href={`https://wa.me/2${ord.customerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${ord.customerName}، بخصوص طلبك رقم #${ord.orderNumber} من متجر الموان...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="مراسلة العميل عبر واتساب"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="اتصال هاتفي بالعميل"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الطلب #${ord.orderNumber}؟`)) {
                              deleteOrder(ord.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-500 block">رقم الهاتف:</span>
                        <span className="font-bold text-slate-800" dir="ltr">{ord.customerPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">العنوان:</span>
                        <span className="font-bold text-slate-800">{ord.governorate} - {ord.city}</span>
                        <div className="text-[11px] text-slate-600">{ord.address}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 block">طريقة الدفع:</span>
                        <span className="font-bold text-slate-800">
                          {ord.paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام' : ord.paymentMethod === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}
                        </span>
                      </div>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="bg-slate-50/70 rounded-xl border border-slate-100 p-3 space-y-1.5 text-xs">
                        <div className="font-black text-slate-700 text-[11px]">الأصناف المطلوبة ({ord.items.length}):</div>
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-700 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                            <span className="font-bold">
                              • {it.productName} {it.selectedOption ? `(${it.selectedOption})` : ''} × {it.quantity}
                            </span>
                            <span className="font-black text-slate-900">EGP {it.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100">
                      <div className="text-slate-500">
                        الشحن: {ord.shippingFee === 0 ? 'مجاني' : `${ord.shippingFee} ج`}
                      </div>
                      <div className="text-sm font-black text-rose-600">
                        الإجمالي النهائي: EGP {ord.total.toFixed(2)}
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-700">لا توجد طلبات تطابق الفلتر الحالي</div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4B: CUSTOMER INQUIRIES MANAGER */}
        {adminSubTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-500 ml-1">تصفية الاستفسارات:</span>
                {(['all', 'new', 'replied', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inquiryFilter === st
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? 'الكل'
                      : st === 'new'
                      ? 'جديد'
                      : st === 'replied'
                      ? 'تم الرد'
                      : 'مكتمل'}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-500 font-bold">
                عدد الرسائل: {filteredInquiries.length}
              </div>
            </div>

            <div className="space-y-3">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{inq.customerName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {inq.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          بتاريخ: {new Date(inq.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                          {inq.sentVia === 'whatsapp_and_database' ? ' • أُرسل أيضاً عبر واتساب' : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            updateInquiryStatus(inq.id, e.target.value as ContactInquiry['status'])
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-slate-50"
                        >
                          <option value="new">استفسار جديد</option>
                          <option value="replied">تم التواصل والرد</option>
                          <option value="resolved">مكتمل / مغلق</option>
                        </select>

                        <a
                          href={`https://wa.me/2${inq.customerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${inq.customerName}، بخصوص استفسارك (${inq.subject}) في متجر الموان...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="رد عبر واتساب"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        <a
                          href={`tel:${inq.customerPhone}`}
                          className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="اتصال هاتفي"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف استفسار ${inq.customerName}؟`)) {
                              deleteInquiry(inq.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                          title="حذف الاستفسار"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="text-slate-500 font-bold">
                        رقم الهاتف: <span className="text-slate-900" dir="ltr">{inq.customerPhone}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {inq.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-700">لا توجد استفسارات تطابق الفلتر الحالي</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES MANAGER (Add, Edit & Delete) */}
        {adminSubTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  <span>{editingCategoryId ? 'تعديل بيانات القسم' : 'إضافة قسم / تصنيف جديد'}</span>
                </h3>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={handleCancelCategoryEdit}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم القسم *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="مثال: عدد قطع ولحام، مهمات سباكة..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">وصف مختصر</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="شرح للمنتجات المندرجة تحت هذا القسم..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">صورة القسم (رابط أو رفع من جهازك)</label>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200">
                      <Upload className="w-3 h-3" />
                      <span>{isCompressingImage ? 'جاري...' : 'رفع صورة'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newCatImage}
                    onChange={(e) => setNewCatImage(e.target.value)}
                    placeholder="https://... أو ارفع صورة من الجهاز"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                  {newCatImage && (
                    <img
                      src={newCatImage}
                      alt="معاينة القسم"
                      className="w-16 h-16 rounded-full object-cover border border-slate-200 mt-2 mx-auto"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow"
                >
                  {editingCategoryId ? 'حفظ تعديلات القسم' : 'إضافة القسم الآن'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                أقسام المتجر المفعلة حالياً ({categories.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{cat.name}</div>
                          <div className="text-[11px] text-slate-500">{cat.description}</div>
                          <div className="text-[10px] text-blue-600 font-bold mt-0.5">{count} صنف مسجل في هذا القسم</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditCategoryStart(cat)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="تعديل القسم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف قسم: ${cat.name}؟`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="حذف القسم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5B: SITE CONTENT (FEATURES & PARTNER BRANDS) */}
        {adminSubTab === 'site_content' && (
          <div className="space-y-6">
            {/* Store Features / ValueProps Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{editingFeatureId ? 'تعديل بطاقة ميزة' : 'إضافة ميزة للمتجر'}</span>
                  </h3>
                  {editingFeatureId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFeatureId(null);
                        setFeatureForm({ title: '', subtitle: '', iconName: 'ShieldCheck', colorTheme: 'blue' });
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      إلغاء
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveFeature} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان الميزة *</label>
                    <input
                      type="text"
                      required
                      value={featureForm.title}
                      onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                      placeholder="مثال: توصيل سريع لكل مصر"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الوصف المختصر *</label>
                    <input
                      type="text"
                      required
                      value={featureForm.subtitle}
                      onChange={(e) => setFeatureForm({ ...featureForm, subtitle: e.target.value })}
                      placeholder="مثال: شحن آمن حتى باب موقعك أو ورشتك"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">الأيقونة</label>
                      <select
                        value={featureForm.iconName}
                        onChange={(e) => setFeatureForm({ ...featureForm, iconName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                      >
                        <option value="ShieldCheck">درع الضمان</option>
                        <option value="CreditCard">بطاقة دفع</option>
                        <option value="PackageCheck">شحن وتوصيل</option>
                        <option value="Truck">عربة شحن</option>
                        <option value="Headphones">دعم واستشارة</option>
                        <option value="Wrench">عدد ومعدات</option>
                        <option value="Star">نجمة جودة</option>
                        <option value="Clock">سرعة والتزام</option>
                        <option value="Sparkles">عرض مميز</option>
                        <option value="Award">توكيل معتمد</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">لون الأيقونة</label>
                      <select
                        value={featureForm.colorTheme}
                        onChange={(e) => setFeatureForm({ ...featureForm, colorTheme: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                      >
                        <option value="blue">أزرق</option>
                        <option value="amber">ذهبي</option>
                        <option value="emerald">أخضر</option>
                        <option value="indigo">كحلي</option>
                        <option value="rose">أحمر</option>
                        <option value="teal">تركواز</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow"
                  >
                    {editingFeatureId ? 'حفظ تعديلات الميزة' : 'إضافة الميزة للواجهة'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-900">
                  بطاقات مميزات المتجر في الصفحة الرئيسية ({features.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((ft) => (
                    <div key={ft.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-xs">{ft.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ft.subtitle}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditFeatureStart(ft)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`حذف الميزة: ${ft.title}؟`)) deleteFeature(ft.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner Brands Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>{editingBrandId ? 'تعديل علامة تجارية' : 'إضافة ماركة / توكيل جديد'}</span>
                  </h3>
                  {editingBrandId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrandId(null);
                        setBrandForm({ name: '', label: '', color: 'blue', logoUrl: '' });
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      إلغاء
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم الماركة بالإنجليزية أو المختصر *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.name}
                      onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                      placeholder="مثال: BOSCH أو TOTAL أو JOTUN"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الوصف بالعربية *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.label}
                      onChange={(e) => setBrandForm({ ...brandForm, label: e.target.value })}
                      placeholder="مثال: بوش الألمانية للعدد"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">لون الاسم</label>
                    <select
                      value={brandForm.color}
                      onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    >
                      <option value="blue">أزرق</option>
                      <option value="sky">سماوي</option>
                      <option value="red">أحمر</option>
                      <option value="orange">برتقالي</option>
                      <option value="green">أخضر</option>
                      <option value="emerald">أخضر غامق</option>
                      <option value="indigo">كحلي</option>
                      <option value="slate">داكن</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">شعار صورة للماركة (اختياري)</label>
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200">
                        <Upload className="w-3 h-3" />
                        <span>رفع شعار</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={brandForm.logoUrl}
                      onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                      placeholder="اتركه فارغاً لعرض الاسم النصي"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow"
                  >
                    {editingBrandId ? 'حفظ تعديلات الماركة' : 'إضافة العلامة التجارية'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-900">
                  العلامات التجارية وشركاء النجاح ({brands.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {brands.map((br) => (
                    <div key={br.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center justify-between gap-2">
                      <div>
                        {br.logoUrl ? (
                          <img src={br.logoUrl} alt={br.name} className="h-8 object-contain mx-auto mb-1" />
                        ) : (
                          <div className="font-black text-sm text-slate-900 font-mono">{br.name}</div>
                        )}
                        <div className="text-[11px] text-slate-500 font-bold">{br.label}</div>
                      </div>
                      <div className="flex items-center gap-1 pt-1 border-t border-slate-200/70 w-full justify-center">
                        <button
                          onClick={() => handleEditBrandStart(br)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`حذف الماركة: ${br.name}؟`)) deleteBrand(br.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMPREHENSIVE STORE SETTINGS & SITE-WIDE TEXTS / VISIBILITY */}
        {adminSubTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">
                    إعدادات المتجر والتحكم الكامل في نصوص وأقسام الموقع
                  </h3>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>

              {/* Store Identity & Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  1. بيانات المحل والتواصل والشحن
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم المحل الرسمي *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الوصف الفرعي للمحل *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeSubtitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeSubtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">شريط إعلان أو تنبيه أعلى الموقع (اختياري — اتركه فارغاً لإخفائه)</label>
                    <input
                      type="text"
                      value={settingsForm.announcementNotice || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementNotice: e.target.value })}
                      placeholder="مثال: خصم 15% طوال الأسبوع على جميع العدد الكهربائية والشحن مجاني فوق 1000 ج"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رقم الهاتف الأساسي *</label>
                    <input
                      type="tel"
                      required
                      value={settingsForm.phoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-right"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رقم الهاتف الثاني *</label>
                    <input
                      type="tel"
                      required
                      value={settingsForm.phoneNumber2}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber2: e.target.value })}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-right"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رقم الواتساب الرسمي للطلبات *</label>
                    <input
                      type="tel"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-right"
                    />
                    <span className="text-[10px] text-slate-400">بكود مصر: 201029190615</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">مواعيد وساعات العمل *</label>
                    <input
                      type="text"
                      value={settingsForm.workingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">عنوان المحل الرسمي والمعتمد *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">سعر الشحن والتوصيل الافتراضي (EGP)</label>
                    <input
                      type="number"
                      value={settingsForm.deliveryFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الحد الأدنى للشحن المجاني (EGP)</label>
                    <input
                      type="number"
                      value={settingsForm.freeDeliveryThreshold}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رابط فيسبوك (اختياري)</label>
                    <input
                      type="url"
                      value={settingsForm.facebookUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">رابط الخريطة Google Maps (اختياري)</label>
                    <input
                      type="url"
                      value={settingsForm.locationMapUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, locationMapUrl: e.target.value })}
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Homepage Section Texts */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  2. تعديل عناوين ونصوص أقسام الصفحة الرئيسية والفوتر
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان قسم الأقسام الرئيسية</label>
                    <input
                      type="text"
                      value={settingsForm.categoriesTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, categoriesTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الوصف أسفل عنوان الأقسام</label>
                    <input
                      type="text"
                      value={settingsForm.categoriesSubtitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, categoriesSubtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان قسم المنتجات والمعروضات</label>
                    <input
                      type="text"
                      value={settingsForm.productsTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, productsTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان قسم العلامات التجارية</label>
                    <input
                      type="text"
                      value={settingsForm.brandsTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, brandsTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">الوصف أسفل العلامات التجارية</label>
                    <input
                      type="text"
                      value={settingsForm.brandsSubtitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, brandsSubtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">شارة قسم التواصل</label>
                    <input
                      type="text"
                      value={settingsForm.contactBadge || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactBadge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان قسم التواصل</label>
                    <input
                      type="text"
                      value={settingsForm.contactTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">نص وصف قسم التواصل</label>
                    <textarea
                      rows={2}
                      value={settingsForm.contactDescription || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactDescription: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">النبذة التعريفية في أسفل الموقع (Footer)</label>
                    <textarea
                      rows={2}
                      value={settingsForm.footerBio || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerBio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section Visibility Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>3. إظهار أو إخفاء أقسام الواجهة الرئيسية</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { key: 'showHeroBanner', label: 'قسم البنرات الرئيسية (Hero)' },
                    { key: 'showValueProps', label: 'بطاقات مميزات المتجر' },
                    { key: 'showActionCards', label: 'بطاقات الفلاتر السريعة' },
                    { key: 'showCategories', label: 'دوائر الأقسام الرئيسية' },
                    { key: 'showBrands', label: 'قسم العلامات التجارية' },
                    { key: 'showContactSection', label: 'قسم التواصل والرسائل' },
                    { key: 'showPaintStudio', label: 'أداة كمبيوتر الألوان' }
                  ].map((item) => {
                    const checked = settingsForm[item.key as keyof typeof settingsForm] !== false;
                    return (
                      <label
                        key={item.key}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300"
                      >
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, [item.key]: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>تطبيق وحفظ كافة التعديلات فوراً</span>
                </button>
              </div>
            </form>

            {/* Reset / Backup Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900">استعادة الإعدادات والأقسام الافتراضية</h4>
                <p className="text-[11px] text-slate-500">
                  يستعيد الأقسام والبنرات وإعدادات التواصل الأساسية فقط دون المساس بمنتجاتك التي أضفتها.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('هل ترغب في استعادة الإعدادات والأقسام الأساسية للمتجر؟')) {
                    resetAllData();
                    setSettingsForm({ ...settings });
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الإعدادات</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Add / Edit Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#122854] text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>{editingBannerId ? 'تعديل بنر الواجهة' : 'إضافة بنر جديد للواجهة الرئيسية'}</span>
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان الرئيسي للبنر (يظهر بأعلى الصورة باحترافية) *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="مثال: كل ما تحتاجه من الحدايد والبويات ولوازم المعمار..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الشارة الترويجية (Badge)</label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="مثال: المتجر الرسمي، خصم خاص..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">العنوان الفرعي (Subtitle)</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="مثال: بوش، توتال، وادفو، جوتن..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">النص التوضيحي للبنر (Description)</label>
                <textarea
                  rows={2}
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  placeholder="شرح إضافي مختصر عن المنتجات أو العروض..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">صورة البنر (رابط URL أو رفع مباشر من جهازك) *</label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressingImage ? 'جاري الضغط...' : 'رفع صورة من الجهاز'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  placeholder="https://... أو اختر صورة من جهازك"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              {/* Live Preview of image in modal */}
              {bannerForm.image && (
                <div className="p-2 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">معاينة مصغرة للصورة:</span>
                  <div className="w-full aspect-[21/9] rounded-lg overflow-hidden bg-slate-950">
                    <img
                      src={bannerForm.image}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نص زر البنر</label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    placeholder="تصفح العروض، اطلب الآن..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الإجراء عند الضغط</label>
                  <select
                    value={bannerForm.buttonActionType}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonActionType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="category">توجيه إلى قسم معين</option>
                    <option value="whatsapp">محادثة واتساب مبيعات</option>
                    <option value="paint_studio">فتح استوديو كمبيوتر الألوان</option>
                  </select>
                </div>
              </div>

              {bannerForm.buttonActionType === 'category' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">القسم المستهدف للزر:</label>
                  <select
                    value={bannerForm.buttonTarget}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonTarget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>تفعيل ظهور هذا البنر في الواجهة فوراً</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow"
                >
                  {editingBannerId ? 'حفظ تعديلات البنر' : 'إضافة البنر للواجهة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#122854] text-white flex items-center justify-between">
              <h3 className="text-sm font-black">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المنتج بالكامل *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="مثال: شنيور بوش دقاق 650 وات..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الماركة / الشركة *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="BOSCH, TOTAL, WADFOW, جوتن..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">القسم / التصنيف *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر الحالي (EGP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر الأصلي السابق (EGP)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">شارة التخفيض (اختياري)</label>
                  <input
                    type="text"
                    value={productForm.discountBadge}
                    onChange={(e) => setProductForm({ ...productForm, discountBadge: e.target.value })}
                    placeholder="وفر EGP 15"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">الصورة الرئيسية للمنتج *</label>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200">
                      <Upload className="w-3 h-3" />
                      <span>{isCompressingImage ? 'جاري...' : 'رفع من الجهاز'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProductFileUpload(e, 'main')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://... أو ارفع صورة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {productForm.image && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={productForm.image}
                        alt="معاينة المنتج"
                        className="w-12 h-12 rounded-lg object-contain bg-slate-100 border border-slate-200 p-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image: '' })}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        مسح الصورة
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">وحدة البيع</label>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      placeholder="قطعة، طقم، بستلة..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الكمية بالمخزن</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.stockCount}
                      onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">صور إضافية لمعرض المنتج (سطر لكل رابط - اختياري)</label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                    <Upload className="w-3 h-3" />
                    <span>إضافة صور متعددة</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleProductFileUpload(e, 'extra')}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={productForm.extraImagesText}
                  onChange={(e) => setProductForm({ ...productForm, extraImagesText: e.target.value })}
                  placeholder="ضع روابط صور إضافية (كل رابط في سطر جديد) أو ارفعها من جهازك..."
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الخيارات أو المقاسات (مفصولة بفاصلة ,)</label>
                <input
                  type="text"
                  value={productForm.optionsText}
                  onChange={(e) => setProductForm({ ...productForm, optionsText: e.target.value })}
                  placeholder="مقاس 10 مم, مقاس 12 مم, مقاس 14 مم..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Specs Editor */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">المواصفات الفنية للمنتج (اختياري)</span>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        specs: [...prev.specs, { label: '', value: '' }]
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة مواصفة</span>
                  </button>
                </div>

                {productForm.specs.map((sp, idx) => (
                  <div key={idx} className="grid grid-cols-11 gap-2 items-center">
                    <input
                      type="text"
                      value={sp.label}
                      onChange={(e) => {
                        const updated = [...productForm.specs];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setProductForm({ ...productForm, specs: updated });
                      }}
                      placeholder="المواصفة (مثال: القدرة)"
                      className="col-span-5 bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={sp.value}
                      onChange={(e) => {
                        const updated = [...productForm.specs];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setProductForm({ ...productForm, specs: updated });
                      }}
                      placeholder="القيمة (مثال: 650 وات)"
                      className="col-span-5 bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          specs: prev.specs.filter((_, i) => i !== idx)
                        }));
                      }}
                      className="col-span-1 p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وصف المنتج ومميزاته *</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="اكتب وصفاً واضحاً للمنتج واستخداماته وضمانه..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>متوفر بالمخزن</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>منتج مميز</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>وصل حديثاً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>الأكثر مبيعاً</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow"
                >
                  {editingProductId ? 'حفظ التعديلات' : 'إضافة المنتج للمتجر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
