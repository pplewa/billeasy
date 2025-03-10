import { NextRequest, NextResponse } from 'next/server';

// Helpers
import { flattenObject } from '@/lib/utils/object';
import { getInvoiceTemplate } from '@/lib/utils/file';

// Types
import { ExportTypes } from '@/types';

/**
 * Convert an object to XML string
 *
 * @param {Record<string, unknown>} obj - The object to convert to XML
 * @param {string} rootName - The name of the root element
 * @returns {string} The XML string representation of the object
 */
function objectToXml(obj: Record<string, unknown>, rootName: string = 'root'): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value === null || value === undefined) {
        xml += `<${key}></${key}>`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        xml += objectToXml(value as Record<string, unknown>, key);
      } else if (Array.isArray(value)) {
        xml += `<${key}>`;
        for (const item of value) {
          if (typeof item === 'object') {
            xml += objectToXml(item as Record<string, unknown>, 'item');
          } else {
            xml += `<item>${item}</item>`;
          }
        }
        xml += `</${key}>`;
      } else {
        xml += `<${key}>${value}</${key}>`;
      }
    }
  }

  xml += `</${rootName}>`;
  return xml;
}

/**
 * Export an invoice in selected format.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} A response object containing the exported data in the requested format.
 */
export async function exportInvoiceService(req: NextRequest) {
  try {
    const body = await req.json();
    const format = req.nextUrl.searchParams.get('format');

    switch (format) {
      case ExportTypes.JSON:
        const jsonData = JSON.stringify(body);
        return new NextResponse(jsonData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=invoice.json',
          },
          status: 200,
        });
      case ExportTypes.CSV:
        // For CSV export, we use a simple conversion
        const csvFlattenedData = flattenObject(body);
        const headers = Object.keys(csvFlattenedData).join(',');
        const values = Object.values(csvFlattenedData)
          .map((value) => (typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value))
          .join(',');
        const csv = `${headers}\n${values}`;

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=invoice.csv',
          },
        });
      case ExportTypes.XML:
        // Convert the invoice data to XML format
        const xmlData = objectToXml(body, 'invoice');

        return new NextResponse(xmlData, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename=invoice.xml',
          },
        });
      case ExportTypes.XLSX:
        // For XLSX export, we use the xlsx library
        const XLSX = await import('xlsx');

        // Flatten the invoice data for Excel format
        const xlsxFlattenedData = flattenObject(body);

        // Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet([xlsxFlattenedData]);

        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');

        // Generate XLSX file
        const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(xlsxBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=invoice.xlsx',
          },
        });
      case ExportTypes.PDF:
        try {
          // For PDF export, we use puppeteer directly here
          const puppeteer = await import('puppeteer');

          // Get the selected invoice template
          const templateId = body.details?.pdfTemplate || 1;
          const InvoiceTemplate = await getInvoiceTemplate(templateId);

          if (!InvoiceTemplate) {
            throw new Error(`Template with ID ${templateId} not found`);
          }

          // Generate HTML content
          const ReactDOMServer = (await import('react-dom/server')).default;
          const template = await InvoiceTemplate(body);
          const htmlContent = ReactDOMServer.renderToStaticMarkup(template);

          // Add HTML wrapper with styles
          const fullHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Invoice ${body.details?.invoiceNumber || ''}</title>
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

          try {
            console.log('Launching Puppeteer for PDF export');

            // Launch a headless browser without specifying executablePath
            const browser = await puppeteer.default.launch({
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
                margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
                preferCSSPageSize: true,
                displayHeaderFooter: false,
                scale: 1,
                timeout: 60000, // 60 seconds timeout
              });

              // Close the browser
              await browser.close();

              // Return the PDF
              return new NextResponse(pdfBuffer, {
                headers: {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': `attachment; filename="invoice-${body.details?.invoiceNumber || 'download'}.pdf"`,
                },
              });
            } catch (error) {
              // Make sure to close the browser in case of error
              await browser.close();
              throw error;
            }
          } catch (error: unknown) {
            console.error('Error launching browser:', error);
            return new NextResponse(
              `Error launching browser: ${error instanceof Error ? error.message : String(error)}`,
              {
                status: 500,
              }
            );
          }
        } catch (error: unknown) {
          console.error('Error generating PDF:', error);
          return new NextResponse(
            `Error generating PDF: ${error instanceof Error ? error.message : String(error)}`,
            {
              status: 500,
            }
          );
        }
      default:
        return new NextResponse(JSON.stringify({ message: 'Unsupported export format' }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 400,
        });
    }
  } catch (error: unknown) {
    console.error('Error exporting invoice:', error);

    // Return an error response
    return new NextResponse(
      `Error exporting: ${error instanceof Error ? error.message : String(error)}`,
      {
        status: 500,
      }
    );
  }
}
