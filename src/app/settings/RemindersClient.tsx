"use client";
import { useEffect, useState } from "react";

// Streak-reminder opt-in: registers the service worker and subscribes to
// web push. Degrades honestly when push isn't available (unsupported
// browser, missing VAPID key, permission denied).
export function RemindersToggle() {
  const [state, setState] = useState<"loading" | "unsupported" | "off" | "on" | "denied">("loading");
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!vapid || typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : Notification.permission === "denied" ? "denied" : "off");
    }).catch(() => setState("unsupported"));
  }, [vapid]);

  async function enable() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapid,
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
      });
      setState("on");
    } catch {
      setState(Notification.permission === "denied" ? "denied" : "off");
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState("off");
  }

  if (state === "loading") return null;

  return (
    <section className="card space-y-2" data-testid="reminders">
      <p className="text-sm font-medium">Streak reminders</p>
      {state === "unsupported" && (
        <p className="text-xs text-ink-500">
          Push notifications aren't available in this browser or on this deployment.
        </p>
      )}
      {state === "denied" && (
        <p className="text-xs text-ink-500">
          Notifications are blocked — allow them in your browser settings to get streak reminders.
        </p>
      )}
      {state === "off" && (
        <>
          <p className="text-xs text-ink-500">
            One gentle nudge a day when your streak is about to break. No spam.
          </p>
          <button type="button" onClick={enable} className="btn-primary w-full">
            Enable reminders
          </button>
        </>
      )}
      {state === "on" && (
        <>
          <p className="text-xs text-green-600">✓ On — we'll nudge you before your streak breaks.</p>
          <button type="button" onClick={disable} className="btn-ghost w-full">
            Turn off
          </button>
        </>
      )}
    </section>
  );
}
