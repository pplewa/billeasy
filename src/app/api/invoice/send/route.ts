import { NextRequest, NextResponse } from "next/server";
import { sendPdfToEmailService } from "@/services/invoice/server/sendPdfToEmailService";

/**
 * POST handler for sending a PDF invoice via email
 * @param {NextRequest} req - The request object containing the email, invoice PDF, and invoice number
 * @returns {Promise<NextResponse>} The response indicating success or failure
 */
export async function POST(req: NextRequest) {
  try {
    const success = await sendPdfToEmailService(req);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
} 