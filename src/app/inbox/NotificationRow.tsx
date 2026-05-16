"use client";
import Link from "next/link";
import { useTransition } from "react";
import { markNotificationRead } from "./actions";

const KIND_ICON: Record<string, string> = {
  grade_returned: "📝",
  announcement: "📣",
  attendance_alert: "🟡",
};

export function NotificationRow({
  id, kind, title, body, link, read,
}: {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
}) {
  const [, start] = useTransition();
  function onClick() {
    if (!read) start(() => markNotificationRead({ id }));
  }
  const inner = (
    <div className={"card flex items-start gap-3 " + (read ? "opacity-60" : "")}>
      <span className="text-lg">{KIND_ICON[kind] ?? "🔔"}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {body && <p className="text-xs text-ink-500">{body}</p>}
      </div>
      {!read && <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />}
    </div>
  );
  if (link) {
    return (
      <Link href={link} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return <button onClick={onClick} className="block w-full text-left">{inner}</button>;
}
