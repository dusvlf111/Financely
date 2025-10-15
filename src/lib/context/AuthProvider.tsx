"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import mockUser from '@/lib/mock/user'

type MockUser = typeof mockUser & {
  tutorialCompleted?: boolean
}

type AuthContextType = {
  user: MockUser | null
  login: (provider: string) => void
  logout: () => void
  addGold?: (amount: number) => void
  updateProfile?: (changes: Partial<Pick<MockUser, 'name'>>) => void
  spendGold?: (amount: number) => boolean
  completeTutorial?: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)

  // initialize from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('financely_user')
      if (raw) {
        setUser(JSON.parse(raw) as MockUser)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  function login(provider: string) {
    // Simple mock: attach provider to name and set mock user
    const u = { ...mockUser, name: `${mockUser.name} (${provider})`, tutorialCompleted: false }
    setUser(u)
    try {
      localStorage.setItem('financely_user', JSON.stringify(u))
    } catch (e) {
      // ignore
    }
  }

  function logout() {
    setUser(null)
    try {
      localStorage.removeItem('financely_user')
    } catch (e) {
      // ignore
    }
  }

  function addGold(amount: number) {
    setUser(u => {
      if (!u) return u
      const nu = { ...u, gold: u.gold + amount }
      try {
        localStorage.setItem('financely_user', JSON.stringify(nu))
      } catch (e) {}
      return nu
    })
  }

  function spendGold(amount: number) {
    let ok = false
    setUser(u => {
      if (!u) return u
      if (u.gold >= amount) {
        ok = true
        const nu = { ...u, gold: u.gold - amount }
        try {
          localStorage.setItem('financely_user', JSON.stringify(nu))
        } catch (e) {}
        return nu
      }
      return u
    })
    return ok
  }

  function updateProfile(changes: Partial<Pick<MockUser, 'name'>>) {
    setUser(u => {
      if (!u) return u
      const nu = { ...u, ...changes }
      try {
        localStorage.setItem('financely_user', JSON.stringify(nu))
      } catch (e) {}
      return nu
    })
  }

  function completeTutorial() {
    setUser(u => {
      if (!u) return u
      const nu = { ...u, tutorialCompleted: true }
      try {
        localStorage.setItem('financely_user', JSON.stringify(nu))
      } catch (e) {}
      return nu
    })
  }

  return <AuthContext.Provider value={{ user, login, logout, addGold, updateProfile, spendGold, completeTutorial }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
