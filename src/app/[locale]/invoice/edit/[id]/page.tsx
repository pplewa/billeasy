"use client";

import { InvoiceExportModal } from "@/components/invoice/InvoiceExportModal";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas-optional";
import {
  fetchInvoiceById,
  updateInvoice,
} from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locale, setLocale] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");

  // Get locale and id from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
      setInvoiceId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Create form methods
  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    criteriaMode: "all",
    shouldFocusError: false,
    shouldUseNativeValidation: false,
    delayError: 500,
  });

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return; // Wait until we have the ID

      try {
        setLoading(true);
        const data = await fetchInvoiceById(invoiceId);
        setInvoice(data);

        // Reset form with the loaded invoice data
        form.reset(data);
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice. Please try again.",
          variant: "destructive",
        });
        if (locale) {
          router.push(`/${locale}/invoices`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, locale, router, toast, form]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!invoiceId) return;

    try {
      setIsSubmitting(true);

      // Get raw values from the form - bypass validation
      const formData = form.getValues();

      await updateInvoice(invoiceId, formData);
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      router.push(`/${locale}/invoices`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container py-6 space-y-8 p-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <InvoiceExportModal form={form} isLoading={isSubmitting}>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </InvoiceExportModal>
          <Button
            className="w-full md:w-auto"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <>Saving...</> : <>Save Invoice</>}
          </Button>
        </div>
      </div>

      <InvoiceContextProvider
        form={form}
        invoice={invoice}
        isLoading={loading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>
    </main>
  );
}
