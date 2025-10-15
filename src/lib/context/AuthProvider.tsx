"use client"
import React, { createContext, useContext, useState } from 'react'
import mockUser from '@/lib/mock/user'

type MockUser = typeof mockUser

type AuthContextType = {
  user: MockUser | null
  login: (provider: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)

  function login(provider: string) {
    // Simple mock: attach provider to name and set mock user
    setUser({ ...mockUser, name: `${mockUser.name} (${provider})` })
  }

  function logout() {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
