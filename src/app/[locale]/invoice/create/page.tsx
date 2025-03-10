'use client';

import { InvoiceForm } from '@/components/invoice/InvoiceForm';
import { useToast } from '@/components/ui/use-toast';
import { InvoiceContextProvider } from '@/contexts/InvoiceContext';
import { InvoiceSchemaForm } from '@/lib/schemas/invoice';
import { createInvoice } from '@/services/invoice/client/invoiceClient';
import { FormInvoiceType, ParsedInvoiceType } from '@/lib/types/invoice';
import { InvoiceTransformer } from '@/lib/transformers/invoice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import useInvoiceParserStore from '@/store/invoice-parser-store';
import useAuthStore from '@/store/auth-store';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { InvoiceExportModal } from '@/components/invoice/InvoiceExportModal';
import { useTranslations } from 'next-intl';

// Component to automatically update items when form is mounted
function ItemsUpdater({ parsedInvoice }: { parsedInvoice: ParsedInvoiceType | null }) {
  const { toast } = useToast();
  const formMethods = useFormContext<FormInvoiceType>();

  useEffect(() => {
    if (!parsedInvoice || !formMethods) {
      return;
    }

    try {
      const formData = InvoiceTransformer.transformParsedToForm(parsedInvoice);

      if (!InvoiceTransformer.isValidFormData(formData)) {
        return;
      }

      // Update form with transformed data
      Object.entries(formData).forEach(([key, value]) => {
        formMethods.setValue(key as keyof FormInvoiceType, value);
      });

      // Show success toast
      const updatedItems = formMethods.getValues('details.items');
      if (updatedItems && updatedItems.length > 0) {
        toast({
          title: 'Invoice Data Added',
          description: `Added invoice details and ${updatedItems.length} items. Please check all sections.`,
        });
      }
    } catch (error) {
      console.error('Error updating invoice data:', error);
    }
  }, [parsedInvoice, formMethods, toast]);

  return null;
}

export default function CreateInvoicePage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locale, setLocale] = useState<string>('');
  const { parsedInvoice, resetParserState, saveDraftInvoice } = useInvoiceParserStore();
  const { user, isLoading: authLoading } = useAuthStore();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'export'>('save');

  // Get locale from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getParams();
  }, [params]);

  // Get translations
  const t = useTranslations();
  const invoiceT = useTranslations('invoice');

  // Create form with transformed initial values
  const initialValues = useMemo(() => {
    if (!parsedInvoice) {
      return {
        details: {
          items: [],
          invoiceNumber: null,
          invoiceDate: null,
          dueDate: null,
          currency: null,
          subTotal: null,
          totalAmount: null,
        },
        sender: null,
        receiver: null,
      } as FormInvoiceType;
    }

    return InvoiceTransformer.transformParsedToForm(parsedInvoice);
  }, [parsedInvoice]);

  // Create form with proper typing
  const form = useForm<FormInvoiceType>({
    resolver: zodResolver(InvoiceSchemaForm),
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      resetParserState();
    };
  }, [resetParserState]);

  // Autosave functionality
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      const formData = form.getValues();
      if (formData && (formData.sender?.name || formData.receiver?.name)) {
        saveDraftInvoice(formData);
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [form, saveDraftInvoice]);

  // Handle form submission
  const onSubmit = async (formData: FormInvoiceType): Promise<void> => {
    try {
      setIsSubmitting(true);
      const data = await createInvoice(formData);

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });

      router.push(`/${locale}/invoice/view/${data._id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle authentication for saving
  const handleAuthenticatedSave = () => {
    if (!user && !authLoading) {
      setActionType('save');
      setIsAuthDialogOpen(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  // Handle navigation to sign in page
  const handleNavigateToSignIn = () => {
    const formData = form.getValues();
    saveDraftInvoice(formData);
    router.push(`/${locale}/signin?redirect=/invoice/create`);
  };

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
        <h1 className="text-3xl font-bold tracking-tight">{invoiceT('create')}</h1>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <InvoiceExportModal form={form}>
            <Button variant="outline" className="w-full md:w-auto" disabled={isSubmitting}>
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
          </InvoiceExportModal>

          <Button
            className="w-full md:w-auto"
            onClick={handleAuthenticatedSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? <>{t('common.saving')}</> : <>{t('common.saveInvoice')}</>}
          </Button>
        </div>
      </div>

      {parsedInvoice?.details?.items && parsedInvoice.details.items.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium">{invoiceT('itemsDetected')}</h3>
              <p>
                {parsedInvoice.details.items.length} {t('common.itemsLoaded')}
              </p>
              <p className="text-sm text-muted-foreground">{t('common.itemsNotVisible')}</p>
            </div>
          </div>
        </div>
      )}

      <ItemsUpdater parsedInvoice={parsedInvoice} />

      <InvoiceContextProvider
        form={form}
        invoice={null}
        isLoading={authLoading}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <InvoiceForm />
      </InvoiceContextProvider>

      <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoice.authRequired')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('invoice.authRequiredDescription', {
                action: actionType === 'save' ? t('common.save') : t('common.export'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsAuthDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleNavigateToSignIn}>{t('common.signIn')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
