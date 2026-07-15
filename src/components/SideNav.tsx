"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Desktop sidebar (per the product design mock — dark panel). Mobile keeps
// BottomNav; this renders only at lg+.
const MAIN = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/learn", label: "My Learning", icon: "📚" },
  { href: "/calendar", label: "Calendar", icon: "🗓️" },
  { href: "/inbox", label: "Messages", icon: "✉️" },
  { href: "/profile", label: "Progress", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/learn?scope=all", label: "Library", icon: "🗂️" },
];

const SHORTCUTS = [
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/review", label: "Flashcards", icon: "🔁" },
  { href: "/practice", label: "Practice", icon: "💬" },
  { href: "/coach", label: "Tutor", icon: "🎯" },
];

const WORKSPACES = [
  { href: "/teach", label: "Teach", icon: "🎓" },
  { href: "/school", label: "School", icon: "🏫" },
  { href: "/family", label: "Family", icon: "👨‍👩‍👧" },
];

function Item({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
        active
          ? "bg-white/10 font-semibold text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-brand-500" />
      )}
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

export function SideNav({
  userName,
  version,
  unreadCount,
}: {
  userName?: string;
  version?: string;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  // usePathname has no search params, so "/learn?scope=all" (Library) never
  // matches — by design, /learn is claimed by My Learning only.
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && !href.includes("?") && pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-1 overflow-y-auto border-r border-white/10 bg-[#0e1022] px-3 py-5 lg:flex">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 font-bold text-white">
          N
        </span>
        <span className="text-lg font-bold text-white">Noelia</span>
      </Link>

      {MAIN.map((it) => (
        <Item
          key={it.href}
          {...it}
          active={isActive(it.href)}
          badge={it.href === "/inbox" ? unreadCount : undefined}
        />
      ))}

      <SectionLabel>Shortcuts</SectionLabel>
      {SHORTCUTS.map((it) => (
        <Item key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <SectionLabel>Workspaces</SectionLabel>
      {WORKSPACES.map((it) => (
        <Item key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <div className="mt-auto pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          ⚙️ Settings
        </Link>
        {version && (
          <p className="px-3 pt-1 text-[9px] tracking-wide text-white/30">build {version}</p>
        )}
        {userName && (
          <Link
            href="/profile"
            className="mt-1 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{userName}</span>
              <span className="block text-[11px] text-white/50">View profile</span>
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
