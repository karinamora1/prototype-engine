"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen, Sparkles } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const unlocked = typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1";
    if (!unlocked) {
      router.replace("/");
    }
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div
        className="fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34, 211, 238, 0.15), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.1), transparent 50%)",
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <header className="mb-12 text-center">
          <h1 className="mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            BOI Prototype Engine
          </h1>
          <p className="text-slate-400">
            Generate branded prototype instances. Layout stays fixed; theme, copy, and features are dynamic.
          </p>
        </header>

        <div className="space-y-4">
          <Link
            href="/brief"
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/40 hover:bg-white/10 hover:shadow-cyan-500/10"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 transition group-hover:bg-cyan-500/30">
              <FileText className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="mb-0.5 font-semibold text-white">Create your Prototype</h2>
              <p className="text-sm text-slate-400">Fill out some quick questions to generate a client-specific instance. Goodluck! Sales Sales Sales.</p>
            </div>
            <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-400" aria-hidden>→</span>
          </Link>

          <Link
            href="/library"
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-violet-500/40 hover:bg-white/10 hover:shadow-violet-500/10"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 transition group-hover:bg-violet-500/30">
              <FolderOpen className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="mb-0.5 font-semibold text-white">Instance Library</h2>
              <p className="text-sm text-slate-400">Browse and open existing branded instances.</p>
            </div>
            <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-400" aria-hidden>→</span>
          </Link>

          <Link
            href="/prototype"
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-amber-500/40 hover:bg-white/10 hover:shadow-amber-500/10"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 transition group-hover:bg-amber-500/30">
              <Sparkles className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="mb-0.5 font-semibold text-white">Explore Default Prototype</h2>
              <p className="text-sm text-slate-400">View the default prototype with sample content and layout.</p>
            </div>
            <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-amber-400" aria-hidden>→</span>
          </Link>

          <Link
            href="/architecture"
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-emerald-500/10"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition group-hover:bg-emerald-500/30">
              <Sparkles className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="mb-0.5 font-semibold text-white">Explore Agentic Architecture</h2>
              <p className="text-sm text-slate-400">See how the agentic prototype flow and architecture come together.</p>
            </div>
            <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-emerald-400" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
