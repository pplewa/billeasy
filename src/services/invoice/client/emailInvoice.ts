import { InvoiceType } from '@/types';

interface EmailInvoiceParams {
  invoice: InvoiceType;
  recipient: string;
  subject: string;
  message: string;
}

/**
 * Sends an invoice email to the specified recipient
 * @param params Email parameters including invoice data, recipient, subject and message
 * @returns Promise that resolves when the email is sent
 */
export async function sendInvoiceEmail(params: EmailInvoiceParams): Promise<void> {
  const { invoice, recipient, subject, message } = params;

  try {
    // Prepare request body
    const requestBody = {
      invoice,
      recipient,
      subject,
      message,
    };

    // Send POST request to email API endpoint
    const response = await fetch('/api/invoice/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    // Return successfully
    return;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}
