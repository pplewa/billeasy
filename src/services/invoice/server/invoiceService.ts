import connectToDatabase from "@/lib/db";
import { Invoice, InvoiceDocument } from "@/models/Invoice-optional";
import { InvoiceType } from "@/types-optional";

/**
 * Get all invoices from the database
 * @returns {Promise<InvoiceDocument[]>} A promise that resolves to an array of invoice documents
 */
export async function getAllInvoices(): Promise<InvoiceDocument[]> {
  await connectToDatabase();
  return Invoice.find().sort({ createdAt: -1 });
}

/**
 * Get a specific invoice by ID
 * @param {string} id - The ID of the invoice to fetch
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the invoice document or null if not found
 */
export async function getInvoiceById(
  id: string
): Promise<InvoiceDocument | null> {
  await connectToDatabase();
  return Invoice.findById(id);
}

/**
 * Create a new invoice
 * @param {InvoiceType} invoiceData - The invoice data to create
 * @returns {Promise<InvoiceDocument>} A promise that resolves to the created invoice document
 */
export async function createInvoice(
  invoiceData: InvoiceType
): Promise<InvoiceDocument> {
  await connectToDatabase();
  return Invoice.create(invoiceData);
}

/**
 * Update an existing invoice
 * @param {string} id - The ID of the invoice to update
 * @param {InvoiceType} invoiceData - The updated invoice data
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the updated invoice document or null if not found
 */
export async function updateInvoice(
  id: string,
  invoiceData: InvoiceType
): Promise<InvoiceDocument | null> {
  await connectToDatabase();
  return Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
}

/**
 * Delete an invoice
 * @param {string} id - The ID of the invoice to delete
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the deleted invoice document or null if not found
 */
export async function deleteInvoice(
  id: string
): Promise<InvoiceDocument | null> {
  await connectToDatabase();
  return Invoice.findByIdAndDelete(id);
}

/**
 * Duplicate an invoice
 * @param {string} id - The ID of the invoice to duplicate
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the duplicated invoice document or null if the original was not found
 */
export async function duplicateInvoice(
  id: string
): Promise<InvoiceDocument | null> {
  await connectToDatabase();

  // Find the original invoice
  const originalInvoice = await Invoice.findById(id);

  if (!originalInvoice) {
    return null;
  }

  // Create a copy of the invoice data
  const invoiceData = originalInvoice.toObject();

  // Remove the _id field to create a new document
  delete invoiceData._id;

  // Update the invoice number to indicate it's a copy
  invoiceData.details.invoiceNumber = `${invoiceData.details.invoiceNumber}-COPY`;

  // Create a new invoice with the copied data
  return Invoice.create(invoiceData);
} 