import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
  getDocs,
  where,
  deleteField,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import {
  Product,
  ProductReview,
  ContactInquiry,
  Category,
  SubPage,
  PaintCatalog,
  CartItem,
  Order,
  StoreSettings,
  OrderStatus,
  BannerSlide,
  StoreBrand,
  StoreFeature
} from '../types/store';
import {
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_BANNERS,
  INITIAL_BRANDS,
  INITIAL_FEATURES,
  LEGACY_DEMO_PRODUCT_IDS,
  LEGACY_DEMO_BANNER_IDS,
  LEGACY_DEMO_CATEGORY_IDS,
  LEGACY_TEXT_BRAND_IDS
} from '../data/initialData';
import {
  db,
  OperationType,
  handleFirestoreError,
  isFirestoreQuotaError
} from '../firebase';
import { sanitizeId } from '../utils/imageCompress';

export type AdminSubTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inquiries'
  | 'categories'
  | 'paint_catalogs'
  | 'banners'
  | 'site_content'
  | 'settings';

interface StoreContextType {
  // Storefront, Product Details & Admin mode
  activeView: 'storefront' | 'product' | 'admin';
  setActiveView: (view: 'storefront' | 'product' | 'admin') => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (tab: AdminSubTab) => void;
  selectedProduct: Product | null;
  openProductDetails: (product: Product) => void;
  closeProductDetails: () => void;

  // Secret Owner Auth & Cloud Seed
  isOwnerAuthenticated: boolean;
  verifyOwnerPassword: (password: string) => Promise<boolean>;
  logoutOwner: () => Promise<void>;
  isSecretModalOpen: boolean;
  setIsSecretModalOpen: (open: boolean) => void;
  triggerSecretClick: () => void;
  secretClicks: number;

  isCloudSeeded: boolean;
  seedCloudDefaults: (force?: boolean) => Promise<void>;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetAllData: () => Promise<void>;

  // Banners
  banners: BannerSlide[];
  addBanner: (banner: Omit<BannerSlide, 'id'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<BannerSlide>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerActive: (id: string) => Promise<void>;

  // Products
  products: Product[];
  hasMoreProducts: boolean;
  loadMoreProducts: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  toggleStock: (id: string) => Promise<void>;

  // Reviews
  subscribeToProductReviews: (
    productId: string,
    onReviews: (reviews: ProductReview[]) => void
  ) => Unsubscribe;
  addProductReview: (
    productId: string,
    review: { customerName: string; rating: number; comment: string }
  ) => Promise<void>;
  deleteProductReview: (productId: string, reviewId: string) => Promise<void>;

  // Categories & SubPages
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  subPages: SubPage[];
  addSubPage: (subPage: Omit<SubPage, 'id'>) => Promise<void>;
  updateSubPage: (id: string, subPage: Partial<SubPage>) => Promise<void>;
  deleteSubPage: (id: string) => Promise<void>;

  // Paint Color Catalogs (PDF & Images)
  paintCatalogs: PaintCatalog[];
  addPaintCatalog: (catalog: Omit<PaintCatalog, 'id' | 'createdAt'>) => Promise<void>;
  updatePaintCatalog: (id: string, catalog: Partial<PaintCatalog>) => Promise<void>;
  deletePaintCatalog: (id: string) => Promise<void>;

  // Brands
  brands: StoreBrand[];
  addBrand: (brand: Omit<StoreBrand, 'id'>) => Promise<void>;
  updateBrand: (id: string, brand: Partial<StoreBrand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Features (Value Props)
  features: StoreFeature[];
  addFeature: (feature: Omit<StoreFeature, 'id'>) => Promise<void>;
  updateFeature: (id: string, feature: Partial<StoreFeature>) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;

  // Navigation & Search
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedSubPageId: string | null;
  setSelectedSubPageId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: 'all' | 'deals' | 'new' | 'bestsellers';
  setSelectedFilter: (filter: 'all' | 'deals' | 'new' | 'bestsellers') => void;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedOption?: string,
    paintDetails?: CartItem['paintDetails']
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Checkout & Orders
  orders: Order[];
  createOrder: (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Customer Contact Inquiries
  inquiries: ContactInquiry[];
  submitInquiry: (inquiryData: {
    customerName: string;
    customerPhone: string;
    subject: string;
    message: string;
    sentVia: 'database' | 'whatsapp_and_database';
  }) => Promise<ContactInquiry>;
  updateInquiryStatus: (
    inquiryId: string,
    status: ContactInquiry['status']
  ) => Promise<void>;
  deleteInquiry: (inquiryId: string) => Promise<void>;

  // Modals & Extras
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isPaintStudioOpen: boolean;
  setIsPaintStudioOpen: (open: boolean) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Sync state
  isSyncing: boolean;
  lastSyncedTime: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const AUTH_KEY = 'almawan_owner_session';
const CART_KEY = 'almawan_cart_v1';
const CACHE_PREFIX = 'almawan_cache_v1_';
const PRODUCT_PAGE_SIZE = 60;

function readStoreCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoreCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

// --- Strict Sanitization Builders matching firestore.rules allowlists ---

function buildSettingsPayload(s: StoreSettings): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    storeName: String(s.storeName || INITIAL_SETTINGS.storeName).slice(0, 150),
    phoneNumber: String(s.phoneNumber || INITIAL_SETTINGS.phoneNumber).slice(0, 25),
    whatsappNumber: String(s.whatsappNumber || INITIAL_SETTINGS.whatsappNumber).slice(0, 25),
    address: String(s.address || INITIAL_SETTINGS.address).slice(0, 300),
    deliveryFee: Math.max(0, Math.min(100000, Number(s.deliveryFee) || 0)),
    freeDeliveryThreshold: Math.max(0, Math.min(1000000, Number(s.freeDeliveryThreshold) || 0)),
    currency: String(s.currency || 'EGP').slice(0, 10),
    updatedAt: new Date().toISOString()
  };
  if (s.storeSubtitle !== undefined) payload.storeSubtitle = String(s.storeSubtitle).slice(0, 300);
  if (s.announcementNotice !== undefined) payload.announcementNotice = String(s.announcementNotice).slice(0, 500);
  if (s.phoneNumber2 !== undefined) payload.phoneNumber2 = String(s.phoneNumber2).slice(0, 25);
  if (s.workingHours !== undefined) payload.workingHours = String(s.workingHours).slice(0, 150);
  if (s.facebookUrl !== undefined) payload.facebookUrl = String(s.facebookUrl).slice(0, 300);
  if (s.locationMapUrl !== undefined) payload.locationMapUrl = String(s.locationMapUrl).slice(0, 500);
  if (s.categoriesTitle !== undefined) payload.categoriesTitle = String(s.categoriesTitle).slice(0, 150);
  if (s.categoriesSubtitle !== undefined) payload.categoriesSubtitle = String(s.categoriesSubtitle).slice(0, 250);
  if (s.productsTitle !== undefined) payload.productsTitle = String(s.productsTitle).slice(0, 150);
  if (s.brandsTitle !== undefined) payload.brandsTitle = String(s.brandsTitle).slice(0, 150);
  if (s.brandsSubtitle !== undefined) payload.brandsSubtitle = String(s.brandsSubtitle).slice(0, 250);
  if (s.contactBadge !== undefined) payload.contactBadge = String(s.contactBadge).slice(0, 100);
  if (s.contactTitle !== undefined) payload.contactTitle = String(s.contactTitle).slice(0, 180);
  if (s.contactDescription !== undefined) payload.contactDescription = String(s.contactDescription).slice(0, 500);
  if (s.footerBio !== undefined) payload.footerBio = String(s.footerBio).slice(0, 500);
  if (typeof s.showHeroBanner === 'boolean') payload.showHeroBanner = s.showHeroBanner;
  if (typeof s.showValueProps === 'boolean') payload.showValueProps = s.showValueProps;
  if (typeof s.showActionCards === 'boolean') payload.showActionCards = s.showActionCards;
  if (typeof s.showCategories === 'boolean') payload.showCategories = s.showCategories;
  if (typeof s.showBrands === 'boolean') payload.showBrands = s.showBrands;
  if (typeof s.showContactSection === 'boolean') payload.showContactSection = s.showContactSection;
  if (typeof s.showPaintStudio === 'boolean') payload.showPaintStudio = s.showPaintStudio;
  if (typeof s.bannersNonClickable === 'boolean') payload.bannersNonClickable = s.bannersNonClickable;
  return payload;
}

function buildBannerPayload(b: BannerSlide, index = 0): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: sanitizeId(b.id),
    title: String(b.title).trim().slice(0, 200),
    image: String(b.image).trim().slice(0, 150000),
    active: Boolean(b.active),
    sortOrder: typeof b.sortOrder === 'number' ? b.sortOrder : index
  };
  if (b.badge) payload.badge = String(b.badge).slice(0, 80);
  if (b.subtitle) payload.subtitle = String(b.subtitle).slice(0, 250);
  if (b.description) payload.description = String(b.description).slice(0, 600);
  if (b.buttonText) payload.buttonText = String(b.buttonText).slice(0, 60);
  if (b.buttonActionType) payload.buttonActionType = b.buttonActionType;
  if (b.buttonTarget) payload.buttonTarget = String(b.buttonTarget).slice(0, 200);
  return payload;
}

