"use client"
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { type GoldHistoryEntry } from '@/lib/store/goldStore'
import { time } from 'console'

type TimeRange = 'TODAY' | '1D' | '1W' | '1M' | '1Y' | 'ALL'

interface GoldChartProps {
  data: GoldHistoryEntry[]
  timeRange: TimeRange
}

function GoldChart({ data, timeRange }: GoldChartProps) {
  // Filter data based on time range - useMemo로 최적화
  const processedData = React.useMemo(
    () => processChartData(data, timeRange),
    [data, timeRange]
  )



  if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          해당 기간의 데이터가 없습니다
        </div>
      );
    }

  return <LineChartView data={processedData} timeRange={timeRange} />
}

function LineChartView({ data, timeRange }: { data: GoldHistoryEntry[]; timeRange: TimeRange }) {
  // 1. useMemo 훅 (차트 데이터 생성)은 이전과 동일합니다.
  const { chartData, shouldShowDots } = React.useMemo(() => {
    const maxDataPoints = 50;
    const sampledData =
      data.length > maxDataPoints
        ? data.filter(
            (_, index) =>
              index % Math.ceil(data.length / maxDataPoints) === 0,
          )
        : data;

    return {
      chartData: sampledData,
      shouldShowDots: sampledData.length < 20,
    };
  }, [data, timeRange]);

  // 2. (수정) X축 Ticks를 '마지막 날짜' 기준으로 수동 생성
  const xAxisTicks = React.useMemo(() => {
    // '집계'된 뷰(1W, 1M 등)는 undefined 반환 (자동 틱)
    if (
      timeRange !== 'ALL' &&
      timeRange !== 'TODAY' &&
      timeRange !== '1D'
    ) {
      return undefined;
    }

    // 'raw' 뷰(ALL, TODAY, 1D)는 중복 라벨을 제거
    const formattedLabels = new Set<string>();
    const ticksToShow: number[] = []; // 중복이 제거된 '마지막' timestamp 저장

    // (수정) 데이터를 '뒤에서부터' 순회합니다.
    for (let i = chartData.length - 1; i >= 0; i--) {
      const entry = chartData[i];
      const formatted = formatTime(entry.timestamp, timeRange);

      // 이 라벨을 Set에서 처음 만났다면 (즉, 해당 날짜의 '마지막' 데이터)
      if (!formattedLabels.has(formatted)) {
        formattedLabels.add(formatted); // Set에 라벨 기록
        ticksToShow.push(entry.timestamp); // 틱 목록에 추가
      }
    }
    
    // (수정) 배열이 [10/21, 10/20] 처럼 역순이므로 다시 뒤집어서 반환
    return ticksToShow.reverse();
  }, [chartData, timeRange]); // chartData나 timeRange가 바뀔 때만 다시 계산

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
          
          // 3. (수정) 'interval' prop 삭제
          
          // 4. (NEW) 'ticks' prop에 우리가 만든 'xAxisTicks' 배열 전달
          ticks={xAxisTicks} 
          
          tickFormatter={(timestamp) => formatTime(timestamp, timeRange)}
        />
        {/* ... (YAxis, Tooltip, Line은 그대로 둡니다) ... */}
        <YAxis
          domain={['dataMin - 50', 'dataMax + 50']}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={{ stroke: '#D1D5DB' }}
          axisLine={{ stroke: '#D1D5DB' }}
        />
        <Tooltip
          labelFormatter={(timestamp) => formatTime(timestamp, timeRange)}
          formatter={(value: number) => [`${value.toLocaleString()}G`, '골드']}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Line
          type="linear"
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
  );
}

function formatTime(timestamp: number, timeRange: TimeRange): string {
  const date = new Date(timestamp);

  switch (timeRange) {
    case 'TODAY': // '오늘'은 시간:분
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case '1D': // '1일'은 월/일 + 시간:분 (날짜가 바뀔 수 있으므로)
      return date.toLocaleString('ko-KR', { // toLocaleString 사용
        month: 'short',
        day: 'numeric',
      });
    case '1W': 
    // "몇월 몇째주"로 표시
      const month = date.getMonth() + 1; // getMonth()는 0부터 시작
      const dayOfMonth = date.getDate();
      
      // 그 달의 날짜를 7로 나누어 올림하면 'N주차'가 됩니다.
      // (1~7일 -> 1주차, 8~14일 -> 2주차)
      // 우리 집계 로직이 '주의 시작일'을 쓰므로 이 계산이 잘 맞습니다.
      const weekOfMonth = Math.ceil(dayOfMonth / 7);
      return `${month}월 ${weekOfMonth}주차`;
    case '1M': // 1W와 1M은 '일' 단위로 집계되므로 '월.일' 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
      });
    case '1Y':
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
      });
    case 'ALL': // 1Y와 ALL은 '월' 단위로 집계되므로 '년.월' 표시
      return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      });
    default:
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
  }
}

