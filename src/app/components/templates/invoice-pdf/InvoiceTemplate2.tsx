import React from "react";

// Components
import InvoiceLayout from "./InvoiceLayout";

// Helpers
import { formatCurrency } from "@/lib/utils";

// Types
import { InvoiceType } from "@/types";

/**
 * Invoice Template 2 - Modern minimalist style
 * A clean, modern template with a dark accent color
 */
const InvoiceTemplate2 = (data: InvoiceType) => {
    const { sender, receiver, details } = data;

    // Parse numeric values to ensure they're numbers, not strings
    const parseNumber = (value: unknown): number => {
        if (value === undefined || value === null) return 0;
        return typeof value === 'string' ? parseFloat(value) || 0 : (typeof value === 'number' ? value : 0);
    };

    // Get the items from the correct location
    const invoiceItems = details?.items || [];

    // Calculate totals
    const subTotal = parseNumber(details?.subTotal);
    const totalAmount = parseNumber(details?.totalAmount);

    return (
        <InvoiceLayout data={data}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-gray-200 pb-8">
                <div>
                    {details?.invoiceLogo && (
                        <img
                            src={details.invoiceLogo}
                            width={140}
                            height={100}
                            alt={`Logo of ${sender?.name || 'Company'}`}
                            className="object-contain mb-4"
                        />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">
                        {sender?.name}
                    </h1>
                    <address className="mt-2 not-italic text-gray-600">
                        {sender?.address}
                        <br />
                        {sender?.zipCode}, {sender?.city}
                        <br />
                        {sender?.country}
                        <br />
                        {sender?.email && (
                            <>
                                Email: {sender.email}
                                <br />
                            </>
                        )}
                        {sender?.phone && (
                            <>
                                Phone: {sender.phone}
                            </>
                        )}
                    </address>
                </div>
                <div className="bg-gray-900 text-white p-6 rounded-lg">
                    <h2 className="text-3xl font-bold">Invoice</h2>
                    <div className="mt-4 space-y-1">
                        <p>
                            <span className="text-gray-300">Invoice #: </span>
                            {details?.invoiceNumber}
                        </p>
                        <p>
                            <span className="text-gray-300">Date: </span>
                            {details?.invoiceDate instanceof Date
                                ? details.invoiceDate.toLocaleDateString()
                                : details?.invoiceDate}
                        </p>
                        <p>
                            <span className="text-gray-300">Due Date: </span>
                            {details?.dueDate instanceof Date
                                ? details.dueDate.toLocaleDateString()
                                : details?.dueDate}
                        </p>
                        {details?.purchaseOrderNumber && (
                            <p>
                                <span className="text-gray-300">PO #: </span>
                                {details.purchaseOrderNumber}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{receiver?.name}</p>
                    <address className="mt-2 not-italic text-gray-600">
                        {receiver?.address}
                        <br />
                        {receiver?.zipCode}, {receiver?.city}
                        <br />
                        {receiver?.country}
                        <br />
                        {receiver?.email && (
                            <>
                                Email: {receiver.email}
                                <br />
                            </>
                        )}
                        {receiver?.phone && (
                            <>
                                Phone: {receiver.phone}
                                <br />
                            </>
                        )}
                    </address>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="mt-8">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/2">Item</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Rate</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems?.map((item, index) => {
                                    // Parse item values
                                    const quantity = parseNumber(item.quantity);
                                    const unitPrice = parseNumber(item.unitPrice);
                                    const total = parseNumber(item.total);
                                    
                                    return (
                                        <tr key={item.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="py-3 px-4 border-t border-gray-200">
                                                <p className="font-medium text-gray-800">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                                    {item.description}
                                                </p>
                                            </td>
                                            <td className="text-center py-3 px-4 border-t border-gray-200">
                                                <p className="text-gray-800">{quantity}</p>
                                            </td>
                                            <td className="text-center py-3 px-4 border-t border-gray-200">
                                                <p className="text-gray-800">
                                                    {formatCurrency(unitPrice, details?.currency || 'USD')}
                                                </p>
                                            </td>
                                            <td className="text-right py-3 px-4 border-t border-gray-200">
                                                <p className="text-gray-800">
                                                    {formatCurrency(total || (quantity * unitPrice), details?.currency || 'USD')}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <div className="w-full sm:w-1/2 lg:w-1/3">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-2 font-medium text-gray-700">Subtotal:</td>
                                <td className="py-2 text-right text-gray-700">
                                    {formatCurrency(subTotal, details?.currency || 'USD')}
                                </td>
                            </tr>

                            {details?.taxDetails?.amount != undefined &&
                                parseNumber(details?.taxDetails?.amount) > 0 && (
                                <tr>
                                    <td className="py-2 font-medium text-gray-700">Tax:</td>
                                    <td className="py-2 text-right text-gray-700">
                                        {details.taxDetails.amountType === "amount"
                                            ? formatCurrency(parseNumber(details.taxDetails.amount), details?.currency || 'USD')
                                            : `${parseNumber(details.taxDetails.amount)}%`}
                                    </td>
                                </tr>
                            )}

                            {details?.discountDetails?.amount != undefined &&
                                parseNumber(details?.discountDetails?.amount) > 0 && (
                                <tr>
                                    <td className="py-2 font-medium text-gray-700">Discount:</td>
                                    <td className="py-2 text-right text-gray-700">
                                        {details.discountDetails.amountType === "amount"
                                            ? formatCurrency(parseNumber(details.discountDetails.amount), details?.currency || 'USD')
                                            : `${parseNumber(details.discountDetails.amount)}%`}
                                    </td>
                                </tr>
                            )}

                            {details?.shippingDetails?.cost != undefined &&
                                parseNumber(details?.shippingDetails?.cost) > 0 && (
                                <tr>
                                    <td className="py-2 font-medium text-gray-700">Shipping:</td>
                                    <td className="py-2 text-right text-gray-700">
                                        {details.shippingDetails.costType === "amount"
                                            ? formatCurrency(parseNumber(details.shippingDetails.cost), details?.currency || 'USD')
                                            : `${parseNumber(details.shippingDetails.cost)}%`}
                                    </td>
                                </tr>
                            )}

                            <tr className="border-t border-gray-200">
                                <td className="py-3 font-bold text-gray-900">Total:</td>
                                <td className="py-3 text-right font-bold text-gray-900">
                                    {formatCurrency(totalAmount, details?.currency || 'USD')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {details?.paymentInformation && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="mb-1">
                            <span className="font-medium text-gray-700">Bank: </span>
                            {details.paymentInformation.bankName}
                        </p>
                        <p className="mb-1">
                            <span className="font-medium text-gray-700">Account Name: </span>
                            {details.paymentInformation.accountName}
                        </p>
                        <p>
                            <span className="font-medium text-gray-700">Account Number: </span>
                            {details.paymentInformation.accountNumber}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {details?.additionalNotes && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line">
                                {details.additionalNotes}
                            </p>
                        </div>
                    </div>
                )}

                {details?.paymentTerms && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line">
                                {details.paymentTerms}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {details?.signature?.data && (
                <div className="mt-8 border-t border-gray-200 pt-4">
                    <div className="flex flex-col items-end">
                        <div 
                            className="max-w-xs" 
                            style={{ 
                                fontFamily: details.signature.fontFamily 
                                    ? `${details.signature.fontFamily}, cursive` 
                                    : 'cursive' 
                            }}
                        >
                            {details.signature.data.startsWith('data:image') ? (
                                <img 
                                    src={details.signature.data} 
                                    alt="Signature" 
                                    className="h-16 object-contain" 
                                />
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

export default InvoiceTemplate2; 