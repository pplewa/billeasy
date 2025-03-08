import { z } from 'zod';

// Field Validators with all requirements stripped out
const fieldValidators = {
  // All string fields are optional with no requirements
  stringOptional: z.string().optional().or(z.null()).or(z.literal('')),

  // Number fields allow any number or are optional
  numberOptional: z
    .union([
      z.number(),
      z.string().transform((val) => (val === '' ? undefined : Number(val))),
      z.undefined(),
      z.null(),
      z.literal(''),
    ])
    .optional(),

  // Dates accept any date or are optional
  dateOptional: z
    .union([
      z.date(),
      z.string().transform((val) => (val ? new Date(val) : undefined)),
      z.undefined(),
      z.null(),
      z.literal(''),
    ])
    .optional(),

  // Arrays are always optional
  arrayOptional: (schema: z.ZodType) => z.array(schema).optional().or(z.null()).or(z.literal('')),
};

// Custom Input Schema
const CustomInputSchema = z.object({
  key: fieldValidators.stringOptional,
  value: fieldValidators.stringOptional,
});

// Item Schema with no requirements
export const ItemSchema = z
  .object({
    id: fieldValidators.stringOptional,
    name: fieldValidators.stringOptional,
    description: fieldValidators.stringOptional,
    quantity: fieldValidators.numberOptional,
    unitPrice: fieldValidators.numberOptional,
    total: fieldValidators.numberOptional,
    // Backward compatibility fields
    taxRate: fieldValidators.numberOptional,
    discountRate: fieldValidators.numberOptional,
    // New structure
    tax: z.preprocess(
      (val) => val ?? {},
      z
        .object({
          amount: fieldValidators.numberOptional,
          amountType: fieldValidators.stringOptional,
        })
        .passthrough()
        .optional()
        .nullable()
    ),
    discount: z.preprocess(
      (val) => val ?? {},
      z
        .object({
          amount: fieldValidators.numberOptional,
          amountType: fieldValidators.stringOptional,
        })
        .passthrough()
        .optional()
        .nullable()
    ),
  })
  .passthrough()
  .optional()
  .nullable();

// Invoice Sender Schema with no requirements
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

// Invoice Receiver Schema with no requirements
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

// Invoice Details Schema with no requirements
const InvoiceDetailsSchema = z.object({
  invoiceNumber: fieldValidators.stringOptional,
  invoiceDate: fieldValidators.dateOptional,
  dueDate: fieldValidators.dateOptional,
  currency: fieldValidators.stringOptional,
  items: fieldValidators.arrayOptional(ItemSchema),
  subTotal: fieldValidators.numberOptional,
  totalAmount: fieldValidators.numberOptional,
  status: fieldValidators.stringOptional,
  additionalNotes: fieldValidators.stringOptional,
  paymentTerms: fieldValidators.stringOptional,
  // Template fields
  pdfTemplate: fieldValidators.numberOptional,
  invoiceLogo: fieldValidators.stringOptional,
  // Tax and discount fields
  tax: z.preprocess(
    (val) => val ?? {},
    z
      .object({
        amount: fieldValidators.numberOptional,
        amountType: fieldValidators.stringOptional,
      })
      .passthrough()
      .optional()
      .nullable()
  ),
  discount: z.preprocess(
    (val) => val ?? {},
    z
      .object({
        amount: fieldValidators.numberOptional,
        amountType: fieldValidators.stringOptional,
      })
      .passthrough()
      .optional()
      .nullable()
  ),
  // Signature field
  signature: z.preprocess(
    (val) => val ?? {},
    z
      .object({
        data: fieldValidators.stringOptional,
        fontFamily: fieldValidators.stringOptional,
      })
      .passthrough()
      .optional()
      .nullable()
  ),
});

// Super permissive Invoice Schema with no requirements
export const InvoiceSchema = z
  .object({
    sender: InvoiceSenderSchema.optional().nullable(),
    receiver: InvoiceReceiverSchema.optional().nullable(),
    details: InvoiceDetailsSchema.optional().nullable(),
  })
  .passthrough()
  .optional()
  .nullable();
