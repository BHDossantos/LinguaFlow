"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Minimal page-view beacon. Fire-and-forget; failures are silent by design.
export function PageBeacon() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  // Register the service worker once per load: offline fallback + asset
  // cache for everyone, not just users who enabled push reminders.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    const payload = JSON.stringify({ name: "page_view", path: pathname });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }, [pathname]);

  return null;
}
