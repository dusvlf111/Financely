"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import QuestSection from "./components/QuestSection";
import {
  EMPTY_MESSAGE,
  FALLBACK_USER_MESSAGE,
  OTHER_TYPE_LABEL,
  QUEST_TYPE_LABEL,
  QUEST_TYPE_ORDER,
} from "./constants";
import { useQuestData } from "./hooks/useQuestData";

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-neutral-500">
    <svg
      className="w-8 h-8 animate-spin text-primary-500 mb-3"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <p>퀘스트를 불러오는 중입니다...</p>
  </div>
);

export default function QuestPage() {
  const { user, profile, isGuest } = useAuth();
  const {
    groupedQuests,
    fallbackQuests,
    error,
    shouldAnimateCards,
    showSkeleton,
    showEmptyState,
    getInteraction,
    handleSelectOption,
    handleStartQuest,
    handleSubmitAnswer,
  } = useQuestData(user?.id ?? null);

  if (isGuest) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="card-md-animated card-scale-in p-6 text-center">
          <p>{FALLBACK_USER_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">퀘스트</h1>

      <p className="mb-4 text-sm text-yellow-600">
        현재 개발 중인 기능입니다. 오작동할 수 있습니다.
      </p>

      {error && (
        <div className="card-md-animated card-scale-in p-4 mb-6 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {showSkeleton || !profile ? (
        <div>
          <LoadingSpinner />
          <div className="space-y-3">
            <div className="card-md-animated p-4 bg-neutral-100 animate-pulse h-28 rounded-lg" />
            <div className="card-md-animated p-4 bg-neutral-100 animate-pulse h-28 rounded-lg" />
          </div>
        </div>
      ) : showEmptyState ? (
        <div className="card-md-animated card-scale-in p-6 text-center text-neutral-500">
          {EMPTY_MESSAGE}
        </div>
      ) : (
        <>
          {QUEST_TYPE_ORDER.map((type) => {
            const items = groupedQuests[type];
            const { title, emptyLabel } = QUEST_TYPE_LABEL[type];
            const shouldRender =
              items.length > 0 || type === "weekly" || type === "daily";

            return shouldRender ? (
              <QuestSection
                key={type}
                sectionKey={type}
                title={title}
                items={items}
                emptyLabel={emptyLabel}
                shouldAnimateCards={shouldAnimateCards}
                getInteraction={getInteraction}
                onSelectOption={handleSelectOption}
                onStartQuest={handleStartQuest}
                onSubmitAnswer={handleSubmitAnswer}
              />
            ) : null;
          })}
          {fallbackQuests.length > 0 ? (
            <QuestSection
              sectionKey="other"
              title={OTHER_TYPE_LABEL.title}
              items={fallbackQuests}
              emptyLabel={OTHER_TYPE_LABEL.emptyLabel}
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
  );
}
