import connectToDatabase from '@/lib/db';
import { Invoice, InvoiceDocument } from '@/models/Invoice-unified';
import { processInvoice } from '@/lib/schemas/invoice';
import type { Invoice as InvoiceType } from '@/lib/schemas/invoice';

/**
 * Interface for pagination and filter options
 */
interface FetchOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * Interface for paginated invoice response
 */
interface PaginatedInvoices {
  invoices: InvoiceDocument[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Get all invoices from the database with pagination and filtering
 * @param {FetchOptions} options - Options for pagination and filtering
 * @returns {Promise<PaginatedInvoices>} A promise that resolves to a paginated invoice response
 */
export async function getAllInvoices(options: FetchOptions = {}): Promise<PaginatedInvoices> {
  await connectToDatabase();

  const { page = 1, limit = 9, status = '', search = '' } = options;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build the filter object
  const filter: Record<string, unknown> = {};

  // Add status filter if provided
  if (status) {
    filter['details.status'] = status;
  }

  // Add search filter if provided
  if (search) {
    // Create a text search filter across multiple fields
    filter['$or'] = [
      { 'details.invoiceNumber': { $regex: search, $options: 'i' } },
      { 'sender.name': { $regex: search, $options: 'i' } },
      { 'receiver.name': { $regex: search, $options: 'i' } },
    ];
  }

  // Get total count
  const totalCount = await Invoice.countDocuments(filter);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // Check if there are more pages
  const hasMore = page < totalPages;

  // Get paginated invoices with sorting
  const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  return {
    invoices,
    totalCount,
    totalPages,
    currentPage: page,
    hasMore,
  };
}

/**
 * Get an invoice by ID
 * @param {string} id - The ID of the invoice to retrieve
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the invoice document or null if not found
 */
export async function getInvoiceById(id: string): Promise<InvoiceDocument | null> {
  await connectToDatabase();
  return Invoice.findById(id);
}

/**
 * Create a new invoice
 * @param {InvoiceType} invoiceData - The invoice data to create
 * @returns {Promise<InvoiceDocument>} A promise that resolves to the created invoice document
 */
export async function createInvoice(invoiceData: InvoiceType): Promise<InvoiceDocument> {
  await connectToDatabase();

  // Process invoice data through schema validation and transformation
  const processedData = processInvoice(invoiceData);

  // Create the invoice with processed data
  return Invoice.create(processedData);
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
  try {
    await connectToDatabase();

    // Process invoice data through schema validation and transformation
    const processedData = processInvoice(invoiceData);

    // Perform the update with processed data
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      // Use $set to ensure we replace the entire document structure
      { $set: processedData },
      // Important: Return the new document and run validators
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return null;
    }

    return updatedInvoice;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

/**
 * Delete an invoice
 * @param {string} id - The ID of the invoice to delete
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the deleted invoice document or null if not found
 */
export async function deleteInvoice(id: string): Promise<InvoiceDocument | null> {
  await connectToDatabase();
  return Invoice.findByIdAndDelete(id);
}

/**
 * Duplicate an invoice
 * @param {string} id - The ID of the invoice to duplicate
 * @returns {Promise<InvoiceDocument | null>} A promise that resolves to the duplicated invoice document or null if not found
 */
export async function duplicateInvoice(id: string): Promise<InvoiceDocument | null> {
  await connectToDatabase();

  // Find the original invoice
  const origInvoice = await Invoice.findById(id);

  if (!origInvoice) {
    return null;
  }

  // Convert the document to a plain JavaScript object
  const invoiceData = origInvoice.toObject();

  // Remove the _id field to create a new document
  delete invoiceData._id;

  // Optionally modify some fields
  if (invoiceData.details) {
    const details = invoiceData.details;

    // Append "- Copy" to invoice number
    if (details.invoiceNumber) {
      details.invoiceNumber = `${details.invoiceNumber} - Copy`;
    }

    // Set status to draft
    details.status = 'draft';
  }

  // Create a new invoice with the duplicated data
  return createInvoice(invoiceData);
}
