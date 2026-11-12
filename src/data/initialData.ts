import { Product, Category, StoreSettings, Order, BannerSlide } from '../types/store';

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
  commercialReg: "109843",
  taxNumber: "948-230-112"
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
    active: true
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
    active: true
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
    active: true
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "power-tools",
    name: "معدات كهربائية وبطارية",
    iconName: "Zap",
    description: "شنيور، صواريخ، هيلتي، بلاور وماكينات غسيل ضغط عالي أصلية",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    itemCount: 14
  },
  {
    id: "hand-tools",
    name: "العدد اليدوية",
    iconName: "Wrench",
    description: "مفاتيح، بنس، مطارق، أطقم لقم ومفكات احترافية",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=600&q=80",
    itemCount: 18
  },
  {
    id: "computer-paints",
    name: "خلط ألوان بالكمبيوتر",
    iconName: "Palette",
    description: "تلوين فوري بأحدث ماكينات الكمبيوتر لأكثر من 10,000 درجة لون",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    itemCount: 9
  },
  {
    id: "paints-coatings",
    name: "البويات والدهانات",
    iconName: "Paintbrush",
    description: "دهانات بلاستيك، لاكيه، عوازل، بادئات وبويات واجهات جوتن وسايبس",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
    itemCount: 16
  },
  {
    id: "construction-supplies",
    name: "لوازم معمار وحدايد",
    iconName: "Hammer",
    description: "مسامير، فيشر، زوايا، كالونات، مفصلات ومستلزمات نجارة ومحارة",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80",
    itemCount: 22
  },
  {
    id: "pneumatic-air",
    name: "معدات ومستلزمات الهواء",
    iconName: "Wind",
    description: "كمبروسرات، خراطيم بولي يوريثين، بساتم وبلوف ومسدسات رش",
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80",
    itemCount: 11
  },
  {
    id: "accessories-safety",
    name: "إكسسوارات ومهمات أمان",
    iconName: "ShieldCheck",
    description: "خوذ، نظارات حماية، قفازات، أقراص صواريخ ورولات ودهانات",
    image: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=600&q=80",
    itemCount: 15
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "مفتاح بلدي مشرشر بتصميم لامع ماركة AIWO كروم فاناديوم",
    brand: "AIWO",
    categoryId: "hand-tools",
    categoryName: "العدد اليدوية",
    price: 63.25,
    originalPrice: 81.13,
    discountBadge: "وفر EGP 17.88",
    image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=600&q=80",
    description: "مفتاح تركيبي بلدي ومشرشر مصنوع من سبيكة الكروم فاناديوم الصلبة مع طلاء نيكل لامع مقاوم للصدأ والتآكل، مقبض مريح وعزم دوران فائق.",
    inStock: true,
    stockCount: 45,
    unit: "قطعة",
    isFeatured: true,
    isBestSeller: true,
    hasOptions: true,
    options: ["مقاس 10 مم", "مقاس 12 مم", "مقاس 13 مم", "مقاس 14 مم", "مقاس 17 مم", "مقاس 19 مم", "مقاس 22 مم"],
    specs: [
      { label: "المادة", value: "كروم فاناديوم (Chrome Vanadium)" },
      { label: "الطلاء", value: "نيكل كروم لامع مضاد للتآكل" },
      { label: "المعيار", value: "DIN 3113" }
    ]
  },
  {
    id: "prod-2",
    name: "وادفو ماكينة 2×1 غسيل ضغط عالي 1600 وات 130 بار ومكنسة كهربائية 800 وات - WHP4A16",
    brand: "WADFOW",
    categoryId: "power-tools",
    categoryName: "معدات كهربائية وبطارية",
    price: 4624.05,
    originalPrice: 5315.00,
    discountBadge: "وفر EGP 690.95",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description: "جهاز ثنائي الوظيفة خارق: ماكينة غسيل بضغط ماء عالي 130 بار مع مكنسة شفط مياه وأتربة جافة ورطبة 800 وات، مثالية للورش والسيارات وواجهات المباني.",
    inStock: true,
    stockCount: 12,
    unit: "طقم كامل",
    isFeatured: true,
    isBestSeller: true,
    specs: [
      { label: "قدرة الغسيل", value: "1600 وات - 130 بار" },
      { label: "قدرة المكنسة", value: "800 وات - جاف ورطب" },
      { label: "طول الخرطوم", value: "5 أمتار مقوى" },
      { label: "الملحقات", value: "مسدس رشاش + فوهة صابون + فلتر أتربة" }
    ]
  },
  {
    id: "prod-3",
    name: "وادفو مكنسة ليثيوم بطارية داخلية للشحن السريع WLV1502",
    brand: "WADFOW",
    categoryId: "power-tools",
    categoryName: "معدات كهربائية وبطارية",
    price: 2660.00,
    originalPrice: 2800.00,
    discountBadge: "وفر EGP 140.00",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    description: "مكنسة لاسلكية ذكية تعمل ببطارية ليثيوم عالية السعة تدوم طويلاً، خفيفة الوزن ومجهزة بفلاتر متطورة HEPA لتنظيف الورش والمنازل.",
    inStock: true,
    stockCount: 18,
    unit: "قطعة",
    isFeatured: true,
    isNew: true,
    specs: [
      { label: "نوع البطارية", value: "ليثيوم أيون 2000mAh مدمجة" },
      { label: "قوة الشفط", value: "12KPa إعصاري" },
      { label: "الملحقات", value: "قاعدة شحن جدارية + رؤوس متعددة" }
    ]
  },
  {
    id: "prod-4",
    name: "توتال تولز صاروخ براشليس 20 فولت بدون شاحن وبطارية 8500 د/د - TAGLI201158",
    brand: "TOTAL TOOLS",
    categoryId: "power-tools",
    categoryName: "معدات كهربائية وبطارية",
    price: 1519.79,
    originalPrice: 1750.00,
    discountBadge: "وفر EGP 230.21",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80",
    description: "صاروخ قطعية وجلخ موتور بدون شربون (براشليس) لعمر أطول وعزم قوي، قطر القرص 115 مم مع نظام أمان متقدم ضد الارتداد.",
    inStock: true,
    stockCount: 15,
    unit: "قطعة",
    isBestSeller: true,
    specs: [
      { label: "الموتور", value: "Brushless فائق الكفاءة" },
      { label: "السرعة", value: "8500 لفة في الدقيقة" },
      { label: "قطر القرص", value: "115 مم (4.5 بوصة)" }
    ]
  },
  {
    id: "prod-5",
    name: "جردل دهان بالكمبيوتر (خلط فوري لأي كود لون من اختيارك) - 9 لتر سوبر",
    brand: "الموان ستوديو",
    categoryId: "computer-paints",
    categoryName: "خلط ألوان بالكمبيوتر",
    price: 885.00,
    originalPrice: 980.00,
    discountBadge: "خصم كمبيوتر الألوان",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    description: "تركيب وتلوين فوري بأحدث ماكينات الكمبيوتر الإيطالية، اختر أي كود من كروت جوتن، سايبس، سكيب، أو حدد اللون المطلوب من استوديو الألوان بالمتجر. تغطية ممتازة وقابل للغسيل.",
    inStock: true,
    stockCount: 100,
    unit: "بستلة 9 لتر",
    isFeatured: true,
    isNew: true,
    hasOptions: true,
    options: ["تشطيب مطفي (Matt)", "تشطيب نصف لامع (Semi-Gloss)", "تشطيب حريري (Silk)", "تشطيب لامع كامل (Gloss)"],
    specs: [
      { label: "الدقة", value: "ماكينة خلط كمبيوتر متطورة بأجزاء من المليجرام" },
      { label: "معدل التغطية", value: "من 12 إلى 14 متر مربع لكل لتر للوجه الواحد" },
      { label: "مقاومة الغسيل", value: "فائقة وقابلة للغسيل المتكرر" }
    ]
  },
  {
    id: "prod-6",
    name: "شنيور بوش دقاق 650 وات احترافي أصلي GSB 13 RE ظرف 13 مم",
    brand: "BOSCH",
    categoryId: "power-tools",
    categoryName: "معدات كهربائية وبطارية",
    price: 2150.00,
    originalPrice: 2450.00,
    discountBadge: "وفر EGP 300",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    description: "شنيور دقاق بوش ألماني مدمج وخفيف الوزن بقوة 650 وات مع تحكم إلكتروني بالسرعة واتجاه الدوران لليمين واليسار، مثالي للخرسانة والحديد والأخشاب.",
    inStock: true,
    stockCount: 20,
    unit: "قطعة",
    isBestSeller: true,
    specs: [
      { label: "القدرة", value: "650 وات عزم جبار" },
      { label: "الظرف", value: "13 مم مسنن معدني" },
      { label: "السرعة", value: "0 - 2800 لفة في الدقيقة" }
    ]
  },
  {
    id: "prod-7",
    name: "توتال تولز كمبروسر منفاخ كفرات ومعدات هواء 12 فولت معدني - TTAC2506",
    brand: "TOTAL TOOLS",
    categoryId: "pneumatic-air",
    categoryName: "معدات ومستلزمات الهواء",
    price: 1650.44,
    originalPrice: 1890.00,
    discountBadge: "وفر EGP 239.56",
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80",
    description: "منفاخ هواء أسطواني مزدوج بقوة ضغط تصل إلى 120 PSI، يعمل على ولاعة السيارة أو بطارية 12 فولت مع عداد ضغط دقيق ومصباح LED للطوارئ.",
    inStock: true,
    stockCount: 25,
    unit: "طقم بحقيبة",
    isFeatured: true,
    specs: [
      { label: "الضغط الأقصى", value: "120 PSI / 8.3 بار" },
      { label: "معدل تدفق الهواء", value: "45 لتر بالدقيقة" },
      { label: "طول السلك والخرطوم", value: "سلك 3 متر + خرطوم لولبي 5 متر" }
    ]
  },
  {
    id: "prod-8",
    name: "خراطيم هواء تايواني بولي يوريثين مرن عالي التحمل (PU) متوفر بألوان ومقاسات",
    brand: "الموان هيدروليك",
    categoryId: "pneumatic-air",
    categoryName: "معدات ومستلزمات الهواء",
    price: 9.20,
    originalPrice: 12.00,
    discountBadge: "وفر EGP 2.80 للمتر",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    description: "خرطوم هواء تايواني مصنوع من خامة البولي يوريثين PU المرنة والمقاومة للزيوت والمواد الكيميائية والانثناءات في درجات الحرارة المختلفة.",
    inStock: true,
    stockCount: 500,
    unit: "متر طولي",
    hasOptions: true,
    options: ["قطر 6×4 مم أزرق", "قطر 8×5 مم برتقالي", "قطر 10×6.5 مم شفاف", "قطر 12×8 مم أسود"],
    specs: [
      { label: "الصناعة", value: "تايوان نخب أول" },
      { label: "ضغط التشغيل", value: "10 إلى 15 بار" },
      { label: "نطاق الحرارة", value: "-20°C حتى +70°C" }
    ]
  },
  {
    id: "prod-9",
    name: "وصلة هواء عدلة بلاستيك سن خارجي ماورنج موديل PC-G سريع التوصيل",
    brand: "DERHALI",
    categoryId: "pneumatic-air",
    categoryName: "معدات ومستلزمات الهواء",
    price: 13.66,
    originalPrice: 18.00,
    discountBadge: "سعر جملة",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description: "فيتنج سريع التوصيل ون تاتش (One Touch) سن نحاسي مطلي بالنيكل مع حلقة إحكام أورنج لمنع تسريب الهواء نهائياً.",
    inStock: true,
    stockCount: 150,
    unit: "قطعة",
    hasOptions: true,
    options: ["مقاس 1/4 بوصة خرطوم 8 مم", "مقاس 1/8 بوصة خرطوم 6 مم", "مقاس 3/8 بوصة خرطوم 10 مم", "مقاس 1/2 بوصة خرطوم 12 مم"],
    specs: [
      { label: "نوع الربط", value: "كبس سريع One-Touch Fitting" },
      { label: "الجسم", value: "بلاستيك صناعي PBT + نحاس مطلي" }
    ]
  },
  {
    id: "prod-10",
    name: "وادفو ماكينة شفط وتصفية زيت بالهواء سعة 70 لتر مدمجة بقمع تفريغ - WKD2A07",
    brand: "WADFOW",
    categoryId: "pneumatic-air",
    categoryName: "معدات ومستلزمات الهواء",
    price: 7972.72,
    originalPrice: 8850.00,
    discountBadge: "وفر EGP 877.28",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    description: "ماكينة تفريغ وشفط زيوت هوائية احترافية مزودة بخزان ضخم 70 لتر، وقمع تجميع كبير، ومؤشر مستوى الزيت وعجلات قوية لتسهيل الحركة في الورش ومحطات الخدمة.",
    inStock: true,
    stockCount: 6,
    unit: "وحدة كاملة",
    specs: [
      { label: "سعة الخزان", value: "70 لتر ستانلس صلب" },
      { label: "سعة القمع", value: "10 لتر مزود بمصفاة" },
      { label: "ضغط الشفط", value: "6 - 8 بار" }
    ]
  },
  {
    id: "prod-11",
    name: "جوتن فينوماستيك دهان فاخر مائي حريري فائق النعومة وقابل للغسيل 9 لتر",
    brand: "JOTUN",
    categoryId: "paints-coatings",
    categoryName: "البويات والدهانات",
    price: 1420.00,
    originalPrice: 1550.00,
    discountBadge: "وفر EGP 130",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
    description: "الدهان الداخلي الأرقى من جوتن، يمنح الجدران ملمساً كالحرير مع نقاء لون غير مسبوق وسهولة استثنائية في إزالة البقع دون التأثير على لمعة الدهان.",
    inStock: true,
    stockCount: 30,
    unit: "بستلة 9 لتر",
    isFeatured: true,
    isBestSeller: true,
    specs: [
      { label: "اللمعة", value: "حريري ناعم (Rich Silk)" },
      { label: "الجفاف", value: "لمس بعد ساعتين، وجه ثاني بعد 4 ساعات" },
      { label: "الصلاحية", value: "مقاوم للبكتيريا والعفن الداخلي" }
    ]
  },
  {
    id: "prod-12",
    name: "سايبس سايلكس سوبر دهان بلاستيك مط واجهات وخارجي مقاوم للعوامل الجوية 15 كجم",
    brand: "SIPES",
    categoryId: "paints-coatings",
    categoryName: "البويات والدهانات",
    price: 890.00,
    originalPrice: 960.00,
    discountBadge: "وفر EGP 70",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    description: "دهان واجهات خارجي من أكرليك خالص 100%، مصمم خصيصاً لتحمل أشعة الشمس الحارقة والأمطار والرطوبة دون بهتان أو تشقق.",
    inStock: true,
    stockCount: 40,
    unit: "بستلة 15 كجم",
    specs: [
      { label: "نوع الراتنج", value: "بيور أكريليك 100%" },
      { label: "المقاومة", value: "مقاومة فائقة للأشعة فوق البنفسجية UV" }
    ]
  },
  {
    id: "prod-13",
    name: "طقم مسامير صلب وفيشر أصلي ألماني مع زوايا تثبيت معمار 450 قطعة في علبة منظمة",
    brand: "الموان معمار",
    categoryId: "construction-supplies",
    categoryName: "لوازم معمار وحدايد",
    price: 195.00,
    originalPrice: 240.00,
    discountBadge: "وفر EGP 45",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80",
    description: "علبة شاملة لكل احتياجات التثبيت والمعمار، تحتوي على مقاسات فيشر 6، 8، 10 مم، مع مسامير برمة ومسامير صلب للجدران والخرسانة وزوايا حديدية مقواة.",
    inStock: true,
    stockCount: 80,
    unit: "علبة كاملة",
    isBestSeller: true,
    specs: [
      { label: "العدد الإجمالي", value: "450 قطعة متنوعة" },
      { label: "الخامة", value: "صلب معالج مقاوم للصدأ والكسر" }
    ]
  },
  {
    id: "prod-14",
    name: "طقم رولات وفرش دهان احترافي 7 قطع للكمبيوتر والبويات مع صينية خلط",
    brand: "الموان بروفيشنال",
    categoryId: "accessories-safety",
    categoryName: "إكسسوارات ومهمات أمان",
    price: 145.00,
    originalPrice: 185.00,
    discountBadge: "وفر EGP 40",
    image: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=600&q=80",
    description: "طقم متكامل لتنفيذ دهانات الحوائط والديكورات بدقة متناهية، يشمل رولة قطن سوبر 9 بوصة، ورولة زوايا، و3 مقاسات فرش شعر ناعم، وشريط تيب لاصق وصينية.",
    inStock: true,
    stockCount: 60,
    unit: "طقم 7 قطع",
    specs: [
      { label: "محتويات الطقم", value: "رولة 9 بوصة + رولة صغيرة + فرش 1و2و3 بوصة + صينية دهان + شريط تحديد" }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "ORD-9281",
    createdAt: "2026-11-12T09:30:00Z",
    customerName: "المهندس كريم الشناوي",
    customerPhone: "01012349988",
    governorate: "القاهرة",
    city: "مدينة نصر",
    address: "عمارات العبور - شارع صلاح سالم - الدور 4",
    notes: "برجاء التأكيد قبل الوصول بساعة، وتجهيز دهان الكمبيوتر كود 1024",
    paymentMethod: "cash_on_delivery",
    subtotal: 5509.05,
    shippingFee: 50,
    discount: 0,
    total: 5559.05,
    status: "processing",
    items: [
      {
        productId: "prod-2",
        productName: "وادفو ماكينة 2×1 غسيل ضغط عالي 1600 وات 130 بار",
        brand: "WADFOW",
        unitPrice: 4624.05,
        quantity: 1,
        total: 4624.05
      },
      {
        productId: "prod-5",
        productName: "جردل دهان بالكمبيوتر (خلط فوري لأي كود لون)",
        brand: "الموان ستوديو",
        unitPrice: 885.00,
        quantity: 1,
        total: 885.00,
        paintDetails: {
          colorCode: "JOTUN-1024",
          colorName: "بيج عاجي كلاسيك",
          hex: "#E8DEC8",
          finish: "تشطيب حريري (Silk)",
          liters: 9
        }
      }
    ]
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-9282",
    createdAt: "2026-11-11T16:15:00Z",
    customerName: "المعلم إبراهيم عبد الغني (مقاولات)",
    customerPhone: "01123456780",
    governorate: "الجيزة",
    city: "الهرم",
    address: "شارع فيصل الرئيسي - بجوار محطة حسن محمد",
    notes: "فواتير ضريبية باسم شركة التعمير للإنشاءات",
    paymentMethod: "instapay",
    subtotal: 3669.79,
    shippingFee: 0,
    discount: 100,
    total: 3569.79,
    status: "shipped",
    items: [
      {
        productId: "prod-6",
        productName: "شنيور بوش دقاق 650 وات احترافي أصلي GSB 13 RE",
        brand: "BOSCH",
        unitPrice: 2150.00,
        quantity: 1,
        total: 2150.00
      },
      {
        productId: "prod-4",
        productName: "توتال تولز صاروخ براشليس 20 فولت",
        brand: "TOTAL TOOLS",
        unitPrice: 1519.79,
        quantity: 1,
        total: 1519.79
      }
    ]
  },
  {
    id: "ord-1003",
    orderNumber: "ORD-9283",
    createdAt: "2026-11-10T11:45:00Z",
    customerName: "أحمد حسني فني ميكانيكا",
    customerPhone: "01239876543",
    governorate: "القليوبية",
    city: "شبرا الخيمة",
    address: "شارع 15 مايو - ورشة الأهرام",
    notes: "تسليم سريع",
    paymentMethod: "cash_on_delivery",
    subtotal: 382.45,
    shippingFee: 50,
    discount: 0,
    total: 432.45,
    status: "delivered",
    items: [
      {
        productId: "prod-1",
        productName: "مفتاح بلدي مشرشر ماركة AIWO مقاس 17 مم",
        brand: "AIWO",
        unitPrice: 63.25,
        quantity: 3,
        total: 189.75,
        selectedOption: "مقاس 17 مم"
      },
      {
        productId: "prod-13",
        productName: "طقم مسامير صلب وفيشر أصلي 450 قطعة",
        brand: "الموان معمار",
        unitPrice: 195.00,
        quantity: 1,
        total: 195.00
      }
    ]
  }
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
