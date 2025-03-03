import { NextRequest, NextResponse } from "next/server";

// Helpers
import { flattenObject } from "@/lib/helpers";

// Types
import { ExportTypes } from "@/types";

/**
 * Export an invoice in selected format.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @returns {NextResponse} A response object containing the exported data in the requested format.
 */
export async function exportInvoiceService(req: NextRequest) {
    const body = await req.json();
    const format = req.nextUrl.searchParams.get("format");

    try {
        switch (format) {
            case ExportTypes.JSON:
                const jsonData = JSON.stringify(body);
                return new NextResponse(jsonData, {
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Disposition":
                            "attachment; filename=invoice.json",
                    },
                    status: 200,
                });
            case ExportTypes.CSV:
                // For CSV export, we would use a library like json2csv
                // This is a placeholder implementation
                const flattenedData = flattenObject(body);
                const headers = Object.keys(flattenedData).join(',');
                const values = Object.values(flattenedData).map(value => 
                    typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
                ).join(',');
                const csv = `${headers}\n${values}`;
                
                return new NextResponse(csv, {
                    headers: {
                        "Content-Type": "text/csv",
                        "Content-Disposition":
                            "attachment; filename=invoice.csv",
                    },
                });
            case ExportTypes.XLSX:
                // For XLSX export, we would use a library like xlsx
                // This is a placeholder implementation
                return new NextResponse(JSON.stringify({ message: "XLSX export not implemented yet" }), {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 501,
                });
            case ExportTypes.PDF:
                // For PDF export, we would use the generatePdfService
                // This is a placeholder implementation
                return new NextResponse(JSON.stringify({ message: "PDF export not implemented yet" }), {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 501,
                });
            default:
                return new NextResponse(JSON.stringify({ message: "Unsupported export format" }), {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 400,
                });
        }
    } catch (error) {
        console.error(error);

        // Return an error response
        return new NextResponse(`Error exporting: \n${error}`, {
            status: 500,
        });
    }
} 