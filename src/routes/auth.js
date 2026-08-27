import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me, refresh } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Strict rate limit for login attempts: max 5 requests per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز عدد محاولات الدخول المسموحة، يرجى المحاولة بعد 15 دقيقة' }
})

// POST /api/auth/login
router.post('/login', loginLimiter, login)

// POST /api/auth/logout
router.post('/logout', logout)

// POST /api/auth/refresh
router.post('/refresh', refresh)

// GET /api/auth/me — requires authentication
router.get('/me', requireAuth, me)

export default router
