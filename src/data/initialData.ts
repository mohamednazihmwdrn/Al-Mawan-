import {
  Product,
  Category,
  StoreSettings,
  Order,
  BannerSlide,
  StoreBrand,
  StoreFeature
} from '../types/store';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "الموان للحدايد والبويات ولوازم المعمار",
  storeSubtitle: "مركز متكامل للعدد الأصلية، الدهانات، مستلزمات البناء وخلط ألوان الكمبيوتر",
  announcementNotice: "",
  phoneNumber: "01008377405",
  phoneNumber2: "01029190615",
  whatsappNumber: "201029190615",
  address: "الهضبة الوسطي المقطم شارع الحي الثاني امام اسماك المحروسه",
  workingHours: "يومياً من 8:00 صباحاً حتى 11:00 مساءً",
  deliveryFee: 50,
  freeDeliveryThreshold: 1000,
  currency: "EGP",
  facebookUrl: "https://facebook.com",
  locationMapUrl: "https://maps.google.com",
  categoriesTitle: "تصفح أقسام المحل الرئيسية",
  categoriesSubtitle: "عدد أصلية، دهانات كمبيوتر، لوازم نجارة ومعمار",
  productsTitle: "كافة المعروضات ولوازم المعمار",
  brandsTitle: "علاماتنا التجارية وشركاء النجاح",
  brandsSubtitle: "وكلاء وموزعون معتمدون لأفضل العلامات العالمية والمحلية في مصر",
  contactBadge: "خدمة العملاء واستشارات المعمار",
  contactTitle: "تواصل مع الموان للحدايد والبويات ولوازم المعمار مباشرة",
  contactDescription: "هل تبحث عن معدة معينة، تسعير جملة لمشروع مقاولات، أو كود لون بالكمبيوتر؟ أرسل استفسارك وسيصل مباشرة لإدارة المتجر أو تواصل فوراً عبر واتساب.",
  footerBio: "نوفر لعملائنا نخب أول من العدد اليدوية والكهربائية ومستلزمات الهواء والدهانات الأصلية مع خلط ألوان دقيق بالكمبيوتر.",
  showHeroBanner: true,
  showValueProps: true,
  showActionCards: true,
  showCategories: true,
  showBrands: true,
  showContactSection: true,
  showPaintStudio: true,
  bannersNonClickable: true
};

export const INITIAL_BANNERS: BannerSlide[] = [];

export const LEGACY_DEMO_BANNER_IDS = ['banner-1', 'banner-2', 'banner-3'];

export const INITIAL_CATEGORIES: Category[] = [];

export const LEGACY_DEMO_CATEGORY_IDS = [
  'power-tools',
  'hand-tools',
  'computer-paints',
  'paints-coatings',
  'construction-supplies',
  'pneumatic-air',
  'accessories-safety'
];

export const INITIAL_BRANDS: StoreBrand[] = [
  { id: "brand-pachin", name: "PACHIN", label: "باكين للدهانات", color: "indigo", logoUrl: "/assets/aistudio/images__7__11718147.jpeg", sortOrder: 0 },
  { id: "brand-jotun", name: "JOTUN", label: "دهانات جوتن", color: "blue", logoUrl: "/assets/aistudio/images_4520ed84.png", sortOrder: 1 },
  { id: "brand-glc", name: "GLC", label: "جي إل سي للدهانات", color: "red", logoUrl: "/assets/aistudio/images__1__cb7c7b1c.jpeg", sortOrder: 2 },
  { id: "brand-sipes", name: "SIPES", label: "بويات سايبس", color: "red", logoUrl: "/assets/aistudio/images__3__ec595a99.jpeg", sortOrder: 3 },
  { id: "brand-mido", name: "MIDO", label: "ميدو للدهانات", color: "indigo", logoUrl: "/assets/aistudio/images__2__430e7f0f.png", sortOrder: 4 },
  { id: "brand-cmb", name: "CMB GROUP", label: "كيماويات البناء الحديث CMB", color: "blue", logoUrl: "/assets/aistudio/images__2__1092c755.jpeg", sortOrder: 5 },
  { id: "brand-gyproc", name: "Gyproc", label: "جيبروك سان جوبان", color: "sky", logoUrl: "/assets/aistudio/images__1__91ad340e.png", sortOrder: 6 },
  { id: "brand-ingco", name: "INGCO", label: "إنجكو للعدد والمعدات", color: "orange", logoUrl: "/assets/aistudio/images__5__8011492c.jpeg", sortOrder: 7 },
  { id: "brand-apt", name: "APT", label: "إيه بي تي للعدد", color: "red", logoUrl: "/assets/aistudio/images__4__579ec58e.jpeg", sortOrder: 8 },
  { id: "brand-ahram", name: "AHRAM", label: "الأهرام للأقفال والكوالين", color: "slate", logoUrl: "/assets/aistudio/images__3__fbecccb1.png", sortOrder: 9 },
  { id: "brand-ilock", name: "iLOCK", label: "آي لوك لأدوات الكهرباء", color: "amber", logoUrl: "/assets/aistudio/images__6__0792c347.jpeg", sortOrder: 10 },
  { id: "brand-mohandes", name: "المهندس", label: "المهندس للكيماويات", color: "blue", logoUrl: "/assets/aistudio/images__4__31c12059.png", sortOrder: 11 },
  { id: "brand-swedish", name: "SWEDISH CO.", label: "الشركة السويدية", color: "blue", logoUrl: "/assets/aistudio/5d8cdd33500d8_63f2227e.jpg", sortOrder: 12 }
];

