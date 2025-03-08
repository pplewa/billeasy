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
          const htmlContent = ReactDOMServer.renderToStaticMarkup(InvoiceTemplate(body));

          // Add HTML wrapper with styles
          const fullHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Invoice ${body.details?.invoiceNumber || ''}</title>
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
