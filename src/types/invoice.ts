export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceFormData {
  invoiceNumber: string;
  purchaseOrderNumber?: string;
  invoiceDate: Date | null;
  dueDate: Date | null;
  currency: string;
  status: InvoiceStatus;
}
