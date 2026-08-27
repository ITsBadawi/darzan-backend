import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'local_data.json')

const DEFAULT_SETTINGS = {
  about_text: 'درازن — منصة تجارة الملابس بالجملة في عموم العراق. نوفر أجود الخامات وأحدث الموديلات بأسعار جملة تنافسية وتوصيل لجميع المحافظات.',
  return_policy: 'يحق للمشتري فحص البضاعة عند الاستلام واستبدال أي قطع تحتوي على عيوب مصنعية خلال 48 ساعة.',
  store_name: 'درازن',
  announce_text: 'توصيل لجميع محافظات العراق · الدفع عند الاستلام',
  announce_enabled: 'true',
  promo_enabled: 'true',
  promo_title: 'نهاية الموسم',
  promo_text: 'على قطع مختارة من التشكيلة الصيفية والشتوية للجملة',
  promo_discount: '٪٣٠-',
  promo_link: '/catalog',
  promo_bg: '#8B2E1F',
  flash_sale_enabled: 'true',
  flash_sale_title: 'عروض الخاطفة الجملة — الساعات الأخيرة',
  flash_sale_discount: 'خصم ٣٥٪-',
  flash_sale_end: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  hero_slides: JSON.stringify([
    { key: 's1', tag: 'تخفيض', title: 'تخفيضات الشتاء', desc: 'خصم يصل إلى ٢٥٪ على تشكيلة الشتاء بالكامل', cta: 'تسوّق الآن', to: '/catalog', bg_url: '' },
    { key: 's2', tag: 'جديد', title: 'وصل حديثاً', desc: 'تشكيلة الشتاء الجديدة بكل الألوان والمقاسات', cta: 'شاهد التشكيلة', to: '/catalog', bg_url: '' },
    { key: 's3', tag: 'جملة', title: 'أسعار الجملة', desc: 'أفضل أسعار الجملة لتجار التجزئة في عموم العراق', cta: 'اطلب الآن', to: '/catalog', bg_url: '' }
  ])
}

