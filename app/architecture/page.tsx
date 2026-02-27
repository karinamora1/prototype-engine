"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

export default function AgenticArchitecturePage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1";
    setUnlocked(ok);
    if (ok === false) router.replace("/");
  }, [router]);

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background treatment */}
      <div
        className="fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(34, 211, 238, 0.18), transparent 55%), radial-gradient(ellipse 60% 35% at 80% 90%, rgba(129, 140, 248, 0.16), transparent 55%)",
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Agentic Architecture Map
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              How the BOI Prototype Engine orchestrates multiple agents to turn a client brief into a fully branded,
              interactive prototype.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 shadow-sm backdrop-blur-sm transition hover:border-cyan-400/60 hover:bg-white/10"
          >
            ← Back to dashboard
          </Link>
        </header>

        {/* Legend */}
        <section className="mb-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-cyan-500" /> <span>Orchestrator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" /> <span>LLM / Reasoning Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-indigo-500" /> <span>Image / Media Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-500" /> <span>Storage / State</span>
          </div>
          <div className="ml-auto text-[11px] text-slate-400">
            Solid arrows = sequential · Stacked nodes = parallel
          </div>
        </section>

        {/* Flow map */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur">
          <div className="flex min-w-[1900px] items-stretch gap-10">
            {/* Column 1: UI orchestrator */}
            <div className="flex w-[400px] flex-col justify-center gap-3">
              <div className="rounded-xl border border-cyan-500/60 bg-cyan-500/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">UI Orchestrator</p>
                <p className="mt-1 font-medium text-slate-50">Dashboard &amp; Brief Form</p>
                <p className="mt-2 text-xs text-slate-200">
                  User enters the client brief, optional theme screenshot, and config. On submit, the UI calls{" "}
                  <code className="rounded bg-slate-800 px-1 py-0.5 text-[10px]">POST /api/instances/generate</code>.
                </p>
              </div>
            </div>

            {/* Arrow → */}
            <div className="flex items-center">
              <div className="inline-flex min-w-[100px] flex-col items-center gap-1 rounded-full px-3 py-2 text-center text-[11px] text-slate-300">
                <ArrowRight className="h-4 w-4 text-cyan-300" />
                <span>Brief sent to LLM</span>
              </div>
            </div>

            {/* Column 2: Brief understanding */}
            <div className="flex w-[400px] flex-col justify-center gap-3">
              <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Brief Understanding Agent
                </p>
                <p className="mt-1 font-medium text-slate-50">`parseBriefFromTextWithAI`</p>
                <p className="mt-2 text-xs text-slate-200">
                  Parses the brief into structured brand, theme, content, and feature flags that power the prototype.
                </p>
              </div>
            </div>

            {/* Arrow → */}
            <div className="flex items-center">
              <div className="inline-flex min-w-[100px] flex-col items-center gap-1 rounded-full px-3 py-2 text-center text-[11px] text-slate-300">
                <ArrowRight className="h-4 w-4 text-amber-300" />
                <span>Instance created in Supabase</span>
              </div>
            </div>

            {/* Column 3: Instance creation / storage + personas */}
            <div className="flex w-[800px] flex-col justify-center gap-3">
              <div className="rounded-xl border border-emerald-500/70 bg-emerald-500/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Content Creation Agent
                </p>
                <p className="mt-1 font-medium text-slate-50">`AIGeneratedBrief` &amp; related copy agents</p>
                <p className="mt-2 text-xs text-slate-200">
                  Generates the base narrative and structured content used across the dashboard (insights copy, persona
                  text, opportunity summaries) at the moment the instance is created.
                </p>
              </div>
              <div className="rounded-xl border border-indigo-500/70 bg-indigo-500/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                  Persona &amp; Persona Image Agents
                </p>
                <p className="mt-1 font-medium text-slate-50">Personas from `AIGeneratedBrief` + imagery utilities</p>
                <p className="mt-2 text-xs text-slate-200">
                  At instance creation time, derives dynamic personas and visual persona representations that are used
                  across the dashboard and concept validation views.
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/70 bg-amber-500/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Instance Store Agent</p>
                <p className="mt-1 font-medium text-slate-50">Supabase-backed `instance-store.ts`</p>
                <p className="mt-2 text-xs text-slate-200">
                  Persists the parsed instance (theme, brand, content, features, validation metadata) as JSON in
                  Supabase and surfaces it in the Instance Library.
                </p>
              </div>
            </div>

            {/* Arrow → */}
            <div className="flex items-center">
              <div className="inline-flex min-w-[100px] flex-col items-center gap-1 rounded-full px-3 py-2 text-center text-[11px] text-slate-300">
                <ArrowRight className="h-4 w-4 text-emerald-300" />
                <span>User action: &quot;Generate Opportunity Spaces&quot;</span>
              </div>
            </div>

            {/* Column 4: User actions & downstream agents */}
            <div className="flex w-[780px] flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Downstream flows after the instance exists
              </p>

              <div className="flex items-stretch gap-3">
                {/* Flow 1: Generate Opportunity Spaces */}
                <div className="flex w-[1200px] flex-col rounded-xl border border-slate-600/60 bg-slate-900/40 p-4 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  Flow 1 · User clicks &quot;Generate Opportunity Spaces&quot;
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  Uses the stored brief + initial insights to create a full Opportunity Spaces view.
                </p>
                <div className="mt-3 flex items-stretch gap-4 border-t border-emerald-500/40 pt-3 text-xs">
                  <div className="flex w-56 flex-col justify-between rounded-lg border border-emerald-500/70 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      User Action
                    </p>
                    <p className="mt-1 font-medium text-slate-50">Click &quot;Generate Opportunity Spaces&quot;</p>
                    <p className="mt-1 text-[11px] text-emerald-100">
                      Reads the existing instance from Supabase as context.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="flex w-56 flex-col justify-between rounded-lg border border-emerald-500/70 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      Insights Agent
                    </p>
                    <p className="mt-1 font-medium text-slate-50">`generateInsightsFromScope`</p>
                    <p className="mt-1 text-[11px] text-emerald-100">
                      Produces Insights Studio cards tailored to the project scope.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="flex w-64 flex-col justify-between rounded-lg border border-emerald-500/70 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      Opportunity Spaces Content Agent
                    </p>
                    <p className="mt-1 font-medium text-slate-50">`generateOpportunitySpacesWithAI`</p>
                    <p className="mt-1 text-[11px] text-emerald-100">
                      Creates 4 scored opportunity spaces with benefits, goals, pain points, and markets.
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5 text-[10px]">
                      <div className="rounded border border-emerald-500/60 bg-emerald-500/15 px-2 py-1.5">
                        <p className="font-semibold text-emerald-100">Opp Space 1</p>
                        <p className="text-[10px] text-emerald-100/90">Top-scoring space</p>
                      </div>
                      <div className="rounded border border-emerald-500/60 bg-emerald-500/15 px-2 py-1.5">
                        <p className="font-semibold text-emerald-100">Opp Space 2</p>
                        <p className="text-[10px] text-emerald-100/90">Second space</p>
                      </div>
                      <div className="rounded border border-emerald-500/60 bg-emerald-500/15 px-2 py-1.5">
                        <p className="font-semibold text-emerald-100">Opp Space 3</p>
                        <p className="text-[10px] text-emerald-100/90">Additional angle</p>
                      </div>
                      <div className="rounded border border-emerald-500/60 bg-emerald-500/15 px-2 py-1.5">
                        <p className="font-semibold text-emerald-100">Opp Space 4</p>
                        <p className="text-[10px] text-emerald-100/90">Additional angle</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="flex w-64 flex-col justify-between rounded-lg border border-indigo-500/70 bg-indigo-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                      Opportunity Image Agents
                    </p>
                    <p className="mt-1 font-medium text-slate-50">`generateOpportunityImageFromContent`</p>
                    <p className="mt-1 text-[11px] text-indigo-100">
                      Generates a hero image per opportunity (OpenAI prompt + Fal image) for each of the 4 spaces.
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5 text-[10px]">
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Image Agent 1</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Image Agent 2</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Image Agent 3</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Image Agent 4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Arrow between Flow 1 and Flow 2 */}
                <div className="flex items-center">
                  <div className="inline-flex min-w-[100px] flex-col items-center gap-1 rounded-full px-3 py-2 text-center text-[11px] text-slate-300">
                    <ArrowRight className="h-4 w-4 text-slate-200" />
                    <span>Then user explores prototype</span>
                  </div>
                </div>

                {/* Flow 2: Explore prototype & validate concepts */}
                <div className="flex w-[1200px] flex-col rounded-xl border border-slate-600/60 bg-slate-900/40 p-4 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  Flow 2 · User explores prototype &amp; validates concepts
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  When the user opens concept detail and validation views, additional agents are invoked on demand.
                </p>
                <div className="mt-3 flex items-stretch gap-4 overflow-x-auto border-t border-slate-600/40 pt-3 text-xs">
                  <div className="flex w-60 flex-col justify-between rounded-lg border border-emerald-500/70 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      User Action
                    </p>
                    <p className="mt-1 font-medium text-slate-50">
                      Open concept detail / validation view in the prototype
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-100">
                      Context from the selected opportunity + concept is passed forward.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="flex w-64 flex-col justify-between rounded-lg border border-emerald-500/70 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      Project Detail &amp; Concepts Agent
                    </p>
                    <p className="mt-1 font-medium text-slate-50">`generateProjectDetailWithAI`</p>
                    <p className="mt-1 text-[11px] text-emerald-100">
                      Enriches the chosen opportunity with deeper narrative, hooks, and validation framing.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-indigo-300" />
                  </div>
                  <div className="flex w-64 flex-col justify-between rounded-lg border border-indigo-500/70 bg-indigo-500/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                      Concept Image Agents (parallel)
                    </p>
                    <p className="mt-1 font-medium text-slate-50">`generateConceptImagesInParallel`</p>
                    <p className="mt-1 text-[11px] text-indigo-100">
                      Runs Fal image generation in parallel for each concept and attaches URLs to the cards.
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5 text-[10px]">
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Concept Image Agent 1</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Concept Image Agent 2</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Concept Image Agent 3</p>
                      </div>
                      <div className="rounded border border-indigo-500/60 bg-indigo-500/15 px-2 py-1.5">
                        <p className="font-semibold text-indigo-100">Concept Image Agent 4</p>
                      </div>
                    </div>
                  </div>
                  {/* Persona agents now shown in instance creation column */}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          This map is a conceptual view of how the BOI Prototype Engine composes multiple focused agents. In practice,
          the UI orchestrator decides when to call each agent, and some are only invoked for specific flows (e.g. theme
          from screenshot, concept validation, or Insights Studio exploration).
        </p>
      </div>
    </div>
  );
}

