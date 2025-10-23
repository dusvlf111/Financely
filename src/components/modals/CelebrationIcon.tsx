"use client"
import React, { useEffect, useState } from 'react'
import { ANIMATION_DURATION } from '@/lib/config/animations'

interface CelebrationIconProps {
  show: boolean
  type: 'success' | 'error'
  onComplete?: () => void
}

/**
 * 축하/실패 아이콘 애니메이션 컴포넌트
 * - 성공: ✓ 아이콘이 크게 나타났다가 사라짐
 * - 실패: ✕ 아이콘이 크게 나타났다가 사라짐
 */
export default function CelebrationIcon({ show, type, onComplete }: CelebrationIconProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // show가 true로 바뀌고 아직 표시하지 않은 경우에만 실행
    if (show && !hasShown) {
      setHasShown(true)
      setIsVisible(true)
      setIsFadingOut(false)

      // 아이콘 표시 시간 후 페이드 아웃 시작
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true)
      }, ANIMATION_DURATION.SUCCESS_ICON_SHOW)

      // 페이드 아웃 완료 후 숨김
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        setIsFadingOut(false)
        setHasShown(false)
        if (onComplete) onComplete()
      }, ANIMATION_DURATION.SUCCESS_ICON_SHOW + ANIMATION_DURATION.SUCCESS_ICON_FADE)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }

    // show가 false가 되면 상태 리셋
    if (!show && hasShown) {
      setHasShown(false)
      setIsVisible(false)
      setIsFadingOut(false)
    }
  }, [show, hasShown, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div
        className={`
          ${type === 'success' ? 'bg-green-400/80' : 'bg-red-400/80'}
          rounded-full p-8
          ${isFadingOut ? 'animate__animated animate__zoomOut animate__faster' : 'animate__animated animate__zoomIn animate__faster'}
        `}
        style={{
          animationDuration: isFadingOut ? `${ANIMATION_DURATION.SUCCESS_ICON_FADE}ms` : '300ms'
        }}
      >
        {type === 'success' ? (
          <div className="text-6xl">🎉</div>
        ) : (
          <svg
            className="w-24 h-24 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
    </div>
  )
}
