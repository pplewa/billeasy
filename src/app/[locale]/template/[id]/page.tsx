"use client";

import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";

// Types
import { InvoiceType } from "@/types";

type ViewTemplatePageProps = {
    params: { id: string };
};

/**
 * Template preview page
 * Dynamically loads and displays an invoice template based on the ID parameter
 */
const ViewTemplate = ({ params }: ViewTemplatePageProps) => {
    const templateNumber = params.id;

    // Dynamically import the template component based on the ID
    const DynamicComponent = dynamic<InvoiceType>(
        () =>
            import(
                `@/app/components/templates/invoice-pdf/InvoiceTemplate${templateNumber}`
            )
    );

    // Get the current form values from the form context
    const { getValues } = useFormContext();
    const formValues = getValues();

    return (
        <div className="container mx-auto py-8">
            <DynamicComponent
                sender={formValues.sender}
                receiver={formValues.receiver}
                details={formValues.details}
            />
        </div>
    );
};

export default ViewTemplate; 