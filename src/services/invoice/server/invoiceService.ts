import connectToDatabase from "@/lib/db";
import { Invoice, InvoiceDocument } from "@/models/Invoice-optional";
import { InvoiceType } from "@/types-optional";

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
  
  const {
    page = 1,
    limit = 9,
    status = "",
    search = "",
  } = options;
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Build query filter
  const filter: Record<string, any> = {};
  
  // Add status filter if provided
  if (status) {
    filter["details.status"] = status;
  }
  
  // Add search query if provided
  if (search) {
    // Create a text search across multiple fields
    filter["$or"] = [
      { "receiver.name": { $regex: search, $options: "i" } },
      { "sender.name": { $regex: search, $options: "i" } },
      { "details.invoiceNumber": { $regex: search, $options: "i" } },
    ];
  }
  
  // Execute count query for pagination
  const totalCount = await Invoice.countDocuments(filter);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  // Execute query with pagination and sorting
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  return {
    invoices,
    totalCount,
    totalPages,
    currentPage: page,
    hasMore: page < totalPages,
  };
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
  try {
    // CRITICAL: Log the data just before database update
    console.log("About to update invoice in DB with tax data:", 
      invoiceData.details?.items?.map((item: any) => ({
        name: item.name,
        tax: item.tax
      }))
    );
    
    // FIX: Make sure we're using a proper update method that won't strip our data
    // For MongoDB/Mongoose (example):
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      // Use $set to ensure we replace the entire document structure
      { $set: invoiceData },
      // Important: Return the new document and run validators
      { new: true, runValidators: true }
    );
    
    // Log the updated document from the database
    console.log("Database returned updated invoice with tax:", 
      updatedInvoice.details?.items?.map((item: any) => ({
        name: item.name,
        tax: item.tax
      }))
    );
    
    return updatedInvoice;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
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