/**
 * Parses a client brief (text or file) into theme, brand, content, and features.
 * This is a stub: you can replace with AI (e.g. OpenAI) to extract from natural language.
 */

import type { BrandTheme, BrandIdentity, ContentMap, FeatureFlags } from "./types";
import { DEFAULT_THEME, DEFAULT_CONTENT_KEYS } from "./types";
import { generateBriefContentWithAI } from "./ai-brief";
import { ensureWcagCompliantBackground, getForegroundForBackground, getLuminance } from "./wcag-contrast";
import { generatePersonaProfileImages, getPersonaCardFromContent } from "./ai-persona-image";

export interface ParsedBrief {
  name: string;
  theme: BrandTheme;
  brand: BrandIdentity;
  content: ContentMap;
  features: FeatureFlags;
}

/** Default copy for the innovation dashboard (used when brief doesn't specify) */
const DEFAULT_DASHBOARD_CONTENT: Record<string, string> = {
  pageTitle: "Kick off your next innovation 🚀",
  subject: "home fragrance",
  navHome: "Home",
  navRecentProjects: "Recent Projects",
  recentProject1: "Project Alpha",
  recentProject2: "Project Beta",
  recentProject3: "Project Gamma",
  navMoodBoards: "Mood Boards",
  navFeatureJournal: "Feature Journal",
  navGallery: "Gallery",
  navTemplates: "Templates",
  selectorLabel: "Global",
  brandOptions: "Brand A,Brand B",
  uploadDocument: "Upload Document",
  viewProjectLibrary: "View Project Library",
  logout: "Logout",
  card1Title: "Explore Opportunities",
  card1Body:
    "Use social listening and market trends to discover white space and growth opportunities for your brand.",
  card2Title: "Turn Insights into Concepts",
  card2Body:
    "Leverage customer data and growth drivers to turn market insights into actionable concepts.",
  card3Title: "De-Risk Your Ideas",
  card3Body:
    "Identify competitive risks and improve your chances of successful commercialization.",
  generateButton: "Generate",
  sectionGlobalTitle: "Global social insights",
  sectionGlobalSubtitle:
    "These insights were found based on over 500 million public posts globally, showing the top 25 insights with the most engagement and mentions.",
  sectionCrossTitle: "Cross category insights",
  sectionCrossSubtitle: "These insights are based on five relevant cross-category sources.",
  sectionCrossInsight1Title: "Cross-category insight title",
  sectionCrossInsight1Description: "Relevant cross-category description.",
  sectionCrossInsight2Title: "Cross-category insight title",
  sectionCrossInsight2Description: "Relevant cross-category description.",
  sectionPersonasTitle: "Dynamic Personas",
  sectionPersonasSubtitle: "Top insights for personas in the US.",
  persona1Label: "Allergy Optimist",
  persona2Label: "Preventative Care Planner",
  persona3Label: "Quality of Life Improver",
  persona4Label: "Wellness Seeker",
  persona5Label: "Clean Air Advocate",
  sectionDocsTitle: "Recently Uploaded Documents",
  sectionDocsSubtitle:
    "These uploaded documents provide additional context to your overall analysis.",
  locationLabel: "United States",
  insightCta: "Generate Opportunities",
  viewSources: "View Sources",
  seeSummaryButton: "See Summary",
  statusCompleted: "Completed",
  statusInProgress: "In progress",
  document1Name: "Glade Aircare Consumer Insights Q3 2024.pdf",
  document2Name: "Aircare Category Trends & Competitor Landscape.pdf",
  document1Meta: "Uploaded Oct 15, 2024 · 2.4 MB",
  document2Meta: "Uploaded Oct 18, 2024 · 1.8 MB",
  document1Insights:
    "Consumers associate fresh scents with cleanliness and well-being.\nRising interest in natural and sustainable aircare ingredients.\nPrice sensitivity varies by segment; premium formats growing in key markets.",
  document2Insights:
    "Plug-in and diffuser segments outpacing sprays in North America.\nPrivate label gaining share in basic sprays; branded innovation in premium.\nSeasonal peaks (spring, back-to-school) drive trial and repeat.",
  personaLastUpdated: "11/19/25",
  personaWhatChanged:
    "Trends like X and Y have made a significant impact on the market, making the wellness seeker X and Y more likely to X and Y, changing their Key Attribute and X and Y (Source).",
  personaDescription:
    "A Brazilian wellness seeker who believes a fresh-smelling home is part of feeling mentally and physically well. They use aircare as a quick, low-effort way to 'reset' their space and mood.",
  personaDescriptionBullets:
    "Who they are: health-curious, home-proud, scent-as-wellbeing mindset\nAnchored functional job: keep home air clean, inviting, and odor-free day to day\nContext snapshot: Busy urban life, apartment living + humidity/food odors; primary aircare decision-maker; chooses scents that feel effective but not overpowering",
  personaCoreJtbd:
    "They're trying to keep their home consistently fresh and welcoming, especially after cooking, humidity, or busy days, using simple aircare routines that work fast. They want to feel calm and restored in their space, and see a great-smelling home as a signal that they're caring for themselves and others with pride.",
  personaBehavioralJobs:
    "Maintains freshness through repeat buys and placement in key rooms, using scent as the 'finish' to cleaning and daily home care.\nTriggers quick 'reset' moments after cooking, rain/humidity, pets, or guests, often pairing Glade with ventilation for fast impact.\nShifts between modes—subtle daily maintenance vs. strong post-odor rescue vs. guest-ready fragrance—depending on time, energy, and stakes.",
  personaTriggersRoutines:
    "Triggers: Kicks in before guests or right after cooking, cleaning, or rainy/humid days—especially when the home air starts to feel 'heavy' or stale.\nRoutines: Quick daily freshness touchpoints (morning or post-clean), plus stronger weekend or post-odor resets; intensity adjusts by mood and moment.",
  personaHiddenEmergingJobs:
    "Hidden beneath \"freshness,\" they're really using scent as a lightweight wellness tool to regulate mood and make home feel like a safe reset zone. Emerging jobs point to wanting air care that feels more natural/healthy and purpose-tied to moments (post-cooking reset, rainy-day lift, bedtime calm), not just odor masking.",
  personaSource1Label: "Source",
  personaSource1Doc: "Database Document: FreshConceptScreen.pdf",
  personaSource2Label: "Source",
  personaSource2Url: "https://www.reddit.com/r/Frugal/comments/1io1fr9/what_are_your...",
  socialInsightModalTitle: "Social Insight",
  insightType: "Trend",
  insightText:
    "For a segment of shoppers, air-care buying is driven by deal-chasing and rebate 'gamification' more than by scent preference, with complex stacking across store apps and Ibotta determining what gets bought and when.",
  insightAddedDate: "2026-02-14",
  insightSourceLabel: "Source | Global (All)",
  insightSourceUrl: "https://www.pinterest.com/pin/837388124501065817",
  generateOpportunitySpacesButton: "Generate Opportunity Spaces",
  defineScopeTitle: "Define Research Scope",
  defineScopeInstructions:
    "How would you like to generate Opportunity Spaces? Click on a card below.\n💡 Not sure? You can start broad and refine later!",
  narrowFocusTitle: "Narrow my focus",
  narrowFocusQuote: "I have specific areas in mind.",
  narrowFocusDescription: "Refine your results by selecting key areas of interest.",
  narrowFocusDescriptionLong:
    "We'll synthesize internal and external data related to your selected areas of focus to uncover insights and opportunity spaces.",
  customFocusLabel: "Enter a Custom Focus",
  customFocusNote: "(Typing here will clear any selected pills.)",
  customFocusPlaceholder: "Here is my custom focus",
  suggestedFocusLabel: "Suggested focus areas",
  tabPopularFocus: "Popular Focus Areas",
  tabGlobalSocial: "Global Social Insights",
  tabCrossCategory: "Cross Category Insights",
  suggestedFocusPills:
    "Emotional Wellbeing|Sensory Layering|Smart Home Integration|Circular Design|Interior Aesthetics|Personalized Scent|Fragrance Zoning|Clean, Safe, & Transparent|Scent Discovery|Hybrid Cleaning & Scent|Occasion-Driven Scenting",
  selectMarketsTitle: "Select market(s)",
  selectMarketsInstructions:
    "Select one or more markets to continue. For best performance, limit selection to 5 countries.\nClick on a checkbox or card to select.",
  selectAllGlobal: "Select all Global",
  selectAllNorthAmerica: "Select all North America",
  selectAllLATAM: "Select all LATAM",
  selectAllEurope: "Select all of Europe",
  selectAllAPAC: "Select all of APAC",
  selectAllAMET: "Select all AMET",
  selectDataSourcesTitle: "Choose data sources",
  selectDataSourcesIntro1:
    "First party data sources are always included.\nToggle on any additional sources you want to include, then click Next to continue.",
  selectDataSourcesIntro2: "",
  dataSourceFirstPartyName: "First Party Data Sources",
  dataSourceFirstPartyDesc: "Contains insights, market trend reports, benefits, needs, and concept test results",
  dataSourceFirstPartySelectSpecific: "Select specific sources",
  dataSourceBehavioralName: "Behavioral Social Listening Data",
  dataSourceBehavioralDesc: "Pulling from Instagram, Pinterest, Reddit, TikTok, Twitter and YouTube",
  dataSourceCrossCategoryName: "Cross Category",
  dataSourceCrossCategoryDesc: "Draws data from relevant categories and makes conclusions about impact on your brand",
  dataSourceCrossCategorySocialName: "Cross Category Social Listening",
  dataSourceCrossCategorySocialDesc: "Follows accounts in adjacent categories for consumer insights",
  dataSourceCompetitorName: "Competitor Social Listening",
  dataSourceCompetitorDesc: "Country-specific competitor accounts for competitive insights",
  selectAllLabel: "Select All",
  insightStudioTitle: "Insights Studio",
  insightStudioLoadingText: "Extracting Hunches...",
  insightStudioInstructions:
    "Insights are based on relevant data points pulled from the sources you selected, surfaced because they align with your chosen focus. Delete any you don't want influencing the opportunity space outputs.",
  hunchCardSeeBreakdown: "See breakdown",
  clusteringSocialLabel: "Clustering hunches across social media posts:",
  clusteringSocialClue1:
    "Clue 1: Consumers are increasingly seeking home fragrances that promote emotional wellbeing, such as stress relief, relaxation, and focus.",
  clusteringInternalLabel: "Clustering hunches from internal database:",
  clusteringInternalClue2:
    "Clue 2: Purchase patterns show higher repeat rates for fragrances positioned around calming or restorative benefits compared to purely decorative scent offerings.",
  generatingOpportunitySpacesMessage: "Generating Opportunity Spaces...",
  showMoreOpportunitySpaces: "Show 6 more suggested opportunity spaces",
  customBriefLabel: "Custom Brief",
  linkedCustomContentPlaceholder: "Linked Custom Content",
  opportunityDescriptionTitle: "Description",
  opportunityBenefitsTitle: "Benefits",
  opportunityScoreTitle: "Opportunity Score",
  opportunityScoreCopy:
    "The score considers the opportunity against your specific brief parameters based on market factors like macro trends, community & social trends, brand capabilities, and current market demand.",
  opportunitySizingTitle: "Opportunity Sizing",
  opportunitySizingCopy:
    "Sizing is estimated using a combination of internal and external data sources, aligned to your selected markets and focus.",
  generateGlobalSizingButton: "Generate Global Sizing",
  opportunitySizingDropdownAll: "All",
  opportunitySizingPlaceholder: "$XXXM - $X.XXM",
  consumerGoalsTitle: "Consumer Goals",
  painPointsTitle: "Pain points",
  marketsTitle: "Markets",
  experienceOptimizationTitle: "Experience Optimization",
  styleDifferentiatorTitle: "Style Differentiator Directions",
  reviewOpportunitySpacesButton: "Review Opportunity Spaces",
  generateProjectButton: "Generate Project",
  generateConceptButton: "Generate Concept",
  generateMoreOpportunitySpaces: "Generate more opportunity spaces",
  customBriefSectionText:
    "Leverage your existing IP / data or a custom brief to generate more opportunity spaces",
  uploadCustomBriefButton: "Upload Custom Brief",
  validateButton: "Validate",
  validateMultipleButton: "Validate Multiple",
  deleteValidationReportButton: "Delete Validation Report",
  validationComparisonViewButton: "Validation Comparison View",
  validationReportTitle: "Validation Report",
  validationDesirabilityLabel: "Desirability",
  validationOpportunitySizeLabel: "Opportunity Size",
  validationFeasibilityLabel: "Feasibility",
  validationWhatResonates: "What Resonates",
  validationBarriers: "Barriers",
  backToInnovationFlow: "Back to Innovation Flow",
  backToOpportunitySpaces: "Back to Opportunity Spaces",
  comparisonValidationViewTitle: "Comparison Validation View",
  comparisonSortBy: "Sort by:",
  comparisonNoReports: "No validation reports to compare yet. Validate a concept to see it here.",
  viewFullReport: "View Full Report",
  keepBroadTitle: "Keep it broad",
  keepBroadQuote: "I want to explore the full opportunity landscape.",
  keepBroadDescription:
    "Get a wide-ranging view of emerging trends and opportunities across the industry.",
  stepExploreOpportunities: "Explore Opportunities",
  stepDefineScope: "Define Research Scope",
  stepSelectMarkets: "Select Markets",
  stepSelectDataSources: "Select Data Sources",
  stepInsightStudio: "Insight Studio",
  stepOpportunitySpaces: "Opportunity Spaces",
  inputSettingsTitle: "Input Settings",
  projectNameLabel: "Project Name #1",
  nextButtonLabel: "Next",
};

