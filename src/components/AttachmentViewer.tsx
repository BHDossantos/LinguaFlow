"use client";
import { useEffect, useState } from "react";

export function AttachmentViewer({ submissionId, hint }: { submissionId: string; hint?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uploads/sign-get", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.url) setUrl(d.url);
        else setError(d.error ?? "Could not load attachment");
      })
      .catch(() => !cancelled && setError("network error"));
    return () => { cancelled = true; };
  }, [submissionId]);

  if (error) return <p className="text-xs text-red-600">{error}</p>;
  if (!url) return <p className="text-xs text-ink-500">Loading attachment…</p>;

  const isAudio = /\.(webm|m4a|mp3|ogg|wav)(\?|$)/i.test(url) || hint?.endsWith(".webm");
  const isImage = /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

  if (isAudio) return <audio controls src={url} className="w-full" />;
  if (isImage) return <img src={url} alt="attachment" className="max-h-80 rounded-xl" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-brand-500 underline">
      Open attachment
    </a>
  );
}
