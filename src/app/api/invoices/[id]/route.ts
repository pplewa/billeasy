import { NextRequest, NextResponse } from "next/server";
import { InvoiceSchema } from "@/lib/schemas";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
} from "@/services/invoice/server/invoiceService";

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET handler for fetching a specific invoice by ID
 * @param {NextRequest} req - The request object
 * @param {Params} params - The route parameters containing the invoice ID
 * @returns {Promise<NextResponse>} The response containing the invoice or an error
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a specific invoice
 * @param {NextRequest} req - The request object containing the updated invoice data
 * @param {Params} params - The route parameters containing the invoice ID
 * @returns {Promise<NextResponse>} The response containing the updated invoice or an error
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const body = await req.json();

    // Validate the request body against the schema
    const result = InvoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid invoice data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Update the invoice
    const updatedInvoice = await updateInvoice(id, body);
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a specific invoice
 * @param {NextRequest} req - The request object
 * @param {Params} params - The route parameters containing the invoice ID
 * @returns {Promise<NextResponse>} The response indicating success or an error
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Delete the invoice
    await deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for duplicating a specific invoice
 * @param {NextRequest} req - The request object
 * @param {Params} params - The route parameters containing the invoice ID
 * @returns {Promise<NextResponse>} The response containing the duplicated invoice or an error
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const action = req.nextUrl.searchParams.get("action");

    // Only handle the duplicate action
    if (action !== "duplicate") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Duplicate the invoice
    const duplicatedInvoice = await duplicateInvoice(id);
    return NextResponse.json(duplicatedInvoice, { status: 201 });
  } catch (error) {
    console.error("Error duplicating invoice:", error);
    return NextResponse.json(
      { error: "Failed to duplicate invoice" },
      { status: 500 }
    );
  }
} 