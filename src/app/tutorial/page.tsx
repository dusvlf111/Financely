"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const SLIDES = [
  { id: 1, src: "/tutorial/1.png", alt: "튜토리얼 1단계" },
  { id: 2, src: "/tutorial/2.png", alt: "튜토리얼 2단계" },
  { id: 3, src: "/tutorial/3.png", alt: "튜토리얼 3단계" },
  { id: 4, src: "/tutorial/4.png", alt: "튜토리얼 4단계" },
];

export default function TutorialPage() {
  const router = useRouter();
  const { profile, completeTutorial, isAuthLoading } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (profile?.tutorial_completed) {
      router.replace("/learn");
    }
  }, [isAuthLoading, profile?.tutorial_completed, router]);

  const goPrev = useCallback(() => {
    setSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handlePrimaryAction = useCallback(async () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex((prev) => Math.min(prev + 1, SLIDES.length - 1));
      return;
    }

    if (isCompleting) return;
    setIsCompleting(true);

    try {
      if (completeTutorial) {
        await completeTutorial();
      }
      router.replace("/learn");
    } finally {
      setIsCompleting(false);
    }
  }, [completeTutorial, router, slideIndex, isCompleting]);

  const nextLabel = useMemo(
    () => (slideIndex === SLIDES.length - 1 ? "시작!" : "다음"),
    [slideIndex]
  );

  return (
    <div className="relative mx-auto h-screen max-w-[700px] max-h-[1000px]">
      <div className="absolute inset-0">
        <Image
          key={SLIDES[slideIndex].id}
          src={SLIDES[slideIndex].src}
          alt={SLIDES[slideIndex].alt}
          fill
          priority
          className="object-contain"
          sizes="100vw"
        />
      </div>

      <div className="pointer-events-none absolute left-0 w-full bottom-10 flex items-center justify-between px-5">
        {slideIndex ? (
          <button
            type="button"
            onClick={goPrev}
            className="pointer-events-auto flex h-13 w-18 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg transition disabled:opacity-40 text-xl font-bold cursor-pointer"
            aria-label="이전"
          >
            이전
          </button>
        ) : (
          <div className="w-18" />
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="pointer-events-auto flex h-13 w-18 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg transition disabled:opacity-40 text-xl font-bold cursor-pointer"
          aria-label={nextLabel}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
