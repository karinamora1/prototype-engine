"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Lock, Unlock } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

type InstanceMeta = { id: string; name: string; slug: string; createdAt: string; publishedSlug?: string; hasPassword?: boolean };

export default function LibraryPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [list, setList] = useState<InstanceMeta[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InstanceMeta | null>(null);
  const [removingPasswordId, setRemovingPasswordId] = useState<string | null>(null);

  function loadList() {
    setLoading(true);
    const url = query.trim() ? `/api/instances?q=${encodeURIComponent(query)}` : "/api/instances";
    fetch(url, { cache: "no-store" })
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
    setDeleteConfirmItem(item);
  }

  function confirmDelete() {
    if (!deleteConfirmItem) return;
    const item = deleteConfirmItem;
    setDeleteConfirmItem(null);
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

  function handleRemovePassword(e: React.MouseEvent, item: InstanceMeta) {
    e.preventDefault();
    e.stopPropagation();
    setRemovingPasswordId(item.id);
    fetch(`/api/instances/${item.id}/password`, { method: "DELETE" })
      .then((r) => {
        if (r.ok) {
          setList((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, hasPassword: false } : i))
          );
        } else {
          return r.json().then((data) => Promise.reject(data?.error ?? "Failed to remove password"));
        }
      })
      .catch(() => {
        loadList();
      })
      .finally(() => setRemovingPasswordId(null));
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
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  {item.hasPassword && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                </span>
                <span className="ml-2 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
              </Link>
              {item.publishedSlug && (
                <a
                  href={`/p/${item.publishedSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Production
                </a>
              )}
              {item.hasPassword && (
                <button
                  type="button"
                  onClick={(e) => handleRemovePassword(e, item)}
                  disabled={removingPasswordId === item.id}
                  title="Remove password"
                  className="flex-shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                  aria-label={`Remove password from ${item.name}`}
                >
                  <Unlock className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleDelete(e, item)}
                disabled={deletingId === item.id}
                title="Delete instance"
                className="flex-shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {deleteConfirmItem && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            aria-hidden
            onClick={() => setDeleteConfirmItem(null)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <h2 id="delete-confirm-title" className="mb-2 text-lg font-semibold text-slate-900">
              Delete instance?
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              Delete &quot;{deleteConfirmItem.name}&quot;? All instance data will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
