"use client"
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

type EnergyContextType = {
  energy: number
  maxEnergy: number
  consume: (amount?: number) => boolean
  add: (amount?: number) => void
  startRecovery: () => void
  stopRecovery: () => void
  remainingSeconds?: number
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined)

export function EnergyProvider({ children }: { children: React.ReactNode }) {
  const [energy, setEnergy] = useState<number>(3)
  const maxEnergy = 5
  const intervalRef = useRef<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60)

  function consume(amount = 1) {
    let ok = false
    setEnergy(e => {
      if (e >= amount) {
        ok = true
        return e - amount
      }
      return e
    })
    return ok
  }

  function add(amount = 1) {
    setEnergy(e => Math.min(maxEnergy, e + amount))
  }

  function startRecovery() {
    if (intervalRef.current) return
    const tickSec = 1 // update UI every second
    const recoverySec = 60 // recover 1 energy every 60 seconds

    // ensure remainingSeconds is set
    setRemainingSeconds(r => (r > 0 ? r : recoverySec))

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        // if energy is full, stop timer
        let stopNow = false
        setEnergy(curr => {
          if (curr >= maxEnergy) {
            stopNow = true
            return curr
          }
          return curr
        })
        if (stopNow) {
          // clear interval in next tick
          return 0
        }

        if (prev <= 1) {
          // time to recover one energy
          setEnergy(curr => Math.min(maxEnergy, curr + 1))
          // if after adding energy we still need more, reset countdown
          return recoverySec
        }
        return prev - tickSec
      })
    }, tickSec * 1000)
  }

  function stopRecovery() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRemainingSeconds(0)
  }

  useEffect(() => {
    // start recovery automatically if energy is not full
    if (energy < maxEnergy) startRecovery()
    if (energy >= maxEnergy) stopRecovery()
    return () => stopRecovery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energy])

  return (
    <EnergyContext.Provider
      value={{ energy, maxEnergy, consume, add, startRecovery, stopRecovery, remainingSeconds }}
    >
      {children}
    </EnergyContext.Provider>
  )
}

export function useEnergy() {
  const ctx = useContext(EnergyContext)
  if (!ctx) throw new Error('useEnergy must be used within EnergyProvider')
  return ctx
}

export default EnergyProvider
