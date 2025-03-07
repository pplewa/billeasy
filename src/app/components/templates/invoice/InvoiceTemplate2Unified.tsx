import React from "react";

// Components
import InvoiceLayout from "./InvoiceLayout";

// Helpers
import { formatCurrency } from "@/lib/utils";

// Types
import { InvoiceType, ItemType } from "@/types-optional";

/**
 * Invoice Template 2 - Modern minimalist style
 * A sleek, modern template with a dark accent color
 */
const InvoiceTemplate2 = (data: InvoiceType) => {
  const { sender, receiver, details } = data;

  // Parse numeric values to ensure they're numbers, not strings
  const parseNumber = (value: unknown): number => {
    if (value === undefined || value === null) return 0;
    return typeof value === "string"
      ? parseFloat(value) || 0
      : typeof value === "number"
        ? value
        : 0;
  };

  // Get the items from the correct location
  const invoiceItems = details?.items || [];

  // Calculate totals
  const subTotal = parseNumber(details?.subTotal);
  const totalAmount = parseNumber(details?.totalAmount);

  return (
    <InvoiceLayout data={data}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          {details?.invoiceLogo && (
            <img
              src={details.invoiceLogo}
              width={140}
              height={100}
              alt={`Logo of ${sender?.name || "Company"}`}
              className="object-contain mb-4 md:mb-0"
            />
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {sender?.name}
          </h1>
        </div>
        <div className="mt-4 md:mt-0">
          <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
          <span className="inline-block mt-1 bg-gray-900 text-white px-3 py-1 text-sm font-medium">
            # {details?.invoiceNumber}
          </span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Sender and receiver info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">From</h3>
            <div className="text-gray-700">
              {sender?.name && <p className="font-medium">{sender?.name}</p>}
              {sender?.address && <p>{sender?.address}</p>}
              {sender?.zipCode && (
                <p>
                  {sender?.zipCode}, {sender?.city}
                </p>
              )}
              {sender?.country && <p>{sender?.country}</p>}
              {sender?.email && <p className="mt-2">Email: {sender?.email}</p>}
              {sender?.phone && <p>Phone: {sender?.phone}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Bill To</h3>
            <div className="text-gray-700">
              {receiver?.name && <p className="font-medium">{receiver?.name}</p>}
              {receiver?.address && <p>{receiver?.address}</p>}
              {receiver?.zipCode && (
                <p>
                  {receiver?.zipCode}, {receiver?.city}
                </p>
              )}
              {receiver?.country && <p>{receiver?.country}</p>}
              {receiver?.email && <p className="mt-2">Email: {receiver?.email}</p>}
              {receiver?.phone && <p>Phone: {receiver?.phone}</p>}
            </div>
          </div>
        </div>
        
        {/* Invoice details */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="text-sm text-gray-500">Invoice Date</p>
              <p>{details?.invoiceDate instanceof Date
                ? details.invoiceDate.toLocaleDateString()
                : details?.invoiceDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p>{details?.dueDate instanceof Date
                ? details.dueDate.toLocaleDateString()
                : details?.dueDate}</p>
            </div>
            {details?.purchaseOrderNumber && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">PO Number</p>
                <p>{details.purchaseOrderNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mt-10">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Quantity</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-right py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item: ItemType, index: number) => {
                const quantity = parseNumber(item.quantity);
                const unitPrice = parseNumber(item.unitPrice || item.price);
                const itemTotal = parseNumber(item.total);
                
                return (
                  <tr key={item.id || index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">{quantity}</td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(unitPrice, details?.currency || "USD")}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(itemTotal, details?.currency || "USD")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                {formatCurrency(subTotal, details?.currency || "USD")}
              </span>
            </div>

            {/* Tax row */}
            {details?.tax?.amount != undefined &&
              parseNumber(details?.tax?.amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-800">
                    {details.tax.amountType === "amount"
                      ? formatCurrency(
                          parseNumber(details.tax.amount),
                          details?.currency || "USD"
                        )
                      : `${parseNumber(details.tax.amount)}%`}
                  </span>
                </div>
              )}

            {/* Discount row */}
            {details?.discount?.amount != undefined &&
              parseNumber(details?.discount?.amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-gray-800">
                    {details.discount.amountType === "amount"
                      ? formatCurrency(
                          parseNumber(details.discount.amount),
                          details?.currency || "USD"
                        )
                      : `${parseNumber(details.discount.amount)}%`}
                  </span>
                </div>
              )}

            {/* Shipping row */}
            {details?.shipping?.cost != undefined &&
              parseNumber(details?.shipping?.cost) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-800">
                    {details.shipping.costType === "amount"
                      ? formatCurrency(
                          parseNumber(details.shipping.cost),
                          details?.currency || "USD"
                        )
                      : `${parseNumber(details.shipping.cost)}%`}
                  </span>
                </div>
              )}

            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="font-bold text-gray-800">
                {formatCurrency(totalAmount, details?.currency || "USD")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {details?.paymentInformation && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Payment Information
          </h3>
          <div className="text-gray-700">
            {details.paymentInformation.bankName && (
              <p>
                <span className="font-medium">Bank: </span>
                {details.paymentInformation.bankName}
              </p>
            )}
            {details.paymentInformation.accountName && (
              <p>
                <span className="font-medium">Account Name: </span>
                {details.paymentInformation.accountName}
              </p>
            )}
            {details.paymentInformation.accountNumber && (
              <p>
                <span className="font-medium">Account Number: </span>
                {details.paymentInformation.accountNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {details?.additionalNotes && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {details.additionalNotes}
          </p>
        </div>
      )}

      {/* Terms */}
      {details?.paymentTerms && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Terms</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {details.paymentTerms}
          </p>
        </div>
      )}

      {/* Signature */}
      {details?.signature?.data && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="flex flex-col items-end">
            <div
              className="max-w-xs"
              style={{
                fontFamily: details.signature.fontFamily
                  ? `${details.signature.fontFamily}, cursive`
                  : "cursive",
              }}
            >
              {details.signature.data.startsWith("data:image") ? (
                <img
                  src={details.signature.data}
                  alt="Signature"
                  className="h-16 object-contain"
                />
              ) : (
                <p className="text-xl text-gray-800">
                  {details.signature.data}
                </p>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">Authorized Signature</p>
          </div>
        </div>
      )}
    </InvoiceLayout>
  );
};

export default InvoiceTemplate2; 