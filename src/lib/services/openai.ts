import OpenAI from 'openai';
import { InvoiceType } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parses invoice data from natural language text using OpenAI
 * @param text Natural language description of an invoice
 * @returns Parsed invoice data
 */
export async function parseInvoiceFromText(text: string): Promise<Partial<InvoiceType>> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts invoice information from natural language text.
Extract as much relevant invoice data as possible, but only include fields you are confident about.
Return a valid JSON object that conforms to the following invoice structure:

{
  "sender": {
    "name": "string",
    "address": "string",
    "zipCode": "string",
    "city": "string",
    "country": "string",
    "email": "string",
    "phone": "string"
  },
  "receiver": {
    "name": "string",
    "address": "string",
    "zipCode": "string",
    "city": "string",
    "country": "string",
    "email": "string",
    "phone": "string"
  },
  "details": {
    "invoiceNumber": "string",
    "invoiceDate": "ISO date string",
    "dueDate": "ISO date string",
    "currency": "string",
    "language": "string",
    "subTotal": number,
    "totalAmount": number,
    "totalAmountInWords": "string",
    "additionalNotes": "string",
    "paymentTerms": "string",
    "items": [
      {
        "id": "string uuid",
        "name": "string",
        "description": "string",
        "quantity": number,
        "unitPrice": number,
        "total": number,
        "taxRate": number,
        "discount": number
      }
    ]
  }
}

For each item, ALWAYS include:
- id: Generate a random UUID for each item
- name: Item name or description
- description: Additional details about the item
- quantity: The number of items (default to 1 if unclear)
- unitPrice: The price per unit (default to 0 if unclear)
- total: quantity * unitPrice
- taxRate: The tax rate (default to 0 if unclear)
- discount: The discount (default to 0 if unclear)

Only include fields where you have information. If you're uncertain about any field, omit it entirely.
For dates, use ISO format (YYYY-MM-DD). If no date is specified, DO NOT include the field.
For numeric fields, use numbers without currency symbols. If a price is given per unit, calculate total = quantity * unitPrice.
Generate a random UUID for each item id. If no specific invoice number is provided, DO NOT include it.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const resultContent = response.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(resultContent) as Partial<InvoiceType>;

    return parsedData;
  } catch (error) {
    console.error('Error parsing invoice with OpenAI:', error);
    throw new Error('Failed to parse invoice data');
  }
}

/**
 * Parses invoice data from an image using OpenAI Vision
 * @param base64Image Base64 encoded image data
 * @returns Parsed invoice data
 */
export async function parseInvoiceFromImage(base64Image: string): Promise<Partial<InvoiceType>> {
  try {
    // Determine the image format - default to PNG if unsure
    const imageFormat = base64Image.startsWith('/9j/') ? 'jpeg' : 'png';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts invoice information from images.
Extract as much relevant invoice data as possible, but only include fields you are confident about.
Return a valid JSON object that conforms to the following invoice structure:

{
  "sender": {
    "name": "string",
    "address": "string",
    "zipCode": "string",
    "city": "string",
    "country": "string",
    "email": "string",
    "phone": "string"
  },
  "receiver": {
    "name": "string",
    "address": "string",
    "zipCode": "string",
    "city": "string",
    "country": "string",
    "email": "string",
    "phone": "string"
  },
  "details": {
    "invoiceNumber": "string",
    "invoiceDate": "ISO date string",
    "dueDate": "ISO date string",
    "currency": "string",
    "language": "string",
    "subTotal": number,
    "totalAmount": number,
    "totalAmountInWords": "string",
    "additionalNotes": "string",
    "paymentTerms": "string",
    "items": [
      {
        "id": "string uuid",
        "name": "string",
        "description": "string",
        "quantity": number,
        "unitPrice": number,
        "total": number,
        "taxRate": number,
        "discount": number
      }
    ]
  }
}

For each item, ALWAYS include:
- id: Generate a random UUID for each item
- name: Item name or description
- description: Additional details about the item
- quantity: The number of items (default to 1 if unclear)
- unitPrice: The price per unit (default to 0 if unclear)
- total: quantity * unitPrice
- taxRate: The tax rate (default to 0 if unclear)
- discount: The discount (default to 0 if unclear)

Only include fields where you have information. If you're uncertain about any field, omit it entirely.
For dates, use ISO format (YYYY-MM-DD). If no date is specified, DO NOT include the field.
For numeric fields, use numbers without currency symbols. If a price is given per unit, calculate total = quantity * unitPrice.
Generate a random UUID for each item id. If no specific invoice number is provided, DO NOT include it.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all invoice information from this image:' },
            {
              type: 'image_url',
              image_url: { url: `data:image/${imageFormat};base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const resultContent = response.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(resultContent) as Partial<InvoiceType>;

    return parsedData;
  } catch (error) {
    console.error('Error parsing invoice image with OpenAI:', error);
    throw new Error('Failed to parse invoice data from image');
  }
}
