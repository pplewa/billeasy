import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useInvoiceParserStore from "@/store/invoice-parser-store";
import { InvoiceType } from "@/types";

/**
 * A button component for swapping sender and receiver in parsed invoice data
 * before form initialization
 */
export function ParserDataSwapButton() {
  const { toast } = useToast();
  const { parsedInvoice, setParsedInvoice } = useInvoiceParserStore();

  // Only show button if we have both sender and receiver data
  if (!parsedInvoice?.sender || !parsedInvoice?.receiver) {
    return null;
  }

  const handleSwapAddresses = () => {
    if (!parsedInvoice) return;

    // Create a new parsedInvoice object with swapped addresses
    const updatedInvoice: Partial<InvoiceType> = {
      ...parsedInvoice,
      sender: parsedInvoice.receiver,
      receiver: parsedInvoice.sender
    };

    // Update the parsed invoice in the store
    setParsedInvoice(updatedInvoice);

    // Notify the user
    toast({
      title: "Addresses Swapped",
      description: "The 'Bill From' and 'Bill To' information has been switched.",
    });
  };

  return (
    <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex flex-col items-center md:flex-row md:justify-between mb-6">
      <div className="mb-2 md:mb-0">
        <p className="text-sm text-amber-700 font-medium">
          Did the parsing get the sender and receiver wrong?
        </p>
        <p className="text-xs text-amber-600">
          You can swap the Bill From and Bill To information before starting the form.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleSwapAddresses}
        className="flex items-center gap-2 bg-white border-amber-300 hover:bg-amber-100"
        title="Swap Bill From and Bill To information"
      >
        <ArrowUpDown className="h-4 w-4" />
        Swap Addresses
      </Button>
    </div>
  );
} 