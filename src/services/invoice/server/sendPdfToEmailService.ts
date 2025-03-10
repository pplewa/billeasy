import { NextRequest } from 'next/server';

// Helpers
import { fileToBuffer } from '@/lib/utils/file';

// Nodemailer
import nodemailer, { SendMailOptions } from 'nodemailer';

// React-email
import { render } from '@react-email/render';

// Components
import SendPdfEmail from '@/app/components/templates/email/SendPdfEmail';

// Get email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@billeasy.online';

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send a PDF as an email attachment.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean, indicating whether the email was sent successfully.
 * @throws {Error} Throws an error if there is an issue with sending the email.
 */
export async function sendPdfToEmailService(req: NextRequest): Promise<boolean> {
  try {
    const fd = await req.formData();

    // Get form data values
    const email = fd.get('email') as string;
    const invoicePdf = fd.get('invoicePdf') as File;
    const invoiceNumber = fd.get('invoiceNumber') as string;

    // Get email html content - first await the component, then render it
    const EmailComponent = await SendPdfEmail({ invoiceNumber });
    const emailHTML = await render(EmailComponent);

    // Convert file to buffer
    const invoiceBuffer = await fileToBuffer(invoicePdf);

    const mailOptions: SendMailOptions = {
      from: `BillEasy <${EMAIL_FROM}>`,
      to: email,
      subject: `Invoice Ready: #${invoiceNumber}`,
      html: emailHTML,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: invoiceBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email', error);
    return false;
  }
}
