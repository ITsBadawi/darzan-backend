/**
 * Global error handler — catches unhandled errors from controllers.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('❌ Unhandled error:', err)

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy: origin not allowed' })
  }

  // Supabase / Postgres error
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'خطأ في معالجة البيانات',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: status === 500 && process.env.NODE_ENV !== 'development' ? 'حدث خطأ في السيرفر' : (err.message || 'حدث خطأ غير متوقع'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
