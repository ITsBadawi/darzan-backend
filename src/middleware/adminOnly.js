/**
 * Middleware that restricts access to admin-role users only.
 * Must be used AFTER requireAuth.
 */
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'هذا الإجراء يتطلب صلاحية مدير' })
  }
  next()
}
