import { z } from "zod";

// Field Validators with all requirements stripped out per validation-rules.mdc
const fieldValidators = {
  // All string fields are optional with no requirements
  stringOptional: z.string().optional().or(z.null()).or(z.literal('')),
  
  // Number fields allow any number or are optional
  numberOptional: z.union([
    z.number(),
    z.string().transform((val) => val === '' ? undefined : Number(val)),
    z.undefined(),
    z.null(),
    z.literal(''),
  ]).optional(),
  
  // Dates accept any date or are optional
  dateOptional: z.union([
    z.date(),
    z.string().transform((val) => val ? new Date(val) : undefined),
    z.undefined(),
    z.null(),
    z.literal(''),
  ]).optional(),
  
  // Arrays are always optional
  arrayOptional: (schema: z.ZodType) => z.array(schema).optional().or(z.null()).or(z.literal('')),
};

// Custom Input Schema for additional fields
const CustomInputSchema = z.object({
  key: fieldValidators.stringOptional,
  value: fieldValidators.stringOptional,
});

// Amount Type Schema (for tax, discount, shipping, etc.)
const AmountTypeSchema = z.object({
  amount: fieldValidators.numberOptional,
  amountType: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

// Unified Item Schema with consistent fields
export const ItemSchema = z.object({
  id: fieldValidators.stringOptional,
  name: fieldValidators.stringOptional,
  description: fieldValidators.stringOptional,
  quantity: fieldValidators.numberOptional,
  unitPrice: fieldValidators.numberOptional,
  price: fieldValidators.numberOptional, // Alias for unitPrice for backwards compatibility
  total: fieldValidators.numberOptional,
  // Tax and discount per line item
  tax: z.preprocess(
    (val) => val ?? { amount: 0, amountType: 'percentage' },
    AmountTypeSchema
  ),
  discount: z.preprocess(
    (val) => {
      // Handle legacy format where discount was just a number (percentage)
      if (typeof val === 'number') {
        return { amount: val, amountType: 'percentage' };
      }
      return val ?? { amount: 0, amountType: 'percentage' };
    },
    AmountTypeSchema
  ),
  // Legacy fields for backwards compatibility
  taxRate: fieldValidators.numberOptional,
  discountRate: fieldValidators.numberOptional,
  // Custom fields
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
}).passthrough().optional().nullable();

// Invoice Sender Schema
const InvoiceSenderSchema = z.object({
  name: fieldValidators.stringOptional,
  address: fieldValidators.stringOptional,
  zipCode: fieldValidators.stringOptional,
  city: fieldValidators.stringOptional,
  country: fieldValidators.stringOptional,
  email: fieldValidators.stringOptional,
  phone: fieldValidators.stringOptional,
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
});

// Invoice Receiver Schema
const InvoiceReceiverSchema = z.object({
  name: fieldValidators.stringOptional,
  address: fieldValidators.stringOptional,
  zipCode: fieldValidators.stringOptional,
  city: fieldValidators.stringOptional,
  country: fieldValidators.stringOptional,
  email: fieldValidators.stringOptional,
  phone: fieldValidators.stringOptional,
  customInputs: fieldValidators.arrayOptional(CustomInputSchema),
});

// Payment Information Schema
const PaymentInformationSchema = z.object({
  bankName: fieldValidators.stringOptional,
  accountName: fieldValidators.stringOptional, 
  accountNumber: fieldValidators.stringOptional,
  routingNumber: fieldValidators.stringOptional,
  iban: fieldValidators.stringOptional,
  swift: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

// Signature Schema
const SignatureSchema = z.object({
  data: fieldValidators.stringOptional,
  fontFamily: fieldValidators.stringOptional,
}).passthrough().optional().nullable();

// Unified Invoice Details Schema
const InvoiceDetailsSchema = z.object({
  // Basic invoice info
  invoiceNumber: fieldValidators.stringOptional,
  invoiceDate: fieldValidators.dateOptional,
  dueDate: fieldValidators.dateOptional,
  currency: fieldValidators.stringOptional,
  language: fieldValidators.stringOptional,
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
  
  // Global tax, discount, shipping (in addition to per-item)
  tax: AmountTypeSchema,
  discount: AmountTypeSchema,
  shipping: z.object({
    cost: fieldValidators.numberOptional,
    costType: fieldValidators.stringOptional,
  }).passthrough().optional().nullable(),
  
  // For backwards compatibility
  notes: fieldValidators.stringOptional, // Alias for additionalNotes
  terms: fieldValidators.stringOptional, // Alias for paymentTerms
  
  // Also include legacy field names for templates that still use them
  taxDetails: AmountTypeSchema,
  discountDetails: AmountTypeSchema,
  shippingDetails: z.object({
    cost: fieldValidators.numberOptional,
    costType: fieldValidators.stringOptional,
  }).passthrough().optional().nullable(),
});

// Unified Invoice Schema
export const InvoiceSchema = z.object({
  // MongoDB ID
  _id: fieldValidators.stringOptional,
  
  // Main sections
  sender: InvoiceSenderSchema.optional().nullable(),
  receiver: InvoiceReceiverSchema.optional().nullable(),
  details: InvoiceDetailsSchema.optional().nullable(),
  
  // Settings (will be merged into details in adapter functions)
  settings: z.object({
    logo: fieldValidators.stringOptional,
    template: fieldValidators.stringOptional,
    color: fieldValidators.stringOptional,
  }).optional().nullable(),
  
  // Items at root level (will be moved to details.items in adapter)
  items: fieldValidators.arrayOptional(ItemSchema),
  
  // Timestamps
  createdAt: fieldValidators.dateOptional,
  updatedAt: fieldValidators.dateOptional,
}).passthrough().optional().nullable(); 