import { z } from "zod";
import { InvoiceSchema, ItemSchema } from "@/lib/schemas-unified";
import { FieldValues } from "react-hook-form";

// Form types with relaxed validation
export type InvoiceType = z.infer<typeof InvoiceSchema>;
export type ItemType = z.infer<typeof ItemSchema>;

// Form-compatible invoice type for React Hook Form
export interface FormInvoiceType extends FieldValues {
  _id?: string | null;
  sender?: {
    name?: string | null;
    address?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    email?: string | null;
    phone?: string | null;
    customInputs?: Array<{ key?: string | null; value?: string | null }> | null;
  } | null;
  receiver?: {
    name?: string | null;
    address?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    email?: string | null;
    phone?: string | null;
    customInputs?: Array<{ key?: string | null; value?: string | null }> | null;
  } | null;
  details?: {
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    dueDate?: Date | string | null;
    currency?: string | null;
    notes?: string | null;
    terms?: string | null;
    status?: string | null;
    subTotal?: number | null;
    totalAmount?: number | null;
    items?: Array<{
      id?: string;
      name?: string | null;
      description?: string | null;
      quantity?: number | null;
      unitPrice?: number | null;
      price?: number | null;
      total?: number | null;
      tax?: {
        amount: number;
        amountType: string;
      } | null;
      discount?: {
        amount: number;
        amountType: string;
      } | null;
      taxRate?: number | null;
      discountRate?: number | null;
    }> | null;
    tax?: {
      amount: number;
      amountType: string;
    } | null;
    discount?: {
      amount: number;
      amountType: string;
    } | null;
    shipping?: {
      cost: number;
      costType: string;
    } | null;
    payment?: {
      bankName?: string | null;
      accountName?: string | null;
      accountNumber?: string | null;
      routingNumber?: string | null;
      swiftBic?: string | null;
      iban?: string | null;
      paymentTerms?: string | null;
      paymentMethod?: string | null;
      paymentNotes?: string | null;
    } | null;
    signature?: {
      data?: string | null;
      fontFamily?: string | null;
    } | null;
  } | null;
  settings?: {
    logo?: string | null;
    template?: string | null;
    color?: string | null;
  } | null;
  items?: Array<{
    id?: string;
    name?: string | null;
    description?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    price?: number | null;
    total?: number | null;
    tax?: {
      amount: number;
      amountType: string;
    } | null;
    discount?: {
      amount: number;
      amountType: string;
    } | null;
    taxRate?: number | null;
    discountRate?: number | null;
  }> | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
} 