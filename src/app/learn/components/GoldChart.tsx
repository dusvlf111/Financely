"use client"
import React from 'react'
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { type GoldHistoryEntry } from '@/lib/store/goldStore'

type TimeRange = 'TODAY' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
type ChartType = 'line' | 'candle'

interface GoldChartProps {
  data: GoldHistoryEntry[]
  timeRange: TimeRange
  chartType: ChartType
}

function GoldChart({ data, timeRange, chartType }: GoldChartProps) {
  // Filter data based on time range - useMemo로 최적화
  const filteredData = React.useMemo(
    () => filterDataByTimeRange(data, timeRange),
    [data, timeRange]
  )

  // 데이터 범위 계산 (일 단위)
  const dataRangeInDays = data.length > 0
    ? (data[data.length - 1].timestamp - data[0].timestamp) / (1000 * 60 * 60 * 24)
    : 0

  // 필요한 데이터 범위
  const requiredDays: Record<TimeRange, number> = {
    'TODAY': 0,
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365,
    'ALL': 0,
  }

  // 데이터 부족 체크
  const isDataInsufficient = timeRange !== 'ALL' && dataRangeInDays < requiredDays[timeRange]

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        해당 기간의 데이터가 없습니다
      </div>
    )
  }

  // 데이터 부족 경고
  if (isDataInsufficient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-center">
          <div className="mb-2">📊</div>
          <div className="font-medium">{timeRange} 차트를 보기에 데이터가 부족합니다</div>
          <div className="mt-1 text-xs text-gray-400">
            현재: {Math.ceil(dataRangeInDays)}일 / 필요: {requiredDays[timeRange]}일
          </div>
        </div>
      </div>
    )
  }

  if (chartType === 'line') {
    return <LineChartView data={filteredData} timeRange={timeRange} />
  } else {
    return <CandleChartView data={filteredData} timeRange={timeRange} />
  }
}

function LineChartView({ data, timeRange }: { data: GoldHistoryEntry[]; timeRange: TimeRange }) {
  // 데이터 샘플링 및 차트 데이터 메모이제이션
  const { chartData, shouldShowDots } = React.useMemo(() => {
    const maxDataPoints = 50
    const sampledData = data.length > maxDataPoints
      ? data.filter((_, index) => index % Math.ceil(data.length / maxDataPoints) === 0)
      : data

    return {
      chartData: sampledData.map((entry, index) => ({
        time: formatTime(entry.timestamp, timeRange),
        gold: entry.gold,
        timestamp: entry.timestamp,
        index,
      })),
      shouldShowDots: sampledData.length < 20,
    }
  }, [data, timeRange])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['dataMin - 50', 'dataMax + 50']}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelFormatter={(_, payload) => {
            if (payload && payload.length > 0) {
              return formatTime(payload[0].payload.timestamp, timeRange)
            }
            return ''
          }}
          formatter={(value: number) => [`${value.toLocaleString()}G`, '골드']}
        />
        <Line
          type="monotone"
          dataKey="gold"
          stroke="#10B981"
          strokeWidth={2}
          dot={shouldShowDots}
          activeDot={{ r: 5 }}
          animationDuration={400}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// 커스텀 캔들스틱 Shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Candlestick = (props: any) => {
  const { x, y, width, height, high, open, close } = props
  const isGrowing = close > open
  const color = isGrowing ? '#10B981' : '#EF4444'
  const ratio = Math.abs(height / (open - close)) || 1

  return (
    <g>
      {/* 심지 (위아래 선) */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* 몸통 (직사각형) */}
      <rect
        x={x + width * 0.25}
        y={isGrowing ? y + (high - close) * ratio : y + (high - open) * ratio}
        width={width * 0.5}
        height={Math.abs((close - open) * ratio) || 1}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

function CandleChartView({ data, timeRange }: { data: GoldHistoryEntry[]; timeRange: TimeRange }) {
  const candleData = React.useMemo(
    () => convertToCandlestickData(data, timeRange),
    [data, timeRange]
  )

  if (candleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        캔들 데이터가 부족합니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
        />
        <YAxis
          domain={['dataMin - 50', 'dataMax + 50']}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm text-xs">
                  <div className="font-medium mb-1">{data.time}</div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">시가:</span>
                      <span className="font-medium">{data.open.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">고가:</span>
                      <span className="font-medium text-red-600">{data.high.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">저가:</span>
                      <span className="font-medium text-blue-600">{data.low.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">종가:</span>
                      <span className="font-medium">{data.close.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between gap-3 pt-1 border-t border-gray-100">
                      <span className="text-gray-600">변동:</span>
                      <span className={`font-medium ${data.close >= data.open ? 'text-green-600' : 'text-red-600'}`}>
                        {data.close >= data.open ? '+' : ''}{(data.close - data.open).toLocaleString()}G
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        {/* 캔들스틱을 그리기 위한 더미 바 */}
        <Bar
          dataKey="high"
          shape={<Candlestick />}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function formatTime(timestamp: number, timeRange: TimeRange): string {
  const date = new Date(timestamp)

  switch (timeRange) {
    case 'TODAY':
    case '1D':
      // 오늘/1일: 시간:분 표시
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    case '1W':
      // 1주: 월.일 시간 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      })
    case '1M':
    case '3M':
      // 1개월, 3개월: 월.일 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    case '1Y':
    case 'ALL':
      // 1년, 전체: 년.월 표시
      return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: 'short',
      })
    default:
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
  }
}

function filterDataByTimeRange(data: GoldHistoryEntry[], timeRange: TimeRange): GoldHistoryEntry[] {
  if (timeRange === 'ALL') return data

  const now = Date.now()

  // 오늘 00시 기준
  if (timeRange === 'TODAY') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return data.filter(entry => entry.timestamp >= today.getTime())
  }

  const ranges: Record<TimeRange, number> = {
    'TODAY': 0,
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
    '3M': 90 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000,
    'ALL': 0,
  }

  const cutoffTime = now - ranges[timeRange]
  return data.filter(entry => entry.timestamp >= cutoffTime)
}

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  change: number
}

function convertToCandlestickData(data: GoldHistoryEntry[], timeRange: TimeRange): CandleData[] {
  if (data.length === 0) return []

  // Group data by time period
  const groupSize = getGroupSize(timeRange)
  const grouped: Map<number, GoldHistoryEntry[]> = new Map()

  data.forEach(entry => {
    const periodKey = Math.floor(entry.timestamp / groupSize) * groupSize
    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, [])
    }
    grouped.get(periodKey)!.push(entry)
  })

  // Convert to candlestick data
  const candleData: CandleData[] = []

  grouped.forEach((entries, periodKey) => {
    const values = entries.map(e => e.gold)
    const open = entries[0].gold
    const close = entries[entries.length - 1].gold
    const high = Math.max(...values)
    const low = Math.min(...values)

    candleData.push({
      time: formatTime(periodKey, timeRange),
      open,
      high,
      low,
      close,
      change: close - open, // For bar chart height
    })
  })

  return candleData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

function getGroupSize(timeRange: TimeRange): number {
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  switch (timeRange) {
    case 'TODAY':
    case '1D':
      return hour
    case '1W':
      return 4 * hour
    case '1M':
      return day
    case '3M':
      return day
    case '1Y':
      return 7 * day
    case 'ALL':
      return 30 * day
    default:
      return day
  }
}

// React.memo로 감싸서 props가 변경될 때만 재렌더링
export default React.memo(GoldChart)
