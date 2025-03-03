"use client";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceContextProvider } from "@/contexts/InvoiceContext";
import { InvoiceSchema } from "@/lib/schemas";
import { createInvoice } from "@/services/invoice/client/invoiceClient";
import { InvoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Default invoice data
const defaultInvoice: InvoiceType = {
  sender: {
    name: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
    email: "",
    phone: "",
  },
  receiver: {
    name: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
    email: "",
    phone: "",
  },
  items: [
    {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      price: 0,
      taxRate: 0,
      discount: 0,
    },
  ],
  details: {
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    currency: "USD",
    language: "en",
    taxSystem: "inclusive",
    notes: "",
    terms: "",
    signature: "",
  },
  settings: {
    template: "default",
    color: "#3b82f6",
    logo: "",
  },
};

export default function CreateInvoicePage({
  params,
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form methods
  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: defaultInvoice,
    mode: "onChange",
  });

  // Handle form submission
  const handleSubmit = async (data: InvoiceType) => {
    try {
      setIsSubmitting(true);
      await createInvoice(data);
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      router.push(`/${params.locale}/invoices`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>
      <InvoiceContextProvider
        form={form}
        invoice={null}
        isLoading={false}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>
    </div>
  );
} 