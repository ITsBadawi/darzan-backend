import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      // item: { lineId, productId, name, colorName, colorHex, g1, g2, size, qty, price, sku }
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.lineId === item.lineId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === item.lineId ? { ...i, qty: i.qty + item.qty } : i
              )
            }
          }
          return { items: [...state.items, item] }
        }),

      changeQty: (lineId, delta) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.lineId === lineId) {
                const min = Math.max(1, Number(i.min_qty) || 1)
                const newQty = i.qty + delta
                if (newQty < min) return i
                return { ...i, qty: newQty }
              }
              return i
            })
            .filter((i) => i.qty > 0)
        })),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      clear: () => set({ items: [] })
    }),
    {
      name: 'darzan_cart',
      partialize: (state) => ({ items: state.items })
    }
  )
)

// convenience selectors
export const selectCartCount = (state) => state.items.reduce((s, i) => s + i.qty, 0)
export const selectCartTotal = (state) => state.items.reduce((s, i) => s + i.qty * i.price, 0)
