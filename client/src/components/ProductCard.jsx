import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../store/useFavoritesStore.js'
import { HeartIcon, WATERMARK_ICONS } from './icons.jsx'
import QuickAddModal from './QuickAddModal.jsx'
import Toast, { useToast } from './Toast.jsx'

export default function ProductCard({ product }) {
  const isFav = useFavoritesStore((s) => s.ids.includes(product.id))
  const toggle = useFavoritesStore((s) => s.toggle)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { message, showToast } = useToast()

  const WatermarkIcon = WATERMARK_ICONS[product.icon]
  const g1 = product.colors[0]?.g1 ?? '#E7DEC8'
  const g2 = product.colors[0]?.g2 ?? '#D8CBA9'

  const priceLabel =
    product.priceMin === product.priceMax
      ? `${product.priceMin.toLocaleString('ar')} د.ع`
      : `${product.priceMin.toLocaleString('ar')} – ${product.priceMax.toLocaleString('ar')} د.ع`

  const firstColorId = product.colors[0]?.id
  const mainImage = product.cover_image || product.coverImage || product.image_url || product.images?.[firstColorId]?.[0]?.url || product.images?.['default']?.[0]?.url

  return (
    <>
      <div className="pcard-wrap">
        <Link className="pcard" to={`/product/${product.id}`}>
          <div className="img" style={mainImage ? { background: '#f5f2eb' } : { background: `linear-gradient(150deg, ${g1} 0%, ${g2} 100%)` }}>
            {mainImage && (
              <img
                src={mainImage}
                alt={product.name}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            )}
            <div className="cat-tag">{product.cat}</div>
            <button
              className={`fav${isFav ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); toggle(product.id) }}
              aria-label="أضف للمفضلة"
            >
              <HeartIcon width={14} height={14} />
            </button>
            <button
              className="quick-add-btn-card"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setQuickAddOpen(true)
              }}
              title="إضافة سريعة للسلة"
            >
              + إضافة سريعة
            </button>
            {!mainImage && WatermarkIcon && <WatermarkIcon className="watermark" width={110} height={110} />}
          </div>
          <div className="info">
            <div className="pname">{product.name}</div>
            <div className="price">{priceLabel}</div>
            <div className="colordots">
              {product.colors.map((c) => (
                <span key={c.code} style={{ background: c.hex }} />
              ))}
            </div>
          </div>
        </Link>
      </div>

      {quickAddOpen && (
        <QuickAddModal
          product={product}
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          onAdded={(msg) => showToast(msg)}
        />
      )}

      {message && <Toast message={message} />}
    </>
  )
}