const DEFAULT_PRODUCTS = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'كنزة شتوية صوف',
    cat: 'رجالي',
    category: 'رجالي',
    description: 'كنزة شتوية دافئة من خامة صوف عالية الجودة، مناسبة لأجواء الشتاء الباردة. قصّة مريحة تناسب جميع الأذواق، ومتوفرة بعدة ألوان ومقاسات تبدأ من S وحتى 4XL.',
    priceMin: 25000,
    priceMax: 30000,
    price_min: 25000,
    price_max: 30000,
    icon: 'jacket',
    is_active: true,
    colors: [
      { id: 'c1', code: 'RED', name: 'أحمر', hex: '#8B2E1F', g1: '#E8CFC6', g2: '#D8AC9C' },
      { id: 'c2', code: 'TEAL', name: 'أخضر تيل', hex: '#1E4238', g1: '#D9E3DC', g2: '#B9CBC0' },
      { id: 'c3', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' },
      { id: 'c4', code: 'BEIGE', name: 'بيج', hex: '#C9C2AE', g1: '#EFE8D8', g2: '#DECEB0' }
    ],
    skuMatrix: {
      'RED-S': { id: 's-1', price: 25000, stock: 12, sku: 'DZN-01-RED-S', available: true },
      'RED-M': { id: 's-2', price: 25000, stock: 10, sku: 'DZN-01-RED-M', available: true },
      'RED-L': { id: 's-3', price: 25000, stock: 8, sku: 'DZN-01-RED-L', available: true },
      'RED-XL': { id: 's-4', price: 25000, stock: 15, sku: 'DZN-01-RED-XL', available: true },
      'RED-2XL': { id: 's-5', price: 28000, stock: 6, sku: 'DZN-01-RED-2XL', available: true },
      'BLACK-M': { id: 's-6', price: 25000, stock: 20, sku: 'DZN-01-BLK-M', available: true },
      'BLACK-L': { id: 's-7', price: 25000, stock: 14, sku: 'DZN-01-BLK-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'فستان سهرة مطرز',
    cat: 'فساتين',
    category: 'فساتين',
    description: 'فستان سهرة أنيق بتطريز يدوي دقيق، قصّة تناسب المناسبات الخاصة، متوفر بعدة ألوان ومقاسات.',
    priceMin: 45000,
    priceMax: 45000,
    price_min: 45000,
    price_max: 45000,
    icon: 'dress',
    is_active: true,
    colors: [
      { id: 'c5', code: 'CLAY', name: 'قرميدي', hex: '#A8452F', g1: '#EAD9D2', g2: '#D9BDB1' },
      { id: 'c6', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'CLAY-M': { id: 's-8', price: 45000, stock: 9, sku: 'DZN-02-CLAY-M', available: true },
      'BLACK-L': { id: 's-9', price: 45000, stock: 7, sku: 'DZN-02-BLK-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'طقم أطفال شتوي',
    cat: 'أطفال',
    category: 'أطفال',
    description: 'طقم شتوي دافئ ومريح للأطفال، خامة قطنية ناعمة على البشرة، متوفر بعدة ألوان وأعمار.',
    priceMin: 18000,
    priceMax: 18000,
    price_min: 18000,
    price_max: 18000,
    icon: 'child',
    is_active: true,
    colors: [
      { id: 'c7', code: 'GREEN', name: 'أخضر', hex: '#3D6E5C', g1: '#DCE6DD', g2: '#C4D3C6' },
      { id: 'c8', code: 'BRASS', name: 'ذهبي', hex: '#C08A3E', g1: '#EFE2CC', g2: '#DCC59B' }
    ],
    skuMatrix: {
      'GREEN-S': { id: 's-10', price: 18000, stock: 14, sku: 'DZN-03-GRN-S', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'بيجاما منزلية قطن',
    cat: 'بيتي',
    category: 'بيتي',
    description: 'بيجاما منزلية من قطن ناعم ومريح، مثالية للاستخدام اليومي في المنزل.',
    priceMin: 15000,
    priceMax: 15000,
    price_min: 15000,
    price_max: 15000,
    icon: 'home',
    is_active: true,
    colors: [
      { id: 'c9', code: 'BEIGE', name: 'بيج', hex: '#C9C2AE', g1: '#EFE8D8', g2: '#DECEB0' },
      { id: 'c10', code: 'TEAL', name: 'أخضر تيل', hex: '#1E4238', g1: '#D9E3DC', g2: '#B9CBC0' }
    ],
    skuMatrix: {
      'BEIGE-M': { id: 's-11', price: 15000, stock: 18, sku: 'DZN-04-BEI-M', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'قميص رجالي كلاسيك',
    cat: 'رجالي',
    category: 'رجالي',
    description: 'قميص رجالي كلاسيك بقصّة أنيقة يناسب الدوام والمناسبات، خامة قطنية عالية الجودة.',
    priceMin: 20000,
    priceMax: 20000,
    price_min: 20000,
    price_max: 20000,
    icon: 'jacket',
    is_active: true,
    colors: [
      { id: 'c11', code: 'WHITE', name: 'أبيض', hex: '#FFFDF8', g1: '#F3EFE3', g2: '#E4DBC2' },
      { id: 'c12', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'WHITE-L': { id: 's-12', price: 20000, stock: 15, sku: 'DZN-05-WHT-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'عباية سوداء أنيقة',
    cat: 'نسائي',
    category: 'نسائي',
    description: 'عباية سوداء بقصّة أنيقة وخامة فاخرة، تصميم بسيط يناسب مختلف المناسبات.',
    priceMin: 35000,
    priceMax: 35000,
    price_min: 35000,
    price_max: 35000,
    icon: 'abaya',
    is_active: true,
    colors: [
      { id: 'c13', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'BLACK-FREE': { id: 's-13', price: 35000, stock: 10, sku: 'DZN-06-BLK-F', available: true }
    },
    images: {}
  }
]

let dataStore = {
  settings: { ...DEFAULT_SETTINGS },
  products: [...DEFAULT_PRODUCTS],
  orders: []
}

// Load persisted data if file exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    dataStore = {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      products: parsed.products && parsed.products.length ? parsed.products : [...DEFAULT_PRODUCTS],
      orders: parsed.orders || []
    }
  }
} catch (e) {
  console.warn('⚠️ Could not load local_data.json, using defaults.', e.message)
}

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to persist local data:', e)
  }
}

export const localStore = {
  getSettings: () => ({ ...dataStore.settings }),
  updateSettings: (updates) => {
    for (const [key, value] of Object.entries(updates)) {
      dataStore.settings[key] = String(value)
    }
    persistStore()
    return { ...dataStore.settings }
  },

  getProducts: (category) => {
    let list = dataStore.products.filter((p) => p.is_active !== false)
    if (category && category !== 'الكل') {
      list = list.filter((p) => (p.cat === category || p.category === category))
    }
    return list
  },
  getProductById: (id) => dataStore.products.find((p) => p.id === id),
  getAllProductsAdmin: () => dataStore.products,
  createProduct: (product) => {
    dataStore.products.unshift(product)
    persistStore()
    return product
  },
  updateProduct: (id, updates) => {
    const idx = dataStore.products.findIndex((p) => p.id === id)
    if (idx !== -1) {
      dataStore.products[idx] = { ...dataStore.products[idx], ...updates }
      persistStore()
      return dataStore.products[idx]
    }
    return null
  },
  deleteProduct: (id) => {
    dataStore.products = dataStore.products.filter((p) => p.id !== id)
    persistStore()
  },

  getOrders: (status) => {
    let list = dataStore.orders
    if (status && status !== 'الكل') {
      list = list.filter((o) => o.status === status)
    }
    return list
  },
  createOrder: (order) => {
    dataStore.orders.unshift(order)
    persistStore()
    return order
  },
  updateOrderStatus: (id, status) => {
    const ord = dataStore.orders.find((o) => o.id === id)
    if (ord) {
      ord.status = status
      persistStore()
      return ord
    }
    return null
  },
  deleteOrder: (id) => {
    dataStore.orders = dataStore.orders.filter((o) => o.id !== id)
    persistStore()
  }
}
