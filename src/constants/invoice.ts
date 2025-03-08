import { InvoiceStatus } from '@/types/invoice';

interface StatusOption {
  value: InvoiceStatus;
  label: string;
}

export const INVOICE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];
