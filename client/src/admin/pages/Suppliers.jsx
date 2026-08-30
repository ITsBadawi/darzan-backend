import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api.js'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('الكل')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [form, setForm] = useState({
    supplier_code: '',
    name: '',
    phone: '',
    notes: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadSuppliers() {
    setLoading(true)
    try {
      const data = await api.getAdminSuppliers()
      setSuppliers(data || [])
    } catch (err) {
      console.error('Failed to fetch suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  function openCreateModal() {
    setEditingSupplier(null)
    setForm({
      supplier_code: '',
      name: '',
      phone: '',
      notes: '',
      is_active: true
    })
    setError('')
    setModalOpen(true)
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier)
    setForm({
      supplier_code: supplier.supplier_code || '',
      name: supplier.name || '',
      phone: supplier.phone || '',
      notes: supplier.notes || '',
      is_active: supplier.is_active !== false
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    if (!form.supplier_code.trim() || !form.name.trim()) {
      setError('يرجى كتابة كود المورد واسمه')
      return
    }

    setSaving(true)
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, form)
      } else {
        await api.createSupplier(form)
      }
      setModalOpen(false)
      await loadSuppliers()
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(supplier) {
    const nextStatus = !supplier.is_active
    try {
      await api.updateSupplier(supplier.id, { is_active: nextStatus })
      await loadSuppliers()
    } catch (err) {
      alert('حدث خطأ أثناء تغيير الحالة: ' + err.message)
    }
  }

  async function handleDelete(supplier) {
    if (!confirm(`هل أنت متأكد من حذف المورد "${supplier.name}" (${supplier.supplier_code})؟`)) {
      return
    }

    try {
      await api.deleteSupplier(supplier.id)
      await loadSuppliers()
    } catch (err) {
      alert(err.message || 'لا يمكن حذف المورد')
    }
  }

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplier_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery))

      const matchStatus =
        statusFilter === 'الكل' ||
        (statusFilter === 'فعّال' && s.is_active) ||
        (statusFilter === 'معطّل' && !s.is_active)

      return matchSearch && matchStatus
    })
  }, [suppliers, searchQuery, statusFilter])

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">الموردين</h1>
          <p>{suppliers.length} مورد مسجّل في النظام</p>
        </div>
        <button className="btn btn-brass" onClick={openCreateModal}>
          + إضافة مورد جديد
        </button>
      </div>

      <div className="admin-card">
        <div className="table-toolbar">
          <input
            type="text"
            placeholder="بحث بالاسم أو الكود أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>الكل</option>
            <option>فعّال</option>
            <option>معطّل</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>
            جاري تحميل الموردين...
          </p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>كود المورد</th>
                  <th>اسم المورد</th>
                  <th>الهاتف</th>
                  <th>عدد المنتجات</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span
                        style={{
                          background: 'var(--parchment, #f4eee7)',
                          border: '1px solid var(--line, #e2d7cb)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 12,
                          fontFamily: 'monospace'
                        }}
                      >
                        {s.supplier_code}
                      </span>
                    </td>
                    <td className="cell-name">
                      <strong>{s.name}</strong>
                      {s.notes && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 2 }}>
                          {s.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      {s.phone ? (
                        <a
                          href={`tel:${s.phone}`}
                          dir="ltr"
                          style={{ color: 'var(--accent)', textDecoration: 'none' }}
                        >
                          {s.phone}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{s.product_count || 0}</span> منتج
                    </td>
                    <td>
                      <span className={`status-pill ${s.is_active ? 'done' : 'cancelled'}`}>
                        {s.is_active ? 'فعّال' : 'معطّل'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => openEditModal(s)}
                          style={{ padding: '5px 10px', fontSize: 12 }}
                        >
                          تعديل
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleToggleStatus(s)}
                          style={{
                            padding: '5px 10px',
                            fontSize: 12,
                            color: s.is_active ? 'var(--clay)' : '#28a745'
                          }}
                        >
                          {s.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(s)}
                          style={{ padding: '5px 10px', fontSize: 12 }}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>
                      لا يوجد موردين مطابقين للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
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
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-dim)' }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{ background: '#fff0f0', color: '#c33', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="pf-field">
                <label>كود المورد * (فريد)</label>
                <input
                  type="text"
                  placeholder="مثال: SUP-A أو SUP-TURKEY"
                  value={form.supplier_code}
                  onChange={(e) => setForm({ ...form, supplier_code: e.target.value.toUpperCase() })}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                  يُستخدم كرمز تعريفي للمورد في النظام
                </span>
              </div>

              <div className="pf-field">
                <label>اسم المورد أو الشركة *</label>
                <input
                  type="text"
                  placeholder="مثال: مخزن أبو علي"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="pf-field">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>

              <div className="pf-field">
                <label>ملاحظات إضافية</label>
                <textarea
                  placeholder="تخصص المورد، أوقات التسليم، العنوان..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <input
                  type="checkbox"
                  id="sup-active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="sup-active" style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  المورد فعّال (يظهر في خيارات إضافة المنتجات)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-brass" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
