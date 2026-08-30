import { supabaseAdmin, supabase } from '../config/supabase.js'
import { validateSupplier, sanitizeText } from '../utils/validators.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/suppliers & /api/admin/suppliers
 * List suppliers. Supports ?active=true filter.
 */
export async function listSuppliers(req, res, next) {
  try {
    const onlyActive = req.query.active === 'true' || req.query.is_active === 'true'

    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('suppliers')
          .select(`
            *,
            products (id, is_active)
          `)
          .order('created_at', { ascending: false })

        if (onlyActive) {
          query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (!error && data) {
          const formatted = data.map((s) => ({
            id: s.id,
            supplier_code: s.supplier_code,
            name: s.name,
            phone: s.phone,
            notes: s.notes,
            is_active: s.is_active,
            created_at: s.created_at,
            updated_at: s.updated_at,
            product_count: (s.products || []).filter((p) => p.is_active !== false).length
          }))
          return res.json(formatted)
        }
      } catch (err) {
        console.warn('Supabase suppliers list fallback:', err.message)
      }
    }

    const local = localStore.getSuppliers(onlyActive)
    res.json(local)
  } catch (err) {
    try {
      res.json(localStore.getSuppliers(req.query.active === 'true'))
    } catch {
      next(err)
    }
  }
}

/**
 * GET /api/suppliers/:id & /api/admin/suppliers/:id
 * Get single supplier details with their products.
 */
export async function getSupplier(req, res, next) {
  try {
    const { id } = req.params

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('suppliers')
          .select(`
            *,
            products (*)
          `)
          .eq('id', id)
          .single()

        if (!error && data) {
          return res.json({
            id: data.id,
            supplier_code: data.supplier_code,
            name: data.name,
            phone: data.phone,
            notes: data.notes,
            is_active: data.is_active,
            created_at: data.created_at,
            updated_at: data.updated_at,
            product_count: (data.products || []).length,
            products: data.products || []
          })
        }
      } catch {
        /* fallback */
      }
    }

    const local = localStore.getSupplierById(id)
    if (local) return res.json(local)

    res.status(404).json({ error: 'المورد غير موجود' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/suppliers
 * Create a new supplier.
 */
export async function createSupplier(req, res, next) {
  try {
    const { valid, errors } = validateSupplier(req.body)
    if (!valid) {
      return res.status(400).json({ error: 'بيانات المورد غير مكتملة', details: errors })
    }

    const {
      supplier_code,
      name,
      phone,
      notes,
      is_active
    } = req.body

    const formattedCode = supplier_code.trim().toUpperCase()

    if (supabaseAdmin) {
      try {
        // Check for existing supplier_code
        const { data: existing } = await supabaseAdmin
          .from('suppliers')
          .select('id')
          .eq('supplier_code', formattedCode)
          .single()

        if (existing) {
          return res.status(400).json({ error: 'كود المورد مسجل مسبقاً، يرجى اختيار كود آخر' })
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('suppliers')
          .insert({
            supplier_code: formattedCode,
            name: sanitizeText(name),
            phone: phone ? sanitizeText(phone) : '',
            notes: notes ? sanitizeText(notes) : '',
            is_active: is_active !== undefined ? Boolean(is_active) : true
          })
          .select()
          .single()

        if (!insertError && inserted) {
          // Sync with localStore
          try {
            localStore.createSupplier({ ...inserted, id: inserted.id })
          } catch { /* ignore conflict in local */ }

          return res.status(201).json({
            ...inserted,
            product_count: 0
          })
        }
      } catch (err) {
        console.warn('Supabase supplier insert warn:', err.message)
      }
    }

    // Local Store Fallback
    try {
      const created = localStore.createSupplier({
        supplier_code: formattedCode,
        name: sanitizeText(name),
        phone: phone ? sanitizeText(phone) : '',
        notes: notes ? sanitizeText(notes) : '',
        is_active: is_active !== undefined ? Boolean(is_active) : true
      })
      res.status(201).json(created)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/suppliers/:id
 * Update supplier details.
 */
export async function updateSupplier(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    const dbUpdates = {}
    if (updates.supplier_code) dbUpdates.supplier_code = updates.supplier_code.trim().toUpperCase()
    if (updates.name) dbUpdates.name = sanitizeText(updates.name)
    if (updates.phone !== undefined) dbUpdates.phone = sanitizeText(updates.phone)
    if (updates.notes !== undefined) dbUpdates.notes = sanitizeText(updates.notes)
    if (updates.is_active !== undefined) dbUpdates.is_active = Boolean(updates.is_active)
    dbUpdates.updated_at = new Date().toISOString()

    if (supabaseAdmin) {
      try {
        if (dbUpdates.supplier_code) {
          const { data: conflict } = await supabaseAdmin
            .from('suppliers')
            .select('id')
            .eq('supplier_code', dbUpdates.supplier_code)
            .neq('id', id)
            .single()

          if (conflict) {
            return res.status(400).json({ error: 'كود المورد مسجل لمورد آخر' })
          }
        }

        const { data: updated, error } = await supabaseAdmin
          .from('suppliers')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()

        if (!error && updated) {
          localStore.updateSupplier(id, updates)
          return res.json(updated)
        }
      } catch {
        /* fallback */
      }
    }

    try {
      const localUpdated = localStore.updateSupplier(id, updates)
      if (!localUpdated) {
        return res.status(404).json({ error: 'المورد غير موجود' })
      }
      res.json(localUpdated)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/suppliers/:id
 * Delete supplier (with restriction check).
 */
export async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params

    if (supabaseAdmin) {
      try {
        // Check if supplier has any products attached
        const { count, error: countErr } = await supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('supplier_id', id)

        if (count && count > 0) {
          return res.status(400).json({
            error: `لا يمكن حذف المورد لأنه مرتبط بـ (${count}) منتج. يمكنك تعطيله بدلاً من حذفه.`
          })
        }

        const { error: deleteErr } = await supabaseAdmin
          .from('suppliers')
          .delete()
          .eq('id', id)

        if (!deleteErr) {
          localStore.deleteSupplier(id)
          return res.json({ success: true })
        }
      } catch (err) {
        console.warn('Supabase supplier delete error:', err.message)
      }
    }

    try {
      localStore.deleteSupplier(id)
      res.json({ success: true })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  } catch (err) {
    next(err)
  }
}
