import { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react'

export type UserRole = 'estudiante' | 'administrativo'

export interface User {
  id: string
  email: string
  password: string
  nombre: string
  rol: UserRole
}

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, nombre: string, rol: UserRole) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Cargar usuarios desde localStorage
  const getUsers = (): User[] => {
    const users = localStorage.getItem('sigeu_users')
    return users ? JSON.parse(users) : []
  }

  // Guardar usuarios en localStorage
  const saveUsers = (users: User[]) => {
    localStorage.setItem('sigeu_users', JSON.stringify(users))
  }

  // Restaurar sesión al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('sigeu_current_user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    const users = getUsers()
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      setCurrentUser(user)
      localStorage.setItem('sigeu_current_user', JSON.stringify(user))
      return true
    }
    return false
  }

  const register = (email: string, password: string, nombre: string, rol: UserRole): boolean => {
    const users = getUsers()

    // Verificar si el email ya existe
    if (users.some(u => u.email === email)) {
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      nombre,
      rol,
    }

    users.push(newUser)
    saveUsers(users)

    // Auto-login después de registrarse
    setCurrentUser(newUser)
    localStorage.setItem('sigeu_current_user', JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('sigeu_current_user')
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
