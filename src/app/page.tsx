"use client";
import type { Viewport } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const viewport: Viewport = {
  themeColor: "#3182F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/splash");
  }, [router]);

  return null;
}
