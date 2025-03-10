'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormInvoiceType } from '@/lib/types/invoice';
import { sendInvoiceEmail } from '@/services/invoice/client/emailInvoice';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface InvoiceEmailModalProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: any; // Using any to avoid complex form typing issues
  invoice?: FormInvoiceType;
  isLoading?: boolean;
}

/**
 * Modal for sending invoices by email
 */
export function InvoiceEmailModal({
  children,
  form,
  invoice,
  isLoading = false,
}: InvoiceEmailModalProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState('');
  const t = useTranslations('invoice.email');
  const locale = useLocale();
  const [subject, setSubject] = useState(t('defaultSubject'));
  const [message, setMessage] = useState(t('defaultMessage'));
  const { toast } = useToast();

  const handleSendEmail = async () => {
    try {
      setSending(true);

      // Get invoice data from form or direct invoice prop
      let invoiceData;
      if (form) {
        invoiceData = form.getValues() as unknown as FormInvoiceType;
      } else if (invoice) {
        invoiceData = invoice;
      } else {
        throw new Error('No invoice data available');
      }

      // Pre-fill recipient email if available from the invoice
      if (!recipient && invoiceData?.receiver?.email) {
        setRecipient(invoiceData.receiver.email);
      }

      await sendInvoiceEmail({
        invoice: invoiceData,
        recipient,
        subject,
        message,
        locale,
      });

      toast({
        title: t('toast.success.title'),
        description: t('toast.success.description', { recipient }),
      });

      setOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.description'),
        variant: 'destructive',
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
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">{t('recipient.label')}</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={t('recipient.placeholder')}
              type="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">{t('subject.label')}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('subject.placeholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">{t('message.label')}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('message.placeholder')}
              rows={5}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSendEmail} disabled={!recipient || sending || isLoading}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.sending')}
              </>
            ) : (
              t('buttons.send')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
