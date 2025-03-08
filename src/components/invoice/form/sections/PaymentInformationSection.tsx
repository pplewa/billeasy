'use client';

import { useFormContext } from 'react-hook-form';

import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { InvoiceType } from '@/types';

export function PaymentInformationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceType>();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Bank Name"
          {...register('details.paymentInformation.bankName')}
          error={errors.details?.paymentInformation?.bankName?.message}
          placeholder="Bank name"
        />

        <FormInput
          label="Account Name"
          {...register('details.paymentInformation.accountName')}
          error={errors.details?.paymentInformation?.accountName?.message}
          placeholder="Account holder name"
        />

        <FormInput
          label="Account Number"
          {...register('details.paymentInformation.accountNumber')}
          error={errors.details?.paymentInformation?.accountNumber?.message}
          placeholder="Account number"
        />

        <FormInput
          label="Payment Terms"
          {...register('details.paymentTerms')}
          error={errors.details?.paymentTerms?.message}
          placeholder="e.g., Net 30"
        />
      </CardContent>
    </Card>
  );
}
