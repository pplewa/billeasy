import { NextRequest, NextResponse } from 'next/server';
import { parseInvoiceFromText } from '@/lib/services/openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
};

export async function POST(request: NextRequest) {
  // Skip actual processing during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping invoice text parsing during build time');
    return NextResponse.json({ invoice: {} });
  }
  
  try {
    // Authentication is not required for parsing
    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Parse the invoice text
    const invoiceData = await parseInvoiceFromText(text);

    return NextResponse.json({ invoice: invoiceData });
  } catch (error) {
    console.error('Error parsing invoice text:', error);
    return NextResponse.json(
      { error: 'Failed to parse invoice text' },
      { status: 500 }
    );
  }
} 