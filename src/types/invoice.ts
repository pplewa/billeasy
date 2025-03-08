export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface PaymentInformation {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  purchaseOrderNumber?: string;
  invoiceDate: Date | null;
  dueDate: Date | null;
  currency: string;
  status: InvoiceStatus;
  paymentInformation: PaymentInformation;
  paymentTerms: string;
}

export interface InvoiceFormData {
  details: InvoiceDetails;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
    tax?: number;
    discount?: number;
  }>;
  notes?: string;
  terms?: string;
  signature?: {
    data: string;
    date: Date;
  };
}
