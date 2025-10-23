"use client"
import React from 'react'
import GoldPortfolio from '@/app/learn/components/GoldPortfolio'
import assets from '@/lib/mock/assets'

export default function AssetPage() {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">자산</h1>

      <div className="grid gap-4">
        <GoldPortfolio />
        <section className="card-md p-4">
          <h2 className="font-medium">보유 자산 요약</h2>
          <div className="mt-2">
            <ul className="text-sm text-neutral-600 space-y-2">
              {assets.map(a => (
                <li key={a.id}>{a.name}: {a.amount} · 현재가 {a.value.toLocaleString()}원</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
