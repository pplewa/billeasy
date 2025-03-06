"use client";

import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceDocument } from "@/lib/db/models/Invoice";
import {
  deleteInvoice,
  fetchInvoices,
} from "@/services/invoice/client/invoiceClient";
import { Loader2, PlusCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InvoiceParserForm } from "@/components/invoice/InvoiceParserForm";

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    router.push(`/${locale}/invoice/create`);
  };

  const handleDeleteInvoice = (id: string) => {
    // Remove the invoice from the list
    setInvoices((prev) =>
      prev.filter((invoice) => invoice._id.toString() !== id)
    );
  };

  const handleDuplicateInvoice = (invoice: InvoiceDocument) => {
    // Add the duplicated invoice to the list
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handleStatusChange = (id: string, status: string) => {
    // Update the invoice status in the local state
    setInvoices((prev) =>
      prev.map((invoice) => {
        if (invoice._id.toString() === id) {
          const updatedInvoice = { ...invoice };
          if (!updatedInvoice.details) {
            updatedInvoice.details = {};
          }
          updatedInvoice.details.status = status;
          return updatedInvoice as InvoiceDocument;
        }
        return invoice;
      }) as InvoiceDocument[]
    );
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={handleCreateInvoice}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="space-y-8">
          <div className="text-center py-12 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No invoices found</h2>
            <p className="text-muted-foreground mb-4">
              Create your first invoice to get started.
            </p>
            <Button onClick={handleCreateInvoice}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Invoice Generator</h2>
            <InvoiceParserForm locale={locale} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id.toString()}
                invoice={invoice}
                locale={locale}
                onDelete={handleDeleteInvoice}
                onDuplicate={handleDuplicateInvoice}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Invoice Generator</h2>
            <InvoiceParserForm locale={locale} />
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  try {
                    setIsDeleting(true);
                    await deleteInvoice(deleteId);
                    setInvoices((prev) =>
                      prev.filter(
                        (invoice) => invoice._id.toString() !== deleteId
                      )
                    );
                    toast({
                      title: "Success",
                      description: "Invoice deleted successfully",
                    });
                  } catch (error) {
                    console.error("Error deleting invoice:", error);
                    toast({
                      title: "Error",
                      description: "Failed to delete invoice",
                      variant: "destructive",
                    });
                  } finally {
                    setIsDeleting(false);
                    setDeleteId(null);
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
