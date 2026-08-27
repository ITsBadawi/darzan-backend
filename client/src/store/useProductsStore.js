import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api.js'

export const useProductsStore = create(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,
      lastFetched: null,

      // Fetch products from the API (with optional category filter)
      fetchProducts: async (category) => {
        // Don't refetch if we loaded less than 60 seconds ago (and no category filter)
        const now = Date.now()
        if (!category && get().lastFetched && now - get().lastFetched < 60000 && get().products.length > 0) {
          return
        }

        set({ loading: true, error: null })
        try {
          const data = await api.getProducts(category)
          set({ products: data, loading: false, lastFetched: now })
        } catch (err) {
          set({ error: err.message, loading: false })
          console.error('Failed to fetch products:', err)
        }
      },

      getById: (id) => get().products.find((p) => p.id === id),

      // Admin: add product via API
      addProduct: async (productData) => {
        const result = await api.createProduct(productData)
        // Refresh the products list
        await get().fetchProducts()
        return result
      },

      // Admin: update product via API
      updateProduct: async (id, patch) => {
        const result = await api.updateProduct(id, patch)
        // Refresh the products list
        await get().fetchProducts()
        return result
      },

      // Admin: delete product via API
      deleteProduct: async (id) => {
        await api.deleteProduct(id)
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        }))
      },

      // Clear cache to force a fresh fetch
      invalidate: () => set({ lastFetched: null })
    }),
    {
      name: 'darzan_products',
      partialize: (state) => ({
        products: state.products,
        lastFetched: state.lastFetched
      })
    }
  )
)
