"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useEnergy } from '@/lib/store/energyStore'

export default function EnergyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { spendGold } = useAuth()
  const { add } = useEnergy()

  if (!open) return null

  async function handleBuy() {
    // 10개 구매: 100G
    const energyAmount = 10
    const totalPrice = 100

    if (!spendGold) return
    const ok = await spendGold(totalPrice)
    if (ok) {
      add(energyAmount)
      onClose()
    } else {
      alert('골드가 부족합니다.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-80">
        <h3 className="font-medium mb-2">에너지 충전</h3>
        <div className="text-sm text-neutral-600 mb-4">
          골드로 에너지를 구매할 수 있습니다.
          <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-md">
            <p className="font-semibold text-primary-700">10 에너지 = 100G</p>
            <p className="text-xs text-primary-600 mt-1">한 번에 10개씩 구매됩니다</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>취소</button>
          <button className="btn-primary" onClick={handleBuy}>100G로 구매</button>
        </div>
      </div>
    </div>
  )
}
