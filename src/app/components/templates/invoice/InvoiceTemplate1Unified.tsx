import React from 'react';
// Import formatCurrency from the new location
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';

// Components
import InvoiceLayout from './InvoiceLayout';

// Types
import { InvoiceType, ItemType } from '@/lib/types';

/**
 * Invoice Template 1 - Classic business style
 * A clean, professional template with a blue accent color
 */
const InvoiceTemplate1 = (data: InvoiceType) => {
  // Use fallbacks for type safety
  const sender = data.sender || {};
  const receiver = data.receiver || {};
  const details = data.details || {};

  // Get the items from the correct location
  const invoiceItems = Array.isArray(details.items) ? details.items : [];

  // Calculate totals
  const subTotal = parseNumber(details.subTotal);
  const totalAmount = parseNumber(details.totalAmount);

  return (
    <InvoiceLayout>
      <div className="flex justify-between">
        <div>
          {details?.invoiceLogo && (
            <img
              src={details.invoiceLogo}
              width={140}
              height={100}
              alt={`Logo of ${sender?.name || 'Company'}`}
              className="object-contain"
            />
          )}
          <h1 className="mt-2 text-lg md:text-xl font-semibold text-blue-600">{sender?.name}</h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Invoice #</h2>
          <span className="mt-1 block text-gray-500">{details?.invoiceNumber}</span>
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
          <h3 className="text-lg font-medium text-gray-800">Invoice Details:</h3>
          <div className="mt-2 text-gray-600">
            <p>
              <span className="font-medium">Invoice Date: </span>
              {formatDate(details?.invoiceDate)}
            </p>
            <p>
              <span className="font-medium">Due Date: </span>
              {formatDate(details?.dueDate)}
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
        <h3 className="text-lg font-medium text-gray-800 mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Quantity</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-right py-3 px-4">Discount</th>
                <th className="text-right py-3 px-4">Tax</th>
                <th className="text-right py-3 px-4">Total</th>
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
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-medium text-gray-800 py-1">Subtotal:</td>
                <td className="text-gray-600 text-right py-1">
                  {formatCurrency(subTotal, details?.currency || 'USD')}
                </td>
              </tr>

              {/* Shipping row */}
              {details?.shipping && (
                <tr>
                  <td className="font-medium text-gray-800 py-1">Shipping:</td>
                  <td className="text-gray-600 text-right py-1">
                    {details.shipping.costType === 'amount'
                      ? formatCurrency(
                          parseNumber(details.shipping.cost),
                          details?.currency || 'USD'
                        )
                      : `${parseNumber(details.shipping.cost)}%`}
                  </td>
                </tr>
              )}

              <tr className="border-t border-gray-200">
                <td className="font-semibold text-gray-800 py-2">Total:</td>
                <td className="font-semibold text-gray-800 text-right py-2">
                  {formatCurrency(totalAmount, details?.currency || 'USD')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {details?.paymentInformation && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-800">Payment Information</h3>
          <div className="mt-2 text-gray-600">
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

      {details?.additionalNotes && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-800">Notes</h3>
          <p className="mt-2 text-gray-600 whitespace-pre-line">{details.additionalNotes}</p>
        </div>
      )}

      {details?.paymentTerms && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-800">Terms</h3>
          <p className="mt-2 text-gray-600 whitespace-pre-line">{details.paymentTerms}</p>
        </div>
      )}

      {details.signature && details.signature.data && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="flex flex-col items-end">
            <div
              className="flex justify-center border-b-2 border-gray-300 pb-2 w-56"
              style={{
                fontFamily: details.signature.fontFamily
                  ? `${details.signature.fontFamily}, cursive`
                  : 'cursive',
              }}
            >
              {details.signature.data.startsWith('data:image') ? (
                <img src={details.signature.data} alt="Signature" className="h-16 object-contain" />
              ) : (
                <p className="text-xl text-gray-800">{details.signature.data}</p>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">Authorized Signature</p>
          </div>
        </div>
      )}
    </InvoiceLayout>
  );
};

export default InvoiceTemplate1;
