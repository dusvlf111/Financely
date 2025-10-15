import React from 'react'
import GoldPortfolio from './components/GoldPortfolio'
import LevelProgress from './components/LevelProgress'

export default function LearnPage() {
  return (
    <div>
      <main className="max-w-[768px] mx-auto px-4 pt-4 pb-28">
        <section className="mb-6">
          <GoldPortfolio />
        </section>

        <section className="mb-6">
          <LevelProgress />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">완료한 문제 기록</h3>
          <div className="bg-white border rounded-md p-4">문제 기록 리스트(목 데이터 연동 예정)</div>
        </section>
      </main>
    </div>
  )
}
