import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceStatus } from "@/types";
import { updateInvoice } from "@/services/invoice/client/invoiceClient";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown } from "lucide-react";

interface InvoiceStatusSelectorProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChange?: (id: string, status: string) => void;
}

/**
 * Component to allow users to change the status of an invoice
 */
export function InvoiceStatusSelector({
  invoiceId,
  currentStatus,
  onStatusChange,
}: InvoiceStatusSelectorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setUpdating(true);
    try {
      // Update the invoice status in the database
      await updateInvoice(invoiceId, { details: { status: newStatus } });
      
      // Update local state
      setStatus(newStatus);
      
      // Call the callback if provided
      if (onStatusChange) {
        onStatusChange(invoiceId, newStatus);
      }
      
      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={updating}>
        <Button variant="ghost" size="sm" className="h-8 gap-1 pl-1">
          <InvoiceStatusBadge status={status} />
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.DRAFT)}>
          <InvoiceStatusBadge status={InvoiceStatus.DRAFT} className="w-full justify-start" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.SENT)}>
          <InvoiceStatusBadge status={InvoiceStatus.SENT} className="w-full justify-start" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.PAID)}>
          <InvoiceStatusBadge status={InvoiceStatus.PAID} className="w-full justify-start" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.OVERDUE)}>
          <InvoiceStatusBadge status={InvoiceStatus.OVERDUE} className="w-full justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 