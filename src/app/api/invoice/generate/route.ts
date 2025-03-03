import { NextRequest } from "next/server";
import { generatePdfService } from "@/services/invoice/server/generatePdfService";

/**
 * POST handler for generating a PDF invoice
 * @param {NextRequest} req - The request object containing the invoice data
 * @returns {Promise<Response>} The response containing the generated PDF
 */
export async function POST(req: NextRequest) {
  return generatePdfService(req);
} 