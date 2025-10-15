import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type GoldHistoryEntry = {
  timestamp: number
  gold: number
}

interface GoldState {
  history: GoldHistoryEntry[]
  todayStartGold: number | null
  setTodayStartGold: (gold: number) => void
  initializeHistory: (initialGold: number) => void
  updateGold: (currentGold: number) => void
}

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      history: [],
      todayStartGold: null,
      setTodayStartGold: (gold: number) => set({ todayStartGold: gold }),

      initializeHistory: (initialGold: number) => {
        if (get().history.length > 0) return // 이미 히스토리가 있으면 초기화하지 않음
        const now = Date.now()
        const initialHistory: GoldHistoryEntry[] = [{ timestamp: now, gold: initialGold }]
        set({ history: initialHistory, todayStartGold: initialGold })
      },

      updateGold: (currentGold: number) => {
        const now = Date.now()
        const newHistoryEntry = { timestamp: now, gold: currentGold }
        
        const currentHistory = get().history
        // 마지막 기록과 동일한 골드 값이면 추가하지 않음 (불필요한 데이터 방지)
        if (currentHistory.length > 0 && currentHistory[currentHistory.length - 1].gold === currentGold) {
          return
        }

        const newHistory = [...currentHistory, newHistoryEntry]

        // 성능을 위해 최근 7일 데이터만 유지
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
        const finalHistory = newHistory.filter(entry => entry.timestamp >= sevenDaysAgo)

        set({ history: finalHistory })
      },
    }),
    {
      name: 'financely-gold-storage', // localStorage에 저장될 키
      storage: createJSONStorage(() => localStorage),
    }
  )
)