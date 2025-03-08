/**
 * Main invoice schema definitions
 */
import { z } from 'zod';
import { fieldValidators } from './base';
import { ItemSchema, processItem, InvoiceItem } from './item';
import {
  SenderSchema,
  ReceiverSchema,
  PaymentInformationSchema,
  SignatureSchema,
  AmountTypeSchema,
} from './components';

/**
 * Schema for invoice details section
 */
export const DetailsSchema = z.object({
  // Basic invoice info
  invoiceNumber: fieldValidators.stringOptional,
  invoiceDate: fieldValidators.dateOptional,
  dueDate: fieldValidators.dateOptional,
  currency: fieldValidators.stringOptional,
  status: fieldValidators.stringOptional,

  // Content fields
  items: fieldValidators.arrayOptional(ItemSchema),
  additionalNotes: fieldValidators.stringOptional,
  paymentTerms: fieldValidators.stringOptional,

  // Template-related fields
  pdfTemplate: fieldValidators.numberOptional,
  invoiceLogo: fieldValidators.stringOptional,

  // Purchase order info
  purchaseOrderNumber: fieldValidators.stringOptional,

  // Payment information
  paymentInformation: PaymentInformationSchema,

  // Signature
  signature: SignatureSchema,

  // Calculated totals
  subTotal: fieldValidators.numberOptional,
  totalAmount: fieldValidators.numberOptional,

  // Global tax, discount (in addition to per-item)
  tax: AmountTypeSchema,
  discount: AmountTypeSchema,

  // For backwards compatibility
  notes: fieldValidators.stringOptional, // Alias for additionalNotes
  terms: fieldValidators.stringOptional, // Alias for paymentTerms

  // Also include legacy field names for templates that still use them
  taxDetails: AmountTypeSchema,
  discountDetails: AmountTypeSchema,
});

/**
 * Main invoice schema with all sections and transformations
 */
export const InvoiceSchema = z
  .object({
    // MongoDB ID - use our special ObjectId validator
    _id: fieldValidators.objectIdOptional,

    // Main sections
    sender: SenderSchema.optional().nullable(),
    receiver: ReceiverSchema.optional().nullable(),
    details: DetailsSchema.optional().nullable(),

    // Settings (will be merged into details in adapter functions)
    settings: z
      .object({
        logo: fieldValidators.stringOptional,
        template: fieldValidators.numberOptional,
        color: fieldValidators.stringOptional,
      })
      .optional()
      .nullable(),

    // Items at root level (will be moved to details.items in adapter)
    items: fieldValidators.arrayOptional(ItemSchema),

    // Timestamps
    createdAt: fieldValidators.dateOptional,
    updatedAt: fieldValidators.dateOptional,
  })
  .passthrough();

/**
 * Type for the entire invoice document
 */
export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * Process an invoice to ensure consistent structure and calculated values
 *
 * @param invoiceData Raw invoice data (potentially from form or API)
 * @returns Processed invoice with calculated values and consistent structure
 */
