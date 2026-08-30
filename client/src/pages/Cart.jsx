import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore, selectCartTotal } from '../store/useCartStore.js'
import { useProductsStore } from '../store/useProductsStore.js'
import { MiniFooter } from '../components/Footer.jsx'
import { TrashIcon } from '../components/icons.jsx'
import './Cart.css'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const changeQty = useCartStore((s) => s.changeQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore(selectCartTotal)
  const products = useProductsStore((s) => s.products)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'درازن | سلة المشتريات'
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  return (
    <>
      <div className="breadcrumb"><Link to="/">الرئيسية</Link> / <span className="current">سلة المشتريات</span></div>
      <div className="page-head"><h1 className="display">سلة المشتريات</h1></div>

      {items.length === 0 ? (
        <div className="cart-wrap">
          <div className="empty-cart">
            <h3>سلتك فارغة</h3>
            <p>لم تضف أي منتج بعد — تصفّح المنتجات وابدأ التسوق</p>
            <Link to="/catalog">ابدأ التسوق</Link>
          </div>
        </div>
      ) : (
        <div className="cart-wrap">
          <div className="cart-list">
            {items.map((item) => {
              const product = products.find((p) => p.id === (item.productId || item.product_id))
              const colorObj = product?.colors?.find((c) => c.name === item.colorName || c.code === item.colorHex)
              const itemImg = item.image || item.image_url || item.cover_image || colorObj?.image_url || product?.cover_image || product?.coverImage || product?.image_url
              const isDozen = item.unit_type === 'dozen' || item.unitType === 'dozen'
              const unitName = item.unit_name || item.unitName || (isDozen ? 'درزن' : 'قطعة')
              const minQty = Math.max(1, Number(item.min_qty) || 1)

              return (
                <div className="cart-item" key={item.lineId}>
                  <div className="thumb">
                    {itemImg ? (
                      <img src={itemImg} alt={item.name} loading="lazy" />
                    ) : (
                      <div
                        className="thumb-fallback"
                        style={{ background: `linear-gradient(150deg, ${item.g1 || '#ddd'} 0%, ${item.g2 || '#bbb'} 100%)` }}
                      />
                    )}
                  </div>
                  <div className="details">
                    <div className="details-header">
                      <div className="name">
                        {item.name}
                        {isDozen && (
                          <span style={{
                            marginRight: 8,
                            fontSize: 11,
                            background: '#FEF3D6',
                            color: '#9A6B0A',
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontWeight: 700
                          }}>
                            📦 درزن (12 قطعة)
                          </span>
                        )}
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.lineId)}
                        title="إزالة من السلة"
                        aria-label="إزالة"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                    <div className="meta">
                      <span className="dot" style={{ background: item.colorHex || '#888' }} />
                      <span>{item.colorName}</span>
                      <span className="sep">·</span>
                      <span>مقاس {item.size}</span>
                      <span className="sep">·</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{unitName}</span>
                    </div>
                    <div className="row-bottom">
                      <div className="qty-stepper">
                        <button
                          disabled={item.qty <= minQty}
                          onClick={() => changeQty(item.lineId, -1)}
                          aria-label="إنقاص الكمية"
                          style={item.qty <= minQty ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          −
                        </button>
                        <span>{item.qty} {unitName}</span>
                        <button onClick={() => changeQty(item.lineId, 1)} aria-label="زيادة الكمية">+</button>
                      </div>
                      <div className="item-price">
                        <div>{(item.price * item.qty).toLocaleString('ar')} د.ع</div>
                        {isDozen && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                            ({item.qty * 12} قطعة إجمالاً)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="summary">
            <h3 className="display">ملخص الطلب</h3>
            <div className="sum-row">
              <span>إجمالي القطع</span>
              <span>{items.reduce((s, i) => s + (i.unit_type === 'dozen' || i.unitType === 'dozen' ? i.qty * 12 : i.qty), 0)} قطعة</span>
            </div>
            <div className="sum-row">
              <span>عدد البنود</span>
              <span>{items.length}</span>
            </div>
            <div className="sum-row"><span>الشحن</span><span>يُحدّد عند الطلب</span></div>
            <div className="sum-row total"><span>الإجمالي</span><span>{total.toLocaleString('ar')} د.ع</span></div>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>متابعة إلى الدفع</button>
            <Link className="continue-link" to="/catalog">متابعة التسوق</Link>
          </div>
        </div>
      )}

      <MiniFooter />
    </>
  )
}
