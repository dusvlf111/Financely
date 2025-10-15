export type LevelSummary = {
  tier: string
  level: number
  currentPoints: number
  nextLevelPoints: number
}

const progress: LevelSummary = {
  tier: 'Bronze',
  level: 2,
  currentPoints: 320,
  nextLevelPoints: 500,
}

export default progress
