import { ReactNode } from "react";

// Types
import { InvoiceType } from "@/types";

type InvoiceLayoutProps = {
    data: InvoiceType;
    children: ReactNode;
};

/**
 * Layout component for invoice templates
 * Provides common structure and styling for all invoice templates
 */
export default function InvoiceLayout({ data, children }: InvoiceLayoutProps) {
    const { details } = data;

    // Get the specific font family user selected for signature
    const fontHref = details?.signature?.fontFamily
        ? `https://fonts.googleapis.com/css2?family=${details.signature.fontFamily}&display=swap`
        : "";

    const head = (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
            />
            {/* Load common signature fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script&family=Pacifico&family=Satisfy&family=Caveat&family=Homemade+Apple&display=swap" rel="stylesheet" />
            
            {/* Load specific signature font if provided */}
            {details?.signature?.fontFamily && (
                <>
                    <link href={fontHref} rel="stylesheet" />
                </>
            )}
            <style>
                {`
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: 'Outfit', sans-serif;
                    color: #333;
                    line-height: 1.5;
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
                `}
            </style>
        </>
    );

    return (
        <>
            {head}
            <section style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div className="flex flex-col p-4 sm:p-10 bg-white rounded-xl min-h-[60rem]">
                    {children}
                </div>
            </section>
        </>
    );
} 