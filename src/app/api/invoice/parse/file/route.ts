import { NextRequest, NextResponse } from 'next/server';
import { parseInvoiceFromImage, parseInvoiceFromText } from '@/lib/services/openai';
import { processFileBuffer } from '@/lib/services/document-processing';

// Set max file size to 1MB
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '1mb',
  },
};

export async function POST(request: NextRequest) {
  // Skip actual processing during build time
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    console.log('Skipping invoice parsing during build time');
    return NextResponse.json({ invoice: {} });
  }

  try {
    // Authentication is not required for parsing

    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Check file size (1MB max)
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 1MB limit' }, { status: 400 });
    }

    // Check file type
    const mimeType = file.type;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Only PDF and image files (JPEG, PNG, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process the file to get text or base64 image data
    const { text, base64Image } = await processFileBuffer(buffer, mimeType);

    // Parse the invoice using the appropriate method
    let invoiceData;
    if (base64Image) {
      // For images, use Vision API
      invoiceData = await parseInvoiceFromImage(base64Image);
    } else if (text) {
      // For PDFs with extracted text, use text completion
      invoiceData = await parseInvoiceFromText(text);
    } else {
      return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }

    return NextResponse.json({ invoice: invoiceData });
  } catch (error) {
    console.error('Error parsing invoice file:', error);
    return NextResponse.json({ error: 'Failed to parse invoice file' }, { status: 500 });
  }
}
