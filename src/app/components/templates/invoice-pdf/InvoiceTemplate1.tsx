import React from "react";

// Components
import InvoiceLayout from "./InvoiceLayout";

// Helpers
import { formatCurrency } from "@/lib/utils";

// Types
import { InvoiceType } from "@/types";

/**
 * Invoice Template 1 - Classic business style
 * A clean, professional template with a blue accent color
 */
const InvoiceTemplate1 = (data: InvoiceType) => {
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
                <div className="sm:text-right">
                    <h3 className="text-lg font-medium text-gray-800">
                        Invoice Details:
                    </h3>
                    <div className="mt-2 text-gray-600">
                        <p>
                            <span className="font-medium">Invoice Date: </span>
                            {details?.invoiceDate instanceof Date
                                ? details.invoiceDate.toLocaleDateString()
                                : details?.invoiceDate}
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
                                            <p className="font-medium text-gray-800">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-600 whitespace-pre-line">
                                                {item.description}
                                            </p>
                                        </td>
                                        <td className="text-center py-2 px-2 border-t border-gray-200">
                                            <p className="text-gray-800">{quantity}</p>
                                        </td>
                                        <td className="text-center py-2 px-2 border-t border-gray-200">
                                            <p className="text-gray-800">
                                                {formatCurrency(unitPrice, details?.currency || 'USD')}
                                            </p>
                                        </td>
                                        <td className="text-right py-2 px-2 border-t border-gray-200">
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

            <div className="mt-8 flex justify-end">
                <div className="w-full sm:w-1/2 lg:w-1/3">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-medium text-gray-800 py-1">Subtotal:</td>
                                <td className="text-gray-600 text-right py-1">
                                    {formatCurrency(subTotal, details?.currency || 'USD')}
                                </td>
                            </tr>

                            {details?.taxDetails?.amount != undefined &&
                                parseNumber(details?.taxDetails?.amount) > 0 && (
                                <tr>
                                    <td className="font-medium text-gray-800 py-1">Tax:</td>
                                    <td className="text-gray-600 text-right py-1">
                                        {details.taxDetails.amountType === "amount"
                                            ? formatCurrency(parseNumber(details.taxDetails.amount), details?.currency || 'USD')
                                            : `${parseNumber(details.taxDetails.amount)}%`}
                                    </td>
                                </tr>
                            )}

                            {details?.discountDetails?.amount != undefined &&
                                parseNumber(details?.discountDetails?.amount) > 0 && (
                                <tr>
                                    <td className="font-medium text-gray-800 py-1">Discount:</td>
                                    <td className="text-gray-600 text-right py-1">
                                        {details.discountDetails.amountType === "amount"
                                            ? formatCurrency(parseNumber(details.discountDetails.amount), details?.currency || 'USD')
                                            : `${parseNumber(details.discountDetails.amount)}%`}
                                    </td>
                                </tr>
                            )}

                            {details?.shippingDetails?.cost != undefined &&
                                parseNumber(details?.shippingDetails?.cost) > 0 && (
                                <tr>
                                    <td className="font-medium text-gray-800 py-1">Shipping:</td>
                                    <td className="text-gray-600 text-right py-1">
                                        {details.shippingDetails.costType === "amount"
                                            ? formatCurrency(parseNumber(details.shippingDetails.cost), details?.currency || 'USD')
                                            : `${parseNumber(details.shippingDetails.cost)}%`}
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
                        <p>
                            <span className="font-medium">Bank: </span>
                            {details.paymentInformation.bankName}
                        </p>
                        <p>
                            <span className="font-medium">Account Name: </span>
                            {details.paymentInformation.accountName}
                        </p>
                        <p>
                            <span className="font-medium">Account Number: </span>
                            {details.paymentInformation.accountNumber}
                        </p>
                    </div>
                </div>
            )}

            {details?.additionalNotes && (
                <div className="mt-8 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-800">Notes</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                        {details.additionalNotes}
                    </p>
                </div>
            )}

            {details?.paymentTerms && (
                <div className="mt-8 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-800">Terms</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                        {details.paymentTerms}
                    </p>
                </div>
            )}

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

export default InvoiceTemplate1; 