import React from 'react'
import Image from 'next/image'
import type { Problem } from '@/lib/mock/problems'

interface ProblemFailViewProps {
  problem: Problem
  lostGold: number
  onRetry: () => void
}

export default function ProblemFailView({ problem, lostGold, onRetry }: ProblemFailViewProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border-2 border-red-500 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">❌</span>
          <span className="text-lg font-bold text-red-700">아쉽지만 오답입니다</span>
        </div>
        <p className="text-sm text-red-700">🔥 연속 정답 기록이 초기화되었습니다.</p>
        <div className="flex items-center gap-1 text-red-700 font-bold mt-1">
          <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} />
          <span>-{lostGold} 골드가 차감되었습니다.</span>
        </div>
        <p className="text-red-700 mb-2 mt-2">정답: <strong>{problem.correctAnswer}</strong></p>
        <p className="text-sm text-red-600">다시 도전하려면 에너지가 {problem.energyCost} 필요합니다.</p>
      </div>

      {problem.explanation && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="font-semibold text-amber-900 mb-2">📚 상세 해설</h4>
          <p className="text-sm text-amber-800">{problem.explanation}</p>
        </div>
      )}

      <button onClick={onRetry} className="w-full btn-primary">이 문제 다시 풀기</button>
    </div>
  )
}