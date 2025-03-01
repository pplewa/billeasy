import { getCurrentUser } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to get the current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in me API:", error);
    return NextResponse.json(
      { message: "Failed to get current user" },
      { status: 500 }
    );
  }
} 