"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { InvoiceType } from "@/types";

export function BillToSection() {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  
  const { control, register, formState: { errors } } = useFormContext<InvoiceType>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "receiver.customInputs",
  });

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
        
        <FormInput
          label="Address"
          {...register("receiver.address")}
          error={errors.receiver?.address?.message}
          placeholder="Street address"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Zip Code"
            {...register("receiver.zipCode")}
            error={errors.receiver?.zipCode?.message}
            placeholder="Zip code"
          />
          
          <FormInput
            label="City"
            {...register("receiver.city")}
            error={errors.receiver?.city?.message}
            placeholder="City"
          />
          
          <FormInput
            label="Country"
            {...register("receiver.country")}
            error={errors.receiver?.country?.message}
            placeholder="Country"
          />
        </div>
        
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
        
        {showCustomInputs && (
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-medium">Custom Fields</h3>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Field Name"
                    {...register(`receiver.customInputs.${index}.key`)}
                    error={errors.receiver?.customInputs?.[index]?.key?.message}
                    placeholder="e.g., Tax ID"
                  />
                  
                  <FormInput
                    label="Value"
                    {...register(`receiver.customInputs.${index}.value`)}
                    error={errors.receiver?.customInputs?.[index]?.value?.message}
                    placeholder="e.g., 123456789"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", value: "" })}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Field
            </Button>
          </div>
        )}
        
        {!showCustomInputs && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInputs(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Fields
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 