import React from "react";

// Components
import InvoiceLayout from "./InvoiceLayout";

// Helpers
import { formatCurrency } from "@/lib/utils";

// Types
import { InvoiceType } from "@/types-optional";

/**
 * Invoice Template 1 - Classic business style
 * A clean, professional template with a blue accent color
 */
const InvoiceTemplate1 = (data: InvoiceType) => {
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
      <div className="flex justify-between">
        <div>
          {details?.invoiceLogo && (
            <img
              src={details.invoiceLogo}
              width={140}
              height={100}
              alt={`Logo of ${sender?.name || "Company"}`}
              className="object-contain"
            />
          )}
          <h1 className="mt-2 text-lg md:text-xl font-semibold text-blue-600">
            {sender?.name}
          </h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Invoice #
          </h2>
          <span className="mt-1 block text-gray-500">
            {details?.invoiceNumber}
          </span>
          <address className="mt-4 not-italic text-gray-800">
            {sender?.address}
            <br />
            {sender?.zipCode}, {sender?.city}
            <br />
            {sender?.country}
            <br />
          </address>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Bill To:</h3>
          <div className="mt-2 text-gray-600">
            {receiver?.name && <p className="font-medium">{receiver?.name}</p>}
            {receiver?.address && <p>{receiver?.address}</p>}
            {receiver?.zipCode && (
              <p>
                {receiver?.zipCode}, {receiver?.city}
              </p>
            )}
            {receiver?.country && <p>{receiver?.country}</p>}
            {receiver?.email && <p>Email: {receiver?.email}</p>}
            {receiver?.phone && <p>Phone: {receiver?.phone}</p>}
          </div>
        </div>
        <div className="sm:text-right">
          <h3 className="text-lg font-medium text-gray-800">
            Invoice Details:
          </h3>
          <div className="mt-2 text-gray-600">
            <p>
              <span className="font-medium">Invoice Date: </span>
              {(details?.invoiceDate instanceof Date
                ? details.invoiceDate
                : new Date(details?.invoiceDate || new Date())
              ).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Due Date: </span>
              {details?.dueDate instanceof Date
                ? details.dueDate.toLocaleDateString()
                : details?.dueDate}
            </p>
            {details?.purchaseOrderNumber && (
              <p>
                <span className="font-medium">PO Number: </span>
                {details.purchaseOrderNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="border border-gray-200 p-4 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-medium text-gray-500 uppercase">
                <th className="text-left py-2 px-2 w-1/2">Item</th>
                <th className="text-center py-2 px-2">Qty</th>
                <th className="text-center py-2 px-2">Rate</th>
                <th className="text-right py-2 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems?.map((item, index) => {
                // Parse item values
                const quantity = parseNumber(item.quantity);
                const unitPrice = parseNumber(item.unitPrice);
                const total = parseNumber(item.total);

                return (
                  <tr key={item.id || index}>
                    <td className="py-2 px-2 border-t border-gray-200">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-600 whitespace-pre-line">
                        {item.description}
                      </p>
                    </td>
                    <td className="text-center py-2 px-2 border-t border-gray-200">
                      <p className="text-gray-800">{quantity}</p>
                    </td>
                    <td className="text-center py-2 px-2 border-t border-gray-200">
                      <p className="text-gray-800">
                        {formatCurrency(unitPrice, details?.currency || "USD")}
                      </p>
                    </td>
                    <td className="text-right py-2 px-2 border-t border-gray-200">
                      <p className="text-gray-800">
                        {formatCurrency(
                          total || quantity * unitPrice,
                          details?.currency || "USD"
                        )}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-medium text-gray-800 py-1">Subtotal:</td>
                <td className="text-gray-600 text-right py-1">
                  {formatCurrency(subTotal, details?.currency || "USD")}
                </td>
              </tr>

              {/* Tax row */}
              {details?.tax?.amount != undefined &&
                parseNumber(details?.tax?.amount) > 0 && (
                  <tr>
                    <td className="font-medium text-gray-800 py-1">Tax:</td>
                    <td className="text-gray-600 text-right py-1">
                      {details.tax.amountType === "amount"
                        ? formatCurrency(
                            parseNumber(details.tax.amount),
                            details?.currency || "USD"
                          )
                        : `${parseNumber(details.tax.amount)}%`}
                    </td>
                  </tr>
                )}

              {/* Discount row */}
              {details?.discount?.amount != undefined &&
                parseNumber(details?.discount?.amount) > 0 && (
                  <tr>
                    <td className="font-medium text-gray-800 py-1">
                      Discount:
                    </td>
                    <td className="text-gray-600 text-right py-1">
                      {details.discount.amountType === "amount"
                        ? formatCurrency(
                            parseNumber(details.discount.amount),
                            details?.currency || "USD"
                          )
                        : `${parseNumber(details.discount.amount)}%`