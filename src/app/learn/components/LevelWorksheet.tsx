"use client"
import React from 'react'
import { WORKSHEET_CONTENTS, type WorksheetContent } from '@/lib/data/worksheetContent'

interface LevelWorksheetProps {
  level: number
}

export default function LevelWorksheet({ level }: LevelWorksheetProps) {
  const worksheet = WORKSHEET_CONTENTS[level]

  if (!worksheet) {
    return (
      <div className="card-md p-6">
        <div className="text-center py-12 text-neutral-500 text-sm">
          <p>이 레벨의 학습 자료가 준비 중입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-md p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
            Lv.{worksheet.level}
          </span>
          <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
            {worksheet.category}
          </span>
        </div>
        <h2 className="text-xl font-semibold">{worksheet.title}</h2>
      </div>

      {/* 학습 내용 섹션 */}
      <div className="space-y-4 mb-6">
        {worksheet.sections.map((section, index) => (
          <div key={index}>
            <h3 className="font-medium text-sm mb-2">
              {section.subtitle}
            </h3>
            <ul className="space-y-2 ml-4">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="flex-shrink-0 mt-1.5 w-1 h-1 bg-neutral-400 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 핵심 포인트 */}
      <div className="bg-primary-50 rounded-md p-4 border border-primary-100">
        <h3 className="font-medium text-sm mb-2 text-neutral-900">
          핵심 포인트
        </h3>
        <ul className="space-y-1.5">
          {worksheet.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 text-primary-600">•</span>
              <span className="text-neutral-800">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
