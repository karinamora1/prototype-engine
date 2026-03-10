"use client";

import { useEffect, useState } from "react";
import { BasePrototype } from "@/components/BasePrototype";
import type { PrototypeInstanceView } from "@/lib/types";

export default function StandalonePage() {
  const [instance, setInstance] = useState<PrototypeInstanceView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/instance.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load instance");
        return r.json();
      })
      .then((data) => setInstance(data as PrototypeInstanceView))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  const cssVars: React.CSSProperties = {
    ["--color-primary" as string]: instance.theme.colors.primary,
    ["--color-primary-foreground" as string]: instance.theme.colors.primaryForeground,
  };

  return (
    <div style={cssVars}>
      <BasePrototype
        theme={instance.theme}
        brand={instance.brand}
        content={instance.content}
        features={instance.features}
        enableAIGeneratedContent={true}
        briefSummary={instance.briefSummary}
        firstRecentProjectDetail={instance.firstRecentProjectDetail}
        preGeneratedFlowData={instance.preGeneratedFlowData}
      />
    </div>
  );
}
