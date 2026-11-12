import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, Category, CartItem, Order, StoreSettings, OrderStatus, BannerSlide } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_SETTINGS, INITIAL_BANNERS } from '../data/initialData';

interface StoreContextType {
  // Storefront & Admin mode
  activeView: 'storefront' | 'admin';
  setActiveView: (view: 'storefront' | 'admin') => void;
  adminSubTab: 'overview' | 'products' | 'orders' | 'categories' | 'banners' | 'settings';
  setAdminSubTab: (tab: 'overview' | 'products' | 'orders' | 'categories' | 'banners' | 'settings') => void;

  // Secret Owner Auth
  isOwnerAuthenticated: boolean;
  verifyOwnerPassword: (password: string) => Promise<boolean>;
  logoutOwner: () => void;
  isSecretModalOpen: boolean;
  setIsSecretModalOpen: (open: boolean) => void;
  triggerSecretClick: () => void;
  secretClicks: number;

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
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;

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
  addToCart: (product: Product, quantity?: number, selectedOption?: string, paintDetails?: CartItem['paintDetails']) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Checkout & Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Views & Secret Auth
  const [activeView, setActiveView] = useState<'storefront' | 'admin'>('storefront');
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'banners' | 'settings'>('overview');
  
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const secretClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Core Data
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<BannerSlide[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [lastSyncedTime, setLastSyncedTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // 10 Consecutive Clicks Counter on "الموانئ والامدادات"
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

    // Reset count if no click within 4.5 seconds
    secretClickTimeoutRef.current = setTimeout(() => {
      setSecretClicks(0);
    }, 4500);
  };

  const verifyOwnerPassword = async (password: string): Promise<boolean> => {
    if (password === '1272000') {
      setIsOwnerAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setActiveView('admin');
      setIsSecretModalOpen(false);
      showToast('أهلاً بك! تم فتح لوحة تحكم مالك متجر الموان بنجاح.');
      return true;
    }
    return false;
  };

  const logoutOwner = () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    setActiveView('storefront');
    showToast('تم تسجيل الخروج وقفل لوحة التحكم للمالك.');
  };

  // Fetch full state from backend
  const fetchFullState = async () => {
    try {
      const res = await fetch('/api/sync-state');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
        if (data.settings) setSettings(data.settings);
        if (data.orders) setOrders(data.orders);
        if (data.banners) setBanners(data.banners);
        if (data.lastUpdated) setLastSyncedTime(data.lastUpdated);
      }
    } catch (err) {
      console.warn('Backend sync failed, using client state:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFullState();
  }, []);

  // Real-Time Polling: Checks every 3.5 seconds if server data changed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync-timestamp');
        if (res.ok) {
          const { lastUpdated } = await res.json();
          if (lastUpdated && lastUpdated > lastSyncedTime) {
            fetchFullState();
          }
        }
      } catch (err) {
        // quiet ignore in case of offline
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [lastSyncedTime]);

  // Banner Actions
  const addBanner = async (bannerData: Omit<BannerSlide, 'id'>) => {
    setIsSyncing(true);
    const newBanner: BannerSlide = {
      ...bannerData,
      id: `banner-${Date.now()}`
    };
    setBanners((prev) => [...prev, newBanner]);

    try {
      await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to save banner on server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تمت إضافة البنر للواجهة الرئيسية بنجاح');
    }
  };

  const updateBanner = async (id: string, updated: Partial<BannerSlide>) => {
    setIsSyncing(true);
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));

    try {
      await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to update banner on server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم تحديث بيانات البنر');
    }
  };

  const deleteBanner = async (id: string) => {
    setIsSyncing(true);
    setBanners((prev) => prev.filter((b) => b.id !== id));

    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to delete banner:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم حذف البنر من الواجهة');
    }
  };

  const toggleBannerActive = async (id: string) => {
    setIsSyncing(true);
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));

    try {
      await fetch(`/api/banners/${id}/toggle`, { method: 'POST' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم تحديث حالة ظهور البنر');
    }
  };

  // Product Actions with server persistence
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSyncing(true);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to sync new product with server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم إضافة المنتج ومزامنته مع كافة العملاء');
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setIsSyncing(true);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to update product on server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم تحديث بيانات المنتج حياً');
    }
  };

  const deleteProduct = async (id: string) => {
    setIsSyncing(true);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to delete product from server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم حذف المنتج وتحديث الكتالوج');
    }
  };

  const toggleStock = async (id: string) => {
    setIsSyncing(true);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.inStock;
          return { ...p, inStock: next, stockCount: next ? (p.stockCount || 10) : 0 };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/products/${id}/toggle-stock`, { method: 'POST' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to toggle stock on server:', err);
    } finally {
      setIsSyncing(false);
      showToast('تم تحديث حالة التوفر بالمخزن');
    }
  };

  // Category Actions
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to add category to server:', err);
    }
    showToast('تم إضافة القسم الجديد بنجاح');
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
    showToast('تم حذف القسم');
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to update settings on server:', err);
    }
    showToast('تم حفظ إعدادات المحل بنجاح ومزامنتها');
  };

  const resetAllData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      await fetchFullState();
      setCart([]);
      showToast('تمت استعادة البيانات الافتراضية بنجاح');
    } catch (err) {
      console.error('Failed to reset data:', err);
    }
  };

  // Orders Actions
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Promise<Order> => {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to save order to server:', err);
    }

    showToast(`تم إرسال طلبك بنجاح! رقم الطلب: ${orderNumber}`);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to update order status on server:', err);
    }
    showToast('تم تحديث حالة الطلب');
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setLastSyncedTime(Date.now());
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
    showToast('تم حذف الطلب من السجل');
  };

  // Cart Actions
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
        isOwnerAuthenticated,
        verifyOwnerPassword,
        logoutOwner,
        isSecretModalOpen,
        setIsSecretModalOpen,
        triggerSecretClick,
        secretClicks,
        settings,
        updateSettings,
        resetAllData,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
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
