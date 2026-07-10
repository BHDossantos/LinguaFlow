import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: { default: "Noelia — Speak. Don't just tap.", template: "%s — Noelia" },
  description:
    "Say a phrase, get scored word-by-word, fix it on the spot. Adaptive lessons, system roleplay, and live instructors — one app.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Noelia — Speak. Don't just tap.",
    description:
      "Say a phrase, get scored word-by-word, fix it on the spot. Free to start.",
    siteName: "Noelia",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Noelia — Speak. Don't just tap." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noelia — Speak. Don't just tap.",
    description:
      "Say a phrase, get scored word-by-word, fix it on the spot. Free to start.",
    images: ["/og.png"],
  },
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
          <div className="mb-4 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold tracking-tight">
              Noelia
            </a>
            <div className="flex gap-3 text-xs text-ink-500">
              <a href="/inbox" className="hover:text-brand-500">Inbox</a>
              <a href="/family" className="hover:text-brand-500">Family</a>
              <a href="/teach" className="hover:text-brand-500">Teach</a>
              <a href="/school" className="hover:text-brand-500">School</a>
            </div>
          </div>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
