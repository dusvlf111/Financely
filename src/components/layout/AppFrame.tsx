"use client";

import AssistantWidget from "@/components/modals/AssistantWidget";
import FeedbackWidget from "@/components/modals/FeedbackWidget";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";
import Navigation from "./Navigation";

interface AppFrameProps {
  children: React.ReactNode;
}

export default function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const isLayoutNeeded = !["/splash", "/login", "/landing"].includes(pathname);
  if (isLayoutNeeded) {
    return (
      <div className="max-w-[768px] mx-auto">
        <Header />
        <main className="px-4 pt-4 pb-48">{children}</main>
        <Navigation />
        <AssistantWidget />
        <FeedbackWidget />
      </div>
    );
  } else {
    return children;
  }
}
