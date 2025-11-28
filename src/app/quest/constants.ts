import type { QuestStatus, QuestType } from "@/lib/quests/service";

export const STATUS_LABEL: Record<QuestStatus, string> = {
  idle: "대기 중",
  active: "활성화",
  in_progress: "진행 중",
  completed: "완료",
  failed: "실패",
  expired: "만료",
};

export const FALLBACK_USER_MESSAGE =
  "회원 로그인이 필요합니다. 현재 게스트 로그인입니다.";
export const EMPTY_MESSAGE = "등록된 퀘스트가 없습니다.";

export const QUEST_TYPE_ORDER: QuestType[] = [
  "weekly",
  "daily",
  "monthly",
  "premium",
  "event",
];

export const QUEST_TYPE_LABEL: Record<
  QuestType,
  { title: string; emptyLabel: string }
> = {
  weekly: { title: "주간 퀘스트", emptyLabel: "주간 퀘스트가 없습니다." },
  daily: { title: "일일 퀘스트", emptyLabel: "일일 퀘스트가 없습니다." },
  monthly: { title: "월간 퀘스트", emptyLabel: "월간 퀘스트가 없습니다." },
  premium: {
    title: "프리미엄 퀘스트",
    emptyLabel: "프리미엄 퀘스트가 없습니다.",
  },
  event: { title: "이벤트 퀘스트", emptyLabel: "이벤트 퀘스트가 없습니다." },
};

export const OTHER_TYPE_LABEL = {
  title: "기타 퀘스트",
  emptyLabel: "기타 퀘스트가 없습니다.",
};
