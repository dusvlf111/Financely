import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type GoldHistoryEntry = {
  date: string
  gold: number
}

interface GoldState {
  history: GoldHistoryEntry[]
  todayStartGold: number | null
  initializeHistory: (initialGold: number) => void
  updateGold: (currentGold: number) => void
}

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      history: [],
      todayStartGold: null,

      initializeHistory: (initialGold: number) => {
        if (get().history.length > 0) return

        const newHistory: GoldHistoryEntry[] = []
        const baseGold = Math.max(0, initialGold - 500)
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          newHistory.push({
            date: dateStr,
            gold: baseGold + Math.floor((500 / 7) * (7 - i)),
          })
        }
        set({ history: newHistory, todayStartGold: newHistory[newHistory.length - 2]?.gold ?? initialGold })
      },

      updateGold: (currentGold: number) => {
        const today = new Date().toISOString().split('T')[0]
        const currentHistory = [...get().history]

        let todayEntry = currentHistory.find(h => h.date === today)

        if (!todayEntry) {
          const yesterdayGold = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].gold : currentGold
          todayEntry = { date: today, gold: currentGold }
          currentHistory.push(todayEntry)
          set({ todayStartGold: yesterdayGold })
        } else {
          todayEntry.gold = currentGold
        }

        // 7일 데이터만 유지
        const finalHistory = currentHistory.length > 7 ? currentHistory.slice(-7) : currentHistory

        set({ history: finalHistory })
      },
    }),
    {
      name: 'financely-gold-storage', // localStorage에 저장될 키
      storage: createJSONStorage(() => localStorage),
    }
  )
)