"use client";
import { useState } from "react";

export function UpgradeButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/sign-in?redirectTo=/pricing";
        return;
      }
      if (!res.ok || !data.url) {
        setError(
          data.offline
            ? "Checkout isn't live yet — try again soon."
            : "Could not start checkout — try again.",
        );
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button onClick={upgrade} disabled={busy} className="btn-primary block w-full text-center">
        {busy ? "Opening checkout…" : "Upgrade to Premium"}
      </button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
