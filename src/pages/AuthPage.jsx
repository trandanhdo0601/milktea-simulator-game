import { useEffect, useState } from 'react'
import { useAuth } from '../auth.jsx'
import Cup from '../components/Cup.jsx'
import Swatch from '../components/Swatch.jsx'
import { ErrorNote } from '../components/Ui.jsx'
import { IconEye, IconEyeOff } from '../components/Icons.jsx'
import { FIELDS, labelOf } from '../constants.js'

// Ba ly mẫu luân phiên ở phần giới thiệu, để người mới thấy ngay luật chơi.
const DEMOS = [
  { name: 'Trà sữa trân châu', teaType: 'BLACK_TEA', milkType: 'FRESH_MILK', sugarLevel: 50, iceLevel: 'NORMAL', topping: 'BLACK_PEARL' },
  { name: 'Trà xanh pudding', teaType: 'GREEN_TEA', milkType: 'MILK_POWDER', sugarLevel: 25, iceLevel: 'LESS', topping: 'PUDDING' },
  { name: 'Ô long trân châu trắng', teaType: 'OOLONG_TEA', milkType: 'FRESH_MILK', sugarLevel: 75, iceLevel: 'NO_ICE', topping: 'WHITE_PEARL' },
]

function useDemo() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % DEMOS.length), 3400)
    return () => clearInterval(t)
  }, [])
  return DEMOS[i]
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const demo = useDemo()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const isLogin = mode === 'login'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(form.username.trim(), form.password)
      else await register(form.username.trim(), form.email.trim(), form.password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-hero">
        <h1>Nhận đơn, pha đúng công thức, lên bảng điểm.</h1>
        <p className="lead">Mỗi đơn có 5 thành phần. Pha đúng cả 5 để đạt 100 điểm.</p>

        <div className="hero-stage" aria-hidden="true">
          <div className="hero-cup">
            <Cup recipe={demo} size="lg" />
            <span className="hero-name">{demo.name}</span>
          </div>
          <ul className="hero-rows">
            {FIELDS.map((f) => (
              <li key={f.key}>
                <Swatch field={f.key} value={demo[f.key]} size={30} />
                <span className="hero-row-text">
                  <small>{f.title}</small>
                  <b>{labelOf(f.key, demo[f.key])}</b>
                </span>
                <span className="hero-pts">+{f.points}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <h2>{isLogin ? 'Đăng nhập để vào quầy' : 'Tạo tài khoản để bắt đầu pha'}</h2>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isLogin} onClick={() => setMode('login')}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={!isLogin} onClick={() => setMode('register')}>Tạo tài khoản</button>
        </div>
        <label>Tên đăng nhập
          <input value={form.username} onChange={set('username')} autoComplete="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" title="Chỉ gồm chữ, số và dấu gạch dưới" />
        </label>
        {!isLogin && (
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
        )}
        <label>Mật khẩu
          <span className="pw">
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={isLogin ? 1 : 8} />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPw}>
              {showPw ? <IconEyeOff size={19} /> : <IconEye size={19} />}
            </button>
          </span>
        </label>
        {!isLogin && <p className="hint">Mật khẩu từ 8 ký tự trở lên.</p>}
        {error && <ErrorNote>{error}</ErrorNote>}
        <button className="btn big" disabled={busy}>
          {busy ? 'Đang xử lý…' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>
    </section>
  )
}
