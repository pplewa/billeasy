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
    const body: InvoiceType = await req.json();

    try {
        const ReactDOMServer = (await import("react-dom/server")).default;

        // Get the selected invoice template
        const templateId = body.details.pdfTemplate;
        const InvoiceTemplate = await getInvoiceTemplate(templateId);

        if (!InvoiceTemplate) {
            throw new Error(`Template with ID ${templateId} not found`);
        }

        // Read the HTML template from a React component
        // This would be used in the actual implementation
        ReactDOMServer.renderToStaticMarkup(
            InvoiceTemplate(body)
        );

        // Launch the browser in production or development mode depending on the environment
        if (ENV === "production") {
            // For production, we would use a headless browser like Puppeteer
            // This is a placeholder implementation
            return new NextResponse(JSON.stringify({ message: "PDF generation in production not implemented yet" }), {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 501,
            });
        } else {
            // For development, we would use a local Puppeteer instance
            // This is a placeholder implementation
            return new NextResponse(JSON.stringify({ message: "PDF generation in development not implemented yet" }), {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 501,
            });
        }
    } catch (error) {
        console.error(error);

        // Return an error response
        return new NextResponse(`Error generating PDF: \n${error}`, {
            status: 500,
        });
    }
} 