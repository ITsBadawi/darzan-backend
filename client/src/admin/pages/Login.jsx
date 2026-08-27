import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../../store/useAdminAuthStore.js'
import '../admin.css'

export default function Login() {
  const user = useAdminAuthStore((s) => s.user)
  const login = useAdminAuthStore((s) => s.login)
  const authLoading = useAdminAuthStore((s) => s.loading)
  const authError = useAdminAuthStore((s) => s.error)
  const clearError = useAdminAuthStore((s) => s.clearError)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const ok = await login(email.trim(), password)
    if (ok) navigate('/admin')
  }

  return (
    <div className="admin-login-wrap" dir="rtl">
      <div className="admin-login-card">
        <div className="brand">
          <div className="name display">درازن</div>
          <div className="label">تسجيل الدخول للوحة التحكم</div>
        </div>

        {authError && <div className="error-box">{authError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="pf-field">
            <label>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@darzan.iq" />
          </div>
          <div className="pf-field">
            <label>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={authLoading}>
            {authLoading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
