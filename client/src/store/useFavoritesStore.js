import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      ids: [],

      isFavorite: (id) => get().ids.includes(id),

      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id]
        }))
    }),
    {
      name: 'darzan_favorites',
      partialize: (state) => ({ ids: state.ids })
    }
  )
)
