"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";

// Types
import { InvoiceType } from "@/types-optional";

/**
 * Skeleton component shown while the invoice template is loading
 */
const DynamicInvoiceViewSkeleton = () => {
    return <Skeleton className="min-h-[60rem]" />;
};

interface DynamicInvoiceViewProps {
    invoice: InvoiceType;
    templateId: number;
}

/**
 * Process the invoice data to ensure it has all the fields needed by templates
 */
const processInvoiceForTemplate = (invoice: InvoiceType): InvoiceType => {
    // Create a default invoice if none provided
    if (!invoice) return { details: { pdfTemplate: 1 } } as InvoiceType;
    
    // Create a deep copy to avoid mutating the original
    const processedInvoice = JSON.parse(JSON.stringify(invoice)) as InvoiceType;
    
    // Ensure the invoice details object is defined
    if (!processedInvoice.details) {
        processedInvoice.details = {};
    }
    
    // Update the PDF template ID
    if (processedInvoice.details) {
        processedInvoice.details.pdfTemplate = processedInvoice.details.pdfTemplate || 1;
    }
    
    return processedInvoice;
};

/**
 * Dynamically loads and renders an invoice template based on the selected template ID
 * Used in the invoice view page to preview the invoice with different templates
 */
const DynamicInvoiceView = ({ invoice, templateId = 1 }: DynamicInvoiceViewProps) => {
    // Process the invoice data to ensure compatibility with templates
    const processedInvoice = useMemo(() => processInvoiceForTemplate(invoice), [invoice]);
    
    // Dynamic template component name
    const templateName = `InvoiceTemplate${templateId}`;

    // Use useMemo to avoid unnecessary re-renders
    const DynamicInvoice = useMemo(
        () =>
            dynamic<InvoiceType>(
                () =>
                    import(
                        `@/app/components/templates/invoice-pdf/${templateName}`
                    ),
                {
                    loading: () => <DynamicInvoiceViewSkeleton />,
                }
            ),
        [templateName]
    );

    // Force the template ID to match the selected template
    if (processedInvoice.details) {
        processedInvoice.details.pdfTemplate = templateId;
    }

    return <DynamicInvoice {...processedInvoice} />;
};

export default DynamicInvoiceView; 