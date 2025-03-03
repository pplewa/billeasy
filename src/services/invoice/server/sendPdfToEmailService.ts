import { NextRequest } from "next/server";

// Helpers
import { fileToBuffer } from "@/lib/helpers";

/**
 * Send a PDF as an email attachment.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean, indicating whether the email was sent successfully.
 * @throws {Error} Throws an error if there is an issue with sending the email.
 */
export async function sendPdfToEmailService(
    req: NextRequest
): Promise<boolean> {
    const fd = await req.formData();

    // Get form data values
    const email = fd.get("email") as string;
    const invoicePdf = fd.get("invoicePdf") as File;
    const invoiceNumber = fd.get("invoiceNumber") as string;

    // Convert file to buffer
    const invoiceBuffer = await fileToBuffer(invoicePdf);

    try {
        // In a real implementation, we would use Nodemailer to send the email
        // This is a placeholder implementation
        console.log(`Sending invoice #${invoiceNumber} to ${email}`);
        console.log(`Invoice buffer size: ${invoiceBuffer.length} bytes`);
        
        // Simulate successful email sending
        return true;
    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
} 