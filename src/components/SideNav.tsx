"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Desktop sidebar (per the product design mock). Mobile keeps BottomNav;
// this renders only at lg+.
const MAIN = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/learn", label: "My Learning", icon: "📚" },
  { href: "/coach", label: "Coach", icon: "🤖" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/profile", label: "Progress", icon: "📈" },
  { href: "/inbox", label: "Messages", icon: "✉️" },
];

const SHORTCUTS = [
  { href: "/review", label: "Review", icon: "🔁" },
  { href: "/practice", label: "Practice", icon: "💬" },
  { href: "/translate", label: "Translate", icon: "🌐" },
  { href: "/tutors", label: "Instructors", icon: "🧑‍🏫" },
  { href: "/career", label: "Career", icon: "💼" },
];

const WORKSPACES = [
  { href: "/teach", label: "Teach", icon: "🎓" },
  { href: "/school", label: "School", icon: "🏫" },
  { href: "/family", label: "Family", icon: "👨‍👩‍👧" },
];

function Item({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
        active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-700 hover:bg-black/[0.04]"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-1 overflow-y-auto border-r border-black/5 bg-white px-3 py-5 lg:flex">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 font-bold text-white">
          N
        </span>
        <span className="text-lg font-bold">Noelia</span>
      </Link>

      {MAIN.map((it) => (
        <Item key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <p className="mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
        Shortcuts
      </p>
      {SHORTCUTS.map((it) => (
        <Item key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <p className="mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
        Workspaces
      </p>
      {WORKSPACES.map((it) => (
        <Item key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <div className="mt-auto pt-4">
        <Link href="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-black/[0.04]">
          ⚙️ Settings
        </Link>
      </div>
    </aside>
  );
}
