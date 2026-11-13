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
  showPaintStudio: true
};

export const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: "banner-1",
    badge: "المتجر الرسمي المعتمد",
    title: "كل ما تحتاجه من الحدايد والبويات ولوازم المعمار",
    subtitle: "وكلاء وموزعون لأكبر الماركات الأصلية (بوش، توتال، وادفو)",
    description: "توفير كافة مستلزمات البناء والمقاولات والورش بأفضل الأسعار وأعلى جودة مع إمكانية التوصيل والشحن الفوري.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    buttonText: "تصفح العدد الكهربائية",
    buttonActionType: "category",
    buttonTarget: "power-tools",
    active: true,
    sortOrder: 0
  },
  {
    id: "banner-2",
    badge: "تكنولوجيا ألوان حديثة",
    title: "أحدث ماكينة تلوين وخلط بويات بالكمبيوتر فوري",
    subtitle: "أكثر من 15,000 درجة لون من كروت جوتن وسايبس وكبسي",
    description: "اختر كود اللون واستلم دهانك في دقائق بأعلى دقة تغطية ومقاومة للغسيل مع حاسبة ذكية لكمية الجالونات.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
    buttonText: "جرّب كمبيوتر الألوان الآن",
    buttonActionType: "paint_studio",
    active: true,
    sortOrder: 1
  },
  {
    id: "banner-3",
    badge: "خدمة المقاولين وأصحاب المعمار",
    title: "لوازم معمار وحدايد ومعدات ورش وهواء احترافية",
    subtitle: "أسعار جملة وتخفيضات خاصة على كميات المسامير والمعدات",
    description: "مسامير، زوايا، فيشر، كالونات، خراطيم بولي يوريثين، وبساتم هواء أصلية معتمدة.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    buttonText: "عرض لوازم المعمار",
    buttonActionType: "category",
    buttonTarget: "construction-supplies",
    active: true,
    sortOrder: 2
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "power-tools",
    name: "معدات كهربائية وبطارية",
    iconName: "Zap",
    description: "شنيور، صواريخ، هيلتي، بلاور وماكينات غسيل ضغط عالي أصلية",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "hand-tools",
    name: "العدد اليدوية",
    iconName: "Wrench",
    description: "مفاتيح، بنس، مطارق، أطقم لقم ومفكات احترافية",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "computer-paints",
    name: "خلط ألوان بالكمبيوتر",
    iconName: "Palette",
    description: "تلوين فوري بأحدث ماكينات الكمبيوتر لأكثر من 10,000 درجة لون",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "paints-coatings",
    name: "البويات والدهانات",
    iconName: "Paintbrush",
    description: "دهانات بلاستيك، لاكيه، عوازل، بادئات وبويات واجهات جوتن وسايبس",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "construction-supplies",
    name: "لوازم معمار وحدايد",
    iconName: "Hammer",
    description: "مسامير، فيشر، زوايا، كالونات، مفصلات ومستلزمات نجارة ومحارة",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "pneumatic-air",
    name: "معدات ومستلزمات الهواء",
    iconName: "Wind",
    description: "كمبروسرات، خراطيم بولي يوريثين، بساتم وبلوف ومسدسات رش",
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "accessories-safety",
    name: "إكسسوارات ومهمات أمان",
    iconName: "ShieldCheck",
    description: "خوذ، نظارات حماية، قفازات، أقراص صواريخ ورولات ودهانات",
    image: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=600&q=80"
  }
];

export const INITIAL_BRANDS: StoreBrand[] = [
  { id: "brand-1", name: "TOTAL", label: "توتال تولز", color: "#0089c4", sortOrder: 0 },
  { id: "brand-2", name: "BOSCH", label: "بوش الألمانية", color: "#c8102e", sortOrder: 1 },
  { id: "brand-3", name: "WADFOW", label: "وادفو تكنولوجي", color: "#f97316", sortOrder: 2 },
  { id: "brand-4", name: "JOTUN", label: "دهانات جوتن", color: "#0284c7", sortOrder: 3 },
  { id: "brand-5", name: "SIPES", label: "بويات سايبس", color: "#16a34a", sortOrder: 4 },
  { id: "brand-6", name: "Schneider", label: "شنايدر إلكتريك", color: "#059669", sortOrder: 5 },
  { id: "brand-7", name: "السويدي", label: "السويدي للكابلات", color: "#dc2626", sortOrder: 6 },
  { id: "brand-8", name: "AIWO", label: "أيوو للأدوات", color: "#2563eb", sortOrder: 7 }
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