function buildCategoryPayload(c: Category): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: sanitizeId(c.id),
    name: String(c.name).trim().slice(0, 100),
    image: String(c.image).trim().slice(0, 150000)
  };
  if (c.iconName) payload.iconName = String(c.iconName).slice(0, 50);
  if (c.description) payload.description = String(c.description).slice(0, 400);
  if (typeof c.itemCount === 'number' && c.itemCount >= 0) payload.itemCount = c.itemCount;
  return payload;
}

function buildBrandPayload(b: StoreBrand, index = 0): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: sanitizeId(b.id),
    name: String(b.name).trim().slice(0, 80),
    label: String(b.label).trim().slice(0, 100),
    sortOrder: typeof b.sortOrder === 'number' ? b.sortOrder : index
  };
  if (b.color) payload.color = String(b.color).trim().slice(0, 60);
  if (b.logoUrl && b.logoUrl.trim()) payload.logoUrl = String(b.logoUrl).trim().slice(0, 150000);
  return payload;
}

function buildSubPagePayload(sp: SubPage, index = 0): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: sanitizeId(sp.id),
    categoryId: sanitizeId(sp.categoryId),
    name: String(sp.name).trim().slice(0, 100),
    sortOrder: typeof sp.sortOrder === 'number' ? sp.sortOrder : index
  };
  if (sp.description && sp.description.trim()) {
    payload.description = String(sp.description).trim().slice(0, 500);
  }
  if (sp.image && sp.image.trim()) {
    payload.image = String(sp.image).trim().slice(0, 150000);
  }
  return payload;
}

function buildPaintCatalogPayload(c: PaintCatalog): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: sanitizeId(c.id),
    title: String(c.title).trim().slice(0, 150),
    fileType: c.fileType === 'pdf' ? 'pdf' : 'image',
    fileUrl: String(c.fileUrl).trim().slice(0, 950000),
    createdAt: typeof c.createdAt === 'number' ? c.createdAt : Date.now()
  };
  if (c.brand && c.brand.trim()) payload.brand = String(c.brand).trim().slice(0, 80);
  if (c.fileName && c.fileName.trim()) payload.fileName = String(c.fileName).trim().slice(0, 150);
  if (c.description && c.description.trim()) payload.description = String(c.description).trim().slice(0, 500);
  return payload;
}

function buildFeaturePayload(f: StoreFeature, index = 0): Record<string, unknown> {
  return {
    id: sanitizeId(f.id),
    title: String(f.title).trim().slice(0, 100),
    subtitle: String(f.subtitle).trim().slice(0, 200),
    iconName: String(f.iconName || 'ShieldCheck').trim().slice(0, 40),
    colorTheme: String(f.colorTheme || 'blue').trim().slice(0, 40),
    sortOrder: typeof f.sortOrder === 'number' ? f.sortOrder : index
  };
}

