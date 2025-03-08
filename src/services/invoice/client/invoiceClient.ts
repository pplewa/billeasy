import { InvoiceType } from "@/types-optional";
import { FormInvoiceType } from '@/lib/types/invoice';

/**
 * Interface for pagination and filter options
 */
export interface FetchOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * Interface for paginated invoice response
 */
export interface PaginatedInvoices {
  invoices: InvoiceType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Fetch invoices from the API with pagination and filtering
 * @param {FetchOptions} options - Options for pagination and filtering
 * @returns {Promise<PaginatedInvoices>} A promise that resolves to a paginated invoice response
 * @throws {Error} If there is an error fetching the invoices
 */
export async function fetchInvoices(options: FetchOptions = {}): Promise<PaginatedInvoices> {
  const { page = 1, limit = 9, status = "", search = "" } = options;
  
  // Build query string
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  if (status) {
    params.append("status", status);
  }
  
  if (search) {
    params.append("search", search);
  }
  
  const queryString = params.toString();
  const url = `/api/invoices${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invoices");
  }

  return response.json();
}

/**
 * Fetch a specific invoice by ID
 * @param {string} id - The ID of the invoice to fetch
 * @returns {Promise<InvoiceType>} A promise that resolves to the invoice
 * @throws {Error} If there is an error fetching the invoice
 */
export async function fetchInvoiceById(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invoice");
  }

  return response.json();
}

interface InvoiceResponse {
  _id: string;
  [key: string]: unknown;
}

/**
 * Create a new invoice
 * @param {FormInvoiceType} invoice - The invoice data to create
 * @returns {Promise<InvoiceResponse>} A promise that resolves to the created invoice
 * @throws {Error} If there is an error creating the invoice
 */
export async function createInvoice(invoice: FormInvoiceType): Promise<InvoiceResponse> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }

  return response.json();
}

/**
 * Update an existing invoice
 * @param {string} id - The ID of the invoice to update
 * @param {InvoiceType} invoiceData - The updated invoice data
 * @returns {Promise<InvoiceType>} A promise that resolves to the updated invoice
 * @throws {Error} If there is an error updating the invoice
 */
export async function updateInvoice(id: string, invoiceData: InvoiceType) {
  try {
    // BEFORE MAKING THE API CALL
    // Transform data to ensure tax is properly included
    
    // Make the API call
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update invoice");
    }

    return response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to update invoice");
    }
    throw new Error("Failed to update invoice");
  }
}

/**
 * Delete an invoice
 * @param {string} id - The ID of the invoice to delete
 * @returns {Promise<{ success: boolean }>} A promise that resolves to a success message
 * @throws {Error} If there is an error deleting the invoice
 */
export async function deleteInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete invoice");
  }

  return response.json();
}

/**
 * Duplicate an invoice
 * @param {string} id - The ID of the invoice to duplicate
 * @returns {Promise<InvoiceType>} A promise that resolves to the duplicated invoice
 * @throws {Error} If there is an error duplicating the invoice
 */
export async function duplicateInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}?action=duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to duplicate invoice");
  }

  return response.json();
} 