import React from 'react';
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';
import InvoiceLayout from './InvoiceLayout';
import { InvoiceType } from '@/lib/types';

// Type for signature to avoid unknown type errors
interface Signature {
  name?: string;
  fontFamily?: string;
}

// Shared interface for both client and server usage
export interface InvoiceTemplateProps {
  data: InvoiceType;
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
}

/**
 * Invoice Template 2 - Minimalist Modern
 * This template is implementation only with no client/server directives
 * It's used by both client and server rendering
 */
export function Template2({ data, t }: InvoiceTemplateProps) {
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
    <InvoiceLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          {details?.invoiceLogo && (
            <img
              src={details.invoiceLogo as string}
              width={140}
              height={100}
              alt={`${t('templatePreview', { id: 2 })} - ${String(sender?.name || 'Company')}`}
              className="object-contain"
            />
          )}
        </div>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">{t('invoiceNumber')}</h2>
          <span className="mt-1 block text-gray-500">{String(details?.invoiceNumber || '')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">{t('billFrom')}</h3>
          <div className="text-gray-600">
            <p className="font-semibold">{String(sender?.name || '')}</p>
            <p>{String(sender?.address || '')}</p>
            <p>
              {String(sender?.zipCode || '')}
              {sender?.city ? `, ${String(sender?.city)}` : ''}
            </p>
            <p>{String(sender?.country || '')}</p>
            <p>{String(sender?.email || '')}</p>
            <p>{String(sender?.phone || '')}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{t('billTo')}</h3>
          <div className="text-gray-600">
            <p className="font-semibold">{String(receiver?.name || '')}</p>
            <p>{String(receiver?.address || '')}</p>
            <p>
              {String(receiver?.zipCode || '')}
              {receiver?.city ? `, ${String(receiver?.city)}` : ''}
            </p>
            <p>{String(receiver?.country || '')}</p>
            <p>{String(receiver?.email || '')}</p>
            <p>{String(receiver?.phone || '')}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase">{t('invoiceDate')}</h4>
              <p className="text-gray-800">{formatDate(details?.invoiceDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase">{t('dueDate')}</h4>
              <p className="text-gray-800">{formatDate(details?.dueDate)}</p>
            </div>
            {details?.purchaseOrderNumber && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase">{t('poNumber')}</h4>
                <p className="text-gray-800">{String(details.purchaseOrderNumber)}</p>
              </div>
            )}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-3 px-4 font-medium text-gray-500 text-sm uppercase">{t('item')}</th>
              <th className="py-3 px-4 font-medium text-gray-500 text-sm uppercase text-right">{t('qty')}</th>
              <th className="py-3 px-4 font-medium text-gray-500 text-sm uppercase text-right">{t('price')}</th>
              <th className="py-3 px-4 font-medium text-gray-500 text-sm uppercase text-right">{t('total')}</th>
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

              // Calculate total for this item
              const itemTotal = quantity * unitPrice;

              return (
                <tr key={item.id || index} className="border-t border-gray-100">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-800">{String(item.name || '')}</div>
                    {item.description && <div className="text-gray-500 text-sm mt-1">{String(item.description)}</div>}
                  </td>
                  <td className="py-4 px-4 text-right">{quantity}</td>
                  <td className="py-4 px-4 text-right">
                    {formatCurrency(unitPrice, String(details?.currency || 'USD'))}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-800">
                    {formatCurrency(itemTotal, String(details?.currency || 'USD'))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-80">
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">{t('total')}</h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t('subtotal')}:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(subTotal, String(details?.currency || 'USD'))}
                </span>
              </div>

              {details?.tax && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    {t('tax')} ({typeof details.tax === 'object' && 'amountType' in details.tax && details.tax.amountType === 'percentage' 
                      ? `${typeof details.tax === 'object' && 'amount' in details.tax ? details.tax.amount : ''}%` 
                      : ''}):
                  </span>
                  <span className="font-medium text-gray-800">
                    {typeof details.tax === 'object' && 'amountType' in details.tax && details.tax.amountType === 'percentage'
                      ? formatCurrency(
                          subTotal * (parseNumber(typeof details.tax === 'object' && 'amount' in details.tax ? details.tax.amount : 0) / 100),
                          String(details?.currency || 'USD')
                        )
                      : formatCurrency(
                          parseNumber(typeof details.tax === 'object' && 'amount' in details.tax ? details.tax.amount : 0),
                          String(details?.currency || 'USD')
                        )}
                  </span>
                </div>
              )}

              {details?.discount && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    {t('discount')} (
                    {typeof details.discount === 'object' && 'amountType' in details.discount && details.discount.amountType === 'percentage'
                      ? `${typeof details.discount === 'object' && 'amount' in details.discount ? details.discount.amount : ''}%`
                      : ''}
                    ):
                  </span>
                  <span className="font-medium text-gray-800">
                    {typeof details.discount === 'object' && 'amountType' in details.discount && details.discount.amountType === 'percentage'
                      ? formatCurrency(
                          subTotal * (parseNumber(typeof details.discount === 'object' && 'amount' in details.discount ? details.discount.amount : 0) / 100),
                          String(details?.currency || 'USD')
                        )
                      : formatCurrency(
                          parseNumber(typeof details.discount === 'object' && 'amount' in details.discount ? details.discount.amount : 0),
                          String(details?.currency || 'USD')
                        )}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t mt-2">
                <span className="font-medium text-gray-800">{t('total')}:</span>
                <span className="font-bold text-gray-800">
                  {formatCurrency(totalAmount, String(details?.currency || 'USD'))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {(details?.notes || details?.terms) && (
          <div>
            {details.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{t('notes')}</h3>
                <p className="text-gray-600 whitespace-pre-line">{String(details.notes)}</p>
              </div>
            )}

            {details.terms && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{t('terms')}</h3>
                <p className="text-gray-600 whitespace-pre-line">{String(details.terms)}</p>
              </div>
            )}
          </div>
        )}

        {details?.paymentInformation && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{t('paymentInfo')}</h3>
            <div className="text-gray-600">
              {typeof details.paymentInformation === 'object' && 'bankName' in details.paymentInformation && details.paymentInformation.bankName && (
                <p>
                  <span className="font-medium">{t('bank')}: </span>
                  {String(details.paymentInformation.bankName)}
                </p>
              )}
              {typeof details.paymentInformation === 'object' && 'accountName' in details.paymentInformation && details.paymentInformation.accountName && (
                <p>
                  <span className="font-medium">{t('accountName')}: </span>
                  {String(details.paymentInformation.accountName)}
                </p>
              )}
              {typeof details.paymentInformation === 'object' && 'accountNumber' in details.paymentInformation && details.paymentInformation.accountNumber && (
                <p>
                  <span className="font-medium">{t('accountNumber')}: </span>
                  {String(details.paymentInformation.accountNumber)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {signature && signature.name && (
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <div
              className="inline-block border-b border-gray-400 pb-1 px-8"
              style={
                signature.fontFamily
                  ? { fontFamily: signature.fontFamily }
                  : undefined
              }
            >
              <span
                className="text-2xl"
                style={{ fontFamily: signature.fontFamily || 'cursive' }}
              >
                {signature.name}
              </span>
            </div>
            <p className="mt-1 text-gray-600">{t('authorizedSignature')}</p>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>{t('thankYou')}</p>
      </div>
    </InvoiceLayout>
  );
} 