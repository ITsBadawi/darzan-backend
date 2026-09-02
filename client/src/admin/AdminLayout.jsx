import { useState } from 'react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '../store/useAdminAuthStore.js'
import './admin.css'

const NAV = [
  { to: '/admin', label: 'لوحة التحكم', end: true, icon: DashboardIcon },
  { to: '/admin/categories', label: 'التصنيفات', icon: GridIcon, adminOnly: true },
  { to: '/admin/suppliers', label: 'الموردين', icon: SupplierIcon },
  { to: '/admin/products', label: 'المنتجات', icon: BoxIcon },
  { to: '/admin/orders', label: 'الطلبات', icon: ListIcon, adminOnly: true },
  { to: '/admin/settings', label: 'الإعدادات', icon: GearIcon, adminOnly: true }
]

function DashboardIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg> }
function GridIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg> }
function SupplierIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> }
function BoxIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg> }
function ListIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg> }
function GearIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" /></svg> }
function MenuIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg> }

export default function AdminLayout() {
  const user = useAdminAuthStore((s) => s.user)
  const logout = useAdminAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/admin/login" replace />

  const visibleNav = NAV.filter((item) => !item.adminOnly || user.role === 'admin')

  return (
    <div className="admin-shell" dir="rtl">
      <header className="admin-topbar">
        <div className="admin-topbar-start">
          <button className="admin-menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة">
            <MenuIcon width={22} height={22} />
          </button>
          <span className="name display">درازن — الإدارة</span>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-topbar-link">
          المتجر ↗
        </a>
      </header>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <span className="name display">درازن</span>
              <span className="label">لوحة التحكم الإدارية</span>
            </div>
            <button className="admin-sidebar-close" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">
              ✕
            </button>
          </div>
        </div>

        <nav className="admin-nav">
          {visibleNav.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-user">
          <div className="user-info">
            <div className="who">{user.name}</div>
            <div className="role">{user.role === 'admin' ? 'صلاحية كاملة (مدير)' : 'إدارة المنتجات والموردين'}</div>
          </div>
          <button className="admin-logout-btn" onClick={logout}>تسجيل خروج</button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
