"use client";

import React, { useState } from "react";

// UI Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Helpers
import { isValidEmail } from "@/lib/helpers";

// Variables
import { SEND_INVOICE_API } from "@/lib/variables";

interface InvoiceEmailModalProps {
    children: React.ReactNode;
    invoice: {
        details?: {
            invoiceNumber?: string;
        };
    };
    isLoading?: boolean;
}

/**
 * Modal for sending invoices by email
 */
export function InvoiceEmailModal({ 
    children, 
    invoice, 
    isLoading = false 
}: InvoiceEmailModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { toast } = useToast();
    const errorMessage = "Please enter a valid email address";

    /**
     * Send the invoice as a PDF attachment to the specified email
     */
    const handleSendEmail = async () => {
        if (!isValidEmail(email)) {
            setError(errorMessage);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Generate PDF from invoice data
            const pdfResponse = await fetch(`/api/invoice/export?format=pdf`, {
                method: "POST",
                body: JSON.stringify(invoice),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (!pdfResponse.ok) {
                throw new Error(`Error generating PDF: ${pdfResponse.status}`);
            }
            
            // Get the PDF blob
            const pdfBlob = await pdfResponse.blob();
            
            // Create a File object from the blob
            const pdfFile = new File([pdfBlob], `invoice-${invoice.details?.invoiceNumber || 'download'}.pdf`, {
                type: "application/pdf",
            });
            
            // Create form data for the email request
            const formData = new FormData();
            formData.append("email", email);
            formData.append("invoicePdf", pdfFile);
            formData.append("invoiceNumber", invoice.details?.invoiceNumber || "Unknown");
            
            // Send the email
            const emailResponse = await fetch(SEND_INVOICE_API, {
                method: "POST",
                body: formData,
            });
            
            if (!emailResponse.ok) {
                throw new Error(`Error sending email: ${emailResponse.status}`);
            }
            
            // Show success message
            toast({
                title: "Success",
                description: `Invoice sent to ${email}`,
            });
            
            // Close the modal and reset state
            setEmail("");
            setOpen(false);
        } catch (error) {
            console.error("Error sending email:", error);
            toast({
                title: "Error",
                description: "Failed to send email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send to email</DialogTitle>
                    <DialogDescription>
                        Please specify the email address for invoice delivery.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive col-start-2 col-span-3">
                            {error}
                        </p>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSendEmail} 
                        disabled={loading || isLoading}
                    >
                        {loading ? "Sending..." : "Send Invoice"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 