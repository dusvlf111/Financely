import { create } from 'zustand'
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

export const useGoldStore = create<GoldState>()((set, get) => ({
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
        console.error('Error fetching gold history:', error)
        return
      }

      if (data) {
        // Convert database timestamps to milliseconds
        const history: GoldHistoryEntry[] = data.map((entry) => ({
          timestamp: new Date(entry.timestamp).getTime(),
          gold: entry.gold,
        }))
        set({ history })
      }
    } catch (error) {
      console.error('Error fetching gold history:', error)
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

      const { error } = await supabase
        .from('gold_history')
        .insert({
          user_id: userId,
          gold,
          timestamp: new Date().toISOString(),
        })

      if (error) {
        console.error('Error adding gold entry:', error)
        return
      }

      // Optimistically update local state
      const newEntry: GoldHistoryEntry = {
        timestamp: Date.now(),
        gold,
      }
      set({ history: [...currentHistory, newEntry] })
    } catch (error) {
      console.error('Error adding gold entry:', error)
    }
  },
}))