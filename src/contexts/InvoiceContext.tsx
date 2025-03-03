"use client";

import { createContext, useContext, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { InvoiceType } from "@/types";

interface InvoiceContextType {
  form: ReturnType<typeof useForm<InvoiceType>>;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: InvoiceType) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceContextProviderProps {
  children: ReactNode;
  form: ReturnType<typeof useForm<InvoiceType>>;
  invoice: InvoiceType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: InvoiceType) => Promise<void>;
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