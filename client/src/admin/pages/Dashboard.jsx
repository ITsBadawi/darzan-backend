import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api.js'

const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const ORDER_STATUSES = ['معلق', 'مؤكد', 'قيد التوصيل', 'مُسلّم', 'ملغى']

const STATUS_CLASS = {
  'معلق': 'pending',
  'مؤكد': 'active',
  'قيد التوصيل': 'active',
  'مُسلّم': 'done',
  'ملغى': 'cancelled'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const loadData = () => {
    setLoading(true)
    api.getDashboard()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Dashboard error:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await api.updateOrderStatus(orderId, newStatus)
      // Reload stats to reflect live updates
      const updated = await api.getDashboard()
      setStats(updated)
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الحالة: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && !stats) {
    return (
      <div className="admin-page-head">
        <div>
          <h1 className="display">لوحة التحكم</h1>
          <p>جاري تحميل تحليلات ومؤشرات المنصة...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="admin-page-head">
        <div>
          <h1 className="display">لوحة التحكم</h1>
          <p>حدث خطأ في تحميل البيانات — يرجى التأكد من تشغيل الخادم وتجديد الصفحة.</p>
          <button className="btn btn-brass" onClick={loadData} style={{ marginTop: 12 }}>إعادة المحاولة</button>
        </div>
      </div>
    )
  }

  const {
    productsCount = 0,
    totalOrders = 0,
    totalRevenue = 0,
    avgOrderValue = 0,
    pendingOrders = 0,
    completedOrders = 0,
    todayOrders = 0,
    todayRevenue = 0,
    ordersByDay = [0,0,0,0,0,0,0],
    ordersByStatus = {},
    ordersByProvince = [],
    topProducts = [],
    recentOrders = []
  } = stats

  const maxCount = Math.max(1, ...ordersByDay)
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="display">لوحة التحكم الإدارية</h1>
          <p>نظرة عامة وشاملة على أداء المتجر والمبيعات والطلبات الواردة</p>
        </div>
        <button className="btn btn-ghost" onClick={loadData} disabled={loading}>
          {loading ? 'جاري التحديث...' : '🔄 تحديث البيانات'}
        </button>
      </div>

      {/* Quick Action Toolbar */}
      <div className="dash-actions-bar">
        <span className="dash-actions-title">إجراءات سريعة:</span>
        <Link to="/admin/products/new" className="dash-action-btn">
          ➕ إضافة منتج جديد
        </Link>
        <Link to="/admin/categories" className="dash-action-btn">
          🏷️ إدارة التصنيفات والأقسام
        </Link>
        <Link to="/admin/orders" className="dash-action-btn">
          📦 إدارة الطلبات ({pendingOrders} معلّق)
        </Link>
        <Link to="/" target="_blank" className="dash-action-btn">
          👁️ تصفح المتجر كزبون
        </Link>
        <Link to="/admin/settings" className="dash-action-btn">
          ⚙️ إعدادات البنرات والواتساب
        </Link>
      </div>

      {/* Rich KPI Stat Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="label">إجمالي المبيعات</span>
            <div className="icon-box">💰</div>
          </div>
          <div className="value">{totalRevenue.toLocaleString('ar')} <span style={{ fontSize: 13, fontStyle: 'normal' }}>د.ع</span></div>
          <div className="sub">اليوم: {todayRevenue.toLocaleString('ar')} د.ع</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="label">متوسط قيمة الطلب</span>
            <div className="icon-box">📊</div>
          </div>
          <div className="value">{avgOrderValue.toLocaleString('ar')} <span style={{ fontSize: 13, fontStyle: 'normal' }}>د.ع</span></div>
          <div className="sub">حساب متوسط السلة</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="label">إجمالي الطلبات</span>
            <div className="icon-box">🛍️</div>
          </div>
          <div className="value">{totalOrders}</div>
          <div className="sub">{todayOrders} طلب جديد اليوم</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="label">طلبات معلّقة</span>
            <div className="icon-box">⏳</div>
          </div>
          <div className="value" style={{ color: pendingOrders > 0 ? '#d97706' : 'inherit' }}>{pendingOrders}</div>
          <div className={`sub ${pendingOrders > 0 ? 'alert' : ''}`}>
            {pendingOrders > 0 ? 'تتطلب تأكيد فوري' : 'جميع الطلبات معالجة'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="label">الطلبات المكتملة</span>
            <div className="icon-box">✅</div>
          </div>
          <div className="value">{completedOrders}</div>
          <div className="sub success">نسبة الإكمال: {completionRate}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="label">المنتجات النشطة</span>
            <div className="icon-box">👗</div>
          </div>
          <div className="value">{productsCount}</div>
          <div className="sub">متوفرة بالمتجر</div>
        </div>
      </div>

      {/* Order Status Breakdown Widget */}
      <div className="admin-card">
        <div className="card-head">
          <h3>حالة الطلبات الإجمالية</h3>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>توزيع الحالات للطلبات الكلية</span>
        </div>

        <div className="status-dist-bar">
          {totalOrders > 0 ? (
            <>
              <div className="status-dist-seg pending" style={{ width: `${((ordersByStatus['معلق'] || 0) / totalOrders) * 100}%` }} title="معلق" />
              <div className="status-dist-seg confirmed" style={{ width: `${((ordersByStatus['مؤكد'] || 0) / totalOrders) * 100}%` }} title="مؤكد" />
              <div className="status-dist-seg transit" style={{ width: `${((ordersByStatus['قيد التوصيل'] || 0) / totalOrders) * 100}%` }} title="قيد التوصيل" />
              <div className="status-dist-seg delivered" style={{ width: `${((ordersByStatus['مُسلّم'] || 0) / totalOrders) * 100}%` }} title="مُسلّم" />
              <div className="status-dist-seg cancelled" style={{ width: `${((ordersByStatus['ملغى'] || 0) / totalOrders) * 100}%` }} title="ملغى" />
            </>
          ) : (
            <div className="status-dist-seg" style={{ width: '100%', background: '#eee' }} />
          )}
        </div>

        <div className="status-legend-grid">
          <div className="status-legend-item"><span className="status-dot pending" /> معلق: {ordersByStatus['معلق'] || 0}</div>
          <div className="status-legend-item"><span className="status-dot confirmed" /> مؤكد: {ordersByStatus['مؤكد'] || 0}</div>
          <div className="status-legend-item"><span className="status-dot transit" /> قيد التوصيل: {ordersByStatus['قيد التوصيل'] || 0}</div>
          <div className="status-legend-item"><span className="status-dot delivered" /> مُسلّم: {ordersByStatus['مُسلّم'] || 0}</div>
          <div className="status-legend-item"><span className="status-dot cancelled" /> ملغى: {ordersByStatus['ملغى'] || 0}</div>
        </div>
      </div>

      {/* Live Recent Orders Widget */}
      <div className="admin-card">
        <div className="card-head">
          <h3>أحدث الطلبات الواردة (معالجة سريعة)</h3>
          <Link to="/admin/orders" style={{ fontSize: 12.5, color: 'var(--brass-deep)', fontWeight: 600 }}>عرض جميع الطلبات ←</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 20 }}>لا توجد طلبات واردة بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الزبون</th>
                  <th>المحافظة</th>
                  <th>الملخص</th>
                  <th>الإجمالي</th>
                  <th>الحالة الحالية</th>
                  <th>تحديث سريع</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-name">{o.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{o.customerPhone}</div>
                    </td>
                    <td>{o.province}</td>
                    <td style={{ fontSize: 11.5, color: 'var(--text-dim)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.itemsSummary || `${o.itemCount} قطع`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.total.toLocaleString('ar')} د.ع</td>
                    <td>
                      <span className={`status-pill ${STATUS_CLASS[o.status] || 'pending'}`}>{o.status}</span>
                    </td>
                    <td>
                      <select
                        className="select-status-inline"
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Grid: Charts & Rankings */}
      <div className="dash-grid-2">
        <div className="admin-card">
          <div className="card-head">
            <h3>نشاط الطلبات الأسبوعي</h3>
            <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>أيام الأسبوع (آخر 30 يوم)</span>
          </div>
          <div className="bar-chart">
            {WEEK_DAYS.map((day, i) => (
              <div className="bar-col" key={day}>
                <div className="bar-val">{ordersByDay[i] || 0}</div>
                <div className="bar" style={{ height: `${(ordersByDay[i] / maxCount) * 100}%`, minHeight: ordersByDay[i] ? 8 : 4 }} />
                <div className="day">{day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="card-head">
            <h3>المحافظات الأكثر طلباً</h3>
            <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>أعلى المناطق شراءً</span>
          </div>

          <div className="prov-list">
            {ordersByProvince.map((p, i) => (
              <div className="prov-item" key={i}>
                <span className="prov-name">{i + 1}. {p.province}</span>
                <span className="prov-badge">{p.count} طلب ({p.total.toLocaleString('ar')} د.ع)</span>
              </div>
            ))}
            {ordersByProvince.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 15 }}>لا توجد بيانات مناطق كافية بعد.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="admin-card">
        <div className="card-head">
          <h3>المنتجات الأكثر مبيعاً</h3>
          <Link to="/admin/products" style={{ fontSize: 12.5, color: 'var(--brass-deep)', fontWeight: 600 }}>إدارة كافة المنتجات ←</Link>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>عدد القطع المباعة</th>
                <th>إجمالي إيراد المنتج</th>
              </tr>
            </thead>
            <tbody>
              {(topProducts || []).map((p, i) => (
                <tr key={i}>
                  <td><strong>{i + 1}</strong></td>
                  <td className="cell-name">{p.name}</td>
                  <td>{p.qty} قطعة</td>
                  <td style={{ fontWeight: 600 }}>{(p.revenue || 0).toLocaleString('ar')} د.ع</td>
                </tr>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 20 }}>لا توجد إحصائيات مبيعات بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

