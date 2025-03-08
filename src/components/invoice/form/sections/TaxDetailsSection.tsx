'use client';

import { useFormContext } from 'react-hook-form';

import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { InvoiceType } from '@/types';

export function TaxDetailsSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceType>();

  const taxAmountType = watch('details.taxDetails.amountType');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tax Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Tax ID"
          {...register('details.tax.taxID')}
          error={errors.details?.tax?.taxID?.message}
          placeholder="Tax ID number"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tax Amount"
            type="number"
            step="0.01"
            {...register('details.tax.amount', {
              valueAsNumber: true,
            })}
            error={errors.details?.tax?.amount?.message}
            placeholder="0.00"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Type</label>
            <Select
              value={taxAmountType}
              onValueChange={(value) => setValue('details.tax.amountType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select amount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            {errors.details?.tax?.amountType?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.tax.amountType.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
