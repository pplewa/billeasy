'use client';

import { useTranslations } from 'next-intl';
import { InvoiceType } from '@/lib/types';
import { Template1 } from './InvoiceTemplate1';
import { Template2 } from './InvoiceTemplate2';
import { Template3 } from './InvoiceTemplate3';
import { Template4 } from './InvoiceTemplate4';

/**
 * Unified client-side wrapper for all invoice templates
 * This is a thin wrapper that provides client-side translations to the pure template components
 * and selects the appropriate template based on the templateId in the data
 */
const InvoiceTemplate = (data: InvoiceType) => {
  // Get client-side translations
  const t = useTranslations('invoice');

  // Get template ID from the data
  const templateId = data.details?.pdfTemplate || 1;

  // Render the appropriate template with client-side translations
  switch (templateId) {
    case 1:
      return <Template1 data={data} t={t} />;
    case 2:
      return <Template2 data={data} t={t} />;
    case 3:
      return <Template3 data={data} t={t} />;
    case 4:
      return <Template4 data={data} t={t} />;
    default:
      // Fall back to template 1
      return <Template1 data={data} t={t} />;
  }
};

export default InvoiceTemplate;

/**
 * Export individual templates for direct imports
 * This allows for backwards compatibility with existing code
 */
export const InvoiceTemplate1 = (data: InvoiceType) => {
  const t = useTranslations('invoice');
  return <Template1 data={data} t={t} />;
};

export const InvoiceTemplate2 = (data: InvoiceType) => {
  const t = useTranslations('invoice');
  return <Template2 data={data} t={t} />;
};

export const InvoiceTemplate3 = (data: InvoiceType) => {
  const t = useTranslations('invoice');
  return <Template3 data={data} t={t} />;
};

export const InvoiceTemplate4 = (data: InvoiceType) => {
  const t = useTranslations('invoice');
  return <Template4 data={data} t={t} />;
};
