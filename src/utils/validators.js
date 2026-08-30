/**
 * Sanitizes user input string to prevent XSS / script injection attacks.
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Validate order input from the checkout page.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateOrder(body) {
  const errors = []

  if (!body.customer_name || body.customer_name.trim().length < 3) {
    errors.push('الاسم مطلوب (3 حروف على الأقل)')
  }

  if (!body.customer_phone || !/^0?7[0-9]{9}$/.test(body.customer_phone.trim())) {
    errors.push('رقم الهاتف غير صالح')
  }

  if (!body.province || body.province.trim().length === 0) {
    errors.push('المحافظة مطلوبة')
  }

  if (!body.address || body.address.trim().length < 5) {
    errors.push('العنوان مطلوب (5 حروف على الأقل)')
  }

  const total = typeof body.total === 'number' ? body.total : parseFloat(body.total)
  if (isNaN(total) || total <= 0) {
    errors.push('إجمالي السعر يجب أن يكون رقماً موجباً')
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('الطلب يجب أن يحتوي على منتج واحد على الأقل')
  }

  if (body.items) {
    for (const item of body.items) {
      const name = item.product_name || item.name
      const price = item.unit_price || item.price
      if (!name || !item.size || !item.qty || item.qty < 1 || !price || price <= 0) {
        errors.push('بيانات أحد المنتجات غير مكتملة أو غير صالحة')
        break
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate supplier input (for creating/updating suppliers).
 */
export function validateSupplier(body) {
  const errors = []

  if (!body.supplier_code || body.supplier_code.trim().length < 2) {
    errors.push('كود المورد مطلوب (حرفين على الأقل مثل SUP-A)')
  }

  if (!body.name || body.name.trim().length < 2) {
    errors.push('اسم المورد مطلوب')
  }

  if (body.phone && body.phone.trim() && !/^0?7[0-9]{9}$/.test(body.phone.trim().replace(/[- ]/g, ''))) {
    errors.push('رقم هاتف المورد غير صالح')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate product input from the admin panel (supports both camelCase and snake_case).
 */
export function validateProduct(body) {
  const errors = []

  if (!body.name || body.name.trim().length < 2) {
    errors.push('اسم المنتج مطلوب')
  }

  const cat = body.category || body.cat
  if (!cat) {
    errors.push('التصنيف مطلوب')
  }

  const calculatedPiece = body.price_piece !== undefined
    ? Number(body.price_piece)
    : (body.price_dozen !== undefined ? Math.round(Number(body.price_dozen) / 12) : undefined)

  const pMin = body.price_min !== undefined ? Number(body.price_min) : (body.priceMin !== undefined ? Number(body.priceMin) : calculatedPiece)
  if (pMin === undefined || isNaN(pMin) || pMin < 0) {
    errors.push('أقل سعر مطلوب')
  }

  const pMax = body.price_max !== undefined ? Number(body.price_max) : (body.priceMax !== undefined ? Number(body.priceMax) : pMin)
  if (pMax === undefined || isNaN(pMax) || pMax < 0) {
    errors.push('أعلى سعر مطلوب')
  }

  if (body.sale_type && !['both', 'dozen', 'piece'].includes(body.sale_type)) {
    errors.push('نوع البيع غير صالح (يجب أن يكون بالدرزن والقطعة، أو بالدرزن فقط، أو بالقطعة فقط)')
  }

  if (body.min_piece_qty !== undefined && Number(body.min_piece_qty) < 1) {
    errors.push('الحد الأدنى لطلب القطع يجب أن يكون 1 على الأقل')
  }

  if (body.min_dozen_qty !== undefined && Number(body.min_dozen_qty) < 1) {
    errors.push('الحد الأدنى لطلب الدرازن يجب أن يكون 1 على الأقل')
  }

  if (!Array.isArray(body.colors) || body.colors.length === 0) {
    errors.push('لون واحد على الأقل مطلوب')
  }

  const supplierId = body.supplier_id || body.supplierId
  if (!supplierId) {
    errors.push('تحديد المورد مطلوب')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Lightens a hex color — matching the frontend's colorUtils.js logic
 */
export function lightenHex(hex, amount = 0.55) {
  const clean = String(hex || '#000000').replace('#', '')
  const num = parseInt(
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean,
    16
  )
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const mix = (channel) => Math.round(channel + (255 - channel) * amount)
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

export function gradientForHex(hex) {
  return { g1: lightenHex(hex, 0.72), g2: lightenHex(hex, 0.55) }
}
