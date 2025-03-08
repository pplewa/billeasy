'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceFormData, InvoiceStatus } from '@/types/invoice';
import { INVOICE_STATUS_OPTIONS } from '@/constants/invoice';

export function Step3() {
  const { register, setValue, watch } = useFormContext<InvoiceFormData>();
  const invoiceDate = watch('details.invoiceDate');
  const dueDate = watch('details.dueDate');
  const status = watch('details.status');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="invoiceNumber" className="text-sm font-medium">
            Invoice Number
          </label>
          <Input id="invoiceNumber" placeholder="INV-001" {...register('details.invoiceNumber')} />
        </div>
        <div className="space-y-2">
          <label htmlFor="purchaseOrderNumber" className="text-sm font-medium">
            Purchase Order Number
          </label>
          <Input
            id="purchaseOrderNumber"
            placeholder="PO-001"
            {...register('details.purchaseOrderNumber')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="invoiceDate" className="text-sm font-medium">
            Invoice Date
          </label>
          <DatePicker value={invoiceDate} onChange={(date) => setValue('details.invoiceDate', date)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due Date
          </label>
          <DatePicker value={dueDate} onChange={(date) => setValue('details.dueDate', date)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Currency
          </label>
          <Input id="currency" placeholder="USD" {...register('details.currency')} />
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value: InvoiceStatus) => setValue('details.status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
