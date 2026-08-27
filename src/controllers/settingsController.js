import { supabase, supabaseAdmin } from '../config/supabase.js'
import { localStore } from '../db/localStore.js'

/**
 * GET /api/settings/public
 * Returns public-facing settings (about text, promo banner, etc.)
 */
export async function getPublicSettings(_req, res, next) {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')

      if (!error && data && data.length > 0) {
        const settings = {}
        for (const row of data || []) {
          settings[row.key] = row.value
        }
        return res.json(settings)
      }
    }

    // Fallback to local store
    const local = localStore.getSettings()
    res.json(local)
  } catch (err) {
    // Graceful fallback instead of 500
    try {
      const local = localStore.getSettings()
      res.json(local)
    } catch {
      next(err)
    }
  }
}

/**
 * GET /api/admin/settings
 * Returns all settings (admin only).
 */
export async function getAllSettings(_req, res, next) {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')

      if (!error && data && data.length > 0) {
        const settings = {}
        for (const row of data || []) {
          settings[row.key] = row.value
        }
        return res.json(settings)
      }
    }

    // Fallback to local store
    const local = localStore.getSettings()
    res.json(local)
  } catch (err) {
    try {
      const local = localStore.getSettings()
      res.json(local)
    } catch {
      next(err)
    }
  }
}

/**
 * PUT /api/admin/settings
 * Update settings (admin only). Body: { key: value, key: value, ... }
 */
export async function updateSettings(req, res, next) {
  try {
    const updates = req.body

    // Always update local store
    localStore.updateSettings(updates)

    // Also update Supabase if configured
    if (supabaseAdmin) {
      for (const [key, value] of Object.entries(updates)) {
        await supabaseAdmin
          .from('settings')
          .upsert(
            { key, value: String(value), updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )
          .catch((e) => console.warn('Supabase setting upsert warn:', e.message))
      }
    }

    res.json({ success: true, settings: localStore.getSettings() })
  } catch (err) {
    next(err)
  }
}
