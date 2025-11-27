import AppFrame from "@/components/layout/AppFrame";
import AuthProvider from "@/lib/context/AuthProvider";
import { EnergyProvider } from "@/lib/store/energyStore";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isLayoutNeeded = !["/splash", "/login", "/landing"].includes(pathname);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-800 text-base">
        <AuthProvider>
          <EnergyProvider>
            <PwaInstallCapture />
            {isLayoutNeeded ? (
              <AppFrame>{children}</AppFrame>
            ) : (
              <>{children}</>
            )}
          </EnergyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