// GoldHistoryEntry 타입이 { timestamp: number, gold: number } 라고 가정합니다.

/**
 * 날짜(타임스탬프)와 집계 단위(granularity)를 기반으로
 * 그룹핑할 '키(key)'를 생성합니다.
 */
function getBucketKey(
  timestamp: number,
  granularity: 'raw' | 'day' | 'week' | 'month',
): string {
  const date = new Date(timestamp);

  switch (granularity) {
    case 'day':
      // 로컬 시간 기준으로 '2025-10-21' (일 단위)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    case 'week':
      // '주의 시작일' (예: 일요일)을 기준으로 키 생성
      const firstDayOfWeek = new Date(date);
      firstDayOfWeek.setDate(date.getDate() - date.getDay()); // 일요일 00시
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const weekYear = firstDayOfWeek.getFullYear();
      const weekMonth = String(firstDayOfWeek.getMonth() + 1).padStart(2, '0');
      const weekDay = String(firstDayOfWeek.getDate()).padStart(2, '0');
      return `${weekYear}-${weekMonth}-${weekDay}`;
    case 'month':
      // 로컬 시간 기준으로 '2025-10' (월 단위)
      const monthYear = date.getFullYear();
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      return `${monthYear}-${monthNum}`;
    case 'raw':
    default:
      // 'raw' 데이터는 고유 타임스탬프를 키로 사용
      return String(timestamp);
  }
}

function processChartData(
  data: GoldHistoryEntry[],
  timeRange: TimeRange,
): GoldHistoryEntry[] {
  let startTime = 0;
  let granularity: 'raw' | 'day' | 'week' | 'month' = 'day';

  const now = new Date();
  const today = new Date(now).setHours(0, 0, 0, 0); // 오늘 00시

  // 1. TimeRange에 따라 필터링 시작 시간과 집계 단위를 결정
  switch (timeRange) {
    case 'TODAY':
      // "today는 오늘 변화량"
      startTime = today;
      granularity = 'raw';
      break;

    case '1D':
      // "1d는 하루를 하나의 점으로 일주일치 보기"
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      startTime = sevenDaysAgo.setHours(0, 0, 0, 0);
      granularity = 'day';
      break;

    case '1W':
      // "1w는 1주를 한묶음으로 한달보기"
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      startTime = thirtyDaysAgo.setHours(0, 0, 0, 0);
      granularity = 'week';
      break;

    case '1M':
      // "1m는 1달을 한묶음으로 1년보기"
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      startTime = oneYearAgo.setHours(0, 0, 0, 0);
      granularity = 'month';
      break;

    // --- 아래는 사용자님이 정의하지 않은 3M, 1Y, ALL에 대한 규칙입니다. ---
    // --- (기존 로직을 기반으로 합리적으로 설정) ---
      
    case '1Y':
      // 1년 범위, '월' 단위 집계 (1M과 동일하게)
      const oneYearAgo_1Y = new Date(now);
      oneYearAgo_1Y.setFullYear(now.getFullYear() - 1);
      startTime = oneYearAgo_1Y.setHours(0, 0, 0, 0);
      granularity = 'month';
      break;

    case 'ALL':
      // 전체 범위, '월' 단위 집계
      startTime = 0;
      granularity = 'raw';
      break;
      
    default:
      startTime = today;
      granularity = 'raw';
  }

  // 2. 시간 범위에 맞는 데이터 필터링
  const filteredData = data.filter(entry => entry.timestamp >= startTime);

  // 3. 'raw' 데이터는 집계 없이 바로 반환 (TODAY, 1D)
  if (granularity === 'raw') {
    return filteredData;
  }

  // 4. 'day', 'week', 'month' 단위로 데이터 집계 (Grouping)
  // Map을 사용해 각 '버킷(bucket)'의 '마지막' 값만 저장합니다.
  const buckets = new Map<string, GoldHistoryEntry>();

  for (const entry of filteredData) {
    const key = getBucketKey(entry.timestamp, granularity);
    // 주식 차트처럼 '해당 기간의 마지막 값'을 저장
    // (데이터가 시간순으로 정렬되어 있다고 가정)
    buckets.set(key, entry);
  }

  // Map의 값들(마지막 데이터 포인트들)을 배열로 변환하여 반환
  return Array.from(buckets.values());
}

export default React.memo(GoldChart);