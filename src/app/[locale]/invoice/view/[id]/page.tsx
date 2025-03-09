'use client';

// Next.js
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Icons
import { ArrowLeft, Download, Edit, Mail, Printer, ChevronDown } from 'lucide-react';

// Services
import { fetchInvoiceById } from '@/services/invoice/client/invoiceClient';

// Invoice Components
import { InvoiceEmailModal } from '@/components/invoice/InvoiceEmailModal';
import { InvoiceExportModal } from '@/components/invoice/InvoiceExportModal';
import { TemplateViewSelector } from '@/components/invoice/TemplateViewSelector';
import DynamicInvoiceView from '@/components/invoice/DynamicInvoiceView';

// Types
import { FormInvoiceType, BaseAmount } from '@/lib/types/invoice';

// Add the import for our new adapter
import { normalizeInvoice } from '@/lib/invoice-adapter';

// Add translation hook near the top of the component
import { useTranslations } from 'use-intl';

// Define interfaces for the invoice structure as used in the view
interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  tax?: {
    amount: number;
    amountType?: string;
  };
  discount?:
    | {
        amount: number;
        amountType?: string;
      }
    | number; // Can be either the new structure or a legacy number
  taxRate?: number; // For backwards compatibility
  total?: number;
}

interface InvoiceDetails {
  invoiceNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  currency?: string;
  notes?: string;
  terms?: string;
  items?: InvoiceItem[];
  totalAmount?: number;
  signature?: { data?: string; fontFamily?: string };
}

interface InvoiceSettings {
  logo?: string;
  template?: string;
  color?: string;
}

