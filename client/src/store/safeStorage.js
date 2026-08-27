import { createJSONStorage } from 'zustand/middleware'

const memoryStorage = {}

const customStateStorage = {
  getItem: (name) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name)
      }
      return memoryStorage[name] || null
    } catch {
      return memoryStorage[name] || null
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value)
      }
      memoryStorage[name] = value
    } catch {
      memoryStorage[name] = value
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name)
      }
      delete memoryStorage[name]
    } catch {
      delete memoryStorage[name]
    }
  }
}

export const safeStorage = createJSONStorage(() => customStateStorage)
export default safeStorage