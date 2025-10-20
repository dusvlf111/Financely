"use client"
import React, { useState, useEffect, useMemo, memo } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthProvider'
import { useGoldStore } from '@/lib/store/goldStore'
import GoldChart from './GoldChart'

type TimeRange = 'TODAY' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
type ChartType = 'line' | 'candle'

export default function GoldPortfolio() {
  const { profile, user } = useAuth()
  const { history: goldHistory, todayStartGold, fetchHistory, setTodayStartGold, addGoldEntry } = useGoldStore()
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('TODAY')
  const [chartType, setChartType] = useState<ChartType>('line')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch gold history from database when user is available
  useEffect(() => {
    if (user && mounted && profile) {
      fetchHistory(user.id).then(() => {
        // 히스토리가 없다면 현재 골드로 초기 히스토리 생성
        setTimeout(() => {
          const store = useGoldStore.getState()
          if (store.history.length === 0) {
            console.log('Creating initial gold history entry with gold:', profile.gold)
            addGoldEntry(user.id, profile.gold)
          }
        }, 500)
      })
    }
  }, [user, mounted, profile, fetchHistory, addGoldEntry])

  // Calculate today's start gold
  useEffect(() => {
    if (profile && goldHistory.length > 0) {
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
  }, [profile, goldHistory, setTodayStartGold])

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

  const timeRanges: TimeRange[] = ['TODAY', '1D', '1W', '1M', '3M', '1Y', 'ALL']
  const timeRangeLabels: Record<TimeRange, string> = {
    'TODAY': '오늘',
    '1D': '1D',
    '1W': '1W',
    '1M': '1M',
    '3M': '3M',
    '1Y': '1Y',
    'ALL': 'ALL',
  }

  return (
    <div className="bg-white border rounded-md p-4 shadow-sm">
      <h4 className="text-sm font-medium text-gray-600 mb-2">나의 골드 포트폴리오</h4>

      <div className="flex items-end gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Image src="/icons/gold_icon.svg" alt="Gold" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile ? `${profile.gold.toLocaleString()}` : '—'}
          </div>
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

      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'line'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            라인
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'candle'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            봉
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {timeRangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="h-64 bg-gray-50 rounded-md border border-gray-100">
          {goldHistory.length > 0 ? (
            <GoldChart data={goldHistory} timeRange={timeRange} chartType={chartType} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              골드 활동 기록을 불러오는 중...
            </div>
          )}
        </div>
        {goldHistory.length > 0 && (
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>첫 활동</span>
            <span>총 {goldHistory.length}개 활동</span>
          </div>
        )}
      </div>
    </div>
  )
}

