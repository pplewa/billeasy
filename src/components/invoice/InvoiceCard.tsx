import { InvoiceDocument } from '@/lib/db/models/Invoice';
import { deleteInvoice, duplicateInvoice } from '@/services/invoice/client/invoiceClient';
import { formatDate } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash, Copy, Eye, MoreHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { InvoiceStatus } from '@/types';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  // Calculate the total amount
  const totalAmount = Array.isArray(invoice.details?.items)
    ? invoice.details?.items
        ?.reduce((sum, item) => sum + (item?.unitPrice ?? 0) * (item?.quantity ?? 0), 0)
        .toFixed(2)
    : 0;

  // Get currency
  const currency = invoice.details?.currency || 'USD';

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

  // Get status badge colors
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  return (
    <Card className="w-full flex items-stretch overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 rounded-l-none" style={{ borderLeftColor: getBorderColor(status) }}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row  h-full">
          {/* Left side - Invoice Info */}
          <div className="flex-grow p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {t('table.number')} #{invoice.details?.invoiceNumber}
                </h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {formattedDate}
                </div>
              </div>
              <Badge variant="outline" className={cn("font-medium rounded-full px-3", getStatusColor())}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t('table.client')}
                </p>
                <p className="text-sm font-medium truncate">
                  {invoice.receiver?.name || t('table.noClient')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t('table.amount')}
                </p>
                <p className="text-sm font-semibold">
                  {currency} {totalAmount}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex sm:flex-col justify-between items-center bg-muted/30 p-3 sm:border-l">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/${locale}/invoice/view/${invoiceId}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">{tCommon('view')}</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/${locale}/invoice/edit/${invoiceId}`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{tCommon('edit')}</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.DRAFT)}>
                  Mark as Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.PENDING)}>
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(InvoiceStatus.PAID)}>
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('sent')}>
                  Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                  <Copy className="mr-2 h-4 w-4" />
                  {isDuplicating ? t('actions.duplicating') : t('actions.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  {isDeleting ? tCommon('deleting') : tCommon('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="icon" className="h-8 w-8 border-dashed" asChild>
              <Link href={`/${locale}/invoice/view/${invoiceId}`}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Open Invoice</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get border color based on status
function getBorderColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return '#10b981'; // Emerald/green for paid
    case 'pending':
      return '#f59e0b'; // Amber for pending
    case 'sent':
      return '#3b82f6'; // Blue for sent
    case 'overdue':
      return '#ef4444'; // Red for overdue
    case 'cancelled':
      return '#6b7280'; // Gray for cancelled
    default:
      return '#94a3b8'; // Slate for draft
  }
}