interface ViewInvoiceDocument {
  _id: string;
  sender?: {
    name?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  receiver?: {
    name?: string;
    address?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  items?: InvoiceItem[];
  details?: InvoiceDetails;
  settings?: InvoiceSettings;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown; // Add index signature for compatibility with SourceInvoice
}

/**
 * Converts a ViewInvoiceDocument to InvoiceType format
 * @param doc The ViewInvoiceDocument to convert
 * @returns An object in InvoiceType format
 */
const adaptToInvoiceType = (doc: ViewInvoiceDocument): FormInvoiceType => {
  // ViewInvoiceDocument is compatible with SourceInvoice
  // since SourceInvoice accepts any key-value pairs
  const normalized = normalizeInvoice(doc) || {};

  // Define default objects with proper types
  const defaultTax: BaseAmount = { amount: 0, amountType: 'percentage' };

  // Ensure tax and discount objects have proper structure
  const taxObj = normalized.details?.tax ?? defaultTax;
  const tax: BaseAmount = {
    amount: Number((taxObj as { amount?: unknown })?.amount ?? 0),
    amountType:
      String((taxObj as { amountType?: unknown })?.amountType ?? 'percentage') === 'amount'
        ? 'amount'
        : 'percentage',
  };

  const discountObj = normalized.details?.discount ?? defaultTax;
  const discount: BaseAmount = {
    amount: Number((discountObj as { amount?: unknown })?.amount ?? 0),
    amountType:
      String((discountObj as { amountType?: unknown })?.amountType ?? 'percentage') === 'amount'
        ? 'amount'
        : 'percentage',
  };

  // Ensure sender and receiver are always objects
  const senderObj = normalized.sender as Record<string, unknown> | null | undefined;
  const sender = {
    name: String(senderObj?.name || '') || null,
    address: String(senderObj?.address || '') || null,
    zipCode: String(senderObj?.zipCode || '') || null,
    city: String(senderObj?.city || '') || null,
    country: String(senderObj?.country || '') || null,
    email: String(senderObj?.email || '') || null,
    phone: String(senderObj?.phone || '') || null,
    customInputs: Array.isArray(senderObj?.customInputs)
      ? senderObj.customInputs.map((input) => {
          const typedInput = input as { key?: unknown; value?: unknown };
          return {
            key: String(typedInput?.key || '') || null,
            value: String(typedInput?.value || '') || null,
          };
        })
      : [],
  };

  const receiverObj = normalized.receiver as Record<string, unknown> | null | undefined;
  const receiver = {
    name: String(receiverObj?.name || '') || null,
    address: String(receiverObj?.address || '') || null,
    zipCode: String(receiverObj?.zipCode || '') || null,
    city: String(receiverObj?.city || '') || null,
    country: String(receiverObj?.country || '') || null,
    email: String(receiverObj?.email || '') || null,
    phone: String(receiverObj?.phone || '') || null,
    customInputs: Array.isArray(receiverObj?.customInputs)
      ? receiverObj.customInputs.map((input) => {
          const typedInput = input as { key?: unknown; value?: unknown };
          return {
            key: String(typedInput?.key || '') || null,
            value: String(typedInput?.value || '') || null,
          };
        })
      : [],
  };

  // Create the final result with proper types
  const result = {
    sender,
    receiver,
    details: {
      invoiceNumber: normalized.details?.invoiceNumber || null,
      invoiceDate: normalized.details?.invoiceDate || null,
      dueDate: normalized.details?.dueDate || null,
      currency: normalized.details?.currency || null,
      additionalNotes: normalized.details?.additionalNotes || null,
      paymentTerms: normalized.details?.paymentTerms || null,
      status: normalized.details?.status || null,
      subTotal: normalized.details?.subTotal || null,
      totalAmount: normalized.details?.totalAmount || null,
      items: normalized.details?.items || [],
      tax,
      discount,
      paymentInformation: normalized.details?.paymentInformation || null,
      signature: normalized.details?.signature || null,
      purchaseOrderNumber: normalized.details?.purchaseOrderNumber || null,
      invoiceLogo: normalized.details?.invoiceLogo || null,
    },
    settings: {
      logo: normalized.settings?.logo || null,
      template: normalized.settings?.template || null,
      color: normalized.settings?.color || null,
    },
    items: normalized.items || [],
    _id: normalized._id || '',
    createdAt: normalized.createdAt || null,
    updatedAt: normalized.updatedAt || null,
  };

  return result as FormInvoiceType;
};

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { id, locale } = params as { id: string; locale: string };
  const { toast } = useToast();

  // Add translation hook near the top of the component
  const t = useTranslations('common');

  const [invoice, setInvoice] = useState<ViewInvoiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoiceById(id);

        // Determine where items are stored (could be at root or in details)
        let items;
        if (data.items && Array.isArray(data.items)) {
          items = data.items;
        } else if (data.details?.items && Array.isArray(data.details.items)) {
          items = data.details.items;
        } else {
          items = [];
        }

        // Process items to ensure consistent structure
        const processedItems = items.map((item: Record<string, unknown>, index: number) => {
          const id = String(item.id || `item-${index}`);
          const name = String(item.name || '');
          const description = item.description ? String(item.description) : '';
          const quantity = Number(item.quantity || 0);
          const price = Number(item.unitPrice || item.price || 0);

          // Handle tax - could be in tax object or taxRate field
          const taxRate = Number((item.tax as { amount?: unknown })?.amount ?? item.taxRate ?? 0);

          // Handle discount - could be direct number or in discount object
          const discount =
            typeof item.discount === 'number'
              ? item.discount
              : Number((item.discount as { amount?: unknown })?.amount ?? 0);

          // Build a standardized item object
          return {
            id,
            name,
            description,
            quantity: quantity,
            unitPrice: price,
            tax: {
              amount: taxRate,
              amountType: String(
                (item.tax as { amountType?: unknown })?.amountType ?? 'percentage'
              ),
            },
            discount: {
              amount: discount,
              amountType: String(
                (item.discount as { amountType?: unknown })?.amountType ?? 'percentage'
              ),
            },
            total: Number(item.total ?? price * quantity),
          };
        });

        // Build the processed data
        const processedData = {
          ...data,
          items: processedItems,
        };

        setInvoice(processedData);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice. Please try again.',
          variant: 'destructive',
        });
        router.push(`/${locale}/invoices`);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, locale, router, toast]);

  const handlePrint = () => {
    // Add a small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Add a handler for template changes
  const handleTemplateChange = (templateId: number) => {
    setSelectedTemplate(templateId);

    // If we have an invoice, update its settings in memory
    if (invoice) {
      setInvoice({
        ...invoice,
        settings: {
          ...invoice.settings,
          template: templateId.toString(),
        },
      });
    }
  };

  if (loading || !invoice) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // The invoice data is now processed by the DynamicInvoiceView component
  // No need to extract or process items here

  return (
    <div className="container mx-auto py-8">
      {/* Add print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }

          .container {
            width: 100%;
            max-width: 100%;
            padding: 20px;
            margin: 0;
          }

          .print-hidden {
            display: none !important;
          }

          h1,
          h2 {
            color: #000;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          th,
          td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f2f2f2;
          }

          .text-right {
            text-align: right;
          }

          .font-semibold {
            font-weight: 600;
          }

          .text-gray-600 {
            color: #000;
          }

          .text-gray-700 {
            color: #000;
            font-weight: 600;
          }

          .text-gray-800 {
            color: #000;
            font-weight: 700;
          }

          .bg-white {
            background-color: #fff;
          }

          .rounded-lg {
            border-radius: 0;
          }

          .shadow-md {
            box-shadow: none;
          }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6 print-hidden">
        <Button variant="outline" asChild>
          <Link href={`/${locale}/invoices`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToInvoices')}
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <TemplateViewSelector
            initialTemplate={parseInt(invoice?.settings?.template || '1', 10)}
            onTemplateChange={handleTemplateChange}
          />
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/invoice/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              {t('edit')}
            </Link>
          </Button>
          <InvoiceEmailModal invoice={adaptToInvoiceType(invoice)}>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              {t('email')}
            </Button>
          </InvoiceEmailModal>
          <InvoiceExportModal 
            invoice={adaptToInvoiceType(invoice)} 
            selectedTemplate={selectedTemplate}
          >
            <Button>
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </InvoiceExportModal>
        </div>
      </div>

      {/* Replace the existing invoice content with the dynamic template */}
      <div className="print:shadow-none print:p-0 print:border-0">
        <DynamicInvoiceView invoice={adaptToInvoiceType(invoice)} templateId={selectedTemplate} />
      </div>
    </div>
  );
}
