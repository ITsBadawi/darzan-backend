export const safeStorage = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name)
      if (raw === null) return null
      return JSON.parse(raw)
    } catch {
      try { localStorage.removeItem(name) } catch { /* ignore */ }
      return null
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
  }
}