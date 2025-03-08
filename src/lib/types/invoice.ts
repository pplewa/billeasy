import { InvoiceSchemaTypeForm } from '../schemas/invoice';

// Re-export the form type
export type FormInvoiceType = InvoiceSchemaTypeForm;

// Custom input type that matches the schema
export interface CustomInput {
  key?: string | null;
  value?: string | null;
}

// Address info that matches the schema
export interface AddressInfo {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  zipCode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  customInputs?: CustomInput[] | null;
}

// Base amount type
export interface BaseAmount {
  amount: number;
  amountType: 'percentage' | 'amount';
}

// Tax and discount types
export interface TaxInfo extends BaseAmount {
  taxId?: string;
  taxName?: string;
}

export interface DiscountInfo extends BaseAmount {
  discountCode?: string;
  discountName?: string;
}

// Item types
export interface FormItemType {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax: TaxInfo;
  discount: DiscountInfo;
}

// Parsed types that match the form types but are partial
export type ParsedItemType = Partial<FormItemType>;

export interface ParsedInvoiceDetails {
  items?: ParsedItemType[] | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | Date | null;
  dueDate?: string | Date | null;
  currency?: string | null;
  subTotal?: number | null;
  totalAmount?: number | null;
  status?: string;
  purchaseOrderNumber?: string;
  paymentInformation?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
  signature?: {
    data: string;
    fontFamily?: string;
  };
  additionalNotes?: string;
  paymentTerms?: string;
  invoiceLogo?: string;
}

export interface ParsedInvoiceType {
  sender?: AddressInfo | null;
  receiver?: AddressInfo | null;
  details?: ParsedInvoiceDetails | null;
}

// Type guard functions
export function isFormInvoiceType(invoice: unknown): invoice is FormInvoiceType {
  const inv = invoice as FormInvoiceType;
  return (
    inv !== null && typeof inv === 'object' && 'details' in inv && Array.isArray(inv.details?.items)
  );
}

export function isParsedInvoiceType(invoice: unknown): invoice is ParsedInvoiceType {
  const inv = invoice as ParsedInvoiceType;
  return (
    inv !== null &&
    typeof inv === 'object' &&
    (!inv.details?.items || Array.isArray(inv.details.items))
  );
}

export function isValidItemsArray(items: unknown): items is ParsedItemType[] {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((item) => typeof item === 'object' && item !== null && 'id' in item)
  );
}

export interface DraftInvoice extends FormInvoiceType {
  id: string;
  createdAt: string;
}
