import { supabaseAdmin } from '../config/supabase.js'
import { validateProduct, gradientForHex } from '../utils/validators.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/admin/products
 * List ALL products (including inactive) for admin panel.
 */
export async function listAllProducts(req, res, next) {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          product_colors (
            id, code, name, hex, g1, g2, sort_order
          ),
          product_skus (
            id, color_id, size, sku_code, price, stock, is_available
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return res.json(data)
      }
    }

    const local = localStore.getAllProductsAdmin()
    res.json(local)
  } catch (err) {
    try {
      res.json(localStore.getAllProductsAdmin())
    } catch {
      next(err)
    }
  }
}

/**
 * POST /api/admin/products
 * Create a new product with colors and auto-generated SKUs.
 */
export async function createProduct(req, res, next) {
  try {
    const { valid, errors } = validateProduct(req.body)
    if (!valid) {
      return res.status(400).json({ error: 'بيانات المنتج غير مكتملة', details: errors })
    }

    const { name, description, icon, colors, sizes, cover_image, stock_matrix } = req.body
    const category = req.body.category || req.body.cat
    const price_min = req.body.price_min !== undefined ? req.body.price_min : req.body.priceMin
    const price_max = req.body.price_max !== undefined ? req.body.price_max : req.body.priceMax

    const targetSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
    const newId = 'prod-' + Date.now()

    if (supabaseAdmin) {
      try {
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .insert({
            name: name.trim(),
            category,
            description: description?.trim() || '',
            price_min: Number(price_min),
            price_max: Number(price_max),
            icon: icon || 'jacket',
            cover_image: cover_image || null,
            is_active: true
          })
          .select()
          .single()

        if (!productError && product) {
          const colorRows = colors.map((c, i) => {
            const grads = gradientForHex(c.hex)
            return {
              product_id: product.id,
              code: (c.code || `C${i+1}`).trim().toUpperCase(),
              name: c.name.trim(),
              hex: c.hex || '#000000',
              g1: c.g1 || grads.g1,
              g2: c.g2 || grads.g2,
              image_url: c.image_url || null,
              sort_order: i
            }
          })

          const { data: insertedColors } = await supabaseAdmin
            .from('product_colors')
            .insert(colorRows)
            .select()

          if (insertedColors) {
            const skuRows = []
            for (const color of insertedColors) {
              for (let i = 0; i < targetSizes.length; i++) {
                const size = targetSizes[i]
                const spread = Math.max(0, Number(price_max) - Number(price_min))
                const priceBump = i >= 4 && spread > 0 ? Math.round(spread * 0.4) : 0
                const key = `${color.code}-${size}`
                const customStock = stock_matrix && stock_matrix[key] !== undefined ? Number(stock_matrix[key]) : 10

                skuRows.push({
                  product_id: product.id,
                  color_id: color.id,
                  size,
                  sku_code: `DZN-${product.id.split('-')[0].toUpperCase()}-${color.code}-${size}`,
                  price: Number(price_min) + priceBump,
                  stock: customStock,
                  is_available: customStock > 0
                })
              }
            }

            await supabaseAdmin.from('product_skus').insert(skuRows)
          }

          return res.status(201).json({
            id: product.id,
            name: product.name,
            category: product.category
          })
        }
      } catch (err) {
        console.warn('Supabase product insert fallback:', err.message)
      }
    }

    // Local Store Fallback
    const localColors = colors.map((c, i) => {
      const grads = gradientForHex(c.hex)
      return {
        id: `c-loc-${Date.now()}-${i}`,
        code: (c.code || `C${i+1}`).trim().toUpperCase(),
        name: c.name.trim(),
        hex: c.hex || '#000000',
        g1: c.g1 || grads.g1,
        g2: c.g2 || grads.g2
      }
    })

    const localSkuMatrix = {}
    for (const color of localColors) {
      for (let i = 0; i < targetSizes.length; i++) {
        const size = targetSizes[i]
        const spread = Math.max(0, Number(price_max) - Number(price_min))
        const priceBump = i >= 4 && spread > 0 ? Math.round(spread * 0.4) : 0
        const key = `${color.code}-${size}`
        const customStock = stock_matrix && stock_matrix[key] !== undefined ? Number(stock_matrix[key]) : 10

        localSkuMatrix[key] = {
          id: `s-${newId}-${key}`,
          price: Number(price_min) + priceBump,
          stock: customStock,
          sku: `DZN-${newId.slice(-4)}-${color.code}-${size}`,
          available: customStock > 0
        }
      }
    }

    const localProduct = {
      id: newId,
      name: name.trim(),
      cat: category,
      category,
      description: description?.trim() || '',
      priceMin: Number(price_min),
      priceMax: Number(price_max),
      icon: icon || 'jacket',
      is_active: true,
      colors: localColors,
      skuMatrix: localSkuMatrix,
      images: {}
    }

    localStore.createProduct(localProduct)

    res.status(201).json({
      id: localProduct.id,
      name: localProduct.name,
      cat: localProduct.cat
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    const dbUpdates = {}
    if (updates.name) dbUpdates.name = updates.name.trim()
    if (updates.category || updates.cat) dbUpdates.category = (updates.category || updates.cat).trim()
    if (updates.description !== undefined) dbUpdates.description = updates.description.trim()
    if (updates.price_min !== undefined || updates.priceMin !== undefined) {
      dbUpdates.price_min = Number(updates.price_min !== undefined ? updates.price_min : updates.priceMin)
    }
    if (updates.price_max !== undefined || updates.priceMax !== undefined) {
      dbUpdates.price_max = Number(updates.price_max !== undefined ? updates.price_max : updates.priceMax)
    }
    if (updates.icon) dbUpdates.icon = updates.icon
    if (updates.cover_image !== undefined) dbUpdates.cover_image = updates.cover_image
    if (updates.is_active !== undefined) dbUpdates.is_active = Boolean(updates.is_active)
    dbUpdates.updated_at = new Date().toISOString()

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('products').update(dbUpdates).eq('id', id)
      } catch {
        /* fallback */
      }
    }

    const localUpdated = localStore.updateProduct(id, updates)
    res.json({ id, ...dbUpdates, local: localUpdated })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params
    const { hard } = req.query

    if (supabaseAdmin) {
      try {
        if (hard === 'true') {
          await supabaseAdmin.from('products').delete().eq('id', id)
        } else {
          await supabaseAdmin.from('products').update({ is_active: false }).eq('id', id)
        }
      } catch {
        /* fallback */
      }
    }

    localStore.deleteProduct(id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
