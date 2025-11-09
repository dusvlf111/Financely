"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  gold: number
  energy: number
  level: number
  xp: number
  streak: number
  tutorialCompleted?: boolean
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  login: (provider: string) => Promise<void>
  logout: () => Promise<void>
  addGold?: (amount: number) => Promise<void>
  updateProfile?: (changes: Partial<Profile>) => Promise<void>
  addXp?: (amount: number) => Promise<void>
  streak: number
  incrementStreak: () => Promise<void>
  resetStreak: () => Promise<void>
  trackQuestProgress?: (questType: string) => Promise<void>
  spendGold?: (amount: number) => Promise<boolean>
  completeTutorial?: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user
      setUser(currentUser ?? null)
      if (currentUser) {
        // Fetch profile when user session changes
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
          .then(({ data }) => {
            if (data) {
              // DB (snake_case) -> JS (camelCase)
              const formattedProfile: Profile = {
                ...data,
                username: data.username,
                full_name: data.full_name,
                avatar_url: data.avatar_url,
                gold: data.gold,
                energy: data.energy,
                level: data.level,
                xp: data.xp,
                tutorialCompleted: data.tutorial_completed,
              }
              setProfile(formattedProfile)
            }
          })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Gold history is now automatically tracked by database trigger
  // No need for manual sync here

  async function login(provider: string) {
    await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function addGold(amount: number) {
    if (!user || !profile) return
    const newGold = profile.gold + amount
    const { data } = await supabase
      .from('profiles')
      .update({ gold: newGold })
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      }
      setProfile(formattedProfile)
    }
  }

  async function spendGold(amount: number) {
    if (!user || !profile || profile.gold < amount) return false
    const newGold = profile.gold - amount
    const { data } = await supabase
      .from('profiles')
      .update({ gold: newGold })
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      }
      setProfile(formattedProfile)
      return true
    }
    return false
  }

  async function updateProfile(changes: Partial<Profile>) {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', user.id)
      .select()
      .single()
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      }
      setProfile(formattedProfile)
    }
  }

  async function completeTutorial() {
    if (!user) return
    await updateProfile({ tutorialCompleted: true })
  }

  async function trackQuestProgress(questType: string) {
    if (!user) return

    try {
      const { error } = await supabase.rpc('update_quest_progress', {
        quest_type: questType,
        user_id: user.id,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error tracking quest progress:', error)
    }
  }

  const incrementStreak = async () => {
    if (!user || !profile) return
    const newStreak = profile.streak + 1
    setProfile(p => (p ? { ...p, streak: newStreak } : null)) // Optimistic update
    await supabase
      .from('profiles')
      .update({ streak: newStreak })
      .eq('id', user.id)
  }

  const resetStreak = async () => {
    if (!user || !profile) return
    setProfile(p => (p ? { ...p, streak: 0 } : null)) // Optimistic update
    await supabase
      .from('profiles')
      .update({ streak: 0 })
      .eq('id', user.id)
  }

  const addXp = async (amount: number) => {
    if (!user || !profile) return

    const xpForNextLevel = profile.level * 100 // 다음 레벨업에 필요한 경험치 (예: 레벨 1 -> 100XP, 레벨 2 -> 200XP)
    const newXp = profile.xp + amount

    let newLevel = profile.level
    let finalXp = newXp

    if (newXp >= xpForNextLevel) {
      newLevel += 1
      finalXp = newXp - xpForNextLevel
      // TODO: 레벨업 축하 모달 또는 애니메이션 표시
    }

    // Optimistic UI update
    setProfile(p => (p ? { ...p, level: newLevel, xp: finalXp } : null))

    // DB update
    await supabase
      .from('profiles')
      .update({ level: newLevel, xp: finalXp })
      .eq('id', user.id)
  }

  const value = {
    user,
    profile,
    login,
    logout,
    addGold,
    addXp,
    updateProfile,
    spendGold,
    completeTutorial,
    trackQuestProgress,
    streak: profile?.streak ?? 0,
    incrementStreak,
    resetStreak,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
