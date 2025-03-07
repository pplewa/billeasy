import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { InvoiceType } from "@/types";
import { useToast } from "@/components/ui/use-toast";

/**
 * A button component that swaps the sender and receiver information
 * within the form context for when the parsing gets them wrong
 */
export function AddressSwapButton() {
  const { toast } = useToast();
  const { getValues, setValue } = useFormContext<InvoiceType>();

  const handleSwapAddresses = () => {
    // Get current values
    const sender = getValues("sender");
    const receiver = getValues("receiver");

    // Swap the values
    setValue("sender", receiver, { shouldValidate: true });
    setValue("receiver", sender, { shouldValidate: true });

    // Notify the user
    toast({
      title: "Addresses Swapped",
      description: "The 'Bill From' and 'Bill To' information has been switched.",
    });
  };

  return (
    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex flex-col items-center md:flex-row md:justify-between">
      <div className="mb-2 md:mb-0">
        <p className="text-sm text-blue-700 font-medium">
          Need to swap bill to and bill from?
        </p>
        <p className="text-xs text-blue-600">
          If the sender and receiver information is incorrect, you can swap them with one click.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleSwapAddresses}
        className="flex items-center gap-2 bg-white border-blue-300 hover:bg-blue-100"
        title="Swap Bill From and Bill To information"
      >
        <ArrowUpDown className="h-4 w-4" />
        Swap Addresses
      </Button>
    </div>
  );
} 