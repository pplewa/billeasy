import { NextRequest, NextResponse } from "next/server";

// Helpers
import { getInvoiceTemplate } from "@/lib/helpers";

// Variables
import { ENV } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

/**
 * Generate a PDF document of an invoice based on the provided data.
 *
 * @async
 * @param {NextRequest} req - The Next.js request object.
 * @throws {Error} If there is an error during the PDF generation process.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the generated PDF.
 */
export async function generatePdfService(req: NextRequest) {
    try {
        const body: InvoiceType = await req.json();

        const ReactDOMServer = (await import("react-dom/server")).default;

        // Get the selected invoice template
        const templateId = body.details?.pdfTemplate || 1; // Default to template 1 if undefined
        const InvoiceTemplate = await getInvoiceTemplate(templateId);

        if (!InvoiceTemplate) {
            throw new Error(`Template with ID ${templateId} not found`);
        }

        // Generate HTML content from the React component
        const htmlContent = ReactDOMServer.renderToStaticMarkup(
            InvoiceTemplate(body)
        );

        // Add HTML wrapper with styles
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice ${body.details?.invoiceNumber || ''}</title>
                <style>
                    body {
                        font-family: 'Helvetica', 'Arial', sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    @media print {
                        html, body {
                            width: 210mm;
                            height: 297mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        // Launch the browser in production or development mode depending on the environment
        if (ENV === "production") {
            // For production, we would use a serverless solution or a PDF API
            // This is a simplified implementation using Puppeteer
            const puppeteer = await import('puppeteer');
            
            // Launch a headless browser
            const browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            try {
                // Create a new page
                const page = await browser.newPage();
                
                // Set content to our HTML
                await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
                
                // Generate PDF
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
                });
                
                // Close the browser
                await browser.close();
                
                // Return the PDF
                return new NextResponse(pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="invoice-${body.details?.invoiceNumber || 'download'}.pdf"`
                    }
                });
            } catch (error) {
                // Make sure to close the browser in case of error
                await browser.close();
                throw error;
            }
        } else {
            // For development, we use the same approach but with more detailed logging
            console.log('Generating PDF in development mode');
            
            const puppeteer = await import('puppeteer');
            
            // Launch a headless browser with more verbose options for development
            const browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                // Uncomment for debugging if needed
                // devtools: true,
            });
            
            try {
                // Create a new page
                const page = await browser.newPage();
                
                // Enable console logging from the browser
                page.on('console', (msg) => console.log('Browser console:', msg.text()));
                
                // Set content to our HTML
                await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
                
                console.log('HTML content loaded in browser');
                
                // Generate PDF
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
                });
                
                console.log('PDF generated successfully');
                
                // Close the browser
                await browser.close();
                
                // Return the PDF
                return new NextResponse(pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="invoice-${body.details?.invoiceNumber || 'download'}.pdf"`
                    }
                });
            } catch (error) {
                // Make sure to close the browser in case of error
                await browser.close();
                console.error('Error in PDF generation:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error(error);

        // Return an error response
        return new NextResponse(`Error generating PDF: \n${error}`, {
            status: 500,
        });
    }
}