import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { InvoiceType } from '@/types';
import { getInvoiceTemplate } from '@/lib/utils/file';

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
      return NextResponse.json({ 
        message: 'Failed to process invoice or send email', 
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
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
    const template = await InvoiceTemplate(invoice);
    const htmlContent = ReactDOMServer.renderToStaticMarkup(template);
    
    // Add HTML wrapper with styles - same as export functionality
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.details?.invoiceNumber || ''}</title>
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
                  margin: 1cm;
              }
              
              table {
                  width: 100%;
                  border-collapse: collapse;
              }
              
              th, td {
                  border: 1px solid #e2e8f0;
                  padding: 8px;
                  text-align: left;
              }
              
              th {
                  background-color: #f8fafc;
                  font-weight: 600;
              }
              
              .rounded-xl {
                  border-radius: 0.75rem;
              }
              
              .border {
                  border: 1px solid #e2e8f0;
              }
              
              .border-t {
                  border-top: 1px solid #e2e8f0;
              }
              
              .border-gray-200 {
                  border-color: #e2e8f0;
              }
              
              .p-4 {
                  padding: 1rem;
              }
              
              .py-2 {
                  padding-top: 0.5rem;
                  padding-bottom: 0.5rem;
              }
              
              .px-2 {
                  padding-left: 0.5rem;
                  padding-right: 0.5rem;
              }
              
              .mt-8 {
                  margin-top: 2rem;
              }
              
              .text-right {
                  text-align: right;
              }
              
              .text-center {
                  text-align: center;
              }
              
              .font-medium {
                  font-weight: 500;
              }
              
              .font-semibold {
                  font-weight: 600;
              }
              
              .text-gray-800 {
                  color: #1f2937;
              }
              
              .text-gray-600 {
                  color: #4b5563;
              }
              
              .text-gray-500 {
                  color: #6b7280;
              }
              
              .text-xs {
                  font-size: 0.75rem;
              }
              
              .text-lg {
                  font-size: 1.125rem;
              }
              
              .text-xl {
                  font-size: 1.25rem;
              }
              
              .text-2xl {
                  font-size: 1.5rem;
              }
              
              .uppercase {
                  text-transform: uppercase;
              }
              
              .whitespace-pre-line {
                  white-space: pre-line;
              }
              
              .flex {
                  display: flex;
              }
              
              .justify-end {
                  justify-content: flex-end;
              }
              
              .justify-between {
                  justify-content: space-between;
              }
              
              .items-end {
                  align-items: flex-end;
              }
              
              .flex-col {
                  flex-direction: column;
              }
              
              .w-full {
                  width: 100%;
              }
              
              .object-contain {
                  object-fit: contain;
              }
              
              @media (min-width: 640px) {
                  .sm\\:p-10 {
                      padding: 2.5rem;
                  }
                  
                  .sm\\:w-1\\/2 {
                      width: 50%;
                  }
                  
                  .sm\\:grid-cols-2 {
                      grid-template-columns: repeat(2, minmax(0, 1fr));
                  }
                  
                  .sm\\:text-right {
                      text-align: right;
                  }
              }
              
              @media (min-width: 1024px) {
                  .lg\\:w-1\\/3 {
                      width: 33.333333%;
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
