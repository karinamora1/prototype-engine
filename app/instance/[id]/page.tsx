"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { BasePrototype } from "@/components/BasePrototype";
import type { PrototypeInstanceView } from "@/lib/types";

export default function InstancePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [instance, setInstance] = useState<PrototypeInstanceView | null>(null);
  const [password, setPassword] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [libraryPopupOpen, setLibraryPopupOpen] = useState(false);
  const [refinePopupOpen, setRefinePopupOpen] = useState(false);
  const [designTokensMoreOpen, setDesignTokensMoreOpen] = useState(false);
  const [editingTokenKey, setEditingTokenKey] = useState<string | null>(null);
  const [editingTokenValue, setEditingTokenValue] = useState("");
  const [saveTokenLoading, setSaveTokenLoading] = useState(false);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then((p) => setId(p.id));
    } else {
      setId(params.id);
    }
  }, [params]);

  const load = useCallback(async (instanceId: string) => {
    const res = await fetch(`/api/instances/${instanceId}`);
    const data = await res.json();
    if (!res.ok) {
      setInstance(null);
      setLoading(false);
      return;
    }
    setInstance(data as PrototypeInstanceView);
    setNeedsAuth(!!data.passwordProtected);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id, load]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setAuthError(false);
    const res = await fetch(`/api/instances/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setNeedsAuth(false);
      load(id);
    } else {
      setAuthError(true);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-slate-600">Instance not found.</p>
        <Link href="/library" className="text-slate-700 underline">Back to library</Link>
      </div>
    );
  }

  if (needsAuth) {
    const authCssVars: React.CSSProperties = {
      ["--color-primary" as string]: instance.theme.colors.primary,
      ["--color-primary-foreground" as string]: instance.theme.colors.primaryForeground,
    };
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4" style={authCssVars}>
        <form onSubmit={handleVerify} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Password required</h2>
          <p className="mb-4 text-sm text-slate-500">This instance is protected. Enter the password to view.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            autoFocus
          />
          {authError && <p className="mb-2 text-sm text-red-600">Incorrect password.</p>}
          <button type="submit" className="w-full rounded-lg bg-[var(--color-primary)] py-2 font-medium text-[var(--color-primary-foreground)] hover:opacity-90">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  const instanceCssVars: React.CSSProperties = {
    ["--color-primary" as string]: instance.theme.colors.primary,
    ["--color-primary-foreground" as string]: instance.theme.colors.primaryForeground,
  };

  return (
    <div style={instanceCssVars}>
      <div className="fixed right-4 top-4 z-20">
        <button
          type="button"
          onClick={() => setLibraryPopupOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
          aria-label="Open library menu"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>
      </div>
      {libraryPopupOpen && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setLibraryPopupOpen(false)}
          />
          <div className="fixed right-4 top-16 z-30 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <Link
              href="/library"
              className="block rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
            >
              Back to instance library
            </Link>
            <button
              type="button"
              onClick={() => {
                setLibraryPopupOpen(false);
                setRefinePopupOpen(true);
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refine UI
            </button>
          </div>
        </>
      )}
      {refinePopupOpen && instance && id && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px]"
            onClick={() => {
              setRefinePopupOpen(false);
              setEditingTokenKey(null);
            }}
          />
          <div className="fixed right-4 top-4 z-30 max-h-[calc(100vh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Design tokens</h2>
            {editingTokenKey ? (
              <div className="mb-5">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Edit {editingTokenKey.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={
                        editingTokenValue.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(editingTokenValue)
                          ? editingTokenValue
                          : editingTokenValue.startsWith("#") && /^#[0-9A-Fa-f]{3}$/.test(editingTokenValue)
                            ? `#${editingTokenValue[1]}${editingTokenValue[1]}${editingTokenValue[2]}${editingTokenValue[2]}${editingTokenValue[3]}${editingTokenValue[3]}`
                            : "#374151"
                      }
                      onChange={(e) => setEditingTokenValue(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-slate-200 p-0"
                    />
                    <input
                      type="text"
                      value={editingTokenValue}
                      onChange={(e) => setEditingTokenValue(e.target.value)}
                      placeholder="#000000"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saveTokenLoading}
                      onClick={async () => {
                        const hex = editingTokenValue.trim();
                        if (!/^#?[0-9A-Fa-f]{3,6}$/.test(hex)) return;
                        const normalized = hex.startsWith("#") ? hex : `#${hex}`;
                        const sixHex =
                          normalized.length === 4
                            ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
                            : normalized.length === 7
                              ? normalized
                              : `${normalized}#000000`.slice(0, 7);
                        setSaveTokenLoading(true);
                        try {
                          const res = await fetch(`/api/instances/${id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              theme: { colors: { [editingTokenKey]: sixHex } },
                            }),
                          });
                          const data = await res.json();
                          if (res.ok && data.id) {
                            setInstance(data as PrototypeInstanceView);
                            setEditingTokenKey(null);
                          }
                        } finally {
                          setSaveTokenLoading(false);
                        }
                      }}
                      className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50"
                    >
                      {saveTokenLoading ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTokenKey(null)}
                      className="rounded-lg border border-slate-200 py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <section className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Colors</h3>
              {(() => {
                const colors = { ...instance.theme.colors };
                const defaults: Record<string, string> = {
                  selectedBackground: "#f0f9ff",
                  selectedBorder: instance.theme.colors.primary ?? "#3b82f6",
                  selectedForeground: "#1e40af",
                };
                const merged = { ...defaults, ...colors };
                type ColorKey = keyof typeof merged;
                const hiddenKeys = ["accentCard1", "accentCard2", "accentCard3"];
                const mainOrder: ColorKey[] = ["primary", "accent", "selectedBackground"];
                const moreKeys: ColorKey[] = [
                  "primaryForeground",
                  "selectedForeground",
                  "selectedBorder",
                  "accentForeground",
                  "background",
                  "foreground",
                  "muted",
                  "border",
                ];
                const mainEntries = mainOrder
                  .filter((key) => merged[key] != null)
                  .map((key) => [key, merged[key]] as [string, string]);
                const moreEntries = moreKeys
                  .filter((key) => merged[key] != null)
                  .map((key) => [key, merged[key]] as [string, string]);
                const descriptions: Record<string, string> = {
                  primary: "Primary buttons, links, step indicators, selected states, and key CTAs.",
                  primaryForeground: "Text and icons on primary-colored backgrounds (e.g. button labels).",
                  accent: "Sidebar accent (e.g. Home button), highlights, and accent surfaces.",
                  accentForeground: "Text on accent backgrounds.",
                  background: "Main page and panel backgrounds.",
                  foreground: "Primary text and headings.",
                  muted: "Secondary text, placeholders, and muted labels.",
                  border: "Borders, dividers, and card outlines.",
                  selectedBackground: "Background fill for selected cards, pills, and tabs.",
                  selectedBorder: "Border for selected cards, pills, tabs, and focus rings.",
                  selectedForeground: "Text color on selected backgrounds (e.g. selected tab or pill label).",
                };
                const renderToken = (key: string, value: string) => (
                  <li key={key} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 flex-shrink-0 rounded-md border border-slate-200"
                        style={{ backgroundColor: value }}
                        title={value}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{key}</p>
                        <p className="font-mono text-xs text-slate-600">{value}</p>
                      </div>
                    </div>
                    {descriptions[key] && (
                      <p className="mt-1.5 text-xs text-slate-500">{descriptions[key]}</p>
                    )}
                  </li>
                );
                const renderMainToken = (key: string, value: string) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTokenKey(key);
                        setEditingTokenValue(value || "#374151");
                      }}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-left transition hover:border-slate-200 hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 flex-shrink-0 rounded-md border border-slate-200"
                          style={{ backgroundColor: value }}
                          title={value}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{key}</p>
                          <p className="font-mono text-xs text-slate-600">{value}</p>
                        </div>
                      </div>
                      {descriptions[key] && (
                        <p className="mt-1.5 text-xs text-slate-500">{descriptions[key]}</p>
                      )}
                    </button>
                  </li>
                );
                return (
                  <>
                    <ul className="space-y-2">
                      {mainEntries.map(([key, value]) => renderMainToken(key, value))}
                    </ul>
                    {moreEntries.length > 0 && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setDesignTokensMoreOpen((o) => !o)}
                          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          More
                          <span className="text-slate-400">{designTokensMoreOpen ? "−" : "+"}</span>
                        </button>
                        {designTokensMoreOpen && (
                          <ul className="mt-2 space-y-2">
                            {moreEntries.map(([key, value]) => renderToken(key, value))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
            <button
              type="button"
              onClick={() => setRefinePopupOpen(false)}
              className="mt-4 w-full rounded-lg bg-[var(--color-primary)] py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
            >
              Close
            </button>
          </div>
        </>
      )}
      <BasePrototype
        theme={instance.theme}
        brand={instance.brand}
        content={instance.content}
        features={instance.features}
        briefSummary={instance.briefSummary}
        firstRecentProjectDetail={instance.firstRecentProjectDetail}
      />
    </div>
  );
}
