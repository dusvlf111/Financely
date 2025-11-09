"use client"

import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import QuestSection from './components/QuestSection'
import {
  EMPTY_MESSAGE,
  FALLBACK_USER_MESSAGE,
  OTHER_TYPE_LABEL,
  QUEST_TYPE_LABEL,
  QUEST_TYPE_ORDER,
} from './constants'
import { useQuestData } from './hooks/useQuestData'

export default function QuestPage() {
  const { user, profile } = useAuth()
  const {
    groupedQuests,
    fallbackQuests,
    error,
    hasRevealedQuests,
    shouldAnimateCards,
    showSkeleton,
    showEmptyState,
    getInteraction,
    handleSelectOption,
    handleStartQuest,
    handleSubmitAnswer,
  } = useQuestData(user?.id ?? null)

  if (!profile) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="card-md-animated card-scale-in p-6 text-center">
          <p>{FALLBACK_USER_MESSAGE}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">퀘스트</h1>

      {error && (
        <div className="card-md-animated card-scale-in p-4 mb-6 bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {showSkeleton ? (
        <div className="space-y-3">
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
        </div>
      ) : showEmptyState ? (
        <div className="card-md-animated card-scale-in p-6 text-center text-neutral-500">{EMPTY_MESSAGE}</div>
      ) : (
        <>
          {QUEST_TYPE_ORDER.map((type) => {
            const items = groupedQuests[type]
            const { title, emptyLabel } = QUEST_TYPE_LABEL[type]
            const shouldRender = items.length > 0 || type === 'weekly' || type === 'daily'

            return shouldRender ? (
              <QuestSection
                key={type}
                sectionKey={type}
                title={title}
                items={items}
                emptyLabel={emptyLabel}
                hasRevealedQuests={hasRevealedQuests}
                shouldAnimateCards={shouldAnimateCards}
                getInteraction={getInteraction}
                onSelectOption={handleSelectOption}
                onStartQuest={handleStartQuest}
                onSubmitAnswer={handleSubmitAnswer}
              />
            ) : null
          })}
          {fallbackQuests.length > 0 ? (
            <QuestSection
              sectionKey="other"
              title={OTHER_TYPE_LABEL.title}
              items={fallbackQuests}
              emptyLabel={OTHER_TYPE_LABEL.emptyLabel}
              hasRevealedQuests={hasRevealedQuests}
              shouldAnimateCards={shouldAnimateCards}
              getInteraction={getInteraction}
              onSelectOption={handleSelectOption}
              onStartQuest={handleStartQuest}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
