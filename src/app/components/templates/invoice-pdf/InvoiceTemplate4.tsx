import React from "react";

// Components
import InvoiceLayout from "./InvoiceLayout";

// Helpers
import { formatCurrency } from "@/lib/utils";

// Types
import { InvoiceType } from "@/types";

/**
 * Invoice Template 4 - Premium Corporate
 * An elegant template with a purple accent color and sophisticated layout
 */
const InvoiceTemplate4 = (data: InvoiceType) => {
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
            <div className="relative">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-1/4 h-32 bg-purple-200 rounded-bl-full opacity-50"></div>
                
                {/* Header with logo and invoice title */}
                <div className="flex justify-between items-start mb-12 relative">
                    <div>
                        {details?.invoiceLogo && (
                            <img
                                src={details.invoiceLogo}
                                width={150}
                                height={100}
                                alt={`Logo of ${sender?.name || 'Company'}`}
                                className="object-contain mb-2"
                            />
                        )}
                        <h1 className="text-xl font-semibold text-gray-800">{sender?.name}</h1>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-purple-700">INVOICE</h2>
                        <div className="mt-1 inline-block px-4 py-1 bg-purple-100 rounded-full text-purple-800 font-medium">
                            # {details?.invoiceNumber}
                        </div>
                    </div>
                </div>
                
                {/* Main grid for addresses and details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* From section */}
                    <div>
                        <h3 className="text-sm font-medium uppercase text-purple-600 mb-3 border-b border-purple-200 pb-1">From</h3>
                        <div className="text-gray-700">
                            <p className="font-medium">{sender?.name}</p>
                            <p>{sender?.address}</p>
                            <p>{sender?.zipCode}, {sender?.city}</p>
                            <p>{sender?.country}</p>
                        </div>
                        <div className="mt-3 text-gray-600">
                            <p>Email: {sender?.email}</p>
                            <p>Phone: {sender?.phone}</p>
                        </div>
                    </div>
                    
                    {/* To section */}
                    <div>
                        <h3 className="text-sm font-medium uppercase text-purple-600 mb-3 border-b border-purple-200 pb-1">To</h3>
                        <div className="text-gray-700">
                            <p className="font-medium">{receiver?.name}</p>
                            <p>{receiver?.address}</p>
                            <p>{receiver?.zipCode}, {receiver?.city}</p>
                            <p>{receiver?.country}</p>
                        </div>
                        <div className="mt-3 text-gray-600">
                            <p>Email: {receiver?.email}</p>
                            <p>Phone: {receiver?.phone}</p>
                        </div>
                    </div>
                    
                    {/* Details section */}
                    <div>
                        <h3 className="text-sm font-medium uppercase text-purple-600 mb-3 border-b border-purple-200 pb-1">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-1">
                            <p className="text-gray-600">Invoice Date:</p>
                            <p className="text-gray-800 font-medium">
                                {details?.invoiceDate instanceof Date
                                    ? details.invoiceDate.toLocaleDateString()
                                    : details?.invoiceDate}
                            </p>
                            
                            <p className="text-gray-600">Due Date:</p>
                            <p className="text-gray-800 font-medium">
                                {details?.dueDate instanceof Date
                                    ? details.dueDate.toLocaleDateString()
                                    : details?.dueDate}
                            </p>
                            
                            <p className="text-gray-600">Currency:</p>
                            <p className="text-gray-800 font-medium">{details?.currency || 'USD'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Items table */}
            <div className="mb-10">
                <h3 className="text-sm font-medium uppercase text-purple-600 mb-4 border-b border-purple-200 pb-2">Items</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-purple-50">
                                <th className="py-3 px-4 text-left text-gray-700">Item Description</th>
                                <th className="py-3 px-4 text-right text-gray-700">Quantity</th>
                                <th className="py-3 px-4 text-right text-gray-700">Price</th>
                                <th className="py-3 px-4 text-right text-gray-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.map((item, index) => {
                                // Parse item values
                                const quantity = parseNumber(item.quantity);
                                const unitPrice = parseNumber(item.unitPrice || item.price);
                                const itemTotal = quantity * unitPrice;
                                
                                return (
                                    <tr key={item.id || index} className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-800">
                                            <div className="font-medium">{item.name}</div>
                                            {item.description && (
                                                <div className="text-sm text-gray-500">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700">{quantity}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">
                                            {formatCurrency(unitPrice, details?.currency || 'USD')}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                                            {formatCurrency(itemTotal, details?.currency || 'USD')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Totals section with purple gradient background */}
            <div className="mb-10 flex justify-end">
                <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-sm">
                    <div className="border-b border-purple-100 pb-2 mb-2">
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-800">
                                {formatCurrency(subTotal, details?.currency || 'USD')}
                            </span>
                        </div>
                        
                        {details?.tax?.amount != undefined &&
                            parseNumber(details?.tax?.amount) > 0 && (
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Tax:</span>
                                <span className="text-gray-800">
                                    {details.tax.amountType === "amount"
                                        ? formatCurrency(parseNumber(details.tax.amount), details?.currency || 'USD')
                                        : `${parseNumber(details.tax.amount)}%`}
                                </span>
                            </div>
                        )}
                        
                        {details?.discount?.amount != undefined &&
                            parseNumber(details?.discount?.amount) > 0 && (
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Discount:</span>
                                <span className="text-gray-800">
                                    {details.discount.amountType === "amount"
                                        ? formatCurrency(parseNumber(details.discount.amount), details?.currency || 'USD')
                                        : `${parseNumber(details.discount.amount)}%`}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between mt-2">
                        <span className="text-lg font-bold text-gray-800">Total:</span>
                        <span className="text-lg font-bold text-purple-700">
                            {formatCurrency(totalAmount, details?.currency || 'USD')}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Notes and terms in two-column layout */}
            {(details?.additionalNotes || details?.paymentTerms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {details?.additionalNotes && (
                        <div>
                            <h3 className="text-sm font-medium uppercase text-purple-600 mb-2 border-b border-purple-200 pb-1">Notes</h3>
                            <p className="text-gray-700 whitespace-pre-line">{details.additionalNotes}</p>
                        </div>
                    )}
                    
                    {details?.paymentTerms && (
                        <div>
                            <h3 className="text-sm font-medium uppercase text-purple-600 mb-2 border-b border-purple-200 pb-1">Terms & Conditions</h3>
                            <p className="text-gray-700 whitespace-pre-line">{details.paymentTerms}</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Signature section */}
            {details?.signature?.data && (
                <div className="mt-8 text-right border-t border-gray-200 pt-4">
                    <div className="inline-block">
                        <div className="max-w-xs">
                            {details.signature.data.startsWith('data:image') ? (
                                <img
                                    src={details.signature.data}
                                    alt="Signature"
                                    className="h-16 object-contain mr-0 ml-auto"
                                />
                            ) : (
                                <p
                                    className="text-xl text-gray-800 text-right"
                                    style={{ fontFamily: details.signature.fontFamily || undefined }}
                                >
                                    {details.signature.data}
                                </p>
                            )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">Authorized Signature</div>
                    </div>
                </div>
            )}
        </InvoiceLayout>
    );
};

export default InvoiceTemplate4; 