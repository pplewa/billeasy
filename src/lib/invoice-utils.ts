import { InvoiceType } from '@/types';

/**
 * Calculates total tax from invoice items
 * @param invoice The invoice object
 * @returns Total tax amount as a number
 */
export function calculateInvoiceTax(invoice: InvoiceType): number {
  if (!invoice.details?.items) return 0;

  return invoice.details.items.reduce((total, item) => {
    if (!item.tax) return total;

    const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
    
    if (item.tax.amountType === 'percentage') {
      return total + (itemSubtotal * (item.tax.amount / 100));
    }
    
    return total + (item.tax.amount || 0);
  }, 0);
}

/**
 * Calculates total discount from invoice items
 * @param invoice The invoice object
 * @returns Total discount amount as a number
 */
export function calculateInvoiceDiscount(invoice: InvoiceType): number {
  if (!invoice.details?.items) return 0;

  return invoice.details.items.reduce((total, item) => {
    if (!item.discount) return total;

    const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
    
    if (item.discount.amountType === 'percentage') {
      return total + (itemSubtotal * (item.discount.amount / 100));
    }
    
    return total + (item.discount.amount || 0);
  }, 0);
}

/**
 * Extends the invoice details with computed tax and discount properties
 * @param invoice The original invoice
 * @returns Invoice with added computed properties
 */
export function computeInvoiceDetails(invoice: InvoiceType): InvoiceType {
  // Create a deep copy to avoid mutating the original object
  const computedInvoice = JSON.parse(JSON.stringify(invoice));

  // Add computed properties
  if (computedInvoice.details) {
    Object.defineProperties(computedInvoice.details, {
      tax: {
        get() {
          return calculateInvoiceTax(invoice);
        },
        enumerable: true,
      },
      discount: {
        get() {
          return calculateInvoiceDiscount(invoice);
        },
        enumerable: true,
      }
    });
  }

  return computedInvoice;
} 