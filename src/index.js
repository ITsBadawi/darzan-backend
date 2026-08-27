import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import settingsRouter from './routes/settings.js'
import uploadRouter from './routes/upload.js'
import { errorHandler } from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// --------------- Global Middleware ---------------

// Security headers (configured to allow scripts, styles, images, and fonts)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  })
)

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no origin (mobile apps, curl, server-to-server, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      // Allow local network origins (LAN) or localhost in development mode
      if (process.env.NODE_ENV !== 'production') {
        if (/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
          return cb(null, true)
        }
      }
      cb(null, true) // Allow in production for smooth fullstack deployment
    },
    credentials: true
  })
)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Rate limiting — 120 requests per minute per IP for API endpoints
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' }
})
app.use('/api/', limiter)

// --------------- API Routes ---------------

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/upload', uploadRouter)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

// --------------- Static Client (Frontend) Serving ---------------

// Check candidate paths for built frontend assets
const clientDistCandidates = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, '../../darzan-frontend/dist'),
  path.resolve(__dirname, '../dist')
]

const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p))

if (clientDistPath) {
  // Serve static assets with appropriate caching
  app.use(
    express.static(clientDistPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        }
      }
    })
  )

  // Fallback for Single Page Application (SPA) client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    if (req.path.startsWith('/assets/')) {
      return res.status(404).send('Asset not found')
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
  console.log(`🌐 Serving frontend from: ${clientDistPath}`)
}

// Global Error Handler
app.use(errorHandler)

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`🚀 Darzan Fullstack Server running on port ${PORT}`)
  console.log(`🗄️  Connected to Supabase in PRODUCTION mode`)
})

export default app
