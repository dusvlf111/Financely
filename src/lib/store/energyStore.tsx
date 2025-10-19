"use client"
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import React, { createContext, useContext, useEffect } from 'react'

const ENERGY_RECOVERY_SECONDS = 60 // 1분으로 수정 (기존: 4 * 60 * 60)
const AUTO_RECOVERY_THRESHOLD = 5 // 5개 이하일 때만 자동 충전

interface EnergyState {
  energy: number
  lastUpdated: number
  remainingSeconds: number | null
  consume: (amount?: number) => boolean
  add: (amount: number) => void
  _updateEnergy: () => void
}

const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      energy: AUTO_RECOVERY_THRESHOLD,
      lastUpdated: Date.now(),
      remainingSeconds: null,

      consume: (amount = 1) => {
        if (get().energy >= amount) {
          set(state => ({
            energy: state.energy - amount,
            lastUpdated: state.energy > AUTO_RECOVERY_THRESHOLD ? state.lastUpdated : Date.now(),
          }))
          return true
        }
        return false
      },

      add: (amount: number) => {
        set(state => ({
          energy: state.energy + amount, // 최대 제한 제거
        }))
      },

      _updateEnergy: () => {
        set(state => {
          // 5개 이하일 때만 자동 충전
          if (state.energy >= AUTO_RECOVERY_THRESHOLD) {
            return { remainingSeconds: null }
          }

          const now = Date.now()
          const elapsed = Math.floor((now - state.lastUpdated) / 1000)
          const recoveredEnergy = Math.floor(elapsed / ENERGY_RECOVERY_SECONDS)

          if (recoveredEnergy > 0) {
            const newEnergy = Math.min(AUTO_RECOVERY_THRESHOLD, state.energy + recoveredEnergy)
            const newLastUpdated = state.lastUpdated + recoveredEnergy * ENERGY_RECOVERY_SECONDS * 1000
            return { energy: newEnergy, lastUpdated: newLastUpdated }
          }

          const nextRecoveryTime = state.lastUpdated + ENERGY_RECOVERY_SECONDS * 1000
          const remaining = Math.max(0, Math.ceil((nextRecoveryTime - now) / 1000))
          return { remainingSeconds: remaining }
        })
      },
    }),
    {
      name: 'financely-energy-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

const EnergyContext = createContext(useEnergyStore.getState())

export const EnergyProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useEnergyStore()
  const _updateEnergy = useEnergyStore(state => state._updateEnergy)
  useEffect(() => {
    _updateEnergy()
    const interval = setInterval(() => _updateEnergy(), 1000)
    return () => clearInterval(interval)
  }, [_updateEnergy])
  return <EnergyContext.Provider value={store}>{children}</EnergyContext.Provider>
}

export const useEnergy = () => useContext(EnergyContext)