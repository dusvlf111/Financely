import React from 'react'
import Link from 'next/link'
import type { Problem } from '@/lib/mock/problems'

interface ProblemItemProps {
  problem: Problem
}

export default function ProblemItem({ problem: p }: ProblemItemProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition">
      <Link href={`/problems/${p.id}`} className="block no-underline">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded font-medium">
                {p.category}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                p.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {p.difficulty === 'easy' ? '초급' : p.difficulty === 'medium' ? '중급' : '고급'}
              </span>
            </div>
            <div className="font-semibold text-lg text-gray-900">{p.title}</div>
            <div className="text-sm text-gray-600 mt-1">{p.description}</div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">⚡ {p.energyCost}</span>
            <span className="text-green-600 font-semibold">+{p.rewardGold}G</span>
          </div>
          <div className="text-primary-500 font-semibold">풀기 →</div>
        </div>
      </Link>
    </div>
  )
}