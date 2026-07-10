"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-6xl">😵‍💫</p>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-xs text-sm text-ink-500">
        We hit an unexpected error. Your progress is safe.
      </p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Back home</Link>
      </div>
    </div>
  );
}
