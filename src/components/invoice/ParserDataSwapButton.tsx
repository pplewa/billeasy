import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useInvoiceParserStore from "@/store/invoice-parser-store";

/**
 * A button component for swapping sender and receiver in parsed invoice data
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
    
    // Create a deep clone of the invoice to avoid reference issues
    const updatedInvoice = JSON.parse(JSON.stringify(parsedInvoice));

    // Explicitly save all address-related fields
    const senderAddress = updatedInvoice.sender.address;
    const senderCity = updatedInvoice.sender.city;
    const senderZipCode = updatedInvoice.sender.zipCode;
    const senderCountry = updatedInvoice.sender.country;
    
    const receiverAddress = updatedInvoice.receiver.address;
    const receiverCity = updatedInvoice.receiver.city;
    const receiverZipCode = updatedInvoice.receiver.zipCode;
    const receiverCountry = updatedInvoice.receiver.country;

    // Swap the entire objects
    updatedInvoice.sender = parsedInvoice.receiver;
    updatedInvoice.receiver = parsedInvoice.sender;

    // Explicitly set all address fields to ensure they get swapped correctly
    updatedInvoice.sender.address = receiverAddress;
    updatedInvoice.sender.city = receiverCity;
    updatedInvoice.sender.zipCode = receiverZipCode;
    updatedInvoice.sender.country = receiverCountry;
    
    updatedInvoice.receiver.address = senderAddress;
    updatedInvoice.receiver.city = senderCity;
    updatedInvoice.receiver.zipCode = senderZipCode;
    updatedInvoice.receiver.country = senderCountry;

    // Update the parsed invoice in the store
    setParsedInvoice(updatedInvoice);

    // Notify the user
    toast({
      title: "Addresses Swapped",
      description: "The Bill From and Bill To information has been switched.",
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
      <ArrowLeftRight className="h-5 w-5" />
    </Button>
  );
} 