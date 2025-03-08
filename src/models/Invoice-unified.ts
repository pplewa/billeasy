/**
 * Mongoose model for invoices with improved type safety
 */
import mongoose, { Document, Schema } from 'mongoose';
import type { Invoice as InvoiceType } from '@/lib/schemas/invoice';
import { processInvoice } from '@/lib/schemas/invoice';

/**
 * Extended Invoice interface with Mongoose Document properties
 */
export interface InvoiceDocument extends Omit<InvoiceType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for invoices with flexible structure
 * Uses Schema.Types.Mixed to allow storage of any valid invoice structure
 * Type validation and transformation is handled by Zod schemas
 */
const InvoiceSchema = new Schema(
  {
    sender: { type: Schema.Types.Mixed },
    receiver: { type: Schema.Types.Mixed },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    strict: false, // Don't enforce schema structure at Mongoose level
    _id: true,
    validateBeforeSave: false, // Disable Mongoose validation
  }
);

/**
 * Pre-save hook to process invoice data
 * This ensures invoice data is consistent before saving to the database
 */
InvoiceSchema.pre('save', function (next) {
  try {
    // Transform this document using our processInvoice function
    const processedData = processInvoice(this);

    // Apply processed data to this document
    this.sender = processedData.sender;
    this.receiver = processedData.receiver;
    this.details = processedData.details;

    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

/**
 * Custom method to validate an invoice
 * This validates the invoice against the Zod schema
 */
InvoiceSchema.methods.validate = function () {
  return processInvoice(this);
};

/**
 * Export the Mongoose model
 */
export const Invoice =
  (mongoose.models.Invoice as mongoose.Model<InvoiceDocument>) ||
  mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
