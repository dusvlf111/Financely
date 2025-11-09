"use client"
import React from 'react'
import type { QuestSubmitResponse } from '@/lib/types/quest'

interface QuestResultModalProps {
  result: QuestSubmitResponse | null
  isOpen: boolean
  onClose: () => void
}

export default function QuestResultModal({ result, isOpen, onClose }: QuestResultModalProps) {
  if (!isOpen || !result) return null

  const isSuccess = result.is_correct

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate__animated animate__bounceIn">
        {/* Success/Failure Icon */}
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-6xl">✓</span>
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-6xl">✗</span>
            </div>
          )}
        </div>

        {/* Result Message */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {isSuccess ? '정답입니다!' : '아쉽습니다!'}
          </h2>
          <p className="text-neutral-600">{result.message}</p>
        </div>

        {/* Show correct answer if failed */}
        {!isSuccess && result.correct_answer && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-600 mb-1">정답:</p>
            <p className="text-lg font-semibold text-blue-600">{result.correct_answer}</p>
          </div>
        )}

        {/* Rewards (if success) */}
        {isSuccess && result.reward && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-center font-semibold mb-3">보상을 획득했습니다:</p>
            <div className="space-y-2">
              {result.reward.gold && result.reward.gold > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-lg font-bold text-green-600">골드 +{result.reward.gold}</span>
                </div>
              )}
              {result.reward.energy && result.reward.energy > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-lg font-bold text-blue-600">에너지 +{result.reward.energy}</span>
                </div>
              )}
              {result.reward.stock_name && result.reward.stock_value && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">📈</span>
                  <span className="text-lg font-bold text-purple-600">
                    {result.reward.stock_name} {result.reward.stock_value.toLocaleString()}원
                  </span>
                  <span className="text-sm text-neutral-600">
                    ({result.reward.reward_type === '확정' ? '확정 보상' : '응모권'})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Failure warning */}
        {!isSuccess && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-center text-red-700">
              이 퀘스트는 사라집니다.<br />
              다음 기회를 노려보세요!
            </p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-primary-600 text-black rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  )
}
