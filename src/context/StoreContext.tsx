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
  getDocs,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import {
  Product,
  ProductReview,
  ContactInquiry,
  Category,
  CartItem,
  Order,
  StoreSettings,
  OrderStatus,
  BannerSlide
} from '../types/store';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_BANNERS
} from '../data/initialData';
import {
  db,
  auth,
  googleProvider,
  OWNER_ADMIN_EMAIL,
  OperationType,
  handleFirestoreError
} from '../firebase';
import { sanitizeId } from '../utils/imageCompress';

export type AdminSubTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inquiries'
  | 'categories'
  | 'banners'
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

  // Secret Owner Auth & Cloud Admin Auth
  isOwnerAuthenticated: boolean;
  verifyOwnerPassword: (password: string) => Promise<boolean>;
  logoutOwner: () => Promise<void>;
  isSecretModalOpen: boolean;
  setIsSecretModalOpen: (open: boolean) => void;
  triggerSecretClick: () => void;
  secretClicks: number;

  firebaseUser: User | null;
  authReady: boolean;
  isCloudAdmin: boolean;
  isCloudSeeded: boolean;
  signInCloudAdmin: () => Promise<boolean>;
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

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Navigation & Search
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
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
const PRODUCT_PAGE_SIZE = 60;

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
  if (s.commercialReg !== undefined) payload.commercialReg = String(s.commercialReg).slice(0, 50);
  if (s.taxNumber !== undefined) payload.taxNumber = String(s.taxNumber).slice(0, 50);
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
  const [fallbackSelectedProduct, setFallbackSelectedProduct] = useState<Product | null>(null);

  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const isCloudAdmin = Boolean(
    firebaseUser?.emailVerified &&
      firebaseUser.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase()
  );

  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const secretClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core Data
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<BannerSlide[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const [productLimit, setProductLimit] = useState<number>(PRODUCT_PAGE_SIZE);
  const [cloudProductCount, setCloudProductCount] = useState<number>(0);
  const [isCloudSeeded, setIsCloudSeeded] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const autoSeedAttemptedRef = useRef<boolean>(false);

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deals' | 'new' | 'bestsellers'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaintStudioOpen, setIsPaintStudioOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive live selectedProduct from Firestore products list
  const selectedProduct =
    (selectedProductId
      ? products.find((p) => p.id === selectedProductId) ||
        (fallbackSelectedProduct?.id === selectedProductId ? fallbackSelectedProduct : null)
      : null);

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
    setFallbackSelectedProduct(product);
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
    setFallbackSelectedProduct(null);
    setActiveView('storefront');
    try {
      if (window.location.hash.startsWith('#product-')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }
  }, []);

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

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Seed default store catalog to Firestore once when Admin logs in
  const seedCloudDefaults = useCallback(
    async (force = false) => {
      if (!isCloudAdmin) {
        showToast('يرجى تسجيل الدخول بحساب المالك السحابي (Google) أولاً.');
        return;
      }

      setIsSyncing(true);
      try {
        if (!force) {
          const existingSnap = await getDocs(query(collection(db, 'products'), limit(1)));
          if (!existingSnap.empty) {
            setIsCloudSeeded(true);
            setIsSyncing(false);
            return;
          }
        }

        const batch = writeBatch(db);

        // Settings
        batch.set(doc(db, 'settings', 'store'), buildSettingsPayload(INITIAL_SETTINGS));

        // Banners
        INITIAL_BANNERS.forEach((b, idx) => {
          batch.set(doc(db, 'banners', sanitizeId(b.id)), buildBannerPayload(b, idx));
        });

        // Categories
        INITIAL_CATEGORIES.forEach((c) => {
          batch.set(doc(db, 'categories', sanitizeId(c.id)), buildCategoryPayload(c));
        });

        // Products (staggered timestamps to keep default display order)
        const baseTs = Date.now();
        INITIAL_PRODUCTS.forEach((p, idx) => {
          const productWithTime: Product = {
            ...p,
            createdAt: baseTs - idx * 1000,
            updatedAt: baseTs
          };
          batch.set(doc(db, 'products', sanitizeId(p.id)), buildProductPayload(productWithTime));
        });

        await batch.commit();
        setIsCloudSeeded(true);
        setLastSyncedTime(Date.now());
        showToast('تم نشر ومزامنة الكتالوج والبيانات الافتراضية على السحابة بنجاح!');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'batch-seed');
      } finally {
        setIsSyncing(false);
      }
    },
    [isCloudAdmin, showToast]
  );

  // Auto-seed once when Cloud Admin signs in and Firestore is empty
  useEffect(() => {
    if (authReady && isCloudAdmin && !autoSeedAttemptedRef.current) {
      autoSeedAttemptedRef.current = true;
      seedCloudDefaults(false).catch((err) => {
        console.warn('Auto-seed skipped or failed:', err);
      });
    }
  }, [authReady, isCloudAdmin, seedCloudDefaults]);

  // --- Real-Time Firestore Listeners (Public Catalog) ---

  // 1. Settings listener
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'store');
    const unsub = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...INITIAL_SETTINGS, ...(snap.data() as Partial<StoreSettings>) });
          setLastSyncedTime(Date.now());
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'settings/store');
      }
    );
    return () => unsub();
  }, []);

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
          setLastSyncedTime(Date.now());
        } else {
          setBanners(INITIAL_BANNERS);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'banners');
      }
    );
    return () => unsub();
  }, []);

  // 3. Categories listener
  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ ...(d.data() as Category), id: d.id }));
          setCategories(loaded);
          setLastSyncedTime(Date.now());
        } else {
          setCategories(INITIAL_CATEGORIES);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'categories');
      }
    );
    return () => unsub();
  }, []);

  // 4. Products listener (Scalable paginated query)
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(productLimit)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCloudProductCount(snap.size);
        if (!snap.empty) {
          setIsCloudSeeded(true);
          const loaded = snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id }));
          setProducts(loaded);
          setLastSyncedTime(Date.now());
        } else {
          setIsCloudSeeded(false);
          setProducts(INITIAL_PRODUCTS);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    );
    return () => unsub();
  }, [productLimit]);

  const loadMoreProducts = () => {
    setProductLimit((prev) => prev + PRODUCT_PAGE_SIZE);
  };

  // --- Real-Time Firestore Listeners (PII Collections - Admin ONLY) ---

  // 5. Orders listener (strictly guarded by isCloudAdmin)
  useEffect(() => {
    if (!authReady || !isCloudAdmin) {
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
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    );
    return () => unsub();
  }, [authReady, isCloudAdmin]);

  // 6. Inquiries listener (strictly guarded by isCloudAdmin)
  useEffect(() => {
    if (!authReady || !isCloudAdmin) {
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
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );
    return () => unsub();
  }, [authReady, isCloudAdmin]);

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

  const signInCloudAdmin = async (): Promise<boolean> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      if (user.email?.toLowerCase() !== OWNER_ADMIN_EMAIL.toLowerCase() || !user.emailVerified) {
        await signOut(auth);
        showToast('هذا الحساب غير مصرح له بإدارة المتجر. يرجى الدخول بحساب المالك المعتمد.');
        return false;
      }
      setIsOwnerAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setActiveView('admin');
      setIsSecretModalOpen(false);
      showToast('تم تفعيل المزامنة السحابية الحية للمالك بنجاح!');
      return true;
    } catch (err) {
      console.error('Google Sign-In error:', err);
      showToast('تعذر إكمال تسجيل الدخول بجوجل، حاول مرة أخرى.');
      return false;
    }
  };

  const logoutOwner = async () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    setActiveView('storefront');
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    showToast('تم تسجيل الخروج وقفل لوحة التحكم للمالك.');
  };

  const ensureCloudAdminOrThrow = () => {
    if (!isCloudAdmin) {
      showToast('لحفظ ونشر التعديلات سحابياً لجميع العملاء في مصر، يرجى تأكيد حساب المالك بجوجل من أعلى اللوحة.');
      throw new Error('CLOUD_ADMIN_AUTH_REQUIRED');
    }
  };

  // --- Banner CRUD ---

  const addBanner = async (bannerData: Omit<BannerSlide, 'id'>) => {
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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

  const toggleStock = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const nextInStock = !current.inStock;
    await updateProduct(id, {
      inStock: nextInStock,
      stockCount: nextInStock ? current.stockCount || 10 : 0
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
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
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

  const deleteCategory = async (id: string) => {
    ensureCloudAdminOrThrow();
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'categories', id));
      setLastSyncedTime(Date.now());
      showToast('تم حذف القسم');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Settings CRUD ---

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      showToast('تم تحديث حالة الطلب');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    ensureCloudAdminOrThrow();
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
    ensureCloudAdminOrThrow();
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), { status });
      showToast('تم تحديث حالة الاستفسار');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiryId}`);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    ensureCloudAdminOrThrow();
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
  const hasMoreProducts = cloudProductCount >= productLimit;

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
        firebaseUser,
        authReady,
        isCloudAdmin,
        isCloudSeeded,
        signInCloudAdmin,
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
        toggleStock,
        subscribeToProductReviews,
        addProductReview,
        deleteProductReview,
        categories,
        addCategory,
        deleteCategory,
        selectedCategoryId,
        setSelectedCategoryId,
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
