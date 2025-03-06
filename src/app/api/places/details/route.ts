import { NextRequest, NextResponse } from "next/server";
import { getAddressDetails, placeDetailsRequestSchema } from "@/lib/services/google-maps";

/**
 * API endpoint for getting address details
 * GET /api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get("placeId");
    
    if (!placeId) {
      return NextResponse.json(
        { error: "placeId parameter is required" },
        { status: 400 }
      );
    }

    // Validate input
    const parseResult = placeDetailsRequestSchema.safeParse({
      placeId,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // Get address details
    const addressDetails = await getAddressDetails(parseResult.data);
    return NextResponse.json({ addressDetails });
    
  } catch (error) {
    console.error("Error in place details API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get address details";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 