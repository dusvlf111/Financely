"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'

type GoldHistoryEntry = {
  date: string
  gold: number
}

export default function GoldPortfolio() {
  const { user } = useAuth()
  const [goldHistory, setGoldHistory] = useState<GoldHistoryEntry[]>([])
  const [todayGold, setTodayGold] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return

    // localStorage에서 골드 히스토리 가져오기
    const today = new Date().toISOString().split('T')[0]
    const storedHistory = localStorage.getItem('financely_gold_history')
    const storedTodayStart = localStorage.getItem('financely_today_start_gold')

    let history: GoldHistoryEntry[] = []

    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory)
        // 7일 초과 데이터 제거
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        history = history.filter(h => new Date(h.date) >= sevenDaysAgo)
      } catch (e) {
        history = []
      }
    }

    // 히스토리가 비어있으면 초기 데이터 생성
    if (history.length === 0) {
      const initialGold = Math.max(0, user.gold - 500)
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        history.push({
          date: dateStr,
          gold: initialGold + Math.floor((500 / 7) * (7 - i))
        })
      }
    }

    // 오늘 데이터가 없으면 추가
    const todayEntry = history.find(h => h.date === today)
    if (!todayEntry) {
      const yesterdayGold = history.length > 0 ? history[history.length - 1].gold : user.gold
      history.push({
        date: today,
        gold: user.gold
      })
      // 오늘 시작 골드 저장
      localStorage.setItem('financely_today_start_gold', yesterdayGold.toString())
    } else {
      // 오늘 데이터 업데이트
      todayEntry.gold = user.gold
    }

    // 최대 7개까지만 유지
    if (history.length > 7) {
      history = history.slice(-7)
    }

    // 오늘 획득한 골드 계산
    const todayStartGold = storedTodayStart ? parseInt(storedTodayStart) : (history.length > 1 ? history[history.length - 2].gold : user.gold)
    const earnedToday = Math.max(0, user.gold - todayStartGold)

    setGoldHistory(history)
    setTodayGold(earnedToday)

    // localStorage에 저장
    localStorage.setItem('financely_gold_history', JSON.stringify(history))
  }, [user, mounted])

  if (!mounted) {
    return (
      <div className="bg-white border rounded-md p-4 shadow-sm">
        <div className="h-48 flex items-center justify-center text-gray-400">
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-md p-4 shadow-sm">
      <h4 className="text-sm font-medium text-gray-600 mb-2">나의 골드 포트폴리오</h4>
      <div className="flex items-baseline gap-3 mb-1">
        <div className="text-3xl font-bold text-gray-900">
          {user ? `${user.gold.toLocaleString()}G` : '—'}
        </div>
        {todayGold > 0 && (
          <div className="text-base text-green-600 font-semibold flex items-center gap-1">
            <span>↗</span>
            <span>+{todayGold}</span>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-3">현재 보유</div>

      {goldHistory.length > 0 && (
        <div className="mt-3">
          <div className="h-36 bg-gray-50 rounded-md p-3 border border-gray-100">
            <Sparkline data={goldHistory} currentGold={user?.gold ?? 0} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>7일 전</span>
            <span>오늘</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Sparkline({ data, currentGold }: { data: { date: string; gold: number }[], currentGold: number }) {
  const width = 320
  const height = 120
  const padding = 8

  if (data.length === 0) return null

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
