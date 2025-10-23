/**
 * 애니메이션 설정
 * - 성공/실패 애니메이션 설정
 * - 애니메이션 on/off 설정
 */

// 애니메이션 설정
let animationEnabled = true

/**
 * 애니메이션 활성화/비활성화 설정
 */
export function setAnimationEnabled(enabled: boolean) {
  animationEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('animation_enabled', enabled ? 'true' : 'false')
  }
}

/**
 * 애니메이션 활성화 상태 가져오기
 */
export function getAnimationEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('animation_enabled')
    if (saved !== null) {
      animationEnabled = saved === 'true'
    }
  }
  return animationEnabled
}

/**
 * 애니메이션 지속 시간 설정 (밀리초)
 */
export const ANIMATION_DURATION = {
  /** 축하 아이콘 표시 시간 */
  SUCCESS_ICON_SHOW: 800,
  /** 축하 아이콘 페이드 아웃 시간 */
  SUCCESS_ICON_FADE: 300,
  /** 골드 증가 애니메이션 */
  GOLD_INCREASE: 600,
  /** 카드 생성 */
  CARD_SCALE_IN: 400,
  /** 모달 표시 */
  MODAL_SCALE_IN: 300,
} as const

/**
 * 애니메이션 클래스 설정
 */
export const ANIMATION_CLASSES = {
  /** 카드 생성 애니메이션 */
  CARD_SCALE_IN: 'card-scale-in',
  /** 빠른 카드 생성 */
  CARD_SCALE_IN_FAST: 'card-scale-in-fast',
  /** 카드 페이드인 (위로) */
  CARD_FADE_IN_UP: 'card-md-animated animate__animated animate__fadeInUp',
  /** 모달 생성 */
  MODAL_SCALE_IN: 'card-scale-in-fast',
} as const
