export const metadata = { title: "Offline" };

// Served by the service worker when a navigation fails with no network.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md space-y-4 pt-16 text-center">
      <p className="text-5xl">📡</p>
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-sm text-ink-500">
        No connection right now. Your streak is safe — completed work syncs
        the moment you&apos;re back online.
      </p>
      {/* Plain anchor on purpose: client-side navigation can't recover from
          the offline state — a full reload after reconnecting can. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="btn-primary inline-flex">Try again</a>
    </div>
  );
}
