import { Router } from 'express'
import { getPublicSettings } from '../controllers/settingsController.js'

const router = Router()

// GET /api/settings/public — public-facing settings
router.get('/public', getPublicSettings)

export default router
