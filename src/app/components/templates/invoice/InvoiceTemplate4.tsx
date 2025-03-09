import React from 'react';
import { InvoiceType } from '@/lib/types';
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';

// Type for signature to avoid unknown type errors
interface Signature {
  url?: string;
  fontFamily?: string;
}

// Shared interface for both client and server usage
export interface InvoiceTemplateProps {
  data: InvoiceType;
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
}

/**
 * Invoice Template 4 - Premium Corporate
 * This template is implementation only with no client/server directives
 * It's used by both client and server rendering
 * 
 * Features a premium corporate design with elegant typography and layout
 */
export function Template4({ data, t }: InvoiceTemplateProps) {
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
    <div className="min-h-[29.7cm] bg-white">
      {/* Top Bar */}
      <div className="h-4 bg-blue-900" />

      {/* Main Content */}
      <div className="p-8 lg:p-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div className="w-1/2">
            {details?.invoiceLogo && (
              <img
                src={details.invoiceLogo as string}
                width={160}
                height={100}
                alt={`${t('templatePreview', { id: 4 })} - ${String(sender?.name || 'Company')}`}
                className="object-contain mb-4"
              />
            )}
            <h1 className="text-2xl font-semibold text-blue-900">{String(sender?.name || '')}</h1>
          </div>

          <div className="w-1/2">
            <div className="float-right text-right">
              <h2 className="text-4xl font-light text-blue-900 mb-2">{t('invoice')}</h2>
              <div className="text-gray-600">
                <p className="text-lg">
                  <span className="font-medium">{t('invoiceNumber')}: </span>
                  {String(details?.invoiceNumber || '')}
                </p>
                <p>
                  <span className="font-medium">{t('invoiceDate')}: </span>
                  {formatDate(details?.invoiceDate)}
                </p>
                <p>
                  <span className="font-medium">{t('dueDate')}: </span>
                  {formatDate(details?.dueDate)}
                </p>
                {details?.purchaseOrderNumber && (
                  <p>
                    <span className="font-medium">{t('poNumber')}: </span>
                    {String(details.purchaseOrderNumber)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-16 mb-16">
          {/* From Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-3">
              {t('from')}
            </h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <address className="not-italic">
                <p className="font-medium text-lg text-gray-900">{String(sender?.name || '')}</p>
                <div className="text-gray-600 mt-2 space-y-1">
                  <p>{String(sender?.address || '')}</p>
                  <p>
                    {String(sender?.zipCode || '')}, {String(sender?.city || '')}
                  </p>
                  <p>{String(sender?.country || '')}</p>
                  <p className="mt-3">{String(sender?.email || '')}</p>
                  <p>{String(sender?.phone || '')}</p>
                </div>
              </address>
            </div>
          </div>

          {/* To Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-3">
              {t('billTo')}
            </h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              <address className="not-italic">
                <p className="font-medium text-lg text-gray-900">{String(receiver?.name || '')}</p>
                <div className="text-gray-600 mt-2 space-y-1">
                  <p>{String(receiver?.address || '')}</p>
                  <p>
                    {String(receiver?.zipCode || '')}, {String(receiver?.city || '')}
                  </p>
                  <p>{String(receiver?.country || '')}</p>
                  <p className="mt-3">{String(receiver?.email || '')}</p>
                  <p>{String(receiver?.phone || '')}</p>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-16">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 text-left text-blue-900 font-semibold">
                    {t('description')}
                  </th>
                  <th className="py-4 px-6 text-right text-blue-900 font-semibold">
                    {t('quantity')}
                  </th>
                  <th className="py-4 px-6 text-right text-blue-900 font-semibold">
                    {t('unitPrice')}
                  </th>
                  <th className="py-4 px-6 text-right text-blue-900 font-semibold">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceItems.map((item, index) => (
                  <tr key={index} className="text-gray-700">
                    <td className="py-4 px-6">
                      <p className="font-medium">{String(item.description || '')}</p>
                      {item.details && (
                        <p className="text-sm text-gray-500 mt-1">{String(item.details)}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">{String(item.quantity || '')}</td>
                    <td className="py-4 px-6 text-right">{String(item.unitPrice || '')}</td>
                    <td className="py-4 px-6 text-right font-medium">{String(item.amount || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Notes */}
        <div className="grid grid-cols-2 gap-16">
          {/* Notes */}
          <div>
            {details?.notes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-3">
                  {t('notes')}
                </h3>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 whitespace-pre-line">{String(details.notes)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>{t('subtotal')}</span>
                  <span className="font-medium">{subTotal}</span>
                </div>
                <div className="flex justify-between text-gray-700 pt-3 border-t border-gray-200">
                  <span className="font-medium text-blue-900">{t('total')}</span>
                  <span className="text-xl font-bold text-blue-900">{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Signature */}
        {signature && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-center">
                <img
                  src={signature.url}
                  alt={t('signature')}
                  className="h-16 object-contain mb-2"
                  style={{ fontFamily: signature.fontFamily }}
                />
                <p className="font-medium text-gray-900">{String(sender?.name || '')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="h-4 bg-blue-900" />
    </div>
  );
} 