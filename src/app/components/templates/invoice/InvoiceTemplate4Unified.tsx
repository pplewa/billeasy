import React from 'react';

// Components
import InvoiceLayout from './InvoiceLayout';

// Helpers
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';

// Types
import { InvoiceType, ItemType } from '@/lib/types';

/**
 * Invoice Template 4 - Premium Corporate
 * An elegant template with a purple accent color and sophisticated layout
 */
const InvoiceTemplate4 = (data: InvoiceType) => {
  // Use fallbacks for type safety
  const sender = data.sender || {};
  const receiver = data.receiver || {};
  const details = data.details || {};

  // Get the items from the correct location
  const invoiceItems = Array.isArray(details.items) ? details.items : [];

  // Calculate totals
  const subTotal = parseNumber(details?.subTotal);
  const totalAmount = parseNumber(details?.totalAmount);

  return (
    <InvoiceLayout>
      <div className="relative">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-1/4 h-32 bg-purple-200 rounded-bl-full opacity-50"></div>

        {/* Header with logo and invoice title */}
        <div className="flex justify-between items-start mb-12 relative">
          <div>
            {details?.invoiceLogo && (
              <img
                src={details.invoiceLogo}
                width={150}
                height={100}
                alt={`Logo of ${sender?.name || 'Company'}`}
                className="object-contain mb-2"
              />
            )}
            <h1 className="text-xl font-semibold text-gray-800">{sender?.name}</h1>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-purple-700">INVOICE</h2>
            <div className="mt-1 inline-block px-4 py-1 bg-purple-100 rounded-full text-purple-800 font-medium">
              # {details?.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Main grid for addresses and details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* From section */}
          <div>
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-1 mb-3">
              From
            </h3>
            <div className="text-gray-700">
              <p className="font-medium">{sender?.name}</p>
              <p>{sender?.address}</p>
              <p>
                {sender?.zipCode}, {sender?.city}
              </p>
              <p>{sender?.country}</p>
            </div>
            <div className="mt-3 text-gray-600">
              <p>Email: {sender?.email}</p>
              <p>Phone: {sender?.phone}</p>
            </div>
          </div>

          {/* To section */}
          <div>
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-1 mb-3">
              To
            </h3>
            <div className="text-gray-700">
              <p className="font-medium">{receiver?.name}</p>
              <p>{receiver?.address}</p>
              <p>
                {receiver?.zipCode}, {receiver?.city}
              </p>
              <p>{receiver?.country}</p>
            </div>
            <div className="mt-3 text-gray-600">
              <p>Email: {receiver?.email}</p>
              <p>Phone: {receiver?.phone}</p>
            </div>
          </div>

          {/* Details section */}
          <div>
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-1 mb-3">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-1">
              <p className="text-gray-600">Invoice Date:</p>
              <p className="text-gray-800 font-medium">{formatDate(details?.invoiceDate)}</p>

              <p className="text-gray-600">Due Date:</p>
              <p className="text-gray-800 font-medium">{formatDate(details?.dueDate)}</p>

              <p className="text-gray-600">Currency:</p>
              <p className="text-gray-800 font-medium">{details?.currency || 'USD'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-2 mb-4">
          Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-50">
                <th className="py-3 px-4 text-left text-gray-700">Item Description</th>
                <th className="py-3 px-4 text-right text-gray-700">Quantity</th>
                <th className="py-3 px-4 text-right text-gray-700">Price</th>
                <th className="py-3 px-4 text-right text-gray-700">Discount</th>
                <th className="py-3 px-4 text-right text-gray-700">Tax</th>
                <th className="py-3 px-4 text-right text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item: ItemType, index: number) => {
                const quantity = parseNumber(item.quantity);
                const unitPrice = parseNumber(item.unitPrice || item.price);
                const itemSubtotal = quantity * unitPrice;

                // Calculate discount
                let discountAmount = 0;
                if (item.discount) {
                  if (item.discount.amountType === 'percentage') {
                    discountAmount = itemSubtotal * (parseNumber(item.discount.amount) / 100);
                  } else {
                    discountAmount = parseNumber(item.discount.amount);
                  }
                }

                // Calculate tax
                let taxAmount = 0;
                if (item.tax) {
                  const taxableAmount = itemSubtotal - discountAmount;
                  if (item.tax.amountType === 'percentage') {
                    taxAmount = taxableAmount * (parseNumber(item.tax.amount) / 100);
                  } else {
                    taxAmount = parseNumber(item.tax.amount);
                  }
                }

                // Calculate final total
                const itemTotal = itemSubtotal - discountAmount + taxAmount;

                return (
                  <tr key={item.id || index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">{quantity}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(unitPrice, details?.currency || 'USD')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.discount
                        ? item.discount.amountType === 'percentage'
                          ? `${parseNumber(item.discount.amount)}%`
                          : formatCurrency(
                              parseNumber(item.discount.amount),
                              details?.currency || 'USD'
                            )
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.tax
                        ? item.tax.amountType === 'percentage'
                          ? `${parseNumber(item.tax.amount)}%`
                          : formatCurrency(parseNumber(item.tax.amount), details?.currency || 'USD')
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(itemTotal, details?.currency || 'USD')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals section with purple gradient background */}
      <div className="mb-10 flex justify-end">
        <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-sm">
          <div className="border-b border-purple-100 pb-2 mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                {formatCurrency(subTotal, details?.currency || 'USD')}
              </span>
            </div>

            {/* Shipping row */}
            {details?.shipping && (
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-800">
                  {details.shipping.costType === 'amount'
                    ? formatCurrency(parseNumber(details.shipping.cost), details?.currency || 'USD')
                    : `${parseNumber(details.shipping.cost)}%`}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-purple-700">
              {formatCurrency(totalAmount, details?.currency || 'USD')}
            </span>
          </div>
        </div>
      </div>

      {/* Notes and terms in two-column layout */}
      {(details?.additionalNotes || details?.paymentTerms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {details?.additionalNotes && (
            <div>
              <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-1 mb-2">
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{details.additionalNotes}</p>
            </div>
          )}

          {details?.paymentTerms && (
            <div>
              <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider border-b border-purple-200 pb-1 mb-2">
                Terms & Conditions
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{details.paymentTerms}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature section */}
      {details.signature && details.signature.data && (
        <div className="mt-8 text-right border-t border-gray-200 pt-4">
          <div className="inline-block">
            <div className="max-w-xs">
              {details.signature.data.startsWith('data:image') ? (
                <img
                  src={details.signature.data}
                  alt="Signature"
                  className="h-16 object-contain mr-0 ml-auto"
                />
              ) : (
                <p
                  className="text-xl text-gray-800 text-right"
                  style={{ fontFamily: details.signature.fontFamily || undefined }}
                >
                  {details.signature.data}
                </p>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-500">Authorized Signature</div>
          </div>
        </div>
      )}
    </InvoiceLayout>
  );
};

export default InvoiceTemplate4;
