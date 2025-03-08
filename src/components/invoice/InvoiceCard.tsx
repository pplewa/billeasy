import { InvoiceDocument } from '@/lib/db/models/Invoice';
import { deleteInvoice, duplicateInvoice } from '@/services/invoice/client/invoiceClient';
import { formatDate } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash, Copy, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { InvoiceStatusSelector } from './InvoiceStatusSelector';
import { InvoiceStatus } from '@/types';
import { useTranslations } from 'next-intl';

interface InvoiceCardProps {
  invoice: InvoiceDocument;
  locale: string;
  onDelete: (id: string) => void;
  onDuplicate: (invoice: InvoiceDocument) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function InvoiceCard({
  invoice,
  locale,
  onDelete,
  onDuplicate,
  onStatusChange,
}: InvoiceCardProps) {
  const { toast } = useToast();
  const t = useTranslations('invoice');
  const tCommon = useTranslations('common');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Format the invoice date
  const formattedDate = formatDate(new Date(invoice.details?.invoiceDate || new Date()));

  // Get the invoice ID as string
  const invoiceId = invoice._id.toString();

  // Get the invoice status or default to draft
  const status = invoice.details?.status || InvoiceStatus.DRAFT;

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(invoiceId, newStatus);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteInvoice(invoiceId);
      onDelete(invoiceId);
      toast({
        title: t('deleteDialog.successTitle'),
        description: t('deleteDialog.successDescription'),
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: t('deleteDialog.errorTitle'),
        description: t('deleteDialog.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      const duplicatedInvoice = await duplicateInvoice(invoiceId);
      onDuplicate(duplicatedInvoice);
      toast({
        title: tCommon('success'),
        description: t('actions.duplicating'),
      });
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast({
        title: tCommon('error'),
        description: t('actions.duplicate'),
        variant: 'destructive',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          {t('table.number')} #{invoice.details?.invoiceNumber}
        </CardTitle>
        <InvoiceStatusSelector
          invoiceId={invoiceId}
          currentStatus={status}
          onStatusChange={handleStatusChange}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{t('table.client')}:</span>
            <span className="text-sm">{invoice.receiver?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">{t('table.date')}:</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">{t('table.amount')}:</span>
            <span className="text-sm">
              {invoice.details?.currency}{' '}
              {Array.isArray(invoice.details?.items)
                ? invoice.details?.items
                    ?.reduce((sum, item) => sum + (item?.unitPrice ?? 0) * (item?.quantity ?? 0), 0)
                    .toFixed(2)
                : 0}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/invoice/view/${invoiceId}`}>
              <Eye className="mr-1 h-4 w-4" />
              {tCommon('view')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/invoice/edit/${invoiceId}`}>
              <Pencil className="mr-1 h-4 w-4" />
              {tCommon('edit')}
            </Link>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? (
              <>{t('actions.duplicating')}</>
            ) : (
              <>
                <Copy className="mr-1 h-4 w-4" />
                {t('actions.duplicate')}
              </>
            )}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>{tCommon('deleting')}</>
            ) : (
              <>
                <Trash className="mr-1 h-4 w-4" />
                {tCommon('delete')}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
