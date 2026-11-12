export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  image: string;
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
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description?: string;
  image: string;
  itemCount?: number;
}

export interface BannerSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonActionType?: 'category' | 'whatsapp' | 'paint_studio' | 'link';
  buttonTarget?: string; // category id or link
  active: boolean;
}

export interface CartItem {
  id: string; // unique item id in cart (product id + selected option)
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
  taxNumber?: string;
  commercialReg?: string;
}
