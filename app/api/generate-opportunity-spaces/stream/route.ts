import { NextRequest, NextResponse } from "next/server";
import {
  OPPORTUNITY_SPACES_SYSTEM_PROMPT,
  buildOpportunitySpacesUserPrompt,
  parseOpportunitySpacesFromModelText,
} from "@/lib/ai-opportunity-spaces";
import { generateOpportunityImageFromContent } from "@/lib/ai-opportunity-image";
import { imageUrlFromQuery } from "@/lib/ai-opportunity-spaces";

export const dynamic = "force-dynamic";

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const insights = Array.isArray(body.insights)
    ? body.insights
        .filter((i: unknown) => i && typeof i === "object" && "title" in i)
        .map((i: { title?: string; description?: string; category?: string }) => ({
          title: String(i.title ?? "").trim(),
          description: String(i.description ?? "").trim(),
          category: i.category,
        }))
        .slice(0, 4)
    : [];

  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const userPrompt = buildOpportunitySpacesUserPrompt({ subject, insights });

  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const write = async (text: string) => {
    await writer.write(encoder.encode(text));
  };

  // Kick off async streaming work; return the readable immediately
  (async () => {
    let modelText = "";
    try {
      await write(sseEvent("stage", { message: "Generating opportunity spaces…" }));

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            { role: "system", content: OPPORTUNITY_SPACES_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2400,
          temperature: 0.4,
        }),
      });

      if (!res.ok || !res.body) {
        await write(sseEvent("error", { message: "OpenAI request failed" }));
        await writer.close();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // OpenAI streams Server-Sent Events: lines starting with "data: "
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            buffer = "";
            break;
          }
          try {
            const json = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              modelText += delta;
              await write(sseEvent("chunk", { delta }));
            }
          } catch {
            // ignore parse errors from partial lines
          }
        }
      }

      await write(sseEvent("stage", { message: "Finalizing results…" }));
      const spaces = parseOpportunitySpacesFromModelText(modelText);
      if (!spaces) {
        await write(sseEvent("error", { message: "Failed to parse model output" }));
        await writer.close();
        return;
      }

      await write(sseEvent("stage", { message: "Generating images…" }));
      const opportunitySpaces = await Promise.all(
        spaces.map(async (s, i) => {
          const id = String(i + 1);
          const title = s.title;
          const snippet = s.description;
          const score = s.score ?? 70 - i * 10;
          const benefits = s.benefits ?? [];
          const consumerGoals = s.consumerGoals ?? [];
          const painPoints = s.painPoints ?? [];
          const markets = s.markets ?? [];
          const fallbackImage = imageUrlFromQuery(s.imageQuery);

          let image = fallbackImage;
          if (i < 2 && title && (snippet || benefits.length > 0)) {
            const generatedUrl = await generateOpportunityImageFromContent(title, snippet, benefits);
            if (generatedUrl) image = generatedUrl;
          }

          return {
            id,
            title,
            snippet,
            score,
            image,
            benefits,
            consumerGoals,
            painPoints,
            markets,
          };
        })
      );

      await write(sseEvent("final", { opportunitySpaces }));
      await write(sseEvent("done", { ok: true }));
      await writer.close();
    } catch (e) {
      await write(sseEvent("error", { message: "Streaming failed" }));
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

