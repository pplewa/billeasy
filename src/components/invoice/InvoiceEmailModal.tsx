"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceType } from "@/types";
import { sendInvoiceEmail } from "@/services/invoice/client/emailInvoice";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface InvoiceEmailModalProps {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form?: any; // Using any to avoid complex form typing issues
    invoice?: InvoiceType;
    isLoading?: boolean;
}

/**
 * Modal for sending invoices by email
 */
export function InvoiceEmailModal({ 
    children, 
    form, 
    invoice, 
    isLoading = false 
}: InvoiceEmailModalProps) {
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("Invoice from Your Company");
    const [message, setMessage] = useState("Please find attached the invoice for your recent purchase.");
    const { toast } = useToast();

    const handleSendEmail = async () => {
        try {
            setSending(true);
            
            // Get invoice data from form or direct invoice prop
            let invoiceData;
            if (form) {
                invoiceData = form.getValues() as unknown as InvoiceType;
            } else if (invoice) {
                invoiceData = invoice;
            } else {
                throw new Error("No invoice data available");
            }
            
            // Pre-fill recipient email if available from the invoice
            if (!recipient && invoiceData?.receiver?.email) {
                setRecipient(invoiceData.receiver.email);
            }
            
            await sendInvoiceEmail({
                invoice: invoiceData,
                recipient,
                subject,
                message
            });
            
            toast({
                title: "Success",
                description: `Email sent to ${recipient}`,
            });
            
            setOpen(false);
        } catch (error) {
            console.error("Error sending email:", error);
            toast({
                title: "Error",
                description: "Failed to send email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Send Invoice Email</DialogTitle>
                    <DialogDescription>
                        Send this invoice via email to your client.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="recipient">Recipient Email</Label>
                        <Input
                            id="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="client@example.com"
                            type="email"
                            required
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Invoice from Your Company"
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message here"
                            rows={5}
                        />
                    </div>
                </div>
                
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSendEmail} 
                        disabled={!recipient || sending || isLoading}
                    >
                        {sending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Email"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 