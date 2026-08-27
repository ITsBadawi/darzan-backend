/**
 * Middleware that allows both admin and editor roles.
 * Must be used AFTER requireAuth.
 */
export function editorOrAdmin(req, res, next) {
  const role = req.user?.role
  if (role !== 'admin' && role !== 'editor') {
    return res.status(403).json({ error: 'هذا الإجراء يتطلب صلاحية مدير أو محرّر' })
  }
  next()
}
