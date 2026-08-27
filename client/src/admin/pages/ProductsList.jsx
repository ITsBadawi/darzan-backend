import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProductsStore } from '../../store/useProductsStore.js'
import api from '../../lib/api.js'

const DEFAULT_CATEGORIES = ['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']
const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export default function ProductsList() {
  const products = useProductsStore((s) => s.products)
  const loading = useProductsStore((s) => s.loading)
  const fetchProducts = useProductsStore((s) => s.fetchProducts)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('الكل')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    fetchProducts()
    api.getCategories()
      .then((cats) => { if (Array.isArray(cats) && cats.length > 0) setCategories(cats) })
      .catch(() => {})
  }, [fetchProducts])

  const items = useMemo(() => {
    return products.filter((p) => {
      const inCat = cat === 'الكل' || p.cat === cat
      const inSearch = !q || p.name.includes(q)
      return inCat && inSearch
    })
  }, [products, q, cat])

  async function handleDelete(id, name) {
    if (confirm(`حذف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      try {
        await deleteProduct(id)
      } catch (err) {
        alert('حدث خطأ أثناء الحذف: ' + err.message)
      }
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">المنتجات</h1>
          <p>{products.length} منتج مسجّل</p>
        </div>
        <button className="btn btn-brass" onClick={() => navigate('/admin/products/new')}>+ إضافة منتج جديد</button>
      </div>

      <div className="admin-card">
        <div className="table-toolbar">
          <input type="text" placeholder="بحث بالاسم..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>جاري تحميل المنتجات...</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>الاسم</th><th>التصنيف</th><th>عدد الألوان</th><th>السعر</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-name">{p.name}</td>
                    <td>{p.cat}</td>
                    <td>{p.colors.length} لون × {SIZES.length} مقاس</td>
                    <td>{p.priceMin === p.priceMax ? p.priceMin.toLocaleString('ar') : `${p.priceMin.toLocaleString('ar')}–${p.priceMax.toLocaleString('ar')}`} د.ع</td>
                    <td>
                      <Link className="btn btn-ghost" to={`/admin/products/${p.id}/edit`} style={{ marginLeft: 8 }}>تعديل</Link>
                      <button className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>حذف</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>لا توجد منتجات مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
