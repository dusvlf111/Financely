"use client"
import React, { useEffect, useState } from 'react'

interface GoldIncreaseAnimationProps {
  amount: number
  show: boolean
  onComplete?: () => void
  startPosition?: { top: number; left: number }
}

/**
 * 골드 증가 애니메이션 컴포넌트
 * - 골드가 증가할 때 +금액이 위로 떠오르며 연기처럼 사라지는 애니메이션
 */
export default function GoldIncreaseAnimation({ amount, show, onComplete, startPosition }: GoldIncreaseAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (show && !hasShown && amount > 0) {
      setHasShown(true)
      setIsVisible(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
        setHasShown(false)
        if (onComplete) onComplete()
      }, 1500) // 애니메이션 시간과 일치

      return () => clearTimeout(timer)
    }

    if (!show && hasShown) {
      setHasShown(false)
      setIsVisible(false)
    }
  }, [show, amount])

  if (!isVisible || amount <= 0) return null

  // 시작 위치가 지정되지 않은 경우 기본 위치 사용
  const top = startPosition?.top ?? 200
  const left = startPosition?.left ?? '50%'

  return (
    <div
      className="fixed z-[90] pointer-events-none"
      style={{
        top: `${top}px`,
        left: typeof left === 'number' ? `${left}px` : left,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="gold-float-up">
        <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 font-bold px-3 py-1.5 rounded-full">
          <span className="text-2xl">💰</span>
          <span className="text-base">+{amount}</span>
        </div>
      </div>
    </div>
  )
}
