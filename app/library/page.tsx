"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

type InstanceMeta = { id: string; name: string; slug: string; createdAt: string };

export default function LibraryPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [list, setList] = useState<InstanceMeta[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadList() {
    setLoading(true);
    const url = query.trim() ? `/api/instances?q=${encodeURIComponent(query)}` : "/api/instances";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadList();
  }, [query]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1";
    setUnlocked(ok);
    if (ok === false) router.replace("/");
  }, [router]);

  function handleDelete(e: React.MouseEvent, item: InstanceMeta) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}"? All instance data will be permanently removed.`)) return;
    setDeletingId(item.id);
    fetch(`/api/instances/${item.id}`, { method: "DELETE" })
      .then((r) => {
        if (r.ok) setList((prev) => prev.filter((i) => i.id !== item.id));
        else return r.json().then((data) => Promise.reject(data?.error ?? "Delete failed"));
      })
      .catch(() => {
        setDeletingId(null);
        loadList();
      })
      .finally(() => setDeletingId(null));
  }

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
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Instance library</h1>
      <p className="mb-6 text-slate-600">Search and open your generated prototype instances.</p>
      <input
        type="search"
        placeholder="Search by name..."
        className="mb-6 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-slate-500">No instances yet. Create one from a brief.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item.id} className="group flex items-center gap-2">
              <Link
                href={`/instance/${item.id}`}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <span className="font-medium text-slate-800">{item.name}</span>
                <span className="ml-2 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => handleDelete(e, item)}
                disabled={deletingId === item.id}
                title="Delete instance"
                className="flex-shrink-0 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
