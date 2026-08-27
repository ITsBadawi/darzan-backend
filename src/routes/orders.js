import { Router } from 'express'
import { createOrder } from '../controllers/ordersController.js'

const router = Router()

// POST /api/orders — create a new order (public — from checkout page)
router.post('/', createOrder)

export default router
