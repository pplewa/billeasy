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

export function ShippingDetailsSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceType>();

  const shippingCostType = watch('details.shippingDetails.costType');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shipping Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Shipping Cost"
            type="number"
            step="0.01"
            {...register('details.shippingDetails.cost', {
              valueAsNumber: true,
            })}
            error={errors.details?.shippingDetails?.cost?.message}
            placeholder="0.00"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Cost Type</label>
            <Select
              value={shippingCostType}
              onValueChange={(value) => setValue('details.shippingDetails.costType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            {errors.details?.shippingDetails?.costType?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.shippingDetails.costType.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