function buildProductPayload(p: Product): Record<string, unknown> {
  const imagesList = Array.isArray(p.images)
    ? p.images.map((u) => String(u).trim()).filter(Boolean).slice(0, 15)
    : [];
  const mainImage = String(p.image || imagesList[0] || '').trim().slice(0, 200000);

  const payload: Record<string, unknown> = {
    id: sanitizeId(p.id),
    name: String(p.name).trim().slice(0, 250),
    brand: String(p.brand || 'الموان').trim().slice(0, 100),
    categoryId: sanitizeId(p.categoryId || 'power-tools'),
    categoryName: String(p.categoryName || 'عام').trim().slice(0, 120),
    price: Math.max(0, Math.min(10000000, Number(p.price) || 0)),
    image: mainImage,
    description: String(p.description || 'منتج أصلي معتمد').trim().slice(0, 3000),
    inStock: Boolean(p.inStock),
    stockCount: Math.max(0, Math.min(1000000, Number(p.stockCount) || 0)),
    unit: String(p.unit || 'قطعة').trim().slice(0, 40),
    createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    updatedAt: Date.now()
  };

  if (p.subPageId && p.subPageId.trim()) {
    payload.subPageId = sanitizeId(p.subPageId);
  }
  if (p.subPageName && p.subPageName.trim()) {
    payload.subPageName = String(p.subPageName).trim().slice(0, 120);
  }
  if (typeof p.originalPrice === 'number' && p.originalPrice >= 0) {
    payload.originalPrice = Math.min(10000000, p.originalPrice);
  }
  if (p.discountBadge && p.discountBadge.trim()) {
    payload.discountBadge = p.discountBadge.trim().slice(0, 60);
  }
  if (imagesList.length > 0) {
    payload.images = imagesList;
  }
  if (typeof p.isFeatured === 'boolean') payload.isFeatured = p.isFeatured;
  if (typeof p.isNew === 'boolean') payload.isNew = p.isNew;
  if (typeof p.isBestSeller === 'boolean') payload.isBestSeller = p.isBestSeller;
  if (typeof p.hasOptions === 'boolean') payload.hasOptions = p.hasOptions;
  if (Array.isArray(p.options) && p.options.length > 0) {
    payload.options = p.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 30);
  }
  if (Array.isArray(p.specs) && p.specs.length > 0) {
    payload.specs = p.specs.slice(0, 30).map((sp) => ({
      label: String(sp.label).slice(0, 100),
      value: String(sp.value).slice(0, 200)
    }));
  }
  if (typeof p.ratingAvg === 'number') {
    payload.ratingAvg = Math.max(0, Math.min(5, p.ratingAvg));
  }
  if (typeof p.ratingCount === 'number') {
    payload.ratingCount = Math.max(0, p.ratingCount);
  }

  return payload;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Views & Secret Auth
  const [activeView, setActiveView] = useState<'storefront' | 'product' | 'admin'>('storefront');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('overview');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        return hash.replace('#product-', '').trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [singleSelectedProduct, setSingleSelectedProduct] = useState<Product | null>(null);

  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const secretClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core Data (Hydrated from local cache for offline/quota resilience, kept synced with Firestore)
  const [settings, setSettings] = useState<StoreSettings>(() =>
    readStoreCache<StoreSettings>('settings', INITIAL_SETTINGS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    readStoreCache<Product[]>('products', [])
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readStoreCache<Category[]>('categories', [])
  );
  const [subPages, setSubPages] = useState<SubPage[]>(() =>
    readStoreCache<SubPage[]>('subpages', [])
  );
  const [paintCatalogs, setPaintCatalogs] = useState<PaintCatalog[]>(() =>
    readStoreCache<PaintCatalog[]>('paint_catalogs', [])
  );
  const [banners, setBanners] = useState<BannerSlide[]>(() =>
    readStoreCache<BannerSlide[]>('banners', [])
  );
  const [brands, setBrands] = useState<StoreBrand[]>(() =>
    readStoreCache<StoreBrand[]>('brands', INITIAL_BRANDS)
  );
  const [features, setFeatures] = useState<StoreFeature[]>(() =>
    readStoreCache<StoreFeature[]>('features', INITIAL_FEATURES)
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const [productsLoaded, setProductsLoaded] = useState<boolean>(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);
  const [subPagesLoaded, setSubPagesLoaded] = useState<boolean>(false);

  const [productLimit, setProductLimit] = useState<number>(PRODUCT_PAGE_SIZE);
  const [cloudProductCount, setCloudProductCount] = useState<number>(0);
  const [isCloudSeeded, setIsCloudSeeded] = useState<boolean>(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const autoSeedAttemptedRef = useRef<boolean>(false);
  const demoCleanupAttemptedRef = useRef<boolean>(false);
  const brandsMigrationAttemptedRef = useRef<boolean>(false);
  const ilockLabelFixedRef = useRef<boolean>(false);
  const quotaNoticeShownRef = useRef<boolean>(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [selectedCategoryId, _setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubPageId, setSelectedSubPageId] = useState<string | null>(null);
  const setSelectedCategoryId = useCallback((id: string | null) => {
    _setSelectedCategoryId(id);
    setSelectedSubPageId(null);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deals' | 'new' | 'bestsellers'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaintStudioOpen, setIsPaintStudioOpen] = useState(false);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasMoreProducts = cloudProductCount >= productLimit;

  // Derive live quickViewProduct from Firestore products list
  const quickViewProduct = quickViewProductId
    ? products.find((p) => p.id === quickViewProductId) || null
    : null;

  const setQuickViewProduct = useCallback((product: Product | null) => {
    setQuickViewProductId(product ? product.id : null);
  }, []);

  // Derive live selectedProduct from Firestore products list or single-doc listener
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) ||
      (singleSelectedProduct?.id === selectedProductId ? singleSelectedProduct : null)
    : null;

  // Sync URL hash for shareable product detail pages
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        const id = hash.replace('#product-', '').trim();
        if (id) {
          setSelectedProductId(id);
          setActiveView('product');
        }
      } else if (activeView === 'product') {
        setSelectedProductId(null);
        setSingleSelectedProduct(null);
        setActiveView('storefront');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeView]);

  useEffect(() => {
    if (selectedProductId && selectedProduct && activeView === 'storefront') {
      setActiveView('product');
    }
  }, [selectedProductId, selectedProduct, activeView]);

  const openProductDetails = useCallback((product: Product) => {
    setSingleSelectedProduct(product);
    setSelectedProductId(product.id);
    setActiveView('product');
    try {
      window.history.replaceState(null, '', `#product-${product.id}`);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeProductDetails = useCallback(() => {
    setSelectedProductId(null);
    setSingleSelectedProduct(null);
    setActiveView('storefront');
    try {
      if (window.location.hash.startsWith('#product-')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }
  }, []);

  // Live watch / auto-close selectedProduct when deleted or updated outside the initial page
  useEffect(() => {
    if (!selectedProductId || !productsLoaded) return;
    const inLoadedList = products.some((p) => p.id === selectedProductId);
    if (inLoadedList) {
      return;
    }

    if (!hasMoreProducts) {
      setSingleSelectedProduct(null);
      setSelectedProductId(null);
      if (activeView === 'product') {
        setActiveView('storefront');
      }
      try {
        if (window.location.hash.startsWith('#product-')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch {
        // ignore
      }
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'products', selectedProductId),
      (snap) => {
        if (snap.exists()) {
          setSingleSelectedProduct({ ...(snap.data() as Product), id: snap.id });
        } else {
          setSingleSelectedProduct(null);
          setSelectedProductId(null);
          if (activeView === 'product') {
            setActiveView('storefront');
          }
          try {
            if (window.location.hash.startsWith('#product-')) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          } catch {
            // ignore
          }
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          console.warn('Firestore quota reached watching selected product.');
          return;
        }
        handleFirestoreError(err, OperationType.GET, `products/${selectedProductId}`);
      }
    );
    return () => unsub();
  }, [selectedProductId, products, productsLoaded, hasMoreProducts, activeView]);

  // Silently close quickViewProduct if deleted from Firestore
  useEffect(() => {
    if (!quickViewProductId || !productsLoaded) return;
    if (!products.some((p) => p.id === quickViewProductId)) {
      setQuickViewProductId(null);
    }
  }, [quickViewProductId, products, productsLoaded]);

  // Silently reset selectedCategoryId / selectedSubPageId if deleted from Firestore
  useEffect(() => {
    if (categoriesLoaded && selectedCategoryId && !categories.some((c) => c.id === selectedCategoryId)) {
      _setSelectedCategoryId(null);
      setSelectedSubPageId(null);
    }
  }, [categories, categoriesLoaded, selectedCategoryId]);

  useEffect(() => {
    if (subPagesLoaded && selectedSubPageId && !subPages.some((sp) => sp.id === selectedSubPageId)) {
      setSelectedSubPageId(null);
    }
  }, [subPages, subPagesLoaded, selectedSubPageId]);

  // Silently sync Cart items with live Firestore products (updates prices/names/images and drops deleted products)
  useEffect(() => {
    if (!productsLoaded) return;
    setCart((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next: CartItem[] = [];

      for (const item of prev) {
        const isCustomPaint = item.productId.startsWith('paint-custom-') || Boolean(item.paintDetails);
        if (isCustomPaint) {
          next.push(item);
          continue;
        }

        const liveProd = products.find((p) => p.id === item.productId);
        if (!liveProd) {
          if (!hasMoreProducts) {
            changed = true;
            continue;
          }
          next.push(item);
          continue;
        }

        const p = item.product;
        const needsUpdate =
          p.updatedAt !== liveProd.updatedAt ||
          p.price !== liveProd.price ||
          p.name !== liveProd.name ||
          p.image !== liveProd.image ||
          p.inStock !== liveProd.inStock ||
          p.brand !== liveProd.brand ||
          p.categoryId !== liveProd.categoryId ||
          p.categoryName !== liveProd.categoryName ||
          p.unit !== liveProd.unit;

        if (needsUpdate) {
          changed = true;
          next.push({ ...item, product: liveProd });
        } else {
          next.push(item);
        }
      }

      return changed ? next : prev;
    });
  }, [products, productsLoaded, hasMoreProducts]);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  const notifyQuotaExceeded = useCallback(() => {
    if (!quotaNoticeShownRef.current) {
      quotaNoticeShownRef.current = true;
      console.warn('Firestore daily free-tier read quota exceeded. Using locally cached data.');
      showToast('تم الوصول للحد اليومي المجاني لقراءة قاعدة البيانات — يتم عرض النسخة المحفوظة مؤقتاً');
    }
  }, [showToast]);

  // Seed default store structure (settings, partner brands, features — NO dummy products/banners/categories)
  const seedCloudDefaults = useCallback(
    async (force = false) => {
      setIsSyncing(true);
      try {
        if (!force) {
          const settingsSnap = await getDocFromServer(doc(db, 'settings', 'store'));
          if (settingsSnap.exists()) {
            setIsCloudSeeded(true);
            setIsSyncing(false);
            return;
          }
        }

        const batch = writeBatch(db);

        // Settings
        batch.set(doc(db, 'settings', 'store'), buildSettingsPayload(INITIAL_SETTINGS));

        // Banners (empty by default unless owner adds them)
        INITIAL_BANNERS.forEach((b, idx) => {
          batch.set(doc(db, 'banners', sanitizeId(b.id)), buildBannerPayload(b, idx));
        });

        // Categories (empty by default unless owner adds them)
        INITIAL_CATEGORIES.forEach((c) => {
          batch.set(doc(db, 'categories', sanitizeId(c.id)), buildCategoryPayload(c));
        });

        // Partner Brands
        INITIAL_BRANDS.forEach((br, idx) => {
          batch.set(doc(db, 'brands', sanitizeId(br.id)), buildBrandPayload(br, idx));
        });

        // Store Features
        INITIAL_FEATURES.forEach((ft, idx) => {
          batch.set(doc(db, 'features', sanitizeId(ft.id)), buildFeaturePayload(ft, idx));
        });

        await batch.commit();
        setIsCloudSeeded(true);
        setLastSyncedTime(Date.now());
        if (force) {
          showToast('تمت مزامنة إعدادات المتجر على السحابة بنجاح!');
        }
      } catch (err) {
        console.warn('Cloud seed notice:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [showToast]
  );

  // One-time automatic cleanup of ALL legacy dummy products, dummy banners, and dummy categories
  useEffect(() => {
    if (demoCleanupAttemptedRef.current) return;
    if (!productsLoaded || !categoriesLoaded || !subPagesLoaded) return;
    if (typeof window !== 'undefined' && localStorage.getItem('almawan_demo_cleaned_v2') === '1') {
      demoCleanupAttemptedRef.current = true;
      return;
    }

    const legacyProducts = products.filter((p) => LEGACY_DEMO_PRODUCT_IDS.includes(p.id));
    const legacyBanners = banners.filter((b) => LEGACY_DEMO_BANNER_IDS.includes(b.id));
    const legacyCategories = categories.filter((c) => LEGACY_DEMO_CATEGORY_IDS.includes(c.id));
    const legacySubPages = subPages.filter((sp) => LEGACY_DEMO_CATEGORY_IDS.includes(sp.categoryId));

    if (
      legacyProducts.length === 0 &&
      legacyBanners.length === 0 &&
      legacyCategories.length === 0 &&
      legacySubPages.length === 0
    ) {
      demoCleanupAttemptedRef.current = true;
      try {
        localStorage.setItem('almawan_demo_cleaned_v2', '1');
      } catch {
        // ignore
      }
      return;
    }

    demoCleanupAttemptedRef.current = true;
    const cleanLegacy = async () => {
      try {
        const refs = [
          ...legacyProducts.map((p) => doc(db, 'products', p.id)),
          ...legacyBanners.map((b) => doc(db, 'banners', b.id)),
          ...legacyCategories.map((c) => doc(db, 'categories', c.id)),
          ...legacySubPages.map((sp) => doc(db, 'subpages', sp.id))
        ];
        for (let i = 0; i < refs.length; i += 400) {
          const batch = writeBatch(db);
          refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
          await batch.commit();
        }
        try {
          localStorage.setItem('almawan_demo_cleaned_v2', '1');
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Legacy demo cleanup notice:', err);
      }
    };
    cleanLegacy();
  }, [products, banners, categories, subPages, productsLoaded, categoriesLoaded, subPagesLoaded]);

  // --- Real-Time Firestore Listeners ---

  // 1. Settings listener
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'store');
    const unsub = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const nextSettings = { ...INITIAL_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
          setIsCloudSeeded(true);
          setSettings(nextSettings);
          writeStoreCache('settings', nextSettings);
          setLastSyncedTime(Date.now());
        } else {
          setIsCloudSeeded(false);
          if (!autoSeedAttemptedRef.current && !snap.metadata.fromCache) {
            autoSeedAttemptedRef.current = true;
            seedCloudDefaults(false).catch(() => {});
          }
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.GET, 'settings/store');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded, seedCloudDefaults]);

  // 2. Banners listener
  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs
            .map((d) => ({ ...(d.data() as BannerSlide), id: d.id }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setBanners(loaded);
          writeStoreCache('banners', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setBanners([]);
          writeStoreCache('banners', []);
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'banners');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 3. Categories listener
  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCategoriesLoaded(true);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ ...(d.data() as Category), id: d.id }));
          setCategories(loaded);
          writeStoreCache('categories', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setCategories([]);
          writeStoreCache('categories', []);
        }
      },
      (err) => {
        setCategoriesLoaded(true);
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'categories');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 3A-sub. SubPages listener
  useEffect(() => {
    const q = query(collection(db, 'subpages'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSubPagesLoaded(true);
        if (!snap.empty) {
          const loaded = snap.docs
            .map((d) => ({ ...(d.data() as SubPage), id: d.id }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setSubPages(loaded);
          writeStoreCache('subpages', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setSubPages([]);
          writeStoreCache('subpages', []);
        }
      },
      (err) => {
        setSubPagesLoaded(true);
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'subpages');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 3A-paint. Paint Color Catalogs listener (PDFs & Images)
  useEffect(() => {
    const q = query(collection(db, 'paint_catalogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ ...(d.data() as PaintCatalog), id: d.id }));
          setPaintCatalogs(loaded);
          writeStoreCache('paint_catalogs', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setPaintCatalogs([]);
          writeStoreCache('paint_catalogs', []);
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'paint_catalogs');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 3B. Partner Brands listener + One-time upgrade from legacy text-only brands to the 13 logo brands
  useEffect(() => {
    const q = query(collection(db, 'brands'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs
            .map((d) => ({ ...(d.data() as StoreBrand), id: d.id }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

          const onlyLegacyTextBrands =
            loaded.length > 0 &&
            loaded.every((b) => LEGACY_TEXT_BRAND_IDS.includes(b.id) && !b.logoUrl);

          if (
            onlyLegacyTextBrands &&
            !brandsMigrationAttemptedRef.current &&
            localStorage.getItem('almawan_brands_migrated_v2') !== '1'
          ) {
            brandsMigrationAttemptedRef.current = true;
            const migrateBrands = async () => {
              try {
                const batch = writeBatch(db);
                loaded.forEach((b) => batch.delete(doc(db, 'brands', b.id)));
                INITIAL_BRANDS.forEach((br, idx) => {
                  batch.set(doc(db, 'brands', sanitizeId(br.id)), buildBrandPayload(br, idx));
                });
                await batch.commit();
                localStorage.setItem('almawan_brands_migrated_v2', '1');
              } catch (err) {
                console.warn('Brand logo migration notice:', err);
              }
            };
            migrateBrands();
            setBrands(INITIAL_BRANDS);
            writeStoreCache('brands', INITIAL_BRANDS);
          } else {
            const ilockDoc = loaded.find((b) => b.id === 'brand-ilock');
            if (ilockDoc && (ilockDoc.label.includes('أقفال') || ilockDoc.label.includes('كوالين'))) {
              const corrected = loaded.map((b) =>
                b.id === 'brand-ilock' ? { ...b, label: 'آي لوك لأدوات الكهرباء' } : b
              );
              setBrands(corrected);
              writeStoreCache('brands', corrected);
              if (!ilockLabelFixedRef.current) {
                ilockLabelFixedRef.current = true;
                updateDoc(doc(db, 'brands', 'brand-ilock'), {
                  label: 'آي لوك لأدوات الكهرباء'
                }).catch(() => {});
              }
            } else {
              setBrands(loaded);
              writeStoreCache('brands', loaded);
            }
          }
          setLastSyncedTime(Date.now());
        } else {
          setBrands([]);
          writeStoreCache('brands', []);
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'brands');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 3C. Store Features listener
  useEffect(() => {
    const q = query(collection(db, 'features'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs
            .map((d) => ({ ...(d.data() as StoreFeature), id: d.id }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setFeatures(loaded);
          writeStoreCache('features', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setFeatures([]);
          writeStoreCache('features', []);
        }
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'features');
      }
    );
    return () => unsub();
  }, [notifyQuotaExceeded]);

  // 4. Products listener
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(productLimit)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProductsLoaded(true);
        setCloudProductCount(snap.size);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id }));
          setProducts(loaded);
          writeStoreCache('products', loaded);
          setLastSyncedTime(Date.now());
        } else {
          setProducts([]);
          writeStoreCache('products', []);
        }
      },
      (err) => {
        setProductsLoaded(true);
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    );
    return () => unsub();
  }, [productLimit, notifyQuotaExceeded]);

  const loadMoreProducts = () => {
    setProductLimit((prev) => prev + PRODUCT_PAGE_SIZE);
  };

  // --- Owner-Session Listeners for Orders & Inquiries ---

  // 5. Orders listener
  useEffect(() => {
    if (!isOwnerAuthenticated) {
      setOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const loaded = snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }));
        setOrders(loaded);
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );
    return () => unsub();
  }, [isOwnerAuthenticated, notifyQuotaExceeded]);

  // 6. Inquiries listener
  useEffect(() => {
    if (!isOwnerAuthenticated) {
      setInquiries([]);
      return;
    }

    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(200));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const loaded = snap.docs.map((d) => ({ ...(d.data() as ContactInquiry), id: d.id }));
        setInquiries(loaded);
      },
      (err) => {
        if (isFirestoreQuotaError(err)) {
          notifyQuotaExceeded();
          return;
        }
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );
    return () => unsub();
  }, [isOwnerAuthenticated, notifyQuotaExceeded]);

  // --- Secret 10-Click Trigger & Owner Auth ---

  const triggerSecretClick = () => {
    if (secretClickTimeoutRef.current) {
      clearTimeout(secretClickTimeoutRef.current);
    }

    setSecretClicks((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        setIsSecretModalOpen(true);
        return 0;
      }
      return next;
    });

    secretClickTimeoutRef.current = setTimeout(() => {
      setSecretClicks(0);
    }, 4500);
  };

  const verifyOwnerPassword = async (password: string): Promise<boolean> => {
    if (password === '1272000') {
      setIsOwnerAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logoutOwner = async () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    setActiveView('storefront');
    showToast('تم تسجيل الخروج وقفل لوحة التحكم.');
  };

  const ensureOwnerSessionOrThrow = () => {
    if (!isOwnerAuthenticated) {
      showToast('يرجى فتح لوحة تحكم المالك أولاً.');
      throw new Error('OWNER_AUTH_REQUIRED');
    }
  };

  // --- Banner CRUD ---

  const addBanner = async (bannerData: Omit<BannerSlide, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`banner-${Date.now()}`);
    const newBanner: BannerSlide = { ...bannerData, id, sortOrder: banners.length };
    try {
      await setDoc(doc(db, 'banners', id), buildBannerPayload(newBanner, banners.length));
      setLastSyncedTime(Date.now());
      showToast('تمت إضافة البنر ومزامنته لحظياً مع جميع العملاء');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `banners/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateBanner = async (id: string, updated: Partial<BannerSlide>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = banners.find((b) => b.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: BannerSlide = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'banners', id), buildBannerPayload(merged));
      setLastSyncedTime(Date.now());
      showToast('تم تحديث بيانات البنر حياً للجميع');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `banners/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteBanner = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'banners', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف البنر من الواجهة');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `banners/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleBannerActive = async (id: string) => {
    const current = banners.find((b) => b.id === id);
    if (!current) return;
    await updateBanner(id, { active: !current.active });
  };

  // --- Product CRUD ---

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`prod-${Date.now()}`);
    const now = Date.now();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'products', id), buildProductPayload(newProduct));
      setLastSyncedTime(now);
      showToast('تم نشر المنتج ومزامنته لحظياً على أجهزة كافة العملاء');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = products.find((p) => p.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: Product = { ...current, ...updated, id, updatedAt: Date.now() };
    try {
      await setDoc(doc(db, 'products', id), buildProductPayload(merged));
      setLastSyncedTime(Date.now());
      showToast('تم تحديث بيانات المنتج حياً');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف المنتج وتحديث الكتالوج');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAllProducts = async () => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        showToast('المتجر نظيف بالفعل ولا يحتوي على أي منتجات.');
        setIsSyncing(false);
        return;
      }
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db);
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      setLastSyncedTime(Date.now());
      showToast(`تم حذف جميع المنتجات (${docs.length}) بنجاح وتنظيف المتجر بالكامل.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'products/clear-all');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleStock = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const nextInStock = !current.inStock;
    await updateProduct(id, {
      inStock: nextInStock,
      stockCount: current.stockCount || 0
    });
  };

  // --- Product Reviews (Subcollection /products/{productId}/reviews) ---

  const subscribeToProductReviews = useCallback(
    (productId: string, onReviews: (reviews: ProductReview[]) => void): Unsubscribe => {
      const path = `products/${productId}/reviews`;
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(100));
      return onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            ...(d.data() as ProductReview),
            id: d.id
          }));
          onReviews(list);
        },
        (err) => {
          if (isFirestoreQuotaError(err)) {
            onReviews([]);
            return;
          }
          handleFirestoreError(err, OperationType.LIST, path);
        }
      );
    },
    []
  );

  const addProductReview = async (
    productId: string,
    review: { customerName: string; rating: number; comment: string }
  ) => {
    const safeProdId = sanitizeId(productId);
    const reviewId = sanitizeId(`rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    const path = `products/${safeProdId}/reviews/${reviewId}`;
    const payload = {
      id: reviewId,
      productId: safeProdId,
      customerName: review.customerName.trim().slice(0, 80),
      rating: Math.max(1, Math.min(5, Math.round(review.rating))),
      comment: review.comment.trim().slice(0, 800),
      verifiedPurchase: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, `products/${safeProdId}/reviews`, reviewId), payload);
      showToast('شكراً لك! تم نشر تقييمك وتعليقك بنجاح.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteProductReview = async (productId: string, reviewId: string) => {
    ensureOwnerSessionOrThrow();
    const safeProdId = sanitizeId(productId);
    const safeRevId = sanitizeId(reviewId);
    const path = `products/${safeProdId}/reviews/${safeRevId}`;
    try {
      await deleteDoc(doc(db, `products/${safeProdId}/reviews`, safeRevId));
      showToast('تم حذف التقييم بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // --- Category CRUD ---

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`cat-${Date.now()}`);
    const newCat: Category = { ...catData, id };
    try {
      await setDoc(doc(db, 'categories', id), buildCategoryPayload(newCat));
      setLastSyncedTime(Date.now());
      showToast('تم إضافة القسم الجديد ومزامنته للجميع');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = categories.find((c) => c.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: Category = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'categories', id), buildCategoryPayload(merged));
      if (merged.name.trim() !== current.name.trim()) {
        const prodSnap = await getDocs(
          query(collection(db, 'products'), where('categoryId', '==', id))
        );
        if (!prodSnap.empty) {
          const nextCatName = merged.name.trim().slice(0, 120) || 'عام';
          const docs = prodSnap.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            docs.slice(i, i + 400).forEach((d) => {
              batch.update(d.ref, {
                categoryName: nextCatName,
                updatedAt: Date.now()
              });
            });
            await batch.commit();
          }
        }
      }
      setLastSyncedTime(Date.now());
      showToast('تم تحديث بيانات القسم بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'categories', id));

      const subSnap = await getDocs(
        query(collection(db, 'subpages'), where('categoryId', '==', id))
      );
      if (!subSnap.empty) {
        const docs = subSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }

      const prodSnap = await getDocs(
        query(collection(db, 'products'), where('categoryId', '==', id))
      );
      if (!prodSnap.empty) {
        const docs = prodSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          docs.slice(i, i + 400).forEach((d) => {
            batch.update(d.ref, {
              categoryId: 'general',
              categoryName: 'عام',
              subPageId: deleteField(),
              subPageName: deleteField(),
              updatedAt: Date.now()
            });
          });
          await batch.commit();
        }
      }

      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
      setLastSyncedTime(Date.now());
      showToast('تم حذف القسم وصفحاته الفرعية');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- SubPages CRUD ---

  const addSubPage = async (spData: Omit<SubPage, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`sub-${Date.now()}-${Math.floor(Math.random() * 100)}`);
    const catCount = subPages.filter((sp) => sp.categoryId === spData.categoryId).length;
    const newSp: SubPage = { ...spData, id, sortOrder: spData.sortOrder ?? catCount };
    try {
      await setDoc(doc(db, 'subpages', id), buildSubPagePayload(newSp, catCount));
      setLastSyncedTime(Date.now());
      showToast('تم إضافة الصفحة الفرعية داخل القسم بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `subpages/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSubPage = async (id: string, updated: Partial<SubPage>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = subPages.find((sp) => sp.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: SubPage = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'subpages', id), buildSubPagePayload(merged));
      if (merged.name.trim() !== current.name.trim() || merged.categoryId !== current.categoryId) {
        const prodSnap = await getDocs(
          query(collection(db, 'products'), where('subPageId', '==', id))
        );
        if (!prodSnap.empty) {
          const nextCat = categories.find((c) => c.id === merged.categoryId);
          const nextSpName = merged.name.trim().slice(0, 120);
          const docs = prodSnap.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            docs.slice(i, i + 400).forEach((d) => {
              const patch: Record<string, unknown> = {
                subPageName: nextSpName,
                updatedAt: Date.now()
              };
              if (merged.categoryId !== current.categoryId) {
                patch.categoryId = sanitizeId(merged.categoryId);
                patch.categoryName = String(nextCat?.name || 'عام').trim().slice(0, 120);
              }
              batch.update(d.ref, patch);
            });
            await batch.commit();
          }
        }
      }
      setLastSyncedTime(Date.now());
      showToast('تم تحديث الصفحة الفرعية بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subpages/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteSubPage = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'subpages', id));
      const prodSnap = await getDocs(
        query(collection(db, 'products'), where('subPageId', '==', id))
      );
      if (!prodSnap.empty) {
        const docs = prodSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          docs.slice(i, i + 400).forEach((d) => {
            batch.update(d.ref, {
              subPageId: deleteField(),
              subPageName: deleteField(),
              updatedAt: Date.now()
            });
          });
          await batch.commit();
        }
      }
      if (selectedSubPageId === id) {
        setSelectedSubPageId(null);
      }
      setLastSyncedTime(Date.now());
      showToast('تم حذف الصفحة الفرعية');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `subpages/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Paint Color Catalogs CRUD (PDFs & Images) ---

  const addPaintCatalog = async (catData: Omit<PaintCatalog, 'id' | 'createdAt'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`pcat-${Date.now()}-${Math.floor(Math.random() * 100)}`);
    const newCatalog: PaintCatalog = {
      ...catData,
      id,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'paint_catalogs', id), buildPaintCatalogPayload(newCatalog));
      setLastSyncedTime(Date.now());
      showToast('تم رفع وإضافة كتالوج الألوان بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `paint_catalogs/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updatePaintCatalog = async (id: string, updated: Partial<PaintCatalog>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = paintCatalogs.find((c) => c.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: PaintCatalog = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'paint_catalogs', id), buildPaintCatalogPayload(merged));
      setLastSyncedTime(Date.now());
      showToast('تم تحديث كتالوج الألوان بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `paint_catalogs/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deletePaintCatalog = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'paint_catalogs', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف كتالوج الألوان');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `paint_catalogs/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Brands CRUD ---

  const addBrand = async (brandData: Omit<StoreBrand, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`brand-${Date.now()}`);
    const newBrand: StoreBrand = { ...brandData, id, sortOrder: brands.length };
    try {
      await setDoc(doc(db, 'brands', id), buildBrandPayload(newBrand, brands.length));
      setLastSyncedTime(Date.now());
      showToast('تمت إضافة العلامة التجارية ومزامنتها');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `brands/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateBrand = async (id: string, updated: Partial<StoreBrand>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = brands.find((b) => b.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: StoreBrand = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'brands', id), buildBrandPayload(merged));
      if (merged.name.trim() !== current.name.trim()) {
        const prodSnap = await getDocs(
          query(collection(db, 'products'), where('brand', '==', current.name))
        );
        if (!prodSnap.empty) {
          const nextBrandName = merged.name.trim().slice(0, 100) || 'الموان';
          const docs = prodSnap.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            docs.slice(i, i + 400).forEach((d) => {
              batch.update(d.ref, {
                brand: nextBrandName,
                updatedAt: Date.now()
              });
            });
            await batch.commit();
          }
        }
      }
      setLastSyncedTime(Date.now());
      showToast('تم تحديث العلامة التجارية بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `brands/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteBrand = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'brands', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف العلامة التجارية');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `brands/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Features (ValueProps) CRUD ---

  const addFeature = async (featData: Omit<StoreFeature, 'id'>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const id = sanitizeId(`feat-${Date.now()}`);
    const newFeat: StoreFeature = { ...featData, id, sortOrder: features.length };
    try {
      await setDoc(doc(db, 'features', id), buildFeaturePayload(newFeat, features.length));
      setLastSyncedTime(Date.now());
      showToast('تمت إضافة الميزة ومزامنتها');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `features/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateFeature = async (id: string, updated: Partial<StoreFeature>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const current = features.find((f) => f.id === id);
    if (!current) {
      setIsSyncing(false);
      return;
    }
    const merged: StoreFeature = { ...current, ...updated, id };
    try {
      await setDoc(doc(db, 'features', id), buildFeaturePayload(merged));
      setLastSyncedTime(Date.now());
      showToast('تم تحديث الميزة بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `features/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFeature = async (id: string) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'features', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف الميزة');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `features/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Settings CRUD ---

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    ensureOwnerSessionOrThrow();
    setIsSyncing(true);
    const merged: StoreSettings = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'store'), buildSettingsPayload(merged));
      setLastSyncedTime(Date.now());
      showToast('تم حفظ إعدادات المحل ومزامنتها لحظياً');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/store');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetAllData = async () => {
    await seedCloudDefaults(true);
    setCart([]);
  };

  // --- Orders CRUD ---

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<Order> => {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = sanitizeId(`ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Strip undefined fields strictly
    const payload: Record<string, unknown> = {
      id,
      orderNumber,
      createdAt: newOrder.createdAt,
      customerName: String(newOrder.customerName).trim().slice(0, 120),
      customerPhone: String(newOrder.customerPhone).trim().slice(0, 25),
      governorate: String(newOrder.governorate || 'القاهرة').trim().slice(0, 60),
      address: String(newOrder.address).trim().slice(0, 300),
      paymentMethod: newOrder.paymentMethod,
      items: newOrder.items.slice(0, 100).map((it) => {
        const cleanItem: Record<string, unknown> = {
          productId: it.productId,
          productName: it.productName,
          brand: it.brand,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity),
          total: Number(it.total)
        };
        if (it.selectedOption) cleanItem.selectedOption = it.selectedOption;
        if (it.paintDetails) cleanItem.paintDetails = it.paintDetails;
        return cleanItem;
      }),
      subtotal: Math.max(0, Number(newOrder.subtotal)),
      shippingFee: Math.max(0, Number(newOrder.shippingFee)),
      discount: Math.max(0, Number(newOrder.discount || 0)),
      total: Math.max(0, Number(newOrder.total)),
      status: 'pending'
    };
    if (newOrder.customerPhoneAlt) payload.customerPhoneAlt = String(newOrder.customerPhoneAlt).slice(0, 25);
    if (newOrder.city) payload.city = String(newOrder.city).slice(0, 80);
    if (newOrder.notes) payload.notes = String(newOrder.notes).slice(0, 500);

    try {
      await setDoc(doc(db, 'orders', id), payload);
      clearCart();
      showToast(`تم إرسال طلبك بنجاح! رقم الطلب: ${orderNumber}`);
      return newOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    ensureOwnerSessionOrThrow();
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      showToast('تم تحديث حالة الطلب');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    ensureOwnerSessionOrThrow();
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      showToast('تم حذف الطلب من السجل');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  // --- Contact Inquiries CRUD ---

  const submitInquiry = async (inquiryData: {
    customerName: string;
    customerPhone: string;
    subject: string;
    message: string;
    sentVia: 'database' | 'whatsapp_and_database';
  }): Promise<ContactInquiry> => {
    const id = sanitizeId(`inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    const newInquiry: ContactInquiry = {
      id,
      customerName: inquiryData.customerName.trim().slice(0, 100),
      customerPhone: inquiryData.customerPhone.trim().slice(0, 25),
      subject: inquiryData.subject.trim().slice(0, 120),
      message: inquiryData.message.trim().slice(0, 1500),
      status: 'new',
      sentVia: inquiryData.sentVia,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'inquiries', id), newInquiry);
      showToast('تم استلام استفسارك بنجاح! سيتواصل معك فريق الموان قريباً.');
      return newInquiry;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${id}`);
    }
  };

  const updateInquiryStatus = async (
    inquiryId: string,
    status: ContactInquiry['status']
  ) => {
    ensureOwnerSessionOrThrow();
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), { status });
      showToast('تم تحديث حالة الاستفسار');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiryId}`);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    ensureOwnerSessionOrThrow();
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      showToast('تم حذف الاستفسار من السجل');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${inquiryId}`);
    }
  };

  // --- Cart Actions ---

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedOption?: string,
    paintDetails?: CartItem['paintDetails']
  ) => {
    const cartItemId = paintDetails
      ? `${product.id}-${paintDetails.colorCode}-${paintDetails.finish}`
      : selectedOption
      ? `${product.id}-${selectedOption}`
      : product.id;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            quantity,
            selectedOption,
            paintDetails
          }
        ];
      }
    });

    showToast(`تمت إضافة "${product.name.slice(0, 25)}..." إلى سلة التسوق`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('تم حذف المنتج من السلة');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        adminSubTab,
        setAdminSubTab,
        selectedProduct,
        openProductDetails,
        closeProductDetails,
        isOwnerAuthenticated,
        verifyOwnerPassword,
        logoutOwner,
        isSecretModalOpen,
        setIsSecretModalOpen,
        triggerSecretClick,
        secretClicks,
        isCloudSeeded,
        seedCloudDefaults,
        settings,
        updateSettings,
        resetAllData,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        products,
        hasMoreProducts,
        loadMoreProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        toggleStock,
        subscribeToProductReviews,
        addProductReview,
        deleteProductReview,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        subPages,
        addSubPage,
        updateSubPage,
        deleteSubPage,
        paintCatalogs,
        addPaintCatalog,
        updatePaintCatalog,
        deletePaintCatalog,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        features,
        addFeature,
        updateFeature,
        deleteFeature,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedSubPageId,
        setSelectedSubPageId,
        searchQuery,
        setSearchQuery,
        selectedFilter,
        setSelectedFilter,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        isCheckoutOpen,
        setIsCheckoutOpen,
        inquiries,
        submitInquiry,
        updateInquiryStatus,
        deleteInquiry,
        quickViewProduct,
        setQuickViewProduct,
        isPaintStudioOpen,
        setIsPaintStudioOpen,
        toastMessage,
        showToast,
        isSyncing,
        lastSyncedTime
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
