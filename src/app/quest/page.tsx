"use client";

const PREPARING_MESSAGE = "퀘스트 관련 기능은 현재 준비중입니다.";

export default function QuestPage() {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">퀘스트</h1>
      <div className="card-md-animated card-scale-in p-6 text-center bg-neutral-50">
        <p className="text-base text-neutral-700">{PREPARING_MESSAGE}</p>
        <p className="text-sm text-neutral-500 mt-2">
          준비가 완료되면 다시 안내드릴게요!
        </p>
      </div>
    </div>
  );
}
