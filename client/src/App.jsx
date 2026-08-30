import { Component, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import Home from './pages/Home.jsx'

// Lazy loaded routes
const Product = lazy(() => import('./pages/Product.jsx'))
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))

// Lazy loaded Admin section
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const AdminOnly = lazy(() => import('./admin/AdminOnly.jsx'))
const AdminLogin = lazy(() => import('./admin/pages/Login.jsx'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard.jsx'))
const AdminCategories = lazy(() => import('./admin/pages/Categories.jsx'))
const AdminSuppliers = lazy(() => import('./admin/pages/Suppliers.jsx'))
const AdminProductsList = lazy(() => import('./admin/pages/ProductsList.jsx'))
const AdminProductForm = lazy(() => import('./admin/pages/ProductForm.jsx'))
const AdminOrders = lazy(() => import('./admin/pages/Orders.jsx'))
const AdminSettings = lazy(() => import('./admin/pages/Settings.jsx'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 420 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#141414' }}>
              عذراً، حدث خطأ أثناء التحميل
            </h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#8B2942',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              إعادة التحميل ↻
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function PageFallback() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'var(--text-dim, #888)', fontSize: 14 }}>
      جاري التحميل...
    </div>
  )
}

function StorefrontLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* customer-facing storefront */}
          <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
          <Route path="/product/:id" element={<StorefrontLayout><Product /></StorefrontLayout>} />
          <Route path="/catalog" element={<StorefrontLayout><Catalog /></StorefrontLayout>} />
          <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
          <Route path="/favorites" element={<StorefrontLayout><Favorites /></StorefrontLayout>} />
          <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />

          {/* admin panel */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminOnly><AdminCategories /></AdminOnly>} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="products" element={<AdminProductsList />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOnly><AdminOrders /></AdminOnly>} />
            <Route path="settings" element={<AdminOnly><AdminSettings /></AdminOnly>} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
