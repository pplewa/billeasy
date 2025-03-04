"use client";

import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";

// Types
import { InvoiceType } from "@/types";

type ViewTemplatePageProps = {
    params: Promise<{ id: string }>;
};

/**
 * Template preview page
 * Dynamically loads and displays an invoice template based on the ID parameter
 */
const ViewTemplate = ({ params }: ViewTemplatePageProps) => {
    const [templateNumber, setTemplateNumber] = useState<string>("");
    const { getValues } = useFormContext();
    const formValues = getValues();

    // Get template ID from params
    useEffect(() => {
        const getTemplateId = async () => {
            const resolvedParams = await params;
            setTemplateNumber(resolvedParams.id);
        };
        getTemplateId();
    }, [params]);

    // Dynamically import the template component based on the ID
    const DynamicComponent = templateNumber 
        ? dynamic<InvoiceType>(
            () => import(`@/app/components/templates/invoice-pdf/InvoiceTemplate${templateNumber}`)
          )
        : null;

    if (!templateNumber || !DynamicComponent) {
        return <div>Loading template...</div>;
    }

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