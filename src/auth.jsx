import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from './api.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStore.get())
  const [username, setUsername] = useState(localStorage.getItem('mt_user') || '')

  const logout = useCallback(() => {
    tokenStore.clear()
    localStorage.removeItem('mt_user')
    setToken(null)
    setUsername('')
  }, [])

  useEffect(() => { setUnauthorizedHandler(logout) }, [logout])

  const login = useCallback(async (u, p) => {
    const data = await api.login({ username: u, password: p })
    tokenStore.set(data.accessToken)
    localStorage.setItem('mt_user', u)
    setToken(data.accessToken)
    setUsername(u)
  }, [])

  const register = useCallback(
    async (u, email, p) => {
      await api.register({ username: u, email, password: p })
      await login(u, p)
    },
    [login]
  )

  const value = useMemo(
    () => ({ isAuthed: !!token, username, login, register, logout }),
    [token, username, login, register, logout]
  )
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
