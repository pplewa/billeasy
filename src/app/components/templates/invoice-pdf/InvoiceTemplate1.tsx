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
                    <div className="hidden sm:grid sm:grid-cols-5 text-xs font-medium text-gray-500 uppercase">
                        <div className="sm:col-span-2">Item</div>
                        <div className="text-center">Qty</div>
                        <div className="text-center">Rate</div>
                        <div className="text-right">Amount</div>
                    </div>
                    <div className="hidden sm:block border-b border-gray-200 my-2"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {details?.items?.map((item, index) => (
                            <React.Fragment key={item.id || index}>
                                <div className="col-span-full sm:col-span-2 border-b border-gray-200 pb-2">
                                    <p className="font-medium text-gray-800">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-600 whitespace-pre-line">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="text-center border-b border-gray-200 pb-2">
                                    <p className="text-gray-800">{item.quantity}</p>
                                </div>
                                <div className="text-center border-b border-gray-200 pb-2">
                                    <p className="text-gray-800">
                                        {formatCurrency(item.unitPrice, details?.currency || 'USD')}
                                    </p>
                                </div>
                                <div className="text-right border-b border-gray-200 pb-2">
                                    <p className="text-gray-800">
                                        {formatCurrency(item.total, details?.currency || 'USD')}
                                    </p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <div className="w-full sm:w-1/2 lg:w-1/3">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-800">Subtotal:</span>
                            <span className="text-gray-600">
                                {formatCurrency(details?.subTotal || 0, details?.currency || 'USD')}
                            </span>
                        </div>

                        {details?.taxDetails?.amount != undefined &&
                            details?.taxDetails?.amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">Tax:</span>
                                    <span className="text-gray-600">
                                        {details.taxDetails.amountType === "amount"
                                            ? formatCurrency(details.taxDetails.amount, details?.currency || 'USD')
                                            : `${details.taxDetails.amount}%`}
                                    </span>
                                </div>
                            )}

                        {details?.discountDetails?.amount != undefined &&
                            details?.discountDetails?.amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">Discount:</span>
                                    <span className="text-gray-600">
                                        {details.discountDetails.amountType === "amount"
                                            ? formatCurrency(details.discountDetails.amount, details?.currency || 'USD')
                                            : `${details.discountDetails.amount}%`}
                                    </span>
                                </div>
                            )}

                        {details?.shippingDetails?.cost != undefined &&
                            details?.shippingDetails?.cost > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">Shipping:</span>
                                    <span className="text-gray-600">
                                        {details.shippingDetails.costType === "amount"
                                            ? formatCurrency(details.shippingDetails.cost, details?.currency || 'USD')
                                            : `${details.shippingDetails.cost}%`}
                                    </span>
                                </div>
                            )}

                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                            <span className="font-semibold text-gray-800">Total:</span>
                            <span className="font-semibold text-gray-800">
                                {formatCurrency(details?.totalAmount || 0, details?.currency || 'USD')}
                            </span>
                        </div>
                    </div>
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