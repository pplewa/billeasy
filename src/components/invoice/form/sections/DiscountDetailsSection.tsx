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

export function DiscountDetailsSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceType>();

  const discountAmountType = watch('details.discountDetails.amountType');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Discount Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Discount Amount"
            type="number"
            step="0.01"
            {...register('details.discountDetails.amount', {
              valueAsNumber: true,
            })}
            error={errors.details?.discountDetails?.amount?.message}
            placeholder="0.00"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Type</label>
            <Select
              value={discountAmountType}
              onValueChange={(value) => setValue('details.discountDetails.amountType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select amount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            {errors.details?.discountDetails?.amountType?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.discountDetails.amountType.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
