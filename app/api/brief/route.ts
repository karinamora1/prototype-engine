import { NextRequest, NextResponse } from "next/server";
import { parseBriefFromText } from "@/lib/brief-parser";

/**
 * POST /api/brief
 * Body: { brief: string } or multipart with file
 * Returns parsed theme, brand, content, features (preview before generating instance).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let briefText: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      briefText = body.brief ?? body.text ?? "";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const pasted = formData.get("brief") as string | null;
      if (file) {
        briefText = await file.text();
      } else {
        briefText = pasted ?? "";
      }
    } else {
      briefText = await request.text();
    }

    if (!briefText.trim()) {
      return NextResponse.json({ error: "No brief content provided" }, { status: 400 });
    }

    const parsed = parseBriefFromText(briefText);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Brief parse error:", e);
    return NextResponse.json({ error: "Failed to parse brief" }, { status: 500 });
  }
}
