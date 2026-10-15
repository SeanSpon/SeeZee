"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-400/20 bg-slate-900 p-8"
    >
      <h2 className="text-xl font-semibold">This page could not load</h2>
      <p className="mt-2 text-sm text-slate-400">
        Your changes may still be saved. Reload the page before trying the
        action again.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
