import { useState } from 'react'
import mockUser from '@/lib/mock/user'

type MockUser = typeof mockUser

export function useMockUser() {
  const [user, setUser] = useState<MockUser>(() => ({ ...mockUser }))

  function addGold(amount: number) {
    setUser(u => ({ ...u, gold: u.gold + amount }))
  }

  function consumeEnergy(amount = 1) {
    setUser(u => ({ ...u, energy: Math.max(0, u.energy - amount) }))
  }

  return { user, addGold, consumeEnergy }
}

export default useMockUser
