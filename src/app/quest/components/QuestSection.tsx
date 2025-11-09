"use client"

import React from 'react'
import type { QuestListItem } from '@/lib/quests/service'
import QuestCard from './QuestCard'
import type { QuestInteraction } from '../types'

interface QuestSectionProps {
  sectionKey: string
  title: string
  items: QuestListItem[]
  emptyLabel: string
  hasRevealedQuests: boolean
  shouldAnimateCards: boolean
  getInteraction: (questId: string) => QuestInteraction
  onSelectOption: (questId: string, optionValue: number) => void
  onStartQuest: (quest: QuestListItem) => Promise<void>
  onSubmitAnswer: (quest: QuestListItem) => Promise<void>
}

export default function QuestSection({
  sectionKey,
  title,
  items,
  emptyLabel,
  hasRevealedQuests,
  shouldAnimateCards,
  getInteraction,
  onSelectOption,
  onStartQuest,
  onSubmitAnswer,
}: QuestSectionProps) {
  const emptyCardClass = shouldAnimateCards ? 'card-md-animated card-scale-in' : 'card-md-animated'

  return (
    <section id={`quest-section-${sectionKey}`} className="mb-8 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        <span className="text-xs sm:text-sm text-neutral-600">총 {items.length}개</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className={`${emptyCardClass} p-4 text-center text-neutral-500`}>{emptyLabel}</div>
        ) : (
          items.map((quest, index) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={index}
              interaction={getInteraction(quest.id)}
              hasRevealedQuests={hasRevealedQuests}
              shouldAnimateCards={shouldAnimateCards}
              onSelectOption={onSelectOption}
              onStartQuest={onStartQuest}
              onSubmitAnswer={onSubmitAnswer}
            />
          ))
        )}
      </div>
    </section>
  )
}
