import { supabase, supabaseAdmin } from '../config/supabase.js'
import { generateOrderNumber } from '../utils/orderNumber.js'
import { validateOrder, sanitizeText } from '../utils/validators.js'
import { localStore } from '../db/localStore.js'
import { sendOrderNotification } from '../services/telegramService.js'

/**
 * POST /api/orders
 * Create a new order from the storefront checkout page.
 */
export async function createOrder(req, res, next) {
  try {
    const { valid, errors } = validateOrder(req.body)
    if (!valid) {
      return res.status(400).json({ error: 'بيانات الطلب غير مكتملة', details: errors })
    }

    const {
      customer_name,
      customer_phone,
      province,
      address,
      notes,
      items,
      total
    } = req.body

    const orderNumber = generateOrderNumber()
    const newOrderId = 'ord-' + Date.now()

    if (supabaseAdmin) {
      try {
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_name: sanitizeText(customer_name),
            customer_phone: sanitizeText(customer_phone),
            province: sanitizeText(province),
            address: sanitizeText(address),
            notes: notes ? sanitizeText(notes) : null,
            total,
            status: 'معلق'
          })
          .select()
          .single()

        if (!orderError && order) {
          const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.product_id || item.productId || null,
            sku_id: item.sku_id || null,
            product_name: item.product_name || item.name,
            color_name: item.color_name || item.colorName,
            color_hex: item.color_hex || item.colorHex,
            g1: item.g1,
            g2: item.g2,
            size: item.size,
            sku_code: item.sku_code || item.sku,
            qty: item.qty,
            unit_price: item.unit_price || item.price,
            unit_type: item.unit_type || item.unitType || 'piece',
            unit_name: item.unit_name || item.unitName || (item.unit_type === 'dozen' || item.unitType === 'dozen' ? 'درزن' : 'قطعة')
          }))

          await supabaseAdmin.from('order_items').insert(orderItems)

          // Send Telegram notification (fire-and-forget)
          sendOrderNotification({
            orderNumber: order.order_number,
            customerName: sanitizeText(customer_name),
            customerPhone: sanitizeText(customer_phone),
            province: sanitizeText(province),
            address: sanitizeText(address),
            notes: notes ? sanitizeText(notes) : '',
            total,
            items: orderItems.map((oi) => ({
              name: oi.product_name,
              colorName: oi.color_name,
              size: oi.size,
              sku: oi.sku_code,
              qty: oi.qty,
              price: oi.unit_price,
              unitType: oi.unit_type,
              unitName: oi.unit_name
            }))
          }).catch(() => { /* logged inside */ })

          return res.status(201).json({
            id: order.id,
            orderNumber: order.order_number,
            status: order.status,
            createdAt: order.created_at
          })
        }
      } catch (err) {
        console.warn('Supabase order insert warn:', err.message)
      }
    }

    // Local fallback order
    const localOrder = {
      id: newOrderId,
      orderNumber,
      customerName: sanitizeText(customer_name),
      customerPhone: sanitizeText(customer_phone),
      province: sanitizeText(province),
      address: sanitizeText(address),
      notes: notes ? sanitizeText(notes) : '',
      total,
      status: 'معلق',
      createdAt: new Date().toISOString(),
      items: items.map((item, idx) => ({
        lineId: `line-${newOrderId}-${idx}`,
        productId: item.product_id || item.productId || null,
        name: item.product_name || item.name,
        colorName: item.color_name || item.colorName,
        colorHex: item.color_hex || item.colorHex,
        g1: item.g1,
        g2: item.g2,
        size: item.size,
        sku: item.sku_code || item.sku,
        qty: item.qty,
        price: item.unit_price || item.price,
        unitType: item.unit_type || item.unitType || 'piece',
        unitName: item.unit_name || item.unitName || (item.unit_type === 'dozen' || item.unitType === 'dozen' ? 'درزن' : 'قطعة')
      }))
    }

    localStore.createOrder(localOrder)

    // Send Telegram notification (fire-and-forget)
    sendOrderNotification({
      orderNumber: localOrder.orderNumber,
      customerName: localOrder.customerName,
      customerPhone: localOrder.customerPhone,
      province: localOrder.province,
      address: localOrder.address,
      notes: localOrder.notes,
      total: localOrder.total,
      items: localOrder.items.map((li) => ({
        name: li.name,
        colorName: li.colorName,
        size: li.size,
        sku: li.sku,
        qty: li.qty,
        price: li.price,
        unitType: li.unitType,
        unitName: li.unitName
      }))
    }).catch(() => { /* logged inside */ })

    res.status(201).json({
      id: localOrder.id,
      orderNumber: localOrder.orderNumber,
      status: localOrder.status,
      createdAt: localOrder.createdAt
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/orders
 */
export async function listOrders(req, res, next) {
  try {
    const { status } = req.query

    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false })

        if (status && status !== 'الكل') {
          query = query.eq('status', status)
        }

        const { data, error } = await query
        if (!error && data && data.length > 0) {
          const orders = data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            province: o.province,
            address: o.address,
            notes: o.notes,
            total: o.total,
            status: o.status,
            createdAt: o.created_at,
            items: (o.order_items || []).map((i) => ({
              lineId: i.id,
              productId: i.product_id,
              name: i.product_name,
              colorName: i.color_name,
              colorHex: i.color_hex,
              g1: i.g1,
              g2: i.g2,
              size: i.size,
              sku: i.sku_code,
              qty: i.qty,
              price: i.unit_price
            }))
          }))
          return res.json(orders)
        }
      } catch {
        /* fallback */
      }
    }

    const localOrders = localStore.getOrders(status)
    res.json(localOrders)
  } catch (err) {
    try {
      res.json(localStore.getOrders(req.query.status))
    } catch {
      next(err)
    }
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['معلق', 'مؤكد', 'قيد التوصيل', 'مُسلّم', 'ملغى']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' })
    }

    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
      } catch {
        /* fallback */
      }
    }

    const updated = localStore.updateOrderStatus(id, status)
    res.json({ id, status: updated?.status || status })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/orders/:id
 */
export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('order_items').delete().eq('order_id', id)
        await supabaseAdmin.from('orders').delete().eq('id', id)
      } catch {
        /* fallback */
      }
    }
    localStore.deleteOrder(id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
