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

  const baseRewardText = `기본 보상으로 ${problem.rewardGold}골드가 지급되었습니다.`
  const streakBonusText = earnedBonus.gold > 0 ? `🔥 ${streak}연속 정답! 보너스 골드 +${earnedBonus.gold} 획득!` : null
  const energyBonusText = earnedBonus.energy > 0 ? `⚡ 보너스 에너지 +${earnedBonus.energy}개 환급!` : null

  return (
    <div className="space-y-4">
      <div id="success-card" className="p-4 bg-green-50 border-2 border-green-500 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl sm:text-2xl">✅</span>
          <span className="text-base sm:text-lg font-bold text-green-700">정답입니다!</span>
        </div>
        <div className="text-green-700 space-y-1 text-sm sm:text-base">
          <div className="flex items-center gap-1 flex-wrap" aria-label={baseRewardText}>
            <span className="sr-only">{baseRewardText}</span>
            <span className="whitespace-nowrap">기본 보상으로</span>
            <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} />
            <strong className="whitespace-nowrap">{problem.rewardGold}</strong>
            <span className="whitespace-nowrap">골드가 지급되었습니다.</span>
          </div>
          {streakBonusText && (
            <div className="flex items-center gap-1 flex-wrap font-bold text-sm sm:text-base" aria-label={streakBonusText}>
              <span className="sr-only">{streakBonusText}</span>
              <span className="flex items-center gap-1 whitespace-nowrap" aria-hidden="true">
                <span aria-hidden="true">🔥</span>
                <span>{streak}연속 정답! 보너스</span>
              </span>
              <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap" aria-hidden="true">골드</span>
              <strong className="whitespace-nowrap">+{earnedBonus.gold}</strong>
              <span className="whitespace-nowrap" aria-hidden="true">획득!</span>
            </div>
          )}
          {energyBonusText && (
            <div className="flex items-center gap-1 flex-wrap font-bold text-sm sm:text-base" aria-label={energyBonusText}>
              <span className="sr-only">{energyBonusText}</span>
              <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap" aria-hidden="true">보너스 에너지</span>
              <strong className="whitespace-nowrap">+{earnedBonus.energy}</strong>
              <span className="whitespace-nowrap" aria-hidden="true">개 환급!</span>
            </div>
          )}
        </div>
      </div>

      {problem.explanation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">📚 해설</h4>
          <p className="text-xs sm:text-sm text-blue-800">{problem.explanation}</p>
        </div>
      )}

      <button onClick={onNext} className="w-full btn-primary text-sm sm:text-base">다음 문제로 →</button>
    </div>
  )
}