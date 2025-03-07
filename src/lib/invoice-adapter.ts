import { InvoiceType, ItemType } from "@/types-optional";

interface SourceInvoice {
  // Core properties that might exist in various formats
  [key: string]: unknown;
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
  if (!source) return {} as InvoiceType;

  // Create a deep copy to avoid mutations
  const invoice = JSON.parse(JSON.stringify(source)) as InvoiceType;
  
  // Ensure required objects exist
  if (!invoice.details) invoice.details = {};
  if (!invoice.sender) invoice.sender = {};
  if (!invoice.receiver) invoice.receiver = {};
  
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
      invoice.details.pdfTemplate = typeof invoice.settings.template === 'string' 
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
  
  // Synchronize tax/taxDetails
  if (invoice.details.tax && !invoice.details.taxDetails) {
    invoice.details.taxDetails = invoice.details.tax;
  } else if (invoice.details.taxDetails && !invoice.details.tax) {
    invoice.details.tax = invoice.details.taxDetails;
  } else if (!invoice.details.tax && !invoice.details.taxDetails) {
    // Set default values if both are missing
    const defaultTax = { amount: 0, amountType: 'percentage' };
    invoice.details.tax = defaultTax;
    invoice.details.taxDetails = defaultTax;
  }
  
  // Synchronize discount/discountDetails
  if (invoice.details.discount && !invoice.details.discountDetails) {
    invoice.details.discountDetails = invoice.details.discount;
  } else if (invoice.details.discountDetails && !invoice.details.discount) {
    invoice.details.discount = invoice.details.discountDetails;
  } else if (!invoice.details.discount && !invoice.details.discountDetails) {
    // Set default values if both are missing
    const defaultDiscount = { amount: 0, amountType: 'percentage' };
    invoice.details.discount = defaultDiscount;
    invoice.details.discountDetails = defaultDiscount;
  }
  
  // Synchronize shipping/shippingDetails
  if (invoice.details.shipping && !invoice.details.shippingDetails) {
    invoice.details.shippingDetails = invoice.details.shipping;
  } else if (invoice.details.shippingDetails && !invoice.details.shipping) {
    invoice.details.shipping = invoice.details.shippingDetails;
  } else if (!invoice.details.shipping && !invoice.details.shippingDetails) {
    // Set default values if both are missing
    const defaultShipping = { cost: 0, costType: 'fixed' };
    invoice.details.shipping = defaultShipping;
    invoice.details.shippingDetails = defaultShipping;
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
  
  // Ensure tax object exists
  if (!invoice.details.tax) {
    invoice.details.tax = {
      amount: 0,
      amountType: 'percentage'
    } as any;
  }
  
  // Ensure discount object exists
  if (!invoice.details.discount) {
    invoice.details.discount = {
      amount: 0,
      amountType: 'percentage'
    } as any;
  }
  
  // Ensure shipping object exists
  if (!invoice.details.shipping) {
    invoice.details.shipping = {
      cost: 0,
      costType: 'fixed'
    } as any;
  }
  
  return invoice;
}

/**
 * Normalizes an array of invoice items, ensuring consistent structure and types.
 */
function normalizeItems(items: Record<string, unknown>[]): ItemType[] {
  return items.map((item, index) => {
    const normalizedItem: Record<string, unknown> = {
      id: (item.id as string) || `item-${index}`,
      name: (item.name as string) || '',
      description: (item.description as string) || '',
    };
    
    // Normalize quantity
    normalizedItem.quantity = parseNumberValue(item.quantity) || 0;
    
    // Normalize price/unitPrice
    if (item.unitPrice !== undefined) {
      normalizedItem.unitPrice = parseNumberValue(item.unitPrice) || 0;
      // Ensure price is also set for compatibility
      normalizedItem.price = normalizedItem.unitPrice;
    } else if (item.price !== undefined) {
      normalizedItem.price = parseNumberValue(item.price) || 0;
      // Ensure unitPrice is also set for consistency
      normalizedItem.unitPrice = normalizedItem.price;
    } else {
      normalizedItem.unitPrice = 0;
      normalizedItem.price = 0;
    }
    
    // Normalize tax
    if (item.tax && typeof item.tax === 'object') {
      normalizedItem.tax = {
        amount: parseNumberValue(item.tax.amount) || 0,
        amountType: item.tax.amountType || 'percentage'
      };
    } else if (item.taxRate !== undefined) {
      // Legacy support for taxRate
      normalizedItem.tax = {
        amount: parseNumberValue(item.taxRate) || 0,
        amountType: 'percentage'
      };
      // Keep legacy field for backward compatibility
      normalizedItem.taxRate = parseNumberValue(item.taxRate);
    } else {
      normalizedItem.tax = { amount: 0, amountType: 'percentage' };
    }
    
    // Normalize discount
    if (item.discount) {
      if (typeof item.discount === 'object') {
        normalizedItem.discount = {
          amount: parseNumberValue(item.discount.amount) || 0,
          amountType: item.discount.amountType || 'percentage'
        };
      } else {
        // Legacy support for discount as a number
        normalizedItem.discount = {
          amount: parseNumberValue(item.discount) || 0,
          amountType: 'percentage'
        };
      }
    } else if (item.discountRate !== undefined) {
      // Legacy support for discountRate
      normalizedItem.discount = {
        amount: parseNumberValue(item.discountRate) || 0,
        amountType: 'percentage'
      };
      // Keep legacy field for backward compatibility
      normalizedItem.discountRate = parseNumberValue(item.discountRate);
    } else {
      normalizedItem.discount = { amount: 0, amountType: 'percentage' };
    }
    
    // Calculate total if not provided
    if (item.total === undefined) {
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
      
      normalizedItem.total = subtotal - discountAmount + taxAmount;
    } else {
      normalizedItem.total = parseNumberValue(item.total) || 0;
    }
    
    return normalizedItem;
  });
}

/**
 * Calculates totals for an invoice based on item details
 */
function calculateTotals(items: ItemType[]): { subTotal: number; totalAmount: number } {
  const normalizedItems = normalizeItems(items);
  
  const subTotal = normalizedItems.reduce(
    (sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)),
    0
  );
  
  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  
  return { subTotal, totalAmount };
}

/**
 * Safely parses a number value from various formats
 */
function parseNumberValue(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
} 