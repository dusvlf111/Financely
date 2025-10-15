export type User = {
  id: string
  nickname: string
  gold: number
  energy: number
}

export type Question = {
  id: string
  category: string
  type: 'multiple' | 'ox' | 'short'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  choices?: string[]
  answer: string
  explanation?: string
}

export type Progress = {
  userId: string
  level: number
  streak: number
}

export type League = {
  season: number
  tier: string
}

export type Quest = {
  id: string
  title: string
  rewardGold: number
}
