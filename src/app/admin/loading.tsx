export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Loading admin page"
      className="space-y-5 animate-pulse"
    >
      <div className="h-8 w-56 rounded-lg bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <div key={key} className="h-28 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-white/5" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
