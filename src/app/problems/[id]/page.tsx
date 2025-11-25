"use client";
import EnergyModal from "@/components/modals/EnergyModal";
import LevelUpModal from "@/components/modals/LevelUpModal";
import { useAuth } from "@/lib/context/AuthProvider";
import type { Problem } from "@/lib/mock/problems";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProblemFailView from "./ProblemFailView";
import ProblemHeader from "./ProblemHeader";
import ProblemIdleView from "./ProblemIdleView";
import ProblemStartedView from "./ProblemStartedView";
import ProblemSuccessView from "./ProblemSuccessView";
import { useProblemSolver } from "./useProblemSolver";

function LoadingState({ message }: { message?: string }) {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <div className="card-md-animated animate__animated animate__fadeInUp p-6 text-center flex flex-col items-center text-neutral-600">
        <svg
          className="w-6 h-6 animate-spin text-primary-500"
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
        <p className="mt-3 text-sm font-medium">{message ?? "로딩 중..."}</p>
      </div>
    </div>
  );
}

export default function ProblemPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user, isGuest, profile } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user && !isGuest) {
      router.push("/login");
    }

    async function fetchProblem() {
      if (!id) return;
      const { data } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        // DB (snake_case) -> JS (camelCase)
        const formattedProblem: Problem = {
          ...data,
          correctAnswer: data.correct_answer,
          energyCost: data.energy_cost,
          rewardGold: data.reward_gold,
        };
        setProblem(formattedProblem);
      }
    }

    fetchProblem();
  }, [mounted, user, isGuest, router, id]);

  const {
    status,
    answer,
    setAnswer,
    earnedBonus,
    lostGold,
    showEnergyModal,
    setShowEnergyModal,
    showLevelUpModal,
    levelUpInfo,
    handleStart,
    handleSubmit,
    handleRetry,
    handleLevelUpClose,
    handleNextProblem,
    setStatus,
  } = useProblemSolver(problem);

  if (!mounted) {
    return <LoadingState />;
  }

  if (!profile) return null;

  if (!problem) {
    return <LoadingState message="문제를 불러오는 중입니다..." />;
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <button
        className="text-sm text-primary-600 underline mb-4"
        onClick={() => router.push("/learn")}
      >
        ← 학습 페이지로
      </button>

      <div className="card-scale-in p-6">
        <ProblemHeader problem={problem} />

        {/* 시작 전 */}
        {status === "idle" && (
          <ProblemIdleView
            onStart={handleStart}
            energyCost={problem.energyCost}
          />
        )}

        {/* 문제 풀이 중 */}
        {status === "started" && (
          <ProblemStartedView
            problem={problem}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            onCancel={() => setStatus("idle")}
          />
        )}

        {/* 정답 */}
        {status === "success" && (
          <ProblemSuccessView
            problem={problem}
            earnedBonus={earnedBonus}
            onNext={handleNextProblem}
          />
        )}

        {/* 오답 */}
        {status === "fail" && (
          <ProblemFailView
            problem={problem}
            lostGold={lostGold}
            onRetry={handleRetry}
          />
        )}
      </div>
      <EnergyModal
        open={showEnergyModal}
        onClose={() => setShowEnergyModal(false)}
      />
      <LevelUpModal
        open={showLevelUpModal}
        onClose={handleLevelUpClose}
        nextLevel={levelUpInfo?.nextLevel ?? 1}
        nextCategory={levelUpInfo?.nextCategory ?? ""}
      />
    </div>
  );
}
