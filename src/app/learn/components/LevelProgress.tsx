"use client";
import EnergyModal from "@/components/modals/EnergyModal";
import SuccessModal from "@/components/modals/SuccessModal";
import { useAuth } from "@/lib/context/AuthProvider";
import { LEVEL_CATEGORIES, levelInfo } from "@/lib/game/levels";
import { useEnergy } from "@/lib/store/energyStore";
import { supabase } from "@/lib/supabase/client";
import { loadGuestSolvedProblemIds } from "@/lib/utils/guestProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LevelProgress() {
  const router = useRouter();
  const { profile, isGuest } = useAuth();
  const { energy, remainingSeconds } = useEnergy();
  const [showModal, setShowModal] = useState(false);
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });
  const [levelProgress, setLevelProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);

  useEffect(() => {
    async function fetchLevelProgress() {
      if (!profile) return;
      const currentCategory = LEVEL_CATEGORIES[profile.level];
      if (!currentCategory) return;

      try {
        const { data: categoryProblems, error: problemsError } = await supabase
          .from("problems")
          .select("id")
          .eq("category", currentCategory);

        if (problemsError) {
          console.error("Error fetching problems:", problemsError);
          return;
        }

        const problemIds = (categoryProblems ?? []).map((p) => p.id);
        const totalProblems = problemIds.length;

        if (isGuest) {
          const solvedIds = new Set(loadGuestSolvedProblemIds());
          const completed = problemIds.filter((id) => solvedIds.has(id)).length;
          setLevelProgress({ completed, total: totalProblems });
          return;
        }

        const { data: solvedProblems, error: solvedError } = await supabase
          .from("user_solved_problems")
          .select("problem_id")
          .eq("user_id", profile.id)
          .in("problem_id", problemIds);

        if (solvedError) {
          console.error("Error fetching solved problems:", solvedError);
          return;
        }

        setLevelProgress({
          completed: solvedProblems?.length ?? 0,
          total: totalProblems,
        });
      } catch (error) {
        console.error("Error in fetchLevelProgress:", error);
      }
    }

    fetchLevelProgress();
  }, [profile, isGuest]);
  if (!profile) return null;

  const currentLevel = profile.level;
  const currentLevelInfo = levelInfo[currentLevel] || {
    tier: `Level ${currentLevel}`,
    title: "새로운 도전",
  };

  const progressPercent =
    levelProgress.total > 0
      ? (levelProgress.completed / levelProgress.total) * 100
      : 0;

  return (
    <div className="card-md-animated animate__animated animate__fadeInUp stagger-2 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm text-neutral-500">레벨별 학습 주제</h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          {isExpanded ? "접기 ▲" : "펼치기 ▼"}
        </button>
      </div>

      {/* 현재 레벨만 표시 (기본) */}
      <div
        className={`flex items-center justify-between p-2 rounded-md bg-primary-50 border-2 border-primary-500 ${isExpanded ? "mb-3" : "mb-4"}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-primary-500 text-white">
            {currentLevel}
          </div>
          <div>
            <div className="text-xs font-medium text-primary-700">
              {currentLevelInfo.tier}
            </div>
            <div className="text-sm font-semibold text-primary-900">
              {currentLevelInfo.title}
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-primary-600">
          {levelProgress.completed}/{levelProgress.total} 완료
        </div>
      </div>

      {/* 모든 레벨 표시 (펼쳤을 때만) */}
      {isExpanded && (
        <div className="space-y-2 mb-4 expand-down-fast">
          {Object.entries(levelInfo).map(([level, info]) => {
            const levelNum = parseInt(level);
            const isCurrentLevel = levelNum === currentLevel;
            const isPastLevel = levelNum < currentLevel;

            // 현재 레벨은 위에 이미 표시했으므로 스킵
            if (isCurrentLevel) return null;

            return (
              <div
                key={level}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  isPastLevel
                    ? "bg-neutral-50"
                    : "bg-white border border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      isPastLevel
                        ? "bg-neutral-300 text-neutral-600"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {levelNum}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-medium ${
                        isPastLevel ? "text-neutral-600" : "text-neutral-400"
                      }`}
                    >
                      {info.tier}
                    </div>
                    <div
                      className={`text-sm ${
                        isPastLevel ? "text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      {info.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 현재 레벨 진행바 */}
      <div className="mb-4">
        <div className="text-xs text-neutral-500 mb-1">현재 레벨 진행도</div>
        <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-primary-500 h-3 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm"></div>
        <div>
          <button
            className="btn-primary py-2 px-4 text-sm flex items-center justify-center gap-2"
            onClick={async () => {
              if (energy < 1) {
                setShowModal(true);
                return;
              }
              if (!profile) return;

              const currentCategory = LEVEL_CATEGORIES[profile.level];
              if (!currentCategory) return;

              setIsLoadingProblem(true);
              try {
                const solvedIds = new Set(
                  isGuest ? loadGuestSolvedProblemIds() : []
                );

                if (!isGuest) {
                  const { data: solvedProblems } = await supabase
                    .from("user_solved_problems")
                    .select("problem_id")
                    .eq("user_id", profile.id);
                  solvedProblems?.forEach((p) => solvedIds.add(p.problem_id));
                }

                const { data: categoryProblems, error: categoryError } =
                  await supabase
                    .from("problems")
                    .select("id")
                    .eq("category", currentCategory);

                if (categoryError) {
                  throw categoryError;
                }

                const unsolvedProblems = (categoryProblems ?? []).filter(
                  (p) => !solvedIds.has(p.id)
                );

                if (unsolvedProblems && unsolvedProblems.length > 0) {
                  const nextProblemId =
                    unsolvedProblems[
                      Math.floor(Math.random() * unsolvedProblems.length)
                    ].id;
                  router.push(`/problems/${nextProblemId}`);
                } else {
                  const nextLevel = profile.level + 1;
                  const nextCategory = LEVEL_CATEGORIES[nextLevel];

                  if (nextCategory) {
                    const { data: nextLevelProblems, error: nextError } =
                      await supabase
                        .from("problems")
                        .select("id")
                        .eq("category", nextCategory)
                        .order("id", { ascending: true })
                        .limit(1);

                    if (nextError) {
                      throw nextError;
                    }

                    if (nextLevelProblems && nextLevelProblems.length > 0) {
                      router.push(`/problems/${nextLevelProblems[0].id}`);
                    } else {
                      setSuccessModal({
                        open: true,
                        message: "다음 레벨의 문제를 준비 중입니다.",
                      });
                    }
                  } else {
                    setSuccessModal({
                      open: true,
                      message: "축하합니다!\n모든 레벨을 완료했습니다.",
                    });
                  }
                }
              } catch (error) {
                console.error("Error finding next problem:", error);
                setSuccessModal({
                  open: true,
                  message: "문제를 불러오는 중 오류가 발생했습니다.",
                });
              } finally {
                setIsLoadingProblem(false);
              }
            }}
            disabled={isLoadingProblem}
          >
            {isLoadingProblem ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                로딩 중...
              </>
            ) : (
              "문제 풀기"
            )}
          </button>
        </div>
      </div>

      <EnergyModal open={showModal} onClose={() => setShowModal(false)} />
      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ open: false, message: "" })}
        title="알림"
        description={successModal.message}
        buttonText="확인"
      />
    </div>
  );
}
