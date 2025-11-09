"use client"
import React from 'react'
import type { Quest } from '@/lib/types/quest'

interface QuestConfirmModalProps {
  quest: Quest | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function QuestConfirmModal({ quest, isOpen, onClose, onConfirm }: QuestConfirmModalProps) {
  if (!isOpen || !quest) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate__animated animate__fadeIn">
        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-center">퀘스트 도전</h2>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Warning Messages */}
        <div className="text-center mb-4 space-y-2">
          <p className="text-red-600 font-semibold">이 퀘스트는 한 번만 도전할 수 있습니다.</p>
          <p className="text-red-600 font-semibold">실패 시 퀘스트가 사라집니다.</p>
        </div>

        {/* Quest Info Summary */}
        <div className="bg-neutral-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">퀘스트 정보</h3>
          <div className="space-y-1 text-sm">
            {quest.time_limit && (
              <div className="flex justify-between">
                <span className="text-neutral-600">제한 시간:</span>
                <span className="font-medium">{quest.time_limit}초</span>
              </div>
            )}
            {quest.reward_stock_name && quest.reward_stock_value && (
              <div className="flex justify-between">
                <span className="text-neutral-600">보상:</span>
                <span className="font-medium text-purple-600">
                  {quest.reward_stock_name} {quest.reward_stock_value.toLocaleString()}원 {quest.reward_type}
                </span>
              </div>
            )}
            {quest.reward_gold > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">보상:</span>
                <span className="font-medium text-green-600">골드 +{quest.reward_gold}</span>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Question */}
        <p className="text-center text-lg font-medium mb-6">도전하시겠습니까?</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-md font-medium hover:bg-neutral-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 px-4 py-3 bg-primary-600 text-black rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            도전하기
          </button>
        </div>
      </div>
    </div>
  )
}
