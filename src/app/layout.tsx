import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "LinguaFlow",
  description: "Speak fluently — adaptive lessons + on-demand human instructors.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b6cf6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main className="mx-auto max-w-screen-sm min-h-screen pb-24 px-4 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
