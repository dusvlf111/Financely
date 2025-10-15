"use client"
import React, { useState, useEffect } from 'react'
import tutorialSteps from '@/lib/mock/tutorial'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthProvider'

export default function TutorialPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [totalGold, setTotalGold] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const { addGold, completeTutorial } = useAuth()
  const [claimed, setClaimed] = useState(false)

  const step = tutorialSteps[stepIndex]

  function selectChoice(choiceId: string, gold: number) {
    setChoices(prev => ({ ...prev, [step.id]: choiceId }))
    setTotalGold(g => g + gold)
    if (stepIndex < tutorialSteps.length - 1) setStepIndex(stepIndex + 1)
  }

  if (!step) return <div className="p-6">튜토리얼을 불러오는 중입니다...</div>

  const finished = stepIndex >= tutorialSteps.length - 1 && !!choices[step.id]

  useEffect(() => {
    if (finished && addGold && !claimed) {
      addGold(totalGold)
      if (completeTutorial) {
        completeTutorial()
      }
      setClaimed(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">튜토리얼</h1>

      {!finished ? (
        <section className="bg-white border rounded-md p-6">
          <h2 className="text-lg font-bold mb-2">{step.title}</h2>
          <p className="text-neutral-600 mb-4">{step.content}</p>

          <div className="space-y-2">
            {step.choices.map(c => (
              <button
                key={c.id}
                onClick={() => selectChoice(c.id, c.gold)}
                className="w-full text-left bg-neutral-50 border rounded-md p-3"
              >
                <div className="flex justify-between items-center">
                  <div>{c.label}</div>
                  <div className="text-sm text-green-600">+{c.gold}G</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-white border rounded-md p-6">
          <h2 className="text-lg font-bold mb-2">튜토리얼 완료</h2>
          <p className="mb-4">축하합니다! 튜토리얼을 완료하셨습니다.</p>
          <div className="mb-3">획득한 총 골드: <strong>{totalGold}G</strong></div>
          {addGold ? (
            <div className="mb-4">
              <button
                onClick={() => {
                  if (!claimed) {
                    addGold(totalGold)
                    setClaimed(true)
                  }
                }}
                disabled={claimed}
                className="bg-green-600 text-white px-3 py-2 rounded-md disabled:opacity-50"
              >
                {claimed ? '수령 완료' : '골드 수령하기'}
              </button>
              <div className="text-sm text-neutral-500 mt-2">
                {claimed ? '골드가 계정에 지급되었습니다.' : '완료 시 자동으로 지급됩니다.'}
              </div>
            </div>
          ) : null}
          <div className="mb-4">
            <h3 className="font-semibold">선택 요약</h3>
            <ul className="list-disc pl-5">
              {tutorialSteps.map(s => (
                <li key={s.id} className="text-sm text-neutral-700">
                  {s.title}: {choices[s.id] ?? '선택 없음'}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/learn" className="inline-block bg-primary-600 text-black px-4 py-2 rounded-md">
            학습 시작하기
          </Link>
        </section>
      )}
    </div>
  )
}
