"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { supabase } from '@/lib/supabase/client'

type Ranker = {
  rank: number
  id: string
  username: string | null
  full_name: string | null
  gold: number
  solved_count?: number
}

export default function LeaguePage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<Ranker[]>([])

  useEffect(() => {
    async function fetchLeaderboard() {
      // Call the database function (now includes solved_count)
      const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 100 })

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else if (data) {
        setLeaderboard(data as Ranker[])
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">리그 순위</h1>

      <section className="card-slideInDown expand-down p-6">
        {/* 필터 버튼 - 현재 사용 안함 */}
        {/* <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-sm rounded ${period === 'weekly' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-sm rounded ${period === 'monthly' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}
            >
              월간
            </button>
          </div>
        </div> */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-center text-neutral-500 font-medium" style={{ width: '15%' }}>순위</th>
                <th className="pb-3 text-left text-neutral-500 font-medium" style={{ width: '35%' }}>이름</th>
                <th className="pb-3 text-right text-neutral-500 font-medium" style={{ width: '25%' }}>골드</th>
                <th className="pb-3 text-center text-neutral-500 font-medium" style={{ width: '25%' }}>문제</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-500">
                    리더보드 데이터를 불러오는 중...
                  </td>
                </tr>
              ) : (
                leaderboard.map(row => {
                  const isMe = row.id === user?.id
                  return (
                    <tr
                      key={row.rank}
                      className={`border-t ${isMe ? 'bg-primary-50' : ''}`}
                    >
                      <td className="py-3 text-center">
                        <span className={`${row.rank <= 3 ? 'font-bold text-primary-600' : 'text-neutral-700'}`}>
                          {row.rank}
                        </span>
                      </td>
                      <td className={`py-3 text-left ${isMe ? 'font-semibold text-neutral-900' : 'text-neutral-700'} truncate`}>
                        {row.username || row.full_name || '익명'}
                      </td>
                      <td className={`py-3 text-right ${isMe ? 'font-semibold text-neutral-900' : 'text-neutral-700'} whitespace-nowrap`}>
                        {row.gold.toLocaleString()}G
                      </td>
                      <td className="py-3 text-center text-neutral-600 whitespace-nowrap">
                        {row.solved_count || 0}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
