'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('form.discountDetails');

  const discountAmountType = watch('details.discount.amountType');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label={t('discountAmount', { defaultValue: 'Discount Amount' })}
            type="number"
            step="0.01"
            {...register('details.discount.amount', {
              valueAsNumber: true,
            })}
            error={errors.details?.discount?.amount?.message}
            placeholder="0.00"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('amountType', { defaultValue: 'Amount Type' })}
            </label>
            <Select
              value={discountAmountType || undefined}
              onValueChange={(value) => setValue('details.discount.amountType', value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('amountTypePlaceholder', { defaultValue: 'Select amount type' })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  {t('amountTypePercentage', { defaultValue: 'Percentage (%)' })}
                </SelectItem>
                <SelectItem value="fixed">
                  {t('amountTypeFixed', { defaultValue: 'Fixed Amount' })}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.details?.discount?.amountType?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.discount.amountType.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
