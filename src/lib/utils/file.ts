/**
 * Dynamically imports and retrieves an invoice template React component based on the provided template ID.
 *
 * @param templateId - The ID of the invoice template.
 * @returns Promise resolving to the invoice template component or null if not found.
 */
export const getInvoiceTemplate = async (templateId: number) => {
  // Dynamic template component name
  const componentName = `InvoiceTemplate${templateId}`;

  try {
    // Using dynamic import
    const importedModule = await import(
      `@/app/components/templates/invoice/${componentName}Unified`
    );
    
    // Get the original template component
    const OriginalTemplate = importedModule.default;
    
    // Return a wrapper function that processes the props before passing to the original template
    return (props: Record<string, unknown>) => {
      // Create a deep copy of the props to avoid mutating the original
      const processedProps = JSON.parse(JSON.stringify(props));
      
      // Process signature font family if it exists
      if (
        processedProps.signature?.fontFamily && 
        typeof processedProps.signature.fontFamily === 'string' && 
        processedProps.signature.fontFamily.startsWith('var(--font-')
      ) {
        // Extract the font name from the CSS variable
        processedProps.signature.fontFamily = processedProps.signature.fontFamily
          .replace(/var\(--font-([^)]+)\)/, '$1');
      }
      
      // Return the original template with processed props
      return OriginalTemplate(processedProps);
    };
  } catch (err) {
    console.error(`Error importing template ${componentName}: ${err}`);
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