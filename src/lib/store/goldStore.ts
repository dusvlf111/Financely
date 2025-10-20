import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'

export type GoldHistoryEntry = {
  timestamp: number
  gold: number
}

interface GoldState {
  history: GoldHistoryEntry[]
  todayStartGold: number | null
  isLoading: boolean
  setTodayStartGold: (gold: number) => void
  fetchHistory: (userId: string) => Promise<void>
  addGoldEntry: (userId: string, gold: number) => Promise<void>
}

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      history: [],
      todayStartGold: null,
      isLoading: false,

  setTodayStartGold: (gold: number) => set({ todayStartGold: gold }),

  // Fetch gold history from database
  fetchHistory: async (userId: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('gold_history')
        .select('timestamp, gold')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.warn('Gold history table not available or error:', error.message)
        // 테이블이 없거나 권한 문제 - 빈 배열로 설정
        set({ history: [], isLoading: false })
        return
      }

      if (data && data.length > 0) {
        // Convert database timestamps to milliseconds
        const history: GoldHistoryEntry[] = data.map((entry) => ({
          timestamp: new Date(entry.timestamp).getTime(),
          gold: entry.gold,
        }))
        set({ history })
      } else {
        // 데이터가 없으면 빈 배열
        set({ history: [] })
      }
    } catch (error) {
      console.warn('Error fetching gold history:', error)
      set({ history: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  // Add new gold entry to database
  addGoldEntry: async (userId: string, gold: number) => {
    try {
      const currentHistory = get().history

      // Don't add if the gold value hasn't changed
      if (currentHistory.length > 0 && currentHistory[currentHistory.length - 1].gold === gold) {
        return
      }

      // Optimistically update local state first
      const newEntry: GoldHistoryEntry = {
        timestamp: Date.now(),
        gold,
      }
      set({ history: [...currentHistory, newEntry] })

      // Try to save to database (optional - won't fail if table doesn't exist)
      const { error } = await supabase
        .from('gold_history')
        .insert({
          user_id: userId,
          gold,
          timestamp: new Date().toISOString(),
        })

      if (error) {
        console.warn('Could not save gold history to database:', error.message)
        // Local state is already updated, so we can continue
      }
    } catch (error) {
      console.warn('Error adding gold entry:', error)
      // Continue with local state only
    }
  },
    }),
    {
      name: 'financely-gold-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)