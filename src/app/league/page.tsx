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
}

export default function LeaguePage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [leaderboard, setLeaderboard] = useState<Ranker[]>([])

  useEffect(() => {
    async function fetchLeaderboard() {
      // Call the database function we created
      const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 100 })

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else if (data) {
        setLeaderboard(data as Ranker[])
      }
    }

    fetchLeaderboard()
    // TODO: Add logic to refetch data based on the 'period' filter
  }, [period])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const myRank = leaderboard.find(r => r.id === user?.id)

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">리그</h1>
      <section className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">리그 순위</h2>
          <div className="flex gap-2">
            <button onClick={() => setPeriod('weekly')} className={`px-3 py-1 rounded ${period === 'weekly' ? 'bg-primary-600 text-white' : 'bg-neutral-100'}`}>주간</button>
            <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 rounded ${period === 'monthly' ? 'bg-primary-600 text-white' : 'bg-neutral-100'}`}>월간</button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="pb-2">순위</th>
              <th className="pb-2">이름</th>
              <th className="pb-2">골드</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(row => {
              const isMe = row.id === user?.id
              return (
              <tr
                key={row.rank}
                className={`border-t ${isMe ? 'bg-primary-50 font-semibold' : ''}`}
              >
                <td className="py-2">{row.rank}</td>
                <td className="py-2">{row.username || row.full_name || '익명'}</td>
                <td className="py-2">{row.gold.toLocaleString()}G</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
