"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";

// Types
import { InvoiceType } from "@/types";

/**
 * Skeleton component shown while the invoice template is loading
 */
const DynamicInvoiceTemplateSkeleton = () => {
    return <Skeleton className="min-h-[60rem]" />;
};

/**
 * Dynamically loads an invoice template based on the template ID in the invoice data
 */
const DynamicInvoiceTemplate = (props: InvoiceType) => {
    // Get the template ID from the invoice data
    const templateId = props.details?.pdfTemplate || 1;
    
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
                    loading: () => <DynamicInvoiceTemplateSkeleton />,
                }
            ),
        [templateName]
    );

    return <DynamicInvoice {...props} />;
};

export default DynamicInvoiceTemplate; 