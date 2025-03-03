import { NextResponse } from "next/server";
import { createInvoice, getAllInvoices } from "@/services/invoice/server/invoiceService";
import { InvoiceType } from "@/types";
import { InvoiceSchema } from "@/lib/schemas";

/**
 * GET handler for fetching all invoices
 * @returns {Promise<NextResponse>} The response containing all invoices or an error
 */
export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new invoice
 * @param {Request} request - The request object containing the invoice data
 * @returns {Promise<NextResponse>} The response containing the created invoice or an error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = InvoiceSchema.parse(body);

    // Create the invoice
    const invoice = await createInvoice(validatedData as InvoiceType);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);

    // Check if it's a validation error
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid invoice data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
} 