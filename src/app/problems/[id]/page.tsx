"use client"
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import problems from '@/lib/mock/problems'
import { useEnergy } from '@/lib/store/energyStore'
import { useAuth } from '@/lib/context/AuthProvider'

export default function ProblemPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id
  const problem = problems.find(p => p.id === id)
  const { energy, consume } = useEnergy()
  const { addGold } = useAuth()
  const [status, setStatus] = useState<'idle' | 'started' | 'submitted' | 'success' | 'fail'>('idle')
  const [answer, setAnswer] = useState('')

  if (!problem) return <div className="p-6">문제를 찾을 수 없습니다.</div>

  const prob = problem

  function handleStart() {
    if (energy < prob.energyCost) {
      setStatus('fail')
      return
    }
    const ok = consume(prob.energyCost)
    if (!ok) {
      setStatus('fail')
      return
    }

    setStatus('started')
  }

  function handleSubmit() {
    setStatus('submitted')
    // check answer
    const correct = (prob.correctAnswer ?? '').toLowerCase().trim()
    if (answer.toLowerCase().trim() === correct && correct !== '') {
      setStatus('success')
      if (addGold) addGold(prob.rewardGold)
    } else {
      setStatus('fail')
    }
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <button className="text-sm text-primary-600 underline mb-4" onClick={() => router.push('/problems')}>← 문제 목록으로</button>

      <div className="bg-white border rounded-md p-6">
        <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
        <p className="text-neutral-600 mb-4">{problem.description}</p>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm">난이도: {problem.difficulty}</div>
          <div className="text-sm">에너지: {problem.energyCost}</div>
          <div className="text-sm text-green-600">보상: +{problem.rewardGold}G</div>
        </div>

        <div className="flex flex-col gap-3">
          {status === 'idle' || status === 'fail' ? (
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
              onClick={handleStart}
            >
              문제 시작 (에너지 소비)
            </button>
          ) : null}

          {status === 'started' && (
            <div className="space-y-2">
              <label className="text-sm">정답 입력</label>
              <input value={answer} onChange={e => setAnswer(e.target.value)} className="w-full border px-3 py-2 rounded-md" />
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={handleSubmit}>제출</button>
                <button className="px-3 py-2 bg-neutral-100 rounded-md" onClick={() => setStatus('idle')}>취소</button>
              </div>
            </div>
          )}

          {status === 'success' && <div className="text-green-600">정답! 보상으로 {prob.rewardGold}G가 지급되었습니다.</div>}
          {status === 'fail' && <div className="text-red-600">정답이 틀렸거나 에너지가 부족합니다.</div>}
        </div>
      </div>
    </div>
  )
}
