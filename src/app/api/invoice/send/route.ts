import { NextRequest, NextResponse } from "next/server";
import { sendPdfToEmailService } from "@/services/invoice/server/sendPdfToEmailService";

/**
 * POST handler for sending an invoice as a PDF attachment to an email
 * @param {NextRequest} req - The request object containing the email, invoice PDF, and invoice number
 * @returns {Promise<Response>} The response indicating success or failure
 */
export async function POST(req: NextRequest) {
  try {
    const emailSent = await sendPdfToEmailService(req);
    
    if (emailSent) {
      return new NextResponse("Email sent successfully", {
        status: 200,
      });
    } else {
      return new NextResponse("Failed to send email", {
        status: 500,
      });
    }
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to send email", { status: 500 });
  }
} 