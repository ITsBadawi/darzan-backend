import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api.js'
import { safeStorage } from './safeStorage.js'

export const ORDER_STATUSES = ['معلق', 'مؤكد', 'قيد التوصيل', 'مُسلّم', 'ملغى']

export const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,

      // Public: create a new order from the checkout page
      createOrder: async (orderData) => {
        set({ loading: true, error: null })
        try {
          const result = await api.createOrder(orderData)
          set({ loading: false })
          return result
        } catch (err) {
          set({ error: err.message, loading: false })
          throw err
        }
      },

      // Admin: fetch all orders
      fetchOrders: async (statusFilter) => {
        set({ loading: true, error: null })
        try {
          const data = await api.getOrders(statusFilter)
          set({ orders: data, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
          console.error('Failed to fetch orders:', err)
        }
      },

      // Admin: update order status
      updateStatus: async (id, status) => {
        try {
          await api.updateOrderStatus(id, status)
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, status } : o
            )
          }))
        } catch (err) {
          console.error('Failed to update order status:', err)
          throw err
        }
      },

      // Admin: delete an order
      deleteOrder: async (id) => {
        try {
          await api.deleteOrder(id)
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id)
          }))
        } catch (err) {
          console.error('Failed to delete order:', err)
          throw err
        }
      }
    }),
    {
      name: 'darzan_orders',
      storage: safeStorage,
      partialize: (state) => ({ orders: state.orders })
    }
  )
)
