export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-8xl px-4 py-10">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-56 animate-pulse rounded bg-cream-100" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-cream-100" />
        ))}
      </div>
    </div>
  );
}
