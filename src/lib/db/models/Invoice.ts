import { InvoiceType } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

// Define the Invoice document interface extending the InvoiceType
export interface InvoiceDocument extends InvoiceType, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a schema for custom inputs
const CustomInputSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// Create a schema for invoice sender
const InvoiceSenderSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    customInputs: { type: [CustomInputSchema], required: false },
  },
  { _id: false }
);

// Create a schema for invoice receiver
const InvoiceReceiverSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    customInputs: { type: [CustomInputSchema], required: false },
  },
  { _id: false }
);

// Create a schema for invoice items
const ItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    tax: {
      amount: { type: Number, default: 0 },
      amountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' }
    },
    discount: { type: Number, required: false, default: 0 },
  },
  { _id: false }
);

// Create a schema for invoice details
const InvoiceDetailsSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    currency: { type: String, required: true },
    taxSystem: { type: String, required: true },
    notes: { type: String, required: false },
    terms: { type: String, required: false },
    signature: { type: String, required: false },
  },
  { _id: false }
);

// Create a schema for invoice settings
const InvoiceSettingsSchema = new Schema(
  {
    template: { type: String, required: true },
    color: { type: String, required: true },
    logo: { type: String, required: false },
  },
  { _id: false }
);

// Create the main invoice schema
const InvoiceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: InvoiceSenderSchema, required: true },
    receiver: { type: InvoiceReceiverSchema, required: true },
    items: { type: [ItemSchema], required: true },
    details: { type: InvoiceDetailsSchema, required: true },
    settings: { type: InvoiceSettingsSchema, required: true },
  },
  { timestamps: true }
);

// Check for any pre-save hooks that might be modifying tax values
InvoiceSchema.pre('save', function(next) {
  // ⚠️ Look for any code here that might be modifying tax values
  // Example of problematic code:
  // if (this.details && this.details.items) {
  //   this.details.items.forEach(item => {
  //     if (item.tax) item.tax.amount = 0; // This would reset all tax amounts
  //   });
  // }
  next();
});

// Create and export the Invoice model
export const Invoice = mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema); 