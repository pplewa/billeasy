"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceDocument } from "@/lib/db/models/Invoice";
import { formatDate } from "@/lib/utils";
import { fetchInvoiceById } from "@/services/invoice/client/invoiceClient";
import { ArrowLeft, Download, Edit, Printer } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { id, locale } = params as { id: string; locale: string };
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<InvoiceDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoiceById(id);
        setInvoice(data);
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
    window.print();
  };

  if (loading || !invoice) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Calculate total amount
  const totalAmount = invoice.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
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
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600">#{invoice.details.invoiceNumber}</p>
          </div>
          {invoice.settings.logo && (
            <img
              src={invoice.settings.logo}
              alt="Company Logo"
              className="h-16 object-contain"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">From:</h2>
            <div className="text-gray-600">
              <p className="font-semibold">{invoice.sender.name}</p>
              <p>{invoice.sender.address}</p>
              <p>
                {invoice.sender.zipCode}, {invoice.sender.city}
              </p>
              <p>{invoice.sender.country}</p>
              <p>Email: {invoice.sender.email}</p>
              <p>Phone: {invoice.sender.phone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">To:</h2>
            <div className="text-gray-600">
              <p className="font-semibold">{invoice.receiver.name}</p>
              <p>{invoice.receiver.address}</p>
              <p>
                {invoice.receiver.zipCode}, {invoice.receiver.city}
              </p>
              <p>{invoice.receiver.country}</p>
              <p>Email: {invoice.receiver.email}</p>
              <p>Phone: {invoice.receiver.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Invoice Details:
            </h2>
            <div className="text-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <p>Invoice Date:</p>
                <p>{formatDate(new Date(invoice.details.invoiceDate))}</p>
                <p>Due Date:</p>
                <p>{formatDate(new Date(invoice.details.dueDate))}</p>
                <p>Currency:</p>
                <p>{invoice.details.currency}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Invoice Items:
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border">Item</th>
                <th className="text-right p-2 border">Quantity</th>
                <th className="text-right p-2 border">Price</th>
                <th className="text-right p-2 border">Tax Rate</th>
                <th className="text-right p-2 border">Discount</th>
                <th className="text-right p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 border">{item.name}</td>
                    <td className="text-right p-2 border">{item.quantity}</td>
                    <td className="text-right p-2 border">
                      {invoice.details.currency} {item.price.toFixed(2)}
                    </td>
                    <td className="text-right p-2 border">
                      {item.taxRate}%
                    </td>
                    <td className="text-right p-2 border">
                      {item.discount || 0}%
                    </td>
                    <td className="text-right p-2 border">
                      {invoice.details.currency} {itemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td
                  colSpan={5}
                  className="text-right p-2 border"
                >
                  Total:
                </td>
                <td className="text-right p-2 border">
                  {invoice.details.currency} {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {(invoice.details.notes || invoice.details.terms) && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            {invoice.details.notes && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Notes:
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {invoice.details.notes}
                </p>
              </div>
            )}
            {invoice.details.terms && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Terms and Conditions:
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {invoice.details.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {invoice.details.signature && (
          <div className="mt-12">
            <div className="border-t border-gray-300 pt-4 max-w-xs">
              <img
                src={invoice.details.signature}
                alt="Signature"
                className="h-16 object-contain"
              />
              <p className="text-gray-600 mt-2">Authorized Signature</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 