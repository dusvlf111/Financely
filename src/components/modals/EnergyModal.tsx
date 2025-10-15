"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useEnergy } from '@/lib/store/energyStore'

export default function EnergyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, spendGold } = useAuth()
  const { add, maxEnergy } = useEnergy()

  if (!open) return null

  function handleBuy() {
    // price: 100G per energy
    const price = 100
    if (!spendGold) return
    const ok = spendGold(price)
    if (ok) {
      add(1)
      onClose()
    } else {
      alert('골드가 부족합니다.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-80">
        <h3 className="font-medium mb-2">에너지 충전</h3>
        <div className="text-sm text-neutral-600 mb-4">골드로 에너지를 구매할 수 있습니다. 1에너지 = 100G</div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 bg-neutral-100 rounded" onClick={onClose}>취소</button>
          <button className="px-3 py-2 bg-primary-600 text-black rounded" onClick={handleBuy}>구매하기</button>
        </div>
      </div>
    </div>
  )
}
