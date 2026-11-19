import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Play from './pages/Play.jsx'
import History from './pages/History.jsx'
import Stats from './pages/Stats.jsx'
import { IconChart, IconHistory, IconLogo, IconLogout, IconMix } from './components/Icons.jsx'

function Private({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { isAuthed, username, logout } = useAuth()
  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link to="/" className="brand" aria-label="Tiệm Trà Sữa — trang chủ">
            <span className="brand-mark"><IconLogo size={22} /></span>
            <span className="brand-name">Tiệm Trà Sữa</span>
          </Link>
          {isAuthed && (
            <>
              <nav className="nav" aria-label="Điều hướng chính">
                <NavLink to="/" end><IconMix size={19} /><span>Pha chế</span></NavLink>
                <NavLink to="/history"><IconHistory size={19} /><span>Lịch sử</span></NavLink>
                <NavLink to="/stats"><IconChart size={19} /><span>Thống kê</span></NavLink>
              </nav>
              <div className="who">
                <span className="avatar" aria-hidden="true">{(username || '?').charAt(0).toUpperCase()}</span>
                <span className="who-name">{username}</span>
                <button className="btn ghost sm" onClick={logout} aria-label="Đăng xuất">
                  <IconLogout size={17} />
                  <span className="who-out">Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="page">
        <Routes>
          <Route path="/auth" element={isAuthed ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/" element={<Private><Play /></Private>} />
          <Route path="/history" element={<Private><History /></Private>} />
          <Route path="/stats" element={<Private><Stats /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
