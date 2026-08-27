import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api.js'
import { safeStorage } from './safeStorage.js'

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const data = await api.login(email, password)
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            loading: false,
            error: null
          })
          return true
        } catch (err) {
          set({
            error: err.message || 'بيانات الدخول غير صحيحة',
            loading: false
          })
          return false
        }
      },

      logout: () => {
        api.logout().catch(() => {})
        set({ user: null, token: null, refreshToken: null, error: null })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'darzan_admin_auth',
      storage: safeStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken
      })
    }
  )
)
