import { render, screen } from '@testing-library/react'
import React from 'react'
import ProblemSuccessView from '@/app/problems/[id]/ProblemSuccessView'
import type { Problem } from '@/lib/mock/problems'

jest.mock('@/lib/context/AuthProvider', () => ({
  useAuth: () => ({ streak: 3 }),
}))

describe('ProblemSuccessView', () => {
  const baseProblem: Problem = {
    id: 'problem-1',
    category: '부동산 투자',
    difficulty: 'medium',
    title: '샘플 문제',
    description: '설명',
    options: ['선택지 1', '선택지 2', '선택지 3', '선택지 4'],
    correctAnswer: '선택지 1',
    level: 1,
    explanation: '해설',
    energyCost: 1,
    rewardGold: 40,
  }

  it('renders natural language for the base reward payout with proper spacing', () => {
    render(
      <ProblemSuccessView
        problem={baseProblem}
        earnedBonus={{ gold: 0, energy: 0 }}
        onNext={jest.fn()}
      />
    )

    expect(screen.getByText(`기본 보상으로 ${baseProblem.rewardGold}골드가 지급되었습니다.`)).toBeInTheDocument()
  })

  it('groups streak and energy bonus lines for accessibility', () => {
    render(
      <ProblemSuccessView
        problem={baseProblem}
        earnedBonus={{ gold: 110, energy: 1 }}
        onNext={jest.fn()}
      />
    )

    expect(screen.getByLabelText('🔥 3연속 정답! 보너스 골드 +110 획득!')).toBeInTheDocument()
    expect(screen.getByLabelText('⚡ 보너스 에너지 +1개 환급!')).toBeInTheDocument()
  })
})
