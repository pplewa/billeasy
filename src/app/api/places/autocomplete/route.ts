import { NextRequest, NextResponse } from "next/server";
import { getAddressSuggestions, autocompleteRequestSchema } from "@/lib/services/google-maps";

/**
 * API endpoint for address autocomplete suggestions
 * GET /api/places/autocomplete?input=123+Main+St
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");
    
    if (!input) {
      return NextResponse.json(
        { error: "Input parameter is required" },
        { status: 400 }
      );
    }

    // Validate input
    const parseResult = autocompleteRequestSchema.safeParse({
      input,
      types: ["address"],
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // Get address suggestions
    const suggestions = await getAddressSuggestions(parseResult.data);
    return NextResponse.json({ suggestions });
    
  } catch (error) {
    console.error("Error in autocomplete API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get address suggestions";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 