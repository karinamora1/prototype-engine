import { NextRequest, NextResponse } from "next/server";
import {
  generateConceptValidation,
  type GenerateValidationInput,
} from "@/lib/ai-validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateValidationInput;

    const { conceptTitle, conceptOverview, opportunityTitle, countries } = body;

    if (
      !conceptTitle ||
      !conceptOverview ||
      !opportunityTitle ||
      !Array.isArray(countries) ||
      countries.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validations = await generateConceptValidation(body);

    if (!validations) {
      return NextResponse.json(
        { error: "Failed to generate validation results" },
        { status: 500 }
      );
    }

    return NextResponse.json({ validations });
  } catch (error) {
    console.error("Validation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
