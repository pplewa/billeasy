import { NextRequest, NextResponse } from "next/server";
import {
  getInvoiceById,
  duplicateInvoice,
} from "@/services/invoice/server/invoiceService";
import { getCurrentUser } from "@/lib/auth/auth";

// POST /api/invoices/[id]/duplicate - Duplicate an invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const invoice = await getInvoiceById(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }
    
    // Check if the invoice belongs to the user
    if (invoice.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const duplicatedInvoice = await duplicateInvoice(params.id, user.id);
    
    if (!duplicatedInvoice) {
      return NextResponse.json(
        { error: "Failed to duplicate invoice" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(duplicatedInvoice, { status: 201 });
  } catch (error) {
    console.error("Error duplicating invoice:", error);
    return NextResponse.json(
      { error: "Failed to duplicate invoice" },
      { status: 500 }
    );
  }
} 