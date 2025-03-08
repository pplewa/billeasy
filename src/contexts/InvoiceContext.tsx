'use client';

import { createContext, useContext, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInvoiceType } from '@/lib/types/invoice';

interface InvoiceContextType {
  form: UseFormReturn<FormInvoiceType>;
  invoice: FormInvoiceType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: FormInvoiceType) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | null>(null);

interface InvoiceContextProviderProps {
  children: ReactNode;
  form: UseFormReturn<FormInvoiceType>;
  invoice: FormInvoiceType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: FormInvoiceType) => Promise<void>;
}

export function InvoiceContextProvider({
  children,
  form,
  invoice,
  isLoading,
  isSubmitting,
  onSubmit,
}: InvoiceContextProviderProps) {
  return (
    <InvoiceContext.Provider
      value={{
        form,
        invoice,
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
  if (!context) {
    throw new Error('useInvoiceContext must be used within an InvoiceContextProvider');
  }
  return context;
}
