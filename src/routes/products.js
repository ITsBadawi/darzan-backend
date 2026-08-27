import { Router } from 'express'
import { listProducts, getProduct, listCategories } from '../controllers/productsController.js'

const router = Router()

// GET /api/products — list all active products
router.get('/', listProducts)

// GET /api/products/categories — list distinct categories
router.get('/categories', listCategories)

// GET /api/products/:id — single product details
router.get('/:id', getProduct)

export default router
