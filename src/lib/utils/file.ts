import { Locale } from '@/i18n/routing';

/**
 * Dynamically imports and retrieves an invoice template React component based on the provided template ID.
 *
 * @param templateId - The ID of the invoice template.
 * @param locale - The locale to use for translations (optional, defaults to 'en').
 * @returns Promise resolving to the invoice template component or null if not found.
 */
export const getInvoiceTemplate = async (templateId: number, locale: Locale = 'en') => {
  try {
    // Import the server-side render function
    const { renderInvoiceTemplate } = await import(
      '../../app/components/templates/invoice/server/renderTemplate'
    );

    // Return a function that renders the template with the provided data
    return async (props: Record<string, unknown>) => {
      // Create a deep copy of the props to avoid mutating the original
      const processedProps = JSON.parse(JSON.stringify(props));

      // Process signature font family if it exists
      if (
        processedProps.signature?.fontFamily &&
        typeof processedProps.signature.fontFamily === 'string' &&
        processedProps.signature.fontFamily.startsWith('var(--font-')
      ) {
        // Extract the font name from the CSS variable
        processedProps.signature.fontFamily = processedProps.signature.fontFamily.replace(
          /var\(--font-([^)]+)\)/,
          '$1'
        );
      }

      // Return the rendered template using the server-side rendering function with locale
      const renderedTemplate = await renderInvoiceTemplate(processedProps, templateId, locale);
      return renderedTemplate;
    };
  } catch (err) {
    console.error(`Error importing template for ID ${templateId}:`, err);
    // Provide a default template
    return null;
  }
};

/**
 * Convert a file to a buffer. Used for sending invoice as email attachment.
 *
 * @param file - The file to convert to a buffer.
 * @returns Promise that resolves to a buffer.
 */
export const fileToBuffer = async (file: File): Promise<Buffer> => {
  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Convert ArrayBuffer to Buffer
  return Buffer.from(arrayBuffer);
};
