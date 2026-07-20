import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { PageBeacon } from "@/components/PageBeacon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabaseServer } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnnoelia.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: { default: "Noelia — Speak. Don't just tap.", template: "%s — Noelia" },
  description:
    "Say a phrase, get scored word-by-word, fix it on the spot. Adaptive lessons, system roleplay, and live instructors — one app.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    url: SITE_URL,
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

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-base font-extrabold text-white">
        N
      </span>
      <span className="text-lg font-bold tracking-tight">Noelia</span>
    </Link>
  );
}

// Visitors get a clean marketing shell (wide pages, no app tabs); signed-in
// users get the app shell (phone-width column + bottom navigation).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let authed = false;
  let userName: string | undefined;
  let unreadCount = 0;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await supabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      authed = !!user;
      if (user) {
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        userName =
          (typeof meta.full_name === "string" && meta.full_name) ||
          (typeof meta.name === "string" && meta.name) ||
          user.email?.split("@")[0] ||
          undefined;
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null);
        unreadCount = count ?? 0;
      }
    }
  } catch {
    // Treat as signed out; middleware still guards protected routes.
  }

  if (!authed) {
    const { locale, t } = await getI18n();
    return (
      <html lang={locale}>
        <body className="font-sans">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Logo />
            <nav className="flex items-center gap-2 text-sm sm:gap-4">
              <Link href="/#how" className="hidden text-ink-500 hover:text-brand-500 sm:block">
                {t.nav.how}
              </Link>
              <Link href="/pricing" className="text-ink-500 hover:text-brand-500">
                {t.nav.pricing}
              </Link>
              <LanguageSwitcher current={locale} />
              <Link href="/sign-in" className="btn-primary px-4 py-2 text-sm">
                {t.nav.signIn}
              </Link>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">{children}</main>
          <PageBeacon />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="font-sans">
        <SideNav
          userName={userName}
          version={process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev"}
          unreadCount={unreadCount}
        />
        <main className="min-h-screen px-4 pb-24 pt-6 lg:pl-64 lg:pr-8 lg:pb-10">
          <div className="mx-auto max-w-screen-sm lg:max-w-4xl">
            {/* Mobile top bar — the desktop sidebar replaces it at lg+ */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Logo />
              <div className="flex gap-3 text-xs text-ink-500">
                <Link href="/inbox" className="hover:text-brand-500">Inbox</Link>
                <Link href="/family" className="hover:text-brand-500">Family</Link>
                <Link href="/teach" className="hover:text-brand-500">Teach</Link>
                <Link href="/school" className="hover:text-brand-500">School</Link>
              </div>
            </div>
            {children}
          </div>
        </main>
        <BottomNav />
        <PageBeacon />
      </body>
    </html>
  );
}
