import { useState, useEffect } from 'react'
import api from '../../lib/api.js'

const DEFAULT_CATEGORY_IMAGES = {
  'رجالي': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop',
  'نسائي': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  'أطفال': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
  'فساتين': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
  'بيتي': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'رجالي', description: 'ملابس وقمصان وقاطات رجالي جملة', image_url: DEFAULT_CATEGORY_IMAGES['رجالي'], g1: '#2A2A2A', g2: '#4A4A4A', show_on_home: true },
  { id: 'cat-2', name: 'نسائي', description: 'ملابس وعبايات وفساتين نسائية', image_url: DEFAULT_CATEGORY_IMAGES['نسائي'], g1: '#6E1F34', g2: '#8B2942', show_on_home: true },
  { id: 'cat-3', name: 'أطفال', description: 'أطقم وملابس ولادي وبناتي', image_url: DEFAULT_CATEGORY_IMAGES['أطفال'], g1: '#2D4A3E', g2: '#4A7C59', show_on_home: true },
  { id: 'cat-4', name: 'فساتين', description: 'تشكيلات فساتين سهرة ومناسبات', image_url: DEFAULT_CATEGORY_IMAGES['فساتين'], g1: '#3D2B1F', g2: '#6B4C3B', show_on_home: true },
  { id: 'cat-5', name: 'بيتي', description: 'بيجامات وملابس منزلية مريحة', image_url: DEFAULT_CATEGORY_IMAGES['بيتي'], g1: '#3B4E6B', g2: '#556B8D', show_on_home: true }
]

