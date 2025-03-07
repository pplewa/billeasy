"use client";

// Next.js
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Icons
import {
  ArrowLeft,
  Download,
  Edit,
  Mail,
  Printer,
  ChevronDown,
} from "lucide-react";

// Services
import { fetchInvoiceById } from "@/services/invoice/client/invoiceClient";

// Invoice Components
import { InvoiceEmailModal } from "@/components/invoice/InvoiceEmailModal";
import { InvoiceExportModal } from "@/components/invoice/InvoiceExportModal";
import { TemplateViewSelector } from "@/components/invoice/TemplateViewSelector";
import DynamicInvoiceView from "@/components/invoice/DynamicInvoiceView";

// Types
import { InvoiceType } from "@/types";

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
  discount?: {
    amount: number;
    amountType?: string;
  } | number; // Can be either the new structure or a legacy number
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
}

/**
 * Converts a ViewInvoiceDocument to InvoiceType format
 * @param doc The ViewInvoiceDocument to convert
 * @returns An object in InvoiceType format
 */
const adaptToInvoiceType = (doc: ViewInvoiceDocument): InvoiceType => {
  if (!doc) return {} as InvoiceType;
  
  // Calculate subtotal and total amount from items
  const items = doc.items || [];
  
  // Process items to ensure numeric values
  const processedItems = items.map((item, index) => {
    const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity || 0);
    const unitPrice = typeof item.unitPrice !== 'undefined'
      ? (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice as unknown as string) : item.unitPrice)
      : (typeof item.price === 'string' ? parseFloat(item.price as unknown as string) : (item.price || 0));
    
    // Handle discount properly based on type
    let discount = 0;
    if (typeof item.discount === 'object' && item.discount !== null && 'amount' in item.discount) {
      discount = typeof item.discount.amount === 'string' 
        ? parseFloat(item.discount.amount) 
        : (item.discount.amount || 0);
    } else if (typeof item.discount === 'number') {
      discount = item.discount;
    } else if (typeof item.discount === 'string') {
      discount = parseFloat(item.discount) || 0;
    }
    
    // Calculate item total
    const subtotal = quantity * unitPrice;
    // Apply a percentage discount by default (safely convert to number)
    const discountAmount = subtotal * (Number(discount) / 100);
    const total = subtotal - discountAmount;
    
    return {
      id: item.id || `item-${index}`,
      name: item.name || '',
      description: item.description || '',
      quantity: quantity,
      unitPrice: unitPrice,
      discount: discount,
      total: total
    };
  });
  
  // Calculate subtotal and total
  const subTotal = processedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAmount = processedItems.reduce((sum, item) => sum + (item.total || 0), 0);
  
  // Process signature data
  let signature;
  if (doc.details?.signature) {
    if (typeof doc.details.signature === 'string') {
      signature = { data: doc.details.signature };
    } else {
      // Process font family to extract the actual font name if it's a CSS variable
      let fontFamily = doc.details.signature.fontFamily || '';
      if (fontFamily.startsWith('var(--font-')) {
        fontFamily = fontFamily.replace(/var\(--font-([^)]+)\)/, '$1');
      }
      
      signature = {
        data: doc.details.signature.data || '',
        fontFamily: fontFamily
      };
    }
  }
  
  // Convert template string to number
  const templateId = doc.settings?.template ? parseInt(doc.settings.template, 10) : 1;
  
  return {
    sender: doc.sender,
    receiver: doc.receiver,
    details: {
      invoiceLogo: doc.settings?.logo,
      invoiceNumber: doc.details?.invoiceNumber || '',
      invoiceDate: doc.details?.invoiceDate,
      dueDate: doc.details?.dueDate,
      currency: doc.details?.currency,
      items: processedItems,
      additionalNotes: doc.details?.notes,
      paymentTerms: doc.details?.terms || '',
      signature: signature,
      subTotal: subTotal,
      totalAmount: totalAmount,
      pdfTemplate: templateId
    }
  };
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
        console.log('Loaded invoice data (raw):', JSON.stringify(data, null, 2)); // Log the raw data
        
        // Ensure items array exists and is properly structured
        let items = [];
        
        // Try to get items from different possible locations in the data structure
        if (Array.isArray(data.items) && data.items.length > 0) {
          items = data.items;
          console.log('Using items from root level:', items);
        } else if (data.details && Array.isArray(data.details.items) && data.details.items.length > 0) {
          items = data.details.items;
          console.log('Using items from details level:', items);
        }
        
        console.log('Raw items before processing:', JSON.stringify(items, null, 2));
        
        // Process each item to ensure it has all required properties and numeric values are properly parsed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedItems = items.map((item: any, index: number) => {
          console.log(`Processing item ${index}:`, item);
          
          // Handle both string and number types for numeric fields
          // For unitPrice vs price field naming
          const price = typeof item.unitPrice !== 'undefined' 
            ? (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice) 
            : (typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0));
          
          const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity || 0);
          const taxRate = typeof item.taxRate === 'string' ? parseFloat(item.taxRate) : (item.taxRate || 0);
          const discount = typeof item.discount === 'string' ? parseFloat(item.discount) : (item.discount || 0);
          
          console.log(`Item ${index} parsed values:`, { price, quantity, taxRate, discount });
          
          return {
            id: item.id || `item-${index}`,
            name: item.name || '',
            quantity: quantity,
            price: price,
            taxRate: taxRate,
            discount: discount
          };
        });
        
        console.log('Processed items:', processedItems);
        
        const processedData = {
          ...data,
          items: processedItems
        };
        
        console.log('Processed invoice data:', processedData); // Log the processed data
        console.log('Items array:', processedData.items); // Log the items array specifically
        
        setInvoice(processedData as unknown as ViewInvoiceDocument);
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
          template: templateId.toString()
        }
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
          
          h1, h2 {
            color: #000;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
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
        <DynamicInvoiceView 
          invoice={adaptToInvoiceType(invoice)} 
          templateId={selectedTemplate} 
        />
      </div>
    </div>
  );
} 