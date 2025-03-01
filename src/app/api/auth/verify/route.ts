import { setAuthCookie, verifyAuthToken } from "@/lib/auth/auth";
import connectToDatabase from "@/lib/db/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const VerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = VerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const { token } = result.data;

    // Connect to the database
    await connectToDatabase();

    // Verify the token
    const verification = await verifyAuthToken(token);

    if (!verification.success) {
      return NextResponse.json(
        { message: verification.message || "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Create a response object
    const response = NextResponse.json({
      success: true,
      user: verification.user,
    });

    // Set the auth cookie
    if (verification.authToken) {
      return setAuthCookie(response, verification.authToken);
    }

    return response;
  } catch (error) {
    console.error("Error in verify API:", error);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
