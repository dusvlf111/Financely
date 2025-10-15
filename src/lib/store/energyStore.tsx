"use client"
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import React, { createContext, useContext, useEffect } from 'react'

const ENERGY_RECOVERY_SECONDS = 60 // 1분으로 수정 (기존: 4 * 60 * 60)
const MAX_ENERGY = 5

interface EnergyState {
  energy: number
  maxEnergy: number
  lastUpdated: number
  remainingSeconds: number | null
  consume: (amount?: number) => boolean
  add: (amount: number) => void
  _updateEnergy: () => void
}

const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      energy: MAX_ENERGY,
      maxEnergy: MAX_ENERGY,
      lastUpdated: Date.now(),
      remainingSeconds: null,

      consume: (amount = 1) => {
        if (get().energy >= amount) {
          set(state => ({
            energy: state.energy - amount,
            lastUpdated: state.energy === MAX_ENERGY ? Date.now() : state.lastUpdated,
          }))
          return true
        }
        return false
      },

      add: (amount: number) => {
        set(state => ({
          energy: Math.min(MAX_ENERGY, state.energy + amount),
        }))
      },

      _updateEnergy: () => {
        set(state => {
          if (state.energy >= MAX_ENERGY) {
            return { remainingSeconds: null }
          }

          const now = Date.now()
          const elapsed = Math.floor((now - state.lastUpdated) / 1000)
          const recoveredEnergy = Math.floor(elapsed / ENERGY_RECOVERY_SECONDS)

          if (recoveredEnergy > 0) {
            const newEnergy = Math.min(MAX_ENERGY, state.energy + recoveredEnergy)
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