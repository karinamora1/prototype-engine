/**
 * Core types for the configurable prototype engine.
 * Layout and structure stay fixed; these drive dynamic branding and content.
 */

/** Brand theme tokens — applied as CSS variables */
export interface BrandTheme {
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    /** Text on accent background. If missing, computed: black when white wouldn't meet contrast. */
    accentForeground?: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    /** Selected state (cards, pills, tabs). If missing, falls back to primary-tinted defaults. */
    selectedBackground?: string;
    selectedBorder?: string;
    selectedForeground?: string;
  };
  typography: {
    fontSans: string;
    fontDisplay: string;
    headingSize: string;
    bodySize: string;
  };
}

/** Brand identity */
export interface BrandIdentity {
  name: string;
  /** Logomark/icon (symbol only). Shown in navbar when collapsed. */
  logoUrl: string | null; // URL or data URL after upload
  /** Wordmark (brand name in typography). Shown in navbar when expanded. */
  wordmarkUrl: string | null;
}

/** All copy keys used by the base prototype; values are per-instance */
export type ContentMap = Record<string, string>;

/** Pre-generated project detail for the first recent project (generated at instance creation) */
export interface FirstRecentProjectDetail {
  projectTitle: string;
  opportunities: {
    id: string;
    title: string;
    snippet: string;
    concepts: { id: string; title: string; overview: string; image: string }[];
  }[];
}

/** Optional features that can be toggled on/off per instance */
export type FeatureFlags = Record<string, boolean>;

/** One generated prototype instance */
export interface PrototypeInstance {
  id: string;
  name: string; // e.g. "Bazooka Bubble Gum"
  slug: string; // URL-friendly
  createdAt: string; // ISO
  updatedAt: string;
  theme: BrandTheme;
  brand: BrandIdentity;
  content: ContentMap;
  features: FeatureFlags;
  /** Optional password; if set, viewer must enter to access */
  passwordHash: string | null;
  /** Raw brief text for reference */
  briefSummary: string;
  /** Pre-generated detail for the first recent project (2 opportunities + concepts). Generated at instance creation. */
  firstRecentProjectDetail?: FirstRecentProjectDetail | null;
  /** If set, this instance is a published copy of the instance with this id. Hidden from library; view at /p/[slug]. */
  sourceInstanceId?: string;
  /** If set, this instance has been published; the published page is at /p/[publishedSlug]. */
  publishedSlug?: string;
}

/** Instance as returned by API (no password hash); use for client view */
export type PrototypeInstanceView = Omit<PrototypeInstance, "passwordHash"> & { passwordProtected?: boolean };

/** Input when creating an instance (e.g. from a brief) */
export interface CreateInstanceInput {
  name: string;
  /** Optional; if not provided, derived from name. Use for published pages to ensure unique URL. */
  slug?: string;
  theme: BrandTheme;
  brand: BrandIdentity;
  content: ContentMap;
  features: FeatureFlags;
  password?: string;
  briefSummary: string;
  /** Optional; if not provided, generated at create time from brief + first recent project name. */
  firstRecentProjectDetail?: FirstRecentProjectDetail | null;
  /** When creating a published copy, set to the source instance id so the copy is hidden from the library. */
  sourceInstanceId?: string;
}

/** Default theme (e.g. Glade) — used as fallback and template */
export const DEFAULT_THEME: BrandTheme = {
  colors: {
    primary: "#374151",
    primaryForeground: "#ffffff",
    accent: "#dc2626",
    accentForeground: "#ffffff",
    background: "#ffffff",
    foreground: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    selectedBackground: "#f0f9ff",
    selectedBorder: "#3b82f6",
    selectedForeground: "#1e40af",
  },
  typography: {
    fontSans: "system-ui, sans-serif",
    fontDisplay: "system-ui, sans-serif",
    headingSize: "1.25rem",
    bodySize: "1rem",
  },
};

