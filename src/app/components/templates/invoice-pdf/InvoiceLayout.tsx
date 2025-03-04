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
            {/* Outfit font is now loaded via the layout.tsx file */}
            {details?.signature?.fontFamily && (
                <>
                    <link href={fontHref} rel="stylesheet" />
                </>
            )}
        </>
    );

    return (
        <>
            {head}
            <section style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                <div className="flex flex-col p-4 sm:p-10 bg-white rounded-xl min-h-[60rem]">
                    {children}
                </div>
            </section>
        </>
    );
} 