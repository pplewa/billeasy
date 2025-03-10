// Types
import { SignatureColor, SignatureFont } from '@/types';

/**
 * Environment
 */
export const ENV = process.env.NODE_ENV;

/**
 * Websites
 */
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * API endpoints
 */
export const SEND_PDF_API = '/api/invoice/send';
export const EXPORT_INVOICE_API = '/api/invoice/export';
export const SEND_INVOICE_API = '/api/invoice/send';

/**
 * External API endpoints
 */
export const CURRENCIES_API = 'https://openexchangerates.org/api/currencies.json';

/**
 * Nodemailer
 */
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL;
export const NODEMAILER_PW = process.env.NODEMAILER_PW;

/**
 * I18N
 */
export const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
];
export const DEFAULT_LOCALE = LOCALES[0].code;

/**
 * Signature variables
 */
export const SIGNATURE_COLORS: SignatureColor[] = [
  { name: 'black', label: 'Black', color: 'rgb(0, 0, 0)' },
  { name: 'dark blue', label: 'Dark Blue', color: 'rgb(0, 0, 128)' },
  {
    name: 'crimson',
    label: 'Crimson',
    color: '#DC143C',
  },
];

export const SIGNATURE_FONTS: SignatureFont[] = [
  {
    name: 'Dancing Script',
    variable: 'var(--font-dancing-script)',
  },
  { name: 'Parisienne', variable: 'var(--font-parisienne)' },
  {
    name: 'Great Vibes',
    variable: 'var(--font-great-vibes)',
  },
  {
    name: 'Alex Brush',
    variable: 'var(--font-alex-brush)',
  },
];

/**
 * Form date options
 */
export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * Form defaults
 */
export const FORM_DEFAULT_VALUES = {
  sender: {
    name: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    customInputs: [],
  },
  receiver: {
    name: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    customInputs: [],
  },
  details: {
    invoiceLogo: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    purchaseOrderNumber: '',
    items: [
      {
        id: '',
        name: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        total: 0,
      },
    ],
    currency: 'USD',
    taxDetails: {
      amount: 0,
      amountType: 'fixed',
      taxID: '',
    },
    discountDetails: {
      amount: 0,
      amountType: 'fixed',
    },
    paymentInformation: {
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
    additionalNotes: '',
    paymentTerms: '',
    totalAmountInWords: '',
    subTotal: 0,
    totalAmount: 0,
    pdfTemplate: 1,
  },
};

/**
 * ? DEV Only
 * Form auto fill values for testing
 */
export const FORM_FILL_VALUES = {
  sender: {
    name: 'John Doe',
    address: '123 Main St',
    zipCode: '12345',
    city: 'Anytown',
    country: 'USA',
    email: 'johndoe@example.com',
    phone: '123-456-7890',
  },
  receiver: {
    name: 'Jane Smith',
    address: '456 Elm St',
    zipCode: '54321',
    city: 'Other Town',
    country: 'Canada',
    email: 'janesmith@example.com',
    phone: '987-654-3210',
  },
  details: {
    invoiceLogo: '',
    invoiceNumber: 'INV0001',
    invoiceDate: new Date(),
    dueDate: new Date(),
    purchaseOrderNumber: 'PO12345',
    items: [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description of Product 1',
        quantity: 4,
        unitPrice: 50,
        total: 200,
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description of Product 2',
        quantity: 5,
        unitPrice: 50,
        total: 250,
      },
      {
        id: '3',
        name: 'Product 3',
        description: 'Description of Product 3',
        quantity: 5,
        unitPrice: 80,
        total: 400,
      },
    ],
    currency: 'USD',
    taxDetails: {
      amount: 15,
      amountType: 'percentage',
      taxID: '987654321',
    },
    discountDetails: {
      amount: 5,
      amountType: 'percentage',
    },
    paymentInformation: {
      bankName: 'Bank Inc.',
      accountName: 'John Doe',
      accountNumber: '445566998877',
    },
    additionalNotes: 'Thank you for your business',
    paymentTerms: 'Net 30',
    signature: {
      data: '',
      fontFamily: '',
    },
    subTotal: 850,
    totalAmount: 850,
    totalAmountInWords: 'Eight Hundred Fifty Dollars',
    pdfTemplate: 1,
  },
};
