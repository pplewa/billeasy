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
                                <br />
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
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-3 font-semibold text-gray-700">Item</th>
                                <th className="text-center p-3 font-semibold text-gray-700">Qty</th>
                                <th className="text-right p-3 font-semibold text-gray-700">Rate</th>
                                <th className="text-right p-3 font-semibold text-gray-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details?.items?.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-gray-200">
                                    <td className="p-3">
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.unitPrice || 0, details?.currency || 'USD')}
                                    </td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.total || 0, details?.currency || 'USD')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="font-medium">
                                {formatCurrency(details?.subTotal || 0, details?.currency || 'USD')}
                            </span>
                        </div>

                        {details?.taxDetails?.amount != undefined &&
                            details?.taxDetails?.amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Tax:</span>
                                    <span>
                                        {details.taxDetails.amountType === "amount"
                                            ? formatCurrency(details.taxDetails.amount, details?.currency || 'USD')
                                            : `${details.taxDetails.amount}%`}
                                    </span>
                                </div>
                            )}

                        {details?.discountDetails?.amount != undefined &&
                            details?.discountDetails?.amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Discount:</span>
                                    <span>
                                        {details.discountDetails.amountType === "amount"
                                            ? formatCurrency(details.discountDetails.amount, details?.currency || 'USD')
                                            : `${details.discountDetails.amount}%`}
                                    </span>
                                </div>
                            )}

                        {details?.shippingDetails?.cost != undefined &&
                            details?.shippingDetails?.cost > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Shipping:</span>
                                    <span>
                                        {details.shippingDetails.costType === "amount"
                                            ? formatCurrency(details.shippingDetails.cost, details?.currency || 'USD')
                                            : `${details.shippingDetails.cost}%`}
                                    </span>
                                </div>
                            )}

                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                            <span className="font-bold text-gray-900">Total:</span>
                            <span className="font-bold text-gray-900">
                                {formatCurrency(details?.totalAmount || 0, details?.currency || 'USD')}
                            </span>
                        </div>
                    </div>
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
                <div className="mt-8 flex justify-end">
                    <div className="text-center">
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