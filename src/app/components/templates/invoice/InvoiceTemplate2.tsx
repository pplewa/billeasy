import React from 'react';
import { formatCurrency, formatDate, parseNumber } from '@/lib/utils/formatting';
import InvoiceLayout from './InvoiceLayout';
import { InvoiceType } from '@/lib/types';

// Reuse the existing interface
export interface InvoiceTemplateProps {
  data: InvoiceType;
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
}

/**
 * Invoice Template 2 - Modern Minimalist Style
 * Clean, professional design with a focus on readability and elegance
 */
export function Template2({ data, t }: InvoiceTemplateProps) {
  // Use fallbacks for type safety (same as Template1)
  const details = data?.details || {};
  const items = details.items || [];
  const sender = data?.sender || {};
  const receiver = data?.receiver || {};
  const tax = (details as { tax: number })?.tax || 0;
  const discount = (details as { details: number })?.details || 0;

  return (
    <InvoiceLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            {details?.invoiceLogo && (
              <img
                src={details.invoiceLogo as string}
                width={160}
                height={120}
                alt={`${t('templatePreview', { id: 2 })} - ${String(sender?.name || 'Company')}`}
                className="object-contain mb-4"
              />
            )}
            <h1 className="text-xl font-bold text-gray-800">{String(sender?.name || '')}</h1>
            <address className="not-italic text-gray-600 mt-2">
              {String(sender?.address || '')}
              <br />
              {String(sender?.zipCode || '')}
              {sender?.city ? `, ${String(sender?.city || '')}` : ''}
              <br />
              {String(sender?.country || '')}
              {Array.isArray(sender?.customInputs) &&
                sender?.customInputs?.map((input, index) => (
                  <p key={`${index}-sender`}>
                    {String(input.key)} {String(input.value)}
                  </p>
                ))}
            </address>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-500">
              #{String(details?.invoiceNumber || '')}
            </h2>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>
                <span className="font-medium">{t('invoiceDate')}: </span>
                {formatDate(details?.invoiceDate)}
              </p>
              <p>
                <span className="font-medium">{t('dueDate')}: </span>
                {formatDate(details?.dueDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('billTo')}:</h3>
            <div className="text-gray-700">
              {receiver?.name && <p className="font-medium">{String(receiver?.name)}</p>}
              {receiver?.address && <p>{String(receiver?.address)}</p>}
              {receiver?.zipCode ||
                (receiver?.city && (
                  <p>
                    {String(receiver?.zipCode)}
                    {receiver?.city ? `, ${String(receiver?.city || '')}` : ''}
                  </p>
                ))}
              {receiver?.country && <p>{String(receiver?.country)}</p>}
              <p>{String(receiver?.email || '')}</p>
              <p>{String(receiver?.phone || '')}</p>
              {Array.isArray(receiver?.customInputs) &&
                receiver?.customInputs?.map((input, index) => (
                  <p key={`${index}-receiver`}>
                    {String(input.key)} {String(input.value)}
                  </p>
                ))}
            </div>
          </div>

          <div className="text-right">
            {details?.purchaseOrderNumber && (
              <p>
                <span className="font-medium">{t('poNumber')}: </span>
                {String(details.purchaseOrderNumber)}
              </p>
            )}
          </div>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-700">{t('item')}</th>
              <th className="py-3 px-4 text-right font-medium text-gray-700">{t('qty')}</th>
              <th className="py-3 px-4 text-right font-medium text-gray-700">{t('price')}</th>
              <th className="py-3 px-4 text-right font-medium text-gray-700">{t('discount')}</th>
              <th className="py-3 px-4 text-right font-medium text-gray-700">{t('tax')}</th>
              <th className="py-3 px-4 text-right font-medium text-gray-700">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-200">
                <td className="py-3 px-4">
                  <div className="font-medium">{String(item.name || '')}</div>
                  {item.description && (
                    <div className="text-sm text-gray-500">{String(item.description)}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">
                  {formatCurrency(item.unitPrice, String(details?.currency || 'USD'))}
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
                      : formatCurrency(
                          parseNumber(item.tax.amount),
                          String(details?.currency || 'USD')
                        )
                    : '-'}
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(item.total, String(details?.currency || 'USD'))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-700">{t('subtotal')}:</span>
              <span>
                {formatCurrency(details.subTotal || 0, String(details?.currency || 'USD'))}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-700">{t('tax')}:</span>
              <span>{formatCurrency(tax || 0, String(details?.currency || 'USD'))}</span>
            </div>
            {discount ? (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-700">{t('discount')}:</span>
                <span>{formatCurrency(discount || 0, String(details?.currency || 'USD'))}</span>
              </div>
            ) : null}
            <div className="flex justify-between py-3 font-bold text-lg">
              <span className="text-gray-800">{t('total')}:</span>
              <span className="text-gray-900">
                {formatCurrency(details.totalAmount || 0, String(details?.currency || 'USD'))}
              </span>
            </div>
          </div>
        </div>

        {details?.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('notes')}:</h3>
            <p className="text-gray-700 whitespace-pre-line">{String(details.notes)}</p>
          </div>
        )}

        {details?.terms && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('terms')}:</h3>
            <p className="text-gray-700 whitespace-pre-line">{String(details.terms)}</p>
          </div>
        )}

        {details?.paymentInformation &&
          Object.values(details?.paymentInformation)?.filter(Boolean)?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('paymentInfo')}:</h3>
              <div className="text-gray-700">
                {typeof details.paymentInformation === 'object' &&
                  'bankName' in details.paymentInformation &&
                  details.paymentInformation.bankName && (
                    <p>
                      <span className="font-medium">{t('bank')}: </span>
                      {String(details.paymentInformation.bankName)}
                    </p>
                  )}
                {typeof details.paymentInformation === 'object' &&
                  'accountName' in details.paymentInformation &&
                  details.paymentInformation.accountName && (
                    <p>
                      <span className="font-medium">{t('accountName')}: </span>
                      {String(details.paymentInformation.accountName)}
                    </p>
                  )}
                {typeof details.paymentInformation === 'object' &&
                  'accountNumber' in details.paymentInformation &&
                  details.paymentInformation.accountNumber && (
                    <p>
                      <span className="font-medium">{t('accountNumber')}: </span>
                      {String(details.paymentInformation.accountNumber)}
                    </p>
                  )}
              </div>
            </div>
          )}

        {details.signature?.data && (
          <div className="mt-12 flex justify-end">
            <div className="text-center">
              <div className="inline-block border-b border-gray-400 pb-1 px-8">
                {details.signature?.data.startsWith('data:image') ? (
                  <img
                    src={details.signature.data}
                    alt={t('authorizedSignature')}
                    className="h-16 object-contain mb-2"
                  />
                ) : (
                  <div
                    className="h-full w-full flex items-center justify-center"
                    style={{ fontFamily: details.signature?.fontFamily || undefined }}
                  >
                    <p className="text-gray-600">{details.signature.data}</p>
                  </div>
                )}
              </div>
              <p className="mt-1 text-gray-600">{t('authorizedSignature')}</p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>{t('thankYou')}</p>
        </div>
      </div>
    </InvoiceLayout>
  );
}
