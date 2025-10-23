"use client"
import React from 'react'

interface LevelUpModalProps {
  open: boolean
  onClose: () => void
  nextLevel: number
  nextCategory: string
}

export default function LevelUpModal({ open, onClose, nextLevel, nextCategory }: LevelUpModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-80 card-scale-in-fast">
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-primary-600 mb-2">
            레벨 업!
          </h2>
          <div className="text-3xl font-bold text-primary-500 mb-2">
            Level {nextLevel}
          </div>
          <p className="text-sm text-neutral-600">
            축하합니다!
          </p>
          <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md">
            <p className="font-semibold text-primary-700">다음 주제</p>
            <p className="text-sm text-primary-600 mt-1">{nextCategory}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-primary"
        >
          다음 문제로 →
        </button>
      </div>
    </div>
  )
}
