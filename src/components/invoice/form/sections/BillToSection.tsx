"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { FormInput } from "@/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import {
  AddressLookahead,
  AddressDetails,
} from "@/components/ui/address-lookahead";

import { InvoiceType } from "@/types";

interface CustomInput {
  key?: string;
  value?: string;
}

interface CustomInputError {
  key?: { message?: string };
  value?: { message?: string };
}

interface ReceiverErrors {
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
  receiver?: ReceiverErrors;
}

export function BillToSection() {
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
    setValue("receiver.address", addressDetails.address, {
      shouldValidate: true,
    });
    setValue("receiver.city", addressDetails.city, { shouldValidate: true });
    setValue("receiver.zipCode", addressDetails.zipCode, {
      shouldValidate: true,
    });
    setValue("receiver.country", addressDetails.country, {
      shouldValidate: true,
    });
  };

  // Convert potentially null values to undefined for the AddressLookahead component
  const addressValue = watch("receiver.address") || undefined;
  const cityValue = watch("receiver.city") || undefined;
  const zipCodeValue = watch("receiver.zipCode") || undefined;
  const countryValue = watch("receiver.country") || undefined;

  // Safely handle custom inputs array
  const customInputs = getValues("receiver.customInputs") || [];
  const customInputsArray = Array.isArray(customInputs) ? customInputs : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bill To</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Name"
          {...register("receiver.name")}
          error={typedErrors.receiver?.name?.message}
          placeholder="Client name or business name"
        />

        <AddressLookahead
          label="Address"
          onAddressSelect={handleAddressSelect}
          error={typedErrors.receiver?.address?.message}
          value={addressValue}
          cityValue={cityValue}
          zipCodeValue={zipCodeValue}
          countryValue={countryValue}
          onCityChange={(value) =>
            setValue("receiver.city", value, { shouldValidate: true })
          }
          onZipCodeChange={(value) =>
            setValue("receiver.zipCode", value, { shouldValidate: true })
          }
          onCountryChange={(value) => {
            setValue("receiver.country", value, { shouldValidate: true });
          }}
          onChange={(e) => {
            setValue("receiver.address", e.target.value, {
              shouldValidate: true,
            })
          }}
          id="receiver-address"
          forceManualMode={!!(addressValue || cityValue || zipCodeValue || countryValue)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            {...register("receiver.email")}
            error={typedErrors.receiver?.email?.message}
            placeholder="Email address"
          />

          <FormInput
            label="Phone"
            {...register("receiver.phone")}
            error={typedErrors.receiver?.phone?.message}
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
              {customInputsArray.map(
                (customInput: CustomInput, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <FormInput
                      label={`Field ${index + 1} Name`}
                      {...register(
                        `receiver.customInputs.${index}.key` as const
                      )}
                      error={
                        typedErrors.receiver?.customInputs?.[index]?.key
                          ?.message
                      }
                      placeholder="Field name"
                    />
                    <FormInput
                      label={`Field ${index + 1} Value`}
                      {...register(
                        `receiver.customInputs.${index}.value` as const
                      )}
                      error={
                        typedErrors.receiver?.customInputs?.[index]?.value
                          ?.message
                      }
                      placeholder="Field value"
                    />
                  </div>
                )
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("receiver.customInputs", [
                    ...customInputsArray,
                    { key: "", value: "" },
                  ]);
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
