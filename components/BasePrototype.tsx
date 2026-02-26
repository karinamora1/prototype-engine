"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Clock, Zap, FileText, ExternalLink, TrendingUp, Globe, ArrowRight, Target, Search, Home, Pencil, ChevronDown, AlertTriangle, Info, Loader2, Trash2, Leaf, Lightbulb, Droplets, Sparkles, Lock, Minus, Check, EllipsisVertical, Megaphone, Tag, SprayCan, Flower2, LogOut } from "lucide-react";
import type { BrandTheme, BrandIdentity, ContentMap, FeatureFlags, FirstRecentProjectDetail } from "@/lib/types";

export interface BasePrototypeProps {
  theme: BrandTheme;
  brand: BrandIdentity;
  content: ContentMap;
  features: FeatureFlags;
  /** When false, skip AI-generated insights and opportunity spaces (e.g. default prototype). Default true for instances. */
  enableAIGeneratedContent?: boolean;
  /** Client brief text for this instance; used to AI-generate recent project detail content. */
  briefSummary?: string;
  /** Pre-generated detail for the first recent project (from instance creation). When present, used instead of fetching. */
  firstRecentProjectDetail?: FirstRecentProjectDetail | null;
}

/** Parse comma-separated brand options from content; excludes "Global" and the client/project name (brand.name). */
function parseBrandOptions(content: ContentMap, brandName: string): string[] {
  const raw = content.brandOptions ?? content.selectorLabel ?? "";
  const opts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((o) => o !== "Global" && o !== brandName);
  return opts.length > 0 ? opts : ["Brand"];
}

/**
 * Innovation dashboard: fixed layout and structure; theme, brand, and copy are dynamic.
 * Two-column layout: sidebar + main content (opportunity cards, insights, personas, documents).
 */
