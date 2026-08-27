import { Link } from 'react-router-dom'
import { useProductsStore } from '../store/useProductsStore.js'
import { useSettingsStore } from '../store/useSettingsStore.js'
import { useMemo } from 'react'

const DEFAULT_CATEGORY_IMAGES = {
  'رجالي': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop',
  'نسائي': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
  'أطفال': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=400&auto=format&fit=crop',
  'فساتين': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
  'بيتي': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop'
}

const DEFAULT_FEATURED = [
  { cat: 'رجالي', label: 'رجالي', image_url: DEFAULT_CATEGORY_IMAGES['رجالي'] },
  { cat: 'نسائي', label: 'نسائي', image_url: DEFAULT_CATEGORY_IMAGES['نسائي'] },
  { cat: 'أطفال', label: 'أطفال', image_url: DEFAULT_CATEGORY_IMAGES['أطفال'] },
  { cat: 'فساتين', label: 'فساتين', image_url: DEFAULT_CATEGORY_IMAGES['فساتين'] },
  { cat: 'بيتي', label: 'بيتي', image_url: DEFAULT_CATEGORY_IMAGES['بيتي'] }
]

export default function CategoryStories() {
  const products = useProductsStore((s) => s.products)
  const settings = useSettingsStore((s) => s.settings)

  const categories = useMemo(() => {
    if (settings?.custom_categories_detail) {
      try {
        const parsed = typeof settings.custom_categories_detail === 'string'
          ? JSON.parse(settings.custom_categories_detail)
          : settings.custom_categories_detail
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((c) => c.show_on_home !== false)
          if (filtered.length > 0) {
            return filtered.map((c) => ({
              cat: c.name,
              label: c.name,
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

  return (
    <section className="stories-section">
      <div className="stories-container">
        {/* All / Kolog Chip Story */}
        <Link className="story-item story-all" to="/catalog">
          <div className="story-ring ring-gold">
            <div className="story-avatar story-avatar-all">
              <span>✨</span>
            </div>
          </div>
          <span className="story-name">الكل</span>
          <span className="story-count">الكتالوج</span>
        </Link>

        {/* Dynamic Category Stories */}
        {categories.map(({ cat, label, image_url }) => {
          const count = products.filter((p) => p.cat === label).length
          return (
            <Link key={cat} className="story-item" to={`/catalog?cat=${encodeURIComponent(label)}`}>
              <div className="story-ring">
                <div className="story-avatar">
                  <img src={image_url} alt={label} loading="lazy" />
                </div>
                {count > 0 && <span className="story-badge-dot">{count}</span>}
              </div>
              <span className="story-name">{label}</span>
              <span className="story-count">{count > 0 ? `${count} قطعة` : 'تشكيلة'}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
