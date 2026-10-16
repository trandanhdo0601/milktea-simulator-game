import { useState } from 'react'
import { useAuth } from '../auth.jsx'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form.username.trim(), form.password)
      else await register(form.username.trim(), form.email.trim(), form.password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1>Nhận đơn, pha đúng công thức, lên bảng điểm.</h1>
        <p>Mỗi đơn có 5 thành phần. Pha đúng cả 5 để đạt 100 điểm.</p>
      </div>
      <form className="panel" onSubmit={onSubmit}>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => setMode('register')}>Tạo tài khoản</button>
        </div>
        <label>Tên đăng nhập
          <input value={form.username} onChange={set('username')} autoComplete="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" title="Chỉ gồm chữ, số và dấu gạch dưới" />
        </label>
        {mode === 'register' && (
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
        )}
        <label>Mật khẩu
          <input type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} />
        </label>
        {mode === 'register' && <p className="hint">Mật khẩu từ 8 ký tự trở lên.</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>
    </section>
  )
}
