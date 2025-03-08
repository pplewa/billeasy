import React from 'react';

// Components
import InvoiceLayout from './InvoiceLayout';

// Helpers
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';

// Types
import { InvoiceType, ItemType } from '@/lib/types';

/**
 * Invoice Template 3 - Creative Professional
 * A stylish template with a green accent color and modern layout
 */
const InvoiceTemplate3 = (data: InvoiceType) => {
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
      <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-lg border-l-4 border-green-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            {details?.invoiceLogo && (
              <img
                src={details.invoiceLogo}
                width={120}
                height={80}
                alt={`Logo of ${sender?.name || 'Company'}`}
                className="object-contain mb-4 md:mb-0"
              />
            )}
            <h1 className="text-xl md:text-2xl font-bold text-green-700 mt-2">{sender?.name}</h1>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700">INVOICE</h2>
            <p className="text-green-600 font-medium"># {details?.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-between gap-8">
        <div className="flex-1 bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            FROM
          </h3>
          <div className="text-gray-600">
            <p className="font-medium">{sender?.name}</p>
            <p>{sender?.address}</p>
            <p>
              {sender?.zipCode}, {sender?.city}
            </p>
            <p>{sender?.country}</p>
            <p>Email: {sender?.email}</p>
            <p>Phone: {sender?.phone}</p>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            TO
          </h3>
          <div className="text-gray-600">
            <p className="font-medium">{receiver?.name}</p>
            <p>{receiver?.address}</p>
            <p>
              {receiver?.zipCode}, {receiver?.city}
            </p>
            <p>{receiver?.country}</p>
            <p>Email: {receiver?.email}</p>
            <p>Phone: {receiver?.phone}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 p-5 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
          DETAILS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Invoice Date</p>
            <p className="font-medium text-gray-700">{formatDate(details?.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium text-gray-700">{formatDate(details?.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Currency</p>
            <p className="font-medium text-gray-700">{details?.currency || 'USD'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">INVOICE ITEMS</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-green-200">
                <th className="text-left py-3 px-4 text-green-700">Description</th>
                <th className="text-right py-3 px-4 text-green-700">Quantity</th>
                <th className="text-right py-3 px-4 text-green-700">Price</th>
                <th className="text-right py-3 px-4 text-green-700">Discount</th>
                <th className="text-right py-3 px-4 text-green-700">Tax</th>
                <th className="text-right py-3 px-4 text-green-700">Amount</th>
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
                  <tr key={item.id || index} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">{quantity}</td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(unitPrice, details?.currency || 'USD')}
                    </td>
                    <td className="text-right py-3 px-4">
                      {item.discount
                        ? item.discount.amountType === 'percentage'
                          ? `${parseNumber(item.discount.amount)}%`
                          : formatCurrency(
                              parseNumber(item.discount.amount),
                              details?.currency || 'USD'
                            )
                        : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {item.tax
                        ? item.tax.amountType === 'percentage'
                          ? `${parseNumber(item.tax.amount)}%`
                          : formatCurrency(parseNumber(item.tax.amount), details?.currency || 'USD')
                        : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(itemTotal, details?.currency || 'USD')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                {formatCurrency(subTotal, details?.currency || 'USD')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-300 mt-2">
              <span className="font-bold text-gray-700">Total:</span>
              <span className="font-bold text-green-700">
                {formatCurrency(totalAmount, details?.currency || 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {details?.additionalNotes && (
        <div className="mt-8 bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{details.additionalNotes}</p>
        </div>
      )}

      {details?.paymentTerms && (
        <div className="mt-4 bg-gray-50 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
          <p className="text-gray-600 whitespace-pre-line">{details.paymentTerms}</p>
        </div>
      )}

      {details.signature && details.signature.data && (
        <div className="mt-8 border-t border-gray-200 pt-4 text-right">
          <div className="inline-block max-w-xs">
            {details.signature.data.startsWith('data:image') ? (
              <img src={details.signature.data} alt="Signature" className="h-16 object-contain" />
            ) : (
              <p
                className="text-xl text-gray-800"
                style={{ fontFamily: details.signature.fontFamily || undefined }}
              >
                {details.signature.data}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">Authorized Signature</p>
          </div>
        </div>
      )}
    </InvoiceLayout>
  );
};

export default InvoiceTemplate3;
