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

  useEffect(() => {
    if (products.length === 0) {
      useProductsStore.getState().fetchProducts()
    }
  }, [products.length])

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
    cat: FALLBACK_CATEGORIES[0],
    description: '',
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
      setForm({
        name: existing.name || '',
        cat: existing.cat || FALLBACK_CATEGORIES[0],
        description: existing.description || '',
        priceMin: existing.priceMin || '',
        priceMax: existing.priceMax || '',
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

    if (!form.name.trim() || !form.priceMin || !form.priceMax) {
      setError('فضلاً عبّي الاسم والسعر على الأقل')
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

    const payload = {
      name: form.name.trim(),
      category: form.cat,
      description: form.description.trim(),
      price_min: Number(form.priceMin),
      price_max: Number(form.priceMax),
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

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">{isEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>
          <p>{isEdit ? `معرّف المنتج: ${id}` : 'سيُولّد كود المنتج تلقائياً بعد الحفظ'}</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/products">إلغاء والعودة</Link>
      </div>

      {error && <div className="admin-card" style={{ color: 'var(--clay)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="pf-grid">
          <div className="admin-card">
            <h3>معلومات المنتج الأساسية</h3>

            <div className="pf-field">
              <label>اسم المنتج</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="مثال: كنزة شتوية صوف" />
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

            <div className="pf-row">
              <div className="pf-field">
                <label>أقل سعر (د.ع)</label>
                <input type="number" value={form.priceMin} onChange={(e) => update('priceMin', e.target.value)} placeholder="25000" />
              </div>
              <div className="pf-field">
                <label>أعلى سعر (د.ع)</label>
                <input type="number" value={form.priceMax} onChange={(e) => update('priceMax', e.target.value)} placeholder="30000" />
              </div>
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
                يتم توليد رموز SKU تلقائياً لكل تركيبة ({validColorsForStock.length} ألوان × {form.sizes.length} مقاسات = {validColorsForStock.length * form.sizes.length} متغيّر).
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
    </>
  )
}
