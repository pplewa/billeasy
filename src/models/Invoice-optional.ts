import mongoose, { Document, Schema } from "mongoose";
import { InvoiceType } from "@/types-optional";

export interface InvoiceDocument extends InvoiceType, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Schema with minimal validation
const InvoiceSchema = new Schema(
  {
    sender: { type: Schema.Types.Mixed },
    receiver: { type: Schema.Types.Mixed },
    details: { type: Schema.Types.Mixed },
  },
  { 
    timestamps: true, 
    strict: false,
    _id: true,
    validateBeforeSave: false // Disable validation before save
  }
);

export const Invoice = mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema); 