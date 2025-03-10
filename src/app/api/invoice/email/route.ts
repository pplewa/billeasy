import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { InvoiceType } from '@/types';
import { getInvoiceTemplate } from '@/lib/utils/file';
import { normalizeInvoice } from '@/lib/invoice-adapter';
import { render } from '@react-email/render';
import SendPdfEmailComponent from '@/app/components/templates/email/SendPdfEmail';
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/i18n/routing';

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
    const { invoice, recipient, subject, message: customMessage, locale = 'en' } = body;

    // Validate required fields
    if (!invoice || !recipient || !subject || !customMessage) {
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
      const pdfBuffer = await generateDetailedInvoicePdf(invoice, locale);

      if (!pdfBuffer) {
        return NextResponse.json({ message: 'Failed to generate invoice PDF' }, { status: 500 });
      }

      // Validate locale is one of the supported locales
      const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'];
      const validLocale = supportedLocales.includes(locale as Locale) ? (locale as Locale) : 'en';

      // Get translations for the email template
      const t = await getTranslations({
        locale: validLocale,
        namespace: 'emailTemplate.sendPdfEmail',
      });

      // Render the email template
      const SendPdfEmail = await SendPdfEmailComponent({
        invoiceNumber,
        customMessage,
        locale: validLocale,
      });
      const emailHtml = await render(SendPdfEmail);

      // Prepare email with PDF attachment
      const mailOptions: SendMailOptions = {
        from: `BillEasy <${EMAIL_FROM}>`,
        to: recipient,
        subject: subject,
        html: emailHtml,
        text: `
${t('preview', { invoiceNumber })}

${t('body', { invoiceNumber: `#${invoiceNumber}` })}

${customMessage}

${t('signature')}
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
      return NextResponse.json(
        {
          message: 'Email sent successfully',
          locale: validLocale,
        },
        { status: 200 }
      );
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
 * @param locale - The locale to use for translations (optional, defaults to 'en')
 * @returns A Buffer containing the PDF data, or null if generation fails
 */
async function generateDetailedInvoicePdf(
  invoice: InvoiceType,
  locale: Locale = 'en'
): Promise<Buffer | null> {
  try {
    // Import necessary modules
    const puppeteer = await import('puppeteer');
    const ReactDOMServer = (await import('react-dom/server')).default;

    // Get the selected invoice template - same approach as export functionality
    const templateId = invoice.details?.pdfTemplate || 1;
    const InvoiceTemplate = await getInvoiceTemplate(templateId, locale);

    if (!InvoiceTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Generate HTML content from the React component
    const template = await InvoiceTemplate(normalizeInvoice(invoice) as Record<string, unknown>);
    const htmlContent = ReactDOMServer.renderToStaticMarkup(template);

    // Add HTML wrapper with styles - same as export functionality
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="${locale}">
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
