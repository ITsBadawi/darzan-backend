import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../store/useFavoritesStore.js'
import { HeartIcon, WATERMARK_ICONS } from './icons.jsx'
import QuickAddModal from './QuickAddModal.jsx'
import Toast, { useToast } from './Toast.jsx'

export default function ProductCard({ product }) {
  const isFav = useFavoritesStore((s) => s.ids.includes(product?.id))
  const toggle = useFavoritesStore((s) => s.toggle)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { message, showToast } = useToast()

  if (!product) return null

  const colors = Array.isArray(product.colors) ? product.colors : []
  const firstColor = colors[0] || {}
  const WatermarkIcon = product.icon ? WATERMARK_ICONS[product.icon] : null
  const g1 = firstColor.g1 ?? '#E7DEC8'
  const g2 = firstColor.g2 ?? '#D8CBA9'

  const saleType = product.sale_type || product.saleType || 'both'
  const pricePiece = typeof product.price_piece === 'number' ? product.price_piece : (typeof product.pricePiece === 'number' ? product.pricePiece : (typeof product.price_min === 'number' ? product.price_min : (typeof product.priceMin === 'number' ? product.priceMin : 0)))
  const priceDozen = typeof product.price_dozen === 'number' ? product.price_dozen : (typeof product.priceDozen === 'number' ? product.priceDozen : (pricePiece * 12))
  const minPiece = Number(product.min_piece_qty || product.minPieceQty || 1)
  const minDozen = Number(product.min_dozen_qty || product.minDozenQty || 1)

  let priceLabel = ''
  if (saleType === 'dozen') {
    priceLabel = `${priceDozen.toLocaleString('ar')} د.ع / درزن`
  } else if (saleType === 'piece') {
    priceLabel = `${pricePiece.toLocaleString('ar')} د.ع / قطعة`
  } else {
    priceLabel = `${pricePiece.toLocaleString('ar')} د.ع`
  }

  const firstColorId = firstColor.id
  const mainImage =
    product.cover_image ||
    product.coverImage ||
    product.image_url ||
    (firstColorId && product.images?.[firstColorId]?.[0]?.url) ||
    product.images?.['default']?.[0]?.url ||
    product.images?.['all']?.[0]?.url

  return (
    <>
      <div className="pcard-wrap">
        <Link className="pcard" to={`/product/${product.id}`}>
          <div className="img" style={mainImage ? { background: '#f5f2eb' } : { background: `linear-gradient(150deg, ${g1} 0%, ${g2} 100%)` }}>
            {mainImage && (
              <img
                src={mainImage}
                alt={product.name || 'منتج'}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            )}
            {saleType === 'dozen' && (
              <div className="pcard-badge-dozen">
                📦 بالدرزن فقط
              </div>
            )}
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
            <div className="pcard-category">{product.cat || product.category || 'ملابس'}</div>
            <div className="pname" title={product.name}>{product.name}</div>
            <div className="pcard-price-row">
              <span className="pcard-price-main">{priceLabel}</span>
              {saleType === 'both' && priceDozen < pricePiece * 12 && (
                <span className="pcard-saving-pill">وفر بالدرزن</span>
              )}
            </div>
            <div className="pcard-footer">
              <div className="pcard-moq">
                {saleType === 'dozen' && minDozen > 1
                  ? `أقل طلب: ${minDozen} درزن`
                  : minPiece > 1
                  ? `أقل طلب: ${minPiece} قطع`
                  : ''}
              </div>
              <div className="colordots">
                {colors.map((c, idx) => (
                  <span key={c.code || c.id || idx} style={{ background: c.hex || '#888' }} />
                ))}
              </div>
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