export function BasePrototype({ theme, brand, content, features, enableAIGeneratedContent = true, briefSummary, firstRecentProjectDetail }: BasePrototypeProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(content.selectorLabel ?? brand.name);
  const [expandedDocumentIndex, setExpandedDocumentIndex] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<{ label: string; img: string; index?: 0 | 1 } | null>(null);
  const [socialInsightModalOpen, setSocialInsightModalOpen] = useState(false);
  const [selectedSocialInsight, setSelectedSocialInsight] = useState<{
    tag: string;
    titleKey: string;
    descriptionKey: string;
    sourceKey: string;
  } | null>(null);
  const [flowView, setFlowView] = useState<"dashboard" | "defineScope" | "selectMarkets" | "selectDataSources" | "insightStudioLoading" | "insightStudio" | "opportunitySpacesLoading" | "opportunitySpaces">("dashboard");
  const [inputSettingsReadOnlyStep, setInputSettingsReadOnlyStep] = useState<null | "defineScope" | "selectMarkets" | "selectDataSources" | "insightStudio">(null);
  const [inputSettingsDropdownOpen, setInputSettingsDropdownOpen] = useState(false);
  const [opportunitySpacesMoreMenuOpen, setOpportunitySpacesMoreMenuOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [opportunitySpacesLiveText, setOpportunitySpacesLiveText] = useState<string>("");
  const [opportunitySpacesLiveStage, setOpportunitySpacesLiveStage] = useState<string>("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>("1");
  const [opportunitySectionOpen, setOpportunitySectionOpen] = useState<Record<string, boolean>>({
    description: true,
    benefits: true,
    opportunityScore: true,
    opportunitySizing: true,
    consumerGoals: true,
    painPoints: true,
    markets: true,
    experienceOptimization: false,
    styleDifferentiator: true,
  });
  const brandOptions = parseBrandOptions(content, brand.name);
  useEffect(() => {
    const opts = parseBrandOptions(content, brand.name);
    if (opts.length > 0) {
      setSelectedBrand((prev) => (opts.includes(prev) ? prev : opts[0] ?? brand.name));
    }
  }, [content.brandOptions, content.selectorLabel, brand.name]);
  const [opportunitySpacesList, setOpportunitySpacesList] = useState<
    {
      id: string;
      title: string;
      snippet: string;
      score: number;
      image: string;
      benefits?: string[];
      consumerGoals?: string[];
      painPoints?: string[];
      markets?: { id: string; market: string; alignment: string; nuances: string[] }[];
    }[]
  >([
    {
      id: "1",
      title: "Emotion-Responsive Scenting",
      snippet: "Developing a product that transforms someone's inner world through scents that evoke feelings.",
      score: 70,
      image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=400&fit=crop",
      benefits: [
        "Heighten capabilities to increase vitality, energy, focus, mood regulation.",
        "Potentially mitigating and proactively improving mental wellness through aroma.",
        "Provide innovative and emotionally responsive scent solutions.",
      ],
      consumerGoals: [
        "Seek holistic products that support emotional and mental wellbeing.",
        "Want scent to do more than smell nice—support focus, relaxation, or energy.",
        "Value transparency and natural positioning in aircare and fragrance.",
      ],
      painPoints: [
        "Don't always connect emotional well-being to scent; prefer more functional benefits.",
        "Most consumers don't know what makes a good scent; prefer more familiar scents.",
        "Don't perceive that aroma has potential to support mental wellness, beyond relaxation benefits.",
      ],
      markets: [
        { id: "USA", market: "USA", alignment: "Great consumer alignment", nuances: ["Strong interest in wellness and natural positioning.", "Price sensitivity varies by segment."] },
        { id: "Brazil", market: "Brazil", alignment: "Fair consumer alignment", nuances: ["Growing middle class driving trial in premium fragrance.", "Sustainability and natural ingredients are key purchase drivers."] },
        { id: "Colombia", market: "Colombia", alignment: "Fair consumer alignment", nuances: ["Preference for fresh, clean scents in home care.", "Brand trust and recommendations matter more than price."] },
      ],
    },
    {
      id: "2",
      title: "Identity-Driven Fragrance Persona Notion",
      snippet: "Align scent choices with self-expression and identity.",
      score: 36,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
      benefits: [
        "Heighten capabilities to increase vitality, energy, focus, mood regulation.",
        "Potentially mitigating and proactively improving mental wellness through aroma.",
        "Provide innovative and emotionally responsive scent solutions.",
      ],
      consumerGoals: [
        "Seek holistic products that support emotional and mental wellbeing.",
        "Want scent to do more than smell nice—support focus, relaxation, or energy.",
        "Value transparency and natural positioning in aircare and fragrance.",
      ],
      painPoints: [
        "Don't always connect emotional well-being to scent; prefer more functional benefits.",
        "Most consumers don't know what makes a good scent; prefer more familiar scents.",
        "Don't perceive that aroma has potential to support mental wellness, beyond relaxation benefits.",
      ],
      markets: [
        { id: "USA", market: "USA", alignment: "Great consumer alignment", nuances: ["Strong interest in wellness and natural positioning.", "Price sensitivity varies by segment."] },
        { id: "Brazil", market: "Brazil", alignment: "Fair consumer alignment", nuances: ["Growing middle class driving trial in premium fragrance.", "Sustainability and natural ingredients are key purchase drivers."] },
        { id: "Colombia", market: "Colombia", alignment: "Fair consumer alignment", nuances: ["Preference for fresh, clean scents in home care.", "Brand trust and recommendations matter more than price."] },
      ],
    },
    {
      id: "3",
      title: "Cultural & Regional Scent Personalization",
      snippet: "Tailor fragrances to cultural and regional preferences.",
      score: 34,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    },
    {
      id: "4",
      title: "Modular Scent Experiences",
      snippet: "Customizable scent formats for different moments.",
      score: 31,
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=400&fit=crop",
    },
  ]);
  const selectedOpportunity = opportunitySpacesList.find((o) => o.id === selectedOpportunityId) ?? opportunitySpacesList[0];
  const [conceptsView, setConceptsView] = useState(false);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);
  const [opportunityScorePopoverOpen, setOpportunityScorePopoverOpen] = useState(false);
  const [validationReportView, setValidationReportView] = useState(false);
  const [validationRegionCollapsed, setValidationRegionCollapsed] = useState<Record<string, boolean>>({});
  const [validatedConceptIds, setValidatedConceptIds] = useState<Set<string>>(new Set());
  const [comparisonView, setComparisonView] = useState(false);
  const [comparisonCountry, setComparisonCountry] = useState("usa");
  type ConceptItem = {
    id: string;
    opportunityId: string;
    title: string;
    image: string;
    shortSummary: string;
    overview: string;
    variations: string[];
    painPointsSolved: string[];
    consumerGoal: string;
    painPoints: string[];
    opportunityScore: number;
    pricePackSizeOptions: string[];
  };
  const initialConceptsList: ConceptItem[] = [];
  const [conceptsList, setConceptsList] = useState<ConceptItem[]>(initialConceptsList);
  const [generatingConcepts, setGeneratingConcepts] = useState(false);
  function generateConceptsForCurrentOpportunity(opportunityId: string): string[] {
    const baseId = `gen-${Date.now()}`;
    const newConcepts: ConceptItem[] = [];
    const titles = ["New Concept Alpha", "New Concept Beta", "New Concept Gamma", "New Concept Delta", "New Concept Epsilon"];
    const shortSummaries = [
      "A concept aligned with this opportunity, ready for validation.",
      "Another concept option with distinct positioning.",
      "A third concept exploring a different angle.",
      "Concept variation for a specific segment or use case.",
      "Final concept option to round out the set.",
    ];
    const overviews = [
      "A concept aligned with this opportunity, ready for validation and refinement.",
      "Another concept option for this opportunity space with distinct positioning.",
      "A third concept exploring a different angle within the same opportunity.",
      "Concept variation focused on a specific consumer segment or use case.",
      "Final concept option to round out the generated set for evaluation.",
    ];
    const images = [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=400&fit=crop",
    ];
    for (let i = 0; i < 5; i++) {
      const id = `${baseId}-${i}`;
      newConcepts.push({
        id,
        opportunityId,
        title: titles[i],
        image: images[i],
        shortSummary: shortSummaries[i],
        overview: overviews[i],
        variations: ["Variation A", "Variation B"],
        painPointsSolved: ["TBD"],
        consumerGoal: "To be defined through validation.",
        painPoints: ["To be validated."],
        opportunityScore: 65 + Math.floor(Math.random() * 15),
        pricePackSizeOptions: ["Single refill — TBD", "Starter kit — TBD", "Subscription — TBD"],
      });
    }
    setConceptsList((prev) => [...prev.filter((c) => c.opportunityId !== opportunityId), ...newConcepts]);
    return newConcepts.map((c) => c.id);
  }
  const selectedConcept = selectedConceptId
    ? conceptsList.find((x) => x.id === selectedConceptId) ?? null
    : null;
  const conceptsByOpportunity = opportunitySpacesList.map((opp) => ({
    ...opp,
    concepts: conceptsList.filter((c) => c.opportunityId === opp.id),
  }));
  const validatedConcepts = conceptsList.filter((c) => validatedConceptIds.has(c.id));
  const [linkedCustomContent, setLinkedCustomContent] = useState("");
  const [hunches, setHunches] = useState<
    { id: string; title: string; category: string; description: string }[]
  >(() => [
    {
      id: "1",
      title: "Instant, Room-Specific Odor Relief",
      category: "Cross-Category",
      description:
        "Consumers want quick, convenient air freshening solutions that deliver instant, room-specific odor neutralization to maintain comfort in dynamic living environments.",
    },
    {
      id: "2",
      title: "Scent as a Wellness Signal",
      category: "Cross-Category",
      description:
        "A segment of consumers uses fragrance to signal self-care and mental reset, linking fresh scents to feeling in control and restored at home.",
    },
    {
      id: "3",
      title: "Low-Effort Daily Freshness",
      category: "Behavioral",
      description:
        "Demand for set-and-forget or one-touch formats that keep spaces consistently fresh without daily intervention, especially in high-traffic areas.",
    },
    {
      id: "4",
      title: "Natural and Transparent Ingredients",
      category: "Cross-Category",
      description:
        "Growing preference for clearly communicated, plant-derived or naturally derived ingredients in aircare, aligned with broader clean-label expectations.",
    },
  ]);
  const [defineScopeChoice, setDefineScopeChoice] = useState<"narrow" | "broad" | null>(null);
  const [customFocusValue, setCustomFocusValue] = useState("");
  const [selectedFocusPills, setSelectedFocusPills] = useState<Set<string>>(new Set());
  const [suggestedTab, setSuggestedTab] = useState<"popular" | "global" | "cross">("popular");
  const [selectedDefineScopeGlobalInsight, setSelectedDefineScopeGlobalInsight] = useState<"Painpoint" | "JTBD" | "Trend" | null>(null);
  const [selectedDefineScopeCrossInsight, setSelectedDefineScopeCrossInsight] = useState<0 | 1 | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  const [projectDetailCache, setProjectDetailCache] = useState<Record<string, { opportunities: { id: string; title: string; snippet: string; concepts: { id: string; title: string; overview: string; image: string }[] }[] }>>({});
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [projectDetailError, setProjectDetailError] = useState<string | null>(null);
  // Markets are fixed across the prototype (always selected)
  const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set(["USA", "JPN", "DEU"]));
  const [dataSourceToggles, setDataSourceToggles] = useState<Record<string, boolean>>({
    firstParty: true,
    behavioral: false,
    crossCategory: false,
    crossCategorySocial: false,
    competitor: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const opportunitySpacesLivePreRef = useRef<HTMLPreElement>(null);

  // When on Insights Studio loading screen: call AI to generate insights from research scope (or use defaults), then transition
  useEffect(() => {
    if (flowView !== "insightStudioLoading") {
      setLoadingProgress(0);
      return;
    }
    setLoadingProgress(0);
    const duration = 3000;
    const intervalMs = 50;
    const step = (90 / duration) * intervalMs;
    const t = setInterval(() => {
      setLoadingProgress((p) => (p >= 90 ? 90 : Math.min(90, p + step)));
    }, intervalMs);

    if (!enableAIGeneratedContent) {
      // No AI: just run progress bar then transition with default hunches
      const done = setTimeout(() => {
        clearInterval(t);
        setLoadingProgress(100);
        setTimeout(() => setFlowView("insightStudio"), 200);
      }, duration + 300);
      return () => {
        clearInterval(t);
        clearTimeout(done);
      };
    }

    const scopeChoice = defineScopeChoice ?? "broad";
    const customFocus = customFocusValue?.trim() || undefined;
    const focusPills = selectedFocusPills.size ? Array.from(selectedFocusPills) : undefined;

    const globalKeys: Record<string, { title: string; desc: string }> = {
      Painpoint: { title: "sectionGlobalInsightPainpointTitle", desc: "sectionGlobalInsightPainpointDescription" },
      JTBD: { title: "sectionGlobalInsightJtbdTitle", desc: "sectionGlobalInsightJtbdDescription" },
      Trend: { title: "sectionGlobalInsightTrendTitle", desc: "sectionGlobalInsightTrendDescription" },
    };
    const selectedGlobalInsight =
      selectedDefineScopeGlobalInsight &&
      (content[globalKeys[selectedDefineScopeGlobalInsight]?.title] as string | undefined)
        ? {
            type: selectedDefineScopeGlobalInsight,
            title: String(content[globalKeys[selectedDefineScopeGlobalInsight].title] ?? "").trim(),
            description: String(content[globalKeys[selectedDefineScopeGlobalInsight].desc] ?? "").trim(),
          }
        : undefined;

    const crossTitleKeys = ["sectionCrossInsight1Title", "sectionCrossInsight2Title"];
    const crossDescKeys = ["sectionCrossInsight1Description", "sectionCrossInsight2Description"];
    const selectedCrossInsight =
      selectedDefineScopeCrossInsight != null &&
      (content[crossTitleKeys[selectedDefineScopeCrossInsight]] as string | undefined)
        ? {
            index: selectedDefineScopeCrossInsight,
            title: String(content[crossTitleKeys[selectedDefineScopeCrossInsight]] ?? "").trim(),
            description: String(content[crossDescKeys[selectedDefineScopeCrossInsight]] ?? "").trim(),
          }
        : undefined;

    const controller = new AbortController();
    fetch("/api/generate-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scopeChoice,
        customFocus,
        focusPills,
        selectedGlobalInsight: selectedGlobalInsight?.title ? selectedGlobalInsight : undefined,
        selectedCrossInsight: selectedCrossInsight?.title ? selectedCrossInsight : undefined,
      }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to generate insights"))))
      .then((data: { insights?: { title: string; description: string; category: string }[] }) => {
        const list = data?.insights;
        if (Array.isArray(list) && list.length >= 4) {
          setHunches(
            list.slice(0, 4).map((insight, i) => ({
              id: String(i + 1),
              title: insight.title || "Insight",
              category: insight.category || "Cross-Category",
              description: insight.description || "",
            }))
          );
        }
      })
      .catch(() => {
        // Keep default hunches on error
      })
      .finally(() => {
        clearInterval(t);
        setLoadingProgress(100);
        setTimeout(() => setFlowView("insightStudio"), 200);
      });

    return () => {
      clearInterval(t);
      controller.abort();
    };
  }, [flowView, enableAIGeneratedContent]);

  // When generating opportunity spaces: call AI with subject + insights (or use defaults), then transition to Opportunity Spaces
  useEffect(() => {
    if (flowView !== "opportunitySpacesLoading") {
      setGeneratingProgress(0);
      setOpportunitySpacesLiveText("");
      setOpportunitySpacesLiveStage("");
      return;
    }
    setGeneratingProgress(0);
    setOpportunitySpacesLiveText("");
    setOpportunitySpacesLiveStage("");
    const duration = 4000;
    const intervalMs = 50;
    const step = (90 / duration) * intervalMs;
    const t = setInterval(() => {
      setGeneratingProgress((p) => (p >= 90 ? 90 : Math.min(90, p + step)));
    }, intervalMs);

    if (!enableAIGeneratedContent) {
      // No AI: just run progress bar then transition with current opportunity spaces list
      const done = setTimeout(() => {
        clearInterval(t);
        setGeneratingProgress(100);
        setTimeout(() => setFlowView("opportunitySpaces"), 300);
      }, duration + 400);
      return () => {
        clearInterval(t);
        clearTimeout(done);
      };
    }

    const subject = (content.subject ?? brand.name ?? "your category").toString().trim() || "your category";
    const insights = hunches.map((h) => ({ title: h.title, description: h.description, category: h.category }));
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/generate-opportunity-spaces/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, insights }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error("Failed to stream opportunity spaces");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            const lines = part.split("\n");
            let eventName = "message";
            let dataLine = "";
            for (const line of lines) {
              if (line.startsWith("event:")) eventName = line.slice(6).trim();
              if (line.startsWith("data:")) dataLine += line.slice(5).trim();
            }
            if (!dataLine) continue;
            let payload: any = null;
            try {
              payload = JSON.parse(dataLine);
            } catch {
              payload = null;
            }

            if (eventName === "chunk" && payload?.delta) {
              setOpportunitySpacesLiveText((prev) => (prev + String(payload.delta)).slice(-6000));
            } else if (eventName === "stage" && payload?.message) {
              setOpportunitySpacesLiveStage(String(payload.message));
            } else if (eventName === "final" && payload?.opportunitySpaces) {
              const list = payload.opportunitySpaces;
              if (Array.isArray(list) && list.length >= 4) setOpportunitySpacesList(list.slice(0, 4));
            } else if (eventName === "error") {
              // Keep current opportunity spaces on error
            }
          }
        }
      } catch {
        // Keep current opportunity spaces on error
      } finally {
        clearInterval(t);
        setGeneratingProgress(100);
        setTimeout(() => setFlowView("opportunitySpaces"), 300);
      }
    })();

    return () => {
      clearInterval(t);
      controller.abort();
    };
  }, [flowView, enableAIGeneratedContent]);

  useEffect(() => {
    if (!opportunitySpacesLiveText) return;
    opportunitySpacesLivePreRef.current?.scrollTo({ top: opportunitySpacesLivePreRef.current.scrollHeight, behavior: "smooth" });
  }, [opportunitySpacesLiveText]);

  const countryOptions = [
    { value: "United States", flag: "🇺🇸" },
    { value: "Brazil", flag: "🇧🇷" },
    { value: "China", flag: "🇨🇳" },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setDropdownOpen(false);
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(target)) setLocationDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedProjectName) return;
    if (firstRecentProjectDetail?.projectTitle === selectedProjectName) return;
    if (projectDetailCache[selectedProjectName]) return;
    setProjectDetailError(null);
    setProjectDetailLoading(true);
    fetch("/api/generate-project-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectTitle: selectedProjectName, brief: briefSummary ?? "" }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data.opportunities)) {
          setProjectDetailCache((prev) => ({ ...prev, [selectedProjectName]: { opportunities: data.opportunities } }));
        } else {
          setProjectDetailError(data?.error ?? "Failed to load project detail");
        }
      })
      .catch(() => setProjectDetailError("Failed to load project detail"))
      .finally(() => setProjectDetailLoading(false));
  }, [selectedProjectName, briefSummary, firstRecentProjectDetail?.projectTitle]);

  const cssVars: React.CSSProperties = {
    ["--color-primary" as string]: theme.colors.primary,
    ["--color-primary-foreground" as string]: theme.colors.primaryForeground,
    ["--color-accent" as string]: theme.colors.accent,
    ["--color-accent-foreground" as string]: theme.colors.accentForeground ?? "#ffffff",
    ["--color-background" as string]: theme.colors.background,
    ["--color-foreground" as string]: theme.colors.foreground,
    ["--color-muted" as string]: theme.colors.muted,
    ["--color-border" as string]: theme.colors.border,
    ["--color-selected-background" as string]: theme.colors.selectedBackground ?? "#f0f9ff",
    ["--color-selected-border" as string]: theme.colors.selectedBorder ?? theme.colors.primary,
    ["--color-selected-foreground" as string]: theme.colors.selectedForeground ?? theme.colors.primary,
    ["--font-sans" as string]: theme.typography.fontSans,
    ["--font-display" as string]: theme.typography.fontDisplay,
    ["--heading-size" as string]: theme.typography.headingSize,
    ["--body-size" as string]: theme.typography.bodySize,
    fontFamily: theme.typography.fontSans,
  };

  const c = (key: string) => content[key] ?? `[${key}]`;

  return (
    <div
      className="flex h-screen min-h-0 bg-[var(--color-background)] text-[var(--color-foreground)]"
      style={cssVars}
    >
      {/* Left sidebar - hidden in Define Research Scope flow */}
      {features.sidebar !== false && flowView === "dashboard" && (
        <aside
          className={`flex flex-shrink-0 flex-col transition-[width] duration-200 ${
            sidebarCollapsed ? "w-16" : "w-56"
          }`}
          style={{
            background: "linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, black))",
          }}
        >
          <div className={`flex w-full items-center justify-center gap-2 border-b border-white/10 ${sidebarCollapsed ? "p-3" : "p-4"}`}>
            {sidebarCollapsed ? (
              brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto max-w-full object-contain" />
              ) : (
                <span className="truncate font-semibold text-white text-sm" title={brand.name}>
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              )
            ) : (
              brand.wordmarkUrl ? (
                <img src={brand.wordmarkUrl} alt={brand.name} className="h-8 w-auto max-w-full object-contain" />
              ) : (
                <span className="font-semibold text-white text-lg" title={brand.name}>
                  {brand.name}
                </span>
              )
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="border-b border-white/10 p-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded bg-white/10 px-3 py-2 text-left text-sm text-white hover:bg-white/15"
                  title={selectedBrand}
                >
                  <span className="truncate">{selectedBrand}</span>
                  <span className="text-xs">▼</span>
                </button>
                {dropdownOpen && (
                  <ul className="absolute left-0 top-full z-20 mt-1 min-w-[10rem] max-h-48 overflow-auto rounded bg-white py-1 shadow-lg ring-1 ring-black/5">
                    {brandOptions.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBrand(opt);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 ${
                            selectedBrand === opt ? "bg-gray-100 font-medium" : ""
                          }`}
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <nav className="flex flex-1 flex-col space-y-0.5 p-3">
            <button
              type="button"
              onClick={() => setSelectedProjectName(null)}
              className={`flex w-full rounded px-3 py-2 text-sm ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
              style={{ background: "var(--color-accent)", color: "var(--color-accent-foreground)" }}
              title={c("navHome")}
            >
              <span aria-hidden>🏠</span>
              {!sidebarCollapsed && c("navHome")}
            </button>
            <div className="py-2">
              {!sidebarCollapsed && (
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/70">
                  {c("navRecentProjects")}
                </p>
              )}
              <ul className="mt-1 space-y-0.5">
                {[1, 2, 3].map((i) => {
                  const name = (content[`recentProject${i}`] as string) || (i === 1 ? "Project Alpha" : i === 2 ? "Project Beta" : "Project Gamma");
                  const isFirst = i === 1;
                  return (
                    <li key={i}>
                      {isFirst ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProjectName(name)}
                          className={`block w-full rounded px-3 py-1.5 text-left text-sm text-white/90 hover:bg-white/10 hover:text-white ${sidebarCollapsed ? "truncate text-center text-xs" : ""} ${selectedProjectName === name ? "bg-white/15 font-medium" : ""}`}
                          title={name}
                        >
                          {sidebarCollapsed ? name.slice(0, 2) : name}
                        </button>
                      ) : (
                        <span
                          className={`block rounded px-3 py-1.5 text-sm text-white/50 ${sidebarCollapsed ? "truncate text-center text-xs" : ""} cursor-default`}
                          title={name}
                          aria-hidden
                        >
                          {sidebarCollapsed ? name.slice(0, 2) : name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          <div className={`space-y-2 border-t border-white/10 ${sidebarCollapsed ? "p-2" : "p-3"}`}>
            <button
              type="button"
              className={`w-full rounded bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 ${sidebarCollapsed ? "px-2 text-xs" : ""}`}
              title={c("uploadDocument")}
            >
              {sidebarCollapsed ? "↑" : c("uploadDocument")}
            </button>
            <button
              type="button"
              className={`w-full rounded bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 ${sidebarCollapsed ? "px-2 text-xs" : ""}`}
              title={c("viewProjectLibrary")}
            >
              {sidebarCollapsed ? "📁" : c("viewProjectLibrary")}
            </button>
          </div>
          <div className={`border-t border-white/10 ${sidebarCollapsed ? "p-2" : "p-3"}`}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="flex w-full items-center justify-center gap-2 rounded py-2 text-white/80 hover:bg-white/10 hover:text-white"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
          <div className={`p-3 ${sidebarCollapsed ? "text-center" : ""}`}>
            <a href="#" className={`text-sm text-white/70 hover:text-white ${sidebarCollapsed ? "flex justify-center" : ""}`} title={c("logout")}>
              {sidebarCollapsed ? <LogOut className="h-5 w-5" /> : c("logout")}
            </a>
          </div>
        </aside>
      )}

      {/* Main content - scrollable */}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {flowView !== "dashboard" ? (
          /* Explore Opportunities flow - full width, no app sidebar */
          <div className="flex h-full min-h-0 flex-col bg-white">
            {flowView === "opportunitySpaces" && comparisonView ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
                <div className="border-b border-slate-200 bg-white px-8 py-4">
                  <button
                    type="button"
                    onClick={() => setComparisonView(false)}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {c("backToInnovationFlow")}
                  </button>
                </div>
                <div className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
                  <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                    {c("comparisonValidationViewTitle")}
                  </h1>
                  <div className="mb-4 flex justify-center gap-2">
                    {[
                      { id: "usa", label: "United States", flag: "🇺🇸" },
                      { id: "brazil", label: "Brazil", flag: "🇧🇷" },
                      { id: "mexico", label: "Mexico", flag: "🇲🇽" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setComparisonCountry(r.id)}
                        className={`flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                          comparisonCountry === r.id
                            ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] text-[var(--color-selected-foreground)]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span>{r.flag}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{c("comparisonSortBy")}</span>
                    <select className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                      <option>Highest to Lowest</option>
                    </select>
                    <select className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                      <option>{c("validationDesirabilityLabel")}</option>
                    </select>
                    <select className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                      <option>Overall Score</option>
                    </select>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {validatedConcepts.length === 0 ? (
                      <p className="col-span-2 text-center text-sm text-slate-500">{c("comparisonNoReports")}</p>
                    ) : (
                      validatedConcepts.map((concept) => (
                        <div
                          key={concept.id}
                          className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex gap-3">
                            <img src={concept.image} alt="" className="h-20 w-24 flex-shrink-0 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                              <h2 className="text-base font-bold text-slate-900">{concept.title}</h2>
                              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600">{concept.overview}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setComparisonView(false);
                                  setSelectedConceptId(concept.id);
                                  setSelectedOpportunityId(concept.opportunityId);
                                  setValidationReportView(true);
                                }}
                                className="mt-2 text-xs font-medium text-[var(--color-primary)] hover:underline"
                              >
                                {c("viewFullReport")} →
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
                            <div className="flex flex-col items-center">
                              <div className="relative flex h-12 w-12 items-center justify-center">
                                <svg className="h-12 w-12 -rotate-90 text-slate-100" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" stroke="currentColor" />
                                  <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - 80} className="text-emerald-500" />
                                </svg>
                                <span className="absolute text-sm font-bold text-slate-900">80</span>
                              </div>
                              <span className="mt-1 text-[10px] font-medium text-slate-600">{c("validationDesirabilityLabel")}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-emerald-600">$1.2B – $1.5B</span>
                              <span className="mt-0.5 text-[10px] font-medium text-slate-600">Viability</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Lock className="h-10 w-10 text-slate-400" />
                              <span className="mt-0.5 text-[10px] font-medium text-slate-600">{c("validationFeasibilityLabel")}</span>
                            </div>
                          </div>
                          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-10 w-10 items-center justify-center">
                                <svg className="h-10 w-10 -rotate-90 text-slate-100" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" stroke="currentColor" />
                                  <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - 81} className="text-emerald-500" />
                                </svg>
                                <span className="absolute text-xs font-bold text-slate-900">81</span>
                              </div>
                              <span className="text-sm font-semibold text-slate-800">81 {c("validationDesirabilityLabel")}</span>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{c("validationWhatResonates")}</p>
                              <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              {[
                                { label: "Solution-Problem Fit", score: 82, status: "green" },
                                { label: "Differentiation", score: 64, status: "orange" },
                                { label: "Consumer Journey Fit", score: 82, status: "green" },
                                { label: "Future Fit", score: 82, status: "green" },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5">
                                    {item.status === "green" ? (
                                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                    ) : (
                                      <Clock className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    )}
                                    <span className="text-slate-700">{item.label}</span>
                                  </span>
                                  <span className="font-semibold text-slate-900">{item.score}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
            <div className="flex min-h-0 flex-1">
              {/* Step sidebar - when NOT on Opportunity Spaces */}
              {flowView !== "opportunitySpaces" && (
              <aside className="flex w-52 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50 py-8 pl-5 pr-4">
                <div className="flex flex-col items-stretch gap-0">
                  {(() => {
                    const canGoToDefineScope = ["selectMarkets", "selectDataSources", "insightStudioLoading", "insightStudio", "opportunitySpacesLoading"].includes(flowView);
                    const canGoToSelectMarkets = ["selectDataSources", "insightStudioLoading", "insightStudio", "opportunitySpacesLoading"].includes(flowView);
                    const canGoToSelectDataSources = ["insightStudioLoading", "insightStudio", "opportunitySpacesLoading"].includes(flowView);
                    const canGoToInsightStudio = flowView === "opportunitySpacesLoading";
                    return (
                      <>
                  <div className="rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-xs font-semibold text-[var(--color-primary-foreground)] shadow-sm">
                    {c("stepExploreOpportunities")}
                  </div>
                  <div className="flex justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  {canGoToDefineScope ? (
                    <button
                      type="button"
                      onClick={() => setFlowView("defineScope")}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-600 shadow-sm hover:border-[var(--color-primary)]/50 hover:bg-slate-50 hover:text-[var(--color-foreground)] cursor-pointer"
                    >
                      {c("stepDefineScope")}
                    </button>
                  ) : (
                  <div
                    className={`rounded-lg px-3 py-2.5 text-xs shadow-sm ${
                      flowView === "defineScope"
                        ? "border-2 border-[var(--color-primary)] bg-white font-semibold text-[var(--color-foreground)]"
                        : flowView === "selectMarkets"
                          ? "border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)]"
                          : "border border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {c("stepDefineScope")}
                  </div>
                  )}
                  <div className="flex justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  {canGoToSelectMarkets ? (
                    <button
                      type="button"
                      onClick={() => setFlowView("selectMarkets")}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-600 shadow-sm hover:border-[var(--color-primary)]/50 hover:bg-slate-50 hover:text-[var(--color-foreground)] cursor-pointer"
                    >
                      {c("stepSelectMarkets")}
                    </button>
                  ) : (
                  <div
                    className={`rounded-lg px-3 py-2.5 text-xs shadow-sm ${
                      flowView === "selectMarkets"
                        ? "border-2 border-[var(--color-primary)] bg-white font-semibold text-[var(--color-foreground)]"
                        : flowView === "selectDataSources"
                          ? "border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)]"
                          : "border border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {c("stepSelectMarkets")}
                  </div>
                  )}
                  <div className="flex justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  {canGoToSelectDataSources ? (
                    <button
                      type="button"
                      onClick={() => setFlowView("selectDataSources")}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-600 shadow-sm hover:border-[var(--color-primary)]/50 hover:bg-slate-50 hover:text-[var(--color-foreground)] cursor-pointer"
                    >
                      {c("stepSelectDataSources")}
                    </button>
                  ) : (
                  <div
                    className={`rounded-lg px-3 py-2.5 text-xs shadow-sm ${
                      flowView === "selectDataSources"
                        ? "border-2 border-[var(--color-primary)] bg-white font-semibold text-[var(--color-foreground)]"
                        : flowView === "insightStudioLoading" || flowView === "insightStudio" || flowView === "opportunitySpacesLoading"
                          ? "border border-[var(--color-primary)]/60 bg-white text-slate-600"
                          : "border border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {c("stepSelectDataSources")}
                  </div>
                  )}
                  <div className="flex justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  {canGoToInsightStudio ? (
                    <button
                      type="button"
                      onClick={() => setFlowView("insightStudio")}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-600 shadow-sm hover:border-[var(--color-primary)]/50 hover:bg-slate-50 hover:text-[var(--color-foreground)] cursor-pointer"
                    >
                      {c("stepInsightStudio")}
                    </button>
                  ) : (
                  <div
                    className={`rounded-lg px-3 py-2.5 text-xs shadow-sm ${
                      flowView === "insightStudioLoading" || flowView === "insightStudio"
                        ? "border-2 border-[var(--color-primary)] bg-white font-semibold text-[var(--color-foreground)]"
                        : "border border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {c("stepInsightStudio")}
                  </div>
                  )}
                  <div className="flex justify-center py-1">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">
                    {c("stepOpportunitySpaces")}
                  </div>
                      </>
                    );
                  })()}
                </div>
              </aside>
              )}
              {/* Opportunity Spaces: one sidebar with vertical flow steps above opportunity cards */}
              {flowView === "opportunitySpaces" && (
                <aside className="flex w-72 min-h-0 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/80">
                  <div className="flex flex-col py-6 pl-4 pr-3">
                    <div className="flex flex-col items-stretch gap-0.5 mb-5">
                      <div className="rounded-xl border border-slate-200/90 bg-white/95 shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setInputSettingsDropdownOpen((o) => !o)}
                          className="flex w-full items-center justify-between px-3 py-3 text-left"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {c("inputSettingsTitle") || "Input Settings"}
                          </p>
                          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${inputSettingsDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {inputSettingsDropdownOpen && (
                          <div className="space-y-0.5 border-t border-slate-100 px-2 pb-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setInputSettingsReadOnlyStep("defineScope")}
                              className={`flex w-full rounded-lg px-2.5 py-2 text-left text-xs tracking-tight transition ${
                                inputSettingsReadOnlyStep === "defineScope"
                                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              {c("stepDefineScope")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInputSettingsReadOnlyStep("selectMarkets")}
                              className={`flex w-full rounded-lg px-2.5 py-2 text-left text-xs tracking-tight transition ${
                                inputSettingsReadOnlyStep === "selectMarkets"
                                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              {c("stepSelectMarkets")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInputSettingsReadOnlyStep("selectDataSources")}
                              className={`flex w-full rounded-lg px-2.5 py-2 text-left text-xs tracking-tight transition ${
                                inputSettingsReadOnlyStep === "selectDataSources"
                                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              {c("stepSelectDataSources")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInputSettingsReadOnlyStep("insightStudio")}
                              className={`flex w-full rounded-lg px-2.5 py-2 text-left text-xs tracking-tight transition ${
                                inputSettingsReadOnlyStep === "insightStudio"
                                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              {c("stepInsightStudio")}
                            </button>
                          </div>
                        )}
                      </div>
                  </div>
                  <div className="border-t border-slate-200/80 pl-1 pr-1 pb-4 pt-4">
                    <div className="mb-3 flex items-center justify-between gap-2 relative">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Opportunity Spaces & Concepts</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpportunitySpacesMoreMenuOpen((o) => !o)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                          aria-label="More options"
                          aria-expanded={opportunitySpacesMoreMenuOpen}
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </button>
                        {opportunitySpacesMoreMenuOpen && (
                          <>
                            <button
                              type="button"
                              aria-label="Close menu"
                              className="fixed inset-0 z-10"
                              onClick={() => setOpportunitySpacesMoreMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpportunitySpacesMoreMenuOpen(false);
                                  // Generate more opportunity spaces – wire to your handler if needed
                                }}
                                className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                {c("generateMoreOpportunitySpaces")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpportunitySpacesMoreMenuOpen(false);
                                  // Upload custom concept – wire to your handler if needed
                                }}
                                className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                {c("uploadCustomConceptLabel")}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {conceptsView ? (
                      <>
                        <div className="space-y-6">
                          {conceptsByOpportunity.map((opp) => {
                            const isClickableOpp = opp.id === "1" || opp.id === "2";
                            const baseClass = `flex w-full gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                              selectedOpportunityId === opp.id && !selectedConceptId
                                ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] shadow-md shadow-slate-200/50"
                                : "border-slate-200/90 bg-white/95 shadow-sm hover:border-slate-300 hover:shadow hover:bg-white"
                            }`;
                            return (
                            <div key={opp.id} className="relative z-10 space-y-2.5">
                              {isClickableOpp ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOpportunityId(opp.id);
                                    setSelectedConceptId(null);
                                    setValidationReportView(false);
                                    setInputSettingsReadOnlyStep(null);
                                  }}
                                  className={baseClass}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-900">{opp.title}</p>
                                  </div>
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                    {opp.score}
                                  </span>
                                </button>
                              ) : (
                                <div
                                  className={`flex w-full cursor-default items-center gap-2 rounded-xl border-2 p-3 text-left ${
                                    selectedOpportunityId === opp.id && !selectedConceptId
                                      ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] shadow-md shadow-slate-200/50"
                                      : "border-slate-200/90 bg-white/95"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-900">{opp.title}</p>
                                  </div>
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                    {opp.score}
                                  </span>
                                </div>
                              )}
                              {opp.id === selectedOpportunityId &&
                                <div className="relative z-0">
                                  {opp.concepts.map((concept) => (
                                <div key={concept.id} className="mb-4 space-y-1.5 pl-3 border-l-2 border-slate-300/50 ml-1.5 last:mb-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOpportunityId(opp.id);
                                      setSelectedConceptId(concept.id);
                                      setValidationReportView(false);
                                      setInputSettingsReadOnlyStep(null);
                                    }}
                                    className={`flex w-full flex-col gap-1.5 rounded-xl border-2 p-2 text-left transition-all duration-200 ${
                                      selectedConceptId === concept.id && !validationReportView
                                        ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] shadow-md"
                                        : "border-slate-200/80 bg-white/90 shadow-sm hover:border-slate-300 hover:bg-white hover:shadow"
                                    }`}
                                  >
                                    <div className="flex w-full items-center gap-2">
                                      <img src={concept.image} alt="" className="h-8 w-9 flex-shrink-0 rounded-lg object-cover" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold tracking-tight text-slate-900 leading-tight line-clamp-2">{concept.title}</p>
                                      </div>
                                      {!validatedConceptIds.has(concept.id) && (
                                        <span className="flex h-fit flex-shrink-0 self-center rounded-md bg-slate-200/50 px-1.5 py-0.5 text-[8px] font-medium leading-none tracking-wider text-slate-400 uppercase">Concept</span>
                                      )}
                                    </div>
                                  </button>
                                  {validatedConceptIds.has(concept.id) && (
                                    <div
                                      className="flex w-full cursor-pointer gap-1.5"
                                      onClick={() => {
                                        setSelectedOpportunityId(opp.id);
                                        setSelectedConceptId(concept.id);
                                        setValidationReportView(true);
                                        setInputSettingsReadOnlyStep(null);
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setSelectedOpportunityId(opp.id);
                                          setSelectedConceptId(concept.id);
                                          setValidationReportView(true);
                                          setInputSettingsReadOnlyStep(null);
                                        }
                                      }}
                                      aria-label="View validation report"
                                    >
                                      <div className="flex min-w-0 flex-1 flex-col items-start justify-end rounded-b-lg border border-slate-200 bg-white p-1.5 shadow-sm aspect-square">
                                        <div className="flex items-center gap-0.5">
                                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-800">83</span>
                                        </div>
                                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                                          <div className="h-full w-[83%] rounded-full bg-emerald-500" />
                                        </div>
                                        <p className="mt-0.5 truncate text-left text-[8px] font-semibold text-slate-600">{c("validationDesirabilityLabel")}</p>
                                      </div>
                                      <div className="flex min-w-0 flex-1 flex-col items-start justify-end rounded-b-lg border border-slate-200 bg-white p-1.5 shadow-sm aspect-square">
                                        <div className="flex flex-col gap-0.5 leading-tight text-left">
                                          <span className="truncate text-[8px] font-bold tabular-nums text-slate-800">$1.2B</span>
                                          <span className="truncate text-[8px] font-bold tabular-nums text-slate-800">$1.5B</span>
                                        </div>
                                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                                          <div className="h-full w-[60%] rounded-full bg-slate-400" />
                                        </div>
                                        <p className="mt-0.5 truncate text-left text-[8px] font-semibold text-slate-600">Opp Size</p>
                                      </div>
                                      <div className="flex min-w-0 flex-1 flex-col items-start justify-end rounded-b-lg border border-slate-200 bg-white p-1.5 shadow-sm aspect-square">
                                        <div className="flex items-center gap-0.5">
                                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-amber-100 text-[9px] font-bold text-amber-800">72</span>
                                        </div>
                                        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                                          <div className="h-full w-[72%] rounded-full bg-amber-500" />
                                        </div>
                                        <p className="mt-0.5 truncate text-left text-[8px] font-semibold text-slate-600">{c("validationFeasibilityLabel")}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                                </div>
                              }
                            </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {opportunitySpacesList.map((opp) => {
                          const isClickable = opp.id === "1" || opp.id === "2";
                          const baseClass = `flex w-full gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                            selectedOpportunityId === opp.id
                              ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] shadow-md"
                              : "border-slate-200/90 bg-white/95 shadow-sm hover:border-slate-300 hover:shadow hover:bg-white"
                          }`;
                          return isClickable ? (
                            <button
                              key={opp.id}
                              type="button"
                              onClick={() => {
                                setSelectedOpportunityId(opp.id);
                                setInputSettingsReadOnlyStep(null);
                              }}
                              className={baseClass}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900">{opp.title}</p>
                              </div>
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                {opp.score}
                              </span>
                            </button>
                          ) : (
                            <div key={opp.id} className={`${baseClass} cursor-default`}>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900">{opp.title}</p>
                              </div>
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                {opp.score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  </div>
                </aside>
              )}
              {/* Main content - Define Scope or Select Markets or Opportunity detail */}
              <div className="min-w-0 flex-1 overflow-y-auto bg-white px-10 py-10">
                {flowView === "opportunitySpaces" && inputSettingsReadOnlyStep !== null && (
                  <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-4">
                    <button
                      type="button"
                      onClick={() => setInputSettingsReadOnlyStep(null)}
                      className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {c("backToOpportunitySpaces")}
                    </button>
                  </div>
                )}
                {(flowView === "defineScope" || (flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "defineScope")) && (
                <div className={flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "defineScope" ? "pointer-events-none select-none" : ""}>
                <>
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
                  {c("defineScopeTitle")}
                </h1>
                <p className="mb-8 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {c("defineScopeInstructions")}
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDefineScopeChoice("narrow")}
                    className={`flex flex-col items-center rounded-2xl border-2 p-6 text-left shadow-sm transition ${
                      defineScopeChoice === "narrow"
                        ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] hover:opacity-90"
                        : "border-slate-200 bg-white hover:border-[var(--color-primary)] hover:shadow-md"
                    }`}
                  >
                    <div className="relative mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-2 ring-red-100">
                        <Target className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    <p className="mb-1.5 text-base font-semibold text-[var(--color-primary)]">{c("narrowFocusTitle")}</p>
                    <p className="mb-2 text-center text-sm italic leading-relaxed text-slate-700">{c("narrowFocusQuote")}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefineScopeChoice("broad")}
                    className={`flex flex-col items-center rounded-2xl border-2 p-6 text-left shadow-sm transition ${
                      defineScopeChoice === "broad"
                        ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] hover:opacity-90"
                        : "border-slate-200 bg-white hover:border-[var(--color-primary)] hover:shadow-md"
                    }`}
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-200">
                      <Search className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="mb-1.5 text-base font-semibold text-[var(--color-primary)]">{c("keepBroadTitle")}</p>
                    <p className="mb-2 text-center text-sm italic leading-relaxed text-slate-700">{c("keepBroadQuote")}</p>
                  </button>
                </div>

                {defineScopeChoice === "narrow" && (
                  <>
                    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                      <div className="min-h-[280px] pb-6">
                        <div className="mb-4 flex w-full">
                          <button
                            type="button"
                            onClick={() => setSuggestedTab("popular")}
                            className={`flex flex-1 justify-center pb-2 text-sm font-medium ${
                              suggestedTab === "popular"
                                ? "border-b-2 border-[var(--color-selected-border)] text-[var(--color-selected-foreground)]"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {c("tabPopularFocus")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuggestedTab("global")}
                            className={`flex flex-1 justify-center pb-2 text-sm font-medium ${
                              suggestedTab === "global"
                                ? "border-b-2 border-[var(--color-selected-border)] text-[var(--color-selected-foreground)]"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {c("tabGlobalSocial")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuggestedTab("cross")}
                            className={`flex flex-1 justify-center pb-2 text-sm font-medium ${
                              suggestedTab === "cross"
                                ? "border-b-2 border-[var(--color-selected-border)] text-[var(--color-selected-foreground)]"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {c("tabCrossCategory")}
                          </button>
                        </div>
                        {suggestedTab === "popular" && (
                          <div className="flex flex-wrap gap-x-6 gap-y-4">
                            {((content.suggestedFocusPills ?? "").split("|").map((s) => s.trim()).filter(Boolean)).map((pill) => (
                              <button
                                key={pill}
                                type="button"
                                onClick={() => {
                                  setSelectedFocusPills((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(pill)) next.delete(pill);
                                    else next.add(pill);
                                    return next;
                                  });
                                  setCustomFocusValue("");
                                }}
                                className={`rounded-full border-2 px-5 py-3 text-xs font-medium transition ${
                                  selectedFocusPills.has(pill)
                                    ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] text-[var(--color-selected-foreground)]"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                {pill}
                              </button>
                            ))}
                          </div>
                        )}
                        {suggestedTab === "global" && (
                          <ul className="space-y-3">
                              {[
                                {
                                  tag: "Painpoint",
                                  tagClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
                                  titleKey: "sectionGlobalInsightPainpointTitle" as const,
                                  descriptionKey: "sectionGlobalInsightPainpointDescription" as const,
                                  sourceKey: "sectionGlobalInsightPainpointSource" as const,
                                  defaultTitle: "Heightened desire for plant-based food procurement",
                                  defaultDescription: "Sample insight description with engagement and mention data.",
                                },
                                {
                                  tag: "JTBD",
                                  tagClass: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
                                  titleKey: "sectionGlobalInsightJtbdTitle" as const,
                                  descriptionKey: "sectionGlobalInsightJtbdDescription" as const,
                                  sourceKey: "sectionGlobalInsightJtbdSource" as const,
                                  defaultTitle: "Help me find products that fit my family's values",
                                  defaultDescription: "Job-to-be-done insight based on social and engagement data.",
                                },
                                {
                                  tag: "Trend",
                                  tagClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
                                  titleKey: "sectionGlobalInsightTrendTitle" as const,
                                  descriptionKey: "sectionGlobalInsightTrendDescription" as const,
                                  sourceKey: "sectionGlobalInsightTrendSource" as const,
                                  defaultTitle: "Rising interest in sustainable and ethical options",
                                  defaultDescription: "Trend insight from global social listening.",
                                },
                              ].map(({ tag, tagClass, titleKey, descriptionKey, sourceKey, defaultTitle, defaultDescription }) => (
                                <li key={tag}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDefineScopeGlobalInsight(tag as "Painpoint" | "JTBD" | "Trend");
                                      setSelectedSocialInsight({ tag, titleKey, descriptionKey, sourceKey });
                                      setSocialInsightModalOpen(true);
                                    }}
                                    className={`flex w-full gap-4 rounded-lg border p-4 text-left shadow-sm transition hover:shadow ${
                                      selectedDefineScopeGlobalInsight === tag
                                        ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] ring-2 ring-[var(--color-selected-border)]"
                                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-fit min-w-[5rem] flex-shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tagClass}`}
                                    >
                                      {tag}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-[var(--color-foreground)]">
                                        {content[titleKey] ?? defaultTitle}
                                      </p>
                                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                                        {content[descriptionKey] ?? defaultDescription}
                                      </p>
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                        )}
                        {suggestedTab === "cross" && (
                          <ul className="space-y-3">
                              {[
                                { tag: "Painpoint", tagClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60", titleKey: "sectionCrossInsight1Title", descKey: "sectionCrossInsight1Description" },
                                { tag: "Trend", tagClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60", titleKey: "sectionCrossInsight2Title", descKey: "sectionCrossInsight2Description" },
                              ].map(({ tag, tagClass, titleKey, descKey }, i) => (
                                <li key={i}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDefineScopeCrossInsight(i as 0 | 1);
                                      setSelectedSocialInsight({
                                        tag,
                                        titleKey,
                                        descriptionKey: descKey,
                                        sourceKey: i === 0 ? "sectionCrossInsight1Source" : "sectionCrossInsight2Source",
                                      });
                                      setSocialInsightModalOpen(true);
                                    }}
                                    className={`flex w-full gap-4 rounded-lg border p-4 text-left shadow-sm transition hover:shadow ${
                                      selectedDefineScopeCrossInsight === i
                                        ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] ring-2 ring-[var(--color-selected-border)]"
                                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-fit min-w-[5rem] flex-shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tagClass}`}
                                    >
                                      {tag}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-[var(--color-foreground)]">{c(titleKey)}</p>
                                      <p className="mt-1 text-xs text-[var(--color-muted)]">{c(descKey)}</p>
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                      <section>
                        <label className="mb-2 block text-sm font-medium text-slate-800">Or enter a custom focus</label>
                        <input
                          type="text"
                          value={customFocusValue}
                          onChange={(e) => {
                            setCustomFocusValue(e.target.value);
                            if (e.target.value.trim()) {
                              setSelectedFocusPills(new Set());
                              setSelectedDefineScopeGlobalInsight(null);
                              setSelectedDefineScopeCrossInsight(null);
                            }
                          }}
                          placeholder={c("customFocusPlaceholder")}
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <p className="mt-1.5 text-xs text-slate-500">{c("customFocusNote")}</p>
                      </section>
                    </div>
                  </>
                )}
                </>
                </div>
                )}

                {(flowView === "selectMarkets" || (flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "selectMarkets")) && (() => {
                  const FIXED_MARKETS = ["USA", "JPN", "DEU"] as const;
                  const REGIONS: { key: string; labelKey: string; markets: { id: string; name: string; flag: string; warning?: boolean }[] }[] = [
                    { key: "northAmerica", labelKey: "selectAllNorthAmerica", markets: [{ id: "USA", name: "USA", flag: "🇺🇸" }] },
                    { key: "latam", labelKey: "selectAllLATAM", markets: [{ id: "BRA", name: "Brazil", flag: "🇧🇷" }, { id: "MEX", name: "Mexico", flag: "🇲🇽" }, { id: "CHL", name: "Chile", flag: "🇨🇱" }, { id: "ARG", name: "Argentina", flag: "🇦🇷" }, { id: "CAM", name: "Central America", flag: "" }] },
                    { key: "europe", labelKey: "selectAllEurope", markets: [{ id: "UK", name: "UK", flag: "🇬🇧" }, { id: "FRA", name: "France", flag: "🇫🇷" }, { id: "DEU", name: "Germany", flag: "🇩🇪" }, { id: "ITA", name: "Italy", flag: "🇮🇹" }] },
                    { key: "apac", labelKey: "selectAllAPAC", markets: [{ id: "JPN", name: "Japan", flag: "🇯🇵" }, { id: "IDN", name: "Indonesia", flag: "🇮🇩" }, { id: "MYS", name: "Malaysia", flag: "🇲🇾" }, { id: "PHL", name: "Philippines", flag: "🇵🇭" }, { id: "VNM", name: "Vietnam", flag: "🇻🇳" }, { id: "CHN", name: "China", flag: "🇨🇳" }, { id: "THA", name: "Thailand", flag: "🇹🇭" }, { id: "AUS", name: "Australia", flag: "🇦🇺" }] },
                    { key: "amet", labelKey: "selectAllAMET", markets: [{ id: "TUR", name: "Turkey", flag: "🇹🇷" }] },
                  ];
                  const isReadOnly = flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "selectMarkets";
                  return (
                    <div className={isReadOnly ? "pointer-events-none select-none" : ""}>
                    <>
                      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">{c("selectMarketsTitle")}</h1>
                      <p className="mb-6 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{c("selectMarketsInstructions")}</p>
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                          <label className="flex cursor-default items-center gap-2 pointer-events-none">
                            <input
                              type="checkbox"
                              checked={false}
                              readOnly
                              tabIndex={-1}
                              className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            <Globe className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-800">{c("selectAllGlobal")}</span>
                          </label>
                        </div>
                        {REGIONS.map(({ key, labelKey, markets }) => {
                          const ids = markets.map((m) => m.id);
                          const allSelected = ids.every((id) => selectedMarkets.has(id));
                          return (
                            <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <label
                                className="mb-3 flex items-center gap-2 cursor-default pointer-events-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  readOnly
                                  tabIndex={-1}
                                  className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm font-semibold text-slate-800">{c(labelKey)}</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {markets.map((m) => {
                                  const isSelected = selectedMarkets.has(m.id);
                                  return (
                                    <span
                                      key={m.id}
                                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                        isSelected
                                          ? "border-[var(--color-selected-border)] bg-[var(--color-selected-background)] text-[var(--color-foreground)]"
                                          : "border-slate-200 bg-slate-50/80 text-slate-700"
                                      }`}
                                    >
                                      {m.flag && <span className="text-base">{m.flag}</span>}
                                      <span>{m.name}</span>
                                      {m.warning && (
                                        <span title="Warning: low data:" className="inline-flex">
                                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                    </div>
                  );
                })()}

                {(flowView === "selectDataSources" || (flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "selectDataSources")) && (() => {
                  const SOURCES: { key: keyof typeof dataSourceToggles; nameKey: string; descKey: string; selectSpecific?: boolean }[] = [
                    { key: "firstParty", nameKey: "dataSourceFirstPartyName", descKey: "dataSourceFirstPartyDesc", selectSpecific: true },
                    { key: "behavioral", nameKey: "dataSourceBehavioralName", descKey: "dataSourceBehavioralDesc" },
                    { key: "crossCategory", nameKey: "dataSourceCrossCategoryName", descKey: "dataSourceCrossCategoryDesc" },
                    { key: "crossCategorySocial", nameKey: "dataSourceCrossCategorySocialName", descKey: "dataSourceCrossCategorySocialDesc" },
                    { key: "competitor", nameKey: "dataSourceCompetitorName", descKey: "dataSourceCompetitorDesc" },
                  ];
                  const toggleSource = (key: string) => { if (key === "firstParty") return; setDataSourceToggles((prev) => ({ ...prev, [key]: !prev[key] })); };
                  const allOptionalOn = SOURCES.every((s) => s.key === "firstParty" || dataSourceToggles[s.key]);
                  const setSelectAll = (on: boolean) => setDataSourceToggles((prev) => ({ ...prev, behavioral: on, crossCategory: on, crossCategorySocial: on, competitor: on }));
                  const isReadOnlyDataSources = flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "selectDataSources";
                  return (
                    <div className={isReadOnlyDataSources ? "pointer-events-none select-none" : ""}>
                    <>
                      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">{c("selectDataSourcesTitle")}</h1>
                      <p className="mb-6 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                        {c("selectDataSourcesIntro1")}
                        {c("selectDataSourcesIntro2") && ` ${c("selectDataSourcesIntro2")}`}
                      </p>
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-3">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allOptionalOn}
                              onChange={(e) => setSelectAll(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            <span className="text-sm font-medium text-slate-800">{c("selectAllLabel")}</span>
                          </label>
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {SOURCES.map(({ key, nameKey, descKey, selectSpecific }) => (
                            <li key={key} className="flex items-center justify-between gap-6 px-5 py-4">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900">{c(nameKey)}</p>
                                <p className="mt-0.5 text-sm text-slate-600">{c(descKey)}</p>
                                {selectSpecific && (
                                  <button type="button" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline">
                                    {c("dataSourceFirstPartySelectSpecific")}
                                    <Info className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={dataSourceToggles[key]}
                                disabled={key === "firstParty"}
                                onClick={() => toggleSource(key)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-default ${
                                  dataSourceToggles[key] ? "bg-[var(--color-primary)]" : "bg-slate-200"
                                } ${key === "firstParty" ? "opacity-90" : ""}`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                    dataSourceToggles[key] ? "translate-x-5" : "translate-x-0.5"
                                  } ${key === "firstParty" ? "translate-x-5" : ""}`}
                                  style={{ marginTop: 2 }}
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                    </div>
                  );
                })()}

                {flowView === "insightStudioLoading" && (
                  <div className="flex min-h-full flex-col items-center justify-center">
                    <div className="w-full max-w-lg text-center">
                      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{c("insightStudioTitle")}</h1>
                      <div className="flex flex-col items-center gap-6">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)]" aria-hidden />
                        <p className="text-sm font-medium text-slate-700">{c("insightStudioLoadingText")}</p>
                        <div className="w-full max-w-md">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
                              style={{ width: `${Math.min(100, loadingProgress)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(flowView === "insightStudio" || (flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "insightStudio")) && (
                  <div className={flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === "insightStudio" ? "pointer-events-none select-none" : ""}>
                  <>
                    <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">{c("insightStudioTitle")}</h1>
                    <p className="mb-8 text-sm leading-relaxed text-slate-600">{c("insightStudioInstructions")}</p>
                    <ul className="space-y-4">
                      {hunches.map((h) => (
                        <li
                          key={h.id}
                          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h2 className="mb-2 text-base font-bold text-[var(--color-primary)]">{h.title}</h2>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                {h.category}
                                <Info className="h-3.5 w-3.5" />
                              </span>
                              <p className="mt-3 text-sm leading-relaxed text-slate-700">{h.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHunches((prev) => prev.filter((x) => x.id !== h.id))}
                              className="flex-shrink-0 rounded p-2 text-red-500 hover:bg-red-50"
                              aria-label="Delete hunch"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                  </div>
                )}

                {flowView === "opportunitySpacesLoading" && (
                  <div className="flex min-h-full flex-col items-center justify-center">
                    <div className="mx-auto w-full max-w-2xl">
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p
                          className="mb-1 text-sm font-semibold text-slate-800 animate-insight-in"
                          style={{ animationDelay: "0.1s" }}
                        >
                          Generating Opportunity Spaces
                        </p>
                        {(opportunitySpacesLiveStage || opportunitySpacesLiveText) && (
                          <div
                            className="mt-4 flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3 animate-insight-in overflow-hidden"
                            style={{ animationDelay: "0.3s", height: "33vh" }}
                          >
                            {opportunitySpacesLiveStage && (
                              <p className="mb-2 flex-shrink-0 text-xs font-medium text-slate-600">{opportunitySpacesLiveStage}</p>
                            )}
                            <pre
                              ref={opportunitySpacesLivePreRef}
                              className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-700"
                            >
                              {opportunitySpacesLiveText}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-sm font-medium text-slate-700">{c("generatingOpportunitySpacesMessage")}</p>
                        <div className="w-full max-w-md">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
                              style={{ width: `${Math.min(100, generatingProgress)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === null && conceptsView && validationReportView && selectedConcept && (
                  <div className="max-w-4xl">
                    <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
                      {c("validationReportTitle")}: {selectedConcept.title}
                    </h1>
                    <div className="mb-8 grid grid-cols-3 gap-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="mb-1 text-xs font-semibold text-slate-600">{c("validationDesirabilityLabel")}</p>
                        <div className="flex items-center gap-2">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">83</span>
                          <span className="text-sm font-medium text-emerald-700">High</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[83%] rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
                        <p className="mb-2 text-xs font-semibold text-slate-600">{c("validationOpportunitySizeLabel")}</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-lg font-bold tabular-nums text-slate-900">$1.2B – $1.5B</span>
                            <span className="rounded bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">High</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-slate-400" style={{ width: "60%" }} title="Sizing range" />
                          </div>
                          <p className="text-[10px] text-slate-500">TAM range · midpoint ~$1.35B</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="mb-1 text-xs font-semibold text-slate-600">{c("validationFeasibilityLabel")}</p>
                        <div className="flex items-center gap-2">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-800">72</span>
                          <span className="text-sm font-medium text-amber-700">Medium</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[72%] rounded-full bg-amber-500" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {[
                        { id: "usa", label: "United States", flag: "🇺🇸" },
                        { id: "brazil", label: "Brazil", flag: "🇧🇷" },
                        { id: "mexico", label: "Mexico", flag: "🇲🇽" },
                      ].map((region) => (
                        <div key={region.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setValidationRegionCollapsed((s) => ({ ...s, [region.id]: !s[region.id] }))}
                            className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
                          >
                            <span className="flex items-center gap-2 font-semibold text-slate-900">
                              <span className="text-lg">{region.flag}</span>
                              {region.label}
                            </span>
                            {validationRegionCollapsed[region.id] ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-slate-500" />
                            )}
                          </button>
                          {!validationRegionCollapsed[region.id] && (
                            <div className="p-4 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">81</span>
                                <span className="text-sm font-medium text-slate-700">{c("validationDesirabilityLabel")}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {["Solution-Problem Fit", "Differentiation", "Consumer Journey Fit", "Future Fit"].map((crit, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                    <span className="text-slate-700">{crit}</span>
                                    <span className="ml-auto font-medium text-slate-900">82</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold text-slate-600">{c("validationWhatResonates")}</p>
                                <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold text-slate-600">{c("validationBarriers")}</p>
                                <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === null && conceptsView && !validationReportView && selectedConceptId && selectedConcept && (
                  <div className="max-w-4xl">
                    {/* Two-column header: image left, title + description right */}
                    <div className="flex overflow-hidden rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)]">
                      <div className="relative w-64 flex-shrink-0 bg-slate-100 sm:w-72 aspect-square overflow-hidden">
                        <img src={selectedConcept.image} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-lg border border-white/80 bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
                        >
                          Re-generate image
                        </button>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-4 px-6 py-6">
                        <div className="min-w-0 max-w-[80%] flex-1">
                          <h1 className="text-2xl font-bold tracking-tight text-white">{selectedConcept.title}</h1>
                          <p className="mt-2 text-sm leading-relaxed text-slate-200">{selectedConcept.overview}</p>
                        </div>
                        {validatedConceptIds.has(selectedConceptId ?? "") ? (
                          <div className="flex flex-shrink-0 items-stretch gap-2">
                          <div className="flex aspect-square w-20 flex-col justify-end rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                            <div className="flex items-center gap-1">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-emerald-100 text-xs font-bold text-emerald-800">83</span>
                              <span className="truncate text-[10px] font-medium text-emerald-700">High</span>
                            </div>
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full w-[83%] rounded-full bg-emerald-500" />
                            </div>
                            <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">{c("validationDesirabilityLabel")}</p>
                          </div>
                          <div className="flex aspect-square w-20 flex-col justify-end rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                            <div className="flex flex-col gap-0.5">
                              <span className="truncate text-[10px] font-bold tabular-nums text-slate-900 leading-tight">$1.2B</span>
                              <span className="truncate text-[10px] font-bold tabular-nums text-slate-900 leading-tight">$1.5B</span>
                              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full w-[60%] rounded-full bg-slate-400" />
                              </div>
                            </div>
                            <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">Opp Size</p>
                          </div>
                          <div className="flex aspect-square w-20 flex-col justify-end rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                            <div className="flex items-center gap-1">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-amber-100 text-xs font-bold text-amber-800">72</span>
                              <span className="truncate text-[10px] font-medium text-amber-700">Medium</span>
                            </div>
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full w-[72%] rounded-full bg-amber-500" />
                            </div>
                            <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">{c("validationFeasibilityLabel")}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValidationReportView(true)}
                            className="flex aspect-square w-20 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
                            aria-label="See full validation report"
                          >
                            <ArrowRight className="h-5 w-5 text-slate-600" />
                            <span className="text-center text-[10px] font-semibold leading-tight text-slate-600">See full validation report</span>
                          </button>
                        </div>
                      ) : null}
                      </div>
                    </div>

                    <div className="mt-8 space-y-8">
                      {/* Description + Variations — side by side, Description first */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Price & Pack Size</h2>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {(selectedConcept.pricePackSizeOptions ?? []).length > 0
                              ? (selectedConcept.pricePackSizeOptions ?? []).map((opt, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                    <span>{opt}</span>
                                  </li>
                                ))
                              : (
                                  <>
                                    <li className="flex items-start gap-2">
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                      <span>Price & pack option 1</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                      <span>Price & pack option 2</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                      <span>Price & pack option 3</span>
                                    </li>
                                  </>
                                )}
                          </ul>
                        </section>
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Variations</h2>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {selectedConcept.variations.map((v, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                <span>{v}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      {/* Consumer Goal + Pain Points — side by side */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Consumer Goal</h2>
                          <p className="text-sm leading-relaxed text-slate-700">{selectedConcept.consumerGoal}</p>
                        </section>
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pain Points</h2>
                          <ul className="space-y-2.5 text-sm text-slate-700">
                            {selectedConcept.painPoints.map((p, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      {/* Markets - same as opportunity space detail */}
                      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 pt-5 pb-1">
                          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c("marketsTitle")}</h2>
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {(selectedOpportunity.markets && selectedOpportunity.markets.length > 0
                            ? selectedOpportunity.markets
                            : [
                                { id: "USA", market: "USA", alignment: "Great consumer alignment", nuances: ["Strong interest in wellness and natural positioning.", "Price sensitivity varies by segment."] },
                                { id: "Brazil", market: "Brazil", alignment: "Fair consumer alignment", nuances: ["Growing middle class driving trial in premium fragrance.", "Sustainability and natural ingredients are key purchase drivers."] },
                                { id: "Colombia", market: "Colombia", alignment: "Fair consumer alignment", nuances: ["Preference for fresh, clean scents in home care.", "Brand trust and recommendations matter more than price."] },
                              ]
                          ).map((row) => (
                            <li key={row.id} className="border-slate-100">
                              <button
                                type="button"
                                onClick={() => setExpandedMarketId((prev) => (prev === row.id ? null : row.id))}
                                className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left text-sm hover:bg-slate-50/80"
                              >
                                <span className="font-medium text-slate-900">{row.market}</span>
                                <span className="flex-1 text-right text-slate-500">{row.alignment}</span>
                                <span className={`flex-shrink-0 text-slate-400 transition-transform ${expandedMarketId === row.id ? "rotate-180" : ""}`}>▼</span>
                              </button>
                              {expandedMarketId === row.id && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Country nuances</p>
                                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                                    {row.nuances.map((n, i) => (
                                      <li key={i}>{n}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* Aisle Differentiator Cues */}
                      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 pt-5 pb-1">
                          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aisle Differentiator Cues</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cue Type</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Experience Cue</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              <tr>
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-2 font-medium text-slate-800">
                                    <Megaphone className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    Brand & Storytelling
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">Your emotions, your atmosphere</td>
                                <td className="px-4 py-3">The brand world invites consumers to discover scents that reflect and support their emotional needs throughout the day. Messaging leans into wellness, personalization, and transformation.</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-2 font-medium text-slate-800">
                                    <Tag className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    Price & Positioning
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">Smart personalization that feels premium</td>
                                <td className="px-4 py-3">Value is justified through adaptive features (e.g., mood-responsive delivery, guided scent pairing), emotional wellness benefits, and sensory depth.</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-2 font-medium text-slate-800">
                                    <SprayCan className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    Form & Tactile Design
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">Feels like a ritual, looks like art</td>
                                <td className="px-4 py-3">Devices and packaging are sculptural, serene, and tactile—meant to blend with mindful spaces and invite interaction.</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-2 font-medium text-slate-800">
                                    <Flower2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                    Fragrance & Sensory Signals
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">Smells like a feeling, not a formula</td>
                                <td className="px-4 py-3">Scents are labeled by emotional intent (e.g., &apos;Grounded,&apos; &apos;Clarity,&apos; &apos;Joy&apos;) and designed to feel natural and emotionally resonant.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  </div>
                )}
                {flowView === "opportunitySpaces" && inputSettingsReadOnlyStep === null && (!conceptsView || !selectedConcept) && selectedOpportunity && (
                  <div className="max-w-4xl">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-sky-100">
                      <img
                        src={selectedOpportunity.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4 rounded-b-xl border border-t-0 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 pt-6 pb-6">
                      <div className="min-w-0 max-w-[80%] flex-1">
                        <h1 className="text-2xl font-bold tracking-tight text-white">{selectedOpportunity.title}</h1>
                        {selectedOpportunity.snippet ? (
                          <p className="mt-2 text-sm leading-relaxed text-slate-200">{selectedOpportunity.snippet}</p>
                        ) : null}
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpportunityScorePopoverOpen((prev) => !prev)}
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
                          aria-expanded={opportunityScorePopoverOpen}
                          aria-haspopup="true"
                        >
                          {selectedOpportunity.score}
                        </button>
                        {opportunityScorePopoverOpen && (
                          <>
                            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg" role="dialog" aria-label={c("opportunityScoreTitle")}>
                              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{c("opportunityScoreTitle")}</h3>
                              <p className="text-sm leading-relaxed text-slate-700">{c("opportunityScoreCopy")}</p>
                            </div>
                            <button
                              type="button"
                              aria-label="Close"
                              className="fixed inset-0 z-10"
                              onClick={() => setOpportunityScorePopoverOpen(false)}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 space-y-6">
                      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{c("opportunityBenefitsTitle")}</h2>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {(selectedOpportunity.benefits && selectedOpportunity.benefits.length > 0
                            ? selectedOpportunity.benefits
                            : [
                                "Heighten capabilities to increase vitality, energy, focus, mood regulation.",
                                "Potentially mitigating and proactively improving mental wellness through aroma.",
                                "Provide innovative and emotionally responsive scent solutions.",
                              ]
                          ).map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{c("consumerGoalsTitle")}</h2>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {(selectedOpportunity.consumerGoals && selectedOpportunity.consumerGoals.length > 0
                              ? selectedOpportunity.consumerGoals
                              : [
                                  "Seek holistic products that support emotional and mental wellbeing.",
                                  "Want scent to do more than smell nice—support focus, relaxation, or energy.",
                                  "Value transparency and natural positioning in aircare and fragrance.",
                                ]
                            ).map((line, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{c("painPointsTitle")}</h2>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {(selectedOpportunity.painPoints && selectedOpportunity.painPoints.length > 0
                              ? selectedOpportunity.painPoints
                              : [
                                  "Don't always connect emotional well-being to scent; prefer more functional benefits.",
                                  "Most consumers don't know what makes a good scent; prefer more familiar scents.",
                                  "Don't perceive that aroma has potential to support mental wellness, beyond relaxation benefits.",
                                ]
                            ).map((line, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 pt-5 pb-1">
                          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c("marketsTitle")}</h2>
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {(selectedOpportunity.markets && selectedOpportunity.markets.length > 0
                            ? selectedOpportunity.markets
                            : [
                                { id: "USA", market: "USA", alignment: "Great consumer alignment", nuances: ["Strong interest in wellness and natural positioning.", "Price sensitivity varies by segment."] },
                                { id: "Brazil", market: "Brazil", alignment: "Fair consumer alignment", nuances: ["Growing middle class driving trial in premium fragrance.", "Sustainability and natural ingredients are key purchase drivers."] },
                                { id: "Colombia", market: "Colombia", alignment: "Fair consumer alignment", nuances: ["Preference for fresh, clean scents in home care.", "Brand trust and recommendations matter more than price."] },
                              ]
                          ).map((row) => (
                            <li key={row.id} className="border-slate-100">
                              <button
                                type="button"
                                onClick={() => setExpandedMarketId((prev) => (prev === row.id ? null : row.id))}
                                className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left text-sm hover:bg-slate-50/80"
                              >
                                <span className="font-medium text-slate-900">{row.market}</span>
                                <span className="flex-1 text-right text-slate-500">{row.alignment}</span>
                                <span className={`flex-shrink-0 text-slate-400 transition-transform ${expandedMarketId === row.id ? "rotate-180" : ""}`}>▼</span>
                              </button>
                              {expandedMarketId === row.id && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Country nuances</p>
                                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                                    {row.nuances.map((n, i) => (
                                      <li key={i}>{n}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
            {/* Footer - Next advances by step; enabled when step requirements met */}
            <footer className="flex items-center justify-between border-t-2 border-slate-200 bg-slate-50 px-8 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFlowView("dashboard");
                    setConceptsView(false);
                    setComparisonView(false);
                    setValidationReportView(false);
                    setSelectedConceptId(null);
                    setSelectedOpportunityId("1");
                  }}
                  className="flex items-center gap-3 rounded-lg py-1 pr-1 text-left transition hover:bg-slate-200/60"
                  title={c("navHome")}
                >
                  <Home className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                  <span className="text-sm font-semibold text-slate-800">{brand.name}</span>
                  <span className="text-sm text-slate-600">{c("projectNameLabel")}</span>
                </button>
                <button type="button" className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800" aria-label="Edit project name">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              {flowView === "opportunitySpaces" ? (
                inputSettingsReadOnlyStep !== null ? (
                  <span className="text-xs text-slate-500">Viewing input settings (read-only)</span>
                ) : validationReportView ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-lg border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {c("validateMultipleButton")}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setValidationReportView(false)}
                    >
                      {c("deleteValidationReportButton")}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90"
                      onClick={() => setComparisonView(true)}
                    >
                      {c("validationComparisonViewButton")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : conceptsView && selectedConceptId ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90"
                    onClick={() => {
                      setValidationReportView(true);
                      setValidatedConceptIds((prev) => new Set(prev).add(selectedConceptId));
                    }}
                  >
                    {c("validateButton")}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={generatingConcepts}
                    className={`flex items-center gap-2 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90 ${generatingConcepts ? "cursor-not-allowed opacity-80" : ""}`}
                    onClick={async () => {
                      setGeneratingConcepts(true);
                      const opp = opportunitySpacesList.find((o) => o.id === selectedOpportunityId);
                      const payload = {
                        opportunityId: selectedOpportunityId,
                        title: opp?.title ?? "Opportunity",
                        snippet: opp?.snippet ?? "",
                        benefits: opp?.benefits ?? [],
                        consumerGoals: opp?.consumerGoals ?? [],
                        painPoints: opp?.painPoints ?? [],
                        markets: opp?.markets ?? [],
                      };
                      try {
                        const res = await fetch("/api/generate-concepts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (res.ok && Array.isArray(data.concepts) && data.concepts.length > 0) {
                          setConceptsList((prev) => [
                            ...prev.filter((c) => c.opportunityId !== selectedOpportunityId),
                            ...data.concepts,
                          ]);
                          setConceptsView(true);
                          setSelectedConceptId(data.concepts[0].id);
                        } else {
                          const ids = generateConceptsForCurrentOpportunity(selectedOpportunityId);
                          setConceptsView(true);
                          setSelectedConceptId(ids[0] ?? null);
                        }
                      } catch {
                        const ids = generateConceptsForCurrentOpportunity(selectedOpportunityId);
                        setConceptsView(true);
                        setSelectedConceptId(ids[0] ?? null);
                      } finally {
                        setGeneratingConcepts(false);
                      }
                    }}
                  >
                    {generatingConcepts ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        {c("generateConceptButton")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )
              ) : flowView === "insightStudio" || flowView === "opportunitySpacesLoading" ? (
                <button
                  type="button"
                  disabled={flowView === "opportunitySpacesLoading"}
                  className={`flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold ${
                    flowView === "opportunitySpacesLoading"
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                  }`}
                  onClick={() => flowView === "insightStudio" && setFlowView("opportunitySpacesLoading")}
                >
                  {c("generateOpportunitySpacesButton")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    flowView === "defineScope"
                      ? defineScopeChoice !== "narrow"
                      : flowView === "selectMarkets"
                        ? selectedMarkets.size === 0
                        : flowView === "insightStudioLoading"
                          ? true
                          : false
                  }
                  onClick={() => {
                    if (flowView === "defineScope" && defineScopeChoice === "narrow") setFlowView("selectMarkets");
                    if (flowView === "selectMarkets" && selectedMarkets.size > 0) setFlowView("selectDataSources");
                    if (flowView === "selectDataSources") setFlowView("insightStudioLoading");
                  }}
                  className={`flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold ${
                    (flowView === "defineScope" && defineScopeChoice === "narrow") ||
                    (flowView === "selectMarkets" && selectedMarkets.size > 0) ||
                    flowView === "selectDataSources"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                      : "border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {c("nextButtonLabel")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </footer>
          </div>
        ) : selectedProjectName ? (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <button
            type="button"
            onClick={() => setSelectedProjectName(null)}
            className="mb-4 flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="mb-8 text-2xl font-bold text-[var(--color-foreground)]" style={{ fontSize: "var(--heading-size)" }}>
            {selectedProjectName}
          </h1>
          {projectDetailLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-muted)]">Generating project detail from brief…</p>
            </div>
          ) : projectDetailError ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-sm text-slate-700">{projectDetailError}</p>
              <button
                type="button"
                onClick={() => {
                  setProjectDetailError(null);
                  setProjectDetailCache((prev) => {
                    const next = { ...prev };
                    delete next[selectedProjectName];
                    return next;
                  });
                  setProjectDetailLoading(true);
                  fetch("/api/generate-project-detail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ projectTitle: selectedProjectName, brief: briefSummary ?? "" }),
                  })
                    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                    .then(({ ok, data }) => {
                      if (ok && Array.isArray(data.opportunities)) {
                        setProjectDetailCache((prev) => ({ ...prev, [selectedProjectName]: { opportunities: data.opportunities } }));
                      } else {
                        setProjectDetailError(data?.error ?? "Failed to load project detail");
                      }
                    })
                    .catch(() => setProjectDetailError("Failed to load project detail"))
                    .finally(() => setProjectDetailLoading(false));
                }}
                className="rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : (() => {
            const fromPreGenerated = firstRecentProjectDetail?.projectTitle === selectedProjectName ? firstRecentProjectDetail?.opportunities : undefined;
            const cached = selectedProjectName ? projectDetailCache[selectedProjectName] : null;
            const projectDetailOpportunities = fromPreGenerated ?? cached?.opportunities ?? [];
            if (projectDetailOpportunities.length === 0) return null;
            return (
              <div className="space-y-10">
                {projectDetailOpportunities.map((opp) => (
                  <section key={opp.id} className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold text-[var(--color-foreground)]">{opp.title}</h2>
                    <p className="mb-5 text-sm text-[var(--color-muted)]">{opp.snippet}</p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {opp.concepts.map((concept) => (
                        <div
                          key={concept.id}
                          className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm transition hover:border-[var(--color-primary)]/40 hover:shadow"
                        >
                          <img src={concept.image} alt="" className="h-32 w-full object-cover" />
                          <div className="flex flex-1 flex-col p-3">
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2">{concept.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{concept.overview}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectName(null);
                      setFlowView("opportunitySpaces");
                    }}
                    className="flex items-center gap-2 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] hover:opacity-90"
                  >
                    Open in Innovation Flow
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
        ) : (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="mb-8 text-2xl font-bold text-[var(--color-foreground)]" style={{ fontSize: "var(--heading-size)" }}>
            {c("pageTitle")}
          </h1>

          {/* Opportunity cards */}
          {features.opportunityCards !== false && (
            <section className="mb-10 grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col justify-between rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">{c("card1Title")}</h2>
                  <p className="text-xs leading-snug text-[var(--color-muted)]">
                    {c("card1Body")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlowView("defineScope")}
                  className="mt-6 rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                >
                  {c("generateButton")}
                </button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">{c("card2Title")}</h2>
                  <p className="text-xs leading-snug text-[var(--color-muted)]">
                    {c("card2Body")}
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-6 rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                >
                  {c("generateButton")}
                </button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">{c("card3Title")}</h2>
                  <p className="text-xs leading-snug text-[var(--color-muted)]">
                    {c("card3Body")}
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-6 rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                >
                  {c("generateButton")}
                </button>
              </div>
            </section>
          )}

          {/* Global social insights */}
          {features.globalInsights !== false && (
            <section className="mb-10">
              <h2 className="mb-1 text-lg font-semibold text-[var(--color-foreground)]">Global social insights</h2>
              <p className="mb-4 text-xs text-[var(--color-muted)]">{c("sectionGlobalSubtitle")}</p>
              <ul className="space-y-3">
                {[
                  {
                    tag: "Painpoint",
                    tagClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
                    titleKey: "sectionGlobalInsightPainpointTitle" as const,
                    descriptionKey: "sectionGlobalInsightPainpointDescription" as const,
                    sourceKey: "sectionGlobalInsightPainpointSource" as const,
                    defaultTitle: "Heightened desire for plant-based food procurement",
                    defaultDescription: "Sample insight description with engagement and mention data.",
                  },
                  {
                    tag: "JTBD",
                    tagClass: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
                    titleKey: "sectionGlobalInsightJtbdTitle" as const,
                    descriptionKey: "sectionGlobalInsightJtbdDescription" as const,
                    sourceKey: "sectionGlobalInsightJtbdSource" as const,
                    defaultTitle: "Help me find products that fit my family's values",
                    defaultDescription: "Job-to-be-done insight based on social and engagement data.",
                  },
                  {
                    tag: "Trend",
                    tagClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
                    titleKey: "sectionGlobalInsightTrendTitle" as const,
                    descriptionKey: "sectionGlobalInsightTrendDescription" as const,
                    sourceKey: "sectionGlobalInsightTrendSource" as const,
                    defaultTitle: "Rising interest in sustainable and ethical options",
                    defaultDescription: "Trend insight from global social listening.",
                  },
                ].map(({ tag, tagClass, titleKey, descriptionKey, sourceKey, defaultTitle, defaultDescription }) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSocialInsight({ tag, titleKey, descriptionKey, sourceKey });
                        setSocialInsightModalOpen(true);
                      }}
                      className="flex w-full gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 text-left shadow-sm transition hover:border-[var(--color-primary)]/40 hover:shadow"
                    >
                      <span
                        className={`flex h-fit min-w-[5rem] flex-shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tagClass}`}
                      >
                        {tag}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--color-foreground)]">
                          {content[titleKey] ?? defaultTitle}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {content[descriptionKey] ?? defaultDescription}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Cross category insights */}
          {features.crossInsights !== false && (
            <section className="mb-10">
              <h2 className="mb-1 text-lg font-semibold text-[var(--color-foreground)]">Cross category insights</h2>
              <p className="mb-4 text-xs text-[var(--color-muted)]">{c("sectionCrossSubtitle")}</p>
              <ul className="space-y-3">
                {[
                  { tag: "Painpoint", tagClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60", titleKey: "sectionCrossInsight1Title", descKey: "sectionCrossInsight1Description" },
                  { tag: "Trend", tagClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60", titleKey: "sectionCrossInsight2Title", descKey: "sectionCrossInsight2Description" },
                ].map(({ tag, tagClass, titleKey, descKey }, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSocialInsight({
                          tag,
                          titleKey,
                          descriptionKey: descKey,
                          sourceKey: i === 0 ? "sectionCrossInsight1Source" : "sectionCrossInsight2Source",
                        });
                        setSocialInsightModalOpen(true);
                      }}
                      className="flex w-full gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 text-left shadow-sm transition hover:border-[var(--color-primary)]/40 hover:shadow"
                    >
                      <span
                        className={`flex h-fit min-w-[5rem] flex-shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tagClass}`}
                      >
                        {tag}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--color-foreground)]">{c(titleKey)}</p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">{c(descKey)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Social Insight modal */}
          {socialInsightModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => {
                setSocialInsightModalOpen(false);
                setSelectedSocialInsight(null);
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="social-insight-modal-title"
            >
              <div
                className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <h2 id="social-insight-modal-title" className="text-base font-bold text-[var(--color-foreground)]">
                      {selectedSocialInsight ? c(selectedSocialInsight.titleKey) : c("socialInsightModalTitle")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSocialInsightModalOpen(false);
                        setSelectedSocialInsight(null);
                      }}
                      className="rounded p-1 text-[var(--color-muted)] hover:bg-slate-100 hover:text-[var(--color-foreground)]"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-700 ring-1 ring-sky-100">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {selectedSocialInsight?.tag ?? c("insightType")}
                    </span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-[var(--color-foreground)]">
                    {selectedSocialInsight ? c(selectedSocialInsight.descriptionKey) : c("insightText")}
                  </p>
                  <p className="mb-4 text-[10px] text-[var(--color-muted)]">
                    Added on: {c("insightAddedDate")}
                  </p>
                  <div className="rounded-lg border border-[var(--color-border)] bg-slate-50/50 p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-foreground)]">
                      <Globe className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)]" />
                      {c("insightSourceLabel")}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {selectedSocialInsight ? (content[selectedSocialInsight.sourceKey] as string) || "Generated from your brief" : "Generated from your brief"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] bg-slate-50/30 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setSocialInsightModalOpen(false)}
                    className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--color-foreground)] hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSocialInsightModalOpen(false);
                      setFlowView("defineScope");
                      setDefineScopeChoice("narrow");
                      if (selectedSocialInsight) {
                        if (selectedSocialInsight.titleKey.includes("GlobalInsight")) {
                          setSelectedDefineScopeGlobalInsight(selectedSocialInsight.tag as "Painpoint" | "JTBD" | "Trend");
                          setSuggestedTab("global");
                        } else if (selectedSocialInsight.titleKey.includes("CrossInsight1") || selectedSocialInsight.titleKey === "sectionCrossInsight1Title") {
                          setSelectedDefineScopeCrossInsight(0);
                          setSuggestedTab("cross");
                        } else if (selectedSocialInsight.titleKey.includes("CrossInsight2") || selectedSocialInsight.titleKey === "sectionCrossInsight2Title") {
                          setSelectedDefineScopeCrossInsight(1);
                          setSuggestedTab("cross");
                        } else {
                          setSelectedDefineScopeGlobalInsight(selectedSocialInsight.tag as "Painpoint" | "JTBD" | "Trend");
                          setSuggestedTab("global");
                        }
                      }
                      setSelectedSocialInsight(null);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                  >
                    {c("generateOpportunitySpacesButton")}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Personas */}
          {features.personas !== false && (
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{c("sectionPersonasTitle")}</h2>
                  <p className="text-xs text-[var(--color-muted)]">{c("sectionPersonasSubtitle")}</p>
                </div>
                <div className="relative" ref={locationDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setLocationDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground)]"
                  >
                    <span>{countryOptions.find((opt) => opt.value === selectedCountry)?.flag ?? "🇺🇸"}</span>
                    <span>{selectedCountry}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  {locationDropdownOpen && (
                    <ul className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded bg-white py-1 shadow-lg ring-1 ring-black/5">
                      {countryOptions.map(({ value, flag }) => (
                        <li key={value}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCountry(value);
                              setLocationDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-800 hover:bg-gray-100 ${
                              selectedCountry === value ? "bg-gray-100 font-medium" : ""
                            }`}
                          >
                            <span>{flag}</span>
                            {value}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop",
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop",
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
                ].map((placeholderImg, i) => {
                  const label = c(`persona${i + 1}Label`);
                  const img = (content[`persona${i + 1}Image`] as string | undefined) ?? placeholderImg;
                  const isClickable = i < 2;
                  return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!isClickable) return;
                      setSelectedPersona({ label, img, index: i === 0 ? 0 : 1 });
                      setPersonaModalOpen(true);
                    }}
                    className="flex min-w-0 flex-col items-center rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md"
                  >
                    <img
                      src={img}
                      alt=""
                      className="mb-2 h-16 w-16 rounded-full object-cover"
                    />
                    <p className="text-center text-xs font-medium text-[var(--color-foreground)]">{label}</p>
                  </button>
                );})}
              </div>
            </section>
          )}

          {/* Persona detail modal */}
          {personaModalOpen && selectedPersona && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              onClick={() => setPersonaModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="persona-modal-title"
            >
              <div
                className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - compact and clean */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={selectedPersona.img}
                      alt=""
                      className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <h2 id="persona-modal-title" className="truncate text-base font-semibold text-slate-900">
                        The {selectedPersona.label}
                      </h2>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>{countryOptions.find((opt) => opt.value === selectedCountry)?.flag ?? "🇺🇸"}</span>
                        <span>{selectedCountry}</span>
                        <span className="text-slate-400">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {c("personaLastUpdated")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPersonaModalOpen(false)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body - scrollable, structured */}
                <div className="flex-1 overflow-y-auto p-5">
                  {(() => {
                    const idx = selectedPersona.index;
                    const pk = (suffix: string) => (idx === 0 ? `persona1${suffix}` : idx === 1 ? `persona2${suffix}` : `persona${suffix}`);
                    const whatChanged = (content[pk("WhatChanged")] as string | undefined) ?? content.personaWhatChanged ?? "";
                    const description = (content[pk("Description")] as string | undefined) ?? content.personaDescription ?? "";
                    const descriptionBullets = (content[pk("DescriptionBullets")] as string | undefined) ?? content.personaDescriptionBullets ?? "";
                    const coreJtbd = (content[pk("CoreJtbd")] as string | undefined) ?? content.personaCoreJtbd ?? "";
                    const behavioralJobs = (content[pk("BehavioralJobs")] as string | undefined) ?? content.personaBehavioralJobs ?? "";
                    const triggersRoutines = (content[pk("TriggersRoutines")] as string | undefined) ?? content.personaTriggersRoutines ?? "";
                    const hiddenEmergingJobs = (content[pk("HiddenEmergingJobs")] as string | undefined) ?? content.personaHiddenEmergingJobs ?? "";
                    return (
                    <>
                  {/* What Changed - subtle callout */}
                  <div className="mb-6 flex gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <Zap className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-xs leading-relaxed text-slate-600">{whatChanged || c("personaWhatChanged")}</p>
                  </div>

                  <div className="space-y-6">
                    {/* Persona Description */}
                    <section>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Persona Description</p>
                      <p className="mb-2 text-sm leading-relaxed text-slate-700">{description || c("personaDescription")}</p>
                      <ul className="space-y-1 text-xs leading-relaxed text-slate-600">
                        {(descriptionBullets || (content.personaDescriptionBullets ?? ""))
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line, j) => (
                            <li key={j} className="flex gap-2">
                              <span className="text-[var(--color-primary)] mt-0.5">·</span>
                              <span>{line}</span>
                            </li>
                          ))}
                      </ul>
                    </section>

                    {/* Core JTBD */}
                    <section>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Core JTBD</p>
                      <p className="text-sm leading-relaxed text-slate-700">{coreJtbd || c("personaCoreJtbd")}</p>
                    </section>

                    {/* Dynamic Attributes - single card */}
                    <section className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Dynamic Attributes</p>
                      <div className="space-y-3">
                        <div>
                          <p className="mb-1 text-xs font-medium text-slate-600">Behavioral Jobs</p>
                          <ul className="space-y-1 text-xs leading-relaxed text-slate-700">
                            {(behavioralJobs || (content.personaBehavioralJobs ?? ""))
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                              .map((line, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-[var(--color-primary)]">·</span>
                                  {line}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium text-slate-600">Triggers and Routines</p>
                          <ul className="space-y-1 text-xs leading-relaxed text-slate-700">
                            {(triggersRoutines || (content.personaTriggersRoutines ?? ""))
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                              .map((line, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-[var(--color-primary)]">·</span>
                                  {line}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium text-slate-600">Hidden / Emerging Jobs</p>
                          <p className="text-xs leading-relaxed text-slate-700">{hiddenEmergingJobs || c("personaHiddenEmergingJobs")}</p>
                        </div>
                      </div>
                    </section>

                    {/* Sources - compact */}
                    <section>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sources</p>
                      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                        <div className="flex min-w-0 gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5">
                          <FileText className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700">
                              {c("personaSource1Label")}
                              <span className="ml-1 text-base">
                                {(() => {
                                  const L = (c("personaSource1Label") ?? "").toLowerCase();
                                  if (L.includes("mexico")) return "🇲🇽";
                                  if (L.includes("brazil")) return "🇧🇷";
                                  if (L.includes("china")) return "🇨🇳";
                                  return "🇺🇸";
                                })()}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">{c("personaSource1Doc")}</p>
                          </div>
                        </div>
                        <div className="flex min-w-0 gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5">
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700">
                              {c("personaSource2Label")}
                              <span className="ml-1 text-base">
                                {(() => {
                                  const L = (c("personaSource2Label") ?? "").toLowerCase();
                                  if (L.includes("mexico")) return "🇲🇽";
                                  if (L.includes("brazil")) return "🇧🇷";
                                  if (L.includes("china")) return "🇨🇳";
                                  return "🇺🇸";
                                })()}
                              </span>
                            </p>
                            <a
                              href={content.personaSource2Url ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-xs text-[var(--color-primary)] hover:underline"
                            >
                              {(content.personaSource2Url ?? "").replace(/^https?:\/\//, "").slice(0, 40)}…
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                    </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Recently Uploaded Documents */}
          {features.documents !== false && (
            <section>
              <h2 className="mb-1 text-lg font-semibold text-[var(--color-foreground)]">{c("sectionDocsTitle")}</h2>
              <p className="mb-4 text-xs text-[var(--color-muted)]">{c("sectionDocsSubtitle")}</p>
              <ul className="space-y-3">
                {[
                  { status: "completed", label: c("statusCompleted"), nameKey: "document1Name" as const, metaKey: "document1Meta" as const, insightsKey: "document1Insights" as const },
                  { status: "inProgress", label: c("statusInProgress"), nameKey: "document2Name" as const, metaKey: "document2Meta" as const, insightsKey: "document2Insights" as const },
                ].map(({ status, label, nameKey, metaKey, insightsKey }, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-[var(--color-border)] bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {label}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-[var(--color-foreground)]">{c(nameKey)}</p>
                          <p className="text-xs text-[var(--color-muted)]">{c(metaKey)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedDocumentIndex((prev) => (prev === i ? null : i))}
                        className="flex items-center gap-1 rounded bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
                      >
                        {c("seeSummaryButton")}
                        <span className={`transition-transform ${expandedDocumentIndex === i ? "rotate-180" : ""}`}>▼</span>
                      </button>
                    </div>
                    {expandedDocumentIndex === i && (
                      <div className="border-t border-[var(--color-border)] bg-slate-50/50 px-4 py-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                          Insights extracted from document
                        </p>
                        <ul className="space-y-1.5 text-xs text-[var(--color-foreground)]">
                          {(content[insightsKey] ?? "")
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="text-[var(--color-primary)]">•</span>
                                {line}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
