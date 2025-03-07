import mongoose, { Document, Schema } from "mongoose";
import { InvoiceType } from "@/types";

export interface InvoiceDocument extends InvoiceType, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Custom Input Schema
const CustomInputSchema = new Schema(
  {
    key: { type: String },
    value: { type: String },
  },
  { _id: false, strict: false }
);

// Invoice Sender Schema
const InvoiceSenderSchema = new Schema(
  {
    name: { type: String },
    address: { type: String },
    zipCode: { type: String },
    city: { type: String },
    country: { type: String },
    email: { type: String },
    phone: { type: String },
    customInputs: [CustomInputSchema],
  },
  { _id: false, strict: false }
);

// Invoice Receiver Schema
const InvoiceReceiverSchema = new Schema(
  {
    name: { type: String },
    address: { type: String },
    zipCode: { type: String },
    city: { type: String },
    country: { type: String },
    email: { type: String },
    phone: { type: String },
    customInputs: [CustomInputSchema],
  },
  { _id: false, strict: false }
);

// Item Schema
const ItemSchema = new Schema(
  {
    id: { type: String },
    name: { type: String },
    description: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    total: { type: Number },
    tax: {
      type: {
        amount: { type: Number },
        amountType: { type: String }
      },
      required: false
    },
    discount: {
      type: {
        amount: { type: Number },
        amountType: { type: String }
      },
      required: false
    }
  },
  { _id: false, strict: false }
);

// Payment Information Schema
const PaymentInformationSchema = new Schema(
  {
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
  },
  { _id: false, strict: false }
);

// Discount Details Schema
const DiscountDetailsSchema = new Schema(
  {
    amount: { type: Number },
    amountType: { type: String },
  },
  { _id: false, strict: false }
);

// Tax Details Schema
const TaxDetailsSchema = new Schema(
  {
    amount: { type: Number },
    taxID: { type: String },
    amountType: { type: String },
  },
  { _id: false, strict: false }
);

// Shipping Details Schema
const ShippingDetailsSchema = new Schema(
  {
    cost: { type: Number },
    costType: { type: String },
  },
  { _id: false, strict: false }
);

// Signature Schema
const SignatureSchema = new Schema(
  {
    data: { type: String },
    fontFamily: { type: String },
  },
  { _id: false, strict: false }
);

// Invoice Details Schema
const InvoiceDetailsSchema = new Schema(
  {
    invoiceLogo: { type: String },
    invoiceNumber: { type: String },
    invoiceDate: { type: Date },
    dueDate: { type: Date },
    purchaseOrderNumber: { type: String },
    currency: { type: String },
    language: { type: String },
    items: [ItemSchema],
    paymentInformation: PaymentInformationSchema,
    taxDetails: TaxDetailsSchema,
    discountDetails: DiscountDetailsSchema,
    shippingDetails: ShippingDetailsSchema,
    subTotal: { type: Number },
    totalAmount: { type: Number },
    totalAmountInWords: { type: String },
    additionalNotes: { type: String },
    paymentTerms: { type: String },
    signature: SignatureSchema,
    updatedAt: { type: String },
    pdfTemplate: { type: Number },
  },
  { _id: false, strict: false }
);

// Invoice Schema
const InvoiceSchema = new Schema(
  {
    sender: { type: InvoiceSenderSchema },
    receiver: { type: InvoiceReceiverSchema },
    details: { type: InvoiceDetailsSchema },
  },
  { 
    timestamps: true, 
    strict: false,
    _id: true,
    validateBeforeSave: false // Disable validation before save
  }
);

export const Invoice = mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema); 