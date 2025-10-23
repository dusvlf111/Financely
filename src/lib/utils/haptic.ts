/**
 * 햅틱 피드백 유틸리티
 * - 스마트폰에서 진동 효과 제공
 * - 설정을 통해 on/off 가능
 */

// 햅틱 설정
let hapticEnabled = true

/**
 * 햅틱 피드백 활성화/비활성화 설정
 */
export function setHapticEnabled(enabled: boolean) {
  hapticEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('haptic_enabled', enabled ? 'true' : 'false')
  }
}

/**
 * 햅틱 활성화 상태 가져오기
 */
export function getHapticEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('haptic_enabled')
    if (saved !== null) {
      hapticEnabled = saved === 'true'
    }
  }
  return hapticEnabled
}

/**
 * 기본 진동 (짧은 진동 한 번)
 */
export function hapticLight() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(10)
}

/**
 * 중간 진동 (조금 긴 진동 한 번)
 */
export function hapticMedium() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(20)
}

/**
 * 강한 진동 (긴 진동 한 번)
 */
export function hapticHeavy() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(50)
}

/**
 * 성공 진동 (조금 긴 진동 한 번)
 * - 문제를 맞췄을 때
 */
export function hapticSuccess() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) {
    console.log('[Haptic] Success vibration blocked:', { hapticEnabled, hasNavigator: typeof window !== 'undefined', hasVibrate: navigator?.vibrate })
    return
  }
  console.log('[Haptic] Success vibration triggered')
  navigator.vibrate(200) // 200ms 긴 진동 (한 번)
}

/**
 * 실패 진동 (짧은 진동 두 번)
 * - 문제를 틀렸을 때
 */
export function hapticError() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) {
    console.log('[Haptic] Error vibration blocked:', { hapticEnabled, hasNavigator: typeof window !== 'undefined', hasVibrate: navigator?.vibrate })
    return
  }
  console.log('[Haptic] Error vibration triggered')
  navigator.vibrate([50, 100, 50]) // 50ms 진동, 100ms 대기, 50ms 진동 (짧게 두 번)
}

/**
 * 선택 진동 (아주 짧은 진동)
 * - 버튼 클릭, 옵션 선택 시
 */
export function hapticSelection() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(5)
}

/**
 * 알림 진동 (중간 진동)
 * - 골드 증가, 레벨업 등
 */
export function hapticNotification() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(30)
}

/**
 * 골드 증가 진동 (경쾌한 진동)
 */
export function hapticGoldIncrease() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate([15, 30, 15]) // 짧은 진동 두 번
}

/**
 * 경고 진동 (강한 진동 세 번)
 */
export function hapticWarning() {
  if (!hapticEnabled || typeof window === 'undefined' || !navigator.vibrate) return
  navigator.vibrate([40, 50, 40, 50, 40])
}
