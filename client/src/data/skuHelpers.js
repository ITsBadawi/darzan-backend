import { SIZES } from './products.js'

// Deterministic pseudo-random generator so demo stock numbers stay stable
// across re-renders instead of jumping around on every load.
function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0
    return h / 4294967296
  }
}

// Builds the color x size SKU matrix for a product. In the real backend
// this table comes straight from the `product_skus` table — this demo
// version fabricates realistic-looking stock/price numbers so the color
// & size selector on the product page has something real to filter on.
export function buildSkuMatrix(product) {
  const rand = seededRandom(product.id)
  const matrix = {}
  product.colors.forEach((color) => {
    SIZES.forEach((size, i) => {
      const key = `${color.code}-${size}`
      const inStock = rand() > 0.22
      const spread = Math.max(0, product.priceMax - product.priceMin)
      const priceBump = i >= 4 ? (spread > 0 ? Math.round(spread * 0.4) : 0) : 0
      matrix[key] = {
        price: product.priceMin + priceBump,
        stock: inStock ? Math.ceil(rand() * 15) : 0,
        sku: `DZN-${product.id.toUpperCase()}-${color.code}-${size}`
      }
    })
  })
  return matrix
}

export function colorHasStock(matrix, colorCode) {
  return SIZES.some((size) => (matrix[`${colorCode}-${size}`]?.stock ?? 0) > 0)
}

export function sizeAvailableForColor(matrix, colorCode, size) {
  return (matrix[`${colorCode}-${size}`]?.stock ?? 0) > 0
}

export function sizeHasAnyColor(matrix, colors, size) {
  return colors.some((c) => sizeAvailableForColor(matrix, c.code, size))
}
