import { InvoiceType, ItemType } from '@/types-optional';
import { computeInvoiceDetails } from './invoice-utils';

interface SourceInvoice {
  // Core properties that might exist in various formats
  [key: string]: unknown;
}

interface TaxDetails {
  amount: number;
  amountType: string;
}

interface DiscountDetails {
  amount: number;
  amountType: string;
}

interface NormalizedItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  price: number;
  total: number;
  tax: TaxDetails;
  discount: DiscountDetails;
  taxRate?: number;
  discountRate?: number;
}

/**
 * Normalizes invoice data from any source (DB, form, API) to a consistent format.
 *
 * This utility ensures all invoice data has a consistent structure, handling:
 * - Legacy field names/formats
 * - Fields in different locations (items at root vs in details)
 * - Type conversions for numeric values
 * - Merging settings into details
 * - Ensuring all required objects exist
 *
 * @param source Any invoice-like data structure
 * @returns A normalized InvoiceType object with consistent structure
 */
export function normalizeInvoice(source: SourceInvoice | null | undefined): InvoiceType {
  // Create a deep copy to avoid mutations, or start with an empty object if source is null/undefined
  const invoice = source ? JSON.parse(JSON.stringify(source)) : ({} as InvoiceType);

  // Initialize required objects if they don't exist
  invoice.details = invoice.details || {};
  invoice.sender = invoice.sender || {};
  invoice.receiver = invoice.receiver || {};

  // Move items from root to details if needed
  if (Array.isArray(invoice.items) && invoice.items.length > 0) {
    if (!invoice.details.items || invoice.details.items.length === 0) {
      invoice.details.items = invoice.items;
    }
  }

  // Process items to ensure consistent format
  invoice.details.items = normalizeItems(invoice.details.items || []);

  // Migrate settings to details
  if (invoice.settings) {
    // Logo
    if (invoice.settings.logo && !invoice.details.invoiceLogo) {
      invoice.details.invoiceLogo = invoice.settings.logo;
    }

    // Template
    if (invoice.settings.template && !invoice.details.pdfTemplate) {
      invoice.details.pdfTemplate =
        typeof invoice.settings.template === 'string'
          ? parseInt(invoice.settings.template, 10)
          : invoice.settings.template;
    }
  }

  // Support both additionalNotes and notes
  if (invoice.details.notes && !invoice.details.additionalNotes) {
    invoice.details.additionalNotes = invoice.details.notes;
  }
  if (invoice.details.additionalNotes && !invoice.details.notes) {
    invoice.details.notes = invoice.details.additionalNotes;
  }

  // Support both paymentTerms and terms
  if (invoice.details.terms && !invoice.details.paymentTerms) {
    invoice.details.paymentTerms = invoice.details.terms;
  }
  if (invoice.details.paymentTerms && !invoice.details.terms) {
    invoice.details.terms = invoice.details.paymentTerms;
  }

  // Ensure pdfTemplate is a number
  if (invoice.details.pdfTemplate) {
    invoice.details.pdfTemplate = Number(invoice.details.pdfTemplate);
  } else {
    invoice.details.pdfTemplate = 1; // Default template
  }

  // Calculate totals if not provided
  if (!invoice.details.subTotal || !invoice.details.totalAmount) {
    const { subTotal, totalAmount } = calculateTotals(invoice.details.items || []);

    if (!invoice.details.subTotal) {
      invoice.details.subTotal = subTotal;
    }

    if (!invoice.details.totalAmount) {
      invoice.details.totalAmount = totalAmount;
    }
  }

  // Use the new computed details utility
  return computeInvoiceDetails(invoice);
}

/**
 * Normalizes an array of invoice items, ensuring consistent structure and types.
 */
