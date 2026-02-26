import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-slate-800">BOI Prototype Engine</h1>
      <p className="mb-10 text-slate-600">
        Generate branded prototype instances from client briefs. Layout stays fixed; theme, copy, and features are dynamic.
      </p>
      <div className="mb-6">
        <Link
          href="/prototype"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-medium text-[var(--color-primary-foreground)] transition hover:opacity-90"
        >
          View default prototype
          <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/brief"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="mb-1 font-semibold text-slate-800">Create from brief</h2>
          <p className="text-sm text-slate-500">Upload or paste a client brief and generate a new instance.</p>
        </Link>
        <Link
          href="/library"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="mb-1 font-semibold text-slate-800">Instance library</h2>
          <p className="text-sm text-slate-500">Browse and open existing branded instances.</p>
        </Link>
      </div>
    </div>
  );
}
