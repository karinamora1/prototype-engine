/**
 * AI agent to enrich project detail data for innovation flow.
 * Takes basic opportunity + concept data and fills in missing fields.
 */

interface BasicOpportunity {
  id: string;
  title: string;
  snippet: string;
  concepts: {
    id: string;
    title: string;
    overview: string;
    image: string;
  }[];
}

interface EnrichedOpportunity {
  id: string;
  title: string;
  snippet: string;
  score: number;
  image: string;
  benefits: string[];
  consumerGoals: string[];
  painPoints: string[];
  concepts: {
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
  }[];
}

const SYSTEM_PROMPT = `You are an innovation strategist. Given basic opportunity and concept information, enrich them with additional strategic details.

For each opportunity, provide:
- score: An integer 70-85 representing strategic opportunity strength
- benefits: 3-4 consumer benefits (1-2 sentences each)
- consumerGoals: 3-4 consumer goals related to this opportunity (1 sentence each)
- painPoints: 2-3 pain points this addresses (1 sentence each)

For each concept within an opportunity, provide:
- shortSummary: 1 sentence summary
- variations: 2-3 product variations (brief descriptions)
- painPointsSolved: 2-3 pain points this concept solves
- consumerGoal: 1 sentence describing the consumer goal
- painPoints: 1-2 pain points (brief)
- opportunityScore: Integer 70-90
- pricePackSizeOptions: 2-3 pricing/pack size options

Respond with valid JSON only (no markdown, no code fence):
{
  "opportunities": [
    {
      "id": "...",
      "score": 78,
      "benefits": ["...", "...", "..."],
      "consumerGoals": ["...", "...", "..."],
      "painPoints": ["...", "..."],
      "concepts": [
        {
          "id": "...",
          "shortSummary": "...",
          "variations": ["...", "...", "..."],
          "painPointsSolved": ["...", "..."],
          "consumerGoal": "...",
          "painPoints": ["...", "..."],
          "opportunityScore": 82,
          "pricePackSizeOptions": ["...", "...", "..."]
        },
        ...
      ]
    },
    ...
  ]
}`;

function buildUserPrompt(opportunities: BasicOpportunity[]): string {
  return `Enrich the following opportunities and concepts with strategic details:

${opportunities.map((opp, i) => `
Opportunity ${i + 1}:
Title: ${opp.title}
Description: ${opp.snippet}

Concepts:
${opp.concepts.map((c, j) => `  ${j + 1}. ${c.title}\n     Overview: ${c.overview}`).join('\n')}
`).join('\n---\n')}

Generate the enriched JSON.`;
}

/**
 * Enrich basic project detail data with AI-generated strategic fields.
 * Returns null if OPENAI_API_KEY is missing or the request fails.
 */
export async function enrichProjectForInnovationFlow(
  opportunities: BasicOpportunity[]
): Promise<EnrichedOpportunity[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set; cannot enrich project data");
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
        { role: "user", content: buildUserPrompt(opportunities) },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI enrich API error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = data.choices?.[0]?.message?.content?.trim();
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent) as {
      opportunities?: Array<{
        id: string;
        score: number;
        benefits: string[];
        consumerGoals: string[];
        painPoints: string[];
        concepts: Array<{
          id: string;
          shortSummary: string;
          variations: string[];
          painPointsSolved: string[];
          consumerGoal: string;
          painPoints: string[];
          opportunityScore: number;
          pricePackSizeOptions: string[];
        }>;
      }>;
    };

    if (!Array.isArray(parsed.opportunities)) return null;

    // Merge enriched data with original data
    const enriched: EnrichedOpportunity[] = opportunities.map((opp, oppIndex) => {
      const enrichedOpp = parsed.opportunities?.[oppIndex];
      
      return {
        id: opp.id,
        title: opp.title,
        snippet: opp.snippet,
        score: enrichedOpp?.score ?? 75,
        image: opp.concepts[0]?.image ?? "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=400&fit=crop",
        benefits: enrichedOpp?.benefits ?? ["To be defined"],
        consumerGoals: enrichedOpp?.consumerGoals ?? ["To be defined"],
        painPoints: enrichedOpp?.painPoints ?? ["To be defined"],
        concepts: opp.concepts.map((concept, conceptIndex) => {
          const enrichedConcept = enrichedOpp?.concepts?.[conceptIndex];
          
          return {
            id: concept.id,
            opportunityId: opp.id,
            title: concept.title,
            image: concept.image,
            shortSummary: enrichedConcept?.shortSummary ?? concept.overview.substring(0, 100),
            overview: concept.overview,
            variations: enrichedConcept?.variations ?? ["Variation A", "Variation B"],
            painPointsSolved: enrichedConcept?.painPointsSolved ?? ["To be defined"],
            consumerGoal: enrichedConcept?.consumerGoal ?? "To be defined",
            painPoints: enrichedConcept?.painPoints ?? ["To be defined"],
            opportunityScore: enrichedConcept?.opportunityScore ?? 75,
            pricePackSizeOptions: enrichedConcept?.pricePackSizeOptions ?? ["Standard pack", "Value pack", "Trial size"],
          };
        }),
      };
    });

    return enriched;
  } catch (error) {
    console.error("Failed to parse enriched project JSON from OpenAI:", error);
    return null;
  }
}
