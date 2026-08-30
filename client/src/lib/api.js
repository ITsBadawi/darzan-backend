// ─── Darzan API Client ─────────────────────────────────────
// Centralized HTTP client for communicating with the backend.
// All stores and pages use this instead of direct fetch calls.

function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL
  // If an external production API URL is explicitly configured (not localhost), use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '')
  }
  // In production (unified fullstack deployment), use same-origin relative URLs
  if (import.meta.env.PROD) {
    return ''
  }
  if (typeof window !== 'undefined') {
    // In local dev, default to port 3001 on current hostname (supports LAN / mobile testing)
    const hostname = window.location.hostname || 'localhost'
    return `http://${hostname}:3001`
  }
  return 'http://localhost:3001'
}

const API_BASE = getApiBase()

/**
 * Get the stored auth token from localStorage.
 */
function getToken() {
  try {
    const raw = localStorage.getItem('darzan_admin_auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token || null
  } catch {
    return null
  }
}

/**
 * Core request helper — handles JSON, auth headers, and error responses.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const headers = {
    ...(options.headers || {})
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Attach auth token if available
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers
  })

  // Handle 401 — token expired
  if (res.status === 401) {
    // Try to refresh token
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${getToken()}`
      const retryRes = await fetch(url, { ...options, headers })
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: 'خطأ غير متوقع' }))
        throw new ApiError(retryRes.status, err.error || 'خطأ في الطلب', err.details)
      }
      return retryRes.json()
    }

    // Refresh failed — clear auth and redirect to login
    localStorage.removeItem('darzan_admin_auth')
    throw new ApiError(401, 'انتهت الجلسة — يرجى تسجيل الدخول مرة أخرى')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'خطأ غير متوقع' }))
    throw new ApiError(res.status, err.error || 'خطأ في الطلب', err.details)
  }

  // Handle 204 No Content
  if (res.status === 204) return null

  return res.json()
}

/**
 * Try to refresh the access token using the stored refresh token.
 */
async function tryRefreshToken() {
  try {
    const raw = localStorage.getItem('darzan_admin_auth')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    const refreshToken = parsed?.state?.refreshToken
    if (!refreshToken) return false

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!res.ok) return false

    const data = await res.json()

    // Update stored tokens
    parsed.state.token = data.token
    parsed.state.refreshToken = data.refreshToken
    localStorage.setItem('darzan_admin_auth', JSON.stringify(parsed))

    return true
  } catch {
    return false
  }
}

/**
 * Custom error class for API responses.
 */
class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

// ─── Public API ──────────────────────────────────────────────

export const api = {
  // ─── Products (Public) ─────────────────────────────────
  getProducts: (category) => {
    const params = category && category !== 'الكل' ? `?category=${encodeURIComponent(category)}` : ''
    return request(`/api/products${params}`)
  },

  getProduct: (id) => request(`/api/products/${id}`),

  getCategories: () => request('/api/products/categories'),

  // ─── Suppliers (Public / General) ──────────────────────
  getSuppliers: (onlyActive = false) => {
    const params = onlyActive ? '?active=true' : ''
    return request(`/api/suppliers${params}`)
  },

  getSupplier: (id) => request(`/api/suppliers/${id}`),

  // ─── Orders (Public) ──────────────────────────────────
  createOrder: (orderData) =>
    request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  // ─── Settings (Public) ────────────────────────────────
  getPublicSettings: () => request('/api/settings/public'),

  // ─── Auth ─────────────────────────────────────────────
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),

  getMe: () => request('/api/auth/me'),

  // ─── Admin: Dashboard ─────────────────────────────────
  getDashboard: () => request('/api/admin/dashboard'),

  // ─── Admin: Suppliers ─────────────────────────────────
  getAdminSuppliers: (onlyActive = false) => {
    const params = onlyActive ? '?active=true' : ''
    return request(`/api/admin/suppliers${params}`)
  },

  createSupplier: (data) =>
    request('/api/admin/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateSupplier: (id, data) =>
    request(`/api/admin/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteSupplier: (id) =>
    request(`/api/admin/suppliers/${id}`, { method: 'DELETE' }),

  // ─── Admin: Orders ────────────────────────────────────
  getOrders: (status) => {
    const params = status && status !== 'الكل' ? `?status=${encodeURIComponent(status)}` : ''
    return request(`/api/admin/orders${params}`)
  },

  updateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  deleteOrder: (id) =>
    request(`/api/admin/orders/${id}`, { method: 'DELETE' }),

  // ─── Admin: Products ──────────────────────────────────
  getAdminProducts: (supplierId) => {
    const params = supplierId && supplierId !== 'الكل' ? `?supplier_id=${encodeURIComponent(supplierId)}` : ''
    return request(`/api/admin/products${params}`)
  },

  createProduct: (data) =>
    request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProduct: (id, data) =>
    request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id, hard = false) =>
    request(`/api/admin/products/${id}?hard=${hard}`, { method: 'DELETE' }),

  // ─── Admin: Settings ──────────────────────────────────
  getSettings: () => request('/api/admin/settings'),

  updateSettings: (data) =>
    request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // ─── Upload ───────────────────────────────────────────
  uploadProductImage: (productId, colorId, file) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('product_id', productId)
    if (colorId) formData.append('color_id', colorId)

    return request('/api/upload/product-image', {
      method: 'POST',
      body: formData
    })
  },

  deleteProductImage: (id) =>
    request(`/api/upload/product-image/${id}`, { method: 'DELETE' }),

  // ─── Health ───────────────────────────────────────────
  health: () => request('/api/health')
}

export { ApiError }
export default api
