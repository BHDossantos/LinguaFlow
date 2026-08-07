"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type NavLabels = Dictionary["app"]["nav"];

// Five tabs, per the product design: Home, Discover, Coach, Community, Profile.
// (Practice lives one tap inside Community, Home cards, and lesson deep links.)
const items: { href: string; key: keyof NavLabels; icon: string }[] = [
  { href: "/", key: "home", icon: "🏠" },
  { href: "/learn", key: "discover", icon: "🔍" },
  { href: "/coach", key: "coach", icon: "🎯" },
  { href: "/community", key: "community", icon: "👥" },
  { href: "/profile", key: "profile", icon: "👤" },
];

export function BottomNav({ labels }: { labels: NavLabels }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#0b1020]/90 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-screen-sm justify-between px-2 py-2">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs ${
                  active ? "text-brand-500 font-semibold" : "text-ink-500"
                }`}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                {labels[it.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
