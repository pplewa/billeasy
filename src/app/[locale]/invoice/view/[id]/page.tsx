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

// Types
import { InvoiceType } from "@/types";

import { formatDate } from "@/lib/utils";

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
  // Calculate subtotal and total amount from items
  const items = doc.items || [];
  
  // Process items to ensure numeric values
  const processedItems = items.map((item, index) => {
    const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity || 0);
    const unitPrice = typeof item.unitPrice !== 'undefined'
      ? (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice as unknown as string) : item.unitPrice)
      : (typeof item.price === 'string' ? parseFloat(item.price as unknown as string) : (item.price || 0));
    const discount = typeof item.discount === 'string' ? parseFloat(item.discount as unknown as string) : (item.discount || 0);
    
    // Calculate item total
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
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
  const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);
  
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
      pdfTemplate: doc.settings?.template ? parseInt(doc.settings.template, 10) : 1
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

  if (loading || !invoice) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get the items from the correct location
  const invoiceItems = invoice.items || invoice.details?.items || [];

  // Calculate total amount with discounts applied
  const totalAmount = Array.isArray(invoiceItems) && invoiceItems.length > 0
    ? invoiceItems.reduce(
        (sum: number, item: InvoiceItem) => {
          const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity || 0);
          
          // Handle both price and unitPrice fields
          const price = typeof item.unitPrice !== 'undefined'
            ? (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice as unknown as string) : item.unitPrice)
            : (typeof item.price === 'string' ? parseFloat(item.price as unknown as string) : (item.price || 0));
          
          const discount = typeof item.discount === 'string' ? parseFloat(item.discount as unknown as string) : (item.discount || 0);
          
          const subtotal = quantity * price;
          const discountAmount = subtotal * (discount / 100);
          const itemTotal = subtotal - discountAmount;
          
          return sum + itemTotal;
        },
        0
      )
    : (typeof invoice.details?.totalAmount === 'string' 
        ? parseFloat(invoice.details.totalAmount) 
        : (invoice.details?.totalAmount || 0));

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
        <div className="flex space-x-2">
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

      <div className="bg-white p-8 rounded-lg shadow-md print:shadow-none print:p-0 print:border-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 print:text-black">INVOICE</h1>
            <p className="text-gray-600 print:text-black">#{invoice.details?.invoiceNumber}</p>
          </div>
          {invoice.settings?.logo && (
            <img
              src={invoice.settings.logo}
              alt="Company Logo"
              className="h-16 object-contain print:h-12"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700 print:text-black">From:</h2>
            <div className="text-gray-600 print:text-black">
              <p className="font-semibold">{invoice.sender?.name}</p>
              <p>{invoice.sender?.address}</p>
              <p>
                {invoice.sender?.zipCode}, {invoice.sender?.city}
              </p>
              <p>{invoice.sender?.country}</p>
              <p>Email: {invoice.sender?.email}</p>
              <p>Phone: {invoice.sender?.phone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700 print:text-black">To:</h2>
            <div className="text-gray-600 print:text-black">
              <p className="font-semibold">{invoice.receiver?.name}</p>
              <p>{invoice.receiver?.address}</p>
              <p>
                {invoice.receiver?.zipCode}, {invoice.receiver?.city}
              </p>
              <p>{invoice.receiver?.country}</p>
              <p>Email: {invoice.receiver?.email}</p>
              <p>Phone: {invoice.receiver?.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700 print:text-black">
              Invoice Details:
            </h2>
            <div className="text-gray-600 print:text-black">
              <div className="grid grid-cols-2 gap-2">
                <p>Invoice Date:</p>
                <p>{invoice.details?.invoiceDate && formatDate(new Date(invoice.details.invoiceDate))}</p>
                <p>Due Date:</p>
                <p>{invoice.details?.dueDate && formatDate(new Date(invoice.details.dueDate))}</p>
                <p>Currency:</p>
                <p>{invoice.details?.currency}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 print:text-black">
            Invoice Items:
          </h2>
          <table className="w-full border-collapse print:border print:border-black">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="text-left p-2 border print:border-black print:font-bold">Item</th>
                <th className="text-right p-2 border print:border-black print:font-bold">Quantity</th>
                <th className="text-right p-2 border print:border-black print:font-bold">Price</th>
                <th className="text-right p-2 border print:border-black print:font-bold">Tax</th>
                <th className="text-right p-2 border print:border-black print:font-bold">Discount</th>
                <th className="text-right p-2 border print:border-black print:font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoiceItems) && invoiceItems.length > 0 ? (
                invoiceItems.map((item, index) => {
                  // Ensure numeric values for calculation
                  const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity || 0);
                  
                  // Handle both price and unitPrice fields
                  const price = typeof item.unitPrice !== 'undefined'
                    ? (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice as unknown as string) : item.unitPrice)
                    : (typeof item.price === 'string' ? parseFloat(item.price as unknown as string) : (item.price || 0));
                  
                  // Get tax amount based on new structure first, fallback to legacy taxRate
                  let taxAmount = 0;
                  let taxAmountType = 'percentage';
                  if (item.tax && typeof item.tax.amount !== 'undefined') {
                    taxAmount = typeof item.tax.amount === 'string' ? parseFloat(item.tax.amount) : item.tax.amount;
                    taxAmountType = item.tax.amountType || 'percentage';
                  } else if (typeof item.taxRate !== 'undefined') {
                    taxAmount = typeof item.taxRate === 'string' ? parseFloat(item.taxRate) : item.taxRate;
                    taxAmountType = 'percentage';
                  }
                  
                  // Get discount amount based on new structure first, fallback to legacy discount
                  let discountAmount = 0;
                  let discountAmountType = 'percentage';
                  if (item.discount && typeof item.discount.amount !== 'undefined') {
                    discountAmount = typeof item.discount.amount === 'string' ? parseFloat(item.discount.amount) : item.discount.amount;
                    discountAmountType = item.discount.amountType || 'percentage';
                  } else if (typeof item.discount !== 'undefined' && typeof item.discount === 'number') {
                    discountAmount = item.discount;
                    discountAmountType = 'percentage';
                  }
                  
                  // Calculate item total with tax and discount applied
                  let subtotal = quantity * price;
                  
                  // Apply tax
                  if (taxAmountType === 'percentage') {
                    subtotal += subtotal * (taxAmount / 100);
                  } else if (taxAmountType === 'fixed') {
                    subtotal += taxAmount;
                  }
                  
                  // Apply discount
                  if (discountAmountType === 'percentage') {
                    subtotal -= subtotal * (discountAmount / 100);
                  } else if (discountAmountType === 'fixed') {
                    subtotal -= discountAmount;
                  }
                  
                  const itemTotal = subtotal;
                  
                  return (
                    <tr key={item.id || `item-${index}`} className="border-b">
                      <td className="p-2 border print:border-black">{item.name}</td>
                      <td className="text-right p-2 border print:border-black">{quantity}</td>
                      <td className="text-right p-2 border print:border-black">
                        {invoice.details?.currency} {price.toFixed(2)}
                      </td>
                      <td className="text-right p-2 border print:border-black">
                        {taxAmountType === 'percentage' ? `${taxAmount}%` : `${invoice.details?.currency} ${taxAmount.toFixed(2)}`}
                      </td>
                      <td className="text-right p-2 border print:border-black">
                        {discountAmountType === 'percentage' ? `${discountAmount}%` : `${invoice.details?.currency} ${discountAmount.toFixed(2)}`}
                      </td>
                      <td className="text-right p-2 border print:border-black">
                        {invoice.details?.currency} {itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center">No items found</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td
                  colSpan={5}
                  className="text-right p-2 border print:border-black print:font-bold"
                >
                  Total:
                </td>
                <td className="text-right p-2 border print:border-black print:font-bold">
                  {invoice.details?.currency} {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {(invoice.details?.notes || invoice.details?.terms) && (
          <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4">
            {invoice.details?.notes && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700 print:text-black">
                  Notes:
                </h2>
                <p className="text-gray-600 whitespace-pre-line print:text-black">
                  {invoice.details.notes}
                </p>
              </div>
            )}
            {invoice.details?.terms && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700 print:text-black">
                  Terms and Conditions:
                </h2>
                <p className="text-gray-600 whitespace-pre-line print:text-black">
                  {invoice.details.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Signature */}
        {invoice.details?.signature?.data && (
          <div className="mt-8 border-t border-gray-200 print:border-t-black pt-4">
            <div className="flex flex-col items-end">
              {invoice.details.signature.data.startsWith('data:image') ? (
                <div className="max-w-xs">
                  <img 
                    src={invoice.details.signature.data} 
                    alt="Signature" 
                    className="h-16 print:h-12 object-contain" 
                  />
                </div>
              ) : (
                <div 
                  className="max-w-xs" 
                  style={{ fontFamily: invoice.details.signature.fontFamily }}
                >
                  <p className="text-xl text-gray-800 print:text-black">
                    {invoice.details.signature.data}
                  </p>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500 print:text-black">Authorized Signature</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 