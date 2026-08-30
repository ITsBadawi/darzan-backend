import { supabase } from '../config/supabase.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/products
 * Returns all active products with their colors and SKUs.
 * Supports ?category= filter.
 */
export async function listProducts(req, res, next) {
  try {
    const { category } = req.query

    if (supabase) {
      let query = supabase
        .from('products')
        .select(`
          *,
          suppliers (
            id, name, supplier_code, phone
          ),
          product_colors (
            id, code, name, hex, g1, g2, sort_order
          ),
          product_skus (
            id, color_id, size, sku_code, price, stock, is_available
          ),
          product_images (
            id, color_id, url, sort_order
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category && category !== 'الكل') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        const products = data.map(transformProduct)
        return res.json(products)
      }
    }

    // Fallback to local store
    const products = localStore.getProducts(category)
    res.json(products)
  } catch (err) {
    try {
      const products = localStore.getProducts(req.query.category)
      res.json(products)
    } catch {
      next(err)
    }
  }
}

/**
 * GET /api/products/:id
 * Returns a single product with all details.
 */
export async function getProduct(req, res, next) {
  try {
    const { id } = req.params

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          suppliers (
            id, name, supplier_code, phone
          ),
          product_colors (
            id, code, name, hex, g1, g2, sort_order
          ),
          product_skus (
            id, color_id, size, sku_code, price, stock, is_available
          ),
          product_images (
            id, color_id, url, sort_order
          )
        `)
        .eq('id', id)
        .single()

      if (!error && data) {
        return res.json(transformProduct(data))
      }
    }

    const prod = localStore.getProductById(id)
    if (prod) return res.json(prod)

    res.status(404).json({ error: 'المنتج غير موجود' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/products/categories
 * Returns distinct categories from active products.
 */
export async function listCategories(_req, res, next) {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)

      if (!error && data && data.length > 0) {
        const categories = ['الكل', ...new Set(data.map((p) => p.category))]
        return res.json(categories)
      }
    }

    const categories = ['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']
    res.json(categories)
  } catch (err) {
    res.json(['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي'])
  }
}

/**
 * Transform a DB product row into the shape the frontend expects.
 */
export function transformProduct(row) {
  const colors = (row.product_colors || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      hex: c.hex,
      g1: c.g1,
      g2: c.g2
    }))

  const skuMatrix = {}
  for (const sku of row.product_skus || []) {
    const color = colors.find((c) => c.id === sku.color_id)
    if (!color) continue
    const key = `${color.code}-${sku.size}`
    skuMatrix[key] = {
      id: sku.id,
      price: sku.price,
      stock: sku.stock,
      sku: sku.sku_code,
      available: sku.is_available
    }
  }

  const images = {}
  for (const img of row.product_images || []) {
    const colorId = img.color_id || 'default'
    if (!images[colorId]) images[colorId] = []
    images[colorId].push({ url: img.url, sort_order: img.sort_order })
  }

  return {
    id: row.id,
    product_number: row.product_number,
    supplier_id: row.supplier_id,
    supplier: row.suppliers ? {
      id: row.suppliers.id,
      name: row.suppliers.name,
      supplier_code: row.suppliers.supplier_code,
      phone: row.suppliers.phone
    } : null,
    name: row.name,
    cat: row.category,
    description: row.description,
    priceMin: row.price_min,
    priceMax: row.price_max,
    price_min: row.price_min,
    price_max: row.price_max,
    sale_type: row.sale_type || 'both',
    saleType: row.sale_type || 'both',
    price_piece: row.price_piece !== undefined ? row.price_piece : row.price_min,
    pricePiece: row.price_piece !== undefined ? row.price_piece : row.price_min,
    price_dozen: row.price_dozen !== undefined ? row.price_dozen : ((row.price_piece || row.price_min || 0) * 12),
    priceDozen: row.price_dozen !== undefined ? row.price_dozen : ((row.price_piece || row.price_min || 0) * 12),
    min_piece_qty: row.min_piece_qty !== undefined ? row.min_piece_qty : 1,
    minPieceQty: row.min_piece_qty !== undefined ? row.min_piece_qty : 1,
    min_dozen_qty: row.min_dozen_qty !== undefined ? row.min_dozen_qty : 1,
    minDozenQty: row.min_dozen_qty !== undefined ? row.min_dozen_qty : 1,
    icon: row.icon,
    colors,
    skuMatrix,
    images
  }
}
