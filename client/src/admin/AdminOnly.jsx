import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '../store/useAdminAuthStore.js'

export default function AdminOnly({ children }) {
  const role = useAdminAuthStore((s) => s.user?.role)
  if (role !== 'admin') return <Navigate to="/admin" replace />
  return children
}
