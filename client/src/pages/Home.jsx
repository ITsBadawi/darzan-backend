import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProductsStore } from '../store/useProductsStore.js'
import { useSettingsStore } from '../store/useSettingsStore.js'
import Billboard from '../components/Billboard.jsx'
import CategoryStories from '../components/CategoryStories.jsx'
import ProductCard from '../components/ProductCard.jsx'
import FlashSaleBanner from '../components/FlashSaleBanner.jsx'
import FloatingWhatsApp from '../components/FloatingWhatsApp.jsx'
import Footer from '../components/Footer.jsx'
import { TruckIcon, CashIcon, ChatIcon } from '../components/icons.jsx'

const DEFAULT_CATEGORY_IMAGES = {
  'رجالي': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop',
  'نسائي': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  'أطفال': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
  'فساتين': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
  'بيتي': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'
}

const DEFAULT_FEATURED = [
  { cat: 'رجالي', label: 'رجالي', g1: '#2A2A2A', g2: '#4A4A4A', image_url: DEFAULT_CATEGORY_IMAGES['رجالي'] },
  { cat: 'نسائي', label: 'نسائي', g1: '#6E1F34', g2: '#8B2942', image_url: DEFAULT_CATEGORY_IMAGES['نسائي'] },
  { cat: 'أطفال', label: 'أطفال', g1: '#2D4A3E', g2: '#4A7C59', image_url: DEFAULT_CATEGORY_IMAGES['أطفال'] },
  { cat: 'فساتين', label: 'فساتين', g1: '#3D2B1F', g2: '#6B4C3B', image_url: DEFAULT_CATEGORY_IMAGES['فساتين'] }
]

export default function Home() {
  const products = useProductsStore((s) => s.products)
  const loading = useProductsStore((s) => s.loading)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)

  const fetchSettings = useSettingsStore((s) => s.fetchPublicSettings)
  const settings = useSettingsStore((s) => s.settings)

  // Tabbed Showcase state: 'bestsellers' | 'newest' | 'discounted'
  const [activeTab, setActiveTab] = useState('bestsellers')

  // Set document title & fetch data
  useEffect(() => {
    document.title = 'درازن | جملة الملابس في العراق'
    fetchProducts()
    fetchSettings()
  }, [fetchProducts, fetchSettings])

  const promoEnabled = settings?.promo_enabled !== undefined ? (settings.promo_enabled === 'true' || settings.promo_enabled === true) : true
  const promoTitle = settings?.promo_title || 'نهاية الموسم'
  const promoText = settings?.promo_text || 'على قطع مختارة من التشكيلة الصيفية والشتوية للجملة'
  const promoDiscount = settings?.promo_discount || '٪٣٠-'
  const promoLink = settings?.promo_link || '/catalog'
  const promoBg = settings?.promo_bg || '#8B2E1F'

  const featuredCats = useMemo(() => {
    if (settings?.custom_categories_detail) {
      try {
        const parsed = typeof settings.custom_categories_detail === 'string'
          ? JSON.parse(settings.custom_categories_detail)
          : settings.custom_categories_detail
        if (Array.isArray(parsed) && parsed.length > 0) {
          const homeFiltered = parsed.filter((c) => c.show_on_home !== false)
          if (homeFiltered.length > 0) {
            return homeFiltered.map((c) => ({
              cat: c.name,
              label: c.name,
              g1: c.g1 || '#2A2A2A',
              g2: c.g2 || '#4A4A4A',
              image_url: c.image_url && c.image_url.trim() ? c.image_url : DEFAULT_CATEGORY_IMAGES[c.name] || ''
            }))
          }
        }
      } catch {
        /* fallback */
      }
    }
    return DEFAULT_FEATURED
  }, [settings])

  // Filter products by tab selection
  const displayedProducts = (() => {
    if (activeTab === 'newest') return products.slice(0, 6)
    if (activeTab === 'discounted') return products.filter((p) => p.priceMin < p.priceMax || p.priceMin <= 25000).slice(0, 6)
    // Default bestsellers:
    return products.slice(2, 8).length ? products.slice(2, 8) : products.slice(0, 6)
  })()

  return (
    <>
      <Billboard />
      
      {/* App Stories Category Bar */}
      <CategoryStories />

      {/* Dynamic Flash Sale Countdown Banner */}
      <FlashSaleBanner />

      {/* Smart Tabbed Showcase for Products */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head showcase-head">
          <div>
            <span className="section-label">تصفح التشكيلات المميزة</span>
            <h2 className="display">منتجات الجملة المختارة</h2>
          </div>
          <Link to="/catalog">عرض كل الكتالوج ←</Link>
        </div>

        {/* Tab Switcher */}
        <div className="home-tabs-wrap">
          <button
            className={`tab-btn${activeTab === 'bestsellers' ? ' active' : ''}`}
            onClick={() => setActiveTab('bestsellers')}
          >
            🔥 الأكثر طلباً
          </button>
          <button
            className={`tab-btn${activeTab === 'newest' ? ' active' : ''}`}
            onClick={() => setActiveTab('newest')}
          >
            ✨ وصل حديثاً
          </button>
          <button
            className={`tab-btn${activeTab === 'discounted' ? ' active' : ''}`}
            onClick={() => setActiveTab('discounted')}
          >
            🏷️ عروض الجملة
          </button>
        </div>
      </div>

      <div className="grid grid--home" style={{ paddingTop: 16 }}>
        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', gridColumn: '1 / -1' }}>جاري تحميل المنتجات...</div>
        ) : (
          displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {promoEnabled && (
        <Link to={promoLink || '/catalog'} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="promo-strip" style={promoBg ? { background: promoBg } : {}}>
            <div className="txt">
              <h4 className="display">{promoTitle}</h4>
              {promoText && <p>{promoText}</p>}
            </div>
            {promoDiscount && <div className="pct">{promoDiscount}</div>}
          </div>
        </Link>
      )}

      {/* Trust badges */}
      <div className="trust">
        <div className="item">
          <div className="icon-wrap"><TruckIcon /></div>
          <span>توصيل لكل محافظات العراق</span>
        </div>
        <div className="item">
          <div className="icon-wrap"><CashIcon /></div>
          <span>الدفع عند الاستلام</span>
        </div>
        <div className="item">
          <div className="icon-wrap"><ChatIcon /></div>
          <span>خدمة عملاء ومتابعة مستمرة</span>
        </div>
      </div>

      <Footer />

      {/* Floating WhatsApp Quick Contact Button */}
      <FloatingWhatsApp />
    </>
  )
}
