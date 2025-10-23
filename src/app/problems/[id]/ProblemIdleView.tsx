import React from 'react'
import Image from 'next/image'

interface ProblemIdleViewProps {
  onStart: () => void
  energyCost: number
}

export default function ProblemIdleView({ onStart, energyCost }: ProblemIdleViewProps) {
  return (
    <button className="w-full btn-primary text-base flex items-center justify-center gap-2" onClick={onStart}>
      <span>문제 풀기</span>
      <div className="flex items-center gap-1">
        <span>(</span>
        <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
        <span>{energyCost} 소모)</span>
      </div>
    </button>
  )
}