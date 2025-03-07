import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { InvoiceType } from "@/types";
import { useToast } from "@/components/ui/use-toast";

/**
 * A simple icon button that swaps the sender and receiver information
 */
export function AddressSwapButton() {
  const { toast } = useToast();
  const { getValues, setValue } = useFormContext<InvoiceType>();

  const handleSwapAddresses = () => {
    // Get current values for all fields to ensure complete swapping
    const sender = getValues("sender");
    const receiver = getValues("receiver");
    
    // Explicitly get address-related fields to ensure they're swapped correctly
    const senderAddress = getValues("sender.address");
    const senderCity = getValues("sender.city");
    const senderZipCode = getValues("sender.zipCode");
    const senderCountry = getValues("sender.country");
    
    const receiverAddress = getValues("receiver.address");
    const receiverCity = getValues("receiver.city");
    const receiverZipCode = getValues("receiver.zipCode");
    const receiverCountry = getValues("receiver.country");

    // Swap main objects first
    setValue("sender", receiver, { shouldValidate: true });
    setValue("receiver", sender, { shouldValidate: true });

    // Then explicitly swap individual address fields to handle any nested object issues
    setValue("sender.address", receiverAddress, { shouldValidate: true });
    setValue("sender.city", receiverCity, { shouldValidate: true });
    setValue("sender.zipCode", receiverZipCode, { shouldValidate: true });
    setValue("sender.country", receiverCountry, { shouldValidate: true });
    
    setValue("receiver.address", senderAddress, { shouldValidate: true });
    setValue("receiver.city", senderCity, { shouldValidate: true });
    setValue("receiver.zipCode", senderZipCode, { shouldValidate: true });
    setValue("receiver.country", senderCountry, { shouldValidate: true });

    // Notify the user
    toast({
      title: "Addresses Swapped",
      description: "The 'Bill From' and 'Bill To' information has been switched.",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSwapAddresses}
      className="flex items-center justify-center rounded-full h-10 w-10 p-0 border-gray-300 hover:bg-gray-100"
      title="Swap Bill From and Bill To information"
    >
      <ArrowUpDown className="h-5 w-5" />
    </Button>
  );
} 