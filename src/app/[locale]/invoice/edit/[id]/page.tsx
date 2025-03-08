'use client';

import { InvoiceExportModal } from '@/components/invoice/InvoiceExportModal';
import { InvoiceEmailModal } from '@/components/invoice/InvoiceEmailModal';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { InvoiceContextProvider } from '@/contexts/InvoiceContext';
import { InvoiceSchemaForm } from '@/lib/schemas/invoice';
import { fetchInvoiceById, updateInvoice } from '@/services/invoice/client/invoiceClient';
import { FormInvoiceType } from '@/lib/types/invoice';
import { InvoiceTransformer } from '@/lib/transformers/invoice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2, Mail, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<FormInvoiceType>({
    sender: null,
    receiver: null,
    details: null,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locale, setLocale] = useState<string>('');
  const [invoiceId, setInvoiceId] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);
  
  // Get translations
  const t = useTranslations();
  const invoiceT = useTranslations('invoice');

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
  const form = useForm<FormInvoiceType>({
    resolver: zodResolver(InvoiceSchemaForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
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
        const formData = InvoiceTransformer.transformParsedToForm(data);
        setInvoice(formData);

        // Reset form with the transformed data
        form.reset(formData);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice. Please try again.',
          variant: 'destructive',
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
        title: 'Success',
        description: 'Invoice updated successfully',
      });
      router.push(`/${locale}/invoice/view/${invoiceId}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    if (printRef.current) {
      window.print();
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
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-7xl">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between print-hidden">
        <h1 className="text-3xl font-bold tracking-tight">{invoiceT('edit')}</h1>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={handlePrint}
            disabled={isSubmitting}
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('common.print')}
          </Button>

          <InvoiceEmailModal invoice={invoice}>
            <Button variant="outline" className="w-full md:w-auto" disabled={isSubmitting}>
              <Mail className="w-4 h-4 mr-2" />
              {t('common.email')}
            </Button>
          </InvoiceEmailModal>

          <InvoiceExportModal invoice={invoice}>
            <Button variant="outline" className="w-full md:w-auto" disabled={isSubmitting}>
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
          </InvoiceExportModal>

          <Button
            className="w-full md:w-auto"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <>{t('common.saving')}</> : <>{t('common.saveInvoice')}</>}
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
    </div>
  );
}
