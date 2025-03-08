import sharp from 'sharp';
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param buffer PDF file buffer
 * @returns Extracted text
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Skip during build time
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    console.log('Skipping PDF extraction during build time');
    return 'Mock PDF content for build';
  }

  try {
    // Parse PDF using pdf-parse
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Convert an image buffer to base64 string
 * @param buffer Image buffer
 * @returns Base64 string
 */
export async function imageToBase64(buffer: Buffer): Promise<string> {
  try {
    // Optimize image using sharp
    const optimizedBuffer = await sharp(buffer).resize(1200, null, { fit: 'inside' }).toBuffer();

    // Convert to base64
    return optimizedBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Process a file buffer based on its MIME type
 * @param buffer File buffer
 * @param mimeType MIME type of the file
 * @returns Object containing either text or base64 image
 */
export async function processFileBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ text?: string; base64Image?: string }> {
  try {
    // Handle different file types
    if (mimeType === 'application/pdf') {
      // Extract text from PDF
      const text = await extractTextFromPDF(buffer);
      return { text };
    } else if (mimeType.startsWith('image/')) {
      // Convert image to base64
      const base64Image = await imageToBase64(buffer);
      return { base64Image };
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error processing file buffer:', error);
    throw error;
  }
}
