'use client';

import { useState } from 'react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Types
import { ExportTypes } from '@/types';
import { FormInvoiceType } from '@/lib/types/invoice';

// Services
import { exportInvoice } from '@/services/invoice/client/exportInvoice';

interface InvoiceExportModalProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: any; // Using any to avoid complex form typing issues across different form implementations
  invoice?: FormInvoiceType;
  isLoading?: boolean;
}

/**
 * Modal for exporting invoices in different formats
 */
export function InvoiceExportModal({
  children,
  form,
  invoice,
  isLoading = false,
}: InvoiceExportModalProps) {
  const [open, setOpen] = useState(false);

  /**
   * Export the invoice in the specified format
   */
  const handleExport = (exportType: ExportTypes) => {
    let invoiceData;

    // Use data from either the form or the direct invoice prop
    if (form) {
      // Cast the form values to FormInvoiceType to ensure compatibility
      invoiceData = form.getValues() as unknown as FormInvoiceType;
    } else if (invoice) {
      invoiceData = invoice;
    } else {
      console.error('No invoice data available for export');
      return;
    }

    // Export the invoice
    exportInvoice(exportType, invoiceData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Invoice</DialogTitle>
          <DialogDescription>Choose a format to export your invoice</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleExport(ExportTypes.PDF)}
            className="w-full"
          >
            Export as PDF
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleExport(ExportTypes.JSON)}
            className="w-full"
          >
            Export as JSON
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleExport(ExportTypes.CSV)}
            className="w-full"
          >
            Export as CSV
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleExport(ExportTypes.XLSX)}
            className="w-full"
          >
            Export as XLSX
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleExport(ExportTypes.XML)}
            className="w-full"
          >
            Export as XML
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
