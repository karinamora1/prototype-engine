"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, Lock, Unlock, Pencil } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

type InstanceMeta = { id: string; name: string; slug: string; createdAt: string; publishedSlug?: string; hasPassword?: boolean };

export default function DemoLibraryPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [list, setList] = useState<InstanceMeta[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InstanceMeta | null>(null);
  const [removingPasswordId, setRemovingPasswordId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameItem, setRenameItem] = useState<InstanceMeta | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function loadList() {
    setLoading(true);
    setLoadError(null);
    const url = query.trim() ? `/api/instances?q=${encodeURIComponent(query)}` : "/api/instances";
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d?.error ?? "Failed to load")));
        return r.json();
      })
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setLoadError(err?.message ?? "Failed to load instances");
        setList([]);
      })
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (openMenuId && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

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

  function openRenameModal(item: InstanceMeta) {
    setOpenMenuId(null);
    setRenameItem(item);
    setRenameValue(item.name);
  }

  function confirmRename() {
    if (!renameItem || !renameValue.trim()) {
      setRenameItem(null);
      return;
    }
    const item = renameItem;
    const newName = renameValue.trim();
    setRenameItem(null);
    setRenameValue("");
    setRenamingId(item.id);
    fetch(`/api/instances/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d?.error ?? "Rename failed"));
        setList((prev) => prev.map((i) => (i.id === item.id ? { ...i, name: newName } : i)));
      })
      .catch(() => loadList())
      .finally(() => setRenamingId(null));
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
      <Link href="/library" className="mb-2 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Library
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Demo Library</h1>
      <p className="mb-5 text-slate-600">Search and open your generated prototype instances.</p>
      <input
        type="search"
        placeholder="Search by name..."
        className="mb-6 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="mb-2">{loadError}</p>
          <button
            type="button"
            onClick={() => loadList()}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
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
              <div className="relative flex-shrink-0" ref={openMenuId === item.id ? menuRef : undefined}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                  }}
                  title="More options"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                  aria-label={`Options for ${item.name}`}
                  aria-expanded={openMenuId === item.id}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {openMenuId === item.id && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openRenameModal(item);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(null);
                        // Trigger browser download of the instance JSON
                        window.location.href = `/api/instances/${item.id}/download`;
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Download Project
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(null);
                        handleDelete(e, item);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {renameItem && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            aria-hidden
            onClick={() => setRenameItem(null)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
          >
            <h2 id="rename-dialog-title" className="mb-2 text-lg font-semibold text-slate-900">
              Rename instance
            </h2>
            <p className="mb-3 text-sm text-slate-600">
              Enter a new name for &quot;{renameItem.name}&quot;.
            </p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") setRenameItem(null);
              }}
              className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Instance name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameItem(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRename}
                disabled={!renameValue.trim() || renamingId === renameItem.id}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {renamingId === renameItem.id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </>
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

