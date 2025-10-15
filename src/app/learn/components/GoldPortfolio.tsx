"use client"
import React from 'react'
import useMockUser from '@/lib/hooks/useMockData'

export default function GoldPortfolio() {
  const { user } = useMockUser()

  return (
    <div className="bg-white border rounded-md p-4">
      <h4 className="text-sm text-neutral-500">나의 골드 포트폴리오</h4>
      <div className="flex items-baseline gap-3">
        <div className="text-2xl font-bold">{user.gold}G</div>
        <div className="text-sm text-green-600">↗ +180</div>
      </div>
      <div className="mt-3 h-36 bg-neutral-50 rounded-md flex items-center justify-center text-neutral-400">7일 골드 변화 차트(플레이스홀더)</div>
    </div>
  )
}
