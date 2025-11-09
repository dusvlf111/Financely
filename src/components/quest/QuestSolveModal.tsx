"use client"
import React, { useState, useEffect } from 'react'
import type { Quest } from '@/lib/types/quest'

interface QuestSolveModalProps {
  quest: Quest | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (answer: string, timeTaken: number) => void
}

export default function QuestSolveModal({ quest, isOpen, onClose, onSubmit }: QuestSolveModalProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && quest) {
      setTimeRemaining(quest.time_limit || 60)
      setStartTime(Date.now())
      setUserAnswer('')
    }
  }, [isOpen, quest])

  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, timeRemaining])

  const handleSubmit = (isTimeout = false) => {
    if (!quest || !startTime) return
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    
    if (isTimeout) {
      onSubmit('', timeTaken)
    } else {
      onSubmit(userAnswer, timeTaken)
    }
    
    onClose()
  }

  if (!isOpen || !quest) return null

  const getTimerColor = () => {
    if (timeRemaining > 30) return 'text-blue-600'
    if (timeRemaining > 10) return 'text-orange-600'
    return 'text-red-600 animate-pulse'
  }

  const isMultipleChoice = quest.answer_options && quest.answer_options.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 animate__animated animate__fadeIn">
        {/* Timer */}
        <div className="mb-6">
          <div className={`text-center text-4xl font-bold ${getTimerColor()}`}>
            ⏱️ {timeRemaining}초 남음
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{quest.title}</h2>
          <div className="bg-neutral-100 rounded-lg p-4">
            <p className="text-lg whitespace-pre-wrap">{quest.question}</p>
          </div>
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          {isMultipleChoice ? (
            <div className="space-y-3">
              {quest.answer_options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswer(option.charAt(0))}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    userAnswer === option.charAt(0)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                답안을 입력하세요
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="답안 입력"
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-600 focus:outline-none text-lg"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleSubmit()
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-md font-medium hover:bg-neutral-300 transition-colors"
          >
            포기하기
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={!userAnswer.trim()}
            className="flex-1 px-4 py-3 bg-primary-600 text-black rounded-md font-medium hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
          >
            제출하기
          </button>
        </div>

        {/* Warning */}
        <p className="text-center text-sm text-red-600 mt-4">
          ⚠️ 제출 후에는 수정할 수 없으며, 결과가 즉시 반영됩니다.
        </p>
      </div>
    </div>
  )
}
