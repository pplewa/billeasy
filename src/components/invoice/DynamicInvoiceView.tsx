'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// UI Components
import { Skeleton } from '@/components/ui/skeleton';

// Types
import { InvoiceType } from '@/types-optional';

// Helpers
import { normalizeInvoice } from '@/lib/invoice-adapter';

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
 * Dynamically loads and renders an invoice template based on the selected template ID
 * Used in the invoice view page to preview the invoice with different templates
 */
const DynamicInvoiceView = ({ invoice, templateId = 1 }: DynamicInvoiceViewProps) => {

  // Process the invoice data to ensure compatibility with templates
  const processedInvoice = useMemo(() => {
    // Normalize the invoice to ensure consistent structure
    const normalized = normalizeInvoice(invoice);

    // Always set the template ID to match the selected template
    if (normalized?.details) {
      normalized.details.pdfTemplate = templateId;
    }

    return normalized;
  }, [invoice, templateId]);

  // Dynamic template component name
  const templateName = `InvoiceTemplate${templateId}`;

  // Use useMemo to avoid unnecessary re-renders
  const DynamicInvoice = useMemo(
    () =>
      dynamic<InvoiceType>(
        () => import(`@/app/components/templates/invoice/${templateName}`),
        {
          loading: () => <DynamicInvoiceViewSkeleton />,
        }
      ),
    [templateName]
  );

  return <DynamicInvoice {...processedInvoice} />;
};

export default DynamicInvoiceView;
