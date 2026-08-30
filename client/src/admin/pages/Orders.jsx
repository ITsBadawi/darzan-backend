import { Fragment, useEffect, useState } from 'react'
import { useOrdersStore, ORDER_STATUSES } from '../../store/useOrdersStore.js'

const STATUS_CLASS = {
  'معلق': 'pending',
  'مؤكد': 'active',
  'قيد التوصيل': 'active',
  'مُسلّم': 'done',
  'ملغى': 'cancelled'
}

function generateInvoiceHTML(order) {
  const itemsRows = order.items.map((it) => {
    const unitName = it.unitName || (it.unitType === 'dozen' ? 'درزن' : 'قطعة')
    const unitExtra = it.unitType === 'dozen' ? ` (${it.qty * 12} قطعة)` : ''
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px">
        <strong>${it.name}</strong>
        ${(it.sku || it.sku_code) ? `<br><span style="font-size:11px;color:#777;font-family:monospace">SKU: ${it.sku || it.sku_code}</span>` : ''}
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${it.colorName || '-'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${it.size || '-'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:center"><strong>${it.qty}</strong> ${unitName}${unitExtra}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:left">${(it.price || 0).toLocaleString('ar')} د.ع</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:left;font-weight:600">${((it.price || 0) * (it.qty || 0)).toLocaleString('ar')} د.ع</td>
    </tr>`
  }).join('')

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <title>فاتورة طلب ${order.orderNumber}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; padding:40px; color:#1a1a1a; direction:rtl; }
      .invoice-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; border-bottom:3px solid #8B2E1F; padding-bottom:20px }
      .brand { font-size:28px; font-weight:800; color:#8B2E1F; letter-spacing:1px }
      .brand-sub { font-size:11px; color:#888; margin-top:4px }
      .invoice-meta { text-align:left; font-size:13px; color:#555; }
      .invoice-meta strong { color:#1a1a1a }
      .section { margin-bottom:24px }
      .section-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#888; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:6px }
      .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:13px }
      .info-grid span { color:#555 }
      .info-grid strong { color:#1a1a1a }
      table { width:100%; border-collapse:collapse; margin-top:8px }
      thead { background:#f5f0ec }
      th { padding:10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8B2E1F; text-align:right }
      .total-row { font-size:18px; font-weight:800; text-align:left; padding:16px 10px; color:#8B2E1F; border-top:2px solid #8B2E1F }
      .footer { margin-top:40px; text-align:center; font-size:11px; color:#aaa; border-top:1px solid #eee; padding-top:16px }
      @media print { body { padding:20px } .no-print { display:none } }
    </style>
  </head>
  <body>
    <div class="invoice-header">
      <div>
        <div class="brand">DARZAN</div>
        <div class="brand-sub">درازن — ملابس جملة</div>
      </div>
      <div class="invoice-meta">
        <div><strong>رقم الطلب:</strong> ${order.orderNumber}</div>
        <div><strong>التاريخ:</strong> ${new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('ar-IQ')}</div>
        <div><strong>الحالة:</strong> ${order.status}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">بيانات الزبون</div>
      <div class="info-grid">
        <div><span>الاسم:</span> <strong>${order.customerName}</strong></div>
        <div><span>الهاتف:</span> <strong>${order.customerPhone}</strong></div>
        <div><span>المحافظة:</span> <strong>${order.province}</strong></div>
        <div><span>العنوان:</span> <strong>${order.address}</strong></div>
      </div>
      ${order.notes ? `<div style="margin-top:8px;font-size:12px;color:#777"><strong>ملاحظات:</strong> ${order.notes}</div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">تفاصيل الطلب</div>
      <table>
        <thead>
          <tr><th>المنتج</th><th style="text-align:center">اللون</th><th style="text-align:center">المقاس</th><th style="text-align:center">الكمية</th><th style="text-align:left">السعر</th><th style="text-align:left">المجموع</th></tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr><td colspan="5" class="total-row" style="text-align:right">الإجمالي الكلي</td><td class="total-row">${(order.total || 0).toLocaleString('ar')} د.ع</td></tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      DARZAN — درازن لتجارة الملابس بالجملة — شكراً لتعاملكم معنا
    </div>

    <script>window.onload = function(){ window.print() }</script>
  </body>
  </html>`
}

function printInvoice(order) {
  const w = window.open('', '_blank', 'width=800,height=1000')
  if (!w) return alert('يرجى السماح بفتح نوافذ منبثقة لطباعة الفاتورة')
  w.document.write(generateInvoiceHTML(order))
  w.document.close()
}

function exportOrdersCSV(orders) {
  const BOM = '\uFEFF'
  const header = ['رقم الطلب', 'الزبون', 'الهاتف', 'المحافظة', 'العنوان', 'الحالة', 'الإجمالي', 'ملاحظات', 'المنتجات']
  const rows = orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.customerPhone,
    o.province,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    o.status,
    o.total,
    `"${(o.notes || '').replace(/"/g, '""')}"`,
    `"${o.items.map((it) => `${it.name} ${it.colorName || ''} ${it.size || ''} x${it.qty}`).join(' | ').replace(/"/g, '""')}"`
  ])

  const csv = BOM + [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `darzan-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Orders() {
  const orders = useOrdersStore((s) => s.orders)
  const loading = useOrdersStore((s) => s.loading)
  const fetchOrders = useOrdersStore((s) => s.fetchOrders)
  const updateStatus = useOrdersStore((s) => s.updateStatus)
  const [openId, setOpenId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('الكل')

  useEffect(() => {
    fetchOrders(statusFilter)
  }, [fetchOrders, statusFilter])

  const filtered = statusFilter === 'الكل' ? orders : orders.filter((o) => o.status === statusFilter)

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">الطلبات</h1>
          <p>{orders.length} طلب مسجّل — كل طلب يصل من صفحة الدفع بالمتجر</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => exportOrdersCSV(filtered)} title="تصدير CSV">
            📊 تصدير CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>الكل</option>
            {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>جاري تحميل الطلبات...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>لا توجد طلبات بعد — الطلبات التي تُرسل من صفحة الدفع بالمتجر ستظهر هنا.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>رقم الطلب</th><th>الزبون</th><th>المحافظة</th><th>الإجمالي</th><th>الحالة</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <Fragment key={o.id}>
                    <tr>
                      <td className="cell-name">{o.orderNumber}</td>
                      <td>{o.customerName}</td>
                      <td>{o.province}</td>
                      <td>{o.total.toLocaleString('ar')} د.ع</td>
                      <td><span className={`status-pill ${STATUS_CLASS[o.status] || 'pending'}`}>{o.status}</span></td>
                      <td>
                        <button className="btn btn-ghost" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                          {openId === o.id ? 'إخفاء' : 'عرض'}
                        </button>
                      </td>
                    </tr>
                    {openId === o.id && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--parchment)', whiteSpace: 'normal' }}>
                          <div style={{ padding: '10px 4px' }}>
                            <strong>العنوان:</strong> {o.address}<br />
                            <strong>الهاتف:</strong> {o.customerPhone}<br />
                            {o.notes && <><strong>ملاحظات:</strong> {o.notes}<br /></>}
                            <div style={{ marginTop: 10 }}>
                              {o.items.map((it) => {
                                const unitName = it.unitName || (it.unitType === 'dozen' ? 'درزن' : 'قطعة')
                                const unitExtra = it.unitType === 'dozen' ? ` (${it.qty * 12} قطعة)` : ''
                                return (
                                  <div key={it.lineId || it.id} style={{ fontSize: 12.5, marginBottom: 6 }}>
                                    <strong>{it.name}</strong> — {it.colorName} / {it.size} × <strong>{it.qty} {unitName}{unitExtra}</strong> = {((it.price || it.unit_price || 0) * it.qty).toLocaleString('ar')} د.ع
                                    {(it.sku || it.sku_code) && (
                                      <span style={{ marginRight: 8, fontSize: 11, fontFamily: 'monospace', color: 'var(--text-dim)', background: '#eee', padding: '1px 5px', borderRadius: 4 }}>
                                        {it.sku || it.sku_code}
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <label style={{ fontSize: 12.5, fontWeight: 600 }}>تغيير الحالة:</label>
                              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                              </select>
                              <button className="btn btn-ghost" onClick={() => printInvoice(o)} style={{ marginRight: 8 }}>
                                🖨️ طباعة فاتورة
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
