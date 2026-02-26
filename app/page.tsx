"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";
const PASSWORD = "wowkarinaiscool1@";

export default function LandingPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (password.trim() === PASSWORD) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      }
      router.push("/dashboard");
    } else {
      setError("Incorrect password. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Dark gradient mesh background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.35), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.2), transparent), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(59, 130, 246, 0.15), transparent)",
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              BOI Prototype Engine
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter the password to continue
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm"
          >
            <label htmlFor="landing-password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
              <input
                id="landing-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60"
            >
              {submitting ? "Entering…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
