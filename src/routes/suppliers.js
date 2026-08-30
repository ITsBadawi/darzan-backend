import { Router } from 'express'
import { listSuppliers, getSupplier } from '../controllers/suppliersController.js'

const router = Router()

// Public / general read routes for suppliers
router.get('/', listSuppliers)
router.get('/:id', getSupplier)

export default router
