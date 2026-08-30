import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useProductsStore } from '../../store/useProductsStore.js'
import api from '../../lib/api.js'

const FALLBACK_CATEGORIES = ['رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'Free Size']

const ICON_OPTIONS = [
  { value: 'jacket', label: 'ملابس علوية / رجالي' },
  { value: 'dress', label: 'فستان' },
  { value: 'abaya', label: 'عباية' },
  { value: 'child', label: 'أطفال' },
  { value: 'home', label: 'بيتي' }
]

function emptyColor() {
  return { code: '', name: '', hex: '#8B2E1F', image_url: '' }
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const products = useProductsStore((s) => s.products)
  const existing = isEdit ? products.find((p) => p.id === id) : null

  // Dynamic categories
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [newCat, setNewCat] = useState('')

  // Suppliers state
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [quickSupplierModal, setQuickSupplierModal] = useState(false)
  const [quickForm, setQuickForm] = useState({ supplier_code: '', name: '', phone: '', notes: '' })
  const [quickSaving, setQuickSaving] = useState(false)
  const [quickError, setQuickError] = useState('')

  useEffect(() => {
    if (products.length === 0) {
      useProductsStore.getState().fetchProducts()
    }
  }, [products.length])

  async function loadSuppliers() {
    try {
      setLoadingSuppliers(true)
      const data = await api.getSuppliers(true)
      if (Array.isArray(data) && data.length > 0) {
        setSuppliers(data)
      }
    } catch (err) {
      console.warn('Could not load suppliers:', err)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    api.getPublicSettings()
      .then((data) => {
        if (data?.custom_categories_detail) {
          try {
            const parsed = typeof data.custom_categories_detail === 'string' ? JSON.parse(data.custom_categories_detail) : data.custom_categories_detail
            if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed.map(c => c.name))
          } catch { /* fallback */ }
        } else if (data?.custom_categories) {
          try {
            const parsed = typeof data.custom_categories === 'string' ? JSON.parse(data.custom_categories) : data.custom_categories
            if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed)
          } catch { /* fallback */ }
        }
      })
      .catch(() => {})
  }, [])

  const [form, setForm] = useState(() => ({
    name: '',
    supplier_id: '',
    cat: FALLBACK_CATEGORIES[0],
    description: '',
    sale_type: 'both',
    price_piece: '',
    price_dozen: '',
    min_piece_qty: '1',
    min_dozen_qty: '1',
    priceMin: '',
    priceMax: '',
    icon: 'jacket',
    coverImage: '',
    colors: [emptyColor()],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
  }))

  const [stockMatrix, setStockMatrix] = useState({})
  const [customSize, setCustomSize] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Sync form state when editing an existing product
  useEffect(() => {
    if (isEdit && existing) {
      const pricePiece = existing.price_piece !== undefined ? existing.price_piece : (existing.pricePiece !== undefined ? existing.pricePiece : (existing.priceMin || existing.price_min || ''))
      const priceDozen = existing.price_dozen !== undefined ? existing.price_dozen : (existing.priceDozen !== undefined ? existing.priceDozen : (pricePiece ? Number(pricePiece) * 12 : ''))
      const saleType = existing.sale_type || existing.saleType || 'both'
      const minPiece = existing.min_piece_qty !== undefined ? existing.min_piece_qty : (existing.minPieceQty !== undefined ? existing.minPieceQty : '1')
      const minDozen = existing.min_dozen_qty !== undefined ? existing.min_dozen_qty : (existing.minDozenQty !== undefined ? existing.minDozenQty : '1')

      setForm({
        name: existing.name || '',
        supplier_id: existing.supplier_id || existing.supplier?.id || '',
        cat: existing.cat || existing.category || FALLBACK_CATEGORIES[0],
        description: existing.description || '',
        sale_type: saleType,
        price_piece: pricePiece,
        price_dozen: priceDozen,
        min_piece_qty: minPiece,
        min_dozen_qty: minDozen,
        priceMin: existing.priceMin || existing.price_min || pricePiece || '',
        priceMax: existing.priceMax || existing.price_max || pricePiece || '',
        icon: existing.icon || 'jacket',
        coverImage: existing.cover_image || existing.coverImage || existing.image_url || '',
        colors: existing.colors?.length
          ? existing.colors.map((c) => ({
              code: c.code,
              name: c.name,
              hex: c.hex,
              id: c.id,
              image_url: c.image_url || c.imageUrl || ''
            }))
          : [emptyColor()],
        sizes: existing.sizes || ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
      })

      if (existing.skuMatrix) {
        const initial = {}
        Object.entries(existing.skuMatrix).forEach(([key, sku]) => {
          initial[key] = sku.stock ?? 0
        })
        setStockMatrix(initial)
      }
    }
  }, [isEdit, existing])

  // If creating new product and suppliers loaded, set default supplier if not selected
  useEffect(() => {
    if (!isEdit && suppliers.length > 0 && !form.supplier_id) {
      setForm((f) => ({ ...f, supplier_id: suppliers[0].id }))
    }
  }, [isEdit, suppliers, form.supplier_id])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateColor(index, field, value) {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    }))
  }

  function addColorRow() {
    setForm((f) => ({ ...f, colors: [...f.colors, emptyColor()] }))
  }

  function removeColorRow(index) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== index) }))
  }

  function toggleSize(sz) {
    setForm((f) => {
      const exists = f.sizes.includes(sz)
      const newSizes = exists ? f.sizes.filter((s) => s !== sz) : [...f.sizes, sz]
      return { ...f, sizes: newSizes }
    })
  }

  function handleAddCustomSize() {
    const trimmed = customSize.trim().toUpperCase()
    if (!trimmed) return
    if (!form.sizes.includes(trimmed)) {
      setForm((f) => ({ ...f, sizes: [...f.sizes, trimmed] }))
    }
    setCustomSize('')
  }

  function handleAddCategory() {
    const trimmed = newCat.trim()
    if (!trimmed || categories.includes(trimmed)) return
    const updated = [...categories, trimmed]
    setCategories(updated)
    update('cat', trimmed)
    setNewCat('')
    api.updateSettings({ custom_categories: JSON.stringify(updated) }).catch(() => {})
  }

  // Quick Add Supplier
  async function handleQuickAddSupplier(e) {
    e.preventDefault()
    setQuickError('')
    if (!quickForm.supplier_code.trim() || !quickForm.name.trim()) {
      setQuickError('يرجى كتابة كود المورد واسمه')
      return
    }

    setQuickSaving(true)
    try {
      const created = await api.createSupplier({
        supplier_code: quickForm.supplier_code.trim().toUpperCase(),
        name: quickForm.name.trim(),
        phone: quickForm.phone.trim(),
        notes: quickForm.notes.trim(),
        is_active: true
      })
      await loadSuppliers()
      update('supplier_id', created.id)
      setQuickModal(false)
      setQuickForm({ supplier_code: '', name: '', phone: '', notes: '' })
    } catch (err) {
      setQuickError(err.message || 'فشل إضافة المورد')
    } finally {
      setQuickSaving(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) update('coverImage', evt.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleColorFileUpload = (index, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        updateColor(index, 'image_url', evt.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function updateStock(colorCode, size, value) {
    const num = Math.max(0, parseInt(value) || 0)
    setStockMatrix((m) => ({ ...m, [`${colorCode}-${size}`]: num }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('فضلاً أدخل اسم المنتج')
      return
    }

    if (!form.supplier_id) {
      setError('يرجى اختيار المورد المسؤول عن هذا المنتج')
      return
    }

    if (form.sale_type !== 'dozen' && (!form.price_piece || Number(form.price_piece) <= 0)) {
      setError('يرجى تحديد سعر القطعة بشكل صحيح')
      return
    }

    if (form.sale_type !== 'piece' && (!form.price_dozen || Number(form.price_dozen) <= 0)) {
      setError('يرجى تحديد سعر الدرزن بشكل صحيح')
      return
    }

    const validColors = form.colors.filter((c) => c.name.trim() && c.code.trim())
    if (validColors.length === 0) {
      setError('أضف لوناً واحداً على الأقل (بكود واسم)')
      return
    }

    if (form.sizes.length === 0) {
      setError('اختر مقاساً واحداً على الأقل')
      return
    }

    const calculatedPricePiece = form.price_piece ? Number(form.price_piece) : Math.round(Number(form.price_dozen) / 12)
    const calculatedPriceDozen = form.price_dozen ? Number(form.price_dozen) : (calculatedPricePiece * 12)

    const payload = {
      name: form.name.trim(),
      supplier_id: form.supplier_id,
      category: form.cat,
      description: form.description.trim(),
      sale_type: form.sale_type,
      price_piece: calculatedPricePiece,
      price_dozen: calculatedPriceDozen,
      min_piece_qty: Math.max(1, Number(form.min_piece_qty) || 1),
      min_dozen_qty: Math.max(1, Number(form.min_dozen_qty) || 1),
      price_min: Number(form.priceMin || calculatedPricePiece),
      price_max: Number(form.priceMax || calculatedPricePiece),
      icon: form.icon,
      cover_image: form.coverImage,
      colors: validColors.map((c) => ({
        code: c.code.trim().toUpperCase(),
        name: c.name.trim(),
        hex: c.hex,
        image_url: c.image_url || ''
      })),
      sizes: form.sizes,
      stock_matrix: Object.keys(stockMatrix).length > 0 ? stockMatrix : undefined
    }

    setSaving(true)
    try {
      if (isEdit) {
        await api.updateProduct(id, payload)
      } else {
        await api.createProduct(payload)
      }
      useProductsStore.getState().invalidate()
      await useProductsStore.getState().fetchProducts()
      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const validColorsForStock = form.colors.filter((c) => c.name.trim() && c.code.trim())

  if (isEdit && products.length > 0 && !existing) {
    return (
      <div className="admin-card">
        <p>المنتج غير موجود.</p>
        <Link className="btn btn-ghost" to="/admin/products">العودة لقائمة المنتجات</Link>
      </div>
    )
  }

  const currentProdNumber = existing?.product_number ? String(existing.product_number).padStart(6, '0') : '00000X'

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">{isEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>
          <p>{isEdit ? `رقم المنتج: #${currentProdNumber}` : 'سيُولّد كود المنتج ورقم الـ SKU تلقائياً بعد الحفظ'}</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/products">إلغاء والعودة</Link>
      </div>

      {error && <div className="admin-card" style={{ color: 'var(--clay)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="pf-grid">
          <div className="admin-card">
            <h3>معلومات المنتج الأساسية</h3>

            <div className="pf-field">
              <label>اسم المنتج *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="مثال: كنزة شتوية صوف" required />
            </div>

            {/* Supplier Selection Field */}
            <div className="pf-field">
              <label>المورد *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={form.supplier_id}
                  onChange={(e) => update('supplier_id', e.target.value)}
                  style={{ flex: 1 }}
                  required
                >
                  <option value="" disabled>-- اختر المورد المسؤول --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.supplier_code})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setQuickModal(true)}
                  style={{ whiteSpace: 'nowrap', fontSize: 12 }}
                  title="إضافة مورد سريع دون مغادرة الصفحة"
                >
                  + مورد جديد
                </button>
              </div>
              {suppliers.length === 0 && !loadingSuppliers && (
                <span style={{ fontSize: 11.5, color: 'var(--clay)', marginTop: 4, display: 'block' }}>
                  لا يوجد موردين فعّالين حالياً، انقر "+ مورد جديد" لإضافة مورد.
                </span>
              )}
            </div>

            <div className="pf-row">
              <div className="pf-field">
                <label>التصنيف</label>
                <select value={form.cat} onChange={(e) => update('cat', e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input type="text" placeholder="إضافة قسم جديد..." value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ flex: 1, fontSize: 11.5, padding: '6px 8px' }} />
                  <button type="button" className="btn btn-ghost" onClick={handleAddCategory} style={{ padding: '6px 10px', fontSize: 11 }}>+ إضافة</button>
                </div>
              </div>
              <div className="pf-field">
                <label>أيقونة العرض</label>
                <select value={form.icon} onChange={(e) => update('icon', e.target.value)}>
                  {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Sale Type, Pricing & MOQ Section */}
            <div style={{ background: 'var(--parchment)', borderRadius: 12, padding: 16, border: '1.5px solid var(--line)', marginBottom: 18, marginTop: 10 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--ink-2)' }}>
                طريقة البيع والتسعير والحد الأدنى للطلب (MOQ)
              </label>

              <div className="sale-type-grid">
                <button
                  type="button"
                  className={`sale-type-btn${form.sale_type === 'both' ? ' active' : ''}`}
                  onClick={() => update('sale_type', 'both')}
                >
                  <span className="st-icon">📦👕</span>
                  <span className="st-title">درزن وقطعة (كلاهما)</span>
                  <span className="st-desc">متاح للزبون الشراء بالمفرد أو بالجملة</span>
                </button>

                <button
                  type="button"
                  className={`sale-type-btn${form.sale_type === 'dozen' ? ' active' : ''}`}
                  onClick={() => update('sale_type', 'dozen')}
                >
                  <span className="st-icon">📦</span>
                  <span className="st-title">بالدرزن فقط (12 قطعة)</span>
                  <span className="st-desc">يباع بالدرزن فقط ومضاعفاته</span>
                </button>

                <button
                  type="button"
                  className={`sale-type-btn${form.sale_type === 'piece' ? ' active' : ''}`}
                  onClick={() => update('sale_type', 'piece')}
                >
                  <span className="st-icon">👕</span>
                  <span className="st-title">بالقطعة فقط (مفرد)</span>
                  <span className="st-desc">يباع بالمفرد فقط مع تحديد أقل كمية</span>
                </button>
              </div>

              {/* Price & MOQ Inputs for Piece */}
              {(form.sale_type === 'both' || form.sale_type === 'piece') && (
                <div className="pf-row" style={{ marginTop: 12 }}>
                  <div className="pf-field">
                    <label>سعر القطعة المفردة (د.ع) *</label>
                    <input
                      type="number"
                      value={form.price_piece}
                      onChange={(e) => {
                        const val = e.target.value
                        update('price_piece', val)
                        if (!form.priceMin) update('priceMin', val)
                        if (!form.priceMax) update('priceMax', val)
                        if (!form.price_dozen && val) update('price_dozen', Number(val) * 12)
                      }}
                      placeholder="مثال: 8000"
                      required={form.sale_type !== 'dozen'}
                    />
                  </div>
                  <div className="pf-field">
                    <label>أقل كمية لطلب القطع (MOQ) *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.min_piece_qty}
                      onChange={(e) => update('min_piece_qty', e.target.value)}
                      placeholder="1"
                      required={form.sale_type !== 'dozen'}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginTop: 4 }}>أقل عدد قطع يمكن للزبون إضافتها</span>
                  </div>
                </div>
              )}

              {/* Price & MOQ Inputs for Dozen */}
              {(form.sale_type === 'both' || form.sale_type === 'dozen') && (
                <div className="pf-row" style={{ marginTop: 12 }}>
                  <div className="pf-field">
                    <label>سعر الدرزن الكامل (12 قطعة) (د.ع) *</label>
                    <input
                      type="number"
                      value={form.price_dozen}
                      onChange={(e) => update('price_dozen', e.target.value)}
                      placeholder="مثال: 80000"
                      required={form.sale_type !== 'piece'}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginTop: 4 }}>تحدده بحرية بتخفيض أو بدون تخفيض</span>
                  </div>
                  <div className="pf-field">
                    <label>أقل كمية لطلب الدرازن (MOQ) *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.min_dozen_qty}
                      onChange={(e) => update('min_dozen_qty', e.target.value)}
                      placeholder="1"
                      required={form.sale_type !== 'piece'}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginTop: 4 }}>أقل عدد درازن يمكن للزبون طلبها</span>
                  </div>
                </div>
              )}

              {/* Live Price & Discount Insight Preview */}
              {form.sale_type === 'both' && form.price_piece && form.price_dozen && (
                <div className="price-preview-box">
                  {(() => {
                    const singleP = Number(form.price_piece) || 0
                    const dozenP = Number(form.price_dozen) || 0
                    const pieces12Cost = singleP * 12
                    const diff = pieces12Cost - dozenP
                    if (diff > 0 && pieces12Cost > 0) {
                      const pct = Math.round((diff / pieces12Cost) * 100)
                      return (
                        <>
                          <span className="badge-saving">توفير {pct}% ({diff.toLocaleString('ar')} د.ع)</span>
                          سعر 12 قطعة مفرد: {pieces12Cost.toLocaleString('ar')} د.ع ⬅️ سعر الدرزن: {dozenP.toLocaleString('ar')} د.ع (تشجيع لجملة الدرزن)
                        </>
                      )
                    } else if (diff === 0) {
                      return <span>سعر الدرزن مطابق لسعر 12 قطعة مفردة ({dozenP.toLocaleString('ar')} د.ع)</span>
                    } else {
                      return <span>سعر الدرزن: {dozenP.toLocaleString('ar')} د.ع · سعر القطعة: {singleP.toLocaleString('ar')} د.ع</span>
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="pf-field">
              <label>صورة المنتج الرئيسية (اختيار ملف أو رابط)</label>
              <input type="text" placeholder="https://example.com/image.jpg" value={form.coverImage} onChange={(e) => update('coverImage', e.target.value)} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ fontSize: 12 }} />
                {form.coverImage && <button type="button" className="btn-danger" onClick={() => update('coverImage', '')}>إزالة</button>}
              </div>
              {form.coverImage && (
                <div style={{ marginTop: 10, width: 90, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <img src={form.coverImage} alt="معاينة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="pf-field">
              <label>الوصف</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="وصف مختصر عن المنتج..." />
            </div>
          </div>

          <div>
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <h3>الألوان المتوفرة وصورة كل لون</h3>

              {form.colors.map((c, i) => (
                <div key={i} style={{ background: 'var(--parchment)', borderRadius: 10, padding: 12, marginBottom: 12, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <input type="color" value={c.hex} onChange={(e) => updateColor(i, 'hex', e.target.value)} style={{ width: 44, height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                    <input type="text" placeholder="اسم اللون (أحمر)" value={c.name} onChange={(e) => updateColor(i, 'name', e.target.value)} style={{ flex: 1 }} />
                    <input type="text" placeholder="كود (RED)" value={c.code} onChange={(e) => updateColor(i, 'code', e.target.value.toUpperCase())} style={{ width: 90 }} />
                    {form.colors.length > 1 && (
                      <button type="button" onClick={() => removeColorRow(i)} style={{ background: 'none', border: 'none', color: '#c33', fontSize: 20, cursor: 'pointer', padding: '0 8px' }}>×</button>
                    )}
                  </div>
                  
                  <div className="pf-field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600 }}>رفع صورة خاصة لـ ({c.name || 'هذا اللون'})</label>
                    <input
                      type="text"
                      placeholder="https://example.com/red-shirt.jpg"
                      value={c.image_url || ''}
                      onChange={(e) => updateColor(i, 'image_url', e.target.value)}
                      style={{ fontSize: 12, marginBottom: 6 }}
                    />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleColorFileUpload(i, e.target.files?.[0])}
                        style={{ fontSize: 11.5 }}
                      />
                      {c.image_url && (
                        <div style={{ width: 42, height: 42, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                          <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="add-color-btn" onClick={addColorRow} style={{ marginTop: 6 }}>+ إضافة لون جديد</button>
            </div>

            <div className="admin-card">
              <h3>المقاسات المتاحة</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 14 }}>انقر لتحديد أو إلغاء المقاسات:</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {DEFAULT_SIZES.map((sz) => {
                  const active = form.sizes.includes(sz)
                  return (
                    <button type="button" key={sz} onClick={() => toggleSize(sz)} style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: active ? '2px solid var(--accent)' : '1px solid var(--line)',
                      background: active ? 'var(--accent-soft, #f4e8e1)' : 'var(--surface)',
                      color: active ? 'var(--accent)' : 'var(--text)',
                      fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease'
                    }}>{sz} {active ? '✓' : ''}</button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" placeholder="مقاس خاص (42)" value={customSize} onChange={(e) => setCustomSize(e.target.value)} style={{ flex: 1, height: 38 }} />
                <button type="button" className="btn btn-ghost" onClick={handleAddCustomSize} style={{ height: 38 }}>+ إضافة</button>
              </div>

              <div className="sku-note" style={{ marginTop: 14, fontSize: 12, color: 'var(--text-dim)' }}>
                ℹ️ صيغة الـ SKU التلقائية: <code>DZN-{currentProdNumber}-[COLOR]-[SIZE]</code> ({validColorsForStock.length} ألوان × {form.sizes.length} مقاسات = {validColorsForStock.length * form.sizes.length} متغيّر).
              </div>
            </div>
          </div>
        </div>

        {/* Stock Matrix Editor */}
        {isEdit && validColorsForStock.length > 0 && form.sizes.length > 0 && (
          <div className="admin-card" style={{ marginTop: 20 }}>
            <h3>إدارة المخزون (عدد القطع لكل لون × مقاس)</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>أدخل عدد القطع المتوفرة لكل تركيبة. ضع 0 لإظهار "نفدت الكمية" للزبون.</p>
            <div className="table-wrap">
              <table className="admin-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', right: 0, background: 'var(--card)', zIndex: 2 }}>اللون</th>
                    {form.sizes.map((sz) => <th key={sz} style={{ textAlign: 'center' }}>{sz}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {validColorsForStock.map((c) => (
                    <tr key={c.code}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', right: 0, background: 'var(--card)', zIndex: 1 }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: c.hex, marginLeft: 6, verticalAlign: 'middle' }} />
                        {c.name}
                      </td>
                      {form.sizes.map((sz) => {
                        const key = `${c.code}-${sz}`
                        const val = stockMatrix[key] ?? (existing?.skuMatrix?.[key]?.stock ?? 0)
                        return (
                          <td key={sz} style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={(e) => updateStock(c.code, sz, e.target.value)}
                              style={{ width: 55, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 6, padding: '5px 4px', fontSize: 12, background: val === 0 ? '#fff0f0' : '#fff' }}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-brass" disabled={saving}>
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'حفظ المنتج'}
          </button>
        </div>
      </form>

      {/* Quick Add Supplier Modal */}
      {quickSupplierModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickModal(false)
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 17 }}>+ إضافة مورد جديد فوري</h3>
              <button
                type="button"
                onClick={() => setQuickModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-dim)' }}
              >
                ×
              </button>
            </div>

            {quickError && (
              <div style={{ background: '#fff0f0', color: '#c33', padding: '8px 12px', borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
                {quickError}
              </div>
            )}

            <form onSubmit={handleQuickAddSupplier}>
              <div className="pf-field">
                <label>كود المورد *</label>
                <input
                  type="text"
                  placeholder="SUP-C"
                  value={quickForm.supplier_code}
                  onChange={(e) => setQuickForm({ ...quickForm, supplier_code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="pf-field">
                <label>اسم المورد *</label>
                <input
                  type="text"
                  placeholder="مخزن بغداد للأزياء"
                  value={quickForm.name}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="pf-field">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              <div className="pf-field">
                <label>ملاحظات</label>
                <textarea
                  placeholder="ملاحظات مختصرة..."
                  value={quickForm.notes}
                  onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setQuickModal(false)}
                  disabled={quickSaving}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-brass" disabled={quickSaving}>
                  {quickSaving ? 'جاري الحفظ...' : 'إضافة واختيار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
