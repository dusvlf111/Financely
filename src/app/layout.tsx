import GoogleAnalytics from "@/components/GoogleAnalytics";
import AppFrame from "@/components/layout/AppFrame";
import TutorialRedirector from "@/components/layout/TutorialRedirector";
import AuthProvider from "@/lib/context/AuthProvider";
import { EnergyProvider } from "@/lib/store/energyStore";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";
import PwaInstallCapture from "./PwaInstallCapture";

export const viewport: Viewport = {
  themeColor: "#3182F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Financely - 금융 학습 플랫폼",
  description: "재미있게 배우는 금융 게임화 학습 플랫폼",
  appleWebApp: {
    title: "Financely",
    statusBarStyle: "black-translucent",
    startupImage: [
      "/web-app-manifest-512x512.png",
      "/web-app-manifest-192x192.png",
    ],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-800 text-base">
        <AuthProvider>
          <EnergyProvider>
            <TutorialRedirector>
              <PwaInstallCapture />
              <AppFrame>{children}</AppFrame>
            </TutorialRedirector>
          </EnergyProvider>
        </AuthProvider>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
