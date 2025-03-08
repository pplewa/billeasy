import { NextRequest } from 'next/server';
import { exportInvoiceService } from '@/services/invoice/server/exportInvoiceService';

/**
 * POST handler for exporting an invoice in the requested format
 * @param {NextRequest} req - The request object containing the invoice data and format
 * @returns {Promise<Response>} The response containing the exported invoice
 */
export async function POST(req: NextRequest) {
  return exportInvoiceService(req);
}
