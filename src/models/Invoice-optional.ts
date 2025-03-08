import mongoose, { Document, Schema } from 'mongoose';
import { FormInvoiceType } from '@/types-optional';

export interface InvoiceDocument extends Document {
  sender?: FormInvoiceType['sender'];
  receiver?: FormInvoiceType['receiver'];
  details?: FormInvoiceType['details'];
  settings?: FormInvoiceType['settings'];
  items?: FormInvoiceType['items'];
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Schema with minimal validation
const InvoiceSchema = new Schema(
  {
    sender: { type: Schema.Types.Mixed },
    receiver: { type: Schema.Types.Mixed },
    details: { type: Schema.Types.Mixed },
    settings: { type: Schema.Types.Mixed },
    items: [{ type: Schema.Types.Mixed }],
  },
  {
    timestamps: true,
    strict: false,
    _id: true,
    validateBeforeSave: false, // Disable validation before save
  }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