export default function Categories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // New Category Form State
  const [newCat, setNewCat] = useState({
    name: '',
    description: '',
    image_url: '',
    g1: '#8B2E1F',
    g2: '#C08A3E',
    show_on_home: true
  })

  // Edit Category Form State
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    api.getPublicSettings()
      .then((data) => {
        if (data?.custom_categories_detail) {
          try {
            const parsed = typeof data.custom_categories_detail === 'string' ? JSON.parse(data.custom_categories_detail) : data.custom_categories_detail
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed.map(c => ({
                ...c,
                image_url: (c.image_url && c.image_url.trim()) ? c.image_url : (DEFAULT_CATEGORY_IMAGES[c.name] || '')
              })))
            }
          } catch { /* fallback */ }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function saveCategories(updatedList) {
    setSaving(true)
    try {
      // Also update standard string array for backward compatibility
      const namesOnly = updatedList.map((c) => c.name)
      await api.updateSettings({
        custom_categories_detail: JSON.stringify(updatedList),
        custom_categories: JSON.stringify(namesOnly)
      })
      setCategories(updatedList)
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleAddCategory(e) {
    e.preventDefault()
    if (!newCat.name.trim()) return alert('فضلاً أدخل اسم التصنيف')

    const created = {
      id: `cat-${Date.now()}`,
      name: newCat.name.trim(),
      description: newCat.description.trim(),
      image_url: newCat.image_url,
      g1: newCat.g1,
      g2: newCat.g2,
      show_on_home: newCat.show_on_home
    }

    const updated = [...categories, created]
    saveCategories(updated)

    setNewCat({
      name: '',
      description: '',
      image_url: '',
      g1: '#8B2E1F',
      g2: '#C08A3E',
      show_on_home: true
    })
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setEditForm({ ...cat })
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editForm.name.trim()) return alert('اسم التصنيف لا يمكن أن يكون فارغاً')

    const updated = categories.map((c) => (c.id === editingId ? { ...editForm, name: editForm.name.trim() } : c))
    saveCategories(updated)
    setEditingId(null)
    setEditForm(null)
  }

  function handleDelete(id, name) {
    if (confirm(`هل أنت تأكد من حذف تصنيف "${name}"؟`)) {
      const updated = categories.filter((c) => c.id !== id)
      saveCategories(updated)
    }
  }

  const handleFileUpload = (file, isEditMode = false) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        if (isEditMode) {
          setEditForm((f) => ({ ...f, image_url: evt.target.result }))
        } else {
          setNewCat((f) => ({ ...f, image_url: evt.target.result }))
        }
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="admin-page-head">
        <div>
          <h1 className="display">إدارة التصنيفات والأقسام</h1>
          <p>جاري تحميل التصنيفات...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">إدارة التصنيفات والأقسام</h1>
          <p>إضافة وتعديل الأقسام ورسوم وصور التصنيفات المعروضة بالصفحة الرئيسية والكتالوج</p>
        </div>
      </div>

      <div className="pf-grid">
        {/* Form: Add New Category */}
        <div className="admin-card">
          <h3>إضافة تصنيف جديد</h3>
          <form onSubmit={handleAddCategory}>
            <div className="pf-field">
              <label>اسم التصنيف</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="مثال: فساتين سهرة، ملابس رياضية..."
                required
              />
            </div>

            <div className="pf-field">
              <label>وصف مختصر للتصنيف</label>
              <input
                type="text"
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                placeholder="وصف للأجواء أو التشكيلة..."
              />
            </div>

            <div className="pf-field">
              <label>صورة التصنيف (اختيار ملف أو رابط)</label>
              <input
                type="text"
                value={newCat.image_url}
                onChange={(e) => setNewCat({ ...newCat, image_url: e.target.value })}
                placeholder="https://example.com/cat-img.jpg"
                style={{ marginBottom: 6 }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], false)}
                  style={{ fontSize: 12 }}
                />
                {newCat.image_url && (
                  <div style={{ width: 45, height: 45, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <img src={newCat.image_url} alt="معاينة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-field">
                <label>اللون الأول (Gradient Start)</label>
                <input
                  type="color"
                  value={newCat.g1}
                  onChange={(e) => setNewCat({ ...newCat, g1: e.target.value })}
                  style={{ width: '100%', height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                />
              </div>
              <div className="pf-field">
                <label>اللون الثاني (Gradient End)</label>
                <input
                  type="color"
                  value={newCat.g2}
                  onChange={(e) => setNewCat({ ...newCat, g2: e.target.value })}
                  style={{ width: '100%', height: 38, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="pf-field" style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCat.show_on_home}
                  onChange={(e) => setNewCat({ ...newCat, show_on_home: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <span>إظهار في كروت التصفح بالصفحة الرئيسية</span>
              </label>
            </div>

            <button type="submit" className="btn btn-brass" disabled={saving} style={{ marginTop: 12 }}>
              + حفظ التصنيف الجديد
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div>
          <div className="admin-card">
            <h3>التصنيفات المتاحة ({categories.length})</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>انقر على "تعديل" لتغيير الصورة، الألوان، أو الاسم.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.map((c) => {
                const isEditing = editingId === c.id

                if (isEditing && editForm) {
                  return (
                    <form key={c.id} onSubmit={handleSaveEdit} style={{ background: 'var(--parchment)', padding: 14, borderRadius: 12, border: '2px solid var(--accent)' }}>
                      <h4 style={{ marginBottom: 10, fontSize: 13, fontWeight: 700 }}>تعديل التصنيف: {c.name}</h4>
                      
                      <div className="pf-field">
                        <label style={{ fontSize: 11 }}>اسم التصنيف</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>

                      <div className="pf-field">
                        <label style={{ fontSize: 11 }}>الوصف</label>
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>

                      <div className="pf-field">
                        <label style={{ fontSize: 11 }}>صورة التصنيف</label>
                        <input
                          type="text"
                          value={editForm.image_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                          placeholder="رابط الصورة..."
                          style={{ marginBottom: 6 }}
                        />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], true)}
                            style={{ fontSize: 11 }}
                          />
                          {editForm.image_url && (
                            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)' }}>
                              <img src={editForm.image_url} alt="معاينة" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pf-row">
                        <div className="pf-field">
                          <label style={{ fontSize: 11 }}>اللون الأول</label>
                          <input
                            type="color"
                            value={editForm.g1 || '#2A2A2A'}
                            onChange={(e) => setEditForm({ ...editForm, g1: e.target.value })}
                            style={{ width: '100%', height: 32, border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                        <div className="pf-field">
                          <label style={{ fontSize: 11 }}>اللون الثاني</label>
                          <input
                            type="color"
                            value={editForm.g2 || '#4A4A4A'}
                            onChange={(e) => setEditForm({ ...editForm, g2: e.target.value })}
                            style={{ width: '100%', height: 32, border: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div className="pf-field" style={{ marginTop: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={editForm.show_on_home ?? true}
                            onChange={(e) => setEditForm({ ...editForm, show_on_home: e.target.checked })}
                          />
                          <span>إظهار بالصفحة الرئيسية</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button type="submit" className="btn btn-brass" disabled={saving} style={{ fontSize: 12, padding: '6px 14px' }}>
                          حفظ التعديلات
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ fontSize: 12, padding: '6px 14px' }}>
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )
                }

                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      flexWrap: 'wrap',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: c.image_url ? `url(${c.image_url}) center/cover` : `linear-gradient(135deg, ${c.g1 || '#333'}, ${c.g2 || '#666'})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0
                        }}
                      >
                        {!c.image_url && (c.name?.[0] || 'T')}
                      </div>
                      <div>
                        <strong style={{ fontSize: 14 }}>{c.name}</strong>
                        {c.description && <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{c.description}</div>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="btn btn-ghost" onClick={() => startEdit(c)} style={{ padding: '5px 10px', fontSize: 12 }}>
                        تعديل
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(c.id, c.name)} style={{ padding: '5px 10px', fontSize: 12 }}>
                        حذف
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
