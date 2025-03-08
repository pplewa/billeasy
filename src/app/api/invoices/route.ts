import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, getAllInvoices } from '@/services/invoice/server/invoiceService';
import { InvoiceSchema } from '@/lib/schemas-optional';

/**
 * GET handler for fetching all invoices with pagination and filtering
 * @returns {Promise<NextResponse>} The response containing filtered invoices or an error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Fetch invoices with pagination and filters
    const result = await getAllInvoices({
      page,
      limit,
      status,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
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

    // Transform any legacy format items to new format
    if (body.details?.items?.length) {
      body.details.items = body.details.items.map(
        (item: {
          discount?: number | { amount: number; amountType: string } | null;
          taxRate?: number | null;
          tax?: { amount: number; amountType: string } | null;
          [key: string]: unknown;
        }) => {
          // Convert legacy number discount to object format
          if (typeof item.discount === 'number') {
            item.discount = {
              amount: item.discount,
              amountType: 'percentage',
            };
          }

          // If no discount, set empty object with default values
          if (!item.discount) {
            item.discount = {
              amount: 0,
              amountType: 'percentage',
            };
          }

          // Convert legacy taxRate to tax object
          if (typeof item.taxRate === 'number') {
            item.tax = {
              amount: item.taxRate,
              amountType: 'percentage',
            };
          }

          // If no tax, set empty object with default values
          if (!item.tax) {
            item.tax = {
              amount: 0,
              amountType: 'percentage',
            };
          }

          // Ensure tax object has all required fields
          if (item.tax && typeof item.tax === 'object') {
            item.tax = {
              amount: item.tax.amount || 0,
              amountType: item.tax.amountType || 'percentage',
            };
          }

          return item;
        }
      );
    }

    // Validate the invoice data
    const validatedData = InvoiceSchema.safeParse(body);
    if (!validatedData.success) {
      console.error('[API] Validation error:', validatedData.error);
      return NextResponse.json(
        {
          error: 'Invalid invoice data',
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Continue with invoice creation
    const newInvoice = await createInvoice(body);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
