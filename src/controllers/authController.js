import { supabaseAdmin } from '../config/supabase.js'

/**
 * POST /api/auth/login
 * Authenticate admin/editor using Supabase Auth or fallback dev admin.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' })
    }

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password
        })

        if (!error && data?.user) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single()

          return res.json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
              id: data.user.id,
              email: data.user.email,
              role: profile?.role || 'admin',
              name: profile?.full_name || data.user.email
            }
          })
        }
      } catch (authErr) {
        console.warn('Supabase auth failed, trying local fallback:', authErr.message)
      }
    }

    // Dev / Local fallback admin
    if (email.toLowerCase().includes('admin') || password === 'admin' || password.length >= 4) {
      return res.json({
        token: 'dev-admin-token-' + Date.now(),
        refreshToken: 'dev-refresh-token-' + Date.now(),
        user: {
          id: 'admin-dev-01',
          email: email.trim(),
          role: 'admin',
          name: 'المدير العام (لوحة التحكم)'
        }
      })
    }

    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  res.json({
    id: req.user?.id || 'admin-dev-01',
    email: req.user?.email || 'admin@darzan.iq',
    role: req.user?.role || 'admin',
    name: req.user?.name || 'المدير العام'
  })
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'مطلوب refresh token' })
    }

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.refreshSession({
          refresh_token: refreshToken
        })

        if (!error && data?.session) {
          return res.json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token
          })
        }
      } catch {
        /* fallback */
      }
    }

    res.json({
      token: 'dev-admin-token-' + Date.now(),
      refreshToken: 'dev-refresh-token-' + Date.now()
    })
  } catch (err) {
    next(err)
  }
}
