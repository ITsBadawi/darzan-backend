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
  ]),
  whatsapp_number: ''
}

const DEFAULT_SUPPLIERS = [
  {
    id: 'sup-1',
    supplier_code: 'SUP-A',
    name: 'مخزن أبو علي',
    phone: '07812345678',
    notes: 'متخصص بالملابس الرجالية والشتوية',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-2',
    supplier_code: 'SUP-B',
    name: 'شركة النخبة',
    phone: '07798765432',
    notes: 'أزياء نسائية وفساتين جملة',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-legacy',
    supplier_code: 'SUP-LEGACY',
    name: 'المنتجات السابقة',
    phone: '',
    notes: 'سجل افتراضي للمنتجات السابقة',
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const DEFAULT_PRODUCTS = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    product_number: 1,
    supplier_id: 'sup-1',
    name: 'كنزة شتوية صوف',
    cat: 'رجالي',
    category: 'رجالي',
    description: 'كنزة شتوية دافئة من خامة صوف عالية الجودة، مناسبة لأجواء الشتاء الباردة. قصّة مريحة تناسب جميع الأذواق، ومتوفرة بعدة ألوان ومقاسات تبدأ من S وحتى 4XL.',
    priceMin: 25000,
    priceMax: 30000,
    price_min: 25000,
    price_max: 30000,
    sale_type: 'both',
    price_piece: 25000,
    price_dozen: 270000,
    min_piece_qty: 1,
    min_dozen_qty: 1,
    icon: 'jacket',
    is_active: true,
    colors: [
      { id: 'c1', code: 'RED', name: 'أحمر', hex: '#8B2E1F', g1: '#E8CFC6', g2: '#D8AC9C' },
      { id: 'c2', code: 'TEAL', name: 'أخضر تيل', hex: '#1E4238', g1: '#D9E3DC', g2: '#B9CBC0' },
      { id: 'c3', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' },
      { id: 'c4', code: 'BEIGE', name: 'بيج', hex: '#C9C2AE', g1: '#EFE8D8', g2: '#DECEB0' }
    ],
    skuMatrix: {
      'RED-S': { id: 's-1', price: 25000, stock: 12, sku: 'DZN-000001-RED-S', available: true },
      'RED-M': { id: 's-2', price: 25000, stock: 10, sku: 'DZN-000001-RED-M', available: true },
      'RED-L': { id: 's-3', price: 25000, stock: 8, sku: 'DZN-000001-RED-L', available: true },
      'RED-XL': { id: 's-4', price: 25000, stock: 15, sku: 'DZN-000001-RED-XL', available: true },
      'RED-2XL': { id: 's-5', price: 28000, stock: 6, sku: 'DZN-000001-RED-2XL', available: true },
      'BLACK-M': { id: 's-6', price: 25000, stock: 20, sku: 'DZN-000001-BLK-M', available: true },
      'BLACK-L': { id: 's-7', price: 25000, stock: 14, sku: 'DZN-000001-BLK-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    product_number: 2,
    supplier_id: 'sup-2',
    name: 'فستان سهرة مطرز',
    cat: 'فساتين',
    category: 'فساتين',
    description: 'فستان سهرة أنيق بتطريز يدوي دقيق، قصّة تناسب المناسبات الخاصة، متوفر بعدة ألوان ومقاسات.',
    priceMin: 45000,
    priceMax: 45000,
    price_min: 45000,
    price_max: 45000,
    sale_type: 'both',
    price_piece: 45000,
    price_dozen: 480000,
    min_piece_qty: 1,
    min_dozen_qty: 1,
    icon: 'dress',
    is_active: true,
    colors: [
      { id: 'c5', code: 'CLAY', name: 'قرميدي', hex: '#A8452F', g1: '#EAD9D2', g2: '#D9BDB1' },
      { id: 'c6', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'CLAY-M': { id: 's-8', price: 45000, stock: 9, sku: 'DZN-000002-CLAY-M', available: true },
      'BLACK-L': { id: 's-9', price: 45000, stock: 7, sku: 'DZN-000002-BLK-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    product_number: 3,
    supplier_id: 'sup-1',
    name: 'طقم أطفال شتوي',
    cat: 'أطفال',
    category: 'أطفال',
    description: 'طقم شتوي دافئ ومريح للأطفال، خامة قطنية ناعمة على البشرة، متوفر بعدة ألوان وأعمار.',
    priceMin: 18000,
    priceMax: 18000,
    price_min: 18000,
    price_max: 18000,
    sale_type: 'dozen',
    price_piece: 18000,
    price_dozen: 200000,
    min_piece_qty: 1,
    min_dozen_qty: 1,
    icon: 'child',
    is_active: true,
    colors: [
      { id: 'c7', code: 'GREEN', name: 'أخضر', hex: '#3D6E5C', g1: '#DCE6DD', g2: '#C4D3C6' },
      { id: 'c8', code: 'BRASS', name: 'ذهبي', hex: '#C08A3E', g1: '#EFE2CC', g2: '#DCC59B' }
    ],
    skuMatrix: {
      'GREEN-S': { id: 's-10', price: 18000, stock: 14, sku: 'DZN-000003-GRN-S', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    product_number: 4,
    supplier_id: 'sup-2',
    name: 'بيجاما منزلية قطن',
    cat: 'بيتي',
    category: 'بيتي',
    description: 'بيجاما منزلية من قطن ناعم ومريح، مثالية للاستخدام اليومي في المنزل.',
    priceMin: 15000,
    priceMax: 15000,
    price_min: 15000,
    price_max: 15000,
    sale_type: 'both',
    price_piece: 15000,
    price_dozen: 160000,
    min_piece_qty: 3,
    min_dozen_qty: 1,
    icon: 'home',
    is_active: true,
    colors: [
      { id: 'c9', code: 'BEIGE', name: 'بيج', hex: '#C9C2AE', g1: '#EFE8D8', g2: '#DECEB0' },
      { id: 'c10', code: 'TEAL', name: 'أخضر تيل', hex: '#1E4238', g1: '#D9E3DC', g2: '#B9CBC0' }
    ],
    skuMatrix: {
      'BEIGE-M': { id: 's-11', price: 15000, stock: 18, sku: 'DZN-000004-BEI-M', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    product_number: 5,
    supplier_id: 'sup-1',
    name: 'قميص رجالي كلاسيك',
    cat: 'رجالي',
    category: 'رجالي',
    description: 'قميص رجالي كلاسيك بقصّة أنيقة يناسب الدوام والمناسبات، خامة قطنية عالية الجودة.',
    priceMin: 20000,
    priceMax: 20000,
    price_min: 20000,
    price_max: 20000,
    sale_type: 'piece',
    price_piece: 20000,
    price_dozen: 240000,
    min_piece_qty: 2,
    min_dozen_qty: 1,
    icon: 'jacket',
    is_active: true,
    colors: [
      { id: 'c11', code: 'WHITE', name: 'أبيض', hex: '#FFFDF8', g1: '#F3EFE3', g2: '#E4DBC2' },
      { id: 'c12', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'WHITE-L': { id: 's-12', price: 20000, stock: 15, sku: 'DZN-000005-WHT-L', available: true }
    },
    images: {}
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    product_number: 6,
    supplier_id: 'sup-2',
    name: 'عباية سوداء أنيقة',
    cat: 'نسائي',
    category: 'نسائي',
    description: 'عباية سوداء بقصّة أنيقة وخامة فاخرة، تصميم بسيط يناسب مختلف المناسبات.',
    priceMin: 35000,
    priceMax: 35000,
    price_min: 35000,
    price_max: 35000,
    sale_type: 'both',
    price_piece: 35000,
    price_dozen: 380000,
    min_piece_qty: 1,
    min_dozen_qty: 1,
    icon: 'abaya',
    is_active: true,
    colors: [
      { id: 'c13', code: 'BLACK', name: 'أسود', hex: '#2B2B2B', g1: '#DCDAD6', g2: '#BEBAB2' }
    ],
    skuMatrix: {
      'BLACK-FREE': { id: 's-13', price: 35000, stock: 10, sku: 'DZN-000006-BLK-F', available: true }
    },
    images: {}
  }
]

let dataStore = {
  settings: { ...DEFAULT_SETTINGS },
  suppliers: [...DEFAULT_SUPPLIERS],
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
      suppliers: parsed.suppliers && parsed.suppliers.length ? parsed.suppliers : [...DEFAULT_SUPPLIERS],
      products: parsed.products && parsed.products.length ? parsed.products : [...DEFAULT_PRODUCTS],
      orders: parsed.orders || []
    }
  }
} catch (e) {
  console.warn('⚠️ Could not load local_data.json, using defaults.', e.message)
}

// Ensure every existing product has product_number, supplier_id, sale_type, price_piece, price_dozen, min_piece_qty, min_dozen_qty
let maxNum = 0
dataStore.products.forEach((p) => {
  if (p.product_number && p.product_number > maxNum) maxNum = p.product_number
})
dataStore.products.forEach((p) => {
  if (!p.product_number) {
    maxNum += 1
    p.product_number = maxNum
  }
  if (!p.supplier_id) {
    p.supplier_id = 'sup-legacy'
  }
  p.sale_type = p.sale_type || 'both'
  const basePrice = p.price_piece !== undefined ? Number(p.price_piece) : (p.priceMin || p.price_min || 0)
  p.price_piece = basePrice
  p.price_dozen = p.price_dozen !== undefined ? Number(p.price_dozen) : (basePrice * 12)
  p.min_piece_qty = p.min_piece_qty !== undefined ? Number(p.min_piece_qty) : 1
  p.min_dozen_qty = p.min_dozen_qty !== undefined ? Number(p.min_dozen_qty) : 1
})

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to persist local data:', e)
  }
}

export const localStore = {
  // Settings
  getSettings: () => ({ ...dataStore.settings }),
  updateSettings: (updates) => {
    for (const [key, value] of Object.entries(updates)) {
      dataStore.settings[key] = String(value)
    }
    persistStore()
    return { ...dataStore.settings }
  },

  // Suppliers
  getSuppliers: (onlyActive = false) => {
    let list = [...dataStore.suppliers]
    if (onlyActive) {
      list = list.filter((s) => s.is_active)
    }
    return list.map((s) => {
      const productCount = dataStore.products.filter((p) => p.supplier_id === s.id && p.is_active !== false).length
      return {
        ...s,
        product_count: productCount
      }
    })
  },
  getSupplierById: (id) => {
    const sup = dataStore.suppliers.find((s) => s.id === id)
    if (!sup) return null
    const products = dataStore.products.filter((p) => p.supplier_id === id)
    return {
      ...sup,
      product_count: products.length,
      products
    }
  },
  createSupplier: (supplierData) => {
    const existing = dataStore.suppliers.find(
      (s) => s.supplier_code.trim().toUpperCase() === supplierData.supplier_code.trim().toUpperCase()
    )
    if (existing) {
      throw new Error('كود المورد مسجل مسبقاً، يرجى اختيار كود آخر')
    }
    const newSupplier = {
      id: supplierData.id || `sup-${Date.now()}`,
      supplier_code: supplierData.supplier_code.trim().toUpperCase(),
      name: supplierData.name.trim(),
      phone: supplierData.phone?.trim() || '',
      notes: supplierData.notes?.trim() || '',
      is_active: supplierData.is_active !== undefined ? Boolean(supplierData.is_active) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_count: 0
    }
    dataStore.suppliers.unshift(newSupplier)
    persistStore()
    return newSupplier
  },
  updateSupplier: (id, updates) => {
    const idx = dataStore.suppliers.findIndex((s) => s.id === id)
    if (idx === -1) return null

    if (updates.supplier_code) {
      const codeUpper = updates.supplier_code.trim().toUpperCase()
      const conflict = dataStore.suppliers.find((s) => s.id !== id && s.supplier_code.toUpperCase() === codeUpper)
      if (conflict) {
        throw new Error('كود المورد مسجل لمورد آخر')
      }
      dataStore.suppliers[idx].supplier_code = codeUpper
    }
    if (updates.name !== undefined) dataStore.suppliers[idx].name = updates.name.trim()
    if (updates.phone !== undefined) dataStore.suppliers[idx].phone = updates.phone.trim()
    if (updates.notes !== undefined) dataStore.suppliers[idx].notes = updates.notes.trim()
    if (updates.is_active !== undefined) dataStore.suppliers[idx].is_active = Boolean(updates.is_active)
    dataStore.suppliers[idx].updated_at = new Date().toISOString()

    persistStore()
    return dataStore.suppliers[idx]
  },
  deleteSupplier: (id) => {
    const count = dataStore.products.filter((p) => p.supplier_id === id).length
    if (count > 0) {
      throw new Error(`لا يمكن حذف المورد لأنه مرتبط بـ (${count}) منتجات. يمكنك تعطيله بدلاً من ذلك.`)
    }
    dataStore.suppliers = dataStore.suppliers.filter((s) => s.id !== id)
    persistStore()
    return { success: true }
  },

  // Products
  getNextProductNumber: () => {
    let max = 0
    dataStore.products.forEach((p) => {
      const num = Number(p.product_number) || 0
      if (num > max) max = num
    })
    return max + 1
  },
  getProducts: (category) => {
    let list = dataStore.products.filter((p) => p.is_active !== false)
    if (category && category !== 'الكل') {
      list = list.filter((p) => (p.cat === category || p.category === category))
    }
    return list.map((p) => {
      const supplier = dataStore.suppliers.find((s) => s.id === p.supplier_id)
      return {
        ...p,
        supplier: supplier ? { id: supplier.id, name: supplier.name, supplier_code: supplier.supplier_code } : null
      }
    })
  },
  getProductById: (id) => {
    const prod = dataStore.products.find((p) => p.id === id)
    if (!prod) return null
    const supplier = dataStore.suppliers.find((s) => s.id === prod.supplier_id)
    return {
      ...prod,
      supplier: supplier ? { id: supplier.id, name: supplier.name, supplier_code: supplier.supplier_code } : null
    }
  },
  getAllProductsAdmin: (supplierId) => {
    let list = dataStore.products
    if (supplierId && supplierId !== 'الكل') {
      list = list.filter((p) => p.supplier_id === supplierId)
    }
    return list.map((p) => {
      const supplier = dataStore.suppliers.find((s) => s.id === p.supplier_id)
      return {
        ...p,
        supplier: supplier ? { id: supplier.id, name: supplier.name, supplier_code: supplier.supplier_code } : null
      }
    })
  },
  createProduct: (product) => {
    if (!product.product_number) {
      product.product_number = localStore.getNextProductNumber()
    }
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

  // Orders
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
