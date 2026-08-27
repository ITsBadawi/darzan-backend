import { supabaseAdmin } from '../config/supabase.js'

/**
 * Middleware that verifies the auth token from the Authorization header.
 * Supports Supabase JWT and dev tokens.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'مطلوب تسجيل الدخول' })
  }

  const token = authHeader.split(' ')[1]

  // Dev admin token bypass
  if (token.startsWith('dev-admin-token')) {
    req.user = {
      id: 'admin-dev-01',
      email: 'admin@darzan.iq',
      role: 'admin',
      name: 'المدير العام'
    }
    return next()
  }

  if (!supabaseAdmin) {
    req.user = {
      id: 'admin-dev-01',
      email: 'admin@darzan.iq',
      role: 'admin',
      name: 'المدير العام'
    }
    return next()
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      // If dev token in production or fallback
      if (token.startsWith('dev-admin-token')) {
        req.user = {
          id: 'admin-dev-01',
          email: 'admin@darzan.iq',
          role: 'admin',
          name: 'المدير العام'
        }
        return next()
      }
      return res.status(401).json({ error: 'جلسة غير صالحة أو منتهية' })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'admin',
      name: profile?.full_name || user.email
    }

    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({ error: 'خطأ في التحقق من الهوية' })
  }
}
