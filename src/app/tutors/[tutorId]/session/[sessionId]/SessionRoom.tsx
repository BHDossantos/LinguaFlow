"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SessionRoom({
  sessionId, room, livekitUrl, token, ratePerMinute, maxBudgetCents, tutorName, initialStatus,
}: {
  sessionId: string;
  room: string | null;
  livekitUrl: string | null;
  token: string | null;
  ratePerMinute: number;
  maxBudgetCents: number;
  tutorName: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(0);
  const [cents, setCents] = useState(0);
  const [status, setStatus] = useState(initialStatus);
  const [ending, setEnding] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "live") return;
    let stopped = false;
    async function tick() {
      const res = await fetch("/api/tutor-sessions/heartbeat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) return;
      const d = await res.json();
      if (stopped) return;
      setMinutes(d.minutes ?? 0);
      setCents(d.cents ?? 0);
      if (d.overBudget) end();
    }
    tick();
    intervalRef.current = window.setInterval(tick, 30_000);
    return () => {
      stopped = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [sessionId, status]);

  async function end() {
    setEnding(true);
    try {
      const res = await fetch("/api/tutor-sessions/end", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await res.json();
      setMinutes(d.minutes ?? minutes);
      setCents(d.cents ?? cents);
      setStatus("ended");
    } finally {
      setEnding(false);
    }
  }

  const cap = maxBudgetCents / 100;
  const used = cents / 100;
  const pct = maxBudgetCents > 0 ? Math.min(100, (cents / maxBudgetCents) * 100) : 0;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Session with {tutorName}</h1>
        <span className={`text-xs ${status === "live" ? "text-green-600" : "text-ink-500"}`}>
          {status === "live" ? "● Live" : status}
        </span>
      </header>

      <div className="card space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>{minutes} min · ${used.toFixed(2)}</span>
          <span className="text-ink-500">cap ${cap.toFixed(2)}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-ink-500">
          ${(ratePerMinute / 100).toFixed(2)}/min · billed by the minute. Ends automatically at the cap.
        </p>
      </div>

      <div className="card text-sm">
        {token && livekitUrl && room ? (
          <>
            <p className="font-semibold">Video room ready</p>
            <p className="text-xs text-ink-500 break-all">Room: {room}</p>
            <p className="mt-2 text-xs text-ink-500">
              Wire <code>@livekit/components-react</code> &lt;LiveKitRoom&gt; with the token + URL below to render audio/video.
              Token is one-time, in memory only.
            </p>
            {/* The LiveKitRoom component will be added once @livekit/components-react is installed. */}
          </>
        ) : (
          <p className="text-ink-500">LiveKit not configured. Set LIVEKIT_* env vars to enable video.</p>
        )}
      </div>

      {status === "live" ? (
        <button onClick={end} disabled={ending} className="btn-primary w-full">
          {ending ? "Ending…" : "End session"}
        </button>
      ) : (
        <button onClick={() => router.push("/tutors")} className="btn-primary w-full">
          Done — back to tutors
        </button>
      )}
    </div>
  );
}
