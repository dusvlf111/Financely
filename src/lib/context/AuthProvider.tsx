"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useGoldStore } from '@/lib/store/goldStore'
import type { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  gold: number
  energy: number
  tutorialCompleted?: boolean
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  login: (provider: string) => void
  logout: () => void
  addGold?: (amount: number) => void
  updateProfile?: (changes: Partial<Pick<MockUser, 'name'>>) => void
  streak: number
  incrementStreak: () => void
  resetStreak: () => void
  trackQuestProgress?: (questType: string) => void
  spendGold?: (amount: number) => boolean
  completeTutorial?: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [streak, setStreak] = useState(0)
  const { updateGold: updateGoldHistory } = useGoldStore()

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

  // Sync user.gold changes to the goldStore
  useEffect(() => {
    if (profile) {
      updateGoldHistory(profile.gold)
    }
  }, [profile?.gold, updateGoldHistory])

  async function login(provider: 'google' | 'kakao' | 'naver') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function addGold(amount: number) {
    if (!user || !profile) return
    const newGold = profile.gold + amount
    const { data, error } = await supabase
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
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      }
      setProfile(formattedProfile)
    }
  }

  async function spendGold(amount: number) {
    if (!user || !profile || profile.gold < amount) return false
    const newGold = profile.gold - amount
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      }
      setProfile(formattedProfile)
    }
  }

  async function completeTutorial() {
    if (!user) return
    await updateProfile({ tutorial_completed: true })
  }

  async function trackQuestProgress(questType: string) {
    if (!user) return
    const { error } = await supabase.rpc('update_quest_progress', { quest_type_param: questType })
    if (error) {
      console.error('Error tracking quest progress:', error)
    }
  }

  const incrementStreak = () => setStreak(s => s + 1)
  const resetStreak = () => setStreak(0)

  const value = {
    user,
    profile,
    login,
    logout,
    addGold,
    updateProfile,
    spendGold,
    completeTutorial,
    trackQuestProgress,
    streak,
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
