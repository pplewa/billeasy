"use client";

import { createContext, useContext, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { InvoiceType } from "@/types";
import { FormInvoiceType } from "@/types-optional";

interface InvoiceContextType {
  form: ReturnType<typeof useForm<FormInvoiceType>>;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceContextProviderProps {
  children: ReactNode;
  form: ReturnType<typeof useForm<FormInvoiceType>>;
  invoice: InvoiceType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}

export function InvoiceContextProvider({ 
  children,
  form,
  isLoading,
  isSubmitting,
  onSubmit 
}: InvoiceContextProviderProps) {
  return (
    <InvoiceContext.Provider
      value={{
        form,
        isLoading,
        isSubmitting,
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