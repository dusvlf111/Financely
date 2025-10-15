"use client"
import React from 'react'
import problems from '@/lib/mock/problems'
import Link from 'next/link'

export default function ProblemsPage() {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">문제 목록</h1>
      <div className="grid gap-3">
        {problems.map(p => (
          <Link key={p.id} href={`/problems/${p.id}`} className="block p-4 bg-white border rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-neutral-500">{p.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{p.difficulty}</div>
                <div className="text-sm text-green-600">+{p.rewardGold}G</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
