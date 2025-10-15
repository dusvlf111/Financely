export type AssetItem = {
  id: string
  name: string
  amount: number
  value: number
}

const assets: AssetItem[] = [
  { id: 'a1', name: '현금', amount: 1, value: 120000 },
  { id: 'a2', name: '국내주식 A', amount: 10, value: 45000 },
  { id: 'a3', name: '해외주식 B', amount: 5, value: 78000 },
]

export default assets
