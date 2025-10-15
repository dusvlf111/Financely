"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEnergy } from '@/lib/store/energyStore'
import EnergyModal from '@/components/modals/EnergyModal'

export default function LevelProgress() {
  const router = useRouter()
  const { energy, maxEnergy, consume, remainingSeconds } = useEnergy()
  const [showModal, setShowModal] = useState(false)
  return (
    <div className="bg-white border rounded-md p-4">
      <h4 className="text-sm text-neutral-500">이번 레벨 진행도</h4>
      <div className="mt-2">
        <div className="text-base font-semibold">Bronze Tier</div>
        <div className="text-sm text-neutral-600">Level 2: 저축의 시작 (3/5 완료)</div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
          <div className="bg-primary-500 h-3" style={{ width: '60%' }} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">예상 보상: +50 +60 +0</div>
          <div className="flex items-center gap-3">
              <div className="text-sm">
                에너지: <span className="font-medium">{energy}</span>
                {energy < maxEnergy && typeof remainingSeconds === 'number' && remainingSeconds > 0 && (
                  <span className="text-xs text-neutral-500 ml-2">(다음 에너지: {formatTime(remainingSeconds)})</span>
                )}
              </div>
              <button
                className="px-3 py-2 bg-primary-600 text-white rounded-md"
                onClick={() => {
                  const ok = consume(1)
                  if (!ok) setShowModal(true)
                  else router.push('/problems')
                }}
              >
                다음 문제 풀기
              </button>
                <EnergyModal open={showModal} onClose={() => setShowModal(false)} />
          </div>
        </div>
      </div>
    </div>
  )
}

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    const mm = m.toString().padStart(2, '0')
    const ss = s.toString().padStart(2, '0')
    return `${mm}:${ss}`
  }
