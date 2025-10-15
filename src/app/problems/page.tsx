"use client"
import React from 'react'
import problems from '@/lib/mock/problems'
import ProblemItem from './ProblemItem'

export default function ProblemsPage() {
  return (
    <div className="max-w-[768px] mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">문제 목록</h1>
      <div className="mb-3 text-sm text-neutral-600">총 {problems.length}개 문제</div>
      {problems.length === 0 ? (
        <div className="p-4 bg-white border rounded-lg text-neutral-500">문제가 없습니다.</div>
      ) : (
        <div className="grid gap-3">
          {problems.map(p => (
            <ProblemItem key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  )
}
