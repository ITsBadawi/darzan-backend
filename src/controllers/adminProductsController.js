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

    const { name, category, description, price_min, price_max, icon, colors, sizes, cover_image, stock_matrix } = req.body
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
              code: c.code.trim().toUpperCase(),
              name: c.name.trim(),
              hex: c.hex,
              g1: grads.g1,
              g2: grads.g2,
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

          return res.status(201).json({ id: product.id, name: product.name })
        }
      } catch (err) {
        console.warn('Supabase product creation warn:', err.message)
      }
    }

    // Local fallback
    const localProduct = {
      id: newId,
      name: name.trim(),
      cat: category,
      category,
      description: description?.trim() || '',
      priceMin: Number(price_min),
      priceMax: Number(price_max),
      price_min: Number(price_min),
      price_max: Number(price_max),
      icon: icon || 'jacket',
      is_active: true,
      colors: colors.map((c, i) => ({
        id: `c-${Date.now()}-${i}`,
        code: c.code.trim().toUpperCase(),
        name: c.name.trim(),
        hex: c.hex,
        g1: c.g1 || '#2A2A2A',
        g2: c.g2 || '#4A4A4A',
        image_url: c.image_url || null
      })),
      skuMatrix: {},
      images: {}
    }

    localStore.createProduct(localProduct)
    res.status(201).json({ id: localProduct.id, name: localProduct.name })
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
    const { name, category, description, price_min, price_max, icon, colors, is_active } = req.body

    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('products')
          .update({
            name: name?.trim(),
            category,
            description: description?.trim(),
            price_min: price_min !== undefined ? Number(price_min) : undefined,
            price_max: price_max !== undefined ? Number(price_max) : undefined,
            icon: icon || 'jacket',
            is_active: is_active !== undefined ? is_active : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      } catch {
        /* fallback */
      }
    }

    localStore.updateProduct(id, {
      name,
      cat: category,
      category,
      description,
      priceMin: price_min !== undefined ? Number(price_min) : undefined,
      priceMax: price_max !== undefined ? Number(price_max) : undefined,
      price_min: price_min !== undefined ? Number(price_min) : undefined,
      price_max: price_max !== undefined ? Number(price_max) : undefined,
      is_active: is_active !== undefined ? is_active : true
    })

    res.json({ id, updated: true })
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
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('products').delete().eq('id', id)
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
