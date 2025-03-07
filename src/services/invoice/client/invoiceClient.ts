import { InvoiceType } from "@/types-optional";

/**
 * Fetch all invoices from the API
 * @returns {Promise<InvoiceType[]>} A promise that resolves to an array of invoices
 * @throws {Error} If there is an error fetching the invoices
 */
export async function fetchInvoices() {
  const response = await fetch("/api/invoices", {
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

/**
 * Create a new invoice
 * @param {InvoiceType} invoiceData - The invoice data to create
 * @returns {Promise<InvoiceType>} A promise that resolves to the created invoice
 * @throws {Error} If there is an error creating the invoice
 */
export async function createInvoice(invoiceData: InvoiceType) {
  // Create a deep copy of the invoice data
  const processedData = JSON.parse(JSON.stringify(invoiceData));

  // Convert date strings to Date objects for validation
  if (processedData.details.invoiceDate) {
    processedData.details.invoiceDate = new Date(
      processedData.details.invoiceDate
    );
  }

  if (processedData.details.dueDate) {
    processedData.details.dueDate = new Date(
      processedData.details.dueDate
    );
  }

  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(processedData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create invoice");
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
  // Create a deep copy of the invoice data
  const processedData = JSON.parse(JSON.stringify(invoiceData));

  // Convert date strings to Date objects for validation
  if (processedData.details.invoiceDate) {
    processedData.details.invoiceDate = new Date(
      processedData.details.invoiceDate
    );
  }

  if (processedData.details.dueDate) {
    processedData.details.dueDate = new Date(
      processedData.details.dueDate
    );
  }

  const response = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(processedData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update invoice");
  }

  return response.json();
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