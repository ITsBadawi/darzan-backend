import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../store/useFavoritesStore.js'
import { useProductsStore } from '../store/useProductsStore.js'
import ProductCard from '../components/ProductCard.jsx'
import { MiniFooter } from '../components/Footer.jsx'

export default function Favorites() {
  const ids = useFavoritesStore((s) => s.ids)
  const products = useProductsStore((s) => s.products)
  const items = products.filter((p) => ids.includes(p.id))

  useEffect(() => {
    document.title = 'درازن | المنتجات المفضلة'
  }, [])

  return (
    <>
      <div className="breadcrumb"><Link to="/">الرئيسية</Link> / <span className="current">المفضلة</span></div>
      <div className="page-head">
        <h1 className="display">المفضلة</h1>
        <p>المنتجات التي حفظتها لوقت لاحق</p>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>لم تضف أي منتج للمفضلة بعد</h3>
            <p>اضغط على أيقونة القلب في أي منتج لحفظه هنا</p>
            <Link to="/catalog">تصفّح المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid--home">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <MiniFooter />
    </>
  )
}
