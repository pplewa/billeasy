import { NextRequest, NextResponse } from "next/server";
import { createInvoice, getAllInvoices } from "@/services/invoice/server/invoiceService";
import { InvoiceSchema } from "@/lib/schemas-optional";

/**
 * GET handler for fetching all invoices with pagination and filtering
 * @returns {Promise<NextResponse>} The response containing filtered invoices or an error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // Fetch invoices with pagination and filters
    const result = await getAllInvoices({
      page,
      limit,
      status,
      search,
    });

    return NextResponse.json(result);
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
 * @param {NextRequest} request - The request containing the invoice data to create
 * @returns {Promise<NextResponse>} The response containing the created invoice or an error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API] Received invoice:", JSON.stringify(body));

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

    // Validate the invoice data
    const validatedData = InvoiceSchema.safeParse(body);
    if (!validatedData.success) {
      console.error("[API] Validation error:", validatedData.error);
      return NextResponse.json(
        {
          error: "Invalid invoice data",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Continue with invoice creation
    const newInvoice = await createInvoice(body);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
} 