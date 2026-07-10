"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Five tabs, per the product design: Home, Discover, Coach, Practice, Profile.
// (Review and Tasks live inside Home's "what's next" flow and Profile.)
const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/learn", label: "Discover", icon: "🔍" },
  { href: "/coach", label: "Coach", icon: "🤖" },
  { href: "/practice", label: "Practice", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#0b1020]/90 backdrop-blur">
      <ul className="mx-auto flex max-w-screen-sm justify-between px-2 py-2">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs ${
                  active ? "text-brand-500 font-semibold" : "text-ink-500"
                }`}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
