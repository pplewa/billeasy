import React from 'react';
import { getTranslations } from 'next-intl/server';
import { InvoiceType } from '@/lib/types';
import { Template1 } from '../InvoiceTemplate1';
import { Template2 } from '../InvoiceTemplate2';
import { Template3 } from '../InvoiceTemplate3';
import { Template4 } from '../InvoiceTemplate4';
import { Locale } from '@/i18n/routing';

/**
 * Server-side render function for invoice templates
 * This function renders the appropriate template based on the template ID
 * It provides server-side translations to the pure template components
 */
export async function renderInvoiceTemplate(
  data: InvoiceType,
  templateId: number,
  locale: Locale = 'en'
) {
  // Validate locale is one of the supported locales
  const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'];
  const validLocale = supportedLocales.includes(locale) ? locale : 'en';

  // Get server-side translations with the specified locale
  const t = await getTranslations({ locale: validLocale, namespace: 'invoice' });

  // Render the appropriate template based on templateId
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
      // Default to template 1
      return <Template1 data={data} t={t} />;
  }
}
