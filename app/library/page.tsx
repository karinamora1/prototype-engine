"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const UNLOCK_KEY = "boi_prototype_unlocked";

export default function LibraryPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1";
    setUnlocked(ok);
    if (ok === false) router.replace("/");
  }, [router]);

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Library</h1>
      <p className="mb-6 text-slate-600">Choose a library to browse.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/library/demo"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Demo Library</h2>
          <p className="mb-2 text-sm text-slate-600">
            All generated prototype instances that you can demo today.
          </p>
          <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800">
            Open demo instances →
          </span>
        </Link>
      </div>
    </div>
  );
}
