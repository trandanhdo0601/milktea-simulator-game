import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Play from './pages/Play.jsx'
import History from './pages/History.jsx'
import Stats from './pages/Stats.jsx'

function Private({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { isAuthed, username, logout } = useAuth()
  return (
    <>
      <header className="bar">
        <span className="brand">Tiệm Trà Sữa</span>
        {isAuthed && (
          <>
            <nav className="nav">
              <NavLink to="/" end>Pha chế</NavLink>
              <NavLink to="/history">Lịch sử</NavLink>
              <NavLink to="/stats">Thống kê</NavLink>
            </nav>
            <div className="who">
              <span>{username}</span>
              <button className="btn ghost" onClick={logout}>Đăng xuất</button>
            </div>
          </>
        )}
      </header>
      <main className="wrap">
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
