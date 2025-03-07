import { z } from "zod";

// Field Validators
const fieldValidators = {
  name: z
    .string()
    .min(2, { message: "Must be at least 2 characters" })
    .max(50, { message: "Must be at most 50 characters" })
    .optional(),
  address: z
    .string()
    .min(2, { message: "Must be at least 2 characters" })
    .max(70, { message: "Must be between 2 and 70 characters" })
    .optional(),
  zipCode: z
    .string()
    .min(2, { message: "Must be between 2 and 20 characters" })
    .max(20, { message: "Must be between 2 and 20 characters" })
    .optional(),
  city: z
    .string()
    .min(1, { message: "Must be between 1 and 50 characters" })
    .max(50, { message: "Must be between 1 and 50 characters" })
    .optional(),
  country: z
    .string()
    .min(1, { message: "Must be between 1 and 70 characters" })
    .max(70, { message: "Must be between 1 and 70 characters" })
    .optional(),
  email: z
    .string()
    .email({ message: "Email must be a valid email" })
    .min(5, { message: "Must be between 5 and 30 characters" })
    .max(30, { message: "Must be between 5 and 30 characters" })
    .optional(),
  phone: z
    .string()
    .min(1, { message: "Must be between 1 and 50 characters" })
    .max(50, {
      message: "Must be between 1 and 50 characters",
    })
    .optional(),

  // Dates
  date: z.coerce.date().optional(),

  // Items
  quantity: z.coerce
    .number()
    .min(1, { message: "Must be a number greater than 0" })
    .optional(),
  unitPrice: z.coerce
    .number()
    .min(1, { message: "Must be a number greater than 0" })
    .optional(),

  // Strings
  string: z.string().optional(),
  stringMin1: z.string().min(1, { message: "Must be at least 1 character" }).optional(),
  stringToNumber: z.coerce.number().optional(),

  // Charges
  stringToNumberWithMax: z.coerce.number().max(1000000).optional(),

  stringOptional: z.string().optional(),

  nonNegativeNumber: z.coerce.number().nonnegative({
    message: "Must be a positive number",
  }).optional(),
};

// Custom Input Schema
const CustomInputSchema = z.object({
  key: z.string().optional(),
  value: z.string().optional(),
});

// Item Schema
export const ItemSchema = z.object({
  id: z.string().optional(),
  name: fieldValidators.stringOptional,
  description: fieldValidators.stringOptional,
  quantity: fieldValidators.nonNegativeNumber,
  unitPrice: fieldValidators.nonNegativeNumber,
  total: fieldValidators.nonNegativeNumber,
  tax: z.preprocess(
    (val) => val ?? {},
    z.object({
      amount: fieldValidators.nonNegativeNumber,
      amountType: z.enum(["percentage", "fixed"]).optional(),
    }).passthrough().optional()
  ),
  discount: z.preprocess(
    (val) => val ?? {},
    z.object({
      amount: fieldValidators.nonNegativeNumber,
      amountType: z.enum(["percentage", "fixed"]).optional(),
    }).passthrough().optional()
  ),
}).partial().passthrough();

// Invoice Sender Schema
const InvoiceSenderSchema = z.object({
  name: fieldValidators.name,
  address: fieldValidators.address,
  zipCode: fieldValidators.zipCode,
  city: fieldValidators.city,
  country: fieldValidators.country,
  email: fieldValidators.email,
  phone: fieldValidators.phone,
  customInputs: z.array(CustomInputSchema).optional(),
}).partial();

// Invoice Receiver Schema
const InvoiceReceiverSchema = z.object({
  name: fieldValidators.name,
  address: fieldValidators.address,
  zipCode: fieldValidators.zipCode,
  city: fieldValidators.city,
  country: fieldValidators.country,
  email: fieldValidators.email,
  phone: fieldValidators.phone,
  customInputs: z.array(CustomInputSchema).optional(),
}).partial();

// Payment Information Schema
const PaymentInformationSchema = z.object({
  bankName: fieldValidators.stringOptional,
  accountName: fieldValidators.stringOptional,
  accountNumber: fieldValidators.stringOptional,
}).partial();

// Discount Details Schema
const DiscountDetailsSchema = z.object({
  amount: fieldValidators.stringToNumberWithMax,
  amountType: fieldValidators.string,
}).partial();

// Tax Details Schema
const TaxDetailsSchema = z.object({
  amount: fieldValidators.stringToNumberWithMax,
  taxID: fieldValidators.string,
  amountType: fieldValidators.string,
}).partial();

// Shipping Details Schema
const ShippingDetailsSchema = z.object({
  cost: fieldValidators.stringToNumberWithMax,
  costType: fieldValidators.string,
}).partial();

// Signature Schema
const SignatureSchema = z.object({
  data: fieldValidators.string.optional(),
  fontFamily: fieldValidators.string.optional(),
});

// Invoice Details Schema
const InvoiceDetailsSchema = z.object({
  invoiceLogo: fieldValidators.stringOptional,
  invoiceNumber: fieldValidators.stringOptional,
  invoiceDate: fieldValidators.date,
  dueDate: fieldValidators.date,
  purchaseOrderNumber: fieldValidators.stringOptional,
  currency: fieldValidators.stringOptional,
  language: fieldValidators.stringOptional,
  status: z.string().optional().default("draft"),
  items: z.array(ItemSchema).optional(),
  paymentInformation: PaymentInformationSchema.optional(),
  taxDetails: TaxDetailsSchema.optional(),
  discountDetails: DiscountDetailsSchema.optional(),
  shippingDetails: ShippingDetailsSchema.optional(),
  subTotal: fieldValidators.nonNegativeNumber,
  totalAmount: fieldValidators.nonNegativeNumber,
  totalAmountInWords: fieldValidators.stringOptional,
  additionalNotes: fieldValidators.stringOptional,
  paymentTerms: fieldValidators.stringOptional,
  signature: SignatureSchema.optional(),
  updatedAt: fieldValidators.stringOptional,
  pdfTemplate: z.number().optional(),
}).partial();

// Invoice Schema
export const InvoiceSchema = z.object({
  sender: InvoiceSenderSchema,
  receiver: InvoiceReceiverSchema,
  details: InvoiceDetailsSchema,
}).partial().passthrough(); 