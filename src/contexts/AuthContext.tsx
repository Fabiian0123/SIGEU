// src/contexts/AuthContext.tsx
import { createContext, useContext, useMemo, useState } from 'react'

export type UserRole = 'estudiante' | 'administrativo'

export interface User {
  email: string
  password: string
  nombre: string
  rol: UserRole
}

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, nombre: string, rol: UserRole) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LS_USERS_KEY = 'sigeu_users'
const LS_CURRENT_USER_KEY = 'sigeu_current_user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function safeParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeParse<User>(localStorage.getItem(LS_CURRENT_USER_KEY))
    if (saved && typeof saved.email === 'string' && saved.email.trim() !== '') return saved
    return null
  })

  const isAuthenticated = !!currentUser

  const login = async (email: string, password: string) => {
    // 1) tu lógica local (rol/nombre)
    const users = safeParse<User[]>(localStorage.getItem(LS_USERS_KEY)) ?? []
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return false

    // 2) pedir JWT al backend (SimpleJWT usa username)
    const resp = await fetch(`${API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: email, password }),
    })

    const data = await resp.json().catch(() => null)
    if (!resp.ok || !data?.access) return false

    localStorage.setItem('access_token', String(data.access))
    if (data.refresh) localStorage.setItem('refresh_token', String(data.refresh))

    setCurrentUser(found)
    localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(found))
    return true
  }

  const register = async (email: string, password: string, nombre: string, rol: UserRole) => {
    const users = safeParse<User[]>(localStorage.getItem(LS_USERS_KEY)) ?? []
    const exists = users.some(u => u.email === email)
    if (exists) return false

    const newUser: User = { email, password, nombre, rol }
    const updated = [...users, newUser]

    localStorage.setItem(LS_USERS_KEY, JSON.stringify(updated))
    localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(newUser))
    setCurrentUser(newUser)
    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(LS_CURRENT_USER_KEY)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const value = useMemo<AuthContextType>(
    () => ({ currentUser, isAuthenticated, login, register, logout }),
    [currentUser, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}






