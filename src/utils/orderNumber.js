/**
 * Generate a unique order number in format DZN-XXXXXX
 * Uses timestamp + random suffix for uniqueness.
 */
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase().slice(-4)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `DZN-${ts}${rand}`
}
