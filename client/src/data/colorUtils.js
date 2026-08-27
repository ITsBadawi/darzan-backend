// Lightens a #rrggbb hex color by mixing it with white. Used so the admin
// only has to pick one swatch color per variant, and the storefront's
// placeholder gradient photo is derived from it automatically.
export function lightenHex(hex, amount = 0.55) {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16)
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
