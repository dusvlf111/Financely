"use client";
import AssistantWidget from "@/components/modals/AssistantWidget";
import FeedbackWidget from "@/components/modals/FeedbackWidget";
import AuthProvider from "@/lib/context/AuthProvider";
import { EnergyProvider } from "@/lib/store/energyStore";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "../components/layout/Header";
import Navigation from "../components/layout/Navigation";
import "./globals.css";
import PwaInstallCapture from "./PwaInstallCapture";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLayoutNeeded = !["/splash", "/login", "/landing"].includes(pathname);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-800 text-base">
        <AuthProvider>
          <EnergyProvider>
            <PwaInstallCapture />
            {isLayoutNeeded ? (
              <div className="max-w-[768px] mx-auto">
                <Header />
                <main className="px-4 pt-4 pb-48">{children}</main>
                <Navigation />
                <AssistantWidget />
                <FeedbackWidget />
              </div>
            ) : (
              <>{children}</>
            )}
          </EnergyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
