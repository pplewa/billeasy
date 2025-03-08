/**
 * Item schemas for invoice line items
 */
import { z } from "zod";
import { fieldValidators, createAmountTypeSchema } from "./base";
import { CustomInputSchema } from "./components";

/**
 * Schema for invoice line items with proper type transformations
 */
export const ItemSchema = z.object({
  id: fieldValidators.stringOptional,
  name: fieldValidators.stringOptional,
  description: fieldValidators.stringOptional,
  quantity: fieldValidators.numberOptional,
  unitPrice: fieldValidators.numberOptional,
  price: fieldValidators.numberOptional, // Alias for unitPrice for backwards compatibility
  total: fieldValidators.numberOptional,
  // Tax and discount per line item
  tax: createAmountTypeSchema(),
  discount: createAmountTypeSchema(),
  // Legacy fields for backwards compatibility
  taxRate: fieldValidators.numberOptional,
  discountRate: fieldValidators.numberOptional,
  // Custom fields
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
}).passthrough();

/**
 * Type for a single invoice item
 */
export type InvoiceItem = z.infer<typeof ItemSchema>;

/**
 * Creates a processed item with calculated values based on inputs
 * This ensures consistent type structure and calculated values
 * 
 * @param item Raw item input (may be incomplete)
 * @returns Processed item with calculated values
 */
export function processItem(item: unknown): InvoiceItem {
  // Parse and transform using schema
  const parsedItem = ItemSchema.parse(item || {});
  
  // Extract values with fallbacks
  const quantity = parsedItem.quantity || 0;
  const unitPrice = parsedItem.unitPrice || parsedItem.price || 0;
  const taxAmount = parsedItem.tax?.amount || parsedItem.taxRate || 0;
  const taxType = parsedItem.tax?.amountType || 'percentage';
  const discountAmount = parsedItem.discount?.amount || parsedItem.discountRate || 0;
  const discountType = parsedItem.discount?.amountType || 'percentage';
  
  // Calculate intermediate values
  const subtotal = quantity * unitPrice;
  
  // Calculate discount
  let discountValue = 0;
  if (discountAmount > 0) {
    discountValue = discountType === 'percentage' 
      ? subtotal * (discountAmount / 100)
      : discountAmount;
  }
  
  // Calculate tax
  const taxableAmount = subtotal - discountValue;
  let taxValue = 0;
  if (taxAmount > 0) {
    taxValue = taxType === 'percentage'
      ? taxableAmount * (taxAmount / 100)
      : taxAmount;
  }
  
  // Calculate total
  const total = taxableAmount + taxValue;
  
  // Return fully processed item
  return {
    ...parsedItem,
    quantity,
    unitPrice,
    price: unitPrice, // Keep price synced with unitPrice
    tax: {
      amount: taxAmount,
      amountType: taxType
    },
    discount: {
      amount: discountAmount,
      amountType: discountType
    },
    total
  };
} 