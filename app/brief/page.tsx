"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BriefPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [childrenBrands, setChildrenBrands] = useState("");
  const [uiScheme, setUiScheme] = useState("");
  const [themeImageDataUrl, setThemeImageDataUrl] = useState<string | null>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);
  const [logoImageDataUrl, setLogoImageDataUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [wordmarkImageDataUrl, setWordmarkImageDataUrl] = useState<string | null>(null);
  const wordmarkFileInputRef = useRef<HTMLInputElement>(null);
  const [brief, setBrief] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [visualsThemeMode, setVisualsThemeMode] = useState<"text" | "screenshot">("text");
  const [themeDragOver, setThemeDragOver] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [wordmarkDragOver, setWordmarkDragOver] = useState(false);

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

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGeneratedId(null);
    if (!brief.trim()) {
      setError("Please enter or paste a brief.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/instances/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: brief.trim(),
          password: password || undefined,
          clientName: clientName.trim() || undefined,
          childrenBrands: childrenBrands.trim() || undefined,
          uiScheme: visualsThemeMode === "text" ? (uiScheme.trim() || undefined) : undefined,
          themeImage: visualsThemeMode === "screenshot" ? themeImageDataUrl || undefined : undefined,
          logoImage: logoImageDataUrl || undefined,
          wordmarkImage: wordmarkImageDataUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setGeneratedId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Generate modal: loading or success */}
      {(loading || generatedId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="generate-modal-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
            <h2 id="generate-modal-title" className="sr-only">
              {loading ? "Generating instance" : "Instance ready"}
            </h2>
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-slate-600" aria-hidden />
                <p className="text-sm font-medium text-slate-700">Generating your instance…</p>
              </div>
            ) : generatedId ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-slate-700">Instance ready.</p>
                <button
                  type="button"
                  onClick={() => router.push(`/instance/${generatedId}`)}
                  className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                >
                  Open instance →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
      <Link href="/" className="mb-6 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Create Prototype Instance</h1>
      <p className="mb-6 text-slate-600">
        Answer the following questions. The system will create a new branded instance of the innovation engine prototype with relevant copy and visual theme.
      </p>
      <form onSubmit={handleGenerate} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Content</h2>
          <div>
            <label htmlFor="clientName" className="mb-1 block text-sm font-medium text-slate-700">
              Client name
            </label>
            <input
              id="clientName"
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="SC Johnson"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="childrenBrands" className="mb-1 block text-sm font-medium text-slate-700">
              Children brands or Categories
            </label>
            <input
              id="childrenBrands"
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. Glade, Mr. Muscle, Raid"
              value={childrenBrands}
              onChange={(e) => setChildrenBrands(e.target.value)}
            />
            <p className="mt-0.5 text-xs text-slate-500">Separate each brand with a comma.</p>
          </div>
          <div>
            <label htmlFor="brief" className="mb-1 block text-sm font-medium text-slate-700">
              What should the innovation engine focus on?
            </label>
            <textarea
              id="brief"
              rows={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Focus on innovations and potential opportunities in the aircare space"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password (optional)
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Protect this instance"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-800">Visuals</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <div className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload Wordmark (optional)</label>
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
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {wordmarkImageDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={wordmarkImageDataUrl} alt="Wordmark preview" className="h-16 w-auto max-w-[200px] rounded border border-slate-200 object-contain" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearWordmarkImage();
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Remove wordmark
                    </button>
                    <span className="text-xs text-slate-500">or drop a new file</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-slate-600">Drag and drop file here</p>
                  <p className="mb-3 text-xs text-slate-500">or</p>
                  <span className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Upload file
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Upload a Logomark/Icon (optional)</label>
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
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {logoImageDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={logoImageDataUrl} alt="Logomark preview" className="h-16 w-auto max-w-[200px] rounded border border-slate-200 object-contain" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearLogoImage();
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Remove logomark
                    </button>
                    <span className="text-xs text-slate-500">or drop a new file</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-slate-600">Drag and drop file here</p>
                  <p className="mb-3 text-xs text-slate-500">or</p>
                  <span className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Upload file
                  </span>
                </>
              )}
            </div>
          </div>
          </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Theme / colors</p>
          <p className="mb-3 text-xs text-slate-500">Choose one: type instructions or upload a screenshot. The system will use your choice to style the prototype.</p>
          <div className="mb-4 flex rounded-lg border border-slate-200 bg-slate-50/50 p-1">
            <button
              type="button"
              onClick={() => {
                setVisualsThemeMode("text");
                setThemeImageDataUrl(null);
                if (themeFileInputRef.current) themeFileInputRef.current.value = "";
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                visualsThemeMode === "text"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
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
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                visualsThemeMode === "screenshot"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="e.g. Blue and yellow, mainly blues"
                value={uiScheme}
                onChange={(e) => setUiScheme(e.target.value)}
              />
              <p className="mt-0.5 text-xs text-slate-500">Direct instructions for colors and UI styling.</p>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Upload screenshot of Client website or brand guidelines</label>
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
                    ? "border-slate-400 bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {themeImageDataUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={themeImageDataUrl} alt="Upload preview" className="h-24 w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearThemeImage();
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Remove image
                      </button>
                      <span className="text-xs text-slate-500">or drop a new file</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-sm font-medium text-slate-600">Drag and drop file here</p>
                    <p className="mb-3 text-xs text-slate-500">or</p>
                    <span className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </form>
    </div>
  );
}
