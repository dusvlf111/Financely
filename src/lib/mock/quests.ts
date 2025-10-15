export type Quest = {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly'
  progress: number
  target: number
  rewardGold: number
  rewardEnergy: number
  completed: boolean
}

export const mockQuests: Quest[] = [
  {
    id: 'q1',
    title: '주간 출석 3회',
    description: '이번 주에 3번 출석하기',
    type: 'weekly',
    progress: 2,
    target: 3,
    rewardGold: 150,
    rewardEnergy: 2,
    completed: false,
  },
  {
    id: 'q2',
    title: '주간 출석 5회',
    description: '이번 주에 5번 출석하기',
    type: 'weekly',
    progress: 2,
    target: 5,
    rewardGold: 300,
    rewardEnergy: 3,
    completed: false,
  },
  {
    id: 'q3',
    title: '일일 문제 3개 풀기',
    description: '오늘 문제 3개 풀기',
    type: 'daily',
    progress: 1,
    target: 3,
    rewardGold: 100,
    rewardEnergy: 1,
    completed: false,
  },
  {
    id: 'q4',
    title: '연속 3문제 정답',
    description: '3문제 연속으로 정답 맞히기',
    type: 'daily',
    progress: 0,
    target: 3,
    rewardGold: 200,
    rewardEnergy: 2,
    completed: false,
  },
]

export default mockQuests
