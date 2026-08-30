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
  const [supplierFilter, setSupplierFilter] = useState('الكل')
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    fetchProducts()
    api.getCategories()
      .then((cats) => { if (Array.isArray(cats) && cats.length > 0) setCategories(cats) })
      .catch(() => {})

    api.getSuppliers()
      .then((sups) => { if (Array.isArray(sups)) setSuppliers(sups) })
      .catch(() => {})
  }, [fetchProducts])

  const items = useMemo(() => {
    return products.filter((p) => {
      const inCat = cat === 'الكل' || p.cat === cat || p.category === cat
      const inSupplier =
        supplierFilter === 'الكل' ||
        p.supplier_id === supplierFilter ||
        p.supplier?.id === supplierFilter

      const inSearch =
        !q ||
        p.name.includes(q) ||
        (p.product_number && String(p.product_number).includes(q)) ||
        (p.supplier?.name && p.supplier.name.includes(q)) ||
        (p.supplier?.supplier_code && p.supplier.supplier_code.includes(q.toUpperCase()))

      return inCat && inSupplier && inSearch
    })
  }, [products, q, cat, supplierFilter])

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
          <p>{products.length} منتج مسجّل في النظام</p>
        </div>
        <button className="btn btn-brass" onClick={() => navigate('/admin/products/new')}>+ إضافة منتج جديد</button>
      </div>

      <div className="admin-card">
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم المنتج أو المورد..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 220 }}
          />

          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
            <option value="الكل">كل الموردين</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.supplier_code})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>جاري تحميل المنتجات...</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم المنتج</th>
                  <th>الاسم</th>
                  <th>المورد</th>
                  <th>التصنيف</th>
                  <th>طريقة البيع والحد الأدنى</th>
                  <th>التسعير</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const numStr = p.product_number ? String(p.product_number).padStart(6, '0') : '—'
                  const supplierObj = p.supplier || suppliers.find((s) => s.id === p.supplier_id)
                  const saleType = p.sale_type || p.saleType || 'both'
                  const pricePiece = p.price_piece !== undefined ? p.price_piece : (p.pricePiece !== undefined ? p.pricePiece : (p.priceMin || p.price_min || 0))
                  const priceDozen = p.price_dozen !== undefined ? p.price_dozen : (p.priceDozen !== undefined ? p.priceDozen : (pricePiece * 12))
                  const minPiece = p.min_piece_qty !== undefined ? p.min_piece_qty : (p.minPieceQty !== undefined ? p.minPieceQty : 1)
                  const minDozen = p.min_dozen_qty !== undefined ? p.min_dozen_qty : (p.minDozenQty !== undefined ? p.minDozenQty : 1)

                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'var(--parchment, #f7f3ee)',
                          padding: '3px 6px',
                          borderRadius: 6,
                          fontSize: 12
                        }}>
                          #{numStr}
                        </span>
                      </td>
                      <td className="cell-name">
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        {supplierObj ? (
                          <div>
                            <span style={{ fontWeight: 600 }}>{supplierObj.name}</span>
                            <span style={{
                              display: 'inline-block',
                              fontSize: 10.5,
                              color: 'var(--text-dim)',
                              background: '#eee',
                              padding: '1px 5px',
                              borderRadius: 4,
                              marginRight: 6,
                              fontFamily: 'monospace'
                            }}>
                              {supplierObj.supplier_code}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td>{p.cat || p.category}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {saleType === 'both' && (
                            <span className="unit-badge both">📦👕 درزن وقطعة</span>
                          )}
                          {saleType === 'dozen' && (
                            <span className="unit-badge dozen">📦 بالدرزن فقط</span>
                          )}
                          {saleType === 'piece' && (
                            <span className="unit-badge piece">👕 بالقطعة فقط</span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                            {saleType !== 'dozen' ? `أقل طلب: ${minPiece} قطعة` : ''}
                            {saleType === 'both' ? ' · ' : ''}
                            {saleType !== 'piece' ? `${minDozen} درزن` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {saleType !== 'dozen' && (
                            <span style={{ fontSize: 12 }}>
                              <strong>{Number(pricePiece).toLocaleString('ar')}</strong> د.ع <span style={{ color: 'var(--text-dim)', fontSize: 10.5 }}>/قطعة</span>
                            </span>
                          )}
                          {saleType !== 'piece' && (
                            <span style={{ fontSize: 12, color: 'var(--brass-deep)' }}>
                              <strong>{Number(priceDozen).toLocaleString('ar')}</strong> د.ع <span style={{ color: 'var(--text-dim)', fontSize: 10.5 }}>/درزن</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link className="btn btn-ghost" to={`/admin/products/${p.id}/edit`}>تعديل</Link>
                          <button className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>لا توجد منتجات مطابقة للبحث أو الفلتر</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
