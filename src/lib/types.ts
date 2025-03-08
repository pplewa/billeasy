/**
 * Consolidated types file that exports all types and interfaces
 * used throughout the application
 */
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { Invoice } from './schemas/invoice';
import { InvoiceItem } from './schemas/item';

/**
 * Core type definitions
 */

// Invoice types
export type InvoiceType = Invoice;
export type ItemType = InvoiceItem;

// Enhanced invoice type with React Hook Form compatibility
export type FormInvoiceType = InvoiceType & FieldValues;
export type FormType = UseFormReturn<FormInvoiceType>;
export type NameType = FieldPath<FormInvoiceType>;

// Basic types
export type CurrencyType = string;

/**
 * Application specific types
 */

// Invoice status types
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

// Currency details type
export type CurrencyDetails = {
  currency: string;
  decimals: number;
  beforeDecimal: string;
  afterDecimal: string | null;
};

// Signature related types
export type SignatureColor = {
  name: string;
  label: string;
  color: string;
};

export type SignatureFont = {
  name: string;
  variable: string;
};

export enum SignatureTabs {
  DRAW = 'draw',
  TYPE = 'type',
  UPLOAD = 'upload',
}

// UI related types
export type WizardStepType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

// Export types
export enum ExportTypes {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
}

// Custom input type
export type CustomInputType = {
  key: string;
  value: string;
};

/**
 * Re-export everything from the schemas for convenience
 */
export * from './schemas';
