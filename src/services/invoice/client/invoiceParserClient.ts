import { InvoiceType } from "@/types";

/**
 * Parse invoice data from natural language text
 * @param text Natural language text describing the invoice
 * @returns Object containing the parsed invoice data
 */
export async function parseInvoiceText(text: string): Promise<{ invoice: Partial<InvoiceType> }> {
  const response = await fetch('/api/invoice/parse/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse invoice text');
  }

  return response.json();
}

/**
 * Parse invoice data from a file (PDF or image)
 * @param file File object (PDF or image)
 * @returns Object containing the parsed invoice data
 */
export async function parseInvoiceFile(file: File): Promise<{ invoice: Partial<InvoiceType> }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/invoice/parse/file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse invoice file');
  }

  return response.json();
} 