/** Returns theme, brand, content, and features for the default prototype (no brief). */
export function getDefaultPrototypeConfig(): Omit<ParsedBrief, "name"> {
  const content: ContentMap = {};
  for (const key of DEFAULT_CONTENT_KEYS) {
    content[key] = DEFAULT_DASHBOARD_CONTENT[key] ?? `[${key}]`;
  }
  return {
    theme: JSON.parse(JSON.stringify(DEFAULT_THEME)),
    brand: { name: "BOI Prototype", logoUrl: null, wordmarkUrl: null },
    content,
    features: {
      sidebar: true,
      opportunityCards: true,
      globalInsights: true,
      crossInsights: true,
      personas: true,
      documents: true,
    },
  };
}

/** Derive a short display name from the first line (avoid showing the whole prompt in the UI). */
function shortNameFromBrief(firstLine: string, maxLen = 40): string {
  const trimmed = firstLine.trim();
  if (!trimmed) return "Unnamed Client";
  // Prefer the segment before the first comma (e.g. "Walmart, color scheme..." -> "Walmart")
  const beforeComma = trimmed.split(",")[0].trim();
  const candidate = beforeComma.length >= 2 ? beforeComma : trimmed;
  if (candidate.length <= maxLen) return candidate;
  return candidate.slice(0, maxLen).trim().replace(/\s+\S*$/, "") || candidate.slice(0, maxLen) + "…";
}

