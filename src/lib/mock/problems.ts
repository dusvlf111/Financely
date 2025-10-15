export type Problem = {
  id: string
  title: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  energyCost: number
  rewardGold: number
  correctAnswer?: string
}

const problems: Problem[] = [
  {
    id: 'p1',
    title: '복리 계산 기본',
    description: '원금과 이율로 단기간 복리를 계산하는 문제입니다.',
    difficulty: 'easy',
    energyCost: 1,
    rewardGold: 10,
    correctAnswer: '1100',
  },
  {
    id: 'p2',
    title: '예산 분배 시나리오',
    description: '한정된 예산을 여러 항목에 효율적으로 배분하는 문제입니다.',
    difficulty: 'medium',
    energyCost: 2,
    rewardGold: 25,
    correctAnswer: 'a',
  },
  {
    id: 'p3',
    title: '투자 리스크 계산',
    description: '포트폴리오의 기대수익과 분산을 통해 리스크를 평가합니다.',
    difficulty: 'hard',
    energyCost: 3,
    rewardGold: 60,
    correctAnswer: 'risk',
  },
]

export default problems
