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

  // Computed properties
  readonly tax: number;
  readonly discount: number;
}

export interface InvoiceFormData {
  details: {
    invoiceNumber?: string;
    invoiceDate?: Date;
    dueDate?: Date;
    currency?: string;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      price: number;
      tax?: {
        amount: number;
        amountType: 'percentage' | 'fixed';
      };
      discount?: {
        amount: number;
        amountType: 'percentage' | 'fixed';
      };
    }>;
    subTotal?: number;
    totalAmount?: number;
    totalTax?: number;
    paymentInformation: PaymentInformation;
    paymentTerms: string;
    totalDiscount?: number;
  };
  notes?: string;
  terms?: string;
  signature?: {
    data: string;
    date: Date;
  };
}
