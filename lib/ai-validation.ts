/**
 * AI-powered concept validation agent.
 * Analyzes a concept and generates validation scores and insights per country.
 */

export interface ValidationCountryResult {
  countryId: string;
  countryName: string;
  overallScore: number; // 70-100
  desirabilityScore: number; // 70-100
  subcriteria: {
    solutionProblemFit: number;
    consumerJourneyFit: number;
    differentiation: number;
    futureFit: number;
  };
  whatResonates: string; // 1-3 sentences
  barriers: string; // 1-3 sentences
}

export interface GenerateValidationInput {
  conceptTitle: string;
  conceptOverview: string;
  opportunityTitle: string;
  countries: string[]; // e.g. ["United States", "Brazil", "Mexico"]
}

const SYSTEM_PROMPT = `You are a concept validation analyst. Given a product/service concept and a list of target countries, generate validation scores and insights for each country.

For each country, provide:
- overallScore: An integer between 70-100 representing the concept's overall validation score in that market
- desirabilityScore: An integer between 70-100 representing consumer desirability
- subcriteria: Four scores (each 70-100) for:
  * solutionProblemFit: How well the concept solves existing consumer problems
  * consumerJourneyFit: How naturally it fits into consumer routines and journeys
  * differentiation: How distinct it is from existing solutions
  * futureFit: How aligned it is with emerging trends and future needs
- whatResonates: 1-3 sentences explaining what aspects of the concept resonate strongly with consumers in this market
- barriers: 1-3 sentences describing potential barriers or concerns consumers might have in this market

Scores should generally be in the 70-100 range (indicating validation-ready concepts). Make the insights specific to each market's cultural context, competitive landscape, and consumer behaviors.

Respond with valid JSON only (no markdown, no code fence):
{
  "validations": [
    {
      "countryId": "usa",
      "countryName": "United States",
      "overallScore": 85,
      "desirabilityScore": 83,
      "subcriteria": {
        "solutionProblemFit": 85,
        "consumerJourneyFit": 82,
        "differentiation": 80,
        "futureFit": 84
      },
      "whatResonates": "Resonates explanation here...",
      "barriers": "Barriers explanation here..."
    },
    ...
  ]
}`;

function buildUserPrompt(input: GenerateValidationInput): string {
  return `Concept title: ${input.conceptTitle}
Concept description: ${input.conceptOverview}
Opportunity space: ${input.opportunityTitle}

Target countries: ${input.countries.join(", ")}

Generate validation scores and insights for each country.`;
}

/**
 * Generate validation results for a concept across multiple countries.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function generateConceptValidation(
  input: GenerateValidationInput
): Promise<ValidationCountryResult[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set; cannot generate validation");
    return null;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI validation API error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = data.choices?.[0]?.message?.content?.trim();
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent) as { validations?: ValidationCountryResult[] };
    return Array.isArray(parsed.validations) ? parsed.validations : null;
  } catch {
    console.error("Failed to parse validation JSON from OpenAI");
    return null;
  }
}
