"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BasePrototype } from "@/components/BasePrototype";
import type { PrototypeInstanceView } from "@/lib/types";

/**
 * Published page at /p/[slug]. Renders the instance with no blue icon or editor toolbar.
 * Password protection is supported via the same verify-by-slug API.
 */
export default function PublishedPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [instance, setInstance] = useState<PrototypeInstanceView | null>(null);
  const [password, setPassword] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then((p) => setSlug(p.slug));
    } else {
      setSlug(params.slug);
    }
  }, [params]);

  const load = useCallback(async (slugParam: string) => {
    const res = await fetch(`/api/instances/by-slug/${encodeURIComponent(slugParam)}`);
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
    if (!slug) return;
    load(slug);
  }, [slug, load]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setAuthError(false);
    const res = await fetch(`/api/instances/by-slug/${encodeURIComponent(slug)}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setNeedsAuth(false);
      load(slug);
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
        <p className="mb-4 text-slate-600">Page not found.</p>
        <Link href="/library" className="text-slate-700 underline">
          Back to library
        </Link>
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
          <p className="mb-4 text-sm text-slate-500">This page is protected. Enter the password to view.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            autoFocus
          />
          {authError && <p className="mb-2 text-sm text-red-600">Incorrect password.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--color-primary)] py-2 font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
          >
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
