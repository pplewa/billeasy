import React from 'react';
import { InvoiceType } from '@/lib/types';
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';

// Type for signature to avoid unknown type errors
interface Signature {
  data?: string;
  fontFamily?: string;
}

// Shared interface for both client and server usage
export interface InvoiceTemplateProps {
  data: InvoiceType;
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
}

/**
 * Invoice Template 3 - Creative Professional
 * This template is implementation only with no client/server directives
 * It's used by both client and server rendering
 *
 * Features a modern, creative design with accent colors and stylish typography
 */
export function Template3({ data, t }: InvoiceTemplateProps) {
  // Use fallbacks for type safety
  const sender = data.sender || {};
  const receiver = data.receiver || {};
  const details = data.details || {};

  // Type-safe access to signature
  const signature = details.signature as Signature | undefined;

  // Get the items from the correct location
  const invoiceItems = Array.isArray(details.items) ? details.items : [];

  // Calculate totals
  const subTotal = parseNumber(details.subTotal);
  const totalAmount = parseNumber(details.totalAmount);

  return (
    <div className="min-h-[29.7cm] p-8 bg-gradient-to-br from-purple-50 to-white">
      {/* Header Section with Creative Layout */}
      <div className="flex justify-between items-start border-b-2 border-purple-200 pb-8">
        <div className="w-1/2">
          {details?.invoiceLogo && (
            <div className="mb-4 relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg blur"></div>
              <img
                src={details.invoiceLogo as string}
                width={180}
                height={120}
                alt={`${String(sender?.name || '')}`}
                className="relative object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {String(sender?.name || '')}
          </h1>
        </div>

        <div className="w-1/2 text-right">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg text-white">
            <h2 className="text-2xl font-light mb-2">{t('invoiceNumber')}</h2>
            <p className="text-3xl font-bold">{String(details?.invoiceNumber || '')}</p>
          </div>
        </div>
      </div>

      {/* Contact Information Grid */}
      <div className="grid grid-cols-2 gap-12 mt-12 mb-12">
        <div className="from-section">
          <h3 className="text-sm uppercase tracking-wider text-purple-600 mb-4">
            {t('billFrom')}:
          </h3>
          <address className="not-italic">
            <p className="font-medium text-lg text-gray-800">{String(sender?.name || '')}</p>
            <p className="text-gray-600">{String(sender?.address || '')}</p>
            <p className="text-gray-600">
              {String(sender?.zipCode || '')}
              {sender?.city ? `, ${String(sender?.city || '')}` : ''}
            </p>
            <p className="text-gray-600">{String(sender?.country || '')}</p>
          </address>
        </div>

        <div className="to-section">
          <h3 className="text-sm uppercase tracking-wider text-purple-600 mb-4">{t('billTo')}:</h3>
          <address className="not-italic">
            <p className="font-medium text-lg text-gray-800">{String(receiver?.name || '')}</p>
            <p className="text-gray-600">{String(receiver?.address || '')}</p>
            <p className="text-gray-600">
              {String(receiver?.zipCode || '')}
              {receiver?.city ? `, ${String(receiver?.city || '')}` : ''}
            </p>
            <p className="text-gray-600">{String(receiver?.country || '')}</p>
          </address>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-12">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-purple-600 mb-1">{t('invoiceDate')}</p>
            <p className="font-medium">{formatDate(details?.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-purple-600 mb-1">{t('dueDate')}</p>
            <p className="font-medium">{formatDate(details?.dueDate)}</p>
          </div>
          {details?.purchaseOrderNumber && (
            <div>
              <p className="text-sm text-purple-600 mb-1">{t('poNumber')}</p>
              <p className="font-medium">{String(details.purchaseOrderNumber)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <th className="py-4 px-6 text-left rounded-tl-lg">{t('item')}</th>
              <th className="py-4 px-6 text-right">{t('qty')}</th>
              <th className="py-4 px-6 text-right">{t('price')}</th>
              <th className="py-4 px-6 text-right">{t('discount')}</th>
              <th className="py-4 px-6 text-right">{t('tax')}</th>
              <th className="py-4 px-6 text-right rounded-tr-lg">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => {
              let quantity = 1;
              let unitPrice = 0;

              // Extract quantity and price based on their location
              if (typeof item.quantity === 'number') {
                quantity = item.quantity;
              } else if (typeof item.quantity === 'string') {
                quantity = parseFloat(item.quantity) || 1;
              }

              if (typeof item.price === 'number') {
                unitPrice = item.price;
              } else if (typeof item.price === 'string') {
                unitPrice = parseFloat(item.price) || 0;
              }

              // Initial subtotal calculation
              const itemSubtotal = unitPrice * quantity;

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
                <tr key={item.id || index} className="border-b border-purple-100">
                  <td className="py-4 px-6">
                    <div className="font-medium">{String(item.name || '')}</div>
                    {item.description && (
                      <div className="font-medium text-gray-800">{String(item.description)}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right text-right">{quantity}</td>
                  <td className="py-4 px-6 text-right text-right">
                    {formatCurrency(unitPrice, String(details?.currency || 'USD'))}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.discount
                      ? item.discount.amountType === 'percentage'
                        ? `${parseNumber(item.discount.amount)}%`
                        : formatCurrency(
                            parseNumber(item.discount.amount),
                            String(details?.currency || 'USD')
                          )
                      : '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {item.tax
                      ? item.tax.amountType === 'percentage'
                        ? `${parseNumber(item.tax.amount)}%`
                        : formatCurrency(
                            parseNumber(item.tax.amount),
                            String(details?.currency || 'USD')
                          )
                      : '-'}
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    {formatCurrency(itemTotal, String(details?.currency || 'USD'))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-1/3 space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t('subtotal')}</span>
            <span className="font-medium">{subTotal}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-purple-100">
            <span className="text-gray-600">{t('total')}</span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with Signature */}
      {signature && (
        <div className="mt-12 pt-8 border-t border-purple-100">
          <div className="flex justify-end">
            <div className="text-center">
              {signature?.data?.startsWith('data:image') ? (
                <img
                  src={signature.data}
                  alt={t('authorizedSignature')}
                  className="h-16 object-contain mb-2"
                />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center"
                  style={{ fontFamily: signature.fontFamily || undefined }}
                >
                  <p className="text-gray-600">{signature.data}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
