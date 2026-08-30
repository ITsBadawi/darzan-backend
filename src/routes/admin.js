import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { adminOnly } from '../middleware/adminOnly.js'
import { editorOrAdmin } from '../middleware/editorOrAdmin.js'

import { getDashboardStats } from '../controllers/adminController.js'
import { listOrders, updateOrderStatus, deleteOrder } from '../controllers/ordersController.js'
import { listAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/adminProductsController.js'
import { listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '../controllers/suppliersController.js'
import { getAllSettings, updateSettings } from '../controllers/settingsController.js'

const router = Router()

// All admin routes require authentication
router.use(requireAuth)

// ─── Dashboard ───────────────────────────────────────
router.get('/dashboard', adminOnly, getDashboardStats)

// ─── Orders (admin only) ─────────────────────────────
router.get('/orders', adminOnly, listOrders)
router.patch('/orders/:id/status', adminOnly, updateOrderStatus)
router.delete('/orders/:id', adminOnly, deleteOrder)

// ─── Suppliers (admin or editor) ─────────────────────
router.get('/suppliers', editorOrAdmin, listSuppliers)
router.get('/suppliers/:id', editorOrAdmin, getSupplier)
router.post('/suppliers', editorOrAdmin, createSupplier)
router.put('/suppliers/:id', editorOrAdmin, updateSupplier)
router.delete('/suppliers/:id', editorOrAdmin, deleteSupplier)

// ─── Products (admin or editor) ──────────────────────
router.get('/products', editorOrAdmin, listAllProducts)
router.post('/products', editorOrAdmin, createProduct)
router.put('/products/:id', editorOrAdmin, updateProduct)
router.delete('/products/:id', editorOrAdmin, deleteProduct)

// ─── Settings (admin only) ───────────────────────────
router.get('/settings', adminOnly, getAllSettings)
router.put('/settings', adminOnly, updateSettings)

export default router
