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
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json?v=20251024-1" />
        {/* Theme Color for address bar styling (match manifest) */}
        <meta name="theme-color" content="#3182F6" />

        {/* Icons */}
        <link
          rel="icon"
          href="/favicon/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/favicon/apple-icon-180x180.png" />

        {/* Mobile meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Financely" />

        {/* Viewport for mobile */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className="min-h-screen bg-neutral-100 text-neutral-800 text-base">
        <AuthProvider>
          <EnergyProvider>
            <PwaInstallCapture />
            {isLayoutNeeded ? (
              <div className="max-w-[768px] mx-auto">
                <Header />
                <main className="px-4 pt-4 pb-28">{children}</main>
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
