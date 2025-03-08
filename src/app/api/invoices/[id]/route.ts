import { NextRequest, NextResponse } from 'next/server';
import { InvoiceSchema } from '@/lib/schemas-optional';
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
} from '@/services/invoice/server/invoiceService';

/**
 * GET handler for fetching a specific invoice by ID
 * @param {NextRequest} req - The request object
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the invoice or an error
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

/**
 * PUT handler for updating a specific invoice
 * @param {NextRequest} req - The request object containing the updated invoice data
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the updated invoice or an error
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Define proper types for invoice items
    interface InvoiceItem {
      id?: string;
      name?: string;
      description?: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
      tax?: {
        amount: number;
        amountType: string;
      };
      taxRate?: number; // For backwards compatibility
      discount?:
        | {
            amount: number;
            amountType: string;
          }
        | number; // Can be either object or number
    }

    // CRITICAL: Log the received data before any processing
    console.log(
      'API received update with tax data:',
      body.details?.items?.map((item: InvoiceItem) => ({
        name: item.name,
        tax: item.tax,
        taxRate: item.taxRate,
      }))
    );

    // ⚠️ ISSUE: The tax amount is being lost here - let's fix this

    // FIX: Preserve tax values explicitly during update
    if (body.details?.items) {
      // Process each item to ensure tax data is preserved
      body.details.items = body.details.items.map((item: InvoiceItem) => {
        // If no tax object exists but taxRate does, create it
        if (!item.tax && item.taxRate) {
          item.tax = {
            amount: item.taxRate,
            amountType: 'percentage',
          };
        }

        // If tax object exists, ensure values are explicitly converted to numbers
        if (item.tax) {
          // Convert amount to number and ensure it's not reset
          if (item.tax.amount !== undefined) {
            item.tax.amount = Number(item.tax.amount);
          }

          // Ensure amountType exists
          if (!item.tax.amountType) {
            item.tax.amountType = 'percentage';
          }

          // Sync taxRate with tax.amount when using percentage
          if (item.tax.amountType === 'percentage') {
            item.taxRate = item.tax.amount;
          }
        }

        return item;
      });
    }

    // Log the data after our fixes to verify it's correct
    console.log(
      'Processed data before saving:',
      body.details?.items?.map((item: InvoiceItem) => ({
        name: item.name,
        tax: item.tax,
        taxRate: item.taxRate,
      }))
    );

    // Validate the request body against the schema
    const result = InvoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: result.error.format() },
        { status: 400 }
      );
    }

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update the invoice
    const updatedInvoice = await updateInvoice(id, body);
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

/**
 * DELETE handler for deleting a specific invoice
 * @param {NextRequest} req - The request object
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response indicating success or an error
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete the invoice
    await deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

/**
 * POST handler for duplicating a specific invoice
 * @param {NextRequest} req - The request object
 * @param {Object} context - The context object containing the route parameters
 * @returns {Promise<NextResponse>} The response containing the duplicated invoice or an error
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const action = req.nextUrl.searchParams.get('action');

    // Only handle the duplicate action
    if (action !== 'duplicate') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if the invoice exists
    const existingInvoice = await getInvoiceById(id);
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Duplicate the invoice
    const duplicatedInvoice = await duplicateInvoice(id);
    return NextResponse.json(duplicatedInvoice, { status: 201 });
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    return NextResponse.json({ error: 'Failed to duplicate invoice' }, { status: 500 });
  }
}
