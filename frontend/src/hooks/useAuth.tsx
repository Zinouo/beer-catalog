import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  isMaintainer: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: () => void
  logout: () => void
  setTokenAndFetchUser: (token: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    setToken(storedToken)
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = () => {
    window.location.href = '/api/auth/github'
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const setTokenAndFetchUser = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    const data = await res.json()
    setUser(data)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setTokenAndFetchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}