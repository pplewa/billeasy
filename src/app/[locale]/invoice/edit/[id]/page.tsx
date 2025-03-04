"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas";
import { fetchInvoiceById, updateInvoice } from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use, Usable } from "react";
import { useForm } from "react-hook-form";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { locale, id } = use(params as unknown as Usable<{ locale: string; id: string }>);
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form methods
  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoiceById(id);
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
        router.push(`/${locale}/invoices`);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, locale, router, toast, form]);

  // Handle form submission
  const handleSubmit = async (data: InvoiceType) => {
    try {
      setIsSubmitting(true);
      await updateInvoice(id, data);
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Invoice</h1>
      <InvoiceContextProvider
        form={form}
        invoice={invoice}
        isLoading={loading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>
    </div>
  );
} 