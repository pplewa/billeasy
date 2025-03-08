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
import { InvoiceType } from '@/types';

// Add the import for our new adapter
import { normalizeInvoice } from '@/lib/invoice-adapter';

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
const adaptToInvoiceType = (doc: ViewInvoiceDocument): InvoiceType => {
  // ViewInvoiceDocument is compatible with SourceInvoice
  // since SourceInvoice accepts any key-value pairs
  return normalizeInvoice(doc);
};

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { id, locale } = params as { id: string; locale: string };
  const { toast } = useToast();

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
        const processedItems = items.map((item, index) => {
          // Normalize item fields
          const price =
            typeof item.unitPrice === 'number'
              ? item.unitPrice
              : typeof item.price === 'number'
                ? item.price
                : 0;

          const quantity = typeof item.quantity === 'number' ? item.quantity : 1;

          // Handle tax - could be in tax object or taxRate field
          const taxRate = item.tax?.amount ?? item.taxRate ?? 0;

          // Handle discount - could be direct number or in discount object
          const discount =
            typeof item.discount === 'number' ? item.discount : (item.discount?.amount ?? 0);

          // Build a standardized item object
          return {
            ...item,
            id: item.id || `item-${index}`,
            name: item.name || 'Unnamed Item',
            description: item.description || '',
            quantity: quantity,
            unitPrice: price,
            tax: { amount: taxRate, amountType: item.tax?.amountType || 'percentage' },
            discount: { amount: discount, amountType: item.discount?.amountType || 'percentage' },
            total: item.total || price * quantity,
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
            Back to Invoices
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <TemplateViewSelector
            initialTemplate={parseInt(invoice?.settings?.template || '1', 10)}
            onTemplateChange={handleTemplateChange}
          />
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/invoice/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <InvoiceEmailModal invoice={adaptToInvoiceType(invoice)}>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </InvoiceEmailModal>
          <InvoiceExportModal invoice={adaptToInvoiceType(invoice)}>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
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
