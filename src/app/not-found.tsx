import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-xs text-sm text-ink-500">
        That page doesn't exist — maybe the lesson moved or the link is old.
      </p>
      <Link href="/" className="btn-primary mt-2">Back home</Link>
    </div>
  );
}
