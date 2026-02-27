/**
 * Helpers for the instance content editor (edit mode).
 * Used only when editing an instance; changes are saved to the instance only, not to the base prototype.
 */

import type { ContentMap } from "./types";
import { DEFAULT_CONTENT_KEYS } from "./types";

/** Keys that typically have longer copy; use textarea in content editor */
export const LONG_TEXT_KEYS = new Set([
  "card1Body", "card2Body", "card3Body", "brandOptions", "sectionGlobalSubtitle", "sectionCrossSubtitle",
  "sectionCrossInsight1Description", "sectionCrossInsight2Description", "defineScopeInstructions",
  "narrowFocusQuote", "narrowFocusDescription", "narrowFocusDescriptionLong", "keepBroadQuote", "keepBroadDescription",
  "customFocusNote", "suggestedFocusNote", "selectMarketsInstructions", "selectDataSourcesIntro1", "selectDataSourcesIntro2",
  "dataSourceFirstPartyDesc", "dataSourceBehavioralDesc", "dataSourceCrossCategoryDesc", "dataSourceCrossCategorySocialDesc", "dataSourceCompetitorDesc",
  "insightStudioInstructions", "opportunityScoreCopy", "opportunitySizingCopy", "customBriefSectionText",
  "linkedCustomContentPlaceholder", "suggestedFocusPills",
]);

/** Group content keys by section for the full content editor */
export function groupContentKeys(content: ContentMap): { title: string; keys: string[] }[] {
  const allKeys = Array.from(new Set([...DEFAULT_CONTENT_KEYS, ...Object.keys(content)]));
  const navExtras = ["uploadDocument", "viewProjectLibrary", "logout", "selectorLabel", "brandOptions"];
  const dashboardKeys = ["pageTitle", "card1Title", "card1Body", "card2Title", "card2Body", "card3Title", "card3Body", "generateButton"];
  const insightModalKeys = ["socialInsightModalTitle", "insightType", "insightText", "insightAddedDate", "insightSourceLabel", "insightSourceUrl"];
  const defineScopeKeys = ["defineScopeTitle", "defineScopeInstructions", "narrowFocusTitle", "narrowFocusQuote", "narrowFocusDescription", "narrowFocusDescriptionLong", "keepBroadTitle", "keepBroadQuote", "keepBroadDescription", "tabPopularFocus", "tabGlobalSocial", "tabCrossCategory", "suggestedFocusLabel", "suggestedFocusNote", "suggestedFocusPills", "customFocusLabel", "customFocusNote", "customFocusPlaceholder", "inputSettingsTitle", "projectNameLabel", "nextButtonLabel"];
  const stepKeys = ["stepExploreOpportunities", "stepDefineScope", "stepSelectMarkets", "stepSelectDataSources", "stepInsightStudio", "stepOpportunitySpaces"];
  const flowOpportunityKeys = ["generateOpportunitySpacesButton", "customBriefLabel", "linkedCustomContentPlaceholder", "opportunityDescriptionTitle", "opportunityBenefitsTitle", "opportunityScoreTitle", "opportunityScoreCopy", "opportunitySizingTitle", "opportunitySizingCopy", "generateGlobalSizingButton", "opportunitySizingDropdownAll", "opportunitySizingPlaceholder", "consumerGoalsTitle", "painPointsTitle", "marketsTitle", "experienceOptimizationTitle", "styleDifferentiatorTitle", "reviewOpportunitySpacesButton", "generateProjectButton", "generateConceptButton", "generateMoreOpportunitySpaces", "customBriefSectionText", "uploadCustomBriefButton", "validateButton", "validateMultipleButton", "deleteValidationReportButton", "validationComparisonViewButton", "validationReportTitle", "validationDesirabilityLabel", "validationOpportunitySizeLabel", "validationFeasibilityLabel", "validationWhatResonates", "validationBarriers", "backToInnovationFlow", "backToOpportunitySpaces", "comparisonValidationViewTitle", "comparisonSortBy", "comparisonNoReports", "viewFullReport"];
  const otherFlowKeys = ["locationLabel", "insightCta", "viewSources", "seeSummaryButton", "statusCompleted", "statusInProgress", "selectAllLabel", "selectAllGlobal", "selectAllNorthAmerica", "selectAllLATAM", "selectAllEurope", "selectAllAPAC", "selectAllAMET", "hunchCardSeeBreakdown", "clusteringSocialLabel", "clusteringSocialClue1", "clusteringInternalLabel", "clusteringInternalClue2", "generatingOpportunitySpacesMessage", "showMoreOpportunitySpaces"];
  const selectDataSourcesKeys = ["selectDataSourcesTitle", "selectDataSourcesIntro1", "selectDataSourcesIntro2"];

  function assign(key: string): string {
    if (key.startsWith("nav")) return "Navigation";
    if (navExtras.includes(key)) return "Navigation (documents & library)";
    if (dashboardKeys.includes(key)) return "Dashboard";
    if (key.startsWith("sectionGlobal")) return "Global insights";
    if (key.startsWith("sectionCross")) return "Cross category insights";
    if (key.startsWith("sectionPersonas")) return "Personas section";
    if (key.startsWith("persona")) return "Personas";
    if (key.startsWith("sectionDocs")) return "Documents";
    if (key.startsWith("document")) return "Documents (items)";
    if (insightModalKeys.includes(key)) return "Insight modal";
    if (defineScopeKeys.includes(key)) return "Flow – Define scope";
    if (stepKeys.includes(key)) return "Flow – Steps & settings";
    if (key.startsWith("selectMarkets")) return "Flow – Markets";
    if (selectDataSourcesKeys.includes(key) || key.startsWith("selectDataSources")) return "Flow – Data sources";
    if (key.startsWith("dataSource")) return "Flow – Data source labels";
    if (key.startsWith("insightStudio")) return "Flow – Insight studio";
    if (flowOpportunityKeys.includes(key) || otherFlowKeys.includes(key)) return "Flow – Opportunity spaces";
    if (key.startsWith("validation") || key.startsWith("comparison") || key === "viewFullReport") return "Validation & comparison";
    return "Other";
  }

  const bySection: Record<string, string[]> = {};
  for (const key of allKeys) {
    const section = assign(key);
    if (!bySection[section]) bySection[section] = [];
    bySection[section].push(key);
  }
  const order = ["Navigation", "Navigation (documents & library)", "Dashboard", "Global insights", "Cross category insights", "Personas section", "Personas", "Documents", "Documents (items)", "Insight modal", "Flow – Define scope", "Flow – Steps & settings", "Flow – Markets", "Flow – Data sources", "Flow – Data source labels", "Flow – Insight studio", "Flow – Opportunity spaces", "Validation & comparison", "Other"];
  return order.filter((s) => bySection[s]?.length).map((title) => ({ title, keys: bySection[title].sort() }));
}

/** Build full edit content from instance content so every default key exists (for saving only the instance) */
export function buildFullEditContent(content: ContentMap): ContentMap {
  const full: ContentMap = {};
  for (const key of DEFAULT_CONTENT_KEYS) {
    full[key] = content[key] ?? "";
  }
  for (const key of Object.keys(content)) {
    if (!(key in full)) full[key] = content[key] ?? "";
  }
  return full;
}
