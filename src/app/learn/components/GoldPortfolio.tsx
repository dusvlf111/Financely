"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import goldHistory from '@/lib/mock/goldHistory'

export default function GoldPortfolio() {
  const { user } = useAuth()

  return (
    <div className="bg-white border rounded-md p-4">
      <h4 className="text-sm text-neutral-500">나의 골드 포트폴리오</h4>
      <div className="flex items-baseline gap-3">
        <div className="text-2xl font-bold">{user ? `${user.gold}G` : '—'}</div>
        <div className="text-sm text-green-600">↗ +180</div>
      </div>
      <div className="mt-3">
        <div className="h-36 bg-neutral-50 rounded-md p-3">
          <Sparkline data={goldHistory} />
        </div>
      </div>
    </div>
  )
}

function Sparkline({ data }: { data: { date: string; gold: number }[] }) {
  const width = 320
  const height = 120
  const padding = 8

  const values = data.map(d => d.gold)
  const min = Math.min(...values)
  const max = Math.max(...values)

  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * (width - padding * 2) + padding
    const y = height - padding - ((v - min) / Math.max(1, max - min)) * (height - padding * 2)
    return `${x},${y}`
  })

  const path = `M${points.join(' L ')}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ecfccb" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="none" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`${path} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`} fill="url(#g1)" opacity={0.6} />
    </svg>
  )
}
