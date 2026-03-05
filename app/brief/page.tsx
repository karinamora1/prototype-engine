"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ArrowRight } from "lucide-react";

const UNLOCK_KEY = "boi_prototype_unlocked";

export type ChildBrandEntry = { name: string; description: string };

type CreateStep = "brand" | "loading" | "form";

export default function BriefPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [step, setStep] = useState<CreateStep>("brand");
  const [brandName, setBrandName] = useState("");
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState("");
  const [researchError, setResearchError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [childBrands, setChildBrands] = useState<ChildBrandEntry[]>([{ name: "", description: "" }]);
  const [innovationFocus, setInnovationFocus] = useState("");
  const [uiScheme, setUiScheme] = useState("");
  const [themeImageDataUrl, setThemeImageDataUrl] = useState<string | null>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);
  const [logoImageDataUrl, setLogoImageDataUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [wordmarkImageDataUrl, setWordmarkImageDataUrl] = useState<string | null>(null);
  const wordmarkFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [visualsThemeMode, setVisualsThemeMode] = useState<"text" | "screenshot">("text");
  const [themeDragOver, setThemeDragOver] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [wordmarkDragOver, setWordmarkDragOver] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1";
    setUnlocked(ok);
    if (ok === false) router.replace("/");
  }, [router]);

  function handleThemeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setThemeImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleThemeFileDrop(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setThemeImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearThemeImage() {
    setThemeImageDataUrl(null);
    if (themeFileInputRef.current) themeFileInputRef.current.value = "";
  }

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogoImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleLogoFileDrop(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogoImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearLogoImage() {
    setLogoImageDataUrl(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  }

  function handleWordmarkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setWordmarkImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleWordmarkFileDrop(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setWordmarkImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearWordmarkImage() {
    setWordmarkImageDataUrl(null);
    if (wordmarkFileInputRef.current) wordmarkFileInputRef.current.value = "";
  }

  async function handleResearchBrand(e: React.FormEvent) {
    e.preventDefault();
    setResearchError(null);
    if (!brandName.trim()) {
      setResearchError("Please enter the brand name.");
      return;
    }
    setStep("loading");
    try {
      const res = await fetch("/api/research-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          brandWebsiteUrl: brandWebsiteUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Research failed");
      setClientName(data.clientName ?? brandName.trim());
      setChildBrands(
        Array.isArray(data.childBrands) && data.childBrands.length > 0
          ? data.childBrands.map((b: { name?: string; description?: string }) => ({
              name: String(b.name ?? "").trim() || "Brand",
              description: String(b.description ?? "").trim() || "",
            }))
          : [{ name: "", description: "" }]
      );
      setInnovationFocus(data.innovationFocus ?? "");
      setStep("form");
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : "Something went wrong");
      setStep("brand");
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGeneratedId(null);
    const focus = innovationFocus.trim();
    if (!focus) {
      setError("Please enter what the innovation engine should focus on.");
      return;
    }
    const childBrandsFiltered = childBrands.filter((b) => b.name.trim());
    const contextBlock =
      childBrandsFiltered.length > 0
        ? childBrandsFiltered
            .map((b) => `${b.name}: ${(b.description || "").trim() || "No description."}`)
            .join("\n\n")
        : "";
    const fullBrief = contextBlock
      ? `Sub-brands and context:\n\n${contextBlock}\n\nInnovation focus:\n${focus}`
      : focus;
    setLoading(true);
    try {
      const childBrandsFiltered = childBrands.filter((b) => b.name.trim());
      const res = await fetch("/api/instances/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: fullBrief,
          clientName: clientName.trim() || undefined,
          childBrands: childBrandsFiltered.length ? childBrandsFiltered.map((b) => ({ name: b.name.trim(), description: (b.description || "").trim() })) : undefined,
          uiScheme: visualsThemeMode === "text" ? (uiScheme.trim() || undefined) : undefined,
          themeImage: visualsThemeMode === "screenshot" ? themeImageDataUrl || undefined : undefined,
          logoImage: logoImageDataUrl || undefined,
          wordmarkImage: wordmarkImageDataUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setGeneratedId(data.id);
      if (data.id && data.preGeneratedFlowData) {
        try {
          sessionStorage.setItem(`boi_instance_${data.id}`, JSON.stringify(data));
        } catch (_) {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
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

    <div className="relative mx-auto max-w-2xl px-4 py-12">
      {/* Generate modal: loading or success */}
      {(loading || generatedId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="generate-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-xl">
            <h2 id="generate-modal-title" className="sr-only">
              {loading ? "Generating instance" : "Instance ready"}
            </h2>
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-400" aria-hidden />
                <p className="text-sm font-medium text-slate-300">Generating your instance…</p>
              </div>
            ) : generatedId ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-slate-300">Instance ready.</p>
                <button
                  type="button"
                  onClick={() => router.push(`/instance/${generatedId}`)}
                  className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-white hover:bg-cyan-400 transition"
                >
                  Open instance →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-slate-400 hover:text-white transition">
        ← Back
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-white">Create Prototype Instance</h1>
      <p className="mb-8 text-slate-400">
        {step === "brand"
          ? "Enter the brand name and website URL. An agent will research the brand and pre-fill the form."
          : "Review and edit the pre-filled content, then add visuals and generate your instance."}
      </p>

      {step === "brand" && (
        <form onSubmit={handleResearchBrand} className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Brand</h2>
            <div>
              <label htmlFor="brandName" className="mb-1 block text-sm font-medium text-slate-300">
                Brand name
              </label>
              <input
                id="brandName"
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                placeholder="e.g. SC Johnson"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="brandWebsiteUrl" className="mb-1 block text-sm font-medium text-slate-300">
                Brand website URL (optional)
              </label>
              <input
                id="brandWebsiteUrl"
                type="url"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                placeholder="https://www.brand.com (helps refine research)"
                value={brandWebsiteUrl}
                onChange={(e) => setBrandWebsiteUrl(e.target.value)}
              />
            </div>
          </section>
          {researchError && <p className="text-sm text-red-400">{researchError}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-medium text-white hover:bg-cyan-400 transition"
          >
            Research brand
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400" aria-hidden />
          <p className="text-sm font-medium text-slate-300">Researching brand and filling out the form…</p>
        </div>
      )}

      {step === "form" && (
      <form onSubmit={handleGenerate} className="space-y-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep("brand")}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Change brand / URL
          </button>
        </div>
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Content</h2>
          <div>
            <label htmlFor="clientName" className="mb-1 block text-sm font-medium text-slate-300">
              Client name
            </label>
            <input
              id="clientName"
              type="text"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              placeholder="SC Johnson"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Children brands or Categories
            </label>
            <p className="mb-2 text-xs text-slate-500">Add each child brand and a description (space, voice, audience, products). Descriptions inform the concepts generated for that brand.</p>
            <div className="space-y-3">
              {childBrands.map((entry, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="Brand name (e.g. Bazooka, Glade)"
                      value={entry.name}
                      onChange={(e) => {
                        const next = [...childBrands];
                        next[index] = { ...next[index], name: e.target.value };
                        setChildBrands(next);
                      }}
                    />
                    {childBrands.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setChildBrands((prev) => prev.filter((_, i) => i !== index))}
                        className="flex-shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                        aria-label="Remove brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <textarea
                    rows={6}
                    className="min-h-[8rem] w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="One paragraph: space the brand plays in, voice, audience, and products (4–6 sentences)."
                    value={entry.description}
                    onChange={(e) => {
                      const next = [...childBrands];
                      next[index] = { ...next[index], description: e.target.value };
                      setChildBrands(next);
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setChildBrands((prev) => [...prev, { name: "", description: "" }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-2.5 text-sm font-medium text-slate-400 transition hover:border-cyan-500/40 hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add child brand
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="innovationFocus" className="mb-1 block text-sm font-medium text-slate-300">
              What should the innovation engine focus on?
            </label>
            <textarea
              id="innovationFocus"
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Opportunities, white space, strategic priorities for concept exploration"
              value={innovationFocus}
              onChange={(e) => setInnovationFocus(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-lg font-semibold text-white">Visuals</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <div className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <label className="mb-2 block text-sm font-medium text-slate-300">Upload Wordmark (optional)</label>
            <p className="mb-2 text-xs text-slate-500">A wordmark is the brand name in typography only (no symbol). It appears at the top of the sidebar when the navbar is expanded.</p>
            <input
              ref={wordmarkFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleWordmarkFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWordmarkDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWordmarkDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWordmarkDragOver(false);
                const file = e.dataTransfer.files?.[0];
                handleWordmarkFileDrop(file ?? null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  wordmarkFileInputRef.current?.click();
                }
              }}
              onClick={() => wordmarkFileInputRef.current?.click()}
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition ${
                wordmarkDragOver
                  ? "border-cyan-500/50 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {wordmarkImageDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={wordmarkImageDataUrl} alt="Wordmark preview" className="h-16 w-auto max-w-[200px] rounded border border-white/10 object-contain" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearWordmarkImage();
                      }}
                      className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/20"
                    >
                      Remove wordmark
                    </button>
                    <span className="text-xs text-slate-500">or drop a new file</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-slate-400">Drag and drop file here</p>
                  <p className="mb-3 text-xs text-slate-500">or</p>
                  <span className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/20">
                    Upload file
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <label className="mb-2 block text-sm font-medium text-slate-300">Upload a Logomark/Icon (optional)</label>
            <p className="mb-2 text-xs text-slate-500">A logomark or icon is the symbol only (e.g. an emblem or mark). It appears in the sidebar when the navbar is collapsed.</p>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLogoDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLogoDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLogoDragOver(false);
                const file = e.dataTransfer.files?.[0];
                handleLogoFileDrop(file ?? null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  logoFileInputRef.current?.click();
                }
              }}
              onClick={() => logoFileInputRef.current?.click()}
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition ${
                logoDragOver
                  ? "border-cyan-500/50 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {logoImageDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={logoImageDataUrl} alt="Logomark preview" className="h-16 w-auto max-w-[200px] rounded border border-white/10 object-contain" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearLogoImage();
                      }}
                      className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/20"
                    >
                      Remove logomark
                    </button>
                    <span className="text-xs text-slate-500">or drop a new file</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-slate-400">Drag and drop file here</p>
                  <p className="mb-3 text-xs text-slate-500">or</p>
                  <span className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/20">
                    Upload file
                  </span>
                </>
              )}
            </div>
          </div>
          </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="mb-2 text-sm font-medium text-slate-300">Theme / colors</p>
          <p className="mb-3 text-xs text-slate-500">Choose one: type instructions or upload a screenshot. The system will use your choice to style the prototype.</p>
          <div className="mb-4 flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setVisualsThemeMode("text");
                setThemeImageDataUrl(null);
                if (themeFileInputRef.current) themeFileInputRef.current.value = "";
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                visualsThemeMode === "text"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Type instructions
            </button>
            <button
              type="button"
              onClick={() => {
                setVisualsThemeMode("screenshot");
                setUiScheme("");
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                visualsThemeMode === "screenshot"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Upload screenshot
            </button>
          </div>
          {visualsThemeMode === "text" ? (
            <>
              <label htmlFor="uiScheme" className="sr-only">
                UI scheme instructions
              </label>
              <textarea
                id="uiScheme"
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                placeholder="e.g. Blue and yellow, mainly blues"
                value={uiScheme}
                onChange={(e) => setUiScheme(e.target.value)}
              />
              <p className="mt-0.5 text-xs text-slate-500">Direct instructions for colors and UI styling.</p>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Upload screenshot of Client website or brand guidelines</label>
              <input
                ref={themeFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThemeFileChange}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setThemeDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setThemeDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setThemeDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  handleThemeFileDrop(file ?? null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    themeFileInputRef.current?.click();
                  }
                }}
                onClick={() => themeFileInputRef.current?.click()}
                className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition ${
                  themeDragOver
                    ? "border-cyan-500/50 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {themeImageDataUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={themeImageDataUrl} alt="Upload preview" className="h-24 w-auto max-w-full rounded-lg border border-white/10 object-contain" />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearThemeImage();
                        }}
                        className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/20"
                      >
                        Remove image
                      </button>
                      <span className="text-xs text-slate-500">or drop a new file</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-sm font-medium text-slate-400">Drag and drop file here</p>
                    <p className="mb-3 text-xs text-slate-500">or</p>
                    <span className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/20">
                      Upload file
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">AI will analyze the image and apply a color scheme to the prototype.</p>
            </div>
          )}
        </div>
        </section>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-white hover:bg-cyan-400 transition disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </form>
      )}
    </div>
    </div>
  );
}
