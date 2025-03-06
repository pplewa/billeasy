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

export function BillToSection() {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useFormContext<InvoiceType>();

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bill To</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Name"
          {...register("receiver.name")}
          error={errors.receiver?.name?.message}
          placeholder="Client name or business name"
        />

        <AddressLookahead
          label="Address"
          onAddressSelect={handleAddressSelect}
          error={errors.receiver?.address?.message}
          value={watch("receiver.address")}
          cityValue={watch("receiver.city")}
          zipCodeValue={watch("receiver.zipCode")}
          countryValue={watch("receiver.country")}
          onCityChange={(value) => setValue("receiver.city", value, { shouldValidate: true })}
          onZipCodeChange={(value) => setValue("receiver.zipCode", value, { shouldValidate: true })}
          onCountryChange={(value) => setValue("receiver.country", value, { shouldValidate: true })}
          onChange={(e) => setValue("receiver.address", e.target.value, { shouldValidate: true })}
          id="receiver-address"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            {...register("receiver.email")}
            error={errors.receiver?.email?.message}
            placeholder="Email address"
          />

          <FormInput
            label="Phone"
            {...register("receiver.phone")}
            error={errors.receiver?.phone?.message}
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
              {getValues("receiver.customInputs")?.map((customInput: {key?: string, value?: string}, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <FormInput
                    label={`Field ${index + 1} Name`}
                    {...register(`receiver.customInputs.${index}.key`)}
                    error={errors.receiver?.customInputs?.[index]?.key?.message}
                    placeholder="Field name"
                  />
                  <FormInput
                    label={`Field ${index + 1} Value`}
                    {...register(`receiver.customInputs.${index}.value`)}
                    error={
                      errors.receiver?.customInputs?.[index]?.value?.message
                    }
                    placeholder="Field value"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentInputs =
                    getValues("receiver.customInputs") || [];
                  setValue("receiver.customInputs", [
                    ...currentInputs,
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