export function processInvoice(invoiceData: unknown): Invoice {
  // Handle MongoDB documents and ObjectId conversions
  let dataToProcess: Record<string, unknown> =
    typeof invoiceData === 'object' && invoiceData !== null
      ? (invoiceData as Record<string, unknown>)
      : {};

  // If it's a Mongoose document, convert to plain object
  if (typeof dataToProcess === 'object' && dataToProcess !== null) {
    // Check if it's a mongoose document with toObject function
    const mongooseDoc = dataToProcess as { toObject?: () => Record<string, unknown> };
    if (typeof mongooseDoc.toObject === 'function') {
      dataToProcess = mongooseDoc.toObject();
    }

    // If _id is an ObjectId, convert it to string to avoid validation errors
    const docWithId = dataToProcess as { _id?: { toString(): string } };
    if (docWithId._id && typeof docWithId._id === 'object' && docWithId._id.toString) {
      dataToProcess = {
        ...dataToProcess,
        _id: docWithId._id.toString(),
      };
    }
  }

  // Parse using schema to ensure basic structure
  const data = InvoiceSchema.parse(dataToProcess || {});

  // Process items to ensure consistent calculations
  const items: InvoiceItem[] = [];

  // Process items from either root or details level
  const sourceItems = data.details?.items || data.items || [];

  // Convert array to proper type (handle possible string value from form submission)
  const itemsArray = Array.isArray(sourceItems) ? sourceItems : [];

  // Process each item
  itemsArray.forEach((item) => {
    if (item) {
      items.push(processItem(item));
    }
  });

  // Calculate invoice totals
  let subTotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  // Sum up all items
  items.forEach((item) => {
    const itemSubtotal = (item.quantity || 0) * (item.unitPrice || item.price || 0);
    subTotal += itemSubtotal;

    // Add tax and discount if present
    if (item.tax?.amount) {
      if (item.tax.amountType === 'percentage') {
        totalTax += itemSubtotal * (item.tax.amount / 100);
      } else {
        totalTax += item.tax.amount;
      }
    }

    if (item.discount?.amount) {
      if (item.discount.amountType === 'percentage') {
        totalDiscount += itemSubtotal * (item.discount.amount / 100);
      } else {
        totalDiscount += item.discount.amount;
      }
    }
  });

  // Process global tax, discount
  const globalTax = data.details?.tax ||
    data.details?.taxDetails || { amount: 0, amountType: 'percentage' };
  const globalDiscount = data.details?.discount ||
    data.details?.discountDetails || { amount: 0, amountType: 'percentage' };

  // Calculate global tax
  if (globalTax.amount) {
    if (globalTax.amountType === 'percentage') {
      totalTax += (subTotal - totalDiscount) * (globalTax.amount / 100);
    } else {
      totalTax += globalTax.amount;
    }
  }

  // Calculate global discount
  if (globalDiscount.amount) {
    if (globalDiscount.amountType === 'percentage') {
      totalDiscount += subTotal * (globalDiscount.amount / 100);
    } else {
      totalDiscount += globalDiscount.amount;
    }
  }

  // Calculate total amount
  const totalAmount = subTotal - totalDiscount + totalTax;

  // Ensure details object exists
  const details = data.details || {};

  // Create consistent structure with calculated values
  return {
    ...data,
    details: {
      ...details,
      items,
      subTotal,
      totalAmount,
      tax: globalTax,
      discount: globalDiscount,
      // Also set legacy fields for backward compatibility
      taxDetails: globalTax,
      discountDetails: globalDiscount,
    },
    // Clear items at root level to avoid duplication
    items: undefined,
  };
}

// Custom input schema that matches the expected format
const customInputSchema = z.object({
  key: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
});

// Address schema with custom inputs as an array
const addressInfoSchema = z.object({
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  customInputs: z.array(customInputSchema).nullable().optional(),
});

// Base amount schema
const baseAmountSchema = z.object({
  amount: z.number(),
  amountType: z.enum(['percentage', 'amount']),
});

// Tax and discount schemas
const taxInfoSchema = baseAmountSchema.extend({
  taxId: z.string().optional(),
  taxName: z.string().optional(),
});

const discountInfoSchema = baseAmountSchema.extend({
  discountCode: z.string().optional(),
  discountName: z.string().optional(),
});

// Item schema
const formItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
  tax: taxInfoSchema,
  discount: discountInfoSchema,
});

// Invoice details schema
const formInvoiceDetailsSchema = z.object({
  items: z.array(formItemSchema),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  currency: z.string().nullable(),
  subTotal: z.number().nullable(),
  totalAmount: z.number().nullable(),
  status: z.string().optional(),
  purchaseOrderNumber: z.string().optional(),
  paymentInformation: z
    .object({
      bankName: z.string().optional(),
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
    })
    .optional(),
  signature: z
    .object({
      data: z.string(),
      fontFamily: z.string().optional(),
    })
    .optional(),
  additionalNotes: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoiceLogo: z.string().optional(),
});

// Form invoice schema
export const InvoiceSchemaForm = z.object({
  sender: addressInfoSchema.nullable(),
  receiver: addressInfoSchema.nullable(),
  details: formInvoiceDetailsSchema.nullable(),
});

// Export type
export type InvoiceSchemaTypeForm = z.infer<typeof InvoiceSchemaForm>;
