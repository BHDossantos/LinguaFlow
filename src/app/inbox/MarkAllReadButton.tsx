"use client";
import { useTransition } from "react";
import { markAllNotificationsRead } from "./actions";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending || disabled}
      onClick={() => start(() => markAllNotificationsRead())}
      className="text-xs text-brand-500 disabled:opacity-50"
    >
      {pending ? "…" : "Mark all read"}
    </button>
  );
}
