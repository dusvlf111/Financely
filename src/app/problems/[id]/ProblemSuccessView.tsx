import React from 'react'
import Image from 'next/image'
import type { Problem } from '@/lib/mock/problems'
import { useAuth } from '@/lib/context/AuthProvider'

interface ProblemSuccessViewProps {
  problem: Problem
  earnedBonus: { gold: number; energy: number }
  onNext: () => void
}

export default function ProblemSuccessView({ problem, earnedBonus, onNext }: ProblemSuccessViewProps) {
  const { streak } = useAuth()

  return (
    <div className="space-y-4">
      <div id="success-card" className="p-4 bg-green-50 border-2 border-green-500 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✅</span>
          <span className="text-lg font-bold text-green-700">정답입니다!</span>
        </div>
        <div className="text-green-700 space-y-1">
          <div className="flex items-center gap-1">
            <span>기본 보상으로</span>
            <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} />
            <strong>{problem.rewardGold}</strong>
            <span>골드가 지급되었습니다.</span>
          </div>
          {earnedBonus.gold > 0 && (
            <div className="flex items-center gap-1 font-bold">
              <span>🔥 {streak}연속 정답! 보너스</span>
              <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} />
              <strong>+{earnedBonus.gold}</strong>
              <span>획득!</span>
            </div>
          )}
          {earnedBonus.energy > 0 && (
            <div className="flex items-center gap-1 font-bold">
              <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} />
              <span>보너스 에너지</span>
              <strong>+{earnedBonus.energy}</strong>
              <span>개 환급!</span>
            </div>
          )}
        </div>
      </div>

      {problem.explanation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">📚 해설</h4>
          <p className="text-sm text-blue-800">{problem.explanation}</p>
        </div>
      )}

      <button onClick={onNext} className="w-full btn-primary">다음 문제로 →</button>
    </div>
  )
}