function normalizeItems(items: Record<string, unknown>[]): ItemType[] {
  return items.map((item, index) => {
    const normalizedItem: NormalizedItem = {
      id: (item.id as string) || `item-${index}`,
      name: (item.name as string) || '',
      description: (item.description as string) || '',
      quantity: parseNumberValue(item.quantity) || 0,
      unitPrice: parseNumberValue(item.unitPrice) || parseNumberValue(item.price) || 0,
      price: parseNumberValue(item.price) || parseNumberValue(item.unitPrice) || 0,
      total: 0, // Will be calculated later
      tax: { amount: 0, amountType: 'percentage' },
      discount: { amount: 0, amountType: 'percentage' },
    };

    // Normalize tax
    if (item.tax && typeof item.tax === 'object') {
      const tax = item.tax as Record<string, unknown>;
      normalizedItem.tax = {
        amount: parseNumberValue(tax.amount) || 0,
        amountType: (tax.amountType as string) || 'percentage',
      };
    } else if (item.taxRate !== undefined) {
      // Legacy support for taxRate
      normalizedItem.tax = {
        amount: parseNumberValue(item.taxRate) || 0,
        amountType: 'percentage',
      };
      normalizedItem.taxRate = parseNumberValue(item.taxRate);
    }

    // Normalize discount
    if (item.discount) {
      if (typeof item.discount === 'object') {
        const discount = item.discount as Record<string, unknown>;
        normalizedItem.discount = {
          amount: parseNumberValue(discount.amount) || 0,
          amountType: (discount.amountType as string) || 'percentage',
        };
      } else {
        // Legacy support for discount as a number
        normalizedItem.discount = {
          amount: parseNumberValue(item.discount) || 0,
          amountType: 'percentage',
        };
      }
    } else if (item.discountRate !== undefined) {
      // Legacy support for discountRate
      normalizedItem.discount = {
        amount: parseNumberValue(item.discountRate) || 0,
        amountType: 'percentage',
      };
      normalizedItem.discountRate = parseNumberValue(item.discountRate);
    }

    // Calculate total
    const subtotal = normalizedItem.quantity * normalizedItem.unitPrice;
    let discountAmount = 0;

    if (normalizedItem.discount.amountType === 'percentage') {
      discountAmount = subtotal * (normalizedItem.discount.amount / 100);
    } else {
      discountAmount = normalizedItem.discount.amount;
    }

    let taxAmount = 0;
    if (normalizedItem.tax.amountType === 'percentage') {
      taxAmount = (subtotal - discountAmount) * (normalizedItem.tax.amount / 100);
    } else {
      taxAmount = normalizedItem.tax.amount;
    }

    normalizedItem.total = parseNumberValue(item.total) || subtotal - discountAmount + taxAmount;

    return normalizedItem as unknown as ItemType;
  });
}

/**
 * Calculates totals for an invoice based on item details
 */
function calculateTotals(items: ItemType[]): {
  subTotal: number;
  totalAmount: number;
} {
  let subTotal = 0;
  let totalAmount = 0;

  items.forEach((item) => {
    if (!item) return;

    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unitPrice ?? 0);
    const itemSubtotal = quantity * unitPrice;
    subTotal += itemSubtotal;

    let discountAmount = 0;
    if (item.discount && typeof item.discount === 'object') {
      const amount = Number(item.discount.amount ?? 0);
      if (item.discount.amountType === 'percentage') {
        discountAmount = itemSubtotal * (amount / 100);
      } else {
        discountAmount = amount;
      }
    }

    let taxAmount = 0;
    if (item.tax && typeof item.tax === 'object') {
      const amount = Number(item.tax.amount ?? 0);
      const taxableAmount = itemSubtotal - discountAmount;
      if (item.tax.amountType === 'percentage') {
        taxAmount = taxableAmount * (amount / 100);
      } else {
        taxAmount = amount;
      }
    }

    totalAmount += itemSubtotal - discountAmount + taxAmount;
  });

  return {
    subTotal,
    totalAmount,
  };
}

/**
 * Safely parses a value to a number, handling various input types
 */
function parseNumberValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
