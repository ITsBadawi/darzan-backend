import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api.js'
import { safeStorage } from './safeStorage.js'

const CACHE_DURATION = 15 * 1000 // 15 seconds cache for fresh sync

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: null,
      categories: [],
      loadingSettings: false,
      loadingCategories: false,
      lastFetchedSettings: null,
      lastFetchedCategories: null,

      setSettings: (newSettings) => {
        set((state) => ({
          settings: { ...(state.settings || {}), ...newSettings },
          lastFetchedSettings: Date.now()
        }))
      },

      invalidateSettings: () => {
        set({ lastFetchedSettings: null })
      },

      fetchPublicSettings: async (force = false) => {
        const now = Date.now()
        const { lastFetchedSettings, settings } = get()
        if (!force && settings && lastFetchedSettings && now - lastFetchedSettings < CACHE_DURATION) {
          return settings
        }

        set({ loadingSettings: true })
        try {
          const data = await api.getPublicSettings()
          if (data && typeof data === 'object') {
            set({ settings: data, loadingSettings: false, lastFetchedSettings: now })
            return data
          }
          set({ loadingSettings: false })
          return settings
        } catch (err) {
          set({ loadingSettings: false })
          console.error('Failed to fetch public settings:', err)
          return settings
        }
      },

      fetchCategories: async (force = false) => {
        const now = Date.now()
        const { lastFetchedCategories, categories } = get()
        if (!force && categories.length > 0 && lastFetchedCategories && now - lastFetchedCategories < CACHE_DURATION) {
          return categories
        }

        set({ loadingCategories: true })
        try {
          const data = await api.getCategories()
          const list = Array.isArray(data) && data.length > 0 ? data : ['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']
          set({ categories: list, loadingCategories: false, lastFetchedCategories: now })
          return list
        } catch (err) {
          set({ loadingCategories: false })
          console.error('Failed to fetch categories:', err)
          return categories.length ? categories : ['الكل', 'رجالي', 'نسائي', 'أطفال', 'فساتين', 'بيتي']
        }
      }
    }),
    {
      name: 'darzan_settings',
      storage: safeStorage,
      partialize: (state) => ({
        settings: state.settings,
        categories: state.categories,
        lastFetchedSettings: state.lastFetchedSettings,
        lastFetchedCategories: state.lastFetchedCategories
      })
    }
  )
)
