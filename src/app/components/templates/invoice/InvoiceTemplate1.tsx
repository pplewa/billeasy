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
 * Invoice Template 1 - Classic business style
 * This template is implementation only with no client/server directives
 * It's used by both client and server rendering
 */
export function Template1({ data, t }: InvoiceTemplateProps) {
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
      <div className="flex justify-between">
        <div>
          {details?.invoiceLogo && (
            <img
              src={details.invoiceLogo as string}
              width={140}
              height={100}
              alt={`${t('templatePreview', { id: 1 })} - ${String(sender?.name || 'Company')}`}
              className="object-contain"
            />
          )}
          <h1 className="mt-2 text-lg md:text-xl font-semibold text-blue-600">{String(sender?.name || '')}</h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">{t('invoiceNumber')}</h2>
          <span className="mt-1 block text-gray-500">{String(details?.invoiceNumber || '')}</span>
          <address className="mt-4 not-italic text-gray-800">
            {String(sender?.address || '')}
            <br />
            {String(sender?.zipCode || '')}, {String(sender?.city || '')}
            <br />
            {String(sender?.country || '')}
            <br />
          </address>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{t('billTo')}:</h3>
          <div className="mt-2 text-gray-600">
            {receiver?.name && <p className="font-medium">{String(receiver?.name)}</p>}
            {receiver?.address && <p>{String(receiver?.address)}</p>}
            {receiver?.zipCode && (
              <p>
                {String(receiver?.zipCode)}, {String(receiver?.city || '')}
              </p>
            )}
            {receiver?.country && <p>{String(receiver?.country)}</p>}
            <p>{String(receiver?.email || '')}</p>
            <p>{String(receiver?.phone || '')}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <h3 className="text-lg font-medium text-gray-800">{t('invoiceDetails')}:</h3>
          <div className="mt-2 text-gray-600">
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

      <div className="mt-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">{t('item')}</th>
              <th className="py-2 px-4 text-right">{t('qty')}</th>
              <th className="py-2 px-4 text-right">{t('price')}</th>
              <th className="py-2 px-4 text-right">{t('discount')}</th>
              <th className="py-2 px-4 text-right">{t('tax')}</th>
              <th className="py-2 px-4 text-right">{t('total')}</th>
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
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium">{String(item.name || '')}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{String(item.description)}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">{quantity}</td>
                  <td className="py-3 px-4 text-right">
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
                  <td className="py-3 px-4 text-right">
                    {item.tax
                      ? item.tax.amountType === 'percentage'
                        ? `${parseNumber(item.tax.amount)}%`
                        : formatCurrency(parseNumber(item.tax.amount), String(details?.currency || 'USD'))
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(itemTotal, String(details?.currency || 'USD'))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full md:w-1/3">
          <div className="flex justify-between py-2">
            <span className="font-medium">{t('subtotal')}:</span>
            <span>{formatCurrency(subTotal, String(details?.currency || 'USD'))}</span>
          </div>
          {details?.tax && (
            <div className="flex justify-between py-2">
              <span className="font-medium">
                {t('tax')} ({typeof details.tax === 'object' && 'amountType' in details.tax && details.tax.amountType === 'percentage' 
                  ? `${typeof details.tax === 'object' && 'amount' in details.tax ? details.tax.amount : ''}%` 
                  : ''}):
              </span>
              <span>
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
              <span className="font-medium">
                {t('discount')} (
                {typeof details.discount === 'object' && 'amountType' in details.discount && details.discount.amountType === 'percentage'
                  ? `${typeof details.discount === 'object' && 'amount' in details.discount ? details.discount.amount : ''}%`
                  : ''}
                ):
              </span>
              <span>
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
          <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
            <span>{t('total')}:</span>
            <span>{formatCurrency(totalAmount, String(details?.currency || 'USD'))}</span>
          </div>
        </div>
      </div>

      {details?.notes && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800">{t('notes')}:</h3>
          <p className="mt-2 text-gray-600 whitespace-pre-line">{String(details.notes)}</p>
        </div>
      )}

      {details?.terms && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800">{t('terms')}:</h3>
          <p className="mt-2 text-gray-600 whitespace-pre-line">{String(details.terms)}</p>
        </div>
      )}

      {details?.paymentInformation && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800">{t('paymentInfo')}:</h3>
          <div className="mt-2 text-gray-600">
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