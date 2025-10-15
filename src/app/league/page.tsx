"use client"
import React, { useState } from 'react'
import leagueData from '@/lib/mock/league'

export default function LeaguePage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const list = period === 'weekly' ? leagueData.weekly : leagueData.monthly

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">리그</h1>
      <section className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">리그 순위</h2>
          <div className="flex gap-2">
            <button onClick={() => setPeriod('weekly')} className={`px-3 py-1 rounded ${period === 'weekly' ? 'bg-primary-600 text-black' : 'bg-neutral-100'}`}>주간</button>
            <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 rounded ${period === 'monthly' ? 'bg-primary-600 text-black' : 'bg-neutral-100'}`}>월간</button>
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
            {list.map(row => (
              <tr key={row.rank} className="border-t">
                <td className="py-2">{row.rank}</td>
                <td className="py-2">{row.name}</td>
                <td className="py-2">{row.gold}G</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