/** Derive a subject/topic label from brief for customizing copy (e.g. "kids' fashion", "Walmart"). */
function subjectFromBrief(briefText: string): { subject: string; brandName: string } {
  const lower = briefText.toLowerCase();
  let subject = "your category";
  if (lower.includes("children") || lower.includes("kids") || lower.includes("childrens")) {
    subject = "kids' fashion";
  } else if (lower.includes("fashion")) {
    subject = "fashion";
  } else if (lower.includes("food") || lower.includes("beverage")) {
    subject = "food & beverage";
  } else if (lower.includes("beauty") || lower.includes("personal care")) {
    subject = "beauty & personal care";
  }
  let brandName = "";
  if (lower.includes("walmart")) brandName = "Walmart";
  else if (lower.includes("target")) brandName = "Target";
  else if (lower.includes("amazon")) brandName = "Amazon";
  const firstLine = briefText.trim().split(/\n/)[0]?.trim() || "";
  const beforeComma = firstLine.split(",")[0].trim();
  if (beforeComma.length <= 30 && /^[A-Za-z0-9\s&]+$/.test(beforeComma)) brandName = brandName || beforeComma;
  return { subject, brandName };
}

/**
 * Placeholder extraction from brief text.
 * In production: send brief to an LLM and parse structured JSON (theme, content, etc.).
 */
