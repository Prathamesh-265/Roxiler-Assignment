import React, { createContext, useContext, useMemo, useState } from "react"

export type UserRole = "admin" | "user" | "owner"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: UserRole
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  login: (payload: { token: string; user: AuthUser }) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const LS_TOKEN = "roxiler.token"
const LS_USER = "roxiler.user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LS_TOKEN))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(LS_USER)
    return raw ? JSON.parse(raw) : null
  })

  const value = useMemo<AuthState>(() => {
    return {
      token,
      user,
      login: ({ token, user }) => {
        localStorage.setItem(LS_TOKEN, token)
        localStorage.setItem(LS_USER, JSON.stringify(user))
        setToken(token)
        setUser(user)
      },
      logout: () => {
        localStorage.removeItem(LS_TOKEN)
        localStorage.removeItem(LS_USER)
        setToken(null)
        setUser(null)
      },
    }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