/** Default content keys expected by the base prototype (innovation dashboard) */
export const DEFAULT_CONTENT_KEYS = [
  "pageTitle",
  "navHome",
  "navRecentProjects",
  "recentProject1",
  "recentProject2",
  "recentProject3",
  "navMoodBoards",
  "navFeatureJournal",
  "navGallery",
  "navTemplates",
  "selectorLabel",
  "brandOptions",
  "uploadDocument",
  "viewProjectLibrary",
  "logout",
  "card1Title",
  "card1Body",
  "card2Title",
  "card2Body",
  "card3Title",
  "card3Body",
  "generateButton",
  "sectionGlobalTitle",
  "sectionGlobalSubtitle",
  "sectionCrossTitle",
  "sectionCrossSubtitle",
  "sectionCrossInsight1Title",
  "sectionCrossInsight1Description",
  "sectionCrossInsight2Title",
  "sectionCrossInsight2Description",
  "sectionPersonasTitle",
  "sectionPersonasSubtitle",
  "persona1Label",
  "persona2Label",
  "persona3Label",
  "persona4Label",
  "persona5Label",
  "sectionDocsTitle",
  "sectionDocsSubtitle",
  "locationLabel",
  "insightCta",
  "viewSources",
  "seeSummaryButton",
  "statusCompleted",
  "statusInProgress",
  "document1Name",
  "document2Name",
  "document1Meta",
  "document2Meta",
  "document1Insights",
  "document2Insights",
  "personaLastUpdated",
  "personaWhatChanged",
  "personaDescription",
  "personaDescriptionBullets",
  "personaCoreJtbd",
  "personaBehavioralJobs",
  "personaTriggersRoutines",
  "personaHiddenEmergingJobs",
  "personaSource1Label",
  "personaSource1Doc",
  "personaSource2Label",
  "personaSource2Url",
  "socialInsightModalTitle",
  "insightType",
  "insightText",
  "insightAddedDate",
  "insightSourceLabel",
  "insightSourceUrl",
  "generateOpportunitySpacesButton",
  "defineScopeTitle",
  "defineScopeInstructions",
  "narrowFocusTitle",
  "narrowFocusQuote",
  "narrowFocusDescription",
  "keepBroadTitle",
  "keepBroadQuote",
  "keepBroadDescription",
  "stepExploreOpportunities",
  "stepDefineScope",
  "stepSelectMarkets",
  "stepSelectDataSources",
  "stepInsightStudio",
  "stepOpportunitySpaces",
  "inputSettingsTitle",
  "projectNameLabel",
  "nextButtonLabel",
  "narrowFocusDescriptionLong",
  "customFocusLabel",
  "customFocusNote",
  "customFocusPlaceholder",
  "suggestedFocusLabel",
  "suggestedFocusNote",
  "tabPopularFocus",
  "tabGlobalSocial",
  "tabCrossCategory",
  "suggestedFocusPills",
  "selectMarketsTitle",
  "selectMarketsInstructions",
  "selectAllGlobal",
  "selectAllNorthAmerica",
  "selectAllLATAM",
  "selectAllEurope",
  "selectAllAPAC",
  "selectAllAMET",
  "selectDataSourcesTitle",
  "selectDataSourcesIntro1",
  "selectDataSourcesIntro2",
  "dataSourceFirstPartyName",
  "dataSourceFirstPartyDesc",
  "dataSourceFirstPartySelectSpecific",
  "dataSourceBehavioralName",
  "dataSourceBehavioralDesc",
  "dataSourceCrossCategoryName",
  "dataSourceCrossCategoryDesc",
  "dataSourceCrossCategorySocialName",
  "dataSourceCrossCategorySocialDesc",
  "dataSourceCompetitorName",
  "dataSourceCompetitorDesc",
  "selectAllLabel",
  "insightStudioTitle",
  "insightStudioLoadingText",
  "insightStudioInstructions",
  "hunchCardSeeBreakdown",
  "clusteringSocialLabel",
  "clusteringSocialClue1",
  "clusteringInternalLabel",
  "clusteringInternalClue2",
  "generatingOpportunitySpacesMessage",
  "showMoreOpportunitySpaces",
  "customBriefLabel",
  "linkedCustomContentPlaceholder",
  "opportunityDescriptionTitle",
  "opportunityBenefitsTitle",
  "opportunityScoreTitle",
  "opportunityScoreCopy",
  "opportunitySizingTitle",
  "opportunitySizingCopy",
  "generateGlobalSizingButton",
  "opportunitySizingDropdownAll",
  "opportunitySizingPlaceholder",
  "consumerGoalsTitle",
  "painPointsTitle",
  "marketsTitle",
  "experienceOptimizationTitle",
  "styleDifferentiatorTitle",
  "reviewOpportunitySpacesButton",
  "generateProjectButton",
  "generateConceptButton",
  "generateMoreOpportunitySpaces",
  "customBriefSectionText",
  "uploadCustomBriefButton",
  "validateButton",
  "validateMultipleButton",
  "deleteValidationReportButton",
  "validationComparisonViewButton",
  "validationReportTitle",
  "validationDesirabilityLabel",
  "validationOpportunitySizeLabel",
  "validationFeasibilityLabel",
  "validationWhatResonates",
  "validationBarriers",
  "backToInnovationFlow",
  "backToOpportunitySpaces",
  "comparisonValidationViewTitle",
  "comparisonSortBy",
  "comparisonNoReports",
  "viewFullReport",
] as const;

export type DefaultContentKey = (typeof DEFAULT_CONTENT_KEYS)[number];
