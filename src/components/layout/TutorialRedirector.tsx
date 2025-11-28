"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface TutorialRedirectorProps {
  children: ReactNode;
}

export default function TutorialRedirector({
  children,
}: TutorialRedirectorProps) {
  const { profile, isAuthLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    if (profile && !profile.tutorial_completed && pathname !== "/tutorial") {
      router.replace("/tutorial");
      return;
    }
  }, [isAuthLoading, pathname, profile, router]);

  return children;
}
