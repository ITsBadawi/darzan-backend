import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { editorOrAdmin } from '../middleware/editorOrAdmin.js'
import { upload, uploadProductImage, deleteProductImage } from '../controllers/uploadController.js'

const router = Router()

// POST /api/upload/product-image — upload a product image (authenticated)
router.post('/product-image', requireAuth, editorOrAdmin, upload.single('image'), uploadProductImage)

// DELETE /api/upload/product-image/:id — delete a product image (authenticated)
router.delete('/product-image/:id', requireAuth, editorOrAdmin, deleteProductImage)

export default router
