// Zod
import { z } from "zod";

// RHF
import { FieldPath, UseFormReturn } from "react-hook-form";

// Zod schemas
import { InvoiceSchema, ItemSchema } from "@/lib/schemas";

// Form types
export type InvoiceType = z.infer<typeof InvoiceSchema>;
export type ItemType = z.infer<typeof ItemSchema>;
export type FormType = UseFormReturn<InvoiceType>;
export type NameType = FieldPath<InvoiceType>;
export type CurrencyType = string;

export type CurrencyDetails = {
    currency: string;
    decimals: number;
    beforeDecimal: string;
    afterDecimal: string | null;
};

// Signature types
export type SignatureColor = {
    name: string;
    label: string;
    color: string;
};

export type SignatureFont = {
    name: string;
    variable: string;
};

export enum SignatureTabs {
    DRAW = "draw",
    TYPE = "type",
    UPLOAD = "upload",
}

// Wizard types
export type WizardStepType = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
};

// Export types
export enum ExportTypes {
    PDF = "pdf",
    XLSX = "xlsx",
    CSV = "csv",
    JSON = "json",
    XML = "xml",
}

// Custom Input Type
export type CustomInputType = {
    key: string;
    value: string;
}; 