// Variables
import { EXPORT_INVOICE_API } from '@/lib/variables';

// Types
import { ExportTypes } from '@/types';
import { FormInvoiceType } from '@/lib/types/invoice';

/**
 * Export an invoice by sending a POST request to the server and initiating the download.
 *
 * @param {ExportTypes} exportAs - The format in which to export the invoice (e.g., PDF, XLSX, CSV, JSON).
 * @param {FormInvoiceType} formValues - The invoice form data to be exported.
 * @throws {Error} If there is an error during the export process.
 * @returns {Promise<void>} A promise that resolves when the export is completed.
 */
export const exportInvoice = async (exportAs: ExportTypes, formValues: FormInvoiceType) => {
  const currentLocale = window.location.pathname.split('/')[1];
  return fetch(`${EXPORT_INVOICE_API}?format=${exportAs}`, {
    method: 'POST',
    body: JSON.stringify(formValues),
    headers: {
      'Content-Type': 'application/json',
      'x-next-locale': currentLocale,
    },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice.${exportAs.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Error downloading:', error);
    });
};