export function parseBriefFromText(briefText: string): ParsedBrief {
  const lines = briefText
    .trim()
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || "";
  const name = shortNameFromBrief(firstLine);

  const content: ContentMap = {};
  for (const key of DEFAULT_CONTENT_KEYS) {
    content[key] = DEFAULT_DASHBOARD_CONTENT[key] ?? `[${key}] – ${name}`;
  }
  if (name && name !== "Unnamed Client") {
    // Do not use client name in brand dropdown; keep default options only
    // content.brandOptions stays default (e.g. "Brand A, Brand B")
  }

  const { subject, brandName } = subjectFromBrief(briefText);
  content.sectionGlobalTitle = brandName
    ? `${brandName} social insights`
    : `Global social insights: ${subject}`;
  content.sectionGlobalSubtitle =
    `These insights were found based on over 500 million public posts globally, focused on ${subject}${brandName ? ` and ${brandName}` : ""}, showing the top 25 insights with the most engagement and mentions.`;
  // Sample insight copy tailored to subject (dashboard: 1 = Painpoint, 2 = JTBD, 3 = Trend)
  if (subject !== "your category") {
    content.sectionGlobalInsightPainpointTitle =
      subject === "kids' fashion"
        ? "Rising interest in durable, playful kids' fashion and value-driven choices"
        : subject === "fashion"
          ? "Heightened demand for sustainable and inclusive fashion"
          : `${subject}: top pain points from social data`;
    content.sectionGlobalInsightPainpointDescription =
      `Sample pain point for ${brandName ? `${brandName} ` : ""}${subject} based on engagement and mention data.`;
  }

  const lower = briefText.toLowerCase();
  const theme: BrandTheme = JSON.parse(JSON.stringify(DEFAULT_THEME));
  if (lower.includes("bubble gum") || lower.includes("bazooka")) {
    theme.colors.primary = ensureWcagCompliantBackground("#c2185b");
    theme.colors.accent = "#f8bbd9";
    theme.colors.accentForeground = getForegroundForBackground(theme.colors.accent);
  }
  if (lower.includes("blue") && (lower.includes("yellow") || lower.includes("gold"))) {
    theme.colors.primary = ensureWcagCompliantBackground("#1e40af");
    theme.colors.accent = "#fbbf24";
    theme.colors.accentForeground = getForegroundForBackground(theme.colors.accent);
  }

  return {
    name,
    theme,
    brand: { name, logoUrl: null, wordmarkUrl: null },
    content,
    features: {
      sidebar: true,
      opportunityCards: true,
      globalInsights: true,
      crossInsights: true,
      personas: true,
      documents: true,
    },
  };
}

