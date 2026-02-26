"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BasePrototype } from "@/components/BasePrototype";
import { getDefaultPrototypeConfig } from "@/lib/brief-parser";

const UNLOCK_KEY = "boi_prototype_unlocked";

export default function DefaultPrototypePage() {
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

  const config = getDefaultPrototypeConfig();
  return (
    <>
      <div className="fixed right-4 top-4 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-sm backdrop-blur">
        <Link href="/dashboard" className="text-slate-600 hover:text-slate-800">
          ← BOI Prototype Engine
        </Link>
      </div>
      <BasePrototype
        theme={config.theme}
        brand={config.brand}
        content={config.content}
        features={config.features}
        enableAIGeneratedContent={false}
      />
    </>
  );
}
