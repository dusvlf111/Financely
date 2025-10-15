"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useGoldStore, type GoldHistoryEntry } from '@/lib/store/goldStore'

export default function GoldPortfolio() {
  const { user, profile } = useAuth()
  const { history: goldHistory, todayStartGold, initializeHistory, setTodayStartGold } = useGoldStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile && mounted && goldHistory.length > 0) {
      initializeHistory(profile.gold)

      // 오늘 자정의 타임스탬프
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()
      
      // 오늘 첫 기록을 찾거나, 없으면 어제의 마지막 기록을 사용
      const firstEntryToday = goldHistory.find(h => h.timestamp >= todayTimestamp)
      const lastEntryYesterday = goldHistory.slice().reverse().find(h => h.timestamp < todayTimestamp)

      const startGold = firstEntryToday?.gold ?? lastEntryYesterday?.gold ?? profile.gold
      setTodayStartGold(startGold)
    }
  }, [profile, mounted, initializeHistory, setTodayStartGold, goldHistory, goldHistory.length])

  if (!mounted) {
    return (
      <div className="bg-white border rounded-md p-4 shadow-sm">
        <div className="h-48 flex items-center justify-center text-gray-400">
          로딩 중...
        </div>
      </div>
    )
  }

  const goldChangeToday = profile && todayStartGold !== null ? profile.gold - todayStartGold : 0

  return (
    <div className="bg-white border rounded-md p-4 shadow-sm">
      <h4 className="text-sm font-medium text-gray-600 mb-2">나의 골드 포트폴리오</h4>
      <div className="flex items-end gap-3 mb-1">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {profile ? `${profile.gold.toLocaleString()}G` : '—'}
        </div>
        {goldChangeToday !== 0 && (
          goldChangeToday > 0 ? (
            <div className="text-base text-green-600 font-semibold flex items-center gap-1">
              <span>↗</span>
              <span>+{goldChangeToday.toLocaleString()}</span>
            </div>
          ) : (
            <div className="text-base text-red-600 font-semibold flex items-center gap-1">
              <span>↘</span>
              <span>{goldChangeToday.toLocaleString()}</span>
            </div>
          )
        )}
      </div>
      <div className="text-xs text-gray-500 mb-3">현재 보유</div>

      {goldHistory.length > 0 && (
        <div className="mt-3">
          <div className="h-36 bg-gray-50 rounded-md p-3 border border-gray-100">
            <Sparkline data={goldHistory} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>첫 활동</span>
            <span>총 {goldHistory.length}개 활동</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Sparkline({ data }: { data: GoldHistoryEntry[]}) {
  const width = 320
  const height = 120
  const padding = 8

  if (data.length < 2) return <div className="flex items-center justify-center h-full text-sm text-gray-400">데이터가 부족합니다.</div>

  const values = data.map(d => d.gold)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * (width - padding * 2) + padding
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return { x, y, value: v }
  })

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' L ')
  const linePath = `M${pathPoints}`
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="goldGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#goldGradient)"
      />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#10b981"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 3}
            fill={i === points.length - 1 ? "#10b981" : "#ffffff"}
            stroke="#10b981"
            strokeWidth={i === points.length - 1 ? 2 : 1.5}
          />
        </g>
      ))}
    </svg>
  )
}