/**
 * Parse brief and optionally enhance with AI-generated content.
 * When OPENAI_API_KEY is set, calls OpenAI to generate section titles, subtitles, and sample insight copy.
 * Falls back to rule-based parsing if the key is missing or the API call fails.
 * Optional clientName, childrenBrands, uiScheme from the Generate from brief form override or augment the result.
 */
export interface ParseBriefWithAIOptions {
  /** Display in top left of product (brand name) */
  clientName?: string;
  /** Comma-separated list; appear in home page nav dropdown under brand name */
  childrenBrands?: string;
  /** Direct instructions for UI/colors; passed to AI for theme */
  uiScheme?: string;
}

export async function parseBriefFromTextWithAI(briefText: string, options?: ParseBriefWithAIOptions): Promise<ParsedBrief> {
  const base = parseBriefFromText(briefText);
  const ai = await generateBriefContentWithAI(briefText, { uiScheme: options?.uiScheme });

  let name = ai?.displayName || base.name;
  if (options?.clientName?.trim()) {
    name = options.clientName.trim().slice(0, 40);
  }
  base.name = name;
  base.brand.name = name;

  if (ai) {
    // Keep section titles fixed: do NOT overwrite sectionGlobalTitle or sectionCrossTitle with AI
    base.content.sectionGlobalSubtitle = ai.sectionGlobalSubtitle || base.content.sectionGlobalSubtitle;
    if (ai.insightPainpointTitle) base.content.sectionGlobalInsightPainpointTitle = ai.insightPainpointTitle;
    if (ai.insightPainpointDescription) base.content.sectionGlobalInsightPainpointDescription = ai.insightPainpointDescription;
    if (ai.insightJtbdTitle) base.content.sectionGlobalInsightJtbdTitle = ai.insightJtbdTitle;
    if (ai.insightJtbdDescription) base.content.sectionGlobalInsightJtbdDescription = ai.insightJtbdDescription;
    if (ai.insightTrendTitle) base.content.sectionGlobalInsightTrendTitle = ai.insightTrendTitle;
    if (ai.insightTrendDescription) base.content.sectionGlobalInsightTrendDescription = ai.insightTrendDescription;

    if (ai.insightPainpointSource) base.content.sectionGlobalInsightPainpointSource = ai.insightPainpointSource;
    if (ai.insightJtbdSource) base.content.sectionGlobalInsightJtbdSource = ai.insightJtbdSource;
    if (ai.insightTrendSource) base.content.sectionGlobalInsightTrendSource = ai.insightTrendSource;

    // Keep section title fixed: do NOT overwrite sectionCrossTitle with AI
    base.content.sectionCrossSubtitle = ai.sectionCrossSubtitle || base.content.sectionCrossSubtitle;
    if (ai.crossInsight1Title) base.content.sectionCrossInsight1Title = ai.crossInsight1Title;
    if (ai.crossInsight1Description) base.content.sectionCrossInsight1Description = ai.crossInsight1Description;
    if (ai.crossInsight2Title) base.content.sectionCrossInsight2Title = ai.crossInsight2Title;
    if (ai.crossInsight2Description) base.content.sectionCrossInsight2Description = ai.crossInsight2Description;

    if (ai.crossInsight1Source) base.content.sectionCrossInsight1Source = ai.crossInsight1Source;
    if (ai.crossInsight2Source) base.content.sectionCrossInsight2Source = ai.crossInsight2Source;

    base.content.sectionPersonasTitle = ai.sectionPersonasTitle || base.content.sectionPersonasTitle;
    base.content.sectionPersonasSubtitle = ai.sectionPersonasSubtitle || base.content.sectionPersonasSubtitle;
    if (ai.persona1Label) base.content.persona1Label = ai.persona1Label;
    if (ai.persona2Label) base.content.persona2Label = ai.persona2Label;
    if (ai.persona3Label) base.content.persona3Label = ai.persona3Label;
    if (ai.persona4Label) base.content.persona4Label = ai.persona4Label;
    if (ai.persona5Label) base.content.persona5Label = ai.persona5Label;

    if (ai.persona1WhatChanged) base.content.persona1WhatChanged = ai.persona1WhatChanged;
    if (ai.persona1Description) base.content.persona1Description = ai.persona1Description;
    if (ai.persona1DescriptionBullets) base.content.persona1DescriptionBullets = ai.persona1DescriptionBullets;
    if (ai.persona1CoreJtbd) base.content.persona1CoreJtbd = ai.persona1CoreJtbd;
    if (ai.persona1BehavioralJobs) base.content.persona1BehavioralJobs = ai.persona1BehavioralJobs;
    if (ai.persona1TriggersRoutines) base.content.persona1TriggersRoutines = ai.persona1TriggersRoutines;
    if (ai.persona1HiddenEmergingJobs) base.content.persona1HiddenEmergingJobs = ai.persona1HiddenEmergingJobs;
    if (ai.persona2WhatChanged) base.content.persona2WhatChanged = ai.persona2WhatChanged;
    if (ai.persona2Description) base.content.persona2Description = ai.persona2Description;
    if (ai.persona2DescriptionBullets) base.content.persona2DescriptionBullets = ai.persona2DescriptionBullets;
    if (ai.persona2CoreJtbd) base.content.persona2CoreJtbd = ai.persona2CoreJtbd;
    if (ai.persona2BehavioralJobs) base.content.persona2BehavioralJobs = ai.persona2BehavioralJobs;
    if (ai.persona2TriggersRoutines) base.content.persona2TriggersRoutines = ai.persona2TriggersRoutines;
    if (ai.persona2HiddenEmergingJobs) base.content.persona2HiddenEmergingJobs = ai.persona2HiddenEmergingJobs;

    // Visual agent: prompt agent ingests all 5 persona cards and produces 5 headshot prompts; then visual agent runs Fal in parallel
    const personaCards = [
      getPersonaCardFromContent(base.content, 1),
      getPersonaCardFromContent(base.content, 2),
      getPersonaCardFromContent(base.content, 3),
      getPersonaCardFromContent(base.content, 4),
      getPersonaCardFromContent(base.content, 5),
    ].filter((c) => c.label?.trim());
    if (personaCards.length > 0) {
      const images = await generatePersonaProfileImages(personaCards);
      images.forEach((dataUrl, idx) => {
        if (dataUrl && idx < 5) base.content[`persona${idx + 1}Image`] = dataUrl;
      });
    }

    if (ai.document1Name) base.content.document1Name = ai.document1Name;
    if (ai.document2Name) base.content.document2Name = ai.document2Name;
    if (ai.document1Insights) base.content.document1Insights = ai.document1Insights;
    if (ai.document2Insights) base.content.document2Insights = ai.document2Insights;

    if (ai.recentProject1) base.content.recentProject1 = ai.recentProject1;
    if (ai.recentProject2) base.content.recentProject2 = ai.recentProject2;
    if (ai.recentProject3) base.content.recentProject3 = ai.recentProject3;

    if (ai.suggestedFocusPills) base.content.suggestedFocusPills = ai.suggestedFocusPills;

    if (ai.subject) base.content.subject = ai.subject;

    if (ai.brandName) {
      base.content.brandOptions = [ai.brandName].filter(Boolean).join(", ");
    }

    // Ensure darker color is primary, lighter color is accent
    let primaryColor = ai.primaryColor;
    let accentColor = ai.accentColor;
    
    if (primaryColor && accentColor && /^#[0-9A-Fa-f]{6}$/.test(primaryColor) && /^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      const primaryLuminance = getLuminance(primaryColor);
      const accentLuminance = getLuminance(accentColor);
      
      // If accent is darker than primary, swap them
      if (accentLuminance < primaryLuminance) {
        [primaryColor, accentColor] = [accentColor, primaryColor];
      }
    }
    
    if (primaryColor && /^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
      base.theme.colors.primary = ensureWcagCompliantBackground(primaryColor);
    }
    if (accentColor && /^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      base.theme.colors.accent = accentColor;
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    }
  }

  // Form fields: children brands = dropdown options (under brand name in nav). Do not include client/project name.
  if (options?.childrenBrands?.trim()) {
    const brands = options.childrenBrands.split(",").map((b) => b.trim()).filter(Boolean);
    base.content.brandOptions = [...brands].filter(Boolean).join(", ");
  }

  // UI scheme: when no AI theme was applied, use uiScheme as direct instructions for colors
  // Colors are adjusted for reasonable contrast with white (relaxed threshold for wiggle room)
  const uiLower = options?.uiScheme?.toLowerCase() ?? "";
  if (uiLower && !ai?.primaryColor) {
    if (uiLower.includes("blue") && (uiLower.includes("yellow") || uiLower.includes("gold"))) {
      base.theme.colors.primary = ensureWcagCompliantBackground("#1e40af");
      base.theme.colors.accent = "#fbbf24";
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    } else if (uiLower.includes("blue")) {
      base.theme.colors.primary = ensureWcagCompliantBackground("#1e40af");
      base.theme.colors.accent = "#3b82f6";
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    } else if (uiLower.includes("green")) {
      base.theme.colors.primary = ensureWcagCompliantBackground("#166534");
      base.theme.colors.accent = "#22c55e";
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    } else if (uiLower.includes("pink") || uiLower.includes("red")) {
      base.theme.colors.primary = ensureWcagCompliantBackground("#9d174d");
      base.theme.colors.accent = "#f472b6";
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    } else if (uiLower.includes("lime") || uiLower.includes("yellow")) {
      // Only darken if needed for reasonable contrast; relaxed threshold allows some brightness
      base.theme.colors.primary = ensureWcagCompliantBackground("#4d7c0f");
      base.theme.colors.accent = "#ca8a04";
      base.theme.colors.accentForeground = getForegroundForBackground(base.theme.colors.accent);
    }
  }

  return base;
}
