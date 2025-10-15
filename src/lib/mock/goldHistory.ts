export type GoldPoint = {
  date: string // ISO date
  gold: number
}

const goldHistory: GoldPoint[] = [
  { date: '2025-10-08', gold: 950 },
  { date: '2025-10-09', gold: 980 },
  { date: '2025-10-10', gold: 1020 },
  { date: '2025-10-11', gold: 1060 },
  { date: '2025-10-12', gold: 1100 },
  { date: '2025-10-13', gold: 1120 },
  { date: '2025-10-14', gold: 1180 },
]

export default goldHistory
