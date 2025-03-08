import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormInvoiceType } from "@/types-optional";
import { useToast } from "@/components/ui/use-toast";

type AddressFields = {
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
};

/**
 * A reusable button component for swapping sender and receiver information
 * Can operate in two modes:
 * 1. Form mode: Uses react-hook-form to swap form data
 * 2. Parser mode: Uses invoice parser store to swap parsed data
 */
export function AddressSwapButton({ mode = "form" }: { mode?: "form" | "parser" }) {
  const { toast } = useToast();
  const { getValues, setValue } = useFormContext<FormInvoiceType>();

  const handleSwap = () => {
    // Log the current mode
    console.log(`Swapping addresses in ${mode} mode`);
    
    // Get current values
    const sender = getValues("sender") || {};
    const receiver = getValues("receiver") || {};

    // Store values to swap
    const fieldsToSwap = [
      "name",
      "email",
      "phone",
      "customInputs"
    ] as const;

    // First swap non-address fields
    fieldsToSwap.forEach(field => {
      const senderValue = sender[field];
      const receiverValue = receiver[field];
      
      setValue(`sender.${field}`, receiverValue || null, { shouldValidate: true });
      setValue(`receiver.${field}`, senderValue || null, { shouldValidate: true });
    });

    // Store address values before swap
    const addressFields = ["address", "city", "zipCode", "country"] as const;
    const senderAddress = addressFields.reduce((acc, field) => {
      acc[field] = sender[field] || null;
      return acc;
    }, {} as AddressFields);

    const receiverAddress = addressFields.reduce((acc, field) => {
      acc[field] = receiver[field] || null;
      return acc;
    }, {} as AddressFields);

    // Perform the address swap
    addressFields.forEach(field => {
      setValue(`sender.${field}`, receiverAddress[field], { shouldValidate: true });
      setValue(`receiver.${field}`, senderAddress[field], { shouldValidate: true });
    });

    toast({
      title: "Addresses Swapped",
      description: "The Bill From and Bill To information has been switched.",
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