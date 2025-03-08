'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, Trash } from 'lucide-react';
import { AddressLookahead, AddressDetails } from '@/components/ui/address-lookahead';

import { InvoiceType } from '@/types';

interface CustomInput {
  key?: string;
  value?: string;
}

interface CustomInputError {
  key?: { message?: string };
  value?: { message?: string };
}

interface SenderErrors {
  name?: { message?: string };
  address?: { message?: string };
  city?: { message?: string };
  zipCode?: { message?: string };
  country?: { message?: string };
  email?: { message?: string };
  phone?: { message?: string };
  customInputs?: Array<CustomInputError>;
}

interface FormErrors {
  sender?: SenderErrors;
}

export function BillFromSection() {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useFormContext<InvoiceType>();

  // Cast errors to our known type
  const typedErrors = errors as FormErrors;

  // Handle address selection from the lookahead component
  const handleAddressSelect = (addressDetails: AddressDetails) => {
    setValue('sender.address', addressDetails.address, {
      shouldValidate: true,
    });
    setValue('sender.city', addressDetails.city, { shouldValidate: true });
    setValue('sender.zipCode', addressDetails.zipCode, {
      shouldValidate: true,
    });
    setValue('sender.country', addressDetails.country, {
      shouldValidate: true,
    });
  };

  // Convert potentially null values to undefined for the AddressLookahead component
  const addressValue = watch('sender.address') || undefined;
  const cityValue = watch('sender.city') || undefined;
  const zipCodeValue = watch('sender.zipCode') || undefined;
  const countryValue = watch('sender.country') || undefined;

  // Safely handle custom inputs array
  const customInputs = getValues('sender.customInputs') || [];
  const customInputsArray = Array.isArray(customInputs) ? customInputs : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bill From</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Name"
          {...register('sender.name')}
          error={typedErrors.sender?.name?.message}
          placeholder="Your name or business name"
        />
        <AddressLookahead
          label="Address"
          onAddressSelect={handleAddressSelect}
          error={typedErrors.sender?.address?.message}
          value={addressValue}
          cityValue={cityValue}
          zipCodeValue={zipCodeValue}
          countryValue={countryValue}
          onCityChange={(value) => setValue('sender.city', value, { shouldValidate: true })}
          onZipCodeChange={(value) => setValue('sender.zipCode', value, { shouldValidate: true })}
          onCountryChange={(value) => setValue('sender.country', value, { shouldValidate: true })}
          onChange={(e) => setValue('sender.address', e.target.value, { shouldValidate: true })}
          id="sender-address"
          forceManualMode={!!(addressValue || cityValue || zipCodeValue || countryValue)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            {...register('sender.email')}
            error={typedErrors.sender?.email?.message}
            placeholder="Email address"
          />

          <FormInput
            label="Phone"
            {...register('sender.phone')}
            error={typedErrors.sender?.phone?.message}
            placeholder="Phone number"
          />
        </div>
        {/* Custom inputs section */}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInputs(!showCustomInputs)}
            className="flex items-center"
          >
            {showCustomInputs ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Hide Custom Fields
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom Fields
              </>
            )}
          </Button>

          {showCustomInputs && (
            <div className="mt-4 space-y-4">
              {customInputsArray.map((customInput: CustomInput, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label={`Field ${index + 1}`}
                    {...register(`sender.customInputs.${index}.key` as const)}
                    error={typedErrors.sender?.customInputs?.[index]?.key?.message}
                    placeholder="Field name"
                  />
                  <div className="relative">
                    <FormInput
                      label="Value"
                      {...register(`sender.customInputs.${index}.value` as const)}
                      error={typedErrors.sender?.customInputs?.[index]?.value?.message}
                      placeholder="Field value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-8 right-2 h-8 w-8"
                      onClick={() => {
                        const updatedInputs = [...customInputsArray];
                        updatedInputs.splice(index, 1);
                        setValue('sender.customInputs', updatedInputs);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('sender.customInputs', [...customInputsArray, { key: '', value: '' }]);
                }}
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Another Field
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
