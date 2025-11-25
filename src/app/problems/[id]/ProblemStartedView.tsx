import type { Problem } from "@/lib/mock/problems";

interface ProblemStartedViewProps {
  problem: Problem;
  answer: string;
  setAnswer: (answer: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ProblemStartedView({
  problem,
  answer,
  setAnswer,
  onSubmit,
  onCancel,
}: ProblemStartedViewProps) {
  return (
    <div className="space-y-4">
      {problem.options && problem.options.length > 0 ? (
        <div className="space-y-3">
          <label className="text-sm font-medium">보기를 선택하세요:</label>
          {problem.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setAnswer(opt.charAt(0))}
              className={`w-full text-left p-4 border-2 rounded-md transition ${
                answer === opt.charAt(0)
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 hover:border-primary-300 hover:bg-neutral-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">정답을 입력하세요:</label>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border-2 px-4 py-3 rounded-md focus:border-primary-600 focus:outline-none"
            placeholder="정답 입력"
          />
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button
          className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSubmit}
          disabled={!answer}
        >
          제출하기
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}
