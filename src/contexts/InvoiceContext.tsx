"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InvoiceType } from "@/types";
import { InvoiceSchema } from "@/lib/schemas";

interface InvoiceContextType {
  form: ReturnType<typeof useForm<InvoiceType>>;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: InvoiceType) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceContextProviderProps {
  children: ReactNode;
}

export function InvoiceContextProvider({ children }: InvoiceContextProviderProps) {
  const router = useRouter();
  const [isLoading] = useState(false);

  const form = useForm<InvoiceType>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      details: {
        items: [],
        currency: "USD",
        language: "en",
        subTotal: 0,
        totalAmount: 0,
        totalAmountInWords: "",
        pdfTemplate: 1,
      },
    },
  });

  const onSubmit = async (data: InvoiceType) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving invoice...");

      // Make API request to save invoice
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if it's a validation error
        if (response.status === 400) {
          toast.dismiss(loadingToast);
          toast.error("Invalid invoice data. Please check the form for errors.");
          return;
        }

        throw new Error(result.error || "Failed to save invoice");
      }

      // Show success toast
      toast.dismiss(loadingToast);
      toast.success("Invoice saved successfully!");

      // Redirect to invoice list
      router.push("/invoices");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        form,
        isLoading,
        isSubmitting: form.formState.isSubmitting,
        onSubmit,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoiceContext() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoiceContext must be used within an InvoiceContextProvider");
  }
  return context;
} 