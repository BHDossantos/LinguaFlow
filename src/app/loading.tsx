export default function Loading() {
  return (
    <div className="space-y-4 pt-2" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
      <div className="h-24 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
      <div className="h-24 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
      <div className="h-40 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
    </div>
  );
}
