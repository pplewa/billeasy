import { removeAuthCookie } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Remove the authentication cookie
    removeAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in signout API:", error);
    return NextResponse.json(
      { message: "Failed to sign out" },
      { status: 500 }
    );
  }
}
