import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormInvoiceType } from '@/types-optional';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

type AddressFields = {
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
};

export function AddressSwapButton() {
  const { toast } = useToast();
  const { getValues, setValue } = useFormContext<FormInvoiceType>();
  const t = useTranslations('invoice.addressSwap');

  const handleSwap = () => {
    // Get current values
    const sender = getValues('sender') || {};
    const receiver = getValues('receiver') || {};

    // Store values to swap
    const fieldsToSwap = ['name', 'email', 'phone', 'customInputs'] as const;

    // First swap non-address fields
    fieldsToSwap.forEach((field) => {
      const senderValue = sender[field];
      const receiverValue = receiver[field];

      setValue(`sender.${field}`, receiverValue || null, { shouldValidate: true });
      setValue(`receiver.${field}`, senderValue || null, { shouldValidate: true });
    });

    // Store address values before swap
    const addressFields = ['address', 'city', 'zipCode', 'country'] as const;
    const senderAddress = addressFields.reduce((acc, field) => {
      acc[field] = sender[field] || null;
      return acc;
    }, {} as AddressFields);

    const receiverAddress = addressFields.reduce((acc, field) => {
      acc[field] = receiver[field] || null;
      return acc;
    }, {} as AddressFields);

    // Perform the address swap
    addressFields.forEach((field) => {
      setValue(`sender.${field}`, receiverAddress[field], { shouldValidate: true });
      setValue(`receiver.${field}`, senderAddress[field], { shouldValidate: true });
    });

    toast({
      title: t('toast.title'),
      description: t('toast.description'),
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleSwap}
      className="rounded-full"
    >
      <ArrowLeftRight className="h-4 w-4" />
    </Button>
  );
}
