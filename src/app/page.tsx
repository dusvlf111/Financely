import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">환영합니다 — Financely</h1>
      <p>학습을 시작하려면 로그인하세요.</p>
      <Link href="/login" className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md">로그인</Link>
    </div>
  )
}
