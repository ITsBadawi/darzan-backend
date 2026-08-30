import { supabaseAdmin } from '../config/supabase.js'
import { validateProduct, gradientForHex } from '../utils/validators.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/admin/products
 * List ALL products (including inactive) for admin panel.
 * Supports ?supplier_id=... filter.
 */
export async function listAllProducts(req, res, next) {
  try {
    const { supplier_id } = req.query

    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
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
            )
          `)
          .order('created_at', { ascending: false })

        if (supplier_id && supplier_id !== 'الكل') {
          query = query.eq('supplier_id', supplier_id)
        }

        const { data, error } = await query

        if (!error && data && data.length > 0) {
          const formatted = data.map((p) => ({
            ...p,
            supplier: p.suppliers ? {
              id: p.suppliers.id,
              name: p.suppliers.name,
              supplier_code: p.suppliers.supplier_code,
              phone: p.suppliers.phone
            } : null
          }))
          return res.json(formatted)
        }
      } catch (err) {
        console.warn('Supabase listAllProducts warning:', err.message)
      }
    }

    const local = localStore.getAllProductsAdmin(supplier_id)
    res.json(local)
  } catch (err) {
    try {
      res.json(localStore.getAllProductsAdmin(req.query.supplier_id))
    } catch {
      next(err)
    }
  }
}

/**
 * POST /api/admin/products
 * Create a new product with colors, supplier link, and auto-generated SKUs (DZN-000001-RED-M).
 */
export async function createProduct(req, res, next) {
  try {
    const { valid, errors } = validateProduct(req.body)
    if (!valid) {
      return res.status(400).json({ error: 'بيانات المنتج غير مكتملة', details: errors })
    }

    const { name, description, icon, colors, sizes, cover_image, stock_matrix } = req.body
    const supplier_id = req.body.supplier_id || req.body.supplierId || null
    const category = req.body.category || req.body.cat
    const price_piece = req.body.price_piece !== undefined ? req.body.price_piece : (req.body.pricePiece !== undefined ? req.body.pricePiece : (req.body.price_min !== undefined ? req.body.price_min : req.body.priceMin))
    const price_min = req.body.price_min !== undefined ? req.body.price_min : (req.body.priceMin !== undefined ? req.body.priceMin : price_piece)
    const price_max = req.body.price_max !== undefined ? req.body.price_max : (req.body.priceMax !== undefined ? req.body.priceMax : price_min)
    const sale_type = req.body.sale_type || req.body.saleType || 'both'
    const price_dozen = req.body.price_dozen !== undefined ? req.body.price_dozen : (req.body.priceDozen !== undefined ? req.body.priceDozen : (Number(price_piece || price_min || 0) * 12))
    const min_piece_qty = req.body.min_piece_qty !== undefined ? req.body.min_piece_qty : (req.body.minPieceQty !== undefined ? req.body.minPieceQty : 1)
    const min_dozen_qty = req.body.min_dozen_qty !== undefined ? req.body.min_dozen_qty : (req.body.minDozenQty !== undefined ? req.body.minDozenQty : 1)

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
            sale_type,
            price_piece: Number(price_piece),
            price_dozen: Number(price_dozen),
            min_piece_qty: Number(min_piece_qty),
            min_dozen_qty: Number(min_dozen_qty),
            icon: icon || 'jacket',
            cover_image: cover_image || null,
            supplier_id: supplier_id || null,
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
            const prodNumFormatted = String(product.product_number || 1).padStart(6, '0')
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
                  sku_code: `DZN-${prodNumFormatted}-${color.code}-${size}`,
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
            product_number: product.product_number,
            name: product.name,
            category: product.category,
            supplier_id: product.supplier_id,
            sale_type: product.sale_type,
            price_piece: product.price_piece,
            price_dozen: product.price_dozen,
            min_piece_qty: product.min_piece_qty,
            min_dozen_qty: product.min_dozen_qty
          })
        }
      } catch (err) {
        console.warn('Supabase product insert fallback:', err.message)
      }
    }

    // Local Store Fallback
    const localProductNumber = localStore.getNextProductNumber()
    const prodNumFormatted = String(localProductNumber).padStart(6, '0')

    const localColors = colors.map((c, i) => {
      const grads = gradientForHex(c.hex)
      return {
        id: `c-loc-${Date.now()}-${i}`,
        code: (c.code || `C${i+1}`).trim().toUpperCase(),
        name: c.name.trim(),
        hex: c.hex || '#000000',
        g1: c.g1 || grads.g1,
        g2: c.g2 || grads.g2,
        image_url: c.image_url || ''
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
          sku: `DZN-${prodNumFormatted}-${color.code}-${size}`,
          available: customStock > 0
        }
      }
    }

    const localProduct = {
      id: newId,
      product_number: localProductNumber,
      supplier_id: supplier_id || 'sup-legacy',
      name: name.trim(),
      cat: category,
      category,
      description: description?.trim() || '',
      priceMin: Number(price_min),
      priceMax: Number(price_max),
      price_min: Number(price_min),
      price_max: Number(price_max),
      sale_type,
      saleType: sale_type,
      price_piece: Number(price_piece),
      pricePiece: Number(price_piece),
      price_dozen: Number(price_dozen),
      priceDozen: Number(price_dozen),
      min_piece_qty: Number(min_piece_qty),
      minPieceQty: Number(min_piece_qty),
      min_dozen_qty: Number(min_dozen_qty),
      minDozenQty: Number(min_dozen_qty),
      icon: icon || 'jacket',
      cover_image: cover_image || null,
      is_active: true,
      colors: localColors,
      skuMatrix: localSkuMatrix,
      images: {}
    }

    localStore.createProduct(localProduct)

    res.status(201).json({
      id: localProduct.id,
      product_number: localProduct.product_number,
      name: localProduct.name,
      cat: localProduct.cat,
      supplier_id: localProduct.supplier_id,
      sale_type: localProduct.sale_type,
      price_piece: localProduct.price_piece,
      price_dozen: localProduct.price_dozen,
      min_piece_qty: localProduct.min_piece_qty,
      min_dozen_qty: localProduct.min_dozen_qty
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
    if (updates.sale_type !== undefined || updates.saleType !== undefined) {
      dbUpdates.sale_type = updates.sale_type || updates.saleType
    }
    if (updates.price_piece !== undefined || updates.pricePiece !== undefined) {
      dbUpdates.price_piece = Number(updates.price_piece !== undefined ? updates.price_piece : updates.pricePiece)
    }
    if (updates.price_dozen !== undefined || updates.priceDozen !== undefined) {
      dbUpdates.price_dozen = Number(updates.price_dozen !== undefined ? updates.price_dozen : updates.priceDozen)
    }
    if (updates.min_piece_qty !== undefined || updates.minPieceQty !== undefined) {
      dbUpdates.min_piece_qty = Number(updates.min_piece_qty !== undefined ? updates.min_piece_qty : updates.minPieceQty)
    }
    if (updates.min_dozen_qty !== undefined || updates.minDozenQty !== undefined) {
      dbUpdates.min_dozen_qty = Number(updates.min_dozen_qty !== undefined ? updates.min_dozen_qty : updates.minDozenQty)
    }
    if (updates.icon) dbUpdates.icon = updates.icon
    if (updates.cover_image !== undefined || updates.coverImage !== undefined) {
      dbUpdates.cover_image = updates.cover_image !== undefined ? updates.cover_image : updates.coverImage
    }
    if (updates.supplier_id !== undefined || updates.supplierId !== undefined) {
      dbUpdates.supplier_id = updates.supplier_id || updates.supplierId
    }
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
