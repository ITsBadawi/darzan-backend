import { supabaseAdmin } from '../config/supabase.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics for the admin panel.
 */
export async function getDashboardStats(req, res, next) {
  try {
    if (supabaseAdmin) {
      const { count: productsCount } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (!ordersError && orders) {
        return res.json(calculateStats(productsCount || 0, orders))
      }
    }

    // Local fallback
    const products = localStore.getAllProductsAdmin()
    const orders = localStore.getOrders('الكل')
    res.json(calculateStats(products.length, orders))
  } catch (err) {
    try {
      const products = localStore.getAllProductsAdmin()
      const orders = localStore.getOrders('الكل')
      res.json(calculateStats(products.length, orders))
    } catch {
      next(err)
    }
  }
}

function calculateStats(productsCount, orders) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const pendingOrders = orders.filter((o) => o.status === 'معلق').length
  const completedOrders = orders.filter((o) => o.status === 'مُسلّم').length

  const ordersByStatus = {
    'معلق': 0,
    'مؤكد': 0,
    'قيد التوصيل': 0,
    'مُسلّم': 0,
    'ملغى': 0
  }
  orders.forEach((o) => {
    if (ordersByStatus[o.status] !== undefined) {
      ordersByStatus[o.status]++
    } else {
      ordersByStatus[o.status] = 1
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrdersArr = orders.filter((o) => new Date(o.created_at || Date.now()) >= today)
  const todayOrders = todayOrdersArr.length
  const todayRevenue = todayOrdersArr.reduce((sum, o) => sum + (o.total || 0), 0)

  const weekDays = [0, 1, 2, 3, 4, 5, 6]
  const ordersByDay = weekDays.map(() => 0)

  const topProducts = []
  const ordersByProvince = []

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber || o.order_number || 'DZN-001',
    customerName: o.customerName || o.customer_name || 'عميل',
    customerPhone: o.customerPhone || o.customer_phone || '0780000000',
    province: o.province || 'بغداد',
    address: o.address || '',
    notes: o.notes || '',
    total: o.total || 0,
    status: o.status || 'معلق',
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
    itemCount: (o.items || o.order_items || []).reduce((acc, i) => acc + (i.qty || 1), 0),
    itemsSummary: (o.items || o.order_items || []).map((i) => `${i.product_name || i.name || ''}`).join('، ')
  }))

  return {
    productsCount,
    totalOrders,
    totalRevenue,
    avgOrderValue,
    pendingOrders,
    completedOrders,
    todayOrders,
    todayRevenue,
    ordersByDay,
    ordersByStatus,
    ordersByProvince,
    topProducts,
    recentOrders
  }
}
