import React from 'react'
import Image from 'next/image'
import type { Problem } from '@/lib/mock/problems'

interface ProblemHeaderProps {
  problem: Problem
}

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">{problem.category}</span>
        <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">{problem.difficulty}</span>
      </div>
      <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
      <p className="text-neutral-600 mb-4">{problem.description}</p>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1 text-sm">
          <span>에너지:</span> <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} /> {problem.energyCost}
        </div>
        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
          <span>보상:</span> <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} /> +{problem.rewardGold}
        </div>
      </div>
    </>
  )
}