import type { Category } from '@/lib/mock/problems'

export const LEVEL_CATEGORIES: Record<number, Category> = {
  0: '금융 기초',
  1: '저축과 예산',
  2: '신용 관리',
  3: '주식 투자',
  4: '채권과 안전자산',
  5: '세금',
  6: '기업 분석',
  7: '부동산 투자',
  8: '보험과 연금',
  9: '투자 전략',
  10: '자산배분',
  11: '종합 재무설계',
}

export const levelInfo: Record<number, { tier: string; title: string }> = {
  0: { tier: 'Bronze V', title: '금융이란 무엇인가?' },
  1: { tier: 'Bronze IV', title: '저축의 시작' },
  2: { tier: 'Bronze III', title: '신용관리 기초' },
  3: { tier: 'Silver V', title: '주식의 세계' },
  4: { tier: 'Silver IV', title: '채권과 안전자산' },
  5: { tier: 'Silver III', title: '세금의 기초' },
  6: { tier: 'Gold V', title: '기업 분석' },
  7: { tier: 'Gold IV', title: '부동산 투자' },
  8: { tier: 'Gold III', title: '보험과 연금' },
  9: { tier: 'Platinum V', title: '투자 전략' },
  10: { tier: 'Platinum IV', title: '자산배분' },
  11: { tier: 'Platinum III', title: '종합 재무설계' },
}