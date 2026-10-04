import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  name: string
  token?: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'campus-customs-user'

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null)
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await parseError(res, 'Login failed. Please try again.'))
    setUser(await res.json())
  }

  async function register(data: RegisterData) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await parseError(res, 'Could not create your account.'))
    setUser(await res.json())
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
