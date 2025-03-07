import { NextRequest, NextResponse } from "next/server";
import { InvoiceSchema } from "@/lib/schemas-optional";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
} from "@/services/invoice/server/invoiceService";

/**
 * GET handler for fetching a specific invoice by ID
 * @param {NextRequest} req - The request object
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the invoice or an error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the updated invoice or an error
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Transform any legacy format items to new format
    if (body.details?.items?.length) {
      console.log("[API] Transforming legacy item formats");
      body.details.items = body.details.items.map((item: { 
        discount?: number | { amount: number; amountType: string } | null;
        taxRate?: number | null;
        tax?: { amount: number; amountType: string } | null;
        [key: string]: unknown; 
      }) => {
        console.log(`[API] Processing item: ${JSON.stringify(item)}`);
        
        // Convert legacy number discount to object format
        if (typeof item.discount === 'number') {
          console.log(`[API] Converting legacy discount: ${item.discount} to object format`);
          item.discount = {
            amount: item.discount,
            amountType: 'fixed'
          };
        } else if (item.discount === null || item.discount === undefined) {
          // Set default discount object for null/undefined values
          item.discount = {
            amount: 0,
            amountType: 'fixed'
          };
        }
        
        // Convert legacy taxRate to tax object format
        if (typeof item.taxRate === 'number') {
          console.log(`[API] Converting legacy taxRate: ${item.taxRate} to tax object`);
          item.tax = {
            amount: item.taxRate,
            amountType: 'percentage'
          };
          // Keep taxRate for backward compatibility
        } else if (item.tax === null || item.tax === undefined) {
          // Set default tax object if not present
          console.log(`[API] Setting default tax object`);
          item.tax = {
            amount: 0,
            amountType: 'percentage'
          };
        } else if (item.tax) {
          // Ensure the tax object has proper amount and amountType
          console.log(`[API] Ensuring tax object has proper fields`);
          item.tax = {
            amount: typeof item.tax.amount === 'number' ? item.tax.amount : 0,
            amountType: item.tax.amountType || 'percentage'
          };
        }
        
        console.log(`[API] Transformed item: ${JSON.stringify(item)}`);
        return item;
      });
    }

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
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response indicating success or an error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the duplicated invoice or an error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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