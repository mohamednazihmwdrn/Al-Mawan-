export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subPageId?: string;
  subPageName?: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  stockCount: number;
  unit: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  hasOptions?: boolean;
  options?: string[];
  specs?: { label: string; value: string }[];
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'resolved';
  sentVia?: 'database' | 'whatsapp_and_database';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description?: string;
  image: string;
  itemCount?: number;
}

export interface SubPage {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

export interface PaintCatalog {
  id: string;
  title: string;
  brand?: string;
  fileType: 'pdf' | 'image';
  fileUrl: string;
  fileName?: string;
  description?: string;
  createdAt: number;
}

export interface StoreBrand {
  id: string;
  name: string;
  label: string;
  color?: string;
  logoUrl?: string;
  sortOrder?: number;
}

export interface StoreFeature {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  colorTheme: string;
  sortOrder?: number;
}

export interface BannerSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonActionType?: 'none' | 'category' | 'whatsapp' | 'paint_studio' | 'link';
  buttonTarget?: string;
  active: boolean;
  sortOrder?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedOption?: string;
  paintDetails?: {
    colorCode: string;
    colorName: string;
    hex: string;
    finish: string;
    liters: number;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  total: number;
  selectedOption?: string;
  paintDetails?: {
    colorCode: string;
    colorName: string;
    hex: string;
    finish: string;
    liters: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerPhoneAlt?: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: 'cash_on_delivery' | 'instapay' | 'vodafone_cash';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
}

export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  announcementNotice: string;
  phoneNumber: string;
  phoneNumber2: string;
  whatsappNumber: string;
  address: string;
  workingHours: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  currency: string;
  facebookUrl?: string;
  locationMapUrl?: string;
  categoriesTitle?: string;
  categoriesSubtitle?: string;
  productsTitle?: string;
  brandsTitle?: string;
  brandsSubtitle?: string;
  contactBadge?: string;
  contactTitle?: string;
  contactDescription?: string;
  footerBio?: string;
  showHeroBanner?: boolean;
  showValueProps?: boolean;
  showActionCards?: boolean;
  showCategories?: boolean;
  showBrands?: boolean;
  showContactSection?: boolean;
  showPaintStudio?: boolean;
  bannersNonClickable?: boolean;
  taxNumber?: string;
  commercialReg?: string;
  updatedAt?: string;
}