export const LEGACY_TEXT_BRAND_IDS = [
  'brand-1', 'brand-2', 'brand-3', 'brand-4', 'brand-5', 'brand-6', 'brand-7', 'brand-8'
];

export const INITIAL_FEATURES: StoreFeature[] = [
  {
    id: "feat-1",
    title: "ادفع بالطريقة اللي تناسبك",
    subtitle: "كاش عند الاستلام، إنستاباي، أو فودافون كاش",
    iconName: "CreditCard",
    colorTheme: "blue",
    sortOrder: 0
  },
  {
    id: "feat-2",
    title: "توصيل لكل مصر",
    subtitle: "شحن سريع وآمن حتى باب موقعك أو ورشتك",
    iconName: "PackageCheck",
    colorTheme: "amber",
    sortOrder: 1
  },
  {
    id: "feat-3",
    title: "استشارة فنية مجانية",
    subtitle: "خبراء لاختيار نوع البويات والعدد ولوازم المعمار",
    iconName: "Headphones",
    colorTheme: "emerald",
    sortOrder: 2
  },
  {
    id: "feat-4",
    title: "منتجات أصلية 100%",
    subtitle: "ضمان الوكلاء المعتمدين وأعلى جودة مضمونة",
    iconName: "ShieldCheck",
    colorTheme: "indigo",
    sortOrder: 3
  }
];

// Clean catalog: Owner adds all real store products from Owner Dashboard
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

// Legacy demo IDs from initial build so cloud DB can be automatically cleaned
export const LEGACY_DEMO_PRODUCT_IDS = [
  'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7',
  'prod-8', 'prod-9', 'prod-10', 'prod-11', 'prod-12', 'prod-13', 'prod-14'
];

export const COLOR_PALETTES = [
  { code: "ALM-101", name: "أوف وايت ناعم (Off White)", hex: "#F8F7F2", category: "محايد" },
  { code: "ALM-102", name: "بيج عاجي كلاسيك (Ivory Beige)", hex: "#E8DEC8", category: "دافئ" },
  { code: "ALM-103", name: "جراي هاديء (Soft Grey)", hex: "#D6D9DC", category: "مودرن" },
  { code: "ALM-104", name: "كافيه لاتيه (Caffe Latte)", hex: "#C7B299", category: "دافئ" },
  { code: "ALM-105", name: "بستاج بارد (Cool Pistachio)", hex: "#CBE3D5", category: "ألوان طبيعية" },
  { code: "ALM-106", name: "أزرق نيلي كينج (Royal Navy)", hex: "#1C355E", category: "فخم" },
  { code: "ALM-107", name: "جرين فوريست (Forest Green)", hex: "#2E5D4B", category: "ألوان طبيعية" },
  { code: "ALM-108", name: "مستردا ذهبي (Mustard Gold)", hex: "#DDA743", category: "جريء" },
  { code: "ALM-109", name: "تيراكوتا طوبي (Terracotta)", hex: "#B85D43", category: "واجهات" },
  { code: "ALM-110", name: "رمادي أنثراسيت (Anthracite)", hex: "#3B424C", category: "مودرن" },
  { code: "ALM-111", name: "سماوي بيبي بلو (Sky Mist)", hex: "#C2D9E7", category: "هادئ" },
  { code: "ALM-112", name: "كشمير وردي (Cashmere Rose)", hex: "#D4B2B0", category: "هادئ" }
];
