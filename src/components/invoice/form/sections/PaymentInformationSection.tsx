'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { InvoiceFormData } from '@/types/invoice';

export function PaymentInformationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormData>();
  const t = useTranslations('form.paymentInfo');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label={t('bankName')}
          {...register('details.paymentInformation.bankName')}
          error={errors.details?.paymentInformation?.bankName?.message}
          placeholder={t('bankNamePlaceholder')}
        />

        <FormInput
          label={t('accountName')}
          {...register('details.paymentInformation.accountName')}
          error={errors.details?.paymentInformation?.accountName?.message}
          placeholder={t('accountNamePlaceholder')}
        />

        <FormInput
          label={t('accountNumber')}
          {...register('details.paymentInformation.accountNumber')}
          error={errors.details?.paymentInformation?.accountNumber?.message}
          placeholder={t('accountNumberPlaceholder')}
        />

        <FormInput
          label={t('paymentTerms', { defaultValue: 'Payment Terms' })}
          {...register('details.paymentTerms')}
          error={errors.details?.paymentTerms?.message}
          placeholder={t('paymentTermsPlaceholder', { defaultValue: 'e.g., Net 30' })}
        />
      </CardContent>
    </Card>
  );
}
