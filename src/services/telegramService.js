/**
 * Telegram Bot Notification Service
 * Sends order notifications to a Telegram channel/group via the Bot API.
 *
 * Required environment variables:
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — channel/group chat ID (negative number)
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

/**
 * Send a new-order notification to the Telegram channel.
 * This is fire-and-forget — failures are logged but never block the order flow.
 *
 * @param {Object} order
 * @param {string} order.orderNumber
 * @param {string} order.customerName
 * @param {string} order.customerPhone
 * @param {string} order.province
 * @param {string} order.address
 * @param {string} [order.notes]
 * @param {number} order.total
 * @param {Array}  order.items — [{ name, colorName, size, sku, qty, price, supplierName, supplierCode }]
 */
export function formatOrderMessage(order) {
  const itemsText = order.items
    .map((item, i) => {
      const name = item.name || item.product_name || 'منتج'
      const color = item.colorName || item.color_name || ''
      const size = item.size || ''
      const sku = item.sku || item.sku_code || ''
      const qty = item.qty || 1
      const lineTotal = ((item.price || item.unit_price || 0) * qty).toLocaleString('ar-IQ')

      let line = `${i + 1}. <b>${name}</b>`
      if (color) line += ` — ${color}`
      if (size) line += ` — ${size}`
      if (sku) line += ` <code>(${sku})</code>`
      const isDozen = item.unit_type === 'dozen' || item.unitType === 'dozen'
      const unitName = item.unit_name || item.unitName || (isDozen ? 'درزن' : 'قطعة')
      const unitSuffix = isDozen ? ` (${qty * 12} قطعة)` : ''
      line += `\n   الكمية: ${qty} ${unitName}${unitSuffix} · السعر: ${lineTotal} د.ع`
      return line
    })
    .join('\n\n')

  const totalFormatted = (order.total || 0).toLocaleString('ar-IQ')

  let message = `📦 <b>طلب جديد #${order.orderNumber || order.order_number}</b>\n`
  message += `━━━━━━━━━━━━━━━━━━━\n\n`
  message += `👤 <b>الاسم:</b> ${order.customerName || order.customer_name}\n`
  message += `📱 <b>الرقم:</b> ${order.customerPhone || order.customer_phone}\n`
  message += `🏠 <b>المحافظة:</b> ${order.province}\n`
  message += `📍 <b>العنوان:</b> ${order.address}\n`
  if (order.notes) {
    message += `📝 <b>ملاحظات:</b> ${order.notes}\n`
  }
  message += `\n━━━━━━━━━━━━━━━━━━━\n`
  message += `🛍️ <b>المنتجات:</b>\n\n`
  message += itemsText
  message += `\n\n━━━━━━━━━━━━━━━━━━━\n`
  message += `💵 <b>الإجمالي: ${totalFormatted} د.ع</b>\n`
  message += `🕐 ${new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' })}`

  return message
}

export async function sendOrderNotification(order) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️ [Telegram] BOT_TOKEN or CHAT_ID not configured — skipping notification.')
    return
  }

  try {
    const message = formatOrderMessage(order)
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()

    if (result.ok) {
      console.log(`✅ [Telegram] Order #${order.orderNumber} notification sent successfully.`)
    } else {
      console.error(`❌ [Telegram] Failed to send notification:`, result.description)
    }
  } catch (err) {
    console.error(`❌ [Telegram] Error sending notification:`, err.message)
  }
}
