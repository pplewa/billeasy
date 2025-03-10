import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { InvoiceType } from '@/types';
import { getInvoiceTemplate } from '@/lib/utils/file';
import { normalizeInvoice } from '@/lib/invoice-adapter';

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

export async function POST(request: Request) {
  try {
    // Check if user is authenticated using our custom auth system
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { invoice, recipient, subject, message } = body;

    // Validate required fields
    if (!invoice || !recipient || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    try {
      // Generate invoice PDF using the same functionality as the export feature
      const invoiceNumber = invoice.details?.invoiceNumber || 'unknown';
      const pdfBuffer = await generateDetailedInvoicePdf(invoice);

      if (!pdfBuffer) {
        return NextResponse.json({ message: 'Failed to generate invoice PDF' }, { status: 500 });
      }

      // Create a simple email template without using React components or hooks
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice #${invoiceNumber}</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f7f7f7;
              color: #333333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo {
              max-width: 200px;
              height: auto;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .heading {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #222222;
            }
            .message {
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #777777;
            }
            hr {
              border: none;
              border-top: 1px solid #e1e1e1;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://billeasy.com/assets/img/logo.png" alt="BillEasy Logo" class="logo">
            </div>
            <div class="content">
              <div class="heading">Thanks for using BillEasy!</div>
              <div class="message">
                <p>We're pleased to inform you that your invoice #${invoiceNumber} is ready for download. Please find the attached PDF document.</p>
                <p>${message}</p>
              </div>
              <hr>
              <p>Best Regards,<br>BillEasy Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BillEasy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Prepare email with PDF attachment
      const mailOptions: SendMailOptions = {
        from: `BillEasy <${EMAIL_FROM}>`,
        to: recipient,
        subject: subject,
        html: emailHTML,
        text: `
Thanks for using BillEasy!

We're pleased to inform you that your invoice #${invoiceNumber} is ready for download. Please find the attached PDF document.

${message}

Best Regards,
BillEasy Team
`,
        attachments: [
          {
            filename: `invoice-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      // Return success response
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error in email sending process:', error);
      return NextResponse.json(
        {
          message: 'Failed to process invoice or send email',
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

/**
 * Generate a detailed PDF document from the invoice data using the same approach as the export feature
 *
 * @param invoice - The invoice data
 * @returns A Buffer containing the PDF data, or null if generation fails
 */
async function generateDetailedInvoicePdf(invoice: InvoiceType): Promise<Buffer | null> {
  try {
    // Import necessary modules
    const puppeteer = await import('puppeteer');
    const ReactDOMServer = (await import('react-dom/server')).default;

    // Get the selected invoice template - same approach as export functionality
    const templateId = invoice.details?.pdfTemplate || 1;
    const InvoiceTemplate = await getInvoiceTemplate(templateId);

    if (!InvoiceTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Generate HTML content from the React component
    const template = await InvoiceTemplate(normalizeInvoice(invoice) as Record<string, unknown>);
    const htmlContent = ReactDOMServer.renderToStaticMarkup(template);

    // Add HTML wrapper with styles - same as export functionality
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.details?.invoiceNumber || ''}</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
              @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Pacifico&family=Satisfy&family=Caveat&family=Homemade+Apple&display=swap');
             
              body {
                  font-family: 'Outfit', 'Helvetica', 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  color: #333;
                  line-height: 1.5;
              }
              
              @page {
                  size: A4;
                  margin: 0;
              }
                
              @media print{
                * {
                  -webkit-box-shadow: none;
                  -moz-box-shadow:    none;
                  box-shadow:         none; 
                }
              }
          </style>
      </head>
      <body>
          ${htmlContent}
      </body>
      </html>
    `;

    // Launch a headless browser - same approach as export functionality
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      // Create a new page
      const page = await browser.newPage();

      // Set content to our HTML
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      // Generate PDF with the same settings as export functionality
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        scale: 1,
        timeout: 60000, // 60 seconds timeout
      });

      // Close the browser
      await browser.close();

      // Return the PDF buffer
      return Buffer.from(pdfBuffer);
    } catch (error) {
      // Make sure to close the browser in case of error
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('Error generating detailed invoice PDF:', error);
    return null;
  }
}
