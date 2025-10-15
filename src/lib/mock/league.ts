export type LeagueEntry = {
  rank: number
  name: string
  gold: number
}

const weekly: LeagueEntry[] = [
  { rank: 1, name: '사용자A', gold: 1420 },
  { rank: 2, name: '사용자B', gold: 1200 },
  { rank: 3, name: '사용자C', gold: 1100 },
]

const monthly: LeagueEntry[] = [
  { rank: 1, name: '사용자C', gold: 8200 },
  { rank: 2, name: '사용자A', gold: 7800 },
  { rank: 3, name: '사용자B', gold: 7400 },
]

export default { weekly, monthly }
