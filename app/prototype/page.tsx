import Link from "next/link";
import { BasePrototype } from "@/components/BasePrototype";
import { getDefaultPrototypeConfig } from "@/lib/brief-parser";

export default function DefaultPrototypePage() {
  const config = getDefaultPrototypeConfig();
  return (
    <>
      <div className="fixed right-4 top-4 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-sm backdrop-blur">
        <Link href="/" className="text-slate-600 hover:text-slate-800">
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
